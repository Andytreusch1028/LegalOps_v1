import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/orders/[orderId]/remove-items
 * Remove items from an existing order before payment
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
    const { itemDescriptions } = body; // Array of descriptions to remove

    if (!itemDescriptions || !Array.isArray(itemDescriptions)) {
      return NextResponse.json(
        { error: 'Invalid request: itemDescriptions array required' },
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

    if (order.paymentStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot modify order after payment' },
        { status: 400 }
      );
    }

    // Find items to remove by description
    const itemsToRemove = order.orderItems.filter((item) =>
      itemDescriptions.some((desc: string) => 
        item.description.toLowerCase().includes(desc.toLowerCase()) ||
        desc.toLowerCase().includes(item.description.toLowerCase())
      )
    );

    if (itemsToRemove.length === 0) {
      return NextResponse.json(
        { error: 'No matching items found to remove' },
        { status: 404 }
      );
    }

    // Calculate total price of items being removed
    const removedTotal = itemsToRemove.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0
    );

    // Delete the items
    await prisma.orderItem.deleteMany({
      where: {
        id: {
          in: itemsToRemove.map((item) => item.id),
        },
      },
    });

    // Recalculate order totals
    const newSubtotal = Number(order.subtotal) - removedTotal;
    const newTax = 0; // Tax calculation logic here
    const newTotal = newSubtotal + newTax;

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        subtotal: newSubtotal,
        tax: newTax,
        total: newTotal,
      },
      include: {
        orderItems: true,
        package: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error removing items from order:', error);
    return NextResponse.json(
      { error: 'Failed to remove items from order' },
      { status: 500 }
    );
  }
}

