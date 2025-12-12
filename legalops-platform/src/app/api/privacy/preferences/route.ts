/**
 * Privacy Preferences Management API
 * 
 * Provides endpoints for users to manage their privacy preferences
 * including data processing consent, communication preferences, and retention settings.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/lib/services/service-factory';
import { withAuth } from '@/lib/middleware/auth';
import { z } from 'zod';

/**
 * Validation schema for privacy preferences
 */
const privacyPreferencesSchema = z.object({
  dataProcessing: z.object({
    analytics: z.boolean().optional(),
    marketing: z.boolean().optional(),
    personalization: z.boolean().optional(),
    thirdPartySharing: z.boolean().optional()
  }).optional(),
  communications: z.object({
    emailNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
    securityAlerts: z.boolean().optional()
  }).optional(),
  dataRetention: z.object({
    profileData: z.enum(['indefinite', '1year', '2years', '5years']).optional(),
    activityLogs: z.enum(['indefinite', '30days', '90days', '1year']).optional(),
    formDrafts: z.enum(['indefinite', '30days', '90days', '1year']).optional()
  }).optional(),
  cookieConsent: z.object({
    necessary: z.boolean().optional(), // Will be forced to true
    analytics: z.boolean().optional(),
    marketing: z.boolean().optional(),
    preferences: z.boolean().optional()
  }).optional()
});

/**
 * GET /api/privacy/preferences
 * Get current privacy preferences for the authenticated user
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

    // Get privacy compliance service
    const privacyService = ServiceFactory.getPrivacyComplianceService();

    // Get current privacy preferences
    const preferences = await privacyService.getPrivacyPreferences(user.id);

    return NextResponse.json({
      success: true,
      data: {
        preferences,
        lastUpdated: new Date().toISOString(), // In real implementation, track actual update time
        availableOptions: {
          dataRetention: {
            profileData: ['indefinite', '1year', '2years', '5years'],
            activityLogs: ['indefinite', '30days', '90days', '1year'],
            formDrafts: ['indefinite', '30days', '90days', '1year']
          },
          descriptions: {
            dataProcessing: {
              analytics: 'Allow us to analyze your usage patterns to improve our services',
              marketing: 'Allow us to use your data for marketing and promotional purposes',
              personalization: 'Allow us to personalize your experience based on your preferences',
              thirdPartySharing: 'Allow us to share your data with trusted third-party partners'
            },
            communications: {
              emailNotifications: 'Receive important account and service notifications via email',
              smsNotifications: 'Receive notifications via SMS (when phone number is provided)',
              marketingEmails: 'Receive marketing and promotional emails',
              securityAlerts: 'Receive critical security alerts (strongly recommended)'
            },
            cookieConsent: {
              necessary: 'Essential cookies required for the website to function (cannot be disabled)',
              analytics: 'Cookies that help us understand how you use our website',
              marketing: 'Cookies used to deliver relevant advertisements',
              preferences: 'Cookies that remember your preferences and settings'
            }
          }
        }
      }
    });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: 'GET /api/privacy/preferences',
      userId: request.headers.get('x-user-id'),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json(response, { status: response.statusCode });
  }
}

/**
 * PUT /api/privacy/preferences
 * Update privacy preferences for the authenticated user
 */
export async function PUT(request: NextRequest) {
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
    const validationResult = privacyPreferencesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid privacy preferences',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const preferences = validationResult.data;

    // Get privacy compliance service
    const privacyService = ServiceFactory.getPrivacyComplianceService();

    // Update privacy preferences
    const updateResult = await privacyService.updatePrivacyPreferences(user.id, preferences);

    if (!updateResult.success) {
      return NextResponse.json(
        { 
          error: 'UPDATE_FAILED', 
          message: 'Failed to update privacy preferences',
          details: updateResult.error.message
        },
        { status: 500 }
      );
    }

    const updatedPreferences = updateResult.data;

    return NextResponse.json({
      success: true,
      message: 'Privacy preferences updated successfully',
      data: {
        preferences: updatedPreferences,
        updatedAt: new Date().toISOString(),
        changes: preferences // Show what was changed
      }
    });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: 'PUT /api/privacy/preferences',
      userId: request.headers.get('x-user-id'),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json(response, { status: response.statusCode });
  }
}

/**
 * POST /api/privacy/preferences/reset
 * Reset privacy preferences to default values
 */
export async function POST(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();

  try {
    // Only handle reset action
    const url = new URL(request.url);
    if (!url.pathname.endsWith('/reset')) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Endpoint not found' },
        { status: 404 }
      );
    }

    // Authenticate user
    const authResult = await withAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Get privacy compliance service
    const privacyService = ServiceFactory.getPrivacyComplianceService();

    // Reset to default preferences
    const defaultPreferences = await privacyService.getPrivacyPreferences('default');
    const updateResult = await privacyService.updatePrivacyPreferences(user.id, defaultPreferences);

    if (!updateResult.success) {
      return NextResponse.json(
        { 
          error: 'RESET_FAILED', 
          message: 'Failed to reset privacy preferences',
          details: updateResult.error.message
        },
        { status: 500 }
      );
    }

    const resetPreferences = updateResult.data;

    return NextResponse.json({
      success: true,
      message: 'Privacy preferences reset to default values',
      data: {
        preferences: resetPreferences,
        resetAt: new Date().toISOString()
      }
    });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: 'POST /api/privacy/preferences/reset',
      userId: request.headers.get('x-user-id'),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json(response, { status: response.statusCode });
  }
}