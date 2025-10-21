import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

/**
 * POST /api/orders/[orderId]/pay
 * Process payment for an order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentMethod } = body;

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: {
        id: params.orderId,
      },
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

    // Check if order is already paid
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      );
    }

    // TODO: Integrate with Stripe
    // For now, we'll just mark the order as paid
    const updatedOrder = await prisma.order.update({
      where: {
        id: params.orderId,
      },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod || 'stripe',
        paidAt: new Date(),
        orderStatus: 'PROCESSING',
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

