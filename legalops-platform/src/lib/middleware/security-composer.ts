/**
 * Security Middleware Composer
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Combines all security middleware into easy-to-use compositions
 */

import { NextRequest, NextResponse } from 'next/server';
import { Result, AppError } from '@/lib/types/result';
import { 
  requireAuth, 
  requireRole, 
  requireOwnership,
  RateLimits,
  CSRFProtection,
  SecurityHeaders,
  createSuspiciousActivityDetection,
  createAuditLogger,
  validateSessionWithSecurity
} from './index';

export interface SecurityMiddlewareConfig {
  /** Enable authentication requirement */
  requireAuth?: boolean;
  
  /** Required user roles */
  requiredRoles?: string[];
  
  /** Resource ownership validation */
  resourceOwnership?: {
    enabled: boolean;
    getUserId: (req: NextRequest) => string;
  };
  
  /** Rate limiting configuration */
  rateLimit?: 'auth' | 'api' | 'general' | 'password_reset' | 'upload' | 'none';
  
  /** CSRF protection */
  csrfProtection?: boolean;
  
  /** Security headers */
  securityHeaders?: 'strict' | 'development' | 'api' | 'none';
  
  /** Suspicious activity detection */
  suspiciousActivityDetection?: boolean;
  
  /** Audit logging */
  auditLogging?: {
    enabled: boolean;
    logRequests?: boolean;
    logAuth?: boolean;
    logDataAccess?: boolean;
    logAdminActions?: boolean;
  };
  
  /** Enhanced session validation */
  enhancedSessionValidation?: boolean;
}

export interface SecurityMiddlewareResult {
  /** Whether request should proceed */
  allowed: boolean;
  
  /** Response to return if not allowed */
  response?: NextResponse;
  
  /** Authentication context if available */
  authContext?: {
    user: any;
    sessionId: string;
  };
  
  /** Security warnings */
  warnings?: string[];
  
  /** New session token if rotated */
  newSessionToken?: string;
}

/**
 * Comprehensive security middleware composer
 */
