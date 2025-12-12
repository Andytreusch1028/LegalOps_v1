/**
 * Resend Email Verification API Route
 * 
 * POST /api/auth/resend-verification
 * Resends email verification for unverified accounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ServiceFactory } from '@/lib/services/service-factory';
import { withSecurityMiddleware } from '@/lib/middleware/security-composer';

/**
 * Request validation schema
 */
const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address')
});

/**
 * Resend email verification
 */
async function resendVerificationHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = resendVerificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Get authentication service
    const authService = ServiceFactory.getAuthenticationService();

    // Resend verification email
    const result = await authService.resendEmailVerification(email);

    if (!result.success) {
      const error = result.error;
      
      // Handle specific error cases
      if (error.code === 'USER_NOT_FOUND') {
        return NextResponse.json(
          { error: 'No account found with this email address' },
          { status: 404 }
        );
      }

      if (error.code === 'EMAIL_ALREADY_VERIFIED') {
        return NextResponse.json(
          { error: 'Email is already verified' },
          { status: 400 }
        );
      }

      // Generic error response
      return NextResponse.json(
        { error: error.message || 'Failed to resend verification email' },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification email sent successfully',
      email
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler with security middleware
 */
export const POST = withSecurityMiddleware(
  resendVerificationHandler,
  {
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 3, // Max 3 verification emails per 15 minutes
      keyGenerator: (req) => {
        // Rate limit by IP address
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
        return `resend-verification:${ip}`;
      }
    },
    csrfProtection: true,
    securityHeaders: true,
    auditLogging: {
      action: 'resend_email_verification',
      category: 'authentication'
    }
  }
);