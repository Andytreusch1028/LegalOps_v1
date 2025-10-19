/**
 * API Route: /api/test-risk-assessment
 * 
 * Test endpoint for risk assessment (does not save to database)
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiRiskScoring, CustomerData, OrderData } from '@/lib/services/ai-risk-scoring';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerData, orderData } = body;

    if (!customerData || !orderData) {
      return NextResponse.json(
        { error: 'Missing customerData or orderData' },
        { status: 400 }
      );
    }

    // Prepare customer data
    const customer: CustomerData = {
      email: customerData.email,
      name: customerData.name,
      phone: customerData.phone,
      ipAddress: customerData.ipAddress,
      userAgent: customerData.userAgent,
      accountAge: 0, // New customer for testing
      previousOrders: 0,
      previousChargebacks: 0
    };

    // Prepare order data
    const order: OrderData = {
      amount: orderData.amount,
      services: orderData.services || ['LLC_FORMATION'],
      isRushOrder: orderData.isRushOrder || false,
      paymentMethod: orderData.paymentMethod || 'credit_card',
      billingAddress: orderData.billingAddress
    };

    // Perform risk assessment
    const assessment = await aiRiskScoring.assessRisk(customer, order);

    return NextResponse.json(assessment);

  } catch (error) {
    console.error('Test risk assessment error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to assess risk',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

