import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/packages - Get all active packages
 */
export async function GET() {
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

    return NextResponse.json(packagesWithNumbers);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

