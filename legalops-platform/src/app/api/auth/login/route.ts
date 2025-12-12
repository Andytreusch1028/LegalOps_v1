import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateRequest } from "@/lib/middleware/validation";
import { ServiceFactory } from "@/lib/services/service-factory";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequest(loginSchema)(req);
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

    const { email, password } = validation.data;

    // Get session metadata
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Get authentication service
    const authService = ServiceFactory.getAuthenticationService();

    // Authenticate user
    const result = await authService.login(email, password, {
      ipAddress,
      userAgent
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error.message,
          code: result.error.code
        },
        { status: result.error.statusCode }
      );
    }

    const authSession = result.data;
    const { user, ...session } = authSession;

    // Build user response without sensitive fields
    const { 
      passwordHash, 
      emailVerificationToken, 
      passwordResetToken, 
      ...userResponse 
    } = user;

    // Set session cookie
    const response = NextResponse.json(
      { 
        success: true,
        message: "Login successful", 
        user: userResponse,
        session: {
          id: session.id,
          expiresAt: session.expiresAt
        }
      },
      { status: 200 }
    );

    // Set HTTP-only session cookie
    response.cookies.set('session-token', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}