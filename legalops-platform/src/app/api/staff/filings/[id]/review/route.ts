/**
 * LegalOps v1 - Staff Filing Review API
 * 
 * POST /api/staff/filings/[id]/review - Staff submits review with changes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';
import { createApprovalNotice } from '@/lib/helpers/create-approval-notice';

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
    const { changes, overallReason } = body;

    // Get staff user
    const staffUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!staffUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // TODO: Verify user is staff
    // For now, allow any authenticated user

    // Get filing to find the customer
    const filing = await prisma.filing.findUnique({
      where: { id: filingId },
      include: {
        businessEntity: {
          include: {
            client: {
              include: {
                user: {
                  select: { id: true, email: true }
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

    // Create approval notice (or mark as ready to file if no substantive changes)
    const result = await createApprovalNotice({
      filingId,
      userId: filing.businessEntity.client.user.id,
      changes,
      overallReason
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

