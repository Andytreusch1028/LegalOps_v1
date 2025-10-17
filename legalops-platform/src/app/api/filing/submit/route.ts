/**
 * API Route: Submit Filing to Sunbiz
 * 
 * Triggers AI agent to fill form and prepare for staff review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';
import { SunbizFilingAgent, LLCFormationData, CorporationFormationData } from '@/lib/sunbiz-agent';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

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

    if (!user || (user.role !== 'EMPLOYEE' && user.role !== 'SITE_ADMIN')) {
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
        user: {
          include: {
            customerProfile: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if already has a pending submission
    const existingSubmission = await prisma.filingSubmission.findFirst({
      where: {
        orderId,
        status: {
          in: ['PENDING', 'FORM_FILLED', 'REVIEWED', 'SUBMITTING'],
        },
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Filing already in progress' },
        { status: 400 }
      );
    }

    // Create filing submission record
    const submission = await prisma.filingSubmission.create({
      data: {
        orderId,
        filingType: order.type,
        status: 'PENDING',
        agentUsed: true,
        requiresReview: true,
      },
    });

    // Initialize AI agent
    const agent = new SunbizFilingAgent('./public/filing-screenshots');

    let result;

    // Fill form based on order type
    if (order.type === 'LLC_FORMATION') {
      const formData: LLCFormationData = {
        businessName: order.businessName,
        principalAddress: (order.orderData as any)?.principalAddress || {
          street: '',
          city: '',
          state: 'FL',
          zip: '',
        },
        mailingAddress: (order.orderData as any)?.mailingAddress,
        registeredAgent: (order.orderData as any)?.registeredAgent || {
          name: '',
          address: { street: '', city: '', state: 'FL', zip: '' },
        },
        managers: (order.orderData as any)?.managers,
        effectiveDate: (order.orderData as any)?.effectiveDate,
        correspondenceEmail: order.user.email,
      };

      result = await agent.fillLLCFormation(formData, false); // headless=false for debugging
    } else if (order.type === 'CORP_FORMATION') {
      const formData: CorporationFormationData = {
        corporationName: order.businessName,
        numberOfShares: (order.orderData as any)?.numberOfShares || 1,
        principalAddress: (order.orderData as any)?.principalAddress || {
          street: '',
          city: '',
          state: 'FL',
          zip: '',
        },
        mailingAddress: (order.orderData as any)?.mailingAddress,
        registeredAgent: (order.orderData as any)?.registeredAgent || {
          name: '',
          address: { street: '', city: '', state: 'FL', zip: '' },
        },
        incorporator: (order.orderData as any)?.incorporator || {
          name: order.user.name || order.user.email,
        },
        purpose: (order.orderData as any)?.purpose || 'any lawful business',
        officers: (order.orderData as any)?.officers,
        effectiveDate: (order.orderData as any)?.effectiveDate,
        correspondenceEmail: order.user.email,
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
    await prisma.filingSubmission.update({
      where: { id: submission.id },
      data: {
        status: result.success ? 'FORM_FILLED' : 'FAILED',
        agentConfidence: result.confidence,
        formScreenshot: `/filing-screenshots/${screenshotFilename}`,
        errorMessage: result.errors?.join(', '),
      },
    });

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

