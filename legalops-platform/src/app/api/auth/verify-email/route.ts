import { NextRequest, NextResponse } from "next/server";
import { ServiceFactory } from "@/lib/services/service-factory";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          error: "Verification token is required" 
        },
        { status: 400 }
      );
    }

    // Get authentication service
    const authService = ServiceFactory.getAuthenticationService();

    // Verify email
    const result = await authService.verifyEmail(token);

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

    const user = result.data;

    // Send welcome email
    const emailService = ServiceFactory.getEmailService();
    await emailService.sendWelcomeEmail(user.email, user.firstName || 'User');

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! Welcome to LegalOps.",
    });

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

