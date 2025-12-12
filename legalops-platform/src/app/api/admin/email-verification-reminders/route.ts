/**
 * Admin Email Verification Reminders API Route
 * 
 * POST /api/admin/email-verification-reminders - Execute reminder job
 * GET /api/admin/email-verification-reminders - Get reminder statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ServiceFactory } from '@/lib/services/service-factory';
import { EmailVerificationReminderJob } from '@/lib/jobs/email-verification-reminder.job';
import { withSecurityMiddleware } from '@/lib/middleware/security-composer';
import { withAuth } from '@/lib/middleware/auth';

/**
 * Request validation schema for POST
 */
const executeReminderJobSchema = z.object({
  action: z.enum(['send_reminders', 'cleanup_expired']),
  dryRun: z.boolean().optional().default(false)
});

/**
 * Execute email verification reminder job (admin only)
 */
async function executeReminderJobHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = executeReminderJobSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { action, dryRun } = validation.data;

    // Get services
    const logger = ServiceFactory.getLogger();
    const userRepository = ServiceFactory.getUserRepository();
    const authEmailService = ServiceFactory.getAuthEmailService();

    const reminderJob = new EmailVerificationReminderJob(
      logger,
      userRepository,
      authEmailService
    );

    let result;

    if (action === 'send_reminders') {
      if (dryRun) {
        // For dry run, we would need to implement a separate method
        // that counts what would be processed without actually sending emails
        return NextResponse.json({
          message: 'Dry run mode not yet implemented',
          action
        });
      } else {
        result = await reminderJob.execute();
      }
    } else if (action === 'cleanup_expired') {
      result = await reminderJob.cleanupExpiredTokens();
    }

    if (!result || !result.success) {
      const error = result?.error;
      return NextResponse.json(
        { error: error?.message || 'Job execution failed' },
        { status: error?.statusCode || 500 }
      );
    }

    return NextResponse.json({
      message: `${action} completed successfully`,
      action,
      dryRun,
      result: result.data
    });

  } catch (error) {
    console.error('Email verification reminder job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get email verification reminder statistics (admin only)
 */
async function getReminderStatsHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user repository
    const userRepository = ServiceFactory.getUserRepository();

    // Calculate date ranges
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // For now, return placeholder statistics
    // In a real implementation, you would add repository methods to get these counts
    const stats = {
      totalUnverifiedUsers: 0, // Would need userRepository.countUnverifiedUsers()
      usersNeedingFirstReminder: 0, // Would need userRepository.countUsersNeedingFirstReminder()
      usersNeedingSecondReminder: 0, // Would need userRepository.countUsersNeedingSecondReminder()
      expiredTokens: 0, // Would need userRepository.countExpiredVerificationTokens()
      recentRegistrations: {
        last24Hours: 0, // Would need userRepository.countRecentRegistrations(oneDayAgo)
        last3Days: 0, // Would need userRepository.countRecentRegistrations(threeDaysAgo)
        lastWeek: 0 // Would need userRepository.countRecentRegistrations(oneWeekAgo)
      },
      remindersSent: {
        firstReminders: 0, // Would need userRepository.countFirstRemindersSent()
        secondReminders: 0 // Would need userRepository.countSecondRemindersSent()
      }
    };

    return NextResponse.json({
      message: 'Email verification reminder statistics',
      statistics: stats,
      note: 'Detailed statistics require additional repository methods to be implemented'
    });

  } catch (error) {
    console.error('Get reminder stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler with authentication and security middleware
 */
export const POST = withAuth(
  withSecurityMiddleware(
    executeReminderJobHandler,
    {
      rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // Max 5 job executions per 15 minutes
        keyGenerator: (req) => {
          const userId = (req as any).user?.id || 'unknown';
          return `email-reminder-job:${userId}`;
        }
      },
      csrfProtection: true,
      securityHeaders: true,
      auditLogging: {
        action: 'admin_email_verification_reminder_job',
        category: 'admin_action'
      }
    }
  ),
  {
    requireAdmin: true
  }
);

/**
 * GET handler with authentication and security middleware
 */
export const GET = withAuth(
  withSecurityMiddleware(
    getReminderStatsHandler,
    {
      rateLimiting: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 20, // Max 20 stats requests per 5 minutes
        keyGenerator: (req) => {
          const userId = (req as any).user?.id || 'unknown';
          return `email-reminder-stats:${userId}`;
        }
      },
      securityHeaders: true
    }
  ),
  {
    requireAdmin: true
  }
);