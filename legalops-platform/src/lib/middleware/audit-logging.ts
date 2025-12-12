/**
 * Audit Logging Middleware
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Comprehensive audit logging for security events and user actions
 */

import { NextRequest } from 'next/server';
import { ServiceFactory } from '@/lib/services/service-factory';

export interface AuditLogConfig {
  /** Enable request logging */
  enableRequestLogging?: boolean;
  
  /** Enable authentication event logging */
  enableAuthLogging?: boolean;
  
  /** Enable data access logging */
  enableDataAccessLogging?: boolean;
  
  /** Enable admin action logging */
  enableAdminActionLogging?: boolean;
  
  /** Sensitive fields to redact from logs */
  sensitiveFields?: string[];
  
  /** Custom log processor */
  logProcessor?: (event: AuditLogEvent) => Promise<void>;
}

export interface AuditLogEvent {
  /** Event ID */
  id: string;
  
  /** Event type */
  type: 'request' | 'auth' | 'data_access' | 'admin_action' | 'security' | 'error';
  
  /** Event category */
  category: string;
  
  /** Event action */
  action: string;
  
  /** Event severity */
  severity: 'info' | 'warning' | 'error' | 'critical';
  
  /** User ID if available */
  userId?: string;
  
  /** User email if available */
  userEmail?: string;
  
  /** User role if available */
  userRole?: string;
  
  /** Client IP address */
  clientIP: string;
  
  /** User agent */
  userAgent: string;
  
  /** Request details */
  request: {
    method: string;
    path: string;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    body?: unknown;
  };
  
  /** Response details */
  response?: {
    status: number;
    headers?: Record<string, string>;
    body?: unknown;
  };
  
  /** Event description */
  description: string;
  
  /** Additional event data */
  metadata?: Record<string, unknown>;
  
  /** Event timestamp */
  timestamp: number;
  
  /** Session ID if available */
  sessionId?: string;
  
  /** Resource affected */
  resource?: {
    type: string;
    id: string;
    name?: string;
  };
  
  /** Success/failure status */
  success: boolean;
  
  /** Error details if applicable */
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}

const DEFAULT_SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'ssn',
  'social_security_number',
  'credit_card',
  'card_number',
  'cvv',
  'pin',
  'authorization',
  'x-api-key',
  'x-auth-token',
];

/**
 * Audit logging middleware factory
 */
