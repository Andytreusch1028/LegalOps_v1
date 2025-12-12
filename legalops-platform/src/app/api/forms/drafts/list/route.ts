/**
 * Form Drafts List API
 * Phase 8: User Authentication System Integration
 *
 * Get all form drafts for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateQueryParams } from '@/lib/middleware/validation';
import { requireAuth } from '@/lib/middleware/auth';
import { ServiceFactory } from '@/lib/services/service-factory';

const listDraftsQuerySchema = z.object({
  includeArchived: z.string().transform(val => val === 'true').optional(),
  formType: z.string().optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional(),
});

/**
 * GET /api/forms/drafts/list
 * Get all form drafts for the authenticated user
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
    const queryValidation = validateQueryParams(listDraftsQuerySchema, request.nextUrl.searchParams);
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

    const { 
      includeArchived = false, 
      formType, 
      page = 1, 
      limit = 20 
    } = queryValidation.data;

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (!includeArchived) {
      where.isArchived = false;
    }

    if (formType) {
      where.formType = formType;
    }

    // Get prisma client
    const prisma = ServiceFactory.getPrismaClient();

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count and drafts
    const [total, drafts] = await Promise.all([
      prisma.formDraft.count({ where }),
      prisma.formDraft.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          formType: true,
          displayName: true,
          currentStep: true,
          totalSteps: true,
          autoFillSource: true,
          verifiedFields: true,
          isArchived: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const hasMore = skip + drafts.length < total;

    return NextResponse.json({
      success: true,
      drafts: drafts.map(draft => ({
        ...draft,
        verifiedFieldsCount: draft.verifiedFields.length,
      })),
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
    });

  } catch (error) {
    console.error('Error listing form drafts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to list form drafts' 
      },
      { status: 500 }
    );
  }
}