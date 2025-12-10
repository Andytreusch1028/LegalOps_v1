/**
 * Order Repository Implementation
 * 
 * Provides data access layer for Order entities with caching support.
 * Implements optimized queries with select and include for performance.
 */

import { PrismaClient, Order, OrderItem, User } from '@/generated/prisma';
import { BaseRepository } from './base.repository';
import { ILogger } from '../interfaces/logger.interface';
import { ICache } from '../interfaces/cache.interface';
import { OrderStatus, PaymentStatus } from '@/types/entities';

/**
 * Order with related entities for detailed views.
 */
export interface OrderWithRelations extends Order {
  user?: User | null;
  orderItems?: OrderItem[];
}

/**
 * Order-specific repository interface.
 * Extends the base repository with order-specific query methods.
 */
export interface IOrderRepository {
  /**
   * Find all orders for a specific user.
   * Optimized with select to fetch only needed fields.
   * 
   * @param userId - The user ID
   * @param limit - Maximum number of orders to return
   * @returns Array of orders
   */
  findByUserId(userId: string, limit?: number): Promise<Order[]>;

  /**
   * Find orders by status.
   * Useful for admin dashboards and order processing queues.
   * 
   * @param status - The order status
   * @param limit - Maximum number of orders to return
   * @returns Array of orders
   */
  findByStatus(status: OrderStatus, limit?: number): Promise<Order[]>;

  /**
   * Find orders by payment status.
   * Useful for payment reconciliation and failed payment recovery.
   * 
   * @param paymentStatus - The payment status
   * @param limit - Maximum number of orders to return
   * @returns Array of orders
   */
  findByPaymentStatus(paymentStatus: PaymentStatus, limit?: number): Promise<Order[]>;

  /**
   * Find an order by order number.
   * Order numbers are unique and user-friendly identifiers.
   * 
   * @param orderNumber - The order number
   * @returns The order if found, null otherwise
   */
  findByOrderNumber(orderNumber: string): Promise<Order | null>;

  /**
   * Find an order with all related data (user, order items).
   * Uses Prisma include to avoid N+1 queries.
   * 
   * @param id - The order ID
   * @returns The order with relations if found, null otherwise
   */
  findByIdWithRelations(id: string): Promise<OrderWithRelations | null>;

  /**
   * Find orders that require review (high risk).
   * Used by admin staff to process flagged orders.
   * 
   * @param limit - Maximum number of orders to return
   * @returns Array of orders requiring review
   */
  findRequiringReview(limit?: number): Promise<Order[]>;

  /**
   * Update order status.
   * Invalidates cache for the order.
   * 
   * @param orderId - The order ID
   * @param status - The new order status
   * @returns The updated order
   */
  updateStatus(orderId: string, status: OrderStatus): Promise<Order>;

  /**
   * Update payment status.
   * Invalidates cache for the order.
   * 
   * @param orderId - The order ID
   * @param paymentStatus - The new payment status
   * @param paidAt - Optional timestamp when payment was received
   * @returns The updated order
   */
  updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    paidAt?: Date
  ): Promise<Order>;

  /**
   * Get order count by user.
   * Useful for risk assessment and customer analytics.
   * 
   * @param userId - The user ID
   * @returns The count of orders for the user
   */
  countByUserId(userId: string): Promise<number>;
}

/**
 * Order repository implementation.
 * Extends BaseRepository with order-specific methods and optimized queries.
 */
