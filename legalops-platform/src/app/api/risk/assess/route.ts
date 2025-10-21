/**
 * API Route: /api/risk/assess
 * 
 * Assesses fraud risk for orders using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { aiRiskScoring, CustomerData, OrderData } from '@/lib/services/ai-risk-scoring';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, userId, orderData } = body;

    // Validate required fields
    if (!orderId || !userId || !orderData) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, userId, orderData' },
        { status: 400 }
      );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          select: {
            id: true,
            paymentStatus: true,
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
    const previousOrders = user.orders.filter(o => o.paymentStatus === 'PAID').length;
    const previousChargebacks = user.orders.filter(o => o.paymentStatus === 'REFUNDED').length;

    // Prepare customer data for risk assessment
    const customerData: CustomerData = {
      id: user.id,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
      email: user.email,
      phone: user.phone || undefined,
      ipAddress: orderData.ipAddress,
      userAgent: orderData.userAgent,
      accountAge,
      previousOrders,
      previousChargebacks
    };

    // Prepare order data for risk assessment
    const orderDataForAssessment: OrderData = {
      amount: parseFloat(orderData.total),
      services: orderData.services || [],
      isRushOrder: orderData.isRushOrder || false,
      paymentMethod: orderData.paymentMethod || 'stripe',
      billingAddress: orderData.billingAddress
    };

    // Perform AI risk assessment
    const assessment = await aiRiskScoring.assessRisk(
      customerData,
      orderDataForAssessment
    );

    // Save risk assessment to database
    const savedAssessment = await prisma.riskAssessment.create({
      data: {
        orderId,
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        recommendation: assessment.recommendation,
        aiReasoning: assessment.reasoning,
        aiModel: 'gpt-4-turbo',
        riskFactors: assessment.riskFactors as any,
        
        // Customer data snapshot
        customerEmail: user.email,
        customerName: customerData.name,
        customerPhone: user.phone,
        accountAge,
        previousOrders,
        previousChargebacks,
        
        // Order data snapshot
        orderAmount: orderData.total,
        paymentMethod: orderData.paymentMethod || 'stripe',
        isRushOrder: orderData.isRushOrder || false,
        
        // Technical data
        ipAddress: orderData.ipAddress,
        userAgent: orderData.userAgent,
        billingAddress: orderData.billingAddress,
        
        // Review status
        requiresReview: assessment.requiresReview
      }
    });

    // Update order with risk information
    await prisma.order.update({
      where: { id: orderId },
      data: {
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        requiresReview: assessment.requiresReview,
        ipAddress: orderData.ipAddress,
        userAgent: orderData.userAgent,
        isRushOrder: orderData.isRushOrder || false
      }
    });

    return NextResponse.json({
      success: true,
      assessment: {
        id: savedAssessment.id,
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        riskFactors: assessment.riskFactors,
        recommendation: assessment.recommendation,
        reasoning: assessment.reasoning,
        requiresReview: assessment.requiresReview
      }
    });

  } catch (error) {
    console.error('Risk assessment error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to assess risk',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/risk/assess?orderId=xxx
 * 
 * Retrieve existing risk assessment for an order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId parameter' },
        { status: 400 }
      );
    }

    const assessment = await prisma.riskAssessment.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            orderNumber: true,
            orderStatus: true,
            total: true,
            createdAt: true
          }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Risk assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment
    });

  } catch (error) {
    console.error('Error fetching risk assessment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch risk assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

