/**
 * LegalOps v1 - DBA Draft Save API (Authenticated Users)
 * 
 * Saves DBA form data for authenticated users and:
 * 1. Saves to FormDraft table (for auto-resume and dashboard display)
 * 2. Sends magic link email (same as guest workflow)
 * 3. Creates Important Notice in dashboard
 * 4. Provides calendar reminder (.ics file)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/services/email-service';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] save-draft-authenticated called');

    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('[API] Session user ID:', session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { formData, currentStep, email } = body;
    console.log('[API] Request data:', {
      fictitiousName: formData?.fictitiousName,
      currentStep,
      email
    });

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

    // 1. Save to FormDraft table (for dashboard Incomplete Filings)
    console.log('[API] Saving to FormDraft table...');
    const formDraft = await prisma.formDraft.upsert({
      where: {
        userId_formType: {
          userId: session.user.id,
          formType: 'DBA_REGISTRATION',
        },
      },
      create: {
        userId: session.user.id,
        formType: 'DBA_REGISTRATION',
        formData: formData,
        currentStep: currentStep || 4,
        totalSteps: 5,
        displayName: formData.fictitiousName || 'DBA Registration',
        emailRemindersEnabled: true,
      },
      update: {
        formData: formData,
        currentStep: currentStep || 4,
        displayName: formData.fictitiousName || 'DBA Registration',
        emailRemindersEnabled: true,
      },
    });
    console.log('[API] FormDraft saved:', formDraft.id);

    // 2. Create Important Notice in dashboard (only if one doesn't already exist)
    console.log('[API] Creating Important Notice...');

    // Check if notice already exists for this user and DBA
    const existingNotice = await prisma.notice.findFirst({
      where: {
        userId: session.user.id,
        type: 'DEADLINE_APPROACHING',
        title: 'Complete Your Fictitious Name (DBA) Registration',
        isDismissed: false,
      },
    });

    if (!existingNotice) {
      await prisma.notice.create({
        data: {
          userId: session.user.id,
          type: 'DEADLINE_APPROACHING',
          priority: 'ATTENTION',
          title: 'Complete Your Fictitious Name (DBA) Registration',
          message: `Your Fictitious Name (DBA) registration for "${formData.fictitiousName}" is waiting for newspaper publication. Once published, return to complete your filing.`,
          actionUrl: '/services/fictitious-name-registration',
          actionLabel: 'Complete Registration',
        },
      });
      console.log('[API] Notice created');
    } else {
      console.log('[API] Notice already exists, skipping creation');
    }

    // 3. Send magic link email (same as guest workflow)
    console.log('[API] Sending email...');
    const magicLink = `${process.env.NEXTAUTH_URL}/services/fictitious-name-registration`;

    const emailSent = await sendDBADraftEmail(
      email,
      formData.fictitiousName,
      magicLink,
      session.user.name || 'there'
    );

    if (emailSent) {
      console.log('[API] ✅ Email sent successfully');
    } else {
      console.log('[API] ⚠️  Email not sent (check SendGrid configuration)');
    }

    // 4. Generate calendar reminder (.ics file content)
    console.log('[API] Generating calendar event...');
    const calendarEvent = generateCalendarReminder(formData.fictitiousName);
    console.log('[API] Calendar event generated');

    return NextResponse.json({
      success: true,
      message: 'Draft saved successfully. Check your email for the link to resume.',
      draftId: formDraft.id,
      calendarEvent, // Return .ics content for download
    }, { status: 201 });

  } catch (error: any) {
    console.error('DBA draft save error (authenticated):', error);
    console.error('Error details:', error.message, error.stack);

    return NextResponse.json(
      { error: `Failed to save draft: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Send DBA draft email with magic link (authenticated user version)
 */
async function sendDBADraftEmail(
  email: string,
  fictitiousName: string,
  magicLink: string,
  userName: string
) {
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
          .dashboard-box {
            background: #DBEAFE;
            border: 2px solid #0EA5E9;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">LegalOps</div>
            <h1>Your DBA Registration is Saved</h1>
          </div>

          <p>Hi ${userName},</p>

          <p>We've saved your DBA registration for:</p>

          <div class="highlight-box">
            <strong>${fictitiousName}</strong>
          </div>

          <p>As you know, Florida law requires you to publish your fictitious name in a newspaper before we can file with the state. Here's what to do next:</p>

          <div class="steps">
            <ol>
              <li><strong>Contact a local newspaper</strong> and request to publish a "fictitious name notice"</li>
              <li><strong>Publish the advertisement</strong> (typically costs $50-$150)</li>
              <li><strong>Return to complete your registration</strong> using one of the methods below</li>
            </ol>
          </div>

          <div class="dashboard-box">
            <p style="margin: 0 0 12px 0;"><strong>📋 Three Ways to Resume:</strong></p>
            <ol style="margin: 0; padding-left: 20px;">
              <li><strong>Dashboard:</strong> Log in and check "Incomplete Filings"</li>
              <li><strong>Email Link:</strong> Click the button below</li>
              <li><strong>Important Notices:</strong> Check your dashboard notifications</li>
            </ol>
          </div>

          <div style="text-align: center;">
            <a href="${magicLink}" class="button">Complete My DBA Registration</a>
          </div>

          <p>All your information is saved and ready to go. When you log in, you'll pick up right where you left off.</p>

          <div class="footer">
            <p><strong>LegalOps</strong> - Florida Business Formation Services</p>
            <p>Questions? Reply to this email or contact us at support@legalops.com</p>
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
DESCRIPTION:Reminder to complete your DBA registration for "${fictitiousName}". Make sure you've published your newspaper advertisement, then log in to LegalOps to finish your filing.
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

