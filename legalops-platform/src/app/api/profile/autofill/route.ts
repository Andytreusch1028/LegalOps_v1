import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateRequest } from "@/lib/middleware/validation";
import { requireAuth } from "@/lib/middleware/auth";
import { ServiceFactory } from "@/lib/services/service-factory";

const addressSchema = z.object({
  street: z.string(),
  street2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
});

const saveAutoFillSchema = z.object({
  formType: z.string().min(1, "Form type is required"),
  data: z.object({
    personalInfo: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      middleName: z.string().optional(),
      phone: z.string().optional(),
      alternatePhone: z.string().optional(),
    }).optional(),
    addresses: z.object({
      personal: addressSchema.optional(),
      mailing: addressSchema.optional(),
      business: addressSchema.optional(),
    }).optional(),
    businessInfo: z.object({
      companyName: z.string().optional(),
      title: z.string().optional(),
      industry: z.string().optional(),
      businessPhone: z.string().optional(),
      businessEmail: z.string().optional(),
      fein: z.string().optional(),
      businessType: z.string().optional(),
    }).optional(),
  }),
  verifyFields: z.array(z.string()).optional(),
});

/**
 * POST /api/profile/autofill - Save auto-fill data from a form
 */
export async function POST(req: NextRequest) {
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
    const validation = await validateRequest(saveAutoFillSchema)(req);
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

    const { formType, data, verifyFields } = validation.data;

    // Get profile service
    const profileService = ServiceFactory.getProfileService();

    // Save auto-fill data
    const saveResult = await profileService.saveAutoFillData(user.id, formType, data);

    if (!saveResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: saveResult.error.message,
          code: saveResult.error.code
        },
        { status: saveResult.error.statusCode }
      );
    }

    // Verify fields if provided
    if (verifyFields && verifyFields.length > 0) {
      const verifyResult = await profileService.verifyFields(user.id, verifyFields, 'user-profile');
      
      if (!verifyResult.success) {
        console.warn("Failed to verify fields:", verifyResult.error);
        // Don't fail the request if verification fails
      }
    }

    return NextResponse.json(
      { 
        success: true,
        message: "Auto-fill data saved successfully",
        verifiedFields: verifyFields || []
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Save auto-fill data error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}