export async function applySecurityMiddleware(
  req: NextRequest,
  config: SecurityMiddlewareConfig
): Promise<SecurityMiddlewareResult> {
  const warnings: string[] = [];
  let authContext: any = undefined;
  let newSessionToken: string | undefined;
  
  try {
    // 1. Rate Limiting (applied first to prevent abuse)
    if (config.rateLimit && config.rateLimit !== 'none') {
      const rateLimitCheck = RateLimits[config.rateLimit.toUpperCase() as keyof typeof RateLimits];
      const rateLimitResult = await rateLimitCheck(req);
      
      if (!rateLimitResult.success) {
        const response = NextResponse.json(
          { 
            success: false, 
            error: rateLimitResult.error.message,
            retryAfter: rateLimitResult.error.context?.retryAfter 
          },
          { 
            status: rateLimitResult.error.statusCode,
            headers: {
              'X-RateLimit-Limit': rateLimitResult.error.context?.limit?.toString() || '0',
              'X-RateLimit-Remaining': rateLimitResult.error.context?.remaining?.toString() || '0',
              'X-RateLimit-Reset': rateLimitResult.error.context?.resetTime?.toString() || '0',
              'Retry-After': rateLimitResult.error.context?.retryAfter?.toString() || '60',
            }
          }
        );
        
        return { allowed: false, response };
      }
      
      // Add rate limit headers to successful responses
      warnings.push(`Rate limit: ${rateLimitResult.data.remaining}/${rateLimitResult.data.limit} remaining`);
    }
    
    // 2. CSRF Protection
    if (config.csrfProtection) {
      const csrfResult = await CSRFProtection.STANDARD(req);
      
      if (!csrfResult.success) {
        const response = NextResponse.json(
          { 
            success: false, 
            error: csrfResult.error.message 
          },
          { status: csrfResult.error.statusCode }
        );
        
        return { allowed: false, response };
      }
    }
    
    // 3. Authentication (if required)
    if (config.requireAuth) {
      // Use enhanced session validation if enabled
      if (config.enhancedSessionValidation) {
        const sessionValidationResult = await validateSessionWithSecurity(req);
        
        if (!sessionValidationResult.success) {
          const response = NextResponse.json(
            { 
              success: false, 
              error: sessionValidationResult.error.message 
            },
            { status: sessionValidationResult.error.statusCode }
          );
          
          return { allowed: false, response };
        }
        
        const sessionData = sessionValidationResult.data;
        authContext = {
          user: sessionData.session?.user,
          sessionId: sessionData.session?.id,
        };
        
        if (sessionData.warnings) {
          warnings.push(...sessionData.warnings);
        }
        
        if (sessionData.newToken) {
          newSessionToken = sessionData.newToken;
        }
      } else {
        // Standard authentication
        const authResult = await requireAuth(req);
        
        if (!authResult.success) {
          const response = NextResponse.json(
            { 
              success: false, 
              error: authResult.error.message 
            },
            { status: authResult.error.statusCode }
          );
          
          return { allowed: false, response };
        }
        
        authContext = authResult.data;
      }
    }
    
    // 4. Role-based Authorization
    if (config.requiredRoles && config.requiredRoles.length > 0) {
      const roleResult = await requireRole(req, config.requiredRoles);
      
      if (!roleResult.success) {
        const response = NextResponse.json(
          { 
            success: false, 
            error: roleResult.error.message 
          },
          { status: roleResult.error.statusCode }
        );
        
        return { allowed: false, response };
      }
      
      authContext = roleResult.data;
    }
    
    // 5. Resource Ownership Validation
    if (config.resourceOwnership?.enabled && authContext) {
      const resourceUserId = config.resourceOwnership.getUserId(req);
      const ownershipResult = await requireOwnership(req, resourceUserId);
      
      if (!ownershipResult.success) {
        const response = NextResponse.json(
          { 
            success: false, 
            error: ownershipResult.error.message 
          },
          { status: ownershipResult.error.statusCode }
        );
        
        return { allowed: false, response };
      }
    }
    
    // 6. Suspicious Activity Detection
    if (config.suspiciousActivityDetection) {
      const suspiciousActivityDetector = createSuspiciousActivityDetection({
        action: 'log', // Don't block, just log
        onSuspiciousActivity: async (event) => {
          warnings.push(`Suspicious activity detected: ${event.description}`);
        },
      });
      
      const suspiciousActivityResult = await suspiciousActivityDetector(req, authContext?.user?.id);
      
      if (!suspiciousActivityResult.success) {
        // Only block if it's a critical security issue
        if (suspiciousActivityResult.error.context?.severity === 'critical') {
          const response = NextResponse.json(
            { 
              success: false, 
              error: suspiciousActivityResult.error.message 
            },
            { status: suspiciousActivityResult.error.statusCode }
          );
          
          return { allowed: false, response };
        } else {
          warnings.push(`Security warning: ${suspiciousActivityResult.error.message}`);
        }
      }
    }
    
    // 7. Audit Logging
    if (config.auditLogging?.enabled) {
      const auditLogger = createAuditLogger({
        enableRequestLogging: config.auditLogging.logRequests ?? true,
        enableAuthLogging: config.auditLogging.logAuth ?? true,
        enableDataAccessLogging: config.auditLogging.logDataAccess ?? true,
        enableAdminActionLogging: config.auditLogging.logAdminActions ?? true,
      });
      
      // Log the request (response will be logged separately)
      await auditLogger.logRequest(
        req,
        undefined, // Response not available yet
        authContext?.user?.id,
        authContext?.sessionId
      );
    }
    
    return {
      allowed: true,
      authContext,
      warnings: warnings.length > 0 ? warnings : undefined,
      newSessionToken,
    };
    
  } catch (error) {
    console.error('Security middleware error:', error);
    
    const response = NextResponse.json(
      { 
        success: false, 
        error: 'Security validation failed' 
      },
      { status: 500 }
    );
    
    return { allowed: false, response };
  }
}

/**
 * Apply security headers to response
 */
