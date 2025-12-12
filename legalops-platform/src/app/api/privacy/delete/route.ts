/**
 * Right to be Forgotten API
 * 
 * Provides endpoint for users to request deletion of all their personal data
 * in compliance with GDPR Article 17 (Right to erasure).
 */

import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/lib/services/service-factory';
import { withAuth } from '@/lib/middleware/auth';
import { z } from 'zod';

/**
 * Validation schema for deletion request
 */
const deletionRequestSchema = z.object({
  confirmDeletion: z.boolean().refine(val => val === true, {
    message: 'You must confirm the deletion by setting confirmDeletion to true'
  }),
  reason: z.string().optional().default('user_request'),
  password: z.string().min(1, 'Password is required for account deletion'),
  acknowledgments: z.object({
    dataLoss: z.boolean().refine(val => val === true, {
      message: 'You must acknowledge that data deletion is irreversible'
    }),
    businessRecords: z.boolean().refine(val => val === true, {
      message: 'You must acknowledge that some business records may be retained for legal compliance'
    }),
    accountClosure: z.boolean().refine(val => val === true, {
      message: 'You must acknowledge that your account will be permanently closed'
    })
  })
});

/**
 * POST /api/privacy/delete
 * Request complete account and data deletion (Right to be Forgotten)
 */
export async function POST(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();

  try {
    // Authenticate user
    const authResult = await withAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = deletionRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid deletion request',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const { password, reason, acknowledgments } = validationResult.data;

    // Verify password for additional security
    const authService = ServiceFactory.getAuthenticationService();
    const passwordVerifyResult = await authService.verifyPassword(user.email, password);

    if (!passwordVerifyResult.success || !passwordVerifyResult.data.isValid) {
      return NextResponse.json(
        { error: 'INVALID_PASSWORD', message: 'Invalid password provided' },
        { status: 401 }
      );
    }

    // Get privacy compliance service
    const privacyService = ServiceFactory.getPrivacyComplianceService();

    // Perform data deletion
    const deletionResult = await privacyService.deleteUserData(user.id, reason);

    if (!deletionResult.success) {
      return NextResponse.json(
        { 
          error: 'DELETION_FAILED', 
          message: 'Failed to delete user data',
          details: deletionResult.error.message
        },
        { status: 500 }
      );
    }

    const deletionData = deletionResult.data;

    // Send confirmation email (if email service is available and user preferences allow)
    try {
      const emailService = ServiceFactory.getEmailService();
      await emailService.sendAccountDeletionConfirmation(user.email, user.firstName || 'User');
    } catch (emailError) {
      // Log but don't fail the deletion if email fails
      console.warn('Failed to send deletion confirmation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Account and data deletion completed successfully',
      data: {
        deletionId: `deletion_${user.id}_${Date.now()}`,
        deletedAt: deletionData.deletedAt,
        summary: {
          itemsDeleted: deletionData.itemsDeleted,
          retainedItems: deletionData.retainedItems
        },
        notice: 'Your account has been permanently deleted. Some business records may be retained for legal compliance as disclosed in our Privacy Policy.'
      }
    });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: 'POST /api/privacy/delete',
      userId: request.headers.get('x-user-id'),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json(response, { status: response.statusCode });
  }
}

/**
 * GET /api/privacy/delete
 * Get information about what data will be deleted and what will be retained
 */
export async function GET(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();

  try {
    // Authenticate user
    const authResult = await withAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Get privacy compliance service to check what data exists
    const privacyService = ServiceFactory.getPrivacyComplianceService();
    
    // Get current data summary (without actually exporting)
    const exportResult = await privacyService.exportUserData(user.id);
    
    if (!exportResult.success) {
      return NextResponse.json(
        { 
          error: 'DATA_CHECK_FAILED', 
          message: 'Failed to check user data',
          details: exportResult.error.message
        },
        { status: 500 }
      );
    }

    const exportData = exportResult.data;

    return NextResponse.json({
      success: true,
      data: {
        dataToBeDeleted: {
          profile: !!exportData.profile,
          sessions: 'All active sessions',
          formDrafts: exportData.formDrafts.length,
          feedback: exportData.feedback.length + ' (will be anonymized)',
          personalData: 'All personally identifiable information'
        },
        dataToBeRetained: {
          businessRecords: [
            'Completed orders and invoices (7 years for tax compliance)',
            'Legal documents and filings (10 years for legal compliance)',
            'Risk assessments (retained for security and fraud prevention)'
          ],
          legalBasis: [
            'Tax record retention requirements',
            'Business record keeping obligations',
            'Fraud prevention and security monitoring',
            'Legal proceedings or regulatory investigations'
          ]
        },
        retentionSchedule: exportData.retentionSchedule,
        requirements: {
          passwordConfirmation: true,
          acknowledgments: [
            'Data deletion is irreversible',
            'Some business records will be retained for legal compliance',
            'Account will be permanently closed'
          ]
        },
        notice: 'This action cannot be undone. Please ensure you have exported any data you wish to keep before proceeding.'
      }
    });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: 'GET /api/privacy/delete',
      userId: request.headers.get('x-user-id'),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json(response, { status: response.statusCode });
  }
}