/**
 * LegalOps v1 - Filing Approval API
 * 
 * POST /api/filings/[id]/approve - Customer approves staff changes
 * POST /api/filings/[id]/request-revision - Customer requests revisions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: filingId } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get filing and verify ownership
    const filing = await prisma.filing.findUnique({
      where: { id: filingId },
      include: {
        businessEntity: {
          include: {
            client: {
              include: {
                user: {
                  select: { email: true }
                }
              }
            }
          }
        }
      }
    });

    if (!filing) {
      return NextResponse.json(
        { success: false, error: 'Filing not found' },
        { status: 404 }
      );
    }

    if (filing.businessEntity.client.user.email !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Verify filing is in PENDING_CUSTOMER_APPROVAL status
    if (filing.filingStatus !== 'PENDING_CUSTOMER_APPROVAL') {
      return NextResponse.json(
        { success: false, error: 'Filing is not pending approval' },
        { status: 400 }
      );
    }

    // Update filing status
    const updatedFiling = await prisma.filing.update({
      where: { id: filingId },
      data: {
        filingStatus: 'APPROVED_BY_CUSTOMER',
        customerApprovedAt: new Date(),
        customerApprovedBy: user.id,
      }
    });

    // Dismiss the approval notice
    await prisma.notice.updateMany({
      where: {
        filingId: filingId,
        userId: user.id,
        type: 'APPROVAL_REQUIRED',
        isDismissed: false,
      },
      data: {
        isDismissed: true,
        isRead: true,
      }
    });

    // Create a success notice
    await prisma.notice.create({
      data: {
        userId: user.id,
        type: 'FILING_SUBMITTED',
        priority: 'SUCCESS',
        title: 'Changes Approved',
        message: 'Your approval has been recorded. We will now proceed with filing to the state.',
        filingId: filingId,
        actionUrl: `/dashboard/filings/${filingId}`,
        actionLabel: 'View Filing',
      }
    });

    return NextResponse.json({
      success: true,
      filing: updatedFiling
    });
  } catch (error) {
    console.error('Error approving filing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve filing' },
      { status: 500 }
    );
  }
}

