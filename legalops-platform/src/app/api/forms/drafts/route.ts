/**
 * Smart Forms API - Form Drafts
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Persist and retrieve form drafts for Smart Forms auto-fill
 * GET: Retrieve saved draft
 * POST: Save form draft
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// In-memory storage for development (replace with database in production)
const drafts = new Map<string, any>();

/**
 * GET /api/forms/drafts
 * Retrieve saved form draft for current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Get form type from query params
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get('formType');
    
    if (!formType) {
      return NextResponse.json(
        { error: 'formType is required' },
        { status: 400 }
      );
    }
    
    // For guest users, use session ID; for logged-in users, use user ID
    const userId = session?.user?.id || request.cookies.get('sessionId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }
    
    const draftKey = `${userId}:${formType}`;
    const draft = drafts.get(draftKey);
    
    if (!draft) {
      return NextResponse.json(
        { draft: null },
        { status: 200 }
      );
    }
    
    return NextResponse.json({
      draft: draft.data,
      savedAt: draft.savedAt,
    });
  } catch (error) {
    console.error('Error retrieving form draft:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve form draft' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forms/drafts
 * Save form draft for current user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const { formType, data } = body;
    
    if (!formType || !data) {
      return NextResponse.json(
        { error: 'formType and data are required' },
        { status: 400 }
      );
    }
    
    // For guest users, use session ID; for logged-in users, use user ID
    const userId = session?.user?.id || request.cookies.get('sessionId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }
    
    const draftKey = `${userId}:${formType}`;
    
    drafts.set(draftKey, {
      data,
      savedAt: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving form draft:', error);
    return NextResponse.json(
      { error: 'Failed to save form draft' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/forms/drafts
 * Delete form draft for current user
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get('formType');
    
    if (!formType) {
      return NextResponse.json(
        { error: 'formType is required' },
        { status: 400 }
      );
    }
    
    const userId = session?.user?.id || request.cookies.get('sessionId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }
    
    const draftKey = `${userId}:${formType}`;
    drafts.delete(draftKey);
    
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting form draft:', error);
    return NextResponse.json(
      { error: 'Failed to delete form draft' },
      { status: 500 }
    );
  }
}

