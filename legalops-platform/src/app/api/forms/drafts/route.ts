/**
 * Smart Forms API - Form Drafts
 * Phase 8: User Authentication System Integration
 *
 * Persist and retrieve form drafts for Smart Forms auto-fill
 * GET: Retrieve saved draft
 * POST: Save form draft
 * DELETE: Delete form draft
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequest, validateQueryParams } from '@/lib/middleware/validation';
import { requireAuth } from '@/lib/middleware/auth';
import { ServiceFactory } from '@/lib/services/service-factory';

const getDraftQuerySchema = z.object({
  formType: z.string().min(1, 'Form type is required'),
});

/**
 * GET /api/forms/drafts?formType=xxx
 * Retrieve saved form draft for current user
 */
export async function GET(request: NextRequest) {
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

    // Validate query parameters
    const queryValidation = validateQueryParams(getDraftQuerySchema, request.nextUrl.searchParams);
    if (!queryValidation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: queryValidation.error.message,
          details: queryValidation.error.context?.errors 
        },
        { status: queryValidation.error.statusCode }
      );
    }

    const { formType } = queryValidation.data;

    // Get form draft repository through service factory
    const prisma = ServiceFactory.getPrismaClient();
    
    // Find the most recent draft for this user and form type
    const draft = await prisma.formDraft.findFirst({
      where: {
        userId: user.id,
        formType,
        isArchived: false,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!draft) {
      return NextResponse.json({
        success: true,
        draft: null,
      });
    }

    // Get auto-fill data from profile if available
    const profileService = ServiceFactory.getProfileService();
    const autoFillResult = await profileService.getAutoFillData(user.id, formType);
    const autoFillData = autoFillResult.success ? autoFillResult.data : null;

    return NextResponse.json({
      success: true,
      draft: {
        id: draft.id,
        formType: draft.formType,
        formData: draft.formData,
        currentStep: draft.currentStep,
        totalSteps: draft.totalSteps,
        displayName: draft.displayName,
        autoFillSource: draft.autoFillSource,
        verifiedFields: draft.verifiedFields,
        savedAt: draft.updatedAt.toISOString(),
      },
      autoFillData,
    });

  } catch (error) {
    console.error('Error retrieving form draft:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve form draft' 
      },
      { status: 500 }
    );
  }
}

const saveDraftSchema = z.object({
  formType: z.string().min(1, 'Form type is required'),
  formData: z.record(z.unknown()),
  currentStep: z.number().min(1).optional(),
  totalSteps: z.number().min(1).optional(),
  displayName: z.string().optional(),
  autoFillSource: z.enum(['profile', 'previous-order', 'manual']).optional(),
  verifiedFields: z.array(z.string()).optional(),
});

/**
 * POST /api/forms/drafts
 * Save form draft for current user
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
    const validation = await validateRequest(saveDraftSchema)(request);
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

    const { 
      formType, 
      formData, 
      currentStep = 1, 
      totalSteps = 5, 
      displayName,
      autoFillSource = 'manual',
      verifiedFields = []
    } = validation.data;

    // Get prisma client through service factory
    const prisma = ServiceFactory.getPrismaClient();
    
    // Upsert the draft (create or update)
    const draft = await prisma.formDraft.upsert({
      where: {
        userId_formType: {
          userId: user.id,
          formType,
        },
      },
      update: {
        formData,
        currentStep,
        totalSteps,
        displayName,
        autoFillSource,
        verifiedFields,
      },
      create: {
        userId: user.id,
        formType,
        formData,
        currentStep,
        totalSteps,
        displayName,
        autoFillSource,
        verifiedFields,
      },
    });

    // If this draft has auto-fill data, save it to the user's profile
    if (autoFillSource === 'manual' && Object.keys(formData).length > 0) {
      const profileService = ServiceFactory.getProfileService();
      
      // Extract auto-fill data from form data
      const autoFillData: any = {};
      
      // Map common form fields to profile structure
      if (formData.firstName || formData.lastName || formData.phone) {
        autoFillData.personalInfo = {
          firstName: formData.firstName as string,
          lastName: formData.lastName as string,
          phone: formData.phone as string,
        };
      }

      if (formData.companyName || formData.businessEmail) {
        autoFillData.businessInfo = {
          companyName: formData.companyName as string,
          businessEmail: formData.businessEmail as string,
        };
      }

      if (Object.keys(autoFillData).length > 0) {
        await profileService.saveAutoFillData(user.id, formType, autoFillData);
      }
    }

    return NextResponse.json({
      success: true,
      draft: {
        id: draft.id,
        savedAt: draft.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Error saving form draft:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save form draft' 
      },
      { status: 500 }
    );
  }
}

const deleteDraftQuerySchema = z.object({
  formType: z.string().min(1, 'Form type is required'),
});

/**
 * DELETE /api/forms/drafts?formType=xxx
 * Delete form draft for current user
 */
export async function DELETE(request: NextRequest) {
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

    // Validate query parameters
    const queryValidation = validateQueryParams(deleteDraftQuerySchema, request.nextUrl.searchParams);
    if (!queryValidation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: queryValidation.error.message,
          details: queryValidation.error.context?.errors 
        },
        { status: queryValidation.error.statusCode }
      );
    }

    const { formType } = queryValidation.data;

    // Get prisma client through service factory
    const prisma = ServiceFactory.getPrismaClient();
    
    // Delete all drafts for this user and form type
    const deleteResult = await prisma.formDraft.deleteMany({
      where: {
        userId: user.id,
        formType,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
    });

  } catch (error) {
    console.error('Error deleting form draft:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete form draft' 
      },
      { status: 500 }
    );
  }
}

