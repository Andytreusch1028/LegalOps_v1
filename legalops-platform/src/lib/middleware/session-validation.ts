/**
 * Session Validation Utilities
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Enhanced session validation with security checks and monitoring
 */

import { NextRequest } from 'next/server';
import { Result, AppError, err, ok } from '@/lib/types/result';
import { ServiceFactory } from '@/lib/services/service-factory';
import { AuthSession, User } from '@/generated/prisma';

export interface SessionValidationConfig {
  /** Enable IP address validation */
  validateIP?: boolean;
  
  /** Enable user agent validation */
  validateUserAgent?: boolean;
  
  /** Enable concurrent session limits */
  enableConcurrentSessionLimits?: boolean;
  
  /** Maximum concurrent sessions per user */
  maxConcurrentSessions?: number;
  
  /** Enable session rotation */
  enableSessionRotation?: boolean;
  
  /** Session rotation interval in milliseconds */
  sessionRotationInterval?: number;
  
  /** Enable suspicious activity detection */
  enableSuspiciousActivityDetection?: boolean;
  
  /** Custom validation rules */
  customValidators?: SessionValidator[];
}

export interface SessionValidator {
  /** Validator name */
  name: string;
  
  /** Validation function */
  validate: (session: AuthSession, req: NextRequest) => Promise<boolean>;
  
  /** Error message if validation fails */
  errorMessage: string;
  
  /** Error code if validation fails */
  errorCode: string;
}

export interface SessionValidationResult {
  /** Whether session is valid */
  valid: boolean;
  
  /** Session data if valid */
  session?: AuthSession & { user: User };
  
  /** Whether session was rotated */
  rotated?: boolean;
  
  /** New session token if rotated */
  newToken?: string;
  
  /** Validation warnings */
  warnings?: string[];
}

const DEFAULT_CONFIG: SessionValidationConfig = {
  validateIP: true,
  validateUserAgent: true,
  enableConcurrentSessionLimits: true,
  maxConcurrentSessions: 5,
  enableSessionRotation: true,
  sessionRotationInterval: 24 * 60 * 60 * 1000, // 24 hours
  enableSuspiciousActivityDetection: true,
  customValidators: [],
};

/**
 * Enhanced session validation with security checks
 */
