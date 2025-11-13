import { NextRequest, NextResponse } from 'next/server';
import { sendPublicationCertificationEmail } from '@/lib/services/email-service';

/**
 * API Route: Send Publication Certification Confirmation Email
 * 
 * POST /api/dba/certify-publication
 * 
 * Sends a confirmation email when a user certifies they have published
 * their DBA in a newspaper, creating an audit trail.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fictitiousName, newspaperName, publicationDate } = body;

    // Validate required fields
    if (!email || !fictitiousName || !newspaperName || !publicationDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get current date for certification timestamp
    const certificationDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Send certification confirmation email
    const emailSent = await sendPublicationCertificationEmail(
      email,
      fictitiousName,
      newspaperName,
      publicationDate,
      certificationDate
    );

    if (!emailSent) {
      console.warn('Failed to send certification email, but continuing...');
      // Don't fail the request if email fails - it's not critical
      return NextResponse.json({
        success: true,
        emailSent: false,
        message: 'Certification recorded but email notification failed'
      });
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      message: 'Certification confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Error in certify-publication API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

