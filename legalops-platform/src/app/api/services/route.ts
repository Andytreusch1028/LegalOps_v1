import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

/**
 * GET /api/services
 * Fetch all active services
 */
export async function GET(request: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        orderType: true,
        shortDescription: true,
        totalPrice: true,
        serviceFee: true,
        stateFee: true,
        icon: true,
        isPopular: true,
        isFeatured: true,
        processingTime: true,
        category: true,
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const servicesResponse = services.map(service => ({
      ...service,
      totalPrice: Number(service.totalPrice),
      serviceFee: Number(service.serviceFee),
      stateFee: Number(service.stateFee),
    }));

    return NextResponse.json(servicesResponse);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

