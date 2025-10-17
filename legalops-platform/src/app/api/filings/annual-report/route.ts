/**
 * LegalOps v1 - Annual Report Filing API
 * 
 * POST /api/filings/annual-report
 * Creates an annual report filing for an existing business entity
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { mapAnnualReportToDatabase } from '@/lib/mappers/form-to-database';
import { AnnualReportFormData } from '@/types/forms';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData: AnnualReportFormData = await request.json();
    
    // TODO: Get from session
    const userId = 'temp-user-id';
    
    // Validate that the business entity exists
    const businessEntity = await prisma.businessEntity.findUnique({
      where: { id: formData.businessEntityId },
      include: {
        addresses: true,
        registeredAgent: true,
        managersOfficers: true,
      },
    });
    
    if (!businessEntity) {
      return NextResponse.json(
        { error: 'Business entity not found' },
        { status: 404 }
      );
    }
    
    // Map form data to database format
    const filingData = mapAnnualReportToDatabase(
      formData,
      formData.businessEntityId
    );
    
    // Create the filing record
    const filing = await prisma.filing.create({
      data: filingData,
      include: {
        businessEntity: {
          include: {
            addresses: true,
            registeredAgent: true,
            managersOfficers: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      filing,
      message: 'Annual report filing created successfully',
    });
  } catch (error) {
    console.error('Error creating annual report filing:', error);
    return NextResponse.json(
      { error: 'Failed to create annual report filing' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/filings/annual-report?clientId=xxx
 * Get all business entities for a client that need annual reports
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let clientId = searchParams.get('clientId');

    // For testing: if no clientId provided, use the test client
    if (!clientId) {
      clientId = 'test-client-001';
    }
    
    // Get all business entities for this client
    const entities = await prisma.businessEntity.findMany({
      where: {
        clientId,
        // Only active entities
        status: 'ACTIVE',
      },
      include: {
        addresses: true,
        registeredAgent: true,
        managersOfficers: true,
        filings: {
          where: {
            filingType: 'ANNUAL_REPORT',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get most recent annual report
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      entities,
    });
  } catch (error) {
    console.error('Error fetching entities for annual report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    );
  }
}