export class OrderRepository
  extends BaseRepository<Order>
  implements IOrderRepository
{
  readonly name = 'OrderRepository';

  /**
   * Cache TTL for orders: 2 minutes (120 seconds).
   * Orders change frequently during processing, so shorter TTL is appropriate.
   */
  protected cacheTTL = 120;

  constructor(prisma: PrismaClient, logger: ILogger, cache?: ICache) {
    super(prisma, logger, cache);
  }

  /**
   * Get the Prisma model delegate for Order.
   */
  protected getModel() {
    return this.prisma.order;
  }

  /**
   * Find all orders for a specific user.
   * Optimized with select to fetch only essential fields.
   */
  async findByUserId(userId: string, limit: number = 50): Promise<Order[]> {
    this.logger.debug(`[${this.name}] Finding orders for user: ${userId}`);

    return await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      // Select only needed fields for list views
      select: {
        id: true,
        userId: true,
        orderNumber: true,
        orderStatus: true,
        subtotal: true,
        tax: true,
        total: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
        paidAt: true,
        completedAt: true,
        // Exclude large JSON fields and guest info for performance
        isGuestOrder: true,
        requiresReview: true,
        riskScore: true,
        riskLevel: true,
        // Include minimal order items data
        orderItems: {
          select: {
            id: true,
            serviceType: true,
            description: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true
          }
        }
      }
    }) as Order[];
  }

  /**
   * Find orders by status.
   */
  async findByStatus(
    status: OrderStatus,
    limit: number = 100
  ): Promise<Order[]> {
    this.logger.debug(`[${this.name}] Finding orders with status: ${status}`);

    return await this.prisma.order.findMany({
      where: { orderStatus: status },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        orderNumber: true,
        orderStatus: true,
        subtotal: true,
        tax: true,
        total: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
        requiresReview: true,
        riskScore: true,
        riskLevel: true
      }
    }) as Order[];
  }

  /**
   * Find orders by payment status.
   */
  async findByPaymentStatus(
    paymentStatus: PaymentStatus,
    limit: number = 100
  ): Promise<Order[]> {
    this.logger.debug(
      `[${this.name}] Finding orders with payment status: ${paymentStatus}`
    );

    return await this.prisma.order.findMany({
      where: { paymentStatus },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        orderNumber: true,
        orderStatus: true,
        subtotal: true,
        tax: true,
        total: true,
        paymentStatus: true,
        paymentMethod: true,
        stripePaymentId: true,
        createdAt: true,
        updatedAt: true,
        paidAt: true
      }
    }) as Order[];
  }

  /**
   * Find an order by order number.
   * Checks cache first if caching is enabled.
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    // Check cache using order number as key
    if (this.cache) {
      const cacheKey = `${this.name}:orderNumber:${orderNumber}`;
      const cached = await this.cache.get<Order>(cacheKey);

      if (cached) {
        this.logger.debug(`[${this.name}] Cache hit for ${cacheKey}`);
        return cached;
      }
    }

    this.logger.debug(
      `[${this.name}] Finding order by order number: ${orderNumber}`
    );

    const order = await this.prisma.order.findUnique({
      where: { orderNumber }
    });

    // Cache the result
    if (order && this.cache) {
      const cacheKey = `${this.name}:orderNumber:${orderNumber}`;
      await this.cache.set(cacheKey, order, this.cacheTTL);
      this.logger.debug(`[${this.name}] Cached ${cacheKey}`);
    }

    return order;
  }

  /**
   * Find an order with all related data.
   * Uses Prisma include to avoid N+1 queries.
   */
  async findByIdWithRelations(
    id: string
  ): Promise<OrderWithRelations | null> {
    // Check cache first
    if (this.cache) {
      const cacheKey = `${this.name}:withRelations:${id}`;
      const cached = await this.cache.get<OrderWithRelations>(cacheKey);

      if (cached) {
        this.logger.debug(`[${this.name}] Cache hit for ${cacheKey}`);
        return cached;
      }
    }

    this.logger.debug(
      `[${this.name}] Finding order with relations for id: ${id}`
    );

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        orderItems: true,
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

    // Cache the result
    if (order && this.cache) {
      const cacheKey = `${this.name}:withRelations:${id}`;
      await this.cache.set(cacheKey, order, this.cacheTTL);
      this.logger.debug(`[${this.name}] Cached ${cacheKey}`);
    }

    return order;
  }

  /**
   * Find orders that require review.
   */
  async findRequiringReview(limit: number = 50): Promise<Order[]> {
    this.logger.debug(`[${this.name}] Finding orders requiring review`);

    return await this.prisma.order.findMany({
      where: {
        requiresReview: true,
        reviewedAt: null
      },
      orderBy: { createdAt: 'asc' }, // Oldest first for FIFO processing
      take: limit,
      select: {
        id: true,
        userId: true,
        orderNumber: true,
        orderStatus: true,
        total: true,
        paymentStatus: true,
        riskScore: true,
        riskLevel: true,
        requiresReview: true,
        reviewedAt: true,
        createdAt: true,
        isGuestOrder: true,
        guestEmail: true,
        guestFirstName: true,
        guestLastName: true
      }
    }) as Order[];
  }

  /**
   * Update order status.
   * Invalidates all cache entries for this order.
   */
  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    this.logger.info(
      `[${this.name}] Updating order ${orderId} status to ${status}`
    );

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: status,
        ...(status === 'COMPLETED' && { completedAt: new Date() })
      }
    });

    // Invalidate all cache entries for this order
    await this.invalidateOrderCache(orderId, order.orderNumber);

    return order;
  }

  /**
   * Update payment status.
   * Invalidates all cache entries for this order.
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    paidAt?: Date
  ): Promise<Order> {
    this.logger.info(
      `[${this.name}] Updating order ${orderId} payment status to ${paymentStatus}`
    );

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        ...(paidAt && { paidAt })
      }
    });

    // Invalidate all cache entries for this order
    await this.invalidateOrderCache(orderId, order.orderNumber);

    return order;
  }

  /**
   * Get order count by user.
   */
  async countByUserId(userId: string): Promise<number> {
    this.logger.debug(`[${this.name}] Counting orders for user: ${userId}`);

    return await this.prisma.order.count({
      where: { userId }
    });
  }

  /**
   * Override update to invalidate order-specific cache keys.
   */
  async update(id: string, data: any): Promise<Order> {
    const order = await super.update(id, data);

    // Invalidate order number cache if it exists
    await this.invalidateOrderCache(id, order.orderNumber);

    return order;
  }

  /**
   * Override delete to invalidate order-specific cache keys.
   */
  async delete(id: string): Promise<void> {
    // Get order first to get order number
    const order = await this.findById(id);

    await super.delete(id);

    // Invalidate order number cache if order was found
    if (order) {
      await this.invalidateOrderCache(id, order.orderNumber);
    }
  }

  /**
   * Invalidate all cache entries for an order.
   * This includes cache by ID, order number, and with relations.
   * 
   * @param orderId - The order ID
   * @param orderNumber - The order number
   */
  private async invalidateOrderCache(
    orderId: string,
    orderNumber: string
  ): Promise<void> {
    if (this.cache) {
      // Invalidate cache by ID
      await this.cache.delete(this.getCacheKey(orderId));

      // Invalidate cache by order number
      await this.cache.delete(`${this.name}:orderNumber:${orderNumber}`);

      // Invalidate cache with relations
      await this.cache.delete(`${this.name}:withRelations:${orderId}`);

      this.logger.debug(
        `[${this.name}] Invalidated all cache entries for order ${orderId}`
      );
    }
  }
}
