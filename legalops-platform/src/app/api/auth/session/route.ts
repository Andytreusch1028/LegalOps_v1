import { NextRequest, NextResponse } from "next/server";
import { ServiceFactory } from "@/lib/services/service-factory";

export async function GET(req: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = req.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: "No session found" 
        },
        { status: 401 }
      );
    }

    // Get authentication service
    const authService = ServiceFactory.getAuthenticationService();

    // Validate session
    const result = await authService.validateSession(sessionToken);

    if (!result.success) {
      // Clear invalid session cookie
      const response = NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: "Invalid session" 
        },
        { status: 401 }
      );

      response.cookies.set('session-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });

      return response;
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

    return NextResponse.json(
      { 
        success: true,
        authenticated: true,
        user: userResponse,
        session: {
          id: session.id,
          expiresAt: session.expiresAt,
          lastAccessedAt: session.lastAccessedAt
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        authenticated: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}