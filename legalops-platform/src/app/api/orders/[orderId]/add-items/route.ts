import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/orders/[orderId]/add-items
 * Add upsell items to an existing order (before payment)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId } = await params;
    const body = await request.json();
    const { items } = body; // Array of { description, price }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Fetch the order
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

    // Check if user owns this order
    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if order is still pending (not paid)
    if (order.paymentStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot modify a paid order' },
        { status: 400 }
      );
    }

    // Add new items to the order
    const newOrderItems = items.map((item: { description: string; price: number; serviceType?: string }) => ({
      orderId: order.id,
      serviceType: item.serviceType || 'REGISTERED_AGENT', // Default to REGISTERED_AGENT, should be passed from frontend
      description: item.description,
      quantity: 1,
      unitPrice: item.price,
      totalPrice: item.price,
    }));

    // Create order items
    await prisma.orderItem.createMany({
      data: newOrderItems,
    });

    // Calculate new totals
    const newSubtotal = Number(order.subtotal) + items.reduce((sum: number, item: { price: number }) => sum + item.price, 0);
    const newTax = Number(order.tax); // Tax calculation would go here if needed
    const newTotal = newSubtotal + newTax;

    // Update order totals
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        subtotal: newSubtotal,
        total: newTotal,
      },
      include: {
        orderItems: true,
        package: true,
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const orderResponse = {
      ...updatedOrder,
      subtotal: Number(updatedOrder.subtotal),
      tax: Number(updatedOrder.tax),
      total: Number(updatedOrder.total),
      orderItems: updatedOrder.orderItems?.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    };

    return NextResponse.json(orderResponse);
  } catch (error) {
    console.error('Error adding items to order:', error);
    return NextResponse.json(
      { error: 'Failed to add items to order' },
      { status: 500 }
    );
  }
}