export function applySecurityHeadersToResponse(
  response: NextResponse,
  config: SecurityMiddlewareConfig
): NextResponse {
  if (config.securityHeaders && config.securityHeaders !== 'none') {
    const headerConfig = SecurityHeaders[config.securityHeaders.toUpperCase() as keyof typeof SecurityHeaders];
    return headerConfig(response);
  }
  
  return response;
}

/**
 * Predefined security configurations
 */
export const SecurityConfigs = {
  /**
   * Public endpoint - minimal security
   */
  PUBLIC: {
    requireAuth: false,
    rateLimit: 'general' as const,
    csrfProtection: false,
    securityHeaders: 'development' as const,
    suspiciousActivityDetection: true,
    auditLogging: {
      enabled: true,
      logRequests: true,
      logAuth: false,
      logDataAccess: false,
      logAdminActions: false,
    },
  },
  
  /**
   * Authenticated endpoint - standard security
   */
  AUTHENTICATED: {
    requireAuth: true,
    rateLimit: 'api' as const,
    csrfProtection: true,
    securityHeaders: 'development' as const,
    suspiciousActivityDetection: true,
    enhancedSessionValidation: true,
    auditLogging: {
      enabled: true,
      logRequests: true,
      logAuth: true,
      logDataAccess: true,
      logAdminActions: false,
    },
  },
  
  /**
   * Admin endpoint - strict security
   */
  ADMIN: {
    requireAuth: true,
    requiredRoles: ['ADMIN'],
    rateLimit: 'api' as const,
    csrfProtection: true,
    securityHeaders: 'strict' as const,
    suspiciousActivityDetection: true,
    enhancedSessionValidation: true,
    auditLogging: {
      enabled: true,
      logRequests: true,
      logAuth: true,
      logDataAccess: true,
      logAdminActions: true,
    },
  },
  
  /**
   * Authentication endpoint - specialized security
   */
  AUTH: {
    requireAuth: false,
    rateLimit: 'auth' as const,
    csrfProtection: false, // CSRF not needed for auth endpoints
    securityHeaders: 'development' as const,
    suspiciousActivityDetection: true,
    auditLogging: {
      enabled: true,
      logRequests: true,
      logAuth: true,
      logDataAccess: false,
      logAdminActions: false,
    },
  },
  
  /**
   * API endpoint - balanced security
   */
  API: {
    requireAuth: true,
    rateLimit: 'api' as const,
    csrfProtection: false, // API endpoints typically use other auth methods
    securityHeaders: 'api' as const,
    suspiciousActivityDetection: true,
    enhancedSessionValidation: true,
    auditLogging: {
      enabled: true,
      logRequests: true,
      logAuth: true,
      logDataAccess: true,
      logAdminActions: false,
    },
  },
} as const;

/**
 * Helper function to create a complete security middleware for API routes
 */
export function createSecureAPIHandler(
  handler: (req: NextRequest, context: { params?: any }) => Promise<NextResponse>,
  config: SecurityMiddlewareConfig = SecurityConfigs.API
) {
  return async (req: NextRequest, context: { params?: any } = {}) => {
    // Apply security middleware
    const securityResult = await applySecurityMiddleware(req, config);
    
    if (!securityResult.allowed) {
      return securityResult.response!;
    }
    
    try {
      // Call the actual handler
      const response = await handler(req, context);
      
      // Apply security headers
      const secureResponse = applySecurityHeadersToResponse(response, config);
      
      // Add new session token if rotated
      if (securityResult.newSessionToken) {
        secureResponse.cookies.set('session-token', securityResult.newSessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        });
      }
      
      // Add security warnings as headers (for debugging)
      if (securityResult.warnings && process.env.NODE_ENV === 'development') {
        secureResponse.headers.set('X-Security-Warnings', securityResult.warnings.join('; '));
      }
      
      return secureResponse;
      
    } catch (error) {
      console.error('API handler error:', error);
      
      const errorResponse = NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error' 
        },
        { status: 500 }
      );
      
      return applySecurityHeadersToResponse(errorResponse, config);
    }
  };
}