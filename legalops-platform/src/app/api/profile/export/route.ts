import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { ServiceFactory } from "@/lib/services/service-factory";

/**
 * GET /api/profile/export - Export all user data (GDPR compliance)
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

    // Export user data
    const result = await profileService.exportUserData(user.id);

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

    const exportData = result.data;

    // Set headers for file download
    const response = NextResponse.json(exportData, { status: 200 });
    
    response.headers.set(
      'Content-Disposition', 
      `attachment; filename="legalops-data-export-${user.id}-${new Date().toISOString().split('T')[0]}.json"`
    );
    response.headers.set('Content-Type', 'application/json');

    return response;

  } catch (error) {
    console.error("Export user data error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}