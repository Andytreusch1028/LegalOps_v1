/**
 * API Route: Approve and Submit Filing
 * 
 * Staff reviews the filled form and approves for submission
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only staff can approve filings
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || (user.userType !== 'EMPLOYEE' && user.userType !== 'SITE_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { submissionId, approved, notes } = body;

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 });
    }

    // Get submission
    const submission = await (prisma as any).filingSubmission.findUnique({
      where: { id: submissionId },
      include: {
        order: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.status !== 'FORM_FILLED') {
      return NextResponse.json(
        { error: 'Submission not ready for review' },
        { status: 400 }
      );
    }

    if (approved) {
      // Update submission as reviewed and ready
      await prisma.filingSubmission.update({
        where: { id: submissionId },
        data: {
          status: 'REVIEWED',
          reviewedBy: user.id,
          reviewedAt: new Date(),
          reviewNotes: notes,
        },
      });

      // TODO: Trigger actual submission to Sunbiz
      // For now, we'll mark it as ready for manual submission
      // In production, this would call agent.submitForm(page)

      return NextResponse.json({
        success: true,
        message: 'Filing approved and ready for submission',
      });
    } else {
      // Rejected - mark as failed
      await prisma.filingSubmission.update({
        where: { id: submissionId },
        data: {
          status: 'FAILED',
          reviewedBy: user.id,
          reviewedAt: new Date(),
          reviewNotes: notes,
          errorMessage: 'Rejected by staff reviewer',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Filing rejected',
      });
    }

  } catch (error) {
    console.error('Error approving filing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

