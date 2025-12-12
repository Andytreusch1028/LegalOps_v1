/**
 * Admin Account Unlock API Route
 * 
 * POST /api/admin/unlock-account
 * Unlocks a user account (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ServiceFactory } from '@/lib/services/service-factory';
import { withSecurityMiddleware } from '@/lib/middleware/security-composer';
import { withAuth } from '@/lib/middleware/auth';

/**
 * Request validation schema
 */
const unlockAccountSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
});

/**
 * Unlock user account (admin only)
 */
async function unlockAccountHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = unlockAccountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { userId } = validation.data;

    // Get authentication service
    const authService = ServiceFactory.getAuthenticationService();

    // Unlock account
    const result = await authService.unlockAccount(userId);

    if (!result.success) {
      const error = result.error;
      
      // Handle specific error cases
      if (error.code === 'USER_NOT_FOUND') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Generic error response
      return NextResponse.json(
        { error: error.message || 'Failed to unlock account' },
        { status: error.statusCode || 500 }
      );
    }

    const unlockedUser = result.data;

    return NextResponse.json({
      message: 'Account unlocked successfully',
      user: {
        id: unlockedUser.id,
        email: unlockedUser.email,
        firstName: unlockedUser.firstName,
        lastName: unlockedUser.lastName,
        emailVerified: unlockedUser.emailVerified,
        loginAttempts: unlockedUser.loginAttempts,
        lockedUntil: unlockedUser.lockedUntil,
        lastLoginAt: unlockedUser.lastLoginAt
      }
    });

  } catch (error) {
    console.error('Account unlock error:', error);
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
    unlockAccountHandler,
    {
      rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 20, // Max 20 unlock operations per 15 minutes
        keyGenerator: (req) => {
          // Rate limit by admin user
          const userId = (req as any).user?.id || 'unknown';
          return `unlock-account:${userId}`;
        }
      },
      csrfProtection: true,
      securityHeaders: true,
      auditLogging: {
        action: 'admin_unlock_account',
        category: 'admin_action'
      }
    }
  ),
  {
    requireAdmin: true // Only admin users can unlock accounts
  }
);