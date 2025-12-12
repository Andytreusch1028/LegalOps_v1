import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { ServiceFactory } from "@/lib/services/service-factory";

/**
 * GET /api/profile/autofill/[formType] - Get auto-fill data for a form type
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { formType: string } }
) {
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
    const { formType } = params;

    // Validate form type
    const validFormTypes = [
      'llc-formation',
      'corp-formation',
      'annual-report',
      'dba-registration',
      'amendment',
      'dissolution'
    ];

    if (!validFormTypes.includes(formType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid form type" 
        },
        { status: 400 }
      );
    }

    // Get profile service
    const profileService = ServiceFactory.getProfileService();

    // Get auto-fill data
    const result = await profileService.getAutoFillData(user.id, formType);

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

    const autoFillData = result.data;

    // Get verified fields
    const verifiedResult = await profileService.getVerifiedFields(user.id);
    const verifiedFields = verifiedResult.success ? verifiedResult.data : [];

    return NextResponse.json(
      { 
        success: true,
        formType,
        autoFillData,
        verifiedFields
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Get auto-fill data error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}