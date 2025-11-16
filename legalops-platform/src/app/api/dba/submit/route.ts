/**
 * DBA Submission API
 * 
 * POST /api/dba/submit
 * 
 * Creates FictitiousName record after payment is completed.
 * Called by Stripe webhook or manually after order payment.
 * 
 * This endpoint:
 * 1. Validates authentication and order ownership
 * 2. Creates FictitiousName record with all Sunbiz-required fields
 * 3. Creates FictitiousNameOwner records
 * 4. Calculates expiration date (December 31, year + 5)
 * 5. Captures electronic signature with IP address
 * 6. Updates order status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createFictitiousNameRecord } from '@/lib/services/dba-service';
import type { FictitiousNameFormData } from '@/types/forms';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, formData } = body as {
      orderId: string;
      formData: FictitiousNameFormData;
    };

    // Validate required fields
    if (!orderId || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId and formData' },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden. This order does not belong to you.' },
        { status: 403 }
      );
    }

    // Verify order is paid
    if (order.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'Order must be paid before creating DBA record' },
        { status: 400 }
      );
    }

    // Check if FictitiousName record already exists for this order
    const existingRecord = await prisma.fictitiousName.findFirst({
      where: { orderId },
    });

    if (existingRecord) {
      return NextResponse.json(
        { 
          success: true,
          fictitiousNameId: existingRecord.id,
          documentNumber: existingRecord.documentNumber,
          expirationDate: existingRecord.expirationDate,
          message: 'DBA record already exists for this order',
        },
        { status: 200 }
      );
    }

    // Get client IP address for signature audit trail
    const signatureIp = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown';

    // Create FictitiousName record
    const fictitiousName = await createFictitiousNameRecord(
      formData,
      session.user.id,
      orderId,
      signatureIp
    );

    // Update order status to PROCESSING
    await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: 'PROCESSING',
      },
    });

    console.log(`✅ DBA record created: ${fictitiousName.id} for order ${orderId}`);

    return NextResponse.json({
      success: true,
      fictitiousNameId: fictitiousName.id,
      documentNumber: fictitiousName.documentNumber,
      expirationDate: fictitiousName.expirationDate,
      message: 'DBA record created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error in DBA submit API:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to create DBA record: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

