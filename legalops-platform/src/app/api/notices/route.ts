/**
 * LegalOps v1 - Notices API
 * 
 * GET /api/notices - Get all notices for current user
 * POST /api/notices - Create a new notice (staff only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Get all active notices for this user
    const notices = await prisma.notice.findMany({
      where: {
        userId: user.id,
        isDismissed: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        filing: {
          include: {
            businessEntity: {
              select: {
                legalName: true,
                documentNumber: true,
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'asc' }, // URGENT first
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      notices
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Check if user is staff
    // For now, allow any authenticated user

    const body = await request.json();
    const { userId, type, priority, title, message, filingId, actionUrl, actionLabel, expiresAt } = body;

    const notice = await prisma.notice.create({
      data: {
        userId,
        type,
        priority,
        title,
        message,
        filingId,
        actionUrl,
        actionLabel,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    });

    return NextResponse.json({
      success: true,
      notice
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notice' },
      { status: 500 }
    );
  }
}

