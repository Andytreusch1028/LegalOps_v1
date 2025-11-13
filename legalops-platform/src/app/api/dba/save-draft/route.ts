/**
 * LegalOps v1 - DBA Draft Save API
 * 
 * Saves DBA form data as a draft and sends magic link to guest email
 * Allows guests to pause at Step 4 (newspaper publication) and return later
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/services/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData, email } = body;

    // Validation
    if (!formData || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: formData and email' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Generate secure token for magic link
    const token = `dba_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Calculate expiration (7 days from now - plenty of time for newspaper publication)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save draft to database
    const draft = await prisma.dBADraft.create({
      data: {
        email: email.toLowerCase(),
        formData: JSON.stringify(formData),
        token,
        expiresAt,
      },
    });

    // Send magic link email
    const magicLink = `${process.env.NEXTAUTH_URL}/dba/resume/${token}`;

    const emailSent = await sendDBADraftEmail(email, formData.fictitiousName, magicLink);

    if (emailSent) {
      console.log('[API] ✅ Email sent successfully');
    } else {
      console.log('[API] ⚠️  Email not sent (check SendGrid configuration)');
    }

    // Generate calendar reminder (.ics file content)
    const calendarEvent = generateCalendarReminder(formData.fictitiousName);

    return NextResponse.json({
      success: true,
      message: 'Draft saved successfully. Check your email for the link to resume.',
      draftId: draft.id,
      calendarEvent, // Return .ics content for download
    }, { status: 201 });

  } catch (error: any) {
    console.error('DBA draft save error:', error);
    
    return NextResponse.json(
      { error: 'Failed to save draft. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Generate .ics calendar reminder file content
 */
function generateCalendarReminder(fictitiousName: string): string {
  const now = new Date();
  const reminderDate = new Date(now);
  reminderDate.setDate(reminderDate.getDate() + 7); // Remind in 7 days

  // Format dates for .ics file (YYYYMMDDTHHMMSSZ)
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LegalOps//DBA Registration Reminder//EN
BEGIN:VEVENT
UID:dba-${Date.now()}@legalops.com
DTSTAMP:${formatICSDate(now)}
DTSTART:${formatICSDate(reminderDate)}
SUMMARY:Complete DBA Registration - ${fictitiousName}
DESCRIPTION:Reminder to complete your DBA registration for "${fictitiousName}". Make sure you've published your newspaper advertisement, then use the link in your email to finish your filing.
LOCATION:https://legalops.com/services/fictitious-name-registration
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Complete DBA Registration - ${fictitiousName}
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

/**
 * Send DBA draft email with magic link
 */
async function sendDBADraftEmail(email: string, fictitiousName: string, magicLink: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #ffffff;
            border-radius: 12px;
            padding: 32px;
            border: 1px solid #E5E7EB;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            font-size: 24px;
            font-weight: 700;
            color: #0EA5E9;
            margin-bottom: 8px;
          }
          h1 {
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 16px 0;
          }
          .highlight-box {
            background: #F0F9FF;
            border: 2px solid #0EA5E9;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          .highlight-box strong {
            color: #0EA5E9;
            font-size: 18px;
          }
          .button {
            display: inline-block;
            background: #0EA5E9;
            color: #ffffff;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 24px 0;
          }
          .button:hover {
            background: #0284C7;
          }
          .steps {
            background: #F9FAFB;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          .steps ol {
            margin: 0;
            padding-left: 20px;
          }
          .steps li {
            margin-bottom: 12px;
            color: #6B7280;
          }
          .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #E5E7EB;
            color: #9CA3AF;
            font-size: 14px;
          }
          .warning {
            background: #FEF3C7;
            border: 1px solid #FDE68A;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            color: #92400E;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">LegalOps</div>
            <h1>Your DBA Registration is Saved</h1>
          </div>

          <p>Hi there,</p>

          <p>We've saved your DBA registration for:</p>

          <div class="highlight-box">
            <strong>${fictitiousName}</strong>
          </div>

          <p>As you know, Florida law requires you to publish your fictitious name in a newspaper before we can file with the state. Here's what to do next:</p>

          <div class="steps">
            <ol>
              <li><strong>Contact a local newspaper</strong> and request to publish a "fictitious name notice"</li>
              <li><strong>Publish the advertisement</strong> (typically costs $50-$150)</li>
              <li><strong>Click the button below</strong> to return and complete your registration</li>
            </ol>
          </div>

          <div style="text-align: center;">
            <a href="${magicLink}" class="button">Complete My DBA Registration</a>
          </div>

          <div class="warning">
            <strong>⏰ This link expires in 7 days.</strong> That should give you plenty of time to publish your newspaper ad and return to complete your filing.
          </div>

          <p>All your information is saved and ready to go. When you click the link above, you'll pick up right where you left off.</p>

          <div class="footer">
            <p><strong>LegalOps</strong> - Florida Business Formation Services</p>
            <p>Questions? Reply to this email or contact us at support@legalops.com</p>
            <p style="margin-top: 16px; font-size: 12px;">
              This link is unique to you. Don't share it with anyone.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Complete Your DBA Registration - ${fictitiousName}`,
    html,
  });
}

