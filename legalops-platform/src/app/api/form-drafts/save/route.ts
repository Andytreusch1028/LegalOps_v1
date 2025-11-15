import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/form-drafts/save
 * Save or update a form draft for authenticated users
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to save your progress.' },
        { status: 401 }
      );
    }

    const { formType, formData, currentStep, totalSteps, displayName, emailRemindersEnabled } = await request.json();

    // Validate required fields
    if (!formType || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields: formType and formData are required' },
        { status: 400 }
      );
    }

    // Validate formType
    const validFormTypes = ['DBA_REGISTRATION', 'LLC_FORMATION', 'ANNUAL_REPORT', 'CORPORATION_FORMATION'];
    if (!validFormTypes.includes(formType)) {
      return NextResponse.json(
        { error: `Invalid formType. Must be one of: ${validFormTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Upsert the draft (create or update)
    const draft = await prisma.formDraft.upsert({
      where: {
        userId_formType: {
          userId: session.user.id,
          formType,
        },
      },
      update: {
        formData,
        currentStep: currentStep || 1,
        totalSteps: totalSteps || 5,
        displayName: displayName || null,
        emailRemindersEnabled: emailRemindersEnabled || false,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        formType,
        formData,
        currentStep: currentStep || 1,
        totalSteps: totalSteps || 5,
        displayName: displayName || null,
        emailRemindersEnabled: emailRemindersEnabled || false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Draft saved successfully',
      draftId: draft.id,
      updatedAt: draft.updatedAt,
    });

  } catch (error) {
    console.error('Error saving form draft:', error);
    return NextResponse.json(
      { error: 'Failed to save draft. Please try again.' },
      { status: 500 }
    );
  }
}

