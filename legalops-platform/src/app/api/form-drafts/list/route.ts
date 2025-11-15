import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/form-drafts/list
 * List all saved form drafts for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to view your drafts.' },
        { status: 401 }
      );
    }

    // Find all drafts for this user
    const drafts = await prisma.formDraft.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Format the response
    const formattedDrafts = drafts.map(draft => ({
      id: draft.id,
      formType: draft.formType,
      displayName: draft.displayName,
      currentStep: draft.currentStep,
      totalSteps: draft.totalSteps,
      progress: Math.round((draft.currentStep / draft.totalSteps) * 100),
      emailRemindersEnabled: draft.emailRemindersEnabled,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      // Calculate days since last update
      daysSinceUpdate: Math.floor((Date.now() - new Date(draft.updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return NextResponse.json({
      success: true,
      drafts: formattedDrafts,
      count: formattedDrafts.length,
    });

  } catch (error) {
    console.error('Error listing form drafts:', error);
    return NextResponse.json(
      { error: 'Failed to load drafts. Please try again.' },
      { status: 500 }
    );
  }
}

