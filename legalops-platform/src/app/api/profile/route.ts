import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateRequest } from "@/lib/middleware/validation";
import { requireAuth } from "@/lib/middleware/auth";
import { ServiceFactory } from "@/lib/services/service-factory";

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required").max(2, "State must be 2 characters"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid zip code format"),
});

const updateProfileSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    middleName: z.string().max(100).optional(),
    dateOfBirth: z.string().transform(str => new Date(str)).optional(),
    ssn: z.string().regex(/^\d{3}-?\d{2}-?\d{4}$/, "Invalid SSN format").optional(),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone format").optional(),
    alternatePhone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone format").optional(),
  }).optional(),
  addresses: z.object({
    personal: addressSchema.optional(),
    mailing: addressSchema.optional(),
    business: addressSchema.optional(),
  }).optional(),
  businessInfo: z.object({
    companyName: z.string().max(200).optional(),
    title: z.string().max(100).optional(),
    industry: z.string().max(100).optional(),
    businessPhone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone format").optional(),
    businessEmail: z.string().email("Invalid email format").optional(),
    fein: z.string().regex(/^\d{2}-?\d{7}$/, "Invalid FEIN format").optional(),
    businessType: z.string().max(50).optional(),
  }).optional(),
  autoFillPreferences: z.object({
    enableAutoFill: z.boolean().optional(),
    verifiedFields: z.array(z.string()).optional(),
  }).optional(),
  privacySettings: z.object({
    allowDataExport: z.boolean().optional(),
    allowMarketing: z.boolean().optional(),
    allowAnalytics: z.boolean().optional(),
    dataRetentionDays: z.number().min(30).max(2555).optional(), // 30 days to 7 years
  }).optional(),
});

/**
 * GET /api/profile - Get user profile
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

    // Get user profile
    const result = await profileService.getProfile(user.id);

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

    const profile = result.data;

    // Get profile completion percentage
    const completionResult = await profileService.getProfileCompletionPercentage(user.id);
    const completionPercentage = completionResult.success ? completionResult.data : 0;

    return NextResponse.json(
      { 
        success: true,
        profile,
        completionPercentage
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile - Update user profile
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
    const validation = await validateRequest(updateProfileSchema)(req);
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

    const profileData = validation.data;

    // Get profile service
    const profileService = ServiceFactory.getProfileService();

    // Update profile
    const result = await profileService.updateProfile(user.id, profileData);

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

    const profile = result.data;

    // Get updated completion percentage
    const completionResult = await profileService.getProfileCompletionPercentage(user.id);
    const completionPercentage = completionResult.success ? completionResult.data : 0;

    return NextResponse.json(
      { 
        success: true,
        message: "Profile updated successfully",
        profile,
        completionPercentage
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile - Delete user profile (GDPR compliance)
 */
export async function DELETE(req: NextRequest) {
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

    // Delete profile
    const result = await profileService.deleteProfile(user.id);

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
        message: "Profile deleted successfully" 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete profile error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}