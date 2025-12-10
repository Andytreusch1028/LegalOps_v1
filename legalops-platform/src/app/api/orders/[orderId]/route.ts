import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ServiceFactory } from '@/lib/services/service-factory';
import { createSuccessResponse, createErrorResponse } from '@/lib/types/api';

/**
 * GET /api/orders/[orderId]
 * Fetch a single order (supports both authenticated and guest orders)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const errorHandler = ServiceFactory.getErrorHandler();
  const orderService = ServiceFactory.getOrderService();

  try {
    const session = await getServerSession(authOptions);
    const { orderId } = await params;

    // Use OrderService to get the order
    const result = await orderService.getOrder(orderId, session?.user?.id);

    if (!result.success) {
      const response = await errorHandler.handle(result.error, {
        orderId,
        endpoint: '/api/orders/[orderId]'
      });
      return NextResponse.json(response, { status: result.error.statusCode });
    }

    const order = result.data;

    // For guest orders, allow access without authentication
    if (order.isGuestOrder) {
      // Guest orders can be accessed by anyone with the order ID
      // (This is acceptable since the order ID is a secure random string)
    } else {
      // For authenticated user orders, verify ownership
      if (!session) {
        const response = createErrorResponse(
          'UNAUTHORIZED',
          'Authentication required',
          undefined
        );
        return NextResponse.json(response, { status: 401 });
      }

      if (order.userId !== session.user.id) {
        const response = createErrorResponse(
          'FORBIDDEN',
          'Not authorized to access this order',
          undefined
        );
        return NextResponse.json(response, { status: 403 });
      }
    }

    // Convert Decimal fields to numbers for JSON serialization
    const orderResponse = {
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      total: Number(order.total),
      orderItems: order.orderItems?.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    };

    const response = createSuccessResponse(orderResponse);
    return NextResponse.json(response);
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: '/api/orders/[orderId]',
      method: 'GET'
    });
    return NextResponse.json(response, { status: 500 });
  }
}

