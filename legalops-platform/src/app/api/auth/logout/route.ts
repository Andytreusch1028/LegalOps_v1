import { NextRequest, NextResponse } from "next/server";
import { ServiceFactory } from "@/lib/services/service-factory";

export async function POST(req: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = req.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No active session found" 
        },
        { status: 401 }
      );
    }

    // Get authentication service
    const authService = ServiceFactory.getAuthenticationService();

    // Validate session to get session ID
    const sessionResult = await authService.validateSession(sessionToken);
    if (sessionResult.success) {
      // Logout (invalidate session)
      const logoutResult = await authService.logout(sessionResult.data.id);
      
      if (!logoutResult.success) {
        console.error("Logout error:", logoutResult.error);
        // Continue with cookie clearing even if logout fails
      }
    }

    // Clear session cookie
    const response = NextResponse.json(
      { 
        success: true,
        message: "Logout successful" 
      },
      { status: 200 }
    );

    response.cookies.set('session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return response;

  } catch (error) {
    console.error("Logout error:", error);
    
    // Clear cookie even on error
    const response = NextResponse.json(
      { 
        success: true,
        message: "Logout completed" 
      },
      { status: 200 }
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
}