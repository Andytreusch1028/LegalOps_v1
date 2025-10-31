/**
 * Feedback API
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * POST /api/feedback
 * Collect user feedback from FeedbackBeacon components
 */

import { NextRequest, NextResponse } from 'next/server';

interface FeedbackRequest {
  feedbackId: string;
  positive: boolean;
  comment?: string;
  timestamp: string;
  url: string;
}

/**
 * POST /api/feedback
 */
export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    
    // Validate required fields
    if (!body.feedbackId || typeof body.positive !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: feedbackId, positive' },
        { status: 400 }
      );
    }
    
    // Log feedback (in production, save to database)
    console.log('Feedback received:', {
      feedbackId: body.feedbackId,
      positive: body.positive,
      comment: body.comment,
      timestamp: body.timestamp,
      url: body.url,
    });
    
    // TODO: Save to database
    // await prisma.feedback.create({
    //   data: {
    //     feedbackId: body.feedbackId,
    //     positive: body.positive,
    //     comment: body.comment,
    //     url: body.url,
    //     createdAt: new Date(body.timestamp),
    //   },
    // });
    
    return NextResponse.json({
      success: true,
      message: 'Feedback received',
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}

