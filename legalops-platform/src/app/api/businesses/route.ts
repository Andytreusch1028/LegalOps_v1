import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

/**
 * GET /api/businesses
 * Get all businesses for the logged-in user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all businesses for this user through their Client records
    const businesses = await prisma.businessEntity.findMany({
      where: {
        client: {
          userId: session.user.id
        }
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        addresses: true,
        registeredAgent: true,
        managersOfficers: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      businesses
    });

  } catch (error: any) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}

