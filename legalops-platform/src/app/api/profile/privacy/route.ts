import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateRequest } from "@/lib/middleware/validation";
import { requireAuth } from "@/lib/middleware/auth";
import { ServiceFactory } from "@/lib/services/service-factory";

const updatePrivacySchema = z.object({
  allowDataExport: z.boolean().optional(),
  allowMarketing: z.boolean().optional(),
  allowAnalytics: z.boolean().optional(),
  dataRetentionDays: z.number().min(30).max(2555).optional(), // 30 days to 7 years
});

/**
 * PUT /api/profile/privacy - Update privacy preferences
 */
export async function PUT(req: NextRequest) {
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

    // Validate request body
    const validation = await validateRequest(updatePrivacySchema)(req);
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

    const preferences = validation.data;

    // Get profile service
    const profileService = ServiceFactory.getProfileService();

    // Update privacy preferences
    const result = await profileService.updatePrivacyPreferences(user.id, preferences);

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

    return NextResponse.json(
      { 
        success: true,
        message: "Privacy preferences updated successfully"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Update privacy preferences error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}