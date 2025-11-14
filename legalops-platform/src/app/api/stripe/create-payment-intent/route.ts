import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Stripe from 'stripe';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional for guest orders)
    const session = await getServerSession(authOptions);

    const { orderId, amount, description } = await request.json();

    // Validate input
    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      );
    }

    // Fetch order to verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify ownership: either user owns the order OR it's a guest order
    const isGuestOrder = !order.userId;
    const isUserOrder = session?.user?.id && order.userId === session.user.id;

    if (!isGuestOrder && !isUserOrder) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create Stripe payment intent
    const metadata: Record<string, string> = {
      orderId: order.id,
      orderNumber: order.orderNumber,
    };

    // Add userId to metadata only if it exists
    if (order.userId) {
      metadata.userId = order.userId;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      description: description || `Order ${order.orderNumber}`,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

