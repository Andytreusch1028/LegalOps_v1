/**
 * LegalOps v1 - Filing Detail API
 * 
 * GET /api/filings/[id] - Fetch complete filing details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: filingId } = await params;

    // Fetch filing with all related data
    const filing = await prisma.filing.findUnique({
      where: { id: filingId },
      include: {
        businessEntity: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    email: true,
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            },
            addresses: true,
            registeredAgent: {
              include: {
                addresses: true
              }
            },
            managersOfficers: true
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

    // Verify user owns this filing
    if (filing.businessEntity.client.user.email !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - not your filing' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      filing: {
        id: filing.id,
        filingType: filing.filingType,
        status: filing.status,
        filingStatus: filing.filingStatus,
        filingData: filing.filingData,
        confirmationNumber: filing.confirmationNumber,
        submittedAt: filing.submittedAt,
        createdAt: filing.createdAt,
        updatedAt: filing.updatedAt,
        // CRITICAL: Include approval workflow fields
        staffChanges: filing.staffChanges,
        staffChangeReason: filing.staffChangeReason,
        requiresApproval: filing.requiresApproval,
        customerApprovedAt: filing.customerApprovedAt,
        customerApprovedBy: filing.customerApprovedBy,
        businessEntity: {
          id: filing.businessEntity.id,
          legalName: filing.businessEntity.legalName,
          entityType: filing.businessEntity.entityType,
          documentNumber: filing.businessEntity.documentNumber,
          feiNumber: filing.businessEntity.feiNumber,
          status: filing.businessEntity.status,
          addresses: filing.businessEntity.addresses,
          registeredAgent: filing.businessEntity.registeredAgent,
          managersOfficers: filing.businessEntity.managersOfficers
        }
      }
    });

  } catch (error) {
    console.error('Error fetching filing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch filing details' },
      { status: 500 }
    );
  }
}

