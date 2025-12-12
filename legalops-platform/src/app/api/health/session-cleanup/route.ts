/**
 * Session Cleanup Health Check API
 * 
 * Provides health check endpoint for monitoring the session cleanup service.
 * Used by monitoring systems and load balancers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionCleanupStatus } from '@/lib/startup/session-cleanup-startup';
import { ServiceFactory } from '@/lib/services/service-factory';

/**
 * GET /api/health/session-cleanup
 * Get session cleanup service health status
 */
export async function GET(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();

  try {
    const status = getSessionCleanupStatus();
    
    // Determine overall health
    const isHealthy = status.isRunning && status.status === 'running';
    const httpStatus = isHealthy ? 200 : 503; // Service Unavailable if not healthy

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'session-cleanup',
      timestamp: new Date().toISOString(),
      details: {
        isRunning: status.isRunning,
        jobStatus: status.status,
        health: status.health,
        lastAnalytics: status.analytics ? {
          totalActiveSessions: status.analytics.totalActiveSessions,
          expiredSessionsCleanedUp: status.analytics.expiredSessionsCleanedUp,
          suspiciousSessionsDetected: status.analytics.suspiciousSessionsDetected,
          sessionsRotated: status.analytics.sessionsRotated,
          securityAlertsGenerated: status.analytics.securityAlertsGenerated
        } : null
      }
    }, { status: httpStatus });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: 'GET /api/health/session-cleanup',
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json(response, { status: response.statusCode });
  }
}