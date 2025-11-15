/**
 * API Route: Submit Filing to Sunbiz
 * 
 * Triggers AI agent to fill form and prepare for staff review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, Prisma } from '@/generated/prisma';
import { SunbizFilingAgent, LLCFormationData, CorporationFormationData } from '@/lib/sunbiz-agent';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

// Type for old Order schema with orderData field (this file uses deprecated schema)
interface LegacyOrderData {
  type?: string;
  businessName?: string;
  orderData?: Prisma.JsonValue;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only staff can trigger filings
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || (user.userType !== 'EMPLOYEE' && user.userType !== 'SITE_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Get order with all data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // TODO: filingSubmission model doesn't exist in current schema
    // This functionality needs to be refactored to use the current Order/OrderItem model

    // Check if already has a pending submission
    // const existingSubmission = await prisma.filingSubmission.findFirst({
    //   where: {
    //     orderId,
    //     status: {
    //       in: ['PENDING', 'FORM_FILLED', 'REVIEWED', 'SUBMITTING'],
    //     },
    //   },
    // });

    // if (existingSubmission) {
    //   return NextResponse.json(
    //     { error: 'Filing already in progress' },
    //     { status: 400 }
    //   );
    // }

    // Create filing submission record
    // const submission = await prisma.filingSubmission.create({
    //   data: {
    //     orderId,
    //     filingType: orderData.type,
    //     status: 'PENDING',
    //     agentUsed: true,
    //     requiresReview: true,
    //   },
    // });

    const submission = { id: orderId }; // Temporary placeholder

    // Initialize AI agent
    const agent = new SunbizFilingAgent('./public/filing-screenshots');

    let result;

    // Fill form based on order type
    // Cast to legacy order type (this file uses deprecated schema)
    const orderData = order as unknown as LegacyOrderData;

    // Helper to safely extract JSON data
    const getOrderDataField = <T>(field: string, defaultValue: T): T => {
      if (!orderData.orderData || typeof orderData.orderData !== 'object') {
        return defaultValue;
      }
      const data = orderData.orderData as Record<string, unknown>;
      return (data[field] as T) ?? defaultValue;
    };

    if (orderData.type === 'LLC_FORMATION') {
      const formData: LLCFormationData = {
        businessName: orderData.businessName || '',
        principalAddress: getOrderDataField('principalAddress', {
          street: '',
          city: '',
          state: 'FL',
          zip: '',
        }),
        mailingAddress: getOrderDataField('mailingAddress', undefined),
        registeredAgent: getOrderDataField('registeredAgent', {
          name: '',
          address: { street: '', city: '', state: 'FL', zip: '' },
        }),
        managers: getOrderDataField('managers', undefined),
        effectiveDate: getOrderDataField('effectiveDate', undefined),
        correspondenceEmail: order.user?.email || order.guestEmail || '',
      };

      result = await agent.fillLLCFormation(formData, false); // headless=false for debugging
    } else if (orderData.type === 'CORP_FORMATION') {
      const formData: CorporationFormationData = {
        corporationName: orderData.businessName || '',
        numberOfShares: getOrderDataField('numberOfShares', 1),
        principalAddress: getOrderDataField('principalAddress', {
          street: '',
          city: '',
          state: 'FL',
          zip: '',
        }),
        mailingAddress: getOrderDataField('mailingAddress', undefined),
        registeredAgent: getOrderDataField('registeredAgent', {
          name: '',
          address: { street: '', city: '', state: 'FL', zip: '' },
        }),
        incorporator: getOrderDataField('incorporator', {
          name: order.user?.email || order.guestEmail || 'Unknown',
        }),
        purpose: getOrderDataField('purpose', 'any lawful business'),
        officers: getOrderDataField('officers', undefined),
        effectiveDate: getOrderDataField('effectiveDate', undefined),
        correspondenceEmail: order.user?.email || order.guestEmail || '',
      };

      result = await agent.fillCorporationFormation(formData, false);
    } else {
      await agent.close();
      return NextResponse.json(
        { error: 'Unsupported filing type' },
        { status: 400 }
      );
    }

    // Save screenshot
    const screenshotFilename = `${orderId}-${Date.now()}.png`;
    const screenshotPath = join(process.cwd(), 'public', 'filing-screenshots', screenshotFilename);
    await writeFile(screenshotPath, result.screenshot);

    // Update submission with results
    // TODO: Update to use current schema
    // await prisma.filingSubmission.update({
    //   where: { id: submission.id },
    //   data: {
    //     status: result.success ? 'FORM_FILLED' : 'FAILED',
    //     agentConfidence: result.confidence,
    //     formScreenshot: `/filing-screenshots/${screenshotFilename}`,
    //     errorMessage: result.errors?.join(', '),
    //   },
    // });

    // Don't close browser yet - keep it open for submission
    // Store browser/page reference in memory (for now)
    // TODO: Implement proper session management for browser instances

    return NextResponse.json({
      success: result.success,
      submissionId: submission.id,
      screenshot: `/filing-screenshots/${screenshotFilename}`,
      confidence: result.confidence,
      errors: result.errors,
      message: result.success
        ? 'Form filled successfully. Ready for review.'
        : 'Form filling failed. Please review errors.',
    });

  } catch (error) {
    console.error('Error in filing submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