export function createAuditLogger(config: AuditLogConfig = {}) {
  const fullConfig = {
    enableRequestLogging: true,
    enableAuthLogging: true,
    enableDataAccessLogging: true,
    enableAdminActionLogging: true,
    sensitiveFields: DEFAULT_SENSITIVE_FIELDS,
    ...config,
  };
  
  return {
    /**
     * Log a request
     */
    logRequest: async (
      req: NextRequest,
      response?: { status: number; headers?: Record<string, string> },
      userId?: string,
      sessionId?: string
    ): Promise<void> => {
      if (!fullConfig.enableRequestLogging) return;
      
      const event: AuditLogEvent = {
        id: generateEventId(),
        type: 'request',
        category: 'http',
        action: req.method.toLowerCase(),
        severity: 'info',
        userId,
        sessionId,
        clientIP: getClientIP(req),
        userAgent: req.headers.get('user-agent') || 'unknown',
        request: {
          method: req.method,
          path: req.nextUrl.pathname,
          query: Object.fromEntries(req.nextUrl.searchParams.entries()),
          headers: redactSensitiveData(
            Object.fromEntries(req.headers.entries()),
            fullConfig.sensitiveFields
          ),
        },
        response,
        description: `${req.method} ${req.nextUrl.pathname}`,
        timestamp: Date.now(),
        success: !response || response.status < 400,
      };
      
      await processAuditLog(event, fullConfig);
    },
    
    /**
     * Log an authentication event
     */
    logAuthEvent: async (
      action: 'login' | 'logout' | 'register' | 'password_reset' | 'email_verify' | 'session_create' | 'session_destroy',
      req: NextRequest,
      userId?: string,
      userEmail?: string,
      success = true,
      error?: { code: string; message: string }
    ): Promise<void> => {
      if (!fullConfig.enableAuthLogging) return;
      
      const event: AuditLogEvent = {
        id: generateEventId(),
        type: 'auth',
        category: 'authentication',
        action,
        severity: success ? 'info' : 'warning',
        userId,
        userEmail,
        clientIP: getClientIP(req),
        userAgent: req.headers.get('user-agent') || 'unknown',
        request: {
          method: req.method,
          path: req.nextUrl.pathname,
        },
        description: `User ${action} ${success ? 'successful' : 'failed'}`,
        timestamp: Date.now(),
        success,
        error,
      };
      
      await processAuditLog(event, fullConfig);
    },
    
    /**
     * Log a data access event
     */
    logDataAccess: async (
      action: 'read' | 'create' | 'update' | 'delete' | 'export',
      resource: { type: string; id: string; name?: string },
      req: NextRequest,
      userId?: string,
      userRole?: string,
      success = true,
      metadata?: Record<string, unknown>
    ): Promise<void> => {
      if (!fullConfig.enableDataAccessLogging) return;
      
      const event: AuditLogEvent = {
        id: generateEventId(),
        type: 'data_access',
        category: 'data',
        action,
        severity: action === 'delete' ? 'warning' : 'info',
        userId,
        userRole,
        clientIP: getClientIP(req),
        userAgent: req.headers.get('user-agent') || 'unknown',
        request: {
          method: req.method,
          path: req.nextUrl.pathname,
        },
        resource,
        description: `${action} ${resource.type} ${resource.id}`,
        metadata,
        timestamp: Date.now(),
        success,
      };
      
      await processAuditLog(event, fullConfig);
    },
    
    /**
     * Log an admin action
     */
    logAdminAction: async (
      action: string,
      req: NextRequest,
      adminUserId: string,
      adminUserEmail: string,
      targetResource?: { type: string; id: string; name?: string },
      success = true,
      metadata?: Record<string, unknown>
    ): Promise<void> => {
      if (!fullConfig.enableAdminActionLogging) return;
      
      const event: AuditLogEvent = {
        id: generateEventId(),
        type: 'admin_action',
        category: 'administration',
        action,
        severity: 'warning', // Admin actions are always notable
        userId: adminUserId,
        userEmail: adminUserEmail,
        userRole: 'admin',
        clientIP: getClientIP(req),
        userAgent: req.headers.get('user-agent') || 'unknown',
        request: {
          method: req.method,
          path: req.nextUrl.pathname,
        },
        resource: targetResource,
        description: `Admin ${action}${targetResource ? ` on ${targetResource.type} ${targetResource.id}` : ''}`,
        metadata,
        timestamp: Date.now(),
        success,
      };
      
      await processAuditLog(event, fullConfig);
    },
    
    /**
     * Log a security event
     */
    logSecurityEvent: async (
      action: string,
      severity: 'info' | 'warning' | 'error' | 'critical',
      req: NextRequest,
      description: string,
      userId?: string,
      metadata?: Record<string, unknown>
    ): Promise<void> => {
      const event: AuditLogEvent = {
        id: generateEventId(),
        type: 'security',
        category: 'security',
        action,
        severity,
        userId,
        clientIP: getClientIP(req),
        userAgent: req.headers.get('user-agent') || 'unknown',
        request: {
          method: req.method,
          path: req.nextUrl.pathname,
        },
        description,
        metadata,
        timestamp: Date.now(),
        success: severity !== 'error' && severity !== 'critical',
      };
      
      await processAuditLog(event, fullConfig);
    },
    
    /**
     * Log an error event
     */
    logError: async (
      error: Error,
      req: NextRequest,
      userId?: string,
      metadata?: Record<string, unknown>
    ): Promise<void> => {
      const event: AuditLogEvent = {
        id: generateEventId(),
        type: 'error',
        category: 'system',
        action: 'error',
        severity: 'error',
        userId,
        clientIP: getClientIP(req),
        userAgent: req.headers.get('user-agent') || 'unknown',
        request: {
          method: req.method,
          path: req.nextUrl.pathname,
        },
        description: `System error: ${error.message}`,
        metadata,
        timestamp: Date.now(),
        success: false,
        error: {
          code: error.name,
          message: error.message,
          stack: error.stack,
        },
      };
      
      await processAuditLog(event, fullConfig);
    },
  };
}

/**
 * Process and store audit log event
 */
async function processAuditLog(event: AuditLogEvent, config: AuditLogConfig): Promise<void> {
  try {
    // Use custom log processor if provided
    if (config.logProcessor) {
      await config.logProcessor(event);
      return;
    }
    
    // Default logging to console (in production, use proper logging service)
    const logLevel = event.severity === 'critical' || event.severity === 'error' ? 'error' :
                    event.severity === 'warning' ? 'warn' : 'info';
    
    console[logLevel]('Audit Log:', {
      id: event.id,
      type: event.type,
      category: event.category,
      action: event.action,
      severity: event.severity,
      userId: event.userId,
      userEmail: event.userEmail,
      clientIP: event.clientIP,
      path: event.request.path,
      method: event.request.method,
      description: event.description,
      success: event.success,
      timestamp: new Date(event.timestamp).toISOString(),
      resource: event.resource,
      error: event.error,
    });
    
    // TODO: In production, integrate with logging service
    // await loggingService.writeAuditLog(event);
    
  } catch (error) {
    console.error('Failed to process audit log:', error);
  }
}

/**
 * Redact sensitive data from objects
 */
function redactSensitiveData(
  data: Record<string, unknown>,
  sensitiveFields: string[]
): Record<string, unknown> {
  const redacted = { ...data };
  
  for (const [key, value] of Object.entries(redacted)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value as Record<string, unknown>, sensitiveFields);
    }
  }
  
  return redacted;
}

/**
 * Get client IP address
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

/**
 * Generate unique event ID
 */
function generateEventId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create default audit logger instance
 */
export const AuditLogger = createAuditLogger();