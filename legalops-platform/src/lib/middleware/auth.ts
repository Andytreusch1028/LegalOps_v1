/**
 * Authentication middleware for API routes.
 * Validates session tokens and provides user context.
 */

import { NextRequest } from 'next/server';
import { Result, AppError, err, ok } from '@/lib/types/result';
import { ServiceFactory } from '@/lib/services/service-factory';
import { User } from '@/generated/prisma';

/**
 * Authenticated request context.
 */
export interface AuthContext {
  user: User;
  sessionId: string;
}

/**
 * Validates authentication and returns user context.
 * 
 * @param req - The Next.js request object
 * @returns Result with authenticated user context or error
 * 
 * @example
 * ```typescript
 * export async function GET(req: NextRequest) {
 *   const authResult = await requireAuth(req);
 *   if (!authResult.success) {
 *     return NextResponse.json(
 *       { success: false, error: authResult.error.message },
 *       { status: authResult.error.statusCode }
 *     );
 *   }
 *   
 *   const { user } = authResult.data;
 *   // Use authenticated user...
 * }
 * ```
 */
export async function requireAuth(req: NextRequest): Promise<Result<AuthContext, AppError>> {
  try {
    // Get session token from cookie
    const sessionToken = req.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return err(new AppError(
        'Authentication required',
        'AUTHENTICATION_REQUIRED',
        401
      ));
    }

    // Get authentication service
    const authService = ServiceFactory.getAuthenticationService();

    // Validate session
    const result = await authService.validateSession(sessionToken);

    if (!result.success) {
      return err(new AppError(
        'Invalid or expired session',
        'INVALID_SESSION',
        401
      ));
    }

    const authSession = result.data;

    return ok({
      user: authSession.user,
      sessionId: authSession.id
    });

  } catch (error) {
    return err(new AppError(
      'Authentication validation failed',
      'AUTH_VALIDATION_ERROR',
      500,
      { originalError: error }
    ));
  }
}

/**
 * Validates authentication and checks user role.
 * 
 * @param req - The Next.js request object
 * @param allowedRoles - Array of allowed user roles
 * @returns Result with authenticated user context or error
 * 
 * @example
 * ```typescript
 * export async function DELETE(req: NextRequest) {
 *   const authResult = await requireRole(req, ['ADMIN', 'MANAGER']);
 *   if (!authResult.success) {
 *     return NextResponse.json(
 *       { success: false, error: authResult.error.message },
 *       { status: authResult.error.statusCode }
 *     );
 *   }
 *   
 *   // User has admin or manager role...
 * }
 * ```
 */
export async function requireRole(
  req: NextRequest, 
  allowedRoles: string[]
): Promise<Result<AuthContext, AppError>> {
  const authResult = await requireAuth(req);
  
  if (!authResult.success) {
    return authResult;
  }

  const { user } = authResult.data;

  if (!allowedRoles.includes(user.role)) {
    return err(new AppError(
      'Insufficient permissions',
      'INSUFFICIENT_PERMISSIONS',
      403,
      { userRole: user.role, requiredRoles: allowedRoles }
    ));
  }

  return authResult;
}

/**
 * Validates authentication and checks if user owns the resource.
 * 
 * @param req - The Next.js request object
 * @param resourceUserId - The user ID that owns the resource
 * @returns Result with authenticated user context or error
 * 
 * @example
 * ```typescript
 * export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
 *   const authResult = await requireOwnership(req, params.userId);
 *   if (!authResult.success) {
 *     return NextResponse.json(
 *       { success: false, error: authResult.error.message },
 *       { status: authResult.error.statusCode }
 *     );
 *   }
 *   
 *   // User owns the resource or is admin...
 * }
 * ```
 */
export async function requireOwnership(
  req: NextRequest, 
  resourceUserId: string
): Promise<Result<AuthContext, AppError>> {
  const authResult = await requireAuth(req);
  
  if (!authResult.success) {
    return authResult;
  }

  const { user } = authResult.data;

  // Allow if user owns the resource or is admin
  if (user.id !== resourceUserId && user.role !== 'ADMIN') {
    return err(new AppError(
      'Access denied: You can only access your own resources',
      'ACCESS_DENIED',
      403,
      { userId: user.id, resourceUserId }
    ));
  }

  return authResult;
}