import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/orders/[orderId]/items/[itemId]
 * Update order item data (for auto-save functionality)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, itemId } = await params;
    const body = await request.json();
    const { additionalData, additionalDataCollected } = body;

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Verify order item exists and belongs to this order
    const orderItem = order.orderItems.find((item) => item.id === itemId);

    if (!orderItem) {
      return NextResponse.json(
        { error: 'Order item not found' },
        { status: 404 }
      );
    }

    // Update order item with form data
    const updatedOrderItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        additionalData: additionalData,
        additionalDataCollected: additionalDataCollected ?? orderItem.additionalDataCollected,
      },
    });

    return NextResponse.json({
      success: true,
      orderItem: updatedOrderItem,
    });
  } catch (error) {
    console.error('Error updating order item:', error);
    return NextResponse.json(
      { error: 'Failed to update order item' },
      { status: 500 }
    );
  }
}

