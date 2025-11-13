import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/form-drafts/delete
 * Delete a saved form draft for authenticated user
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to delete your draft.' },
        { status: 401 }
      );
    }

    const { draftId, formType } = await request.json();

    if (!draftId && !formType) {
      return NextResponse.json(
        { error: 'Missing required field: draftId or formType' },
        { status: 400 }
      );
    }

    // Delete by ID or by formType
    if (draftId) {
      // Verify ownership before deleting
      const draft = await prisma.formDraft.findUnique({
        where: { id: draftId },
      });

      if (!draft) {
        return NextResponse.json(
          { error: 'Draft not found' },
          { status: 404 }
        );
      }

      if (draft.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized. You can only delete your own drafts.' },
          { status: 403 }
        );
      }

      await prisma.formDraft.delete({
        where: { id: draftId },
      });
    } else if (formType) {
      // Delete by formType
      await prisma.formDraft.delete({
        where: {
          userId_formType: {
            userId: session.user.id,
            formType,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully',
    });

  } catch (error: any) {
    console.error('Error deleting form draft:', error);
    
    // Handle case where draft doesn't exist
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete draft. Please try again.' },
      { status: 500 }
    );
  }
}

