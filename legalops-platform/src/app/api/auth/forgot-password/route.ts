import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateRequest } from "@/lib/middleware/validation";
import { ServiceFactory } from "@/lib/services/service-factory";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequest(forgotPasswordSchema)(req);
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

    const { email } = validation.data;

    // Get authentication service
    const authService = ServiceFactory.getAuthenticationService();

    // Request password reset
    const result = await authService.requestPasswordReset(email);

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

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json(
      { 
        success: true,
        message: "If an account with that email exists, we've sent a password reset link." 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}