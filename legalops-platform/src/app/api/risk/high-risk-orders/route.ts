/**
 * API Route: /api/risk/high-risk-orders
 * 
 * Get list of high-risk orders requiring review
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const riskLevel = searchParams.get('riskLevel'); // Filter by risk level
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Record<string, unknown> = {
      requiresReview: true
    };

    if (riskLevel && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(riskLevel)) {
      where.riskLevel = riskLevel;
    }

    // Get high-risk orders
    const assessments = await prisma.riskAssessment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            orderStatus: true,
            total: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count
    const totalCount = await prisma.riskAssessment.count({ where });

    return NextResponse.json({
      success: true,
      assessments,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching high-risk orders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch high-risk orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/risk/high-risk-orders
 * 
 * Update review status for a risk assessment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, reviewDecision, reviewNotes, reviewedBy } = body;

    if (!assessmentId || !reviewDecision || !reviewedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: assessmentId, reviewDecision, reviewedBy' },
        { status: 400 }
      );
    }

    // Validate review decision
    if (!['APPROVED', 'DECLINED', 'VERIFIED', 'MONITORING'].includes(reviewDecision)) {
      return NextResponse.json(
        { error: 'Invalid reviewDecision. Must be: APPROVED, DECLINED, VERIFIED, or MONITORING' },
        { status: 400 }
      );
    }

    // Update risk assessment
    const updatedAssessment = await prisma.riskAssessment.update({
      where: { id: assessmentId },
      data: {
        reviewedAt: new Date(),
        reviewedBy,
        reviewDecision,
        reviewNotes,
        requiresReview: false // Mark as reviewed
      },
      include: {
        order: true
      }
    });

    // Update order status based on decision
    if (reviewDecision === 'DECLINED') {
      await prisma.order.update({
        where: { id: updatedAssessment.orderId },
        data: {
          orderStatus: 'CANCELLED',
          requiresReview: false,
          reviewedAt: new Date(),
          reviewedBy
        }
      });
    } else if (reviewDecision === 'APPROVED' || reviewDecision === 'VERIFIED') {
      await prisma.order.update({
        where: { id: updatedAssessment.orderId },
        data: {
          requiresReview: false,
          reviewedAt: new Date(),
          reviewedBy
        }
      });
    }

    return NextResponse.json({
      success: true,
      assessment: updatedAssessment
    });

  } catch (error) {
    console.error('Error updating risk assessment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update risk assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

