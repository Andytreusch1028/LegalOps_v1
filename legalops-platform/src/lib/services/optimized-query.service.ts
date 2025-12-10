/**
 * Optimized Query Service
 * 
 * Demonstrates best practices for database query optimization including:
 * - Using select to fetch only needed fields
 * - Using include to avoid N+1 queries
 * - Implementing cursor-based pagination
 * - Query performance monitoring
 */

import { PrismaClient, Order, OrderItem, User } from '@/generated/prisma';
import { ILogger } from '../interfaces/logger.interface';
import { QueryPerformanceLogger, createQueryPerformanceLogger } from '../utils/query-performance';
import { buildCursorQuery, calculateCursorPagination, CursorPaginationResult } from '../utils/pagination';

/**
 * Optimized order summary for list views.
 * Only includes essential fields to minimize data transfer.
 */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  total: number;
  createdAt: Date;
  itemCount: number;
  customerName?: string;
  customerEmail?: string;
}

/**
 * Detailed order view with all related data.
 * Uses include to fetch related data in a single query.
 */
export interface OrderDetails extends Order {
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'> | null;
  orderItems: OrderItem[];
  package?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
  } | null;
}

/**
 * Order analytics data for dashboard views.
 */
export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByMonth: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
}

/**
 * Service demonstrating optimized database query patterns.
 */
