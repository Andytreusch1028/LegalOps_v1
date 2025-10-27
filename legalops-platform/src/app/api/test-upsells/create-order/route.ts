import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/test-upsells/create-order
 * Create a test individual service order for testing upsells
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find LLC Formation service
    const llcService = await prisma.service.findFirst({
      where: { slug: 'llc-formation' },
    });

    if (!llcService) {
      return NextResponse.json(
        { error: 'LLC Formation service not found' },
        { status: 404 }
      );
    }

    // Create order
    const orderNumber = `TEST-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        subtotal: llcService.totalPrice,
        tax: 0,
        total: llcService.totalPrice,
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        orderItems: {
          create: [
            {
              serviceType: 'LLC_FORMATION',
              description: 'Florida LLC Formation',
              quantity: 1,
              unitPrice: llcService.totalPrice,
              totalPrice: llcService.totalPrice,
            },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
    });
  } catch (error) {
    console.error('Error creating test order:', error);
    return NextResponse.json(
      { error: 'Failed to create test order' },
      { status: 500 }
    );
  }
}

