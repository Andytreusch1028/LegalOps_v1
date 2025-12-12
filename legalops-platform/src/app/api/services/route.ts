import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { ServiceFactory } from '@/lib/services/service-factory';
import { createSuccessResponse } from '@/lib/types/api';

const prisma = new PrismaClient();

/**
 * GET /api/services
 * Fetch all active services
 */
export async function GET(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();

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

    const response = createSuccessResponse(servicesResponse);
    return NextResponse.json(response);
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: '/api/services',
      method: 'GET'
    });
    return NextResponse.json(response, { status: 500 });
  }
}

