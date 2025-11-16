/**
 * LegalOps v1 - Internal Staff Alert API
 * 
 * POST /api/internal/alert-staff-error - Alert staff about critical system errors
 * 
 * This endpoint is called automatically when the system detects critical errors
 * that require immediate staff attention. It creates urgent notices for all
 * fulfillment staff and updates the filing status.
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
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { errorType, filingId, businessName, filingType } = body;

    if (!errorType || !filingId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the filing to verify it exists and get customer info
    const filing = await prisma.filing.findUnique({
      where: { id: filingId },
      include: {
        businessEntity: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  }
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

    // Handle different error types
    if (errorType === 'CHANGES_NOT_LOGGED') {
      // Get all staff users who can fix this
      const staffUsers = await prisma.user.findMany({
        where: {
          role: {
            in: ['FULFILLMENT_WORKER', 'MANAGER', 'SITE_ADMIN']
          }
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        }
      });

      // Create urgent notices for all staff
      const staffNotices = staffUsers.map(staffUser => ({
        userId: staffUser.id,
        type: 'GENERAL_ALERT' as const,
        priority: 'URGENT' as const,
        title: `🚨 CRITICAL: Changes Not Logged - ${businessName}`,
        message: `Customer ${filing.businessEntity.client.user.firstName} ${filing.businessEntity.client.user.lastName} tried to review their ${filingType.replace(/_/g, ' ')} but NO CHANGES were logged. This filing is marked as requiring approval but has an empty staffChanges array. Please immediately: 1) Review the filing, 2) Document all changes made, 3) Update the filing with proper change logs. Customer is waiting.`,
        filingId: filingId,
        actionUrl: `/dashboard/staff/filings/${filingId}/review`,
        actionLabel: 'Fix Now',
      }));

      await prisma.notice.createMany({
        data: staffNotices
      });

      // Update filing status to IN_REVIEW so it doesn't stay in limbo
      await prisma.filing.update({
        where: { id: filingId },
        data: {
          filingStatus: 'IN_REVIEW',
          staffChangeReason: `SYSTEM ERROR: Filing was marked PENDING_CUSTOMER_APPROVAL but no changes were logged. Automatically moved back to IN_REVIEW for staff to document changes. Error detected at ${new Date().toISOString()}.`
        }
      });

      // Dismiss the customer's approval notice since it's invalid
      await prisma.notice.updateMany({
        where: {
          filingId: filingId,
          userId: filing.businessEntity.client.user.id,
          type: 'APPROVAL_REQUIRED',
          isDismissed: false,
        },
        data: {
          isDismissed: true,
          isRead: true,
        }
      });

      // Create a notice for the customer explaining the delay
      await prisma.notice.create({
        data: {
          userId: filing.businessEntity.client.user.id,
          type: 'GENERAL_ALERT',
          priority: 'ATTENTION',
          title: 'Filing Review Delayed - We\'re Working On It',
          message: `We're finalizing the documentation for your ${filingType.replace(/_/g, ' ')} filing. Our team is ensuring all changes are properly recorded for your review. We'll notify you as soon as it's ready (typically within 1 hour). Thank you for your patience!`,
          filingId: filingId,
          actionUrl: `/dashboard/filings/${filingId}`,
          actionLabel: 'View Filing',
        }
      });

      console.error(`🚨 CRITICAL ERROR: Changes not logged for filing ${filingId}. Staff alerted.`);

      return NextResponse.json({
        success: true,
        message: 'Staff alerted and filing status updated',
        staffNotified: staffUsers.length,
        filingStatus: 'IN_REVIEW',
      });
    }

    // Handle other error types here in the future
    return NextResponse.json({
      success: false,
      error: 'Unknown error type'
    }, { status: 400 });

  } catch (error) {
    console.error('Error alerting staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to alert staff' },
      { status: 500 }
    );
  }
}

