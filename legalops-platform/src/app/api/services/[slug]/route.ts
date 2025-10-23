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

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

