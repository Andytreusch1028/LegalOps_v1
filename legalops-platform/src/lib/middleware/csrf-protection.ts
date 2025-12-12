/**
 * CSRF Protection Middleware
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Implements CSRF protection for form submissions and state-changing operations
 */

import { NextRequest } from 'next/server';
import { Result, AppError, err, ok } from '@/lib/types/result';
import crypto from 'crypto';

export interface CSRFConfig {
  /** Secret key for token generation */
  secret: string;
  
  /** Token header name */
  headerName?: string;
  
  /** Token cookie name */
  cookieName?: string;
  
  /** Skip CSRF check for certain conditions */
  skip?: (req: NextRequest) => boolean;
  
  /** Custom error message */
  message?: string;
}

export interface CSRFToken {
  /** The CSRF token value */
  token: string;
  
  /** Token expiration time */
  expiresAt: number;
}

const DEFAULT_CONFIG: Partial<CSRFConfig> = {
  headerName: 'x-csrf-token',
  cookieName: 'csrf-token',
  message: 'Invalid CSRF token',
};

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(secret: string, expirationMs = 24 * 60 * 60 * 1000): CSRFToken {
  const timestamp = Date.now();
  const expiresAt = timestamp + expirationMs;
  
  // Create token payload
  const payload = `${timestamp}:${expiresAt}`;
  
  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  // Combine payload and signature
  const token = Buffer.from(`${payload}:${signature}`).toString('base64');
  
  return {
    token,
    expiresAt,
  };
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(token: string, secret: string): boolean {
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length !== 3) {
      return false;
    }
    
    const [timestamp, expiresAt, signature] = parts;
    const payload = `${timestamp}:${expiresAt}`;
    
    // Check expiration
    if (Date.now() > parseInt(expiresAt)) {
      return false;
    }
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
    
  } catch (error) {
    return false;
  }
}

/**
 * CSRF protection middleware factory
 */
export function createCSRFProtection(config: CSRFConfig) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  return async (req: NextRequest): Promise<Result<void, AppError>> => {
    try {
      // Skip if configured to do so
      if (fullConfig.skip && fullConfig.skip(req)) {
        return ok(undefined);
      }
      
      // Only check CSRF for state-changing methods
      const method = req.method.toUpperCase();
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        return ok(undefined);
      }
      
      // Get token from header
      const headerToken = req.headers.get(fullConfig.headerName!);
      
      // Get token from cookie for comparison (double-submit cookie pattern)
      const cookieToken = req.cookies.get(fullConfig.cookieName!)?.value;
      
      if (!headerToken || !cookieToken) {
        return err(new AppError(
          fullConfig.message || 'CSRF token missing',
          'CSRF_TOKEN_MISSING',
          403
        ));
      }
      
      // Verify both tokens are valid and match
      const headerValid = verifyCSRFToken(headerToken, config.secret);
      const cookieValid = verifyCSRFToken(cookieToken, config.secret);
      
      if (!headerValid || !cookieValid || headerToken !== cookieToken) {
        return err(new AppError(
          fullConfig.message || 'Invalid CSRF token',
          'CSRF_TOKEN_INVALID',
          403
        ));
      }
      
      return ok(undefined);
      
    } catch (error) {
      return err(new AppError(
        'CSRF validation failed',
        'CSRF_VALIDATION_ERROR',
        500,
        { originalError: error }
      ));
    }
  };
}

/**
 * Predefined CSRF protection configurations
 */
export const CSRFProtection = {
  // Standard CSRF protection
  STANDARD: createCSRFProtection({
    secret: process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  }),
  
  // CSRF protection that skips GET requests and API endpoints
  FORMS_ONLY: createCSRFProtection({
    secret: process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
    skip: (req) => {
      const method = req.method.toUpperCase();
      const path = req.nextUrl.pathname;
      
      // Skip for GET requests
      if (method === 'GET') return true;
      
      // Skip for API endpoints that use other authentication
      if (path.startsWith('/api/auth/')) return true;
      
      return false;
    },
  }),
};

/**
 * Extract CSRF token from various sources in request
 */
export function extractCSRFToken(req: NextRequest, config: Partial<CSRFConfig> = {}): string | null {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Try header first
  const headerToken = req.headers.get(fullConfig.headerName!);
  if (headerToken) return headerToken;
  
  // Try cookie
  const cookieToken = req.cookies.get(fullConfig.cookieName!)?.value;
  if (cookieToken) return cookieToken;
  
  return null;
}

/**
 * Create CSRF token response headers
 */
export function createCSRFHeaders(token: string, config: Partial<CSRFConfig> = {}): Record<string, string> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  return {
    'Set-Cookie': `${fullConfig.cookieName}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`,
    'X-CSRF-Token': token,
  };
}