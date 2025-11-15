/**
 * API Route: Get Pending Filings
 * 
 * Returns all filings that need staff review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only staff can view pending filings
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || (user.userType !== 'EMPLOYEE' && user.userType !== 'SITE_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all pending filings
    // TODO: FilingSubmission model not yet implemented
    // const filings = await prisma.filingSubmission.findMany({
    //   where: {
    //     status: 'FORM_FILLED', // Only show filings ready for review
    //   },
    //   include: {
    //     order: {
    //       include: {
    //         user: {
    //           select: {
    //             name: true,
    //             email: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    //   orderBy: {
    //     createdAt: 'desc',
    //   },
    // });
    const filings: unknown[] = []; // Temporary placeholder

    return NextResponse.json({
      filings,
      count: filings.length,
    });

  } catch (error) {
    console.error('Error fetching pending filings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

