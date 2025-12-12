/**
 * Security Middleware
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Export all security middleware and utilities
 */

// Authentication middleware
export { requireAuth, requireRole, requireOwnership } from './auth';
export type { AuthContext } from './auth';

// Rate limiting middleware
export { 
  createRateLimit, 
  RateLimits, 
  cleanupRateLimitStore, 
  getRateLimitStatus 
} from './rate-limiting';
export type { 
  RateLimitConfig, 
  RateLimitInfo 
} from './rate-limiting';

// CSRF protection middleware
export { 
  createCSRFProtection, 
  CSRFProtection, 
  generateCSRFToken, 
  verifyCSRFToken, 
  extractCSRFToken, 
  createCSRFHeaders 
} from './csrf-protection';
export type { 
  CSRFConfig, 
  CSRFToken 
} from './csrf-protection';

// Security headers middleware
export { 
  applySecurityHeaders, 
  createSecurityHeaders, 
  SecurityHeaders, 
  getSecurityHeaders 
} from './security-headers';
export type { 
  SecurityHeadersConfig 
} from './security-headers';

// Suspicious activity detection
export { 
  createSuspiciousActivityDetection, 
  cleanupActivityStore, 
  getActivityStats 
} from './suspicious-activity';
export type { 
  SuspiciousActivityConfig, 
  SuspiciousActivityRule, 
  ActivityContext, 
  SuspiciousActivityEvent 
} from './suspicious-activity';

// Audit logging
export { 
  createAuditLogger, 
  AuditLogger 
} from './audit-logging';
export type { 
  AuditLogConfig, 
  AuditLogEvent 
} from './audit-logging';

// Session validation utilities
export { 
  validateSessionWithSecurity, 
  detectSuspiciousSessionActivity, 
  SessionValidators 
} from './session-validation';
export type { 
  SessionValidationConfig, 
  SessionValidator, 
  SessionValidationResult 
} from './session-validation';