export class OptimizedQueryService {
  private readonly performanceLogger: QueryPerformanceLogger;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: ILogger
  ) {
    this.performanceLogger = createQueryPerformanceLogger(logger, {
      warnThreshold: 500, // Warn at 500ms for this service
      errorThreshold: 2000, // Error at 2s
      logThreshold: 50 // Log all queries over 50ms
    });
  }

  /**
   * Get order summaries with optimized select.
   * Only fetches fields needed for list views to minimize data transfer.
   * 
   * @param userId - Optional user ID to filter by
   * @param limit - Maximum number of orders to return
   * @returns Array of order summaries
   */
  async getOrderSummaries(userId?: string, limit: number = 50): Promise<OrderSummary[]> {
    return await this.performanceLogger.measureQuery(
      'getOrderSummaries',
      async () => {
        const orders = await this.prisma.order.findMany({
          where: userId ? { userId } : undefined,
          select: {
            // Only select fields needed for summary view
            id: true,
            orderNumber: true,
            orderStatus: true,
            paymentStatus: true,
            total: true,
            createdAt: true,
            isGuestOrder: true,
            guestFirstName: true,
            guestLastName: true,
            guestEmail: true,
            // Include user data only if not a guest order
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            // Count order items efficiently
            orderItems: {
              select: {
                id: true // Only need count, not full data
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit
        });

        // Transform to summary format
        return orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          total: Number(order.total),
          createdAt: order.createdAt,
          itemCount: order.orderItems.length,
          customerName: order.isGuestOrder 
            ? `${order.guestFirstName || ''} ${order.guestLastName || ''}`.trim()
            : order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : undefined,
          customerEmail: order.isGuestOrder ? order.guestEmail || undefined : order.user?.email
        }));
      },
      { userId, limit }
    );
  }

  /**
   * Get detailed order information with all related data.
   * Uses include to fetch related data in a single query, avoiding N+1 problems.
   * 
   * @param orderId - The order ID
   * @returns Detailed order information or null if not found
   */
  async getOrderDetails(orderId: string): Promise<OrderDetails | null> {
    return await this.performanceLogger.measureQuery(
      'getOrderDetails',
      async () => {
        return await this.prisma.order.findUnique({
          where: { id: orderId },
          include: {
            // Include user data with selected fields only
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            },
            // Include all order items
            orderItems: true,
            // Include package information if applicable
            package: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true
              }
            }
          }
        });
      },
      { orderId }
    );
  }

  /**
   * Get paginated orders with cursor-based pagination.
   * More efficient than offset-based pagination for large datasets.
   * 
   * @param cursor - Optional cursor to start from
   * @param limit - Number of orders per page
   * @param status - Optional status filter
   * @returns Paginated order results
   */
  async getOrdersPaginated(
    cursor?: string,
    limit: number = 20,
    status?: string
  ): Promise<CursorPaginationResult<OrderSummary>> {
    return await this.performanceLogger.measureQuery(
      'getOrdersPaginated',
      async () => {
        // Build pagination query
        const paginationQuery = buildCursorQuery(cursor, limit, { createdAt: 'desc' });
        
        // Execute query with optimized select
        const orders = await this.prisma.order.findMany({
          ...paginationQuery,
          where: status ? { orderStatus: status } : undefined,
          select: {
            id: true,
            orderNumber: true,
            orderStatus: true,
            paymentStatus: true,
            total: true,
            createdAt: true,
            isGuestOrder: true,
            guestFirstName: true,
            guestLastName: true,
            guestEmail: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            orderItems: {
              select: { id: true }
            }
          }
        });

        // Transform to summary format
        const summaries: OrderSummary[] = orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          total: Number(order.total),
          createdAt: order.createdAt,
          itemCount: order.orderItems.length,
          customerName: order.isGuestOrder 
            ? `${order.guestFirstName || ''} ${order.guestLastName || ''}`.trim()
            : order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : undefined,
          customerEmail: order.isGuestOrder ? order.guestEmail || undefined : order.user?.email
        }));

        // Calculate pagination metadata
        return calculateCursorPagination(summaries, limit);
      },
      { cursor, limit, status }
    );
  }

  /**
   * Get order analytics with aggregated data.
   * Uses efficient aggregation queries to calculate metrics.
   * 
   * @param startDate - Optional start date for filtering
   * @param endDate - Optional end date for filtering
   * @returns Order analytics data
   */
  async getOrderAnalytics(startDate?: Date, endDate?: Date): Promise<OrderAnalytics> {
    return await this.performanceLogger.measureQuery(
      'getOrderAnalytics',
      async () => {
        const whereClause = startDate || endDate ? {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate })
          }
        } : undefined;

        // Execute multiple queries in parallel for efficiency
        const [
          totalOrders,
          revenueData,
          ordersByStatus,
          monthlyData
        ] = await Promise.all([
          // Total order count
          this.prisma.order.count({ where: whereClause }),

          // Revenue aggregation
          this.prisma.order.aggregate({
            where: {
              ...whereClause,
              paymentStatus: 'PAID'
            },
            _sum: { total: true },
            _avg: { total: true }
          }),

          // Orders by status
          this.prisma.order.groupBy({
            by: ['orderStatus'],
            where: whereClause,
            _count: { orderStatus: true }
          }),

          // Monthly data (last 12 months) - simplified for demo
          this.prisma.order.groupBy({
            by: ['createdAt'],
            where: whereClause,
            _count: { id: true },
            _sum: { total: true }
          }).then(results => {
            // Group by month manually for simplicity
            const monthlyMap = new Map<string, { count: number; revenue: number }>();
            
            results.forEach(result => {
              const month = result.createdAt.toISOString().substring(0, 7); // YYYY-MM
              const existing = monthlyMap.get(month) || { count: 0, revenue: 0 };
              monthlyMap.set(month, {
                count: existing.count + result._count.id,
                revenue: existing.revenue + Number(result._sum.total || 0)
              });
            });
            
            return Array.from(monthlyMap.entries()).map(([month, data]) => ({
              month,
              count: BigInt(data.count),
              revenue: data.revenue
            }));
          })
        ]);

        // Transform results
        const totalRevenue = Number(revenueData._sum.total || 0);
        const averageOrderValue = Number(revenueData._avg.total || 0);

        const statusCounts: Record<string, number> = {};
        ordersByStatus.forEach(item => {
          statusCounts[item.orderStatus] = item._count.orderStatus;
        });

        const ordersByMonth = monthlyData.map(item => ({
          month: item.month,
          count: Number(item.count),
          revenue: Number(item.revenue)
        }));

        return {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          ordersByStatus: statusCounts,
          ordersByMonth
        };
      },
      { startDate, endDate }
    );
  }

  /**
   * Batch update order statuses efficiently.
   * Uses a single query instead of multiple individual updates.
   * 
   * @param orderIds - Array of order IDs to update
   * @param status - New status to set
   * @returns Number of orders updated
   */
  async batchUpdateOrderStatus(orderIds: string[], status: string): Promise<number> {
    return await this.performanceLogger.measureQuery(
      'batchUpdateOrderStatus',
      async () => {
        const result = await this.prisma.order.updateMany({
          where: {
            id: { in: orderIds }
          },
          data: { orderStatus: status }
        });

        return result.count;
      },
      { orderCount: orderIds.length, status }
    );
  }

  /**
   * Get orders requiring review with optimized query.
   * Uses indexes on requiresReview and createdAt for efficient filtering.
   * 
   * @param limit - Maximum number of orders to return
   * @returns Array of orders requiring review
   */
  async getOrdersRequiringReview(limit: number = 50): Promise<OrderSummary[]> {
    return await this.performanceLogger.measureQuery(
      'getOrdersRequiringReview',
      async () => {
        const orders = await this.prisma.order.findMany({
          where: {
            requiresReview: true,
            reviewedAt: null
          },
          select: {
            id: true,
            orderNumber: true,
            orderStatus: true,
            paymentStatus: true,
            total: true,
            createdAt: true,
            riskScore: true,
            riskLevel: true,
            isGuestOrder: true,
            guestFirstName: true,
            guestLastName: true,
            guestEmail: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            orderItems: {
              select: { id: true }
            }
          },
          orderBy: { createdAt: 'asc' }, // FIFO processing
          take: limit
        });

        return orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          total: Number(order.total),
          createdAt: order.createdAt,
          itemCount: order.orderItems.length,
          customerName: order.isGuestOrder 
            ? `${order.guestFirstName || ''} ${order.guestLastName || ''}`.trim()
            : order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : undefined,
          customerEmail: order.isGuestOrder ? order.guestEmail || undefined : order.user?.email
        }));
      },
      { limit }
    );
  }
}