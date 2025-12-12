/**
 * Form Completion API
 * Phase 8: User Authentication System Integration
 *
 * Handle form completion - archive draft and extract profile data
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequest } from '@/lib/middleware/validation';
import { requireAuth } from '@/lib/middleware/auth';
import { ServiceFactory } from '@/lib/services/service-factory';

const completeFormSchema = z.object({
  formType: z.string().min(1, 'Form type is required'),
  formData: z.record(z.unknown()),
  extractToProfile: z.boolean().default(true),
  verifyFields: z.array(z.string()).optional(),
});

/**
 * POST /api/forms/complete
 * Mark form as completed, archive draft, and extract data to profile
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
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
    const validation = await validateRequest(completeFormSchema)(request);
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

    const { formType, formData, extractToProfile, verifyFields } = validation.data;

    // Get services
    const prisma = ServiceFactory.getPrismaClient();
    const profileService = ServiceFactory.getProfileService();

    // Archive the draft
    const now = new Date();
    await prisma.formDraft.updateMany({
      where: {
        userId: user.id,
        formType,
        isArchived: false,
      },
      data: {
        isArchived: true,
        completedAt: now,
      },
    });

    // Extract data to profile if requested
    if (extractToProfile) {
      const autoFillData: any = {};

      // Extract personal information
      const personalFields = ['firstName', 'lastName', 'middleName', 'phone', 'alternatePhone'];
      const personalInfo: any = {};
      let hasPersonalInfo = false;

      for (const field of personalFields) {
        if (formData[field]) {
          personalInfo[field] = formData[field];
          hasPersonalInfo = true;
        }
      }

      if (hasPersonalInfo) {
        autoFillData.personalInfo = personalInfo;
      }

      // Extract business information
      const businessFields = [
        'companyName', 'businessTitle', 'industry', 'businessPhone', 
        'businessEmail', 'fein', 'businessType'
      ];
      const businessInfo: any = {};
      let hasBusinessInfo = false;

      for (const field of businessFields) {
        const mappedField = field === 'businessTitle' ? 'title' : field;
        if (formData[field]) {
          businessInfo[mappedField] = formData[field];
          hasBusinessInfo = true;
        }
      }

      if (hasBusinessInfo) {
        autoFillData.businessInfo = businessInfo;
      }

      // Extract address information
      const addresses: any = {};
      let hasAddresses = false;

      // Check for different address types
      const addressTypes = ['personal', 'mailing', 'business', 'principal'];
      for (const addressType of addressTypes) {
        const addressData: any = {};
        const addressFields = ['street', 'street2', 'city', 'state', 'zipCode'];
        let hasAddressData = false;

        for (const field of addressFields) {
          const fullFieldName = `${addressType}${field.charAt(0).toUpperCase() + field.slice(1)}`;
          if (formData[fullFieldName]) {
            addressData[field] = formData[fullFieldName];
            hasAddressData = true;
          }
        }

        if (hasAddressData) {
          // Map principal address to business address
          const mappedType = addressType === 'principal' ? 'business' : addressType;
          addresses[mappedType] = addressData;
          hasAddresses = true;
        }
      }

      if (hasAddresses) {
        autoFillData.addresses = addresses;
      }

      // Save extracted data to profile
      if (Object.keys(autoFillData).length > 0) {
        const saveResult = await profileService.saveAutoFillData(user.id, formType, autoFillData);
        
        if (!saveResult.success) {
          console.warn('Failed to save auto-fill data to profile:', saveResult.error);
        }
      }

      // Verify fields if provided
      if (verifyFields && verifyFields.length > 0) {
        const verifyResult = await profileService.verifyFields(user.id, verifyFields, 'previous-order');
        
        if (!verifyResult.success) {
          console.warn('Failed to verify fields:', verifyResult.error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Form completed successfully',
      archivedDrafts: 1,
      extractedToProfile: extractToProfile,
      verifiedFields: verifyFields || [],
    });

  } catch (error) {
    console.error('Error completing form:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to complete form' 
      },
      { status: 500 }
    );
  }
}