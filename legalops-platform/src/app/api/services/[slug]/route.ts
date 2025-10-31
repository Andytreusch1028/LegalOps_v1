import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/services/[slug]
 * Fetch a single service by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const service = await prisma.service.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        orderType: true, // CRITICAL: Needed for checkout routing
        shortDescription: true,
        longDescription: true,
        totalPrice: true,
        serviceFee: true,
        stateFee: true,
        registeredAgentFee: true,
        icon: true,
        processingTime: true,
        category: true,
        requirements: true,
        entityTypes: true,
        rushFeeAvailable: true,
        rushFee: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Convert Decimal fields to numbers for JSON serialization
    const serviceResponse = {
      ...service,
      totalPrice: Number(service.totalPrice),
      serviceFee: Number(service.serviceFee),
      stateFee: Number(service.stateFee),
      registeredAgentFee: Number(service.registeredAgentFee),
      rushFee: Number(service.rushFee),
    };

    return NextResponse.json(serviceResponse);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

