/**
 * Data Retention Policy Management API
 * 
 * Admin endpoints for managing and monitoring data retention policies.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/lib/services/service-factory';
import { withAuth } from '@/lib/middleware/auth';
import { getDataRetentionJob } from '@/lib/jobs/data-retention.job';

/**
 * GET /api/admin/data-retention
 * Get data retention job status and recent enforcement results
 */
export async function GET(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();

  try {
    // Check if user is admin
    const authResult = await withAuth(request, { requireAdmin: true });
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin access required' },
        { status: 401 }
      );
    }

    // Get data retention job status
    const retentionJob = getDataRetentionJob();
    const jobStatus = retentionJob.getStatus();

    // Get privacy compliance service for additional info
    const privacyService = ServiceFactory.getPrivacyComplianceService();

    return NextResponse.json({
      success: true,
      data: {
        jobStatus,
        policies: {
          profileData: {
            defaultRetentionDays: 730, // 2 years
            maxRetentionDays: 1825, // 5 years
            description: 'User profile and personal data retention'
          },
          activityLogs: {
            defaultRetentionDays: 365, // 1 year
            securityLogRetentionDays: 1095, // 3 years
            auditLogRetentionDays: 2555, // 7 years
            description: 'System activity and audit log retention'
          },
          formDrafts: {
            defaultRetentionDays: 365, // 1 year
            completedFormRetentionDays: 2555, // 7 years
            description: 'Form draft and completed form retention'
          },
          businessRecords: {
            orderRetentionYears: 7,
            taxRecordRetentionYears: 7,
            legalDocumentRetentionYears: 10,
            description: 'Business and legal record retention'
          }
        },
        nextScheduledRun: jobStatus.lastRun 
          ? new Date(jobStatus.lastRun.getTime() + (jobStatus.config?.runIntervalMs || 24 * 60 * 60 * 1000))
          : null
      }
    });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: 'GET /api/admin/data-retention',
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json(response, { status: response.statusCode });
  }
}

/**
 * POST /api/admin/data-retention
 * Trigger manual data retention enforcement or manage the job
 */
export async function POST(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();

  try {
    // Check if user is admin
    const authResult = await withAuth(request, { requireAdmin: true });
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, config } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Action is required' },
        { status: 400 }
      );
    }

    const retentionJob = getDataRetentionJob();
    let result;
    let message;

    switch (action.toLowerCase()) {
      case 'start':
        result = await retentionJob.start();
        message = 'Data retention job started successfully';
        break;

      case 'stop':
        result = await retentionJob.stop();
        message = 'Data retention job stopped successfully';
        break;

      case 'enforce':
      case 'run':
        result = await retentionJob.runRetentionEnforcement();
        message = 'Data retention enforcement completed';
        break;

      case 'configure':
        if (config) {
          retentionJob.updateConfig(config);
          result = { success: true };
          message = 'Data retention job configuration updated';
        } else {
          return NextResponse.json(
            { error: 'VALIDATION_ERROR', message: 'Configuration is required for configure action' },
            { status: 400 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { 
            error: 'INVALID_ACTION', 
            message: 'Invalid action. Supported actions: start, stop, enforce, configure' 
          },
          { status: 400 }
        );
    }

    if (result && 'success' in result && !result.success) {
      return NextResponse.json(
        { 
          error: 'OPERATION_FAILED', 
          message: result.error?.message || 'Operation failed'
        },
        { status: 500 }
      );
    }

    // Get updated status
    const jobStatus = retentionJob.getStatus();

    return NextResponse.json({
      success: true,
      message,
      data: {
        jobStatus,
        result: action === 'enforce' || action === 'run' ? result : undefined
      }
    });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: 'POST /api/admin/data-retention',
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json(response, { status: response.statusCode });
  }
}