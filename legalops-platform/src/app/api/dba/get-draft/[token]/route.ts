/**
 * LegalOps v1 - DBA Draft Retrieval API
 * 
 * Retrieves saved DBA form data using magic link token
 * Allows guests to resume their DBA registration after newspaper publication
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 400 }
      );
    }

    // Find draft by token
    const draft = await prisma.dBADraft.findUnique({
      where: { token },
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found. The link may be invalid or expired.' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > draft.expiresAt) {
      return NextResponse.json(
        { error: 'This link has expired. Please start a new DBA registration.' },
        { status: 410 } // 410 Gone
      );
    }

    // Parse form data
    const formData = JSON.parse(draft.formData);

    return NextResponse.json({
      success: true,
      formData,
      email: draft.email,
      createdAt: draft.createdAt,
      expiresAt: draft.expiresAt,
    }, { status: 200 });

  } catch (error: any) {
    console.error('DBA draft retrieval error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve draft. Please try again.' },
      { status: 500 }
    );
  }
}

