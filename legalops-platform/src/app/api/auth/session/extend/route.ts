/**
 * Session Extension API Route
 * 
 * POST /api/auth/session/extend
 * Extends the current user session
 */

import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/lib/services/service-factory';
import { withSecurityMiddleware } from '@/lib/middleware/security-composer';
import { withAuth } from '@/lib/middleware/auth';

/**
 * Extend user session
 */
async function extendSessionHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user from middleware
    const user = (request as any).user;
    const sessionId = (request as any).sessionId;

    if (!user || !sessionId) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 401 }
      );
    }

    // Get session service
    const sessionService = ServiceFactory.getSessionService();

    // Extend the session
    const result = await sessionService.extendSession(sessionId);

    if (!result.success) {
      const error = result.error;
      return NextResponse.json(
        { error: error.message || 'Failed to extend session' },
        { status: error.statusCode || 500 }
      );
    }

    const extendedSession = result.data;

    return NextResponse.json({
      message: 'Session extended successfully',
      sessionId: extendedSession.id,
      expiresAt: extendedSession.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Session extension error:', error);
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
    extendSessionHandler,
    {
      rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10, // Max 10 session extensions per 15 minutes
        keyGenerator: (req) => {
          const userId = (req as any).user?.id || 'unknown';
          return `extend-session:${userId}`;
        }
      },
      csrfProtection: true,
      securityHeaders: true,
      auditLogging: {
        action: 'extend_session',
        category: 'authentication'
      }
    }
  ),
  {
    requireAuth: true
  }
);