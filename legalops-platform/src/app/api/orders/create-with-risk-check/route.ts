/**
 * API Route: /api/orders/create-with-risk-check
 * 
 * Creates order with AI risk assessment BEFORE payment processing
 * This prevents fraudulent orders from being charged
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { aiRiskScoring, CustomerData, OrderData } from '@/lib/services/ai-risk-scoring';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, orderData } = body;

    // Validate required fields
    if (!userId || !orderData) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, orderData' },
        { status: 400 }
      );
    }

    // ========================================================================
    // STEP 1: Get user information
    // ========================================================================
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          select: {
            id: true,
            paymentStatus: true,
            orderStatus: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate account age in days
    const accountAge = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Count previous orders and chargebacks
    const previousOrders = user.orders.filter(
      o => o.paymentStatus === 'PAID' && o.orderStatus !== 'CANCELLED'
    ).length;
    
    const previousChargebacks = user.orders.filter(
      o => o.paymentStatus === 'REFUNDED'
    ).length;

    // ========================================================================
    // STEP 2: Prepare data for risk assessment
    // ========================================================================
    
    // Capture IP address and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const customerData: CustomerData = {
      id: user.id,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
      email: user.email,
      phone: user.phone || undefined,
      ipAddress,
      userAgent,
      accountAge,
      previousOrders,
      previousChargebacks
    };

    const orderDataForAssessment: OrderData = {
      amount: parseFloat(orderData.total),
      services: orderData.services || [],
      isRushOrder: orderData.isRushOrder || false,
      paymentMethod: orderData.paymentMethod || 'stripe',
      billingAddress: orderData.billingAddress
    };

    // ========================================================================
    // STEP 3: RUN RISK ASSESSMENT (BEFORE creating order or charging payment)
    // ========================================================================
    console.log('🔍 Running risk assessment for user:', user.email);
    
    const riskAssessment = await aiRiskScoring.assessRisk(
      customerData,
      orderDataForAssessment
    );

    console.log('📊 Risk Assessment Result:', {
      score: riskAssessment.riskScore,
      level: riskAssessment.riskLevel,
      recommendation: riskAssessment.recommendation
    });

    // ========================================================================
    // STEP 4: Handle CRITICAL risk - DECLINE immediately (before payment)
    // ========================================================================
    if (riskAssessment.recommendation === 'DECLINE') {
      console.log('🚨 Order DECLINED due to critical fraud risk');
      
      // Log the declined attempt (for audit trail)
      await prisma.riskAssessment.create({
        data: {
          orderId: 'DECLINED_BEFORE_ORDER', // No order was created
          riskScore: riskAssessment.riskScore,
          riskLevel: riskAssessment.riskLevel,
          recommendation: riskAssessment.recommendation,
          aiReasoning: riskAssessment.reasoning,
          aiModel: 'gpt-4-turbo',
          riskFactors: riskAssessment.riskFactors as Record<string, unknown>,
          customerEmail: user.email,
          customerName: customerData.name,
          customerPhone: user.phone,
          accountAge,
          previousOrders,
          previousChargebacks,
          orderAmount: orderData.total,
          paymentMethod: orderData.paymentMethod || 'stripe',
          isRushOrder: orderData.isRushOrder || false,
          ipAddress,
          userAgent,
          billingAddress: orderData.billingAddress,
          requiresReview: true
        }
      });

      return NextResponse.json(
        {
          success: false,
          declined: true,
          reason: 'fraud_risk',
          message: 'We are unable to process your order at this time. Please contact support for assistance.',
          riskScore: riskAssessment.riskScore,
          requiresVerification: true
        },
        { status: 403 }
      );
    }

    // ========================================================================
    // STEP 5: Handle HIGH risk - Require verification (before payment)
    // ========================================================================
    if (riskAssessment.recommendation === 'VERIFY') {
      console.log('⚠️ Order requires verification before processing');
      
      // Create order in PENDING_VERIFICATION status (no payment yet)
      const order = await prisma.order.create({
        data: {
          userId,
          orderNumber: generateOrderNumber(),
          orderStatus: 'PENDING', // Will stay pending until verified
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          total: orderData.total,
          paymentStatus: 'PENDING',
          paymentMethod: orderData.paymentMethod,
          ipAddress,
          userAgent,
          isRushOrder: orderData.isRushOrder || false,
          riskScore: riskAssessment.riskScore,
          riskLevel: riskAssessment.riskLevel,
          requiresReview: true
        }
      });

      // Save risk assessment
      await prisma.riskAssessment.create({
        data: {
          orderId: order.id,
          riskScore: riskAssessment.riskScore,
          riskLevel: riskAssessment.riskLevel,
          recommendation: riskAssessment.recommendation,
          aiReasoning: riskAssessment.reasoning,
          aiModel: 'gpt-4-turbo',
          riskFactors: riskAssessment.riskFactors as Record<string, unknown>,
          customerEmail: user.email,
          customerName: customerData.name,
          customerPhone: user.phone,
          accountAge,
          previousOrders,
          previousChargebacks,
          orderAmount: orderData.total,
          paymentMethod: orderData.paymentMethod || 'stripe',
          isRushOrder: orderData.isRushOrder || false,
          ipAddress,
          userAgent,
          billingAddress: orderData.billingAddress,
          requiresReview: true
        }
      });

      // TODO: Send email to customer requesting verification
      // TODO: Send notification to admin for review

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        message: 'Your order requires additional verification before processing. Our team will contact you shortly.',
        riskScore: riskAssessment.riskScore
      });
    }

    // ========================================================================
    // STEP 6: LOW/MEDIUM risk - Proceed with order creation and payment
    // ========================================================================
    console.log('✅ Order approved - proceeding with payment');

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        orderStatus: 'PENDING',
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        total: orderData.total,
        paymentStatus: 'PENDING',
        paymentMethod: orderData.paymentMethod,
        ipAddress,
        userAgent,
        isRushOrder: orderData.isRushOrder || false,
        riskScore: riskAssessment.riskScore,
        riskLevel: riskAssessment.riskLevel,
        requiresReview: riskAssessment.requiresReview
      }
    });

    // Save risk assessment
    await prisma.riskAssessment.create({
      data: {
        orderId: order.id,
        riskScore: riskAssessment.riskScore,
        riskLevel: riskAssessment.riskLevel,
        recommendation: riskAssessment.recommendation,
        aiReasoning: riskAssessment.reasoning,
        aiModel: 'gpt-4-turbo',
        riskFactors: riskAssessment.riskFactors as Record<string, unknown>,
        customerEmail: user.email,
        customerName: customerData.name,
        customerPhone: user.phone,
        accountAge,
        previousOrders,
        previousChargebacks,
        orderAmount: orderData.total,
        paymentMethod: orderData.paymentMethod || 'stripe',
        isRushOrder: orderData.isRushOrder || false,
        ipAddress,
        userAgent,
        billingAddress: orderData.billingAddress,
        requiresReview: riskAssessment.requiresReview
      }
    });

    // Return success - frontend can now proceed with payment
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      proceedWithPayment: true,
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      message: 'Order created successfully. Proceeding to payment.'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LO-${timestamp}-${random}`;
}

