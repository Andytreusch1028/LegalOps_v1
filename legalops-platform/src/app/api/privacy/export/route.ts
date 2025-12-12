/**
 * GDPR Data Export API
 * 
 * Provides endpoint for users to export all their personal data
 * in compliance with GDPR Article 20 (Right to data portability).
 */

import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/lib/services/service-factory';
import { withAuth } from '@/lib/middleware/auth';

/**
 * GET /api/privacy/export
 * Export all user data in GDPR-compliant format
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

    // Export user data
    const exportResult = await privacyService.exportUserData(user.id);

    if (!exportResult.success) {
      return NextResponse.json(
        { 
          error: 'EXPORT_FAILED', 
          message: 'Failed to export user data',
          details: exportResult.error.message
        },
        { status: 500 }
      );
    }

    const exportData = exportResult.data;

    // Set appropriate headers for file download
    const filename = `legalops-data-export-${user.id}-${new Date().toISOString().split('T')[0]}.json`;
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: 'GET /api/privacy/export',
      userId: request.headers.get('x-user-id'),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json(response, { status: response.statusCode });
  }
}

/**
 * POST /api/privacy/export
 * Request data export (for async processing of large datasets)
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
    const body = await request.json();
    const { format = 'json', includeAnalytics = false } = body;

    // Validate format
    if (!['json', 'csv', 'xml'].includes(format)) {
      return NextResponse.json(
        { error: 'INVALID_FORMAT', message: 'Supported formats: json, csv, xml' },
        { status: 400 }
      );
    }

    // Get privacy compliance service
    const privacyService = ServiceFactory.getPrivacyComplianceService();

    // For now, process synchronously (in production, this might be queued)
    const exportResult = await privacyService.exportUserData(user.id);

    if (!exportResult.success) {
      return NextResponse.json(
        { 
          error: 'EXPORT_FAILED', 
          message: 'Failed to export user data',
          details: exportResult.error.message
        },
        { status: 500 }
      );
    }

    const exportData = exportResult.data;

    // In a real implementation, you might:
    // 1. Queue the export job for background processing
    // 2. Send an email when the export is ready
    // 3. Provide a download link that expires after a certain time

    return NextResponse.json({
      success: true,
      message: 'Data export completed',
      data: {
        exportId: `export_${user.id}_${Date.now()}`,
        format,
        requestedAt: new Date().toISOString(),
        status: 'completed',
        downloadUrl: `/api/privacy/export`, // For immediate download
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        summary: {
          profileData: !!exportData.profile,
          formDrafts: exportData.formDrafts.length,
          orders: exportData.orders.length,
          feedback: exportData.feedback.length,
          riskAssessments: exportData.riskAssessments.length,
          privacyPreferences: !!exportData.privacyPreferences,
          dataProcessingHistory: exportData.dataProcessingHistory.length,
          consentHistory: exportData.consentHistory.length
        }
      }
    });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: 'POST /api/privacy/export',
      userId: request.headers.get('x-user-id'),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json(response, { status: response.statusCode });
  }
}