export async function validateSessionWithSecurity(
  req: NextRequest,
  config: SessionValidationConfig = {}
): Promise<Result<SessionValidationResult, AppError>> {
  try {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Get session token
    const sessionToken = req.cookies.get('session-token')?.value;
    if (!sessionToken) {
      return err(new AppError(
        'No session token provided',
        'NO_SESSION_TOKEN',
        401
      ));
    }
    
    // Get session service
    const sessionService = ServiceFactory.getSessionService();
    
    // Validate basic session
    const sessionResult = await sessionService.validateSession(sessionToken);
    if (!sessionResult.success) {
      return err(new AppError(
        'Invalid or expired session',
        'INVALID_SESSION',
        401
      ));
    }
    
    const session = sessionResult.data;
    const warnings: string[] = [];
    let rotated = false;
    let newToken: string | undefined;
    
    // IP Address Validation
    if (fullConfig.validateIP && session.ipAddress) {
      const currentIP = getClientIP(req);
      if (session.ipAddress !== currentIP) {
        // Log suspicious activity but don't block (IP can change legitimately)
        warnings.push(`IP address changed from ${session.ipAddress} to ${currentIP}`);
        
        // Update session with new IP
        await sessionService.updateSessionMetadata(session.id, {
          ipAddress: currentIP,
          lastIPChange: new Date(),
        });
      }
    }
    
    // User Agent Validation
    if (fullConfig.validateUserAgent && session.userAgent) {
      const currentUserAgent = req.headers.get('user-agent') || '';
      if (session.userAgent !== currentUserAgent) {
        // Log suspicious activity but don't block (user agent can change)
        warnings.push('User agent changed');
        
        // Update session with new user agent
        await sessionService.updateSessionMetadata(session.id, {
          userAgent: currentUserAgent,
          lastUserAgentChange: new Date(),
        });
      }
    }
    
    // Concurrent Session Limits
    if (fullConfig.enableConcurrentSessionLimits) {
      const activeSessionsResult = await sessionService.getActiveSessions(session.userId);
      if (activeSessionsResult.success) {
        const activeSessions = activeSessionsResult.data;
        if (activeSessions.length > fullConfig.maxConcurrentSessions!) {
          // Terminate oldest sessions
          const sessionsToTerminate = activeSessions
            .sort((a, b) => new Date(a.lastAccessedAt).getTime() - new Date(b.lastAccessedAt).getTime())
            .slice(0, activeSessions.length - fullConfig.maxConcurrentSessions!);
          
          for (const sessionToTerminate of sessionsToTerminate) {
            await sessionService.terminateSession(sessionToTerminate.id);
          }
          
          warnings.push(`Terminated ${sessionsToTerminate.length} old sessions due to concurrent session limit`);
        }
      }
    }
    
    // Session Rotation
    if (fullConfig.enableSessionRotation) {
      const sessionAge = Date.now() - new Date(session.createdAt).getTime();
      if (sessionAge > fullConfig.sessionRotationInterval!) {
        // Rotate session
        const rotationResult = await sessionService.rotateSession(session.id);
        if (rotationResult.success) {
          rotated = true;
          newToken = rotationResult.data.token;
          warnings.push('Session rotated due to age');
        }
      }
    }
    
    // Custom Validators
    for (const validator of fullConfig.customValidators) {
      try {
        const isValid = await validator.validate(session, req);
        if (!isValid) {
          return err(new AppError(
            validator.errorMessage,
            validator.errorCode,
            401
          ));
        }
      } catch (error) {
        console.error(`Custom validator ${validator.name} failed:`, error);
        warnings.push(`Custom validator ${validator.name} encountered an error`);
      }
    }
    
    // Update session last accessed time
    await sessionService.updateSessionAccess(session.id);
    
    return ok({
      valid: true,
      session,
      rotated,
      newToken,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
    
  } catch (error) {
    return err(new AppError(
      'Session validation failed',
      'SESSION_VALIDATION_ERROR',
      500,
      { originalError: error }
    ));
  }
}

/**
 * Check for suspicious session activity
 */
export async function detectSuspiciousSessionActivity(
  session: AuthSession,
  req: NextRequest
): Promise<string[]> {
  const suspiciousActivities: string[] = [];
  
  try {
    const currentIP = getClientIP(req);
    const currentUserAgent = req.headers.get('user-agent') || '';
    
    // Check for rapid IP changes
    if (session.ipAddress && session.ipAddress !== currentIP) {
      // Check if IP changed recently
      const sessionService = ServiceFactory.getSessionService();
      const recentSessionsResult = await sessionService.getRecentSessions(session.userId, 24 * 60 * 60 * 1000); // Last 24 hours
      
      if (recentSessionsResult.success) {
        const recentSessions = recentSessionsResult.data;
        const uniqueIPs = new Set(recentSessions.map(s => s.ipAddress).filter(Boolean));
        
        if (uniqueIPs.size > 5) {
          suspiciousActivities.push('Multiple IP addresses used recently');
        }
      }
    }
    
    // Check for unusual user agent patterns
    if (session.userAgent && session.userAgent !== currentUserAgent) {
      const userAgentSimilarity = calculateUserAgentSimilarity(session.userAgent, currentUserAgent);
      if (userAgentSimilarity < 0.5) {
        suspiciousActivities.push('Significantly different user agent detected');
      }
    }
    
    // Check session duration
    const sessionDuration = Date.now() - new Date(session.createdAt).getTime();
    const maxNormalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    if (sessionDuration > maxNormalDuration) {
      suspiciousActivities.push('Unusually long session duration');
    }
    
    // Check for rapid requests (if we have access to request history)
    // This would require integration with rate limiting or request tracking
    
  } catch (error) {
    console.error('Error detecting suspicious session activity:', error);
  }
  
  return suspiciousActivities;
}

/**
 * Calculate similarity between two user agent strings
 */
function calculateUserAgentSimilarity(ua1: string, ua2: string): number {
  if (ua1 === ua2) return 1;
  
  // Simple similarity calculation based on common tokens
  const tokens1 = ua1.toLowerCase().split(/[\s\/\(\)]+/).filter(t => t.length > 2);
  const tokens2 = ua2.toLowerCase().split(/[\s\/\(\)]+/).filter(t => t.length > 2);
  
  const commonTokens = tokens1.filter(token => tokens2.includes(token));
  const totalTokens = new Set([...tokens1, ...tokens2]).size;
  
  return totalTokens > 0 ? commonTokens.length / totalTokens : 0;
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
 * Predefined session validators
 */
export const SessionValidators = {
  /**
   * Validate that session hasn't been inactive too long
   */
  INACTIVITY_TIMEOUT: {
    name: 'inactivity_timeout',
    validate: async (session: AuthSession) => {
      const maxInactivity = 2 * 60 * 60 * 1000; // 2 hours
      const lastAccess = new Date(session.lastAccessedAt).getTime();
      return Date.now() - lastAccess < maxInactivity;
    },
    errorMessage: 'Session expired due to inactivity',
    errorCode: 'SESSION_INACTIVE',
  },
  
  /**
   * Validate that session is from a trusted device (if device tracking is enabled)
   */
  TRUSTED_DEVICE: {
    name: 'trusted_device',
    validate: async (session: AuthSession, req: NextRequest) => {
      // This would integrate with a device fingerprinting system
      // For now, always return true
      return true;
    },
    errorMessage: 'Session from untrusted device',
    errorCode: 'UNTRUSTED_DEVICE',
  },
  
  /**
   * Validate geolocation if enabled
   */
  GEOLOCATION: {
    name: 'geolocation',
    validate: async (session: AuthSession, req: NextRequest) => {
      // This would integrate with a geolocation service
      // For now, always return true
      return true;
    },
    errorMessage: 'Session from suspicious location',
    errorCode: 'SUSPICIOUS_LOCATION',
  },
};