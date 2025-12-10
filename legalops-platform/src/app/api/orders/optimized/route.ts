/**
 * Optimized Orders API Route
 * 
 * Demonstrates query optimization best practices:
 * - Using select to fetch only needed fields
 * - Using include to avoid N+1 queries
 * - Implementing cursor-based pagination
 * - Query performance monitoring
 * - Proper error handling with structured responses
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ServiceFactory } from "@/lib/services/service-factory";
import { OptimizedQueryService } from "@/lib/services/optimized-query.service";
import { createSuccessResponse, createErrorResponse } from "@/lib/types/api";
import { prisma } from "@/lib/prisma";
import { ConsoleLogger } from "@/lib/logging/console-logger";

// Initialize optimized query service
const logger = new ConsoleLogger();
const optimizedQueryService = new OptimizedQueryService(prisma, logger);

/**
 * GET /api/orders/optimized - Get orders with optimized queries
 * 
 * Query parameters:
 * - cursor: Cursor for pagination
 * - limit: Number of items per page (default: 20, max: 100)
 * - status: Filter by order status
 * - view: 'summary' (default) or 'detailed'
 */
export async function GET(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const response = createErrorResponse(
        'UNAUTHORIZED',
        'Authentication required',
        undefined
      );
      return NextResponse.json(response, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      const response = createErrorResponse(
        'USER_NOT_FOUND',
        'User not found',
        undefined
      );
      return NextResponse.json(response, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status') || undefined;
    const view = searchParams.get('view') || 'summary';

    if (view === 'detailed') {
      // Get detailed view with all related data
      const orders = await optimizedQueryService.getOrderSummaries(userId, limit);
      
      // Convert Decimal fields to numbers for JSON serialization
      const ordersResponse = orders.map(order => ({
        ...order,
        total: Number(order.total)
      }));

      const response = createSuccessResponse({ 
        orders: ordersResponse,
        view: 'detailed'
      });
      return NextResponse.json(response);
    } else {
      // Get paginated summary view (default)
      const result = await optimizedQueryService.getOrdersPaginated(cursor, limit, status);
      
      // Convert Decimal fields to numbers for JSON serialization
      const ordersResponse = {
        ...result,
        items: result.items.map(order => ({
          ...order,
          total: Number(order.total)
        }))
      };

      const response = createSuccessResponse({
        orders: ordersResponse.items,
        pagination: {
          hasMore: ordersResponse.hasMore,
          nextCursor: ordersResponse.nextCursor,
          limit
        },
        view: 'summary'
      });
      return NextResponse.json(response);
    }
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: '/api/orders/optimized',
      method: 'GET'
    });
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * GET /api/orders/optimized/analytics - Get order analytics
 * 
 * Query parameters:
 * - startDate: Start date for filtering (ISO string)
 * - endDate: End date for filtering (ISO string)
 */
export async function POST(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const response = createErrorResponse(
        'UNAUTHORIZED',
        'Authentication required',
        undefined
      );
      return NextResponse.json(response, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'analytics': {
        const { startDate, endDate } = params;
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;

        const analytics = await optimizedQueryService.getOrderAnalytics(start, end);
        
        const response = createSuccessResponse({
          analytics: {
            ...analytics,
            totalRevenue: Number(analytics.totalRevenue),
            averageOrderValue: Number(analytics.averageOrderValue),
            ordersByMonth: analytics.ordersByMonth.map(item => ({
              ...item,
              revenue: Number(item.revenue)
            }))
          }
        });
        return NextResponse.json(response);
      }

      case 'batchUpdateStatus': {
        const { orderIds, status } = params;
        
        if (!Array.isArray(orderIds) || orderIds.length === 0) {
          const response = createErrorResponse(
            'INVALID_REQUEST',
            'orderIds must be a non-empty array',
            undefined
          );
          return NextResponse.json(response, { status: 400 });
        }

        if (!status) {
          const response = createErrorResponse(
            'INVALID_REQUEST',
            'status is required',
            undefined
          );
          return NextResponse.json(response, { status: 400 });
        }

        const updatedCount = await optimizedQueryService.batchUpdateOrderStatus(orderIds, status);
        
        const response = createSuccessResponse({
          message: `Updated ${updatedCount} orders`,
          updatedCount
        });
        return NextResponse.json(response);
      }

      case 'requiresReview': {
        const { limit = 50 } = params;
        const orders = await optimizedQueryService.getOrdersRequiringReview(limit);
        
        const ordersResponse = orders.map(order => ({
          ...order,
          total: Number(order.total)
        }));

        const response = createSuccessResponse({
          orders: ordersResponse,
          count: ordersResponse.length
        });
        return NextResponse.json(response);
      }

      default:
        const response = createErrorResponse(
          'INVALID_ACTION',
          `Unknown action: ${action}`,
          { supportedActions: ['analytics', 'batchUpdateStatus', 'requiresReview'] }
        );
        return NextResponse.json(response, { status: 400 });
    }
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: '/api/orders/optimized',
      method: 'POST'
    });
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * Example usage documentation:
 * 
 * GET /api/orders/optimized
 * - Basic paginated list with summaries
 * 
 * GET /api/orders/optimized?cursor=abc123&limit=50&status=PENDING
 * - Paginated list with cursor, custom limit, and status filter
 * 
 * GET /api/orders/optimized?view=detailed&limit=10
 * - Detailed view with all related data (limited results recommended)
 * 
 * POST /api/orders/optimized
 * Body: { "action": "analytics", "startDate": "2024-01-01", "endDate": "2024-12-31" }
 * - Get analytics for date range
 * 
 * POST /api/orders/optimized
 * Body: { "action": "batchUpdateStatus", "orderIds": ["id1", "id2"], "status": "PROCESSING" }
 * - Batch update order statuses
 * 
 * POST /api/orders/optimized
 * Body: { "action": "requiresReview", "limit": 25 }
 * - Get orders requiring review
 */