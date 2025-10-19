/**
 * LegalOps v1 - Dismiss Notice API
 * 
 * POST /api/notices/[id]/dismiss - Dismiss a notice
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

    const { id: noticeId } = await params;

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

    // Verify notice belongs to user and dismiss it
    const notice = await prisma.notice.updateMany({
      where: {
        id: noticeId,
        userId: user.id,
      },
      data: {
        isDismissed: true,
        isRead: true,
      }
    });

    if (notice.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Notice not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notice dismissed'
    });
  } catch (error) {
    console.error('Error dismissing notice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to dismiss notice' },
      { status: 500 }
    );
  }
}

