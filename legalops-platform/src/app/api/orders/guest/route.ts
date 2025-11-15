/**
 * LegalOps v1 - Guest Order Creation API
 * 
 * Creates orders for guest checkout (no account required)
 * Used for one-time services like Operating Agreement, Bylaws, Certificate of Status, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceType,
      guestInfo,
      tosAcceptedAt,
      privacyPolicyAcceptedAt,
      emailRemindersConsent,
      smsRemindersConsent,
    } = body;

    // Validation
    if (!serviceType) {
      return NextResponse.json(
        { error: 'Missing required field: serviceType' },
        { status: 400 }
      );
    }

    if (!guestInfo || !guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
      return NextResponse.json(
        { error: 'Missing required guest information: firstName, lastName, email' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestInfo.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get service from database
    const service = await prisma.service.findFirst({
      where: { orderType: serviceType },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Generate order number
    const orderNumber = `LO-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Calculate totals (no tax for now - will add tax calculation later)
    const subtotal = Number(service.totalPrice);
    const tax = 0;
    const total = subtotal + tax;

    // Create guest order
    const now = new Date();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        isGuestOrder: true,
        guestEmail: guestInfo.email.toLowerCase(),
        guestFirstName: guestInfo.firstName,
        guestLastName: guestInfo.lastName,
        guestPhone: guestInfo.phone || null,
        tosAcceptedAt: tosAcceptedAt ? new Date(tosAcceptedAt) : now,
        privacyPolicyAcceptedAt: privacyPolicyAcceptedAt ? new Date(privacyPolicyAcceptedAt) : now,
        emailRemindersConsent: emailRemindersConsent || false,
        emailRemindersConsentAt: emailRemindersConsent ? now : null,
        smsRemindersConsent: smsRemindersConsent || false,
        smsRemindersConsentAt: smsRemindersConsent ? now : null,
        orderStatus: 'PENDING',
        paymentStatus: 'PENDING',
        subtotal,
        tax,
        total,
        orderItems: {
          create: [
            {
              serviceType,
              description: service.name,
              quantity: 1,
              unitPrice: service.totalPrice,
              totalPrice: service.totalPrice,
              requiresAdditionalData: true,
              additionalDataCollected: false,
              dataCollectionFormType: serviceType,
            },
          ],
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Return order data
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      message: 'Guest order created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Guest order creation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}

