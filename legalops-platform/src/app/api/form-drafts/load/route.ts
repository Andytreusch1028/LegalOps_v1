import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/form-drafts/load?formType=DBA_REGISTRATION
 * Load a saved form draft for authenticated users
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to load your draft.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const formType = searchParams.get('formType');

    if (!formType) {
      return NextResponse.json(
        { error: 'Missing required parameter: formType' },
        { status: 400 }
      );
    }

    // Find the draft
    const draft = await prisma.formDraft.findUnique({
      where: {
        userId_formType: {
          userId: session.user.id,
          formType,
        },
      },
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'No draft found for this form type' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: {
        id: draft.id,
        formType: draft.formType,
        formData: draft.formData,
        currentStep: draft.currentStep,
        totalSteps: draft.totalSteps,
        displayName: draft.displayName,
        emailRemindersEnabled: draft.emailRemindersEnabled,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      },
    });

  } catch (error: any) {
    console.error('Error loading form draft:', error);
    return NextResponse.json(
      { error: 'Failed to load draft. Please try again.' },
      { status: 500 }
    );
  }
}

