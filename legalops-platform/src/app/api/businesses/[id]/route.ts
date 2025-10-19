/**
 * LegalOps v1 - Business Detail API
 * 
 * GET /api/businesses/[id] - Fetch complete business details
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

    const { id: businessId } = await params;

    // Fetch business with all related data
    const business = await prisma.businessEntity.findUnique({
      where: { id: businessId },
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
        addresses: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        registeredAgent: {
          include: {
            addresses: true
          }
        },
        managersOfficers: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        filings: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Last 10 filings
        }
      }
    });

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    // Verify user owns this business
    if (business.client.user.email !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - not your business' },
        { status: 403 }
      );
    }

    // Separate addresses by type
    const principalAddress = business.addresses.find(a => a.addressType === 'PRINCIPAL');
    const mailingAddress = business.addresses.find(a => a.addressType === 'MAILING');
    const agentAddress = business.registeredAgent?.addresses[0];

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        legalName: business.legalName,
        dbaName: business.dbaName,
        entityType: business.entityType,
        documentNumber: business.documentNumber,
        feiNumber: business.feiNumber,
        filingDate: business.filingDate,
        status: business.status,
        purpose: business.purpose,
        principalAddress,
        mailingAddress,
        registeredAgent: business.registeredAgent ? {
          id: business.registeredAgent.id,
          agentType: business.registeredAgent.agentType,
          firstName: business.registeredAgent.firstName,
          lastName: business.registeredAgent.lastName,
          companyName: business.registeredAgent.companyName,
          email: business.registeredAgent.email,
          phone: business.registeredAgent.phone,
          address: agentAddress
        } : null,
        managersOfficers: business.managersOfficers,
        filings: business.filings,
        createdAt: business.createdAt,
        updatedAt: business.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business details' },
      { status: 500 }
    );
  }
}

