import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { ServiceFactory } from "@/lib/services/service-factory";

/**
 * GET /api/profile/suggestions - Get profile improvement suggestions
 */
export async function GET(req: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error.message 
        },
        { status: authResult.error.statusCode }
      );
    }

    const { user } = authResult.data;

    // Get profile service
    const profileService = ServiceFactory.getProfileService();

    // Get profile suggestions
    const result = await profileService.getProfileSuggestions(user.id);

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

    const suggestions = result.data;

    // Get completion percentage for context
    const completionResult = await profileService.getProfileCompletionPercentage(user.id);
    const completionPercentage = completionResult.success ? completionResult.data : 0;

    return NextResponse.json(
      { 
        success: true,
        suggestions,
        completionPercentage
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Get profile suggestions error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}