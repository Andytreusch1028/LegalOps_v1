import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ServiceFactory } from '@/lib/services/service-factory';
import { createSuccessResponse } from '@/lib/types/api';

/**
 * GET /api/packages - Get all active packages
 */
export async function GET() {
  const errorHandler = ServiceFactory.getErrorHandler();

  try {
    const packages = await prisma.package.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const packagesWithNumbers = packages.map(pkg => ({
      ...pkg,
      price: Number(pkg.price),
    }));

    const response = createSuccessResponse(packagesWithNumbers);
    return NextResponse.json(response);
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: '/api/packages',
      method: 'GET'
    });
    return NextResponse.json(response, { status: 500 });
  }
}

