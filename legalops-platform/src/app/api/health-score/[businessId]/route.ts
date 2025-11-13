/**
 * LegalOps v1 - Business Health Score API
 * 
 * GET /api/health-score/[businessId] - Calculate and return health score
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculateHealthScore, updateHealthScore } from '@/lib/healthScore';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { businessId } = await params;

    // Verify user owns this business
    const business = await prisma.businessEntity.findUnique({
      where: { id: businessId },
      include: {
        client: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    if (business.client.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - not your business' },
        { status: 403 }
      );
    }

    // Calculate health score with full breakdown
    const breakdown = await calculateHealthScore(businessId);

    return NextResponse.json({
      success: true,
      businessId,
      healthScore: breakdown.totalScore,
      breakdown
    });

  } catch (error: any) {
    console.error('Error calculating health score:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate health score' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/health-score/[businessId] - Update and save health score to database
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { businessId } = await params;

    // Verify user owns this business
    const business = await prisma.businessEntity.findUnique({
      where: { id: businessId },
      include: {
        client: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    if (business.client.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - not your business' },
        { status: 403 }
      );
    }

    // Update health score in database
    const score = await updateHealthScore(businessId);

    return NextResponse.json({
      success: true,
      businessId,
      healthScore: score,
      message: 'Health score updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating health score:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update health score' },
      { status: 500 }
    );
  }
}

