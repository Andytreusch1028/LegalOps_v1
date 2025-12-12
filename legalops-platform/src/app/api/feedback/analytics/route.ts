/**
 * Feedback Analytics API
 * Phase 8: User Authentication System Integration
 *
 * GET /api/feedback/analytics - Get feedback analytics and insights (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateQueryParams } from '@/lib/middleware/validation';
import { requireRole } from '@/lib/middleware/auth';
import { ServiceFactory } from '@/lib/services/service-factory';

const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
});

/**
 * GET /api/feedback/analytics - Get feedback analytics (admin only)
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
    const queryValidation = validateQueryParams(analyticsQuerySchema, request.nextUrl.searchParams);
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

    const { period = '30d', groupBy = 'day' } = queryValidation.data;

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get prisma client
    const prisma = ServiceFactory.getPrismaClient();

    // Get overall statistics
    const [
      totalFeedback,
      positiveFeedback,
      negativeFeedback,
      feedbackWithComments,
      authenticatedFeedback,
      guestFeedback
    ] = await Promise.all([
      prisma.feedback.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.feedback.count({
        where: { 
          createdAt: { gte: startDate },
          positive: true 
        }
      }),
      prisma.feedback.count({
        where: { 
          createdAt: { gte: startDate },
          positive: false 
        }
      }),
      prisma.feedback.count({
        where: { 
          createdAt: { gte: startDate },
          comment: { not: null }
        }
      }),
      prisma.feedback.count({
        where: { 
          createdAt: { gte: startDate },
          userId: { not: null }
        }
      }),
      prisma.feedback.count({
        where: { 
          createdAt: { gte: startDate },
          userId: null
        }
      })
    ]);

    // Get feedback by page/component
    const feedbackByPage = await prisma.feedback.groupBy({
      by: ['feedbackId'],
      where: { createdAt: { gte: startDate } },
      _count: {
        feedbackId: true,
      },
      _avg: {
        positive: true,
      },
      orderBy: {
        _count: {
          feedbackId: 'desc',
        },
      },
      take: 10,
    });

    // Get time series data
    let dateFormat: string;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    // Note: This is a simplified version. In production, you might want to use raw SQL
    // for more complex date grouping operations
    const timeSeriesData = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(createdAt, ${dateFormat}) as period,
        COUNT(*) as total,
        SUM(CASE WHEN positive = true THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN positive = false THEN 1 ELSE 0 END) as negative
      FROM feedback 
      WHERE createdAt >= ${startDate}
      GROUP BY DATE_FORMAT(createdAt, ${dateFormat})
      ORDER BY period ASC
    ` as any[];

    // Get recent negative feedback with comments for review
    const recentNegativeFeedback = await prisma.feedback.findMany({
      where: {
        createdAt: { gte: startDate },
        positive: false,
        comment: { not: null },
      },
      select: {
        id: true,
        feedbackId: true,
        comment: true,
        url: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate satisfaction score (percentage of positive feedback)
    const satisfactionScore = totalFeedback > 0 
      ? Math.round((positiveFeedback / totalFeedback) * 100) 
      : 0;

    return NextResponse.json({
      success: true,
      period,
      analytics: {
        overview: {
          totalFeedback,
          positiveFeedback,
          negativeFeedback,
          satisfactionScore,
          feedbackWithComments,
          authenticatedFeedback,
          guestFeedback,
        },
        feedbackByPage: feedbackByPage.map(item => ({
          feedbackId: item.feedbackId,
          count: item._count.feedbackId,
          satisfactionScore: Math.round((item._avg.positive || 0) * 100),
        })),
        timeSeries: timeSeriesData,
        recentNegativeFeedback,
      },
    });

  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch feedback analytics' 
      },
      { status: 500 }
    );
  }
}