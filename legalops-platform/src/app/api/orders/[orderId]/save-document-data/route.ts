import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/orders/[orderId]/save-document-data
 * Save form data for a specific order item (document)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId } = await params;
    const body = await request.json();
    const { orderItemId, formData, markAsComplete } = body;

    if (!orderItemId || !formData) {
      return NextResponse.json(
        { error: 'Invalid request: orderItemId and formData required' },
        { status: 400 }
      );
    }

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
    const orderItem = order.orderItems.find((item) => item.id === orderItemId);

    if (!orderItem) {
      return NextResponse.json(
        { error: 'Order item not found' },
        { status: 404 }
      );
    }

    // Update order item with form data
    const updatedOrderItem = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        additionalData: formData,
        additionalDataCollected: markAsComplete || false,
      },
    });

    return NextResponse.json({
      success: true,
      orderItem: updatedOrderItem,
    });
  } catch (error) {
    console.error('Error saving document data:', error);
    return NextResponse.json(
      { error: 'Failed to save document data' },
      { status: 500 }
    );
  }
}

