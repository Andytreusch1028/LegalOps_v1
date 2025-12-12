/**
 * Feedback API
 * Phase 8: User Authentication System Integration
 *
 * POST /api/feedback - Collect user feedback from FeedbackBeacon components
 * GET /api/feedback - Query feedback data (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequest, validateQueryParams } from '@/lib/middleware/validation';
import { requireAuth, requireRole } from '@/lib/middleware/auth';
import { ServiceFactory } from '@/lib/services/service-factory';

const feedbackSchema = z.object({
  feedbackId: z.string().min(1, 'Feedback ID is required'),
  positive: z.boolean(),
  comment: z.string().max(1000, 'Comment must be 1000 characters or less').optional(),
  url: z.string().url('Invalid URL format'),
});

const getFeedbackQuerySchema = z.object({
  feedbackId: z.string().optional(),
  positive: z.string().transform(val => val === 'true').optional(),
  userId: z.string().optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
});

/**
 * GET /api/feedback - Query feedback data (admin only)
 * Query params:
 * - feedbackId: Filter by specific page/component
 * - positive: Filter by positive/negative (true/false)
 * - userId: Filter by specific user
 * - page: Page number (default: 1)
 * - limit: Number of results per page (default: 50, max: 100)
 * - startDate: Filter feedback after this date
 * - endDate: Filter feedback before this date
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireRole(request, ['ADMIN', 'MANAGER']);
    if (!authResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error.message 
        },
        { status: authResult.error.statusCode }
      );
    }

    // Validate query parameters
    const queryValidation = validateQueryParams(getFeedbackQuerySchema, request.nextUrl.searchParams);
    if (!queryValidation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: queryValidation.error.message,
          details: queryValidation.error.context?.errors 
        },
        { status: queryValidation.error.statusCode }
      );
    }

    const { 
      feedbackId, 
      positive, 
      userId, 
      page = 1, 
      limit = 50,
      startDate,
      endDate
    } = queryValidation.data;

    // Build where clause
    const where: any = {};
    
    if (feedbackId) where.feedbackId = feedbackId;
    if (positive !== undefined) where.positive = positive;
    if (userId) where.userId = userId;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Get prisma client
    const prisma = ServiceFactory.getPrismaClient();

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count and feedback
    const [total, feedback] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              userType: true,
              role: true,
            },
          },
        },
      }),
    ]);

    const hasMore = skip + feedback.length < total;

    // Calculate summary statistics
    const stats = await prisma.feedback.groupBy({
      by: ['positive'],
      where,
      _count: {
        positive: true,
      },
    });

    const summary = {
      total,
      positive: stats.find(s => s.positive === true)?._count.positive || 0,
      negative: stats.find(s => s.positive === false)?._count.positive || 0,
    };

    return NextResponse.json({
      success: true,
      feedback,
      summary,
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch feedback' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feedback - Submit user feedback
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequest(feedbackSchema)(request);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error.message,
          details: validation.error.context?.errors 
        },
        { status: validation.error.statusCode }
      );
    }

    const { feedbackId, positive, comment, url } = validation.data;

    // Try to get authenticated user (optional for feedback)
    let userId: string | null = null;
    let sessionId: string | null = null;

    try {
      const authResult = await requireAuth(request);
      if (authResult.success) {
        userId = authResult.data.user.id;
        sessionId = authResult.data.sessionId;
      }
    } catch {
      // Guest user - continue without authentication
    }

    // Get user agent and IP for spam detection
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      undefined;

    // Get prisma client
    const prisma = ServiceFactory.getPrismaClient();

    // Save feedback to database
    const feedback = await prisma.feedback.create({
      data: {
        feedbackId,
        positive,
        comment,
        url,
        userId,
        sessionId,
        userAgent,
        ipAddress,
      },
    });

    // Log for monitoring
    console.log('Feedback saved:', {
      id: feedback.id,
      feedbackId: feedback.feedbackId,
      positive: feedback.positive,
      userId: feedback.userId || 'guest',
      hasComment: !!feedback.comment,
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback received successfully',
      feedbackId: feedback.id,
    });

  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save feedback' 
      },
      { status: 500 }
    );
  }
}

