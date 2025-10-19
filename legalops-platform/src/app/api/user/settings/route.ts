/**
 * LegalOps v1 - User Settings API
 * 
 * GET /api/user/settings - Get user settings
 * POST /api/user/settings - Update user settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        autoApproveMinorChanges: true,
        autoApproveGrantedAt: true,
        autoApproveAcknowledged: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: user
    });

  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
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

    const body = await request.json();
    const { autoApproveMinorChanges, autoApproveAcknowledged } = body;

    // Validate input
    if (typeof autoApproveMinorChanges !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    // Update user settings
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        autoApproveMinorChanges,
        autoApproveAcknowledged: autoApproveAcknowledged || false,
        autoApproveGrantedAt: autoApproveMinorChanges ? new Date() : null,
      },
      select: {
        autoApproveMinorChanges: true,
        autoApproveGrantedAt: true,
        autoApproveAcknowledged: true,
      }
    });

    console.log(`User ${session.user.email} ${autoApproveMinorChanges ? 'enabled' : 'disabled'} auto-approve for minor changes`);

    return NextResponse.json({
      success: true,
      settings: updatedUser
    });

  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

