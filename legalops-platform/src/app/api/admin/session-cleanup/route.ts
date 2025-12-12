/**
 * Session Cleanup Job Management API
 * 
 * Provides endpoints for managing and monitoring the session cleanup background job.
 * Admin-only endpoints for starting, stopping, and monitoring the cleanup service.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionCleanupJob, JobStatus } from '@/lib/jobs/session-cleanup.job';
import { ServiceFactory } from '@/lib/services/service-factory';
import { withAuth } from '@/lib/middleware/auth';

/**
 * GET /api/admin/session-cleanup
 * Get session cleanup job status and health information
 */
export async function GET(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();

  try {
    // Check if user is admin (this would be handled by middleware in a real app)
    const authResult = await withAuth(request, { requireAdmin: true });
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin access required' },
        { status: 401 }
      );
    }

    // Get job health and analytics
    const health = sessionCleanupJob.getHealth();
    const analytics = sessionCleanupJob.getLastAnalytics();

    return NextResponse.json({
      success: true,
      data: {
        health,
        analytics,
        isRunning: sessionCleanupJob.isRunning(),
        status: sessionCleanupJob.getStatus()
      }
    });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: 'GET /api/admin/session-cleanup',
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json(response, { status: response.statusCode });
  }
}

/**
 * POST /api/admin/session-cleanup
 * Start, stop, restart, or trigger manual cleanup
 */
export async function POST(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();

  try {
    // Check if user is admin
    const authResult = await withAuth(request, { requireAdmin: true });
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Action is required' },
        { status: 400 }
      );
    }

    let result;
    let message;

    switch (action.toLowerCase()) {
      case 'start':
        result = await sessionCleanupJob.start();
        message = 'Session cleanup job started successfully';
        break;

      case 'stop':
        result = await sessionCleanupJob.stop();
        message = 'Session cleanup job stopped successfully';
        break;

      case 'restart':
        result = await sessionCleanupJob.restart();
        message = 'Session cleanup job restarted successfully';
        break;

      case 'trigger':
      case 'manual':
        result = await sessionCleanupJob.triggerCleanup();
        message = 'Manual cleanup cycle triggered successfully';
        break;

      default:
        return NextResponse.json(
          { 
            error: 'INVALID_ACTION', 
            message: 'Invalid action. Supported actions: start, stop, restart, trigger' 
          },
          { status: 400 }
        );
    }

    if (result.isFailure()) {
      return NextResponse.json(
        { 
          error: 'OPERATION_FAILED', 
          message: result.error.message 
        },
        { status: 500 }
      );
    }

    // Get updated health information
    const health = sessionCleanupJob.getHealth();
    const analytics = action === 'trigger' ? result.value : sessionCleanupJob.getLastAnalytics();

    return NextResponse.json({
      success: true,
      message,
      data: {
        health,
        analytics,
        isRunning: sessionCleanupJob.isRunning(),
        status: sessionCleanupJob.getStatus()
      }
    });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: 'POST /api/admin/session-cleanup',
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json(response, { status: response.statusCode });
  }
}