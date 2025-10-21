/**
 * LegalOps v1 - Request Revision API
 * 
 * POST /api/filings/[id]/request-revision - Customer requests revisions to staff changes
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
    const body = await request.json();
    const { revisionNotes } = body;

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

    // Update filing status back to IN_REVIEW with customer notes
    const updatedFiling = await prisma.filing.update({
      where: { id: filingId },
      data: {
        filingStatus: 'IN_REVIEW',
        staffChangeReason: revisionNotes ? `Customer requested revision: ${revisionNotes}` : 'Customer requested revision',
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

    // Create a notice for the customer confirming revision request
    await prisma.notice.create({
      data: {
        userId: user.id,
        type: 'GENERAL_ALERT',
        priority: 'ATTENTION',
        title: 'Revision Request Submitted',
        message: 'Your revision request has been sent to our team. We will review your feedback and make the necessary changes.',
        filingId: filingId,
        actionUrl: `/dashboard/filings/${filingId}`,
        actionLabel: 'View Filing',
      }
    });

    // Get all staff users (FULFILLMENT_WORKER, MANAGER, SITE_ADMIN)
    const staffUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['FULFILLMENT_WORKER', 'MANAGER', 'SITE_ADMIN'] as any
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    // Create notices for all staff members
    const staffNotices = staffUsers.map(staffUser => ({
      userId: staffUser.id,
      type: 'GENERAL_ALERT' as const,
      priority: 'URGENT' as const,
      title: `Customer Requested Revision: ${filing.businessEntity.legalName}`,
      message: revisionNotes
        ? `${user.firstName} ${user.lastName} requested changes: "${revisionNotes}"`
        : `${user.firstName} ${user.lastName} requested changes to this filing.`,
      filingId: filingId,
      actionUrl: `/dashboard/staff/filings/${filingId}/review`,
      actionLabel: 'Review Filing',
    }));

    await prisma.notice.createMany({
      data: staffNotices
    });

    return NextResponse.json({
      success: true,
      filing: updatedFiling,
      message: 'Revision request submitted. Our team will review and contact you.'
    });
  } catch (error) {
    console.error('Error requesting revision:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to request revision' },
      { status: 500 }
    );
  }
}

