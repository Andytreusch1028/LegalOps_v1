import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { sendOrderConfirmationEmail } from '@/lib/services/email-service';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle payment intent succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        // Fetch order with user info
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { user: true },
        });

        if (order) {
          // Update order status to paid
          await prisma.order.update({
            where: { id: orderId },
            data: {
              orderStatus: 'PAID',
              paymentStatus: 'PAID',
              stripePaymentIntentId: paymentIntent.id,
              paidAt: new Date(),
            },
          });

          // Send confirmation email
          await sendOrderConfirmationEmail(
            order.user.email,
            order.orderNumber,
            Number(order.total),
            'Business Formation Service'
          );

          console.log(`✅ Payment succeeded for order ${orderId}`);
        }
      }
    }

    // Handle payment intent failed
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        // Update order status to failed
        await prisma.order.update({
          where: { id: orderId },
          data: {
            orderStatus: 'PAYMENT_FAILED',
            paymentStatus: 'FAILED',
            stripePaymentIntentId: paymentIntent.id,
          },
        });

        console.log(`❌ Payment failed for order ${orderId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

