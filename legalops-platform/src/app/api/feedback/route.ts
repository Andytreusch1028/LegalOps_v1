/**
 * Feedback API
 * Phase 7: Smart + Safe Experience Overhaul
 *
 * POST /api/feedback
 * Collect user feedback from FeedbackBeacon components
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface FeedbackRequest {
  feedbackId: string;
  positive: boolean;
  comment?: string;
  timestamp: string;
  url: string;
}

/**
 * GET /api/feedback
 * Query params:
 * - feedbackId: Filter by specific page/component
 * - positive: Filter by positive/negative (true/false)
 * - limit: Number of results (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get('feedbackId');
    const positive = searchParams.get('positive');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (feedbackId) where.feedbackId = feedbackId;
    if (positive !== null) where.positive = positive === 'true';

    const feedback = await prisma.feedback.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: feedback.length,
      feedback,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feedback
 */
export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();

    // Validate required fields
    if (!body.feedbackId || typeof body.positive !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: feedbackId, positive' },
        { status: 400 }
      );
    }

    // Get current user session (if logged in)
    const session = await getServerSession(authOptions);

    // Get user agent and IP for spam detection
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      undefined;

    // Save feedback to database
    const feedback = await prisma.feedback.create({
      data: {
        feedbackId: body.feedbackId,
        positive: body.positive,
        comment: body.comment,
        url: body.url,
        userId: session?.user?.id || null,
        userAgent,
        ipAddress,
        createdAt: new Date(body.timestamp),
      },
    });

    // Log for monitoring
    console.log('Feedback saved:', {
      id: feedback.id,
      feedbackId: feedback.feedbackId,
      positive: feedback.positive,
      userId: feedback.userId || 'guest',
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback received',
      feedbackId: feedback.id,
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}

