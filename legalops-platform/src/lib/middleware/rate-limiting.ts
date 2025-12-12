/**
 * Rate Limiting Middleware
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Implements rate limiting for API endpoints to prevent abuse
 */

import { NextRequest } from 'next/server';
import { Result, AppError, err, ok } from '@/lib/types/result';

export interface RateLimitConfig {
  /** Maximum number of requests */
  maxRequests: number;
  
  /** Time window in milliseconds */
  windowMs: number;
  
  /** Custom identifier function (defaults to IP address) */
  keyGenerator?: (req: NextRequest) => string;
  
  /** Skip rate limiting for certain conditions */
  skip?: (req: NextRequest) => boolean;
  
  /** Custom error message */
  message?: string;
}

export interface RateLimitInfo {
  /** Total requests allowed in window */
  limit: number;
  
  /** Remaining requests in current window */
  remaining: number;
  
  /** Time when window resets (Unix timestamp) */
  resetTime: number;
  
  /** Whether request should be blocked */
  blocked: boolean;
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware factory
 */
export function createRateLimit(config: RateLimitConfig) {
  return async (req: NextRequest): Promise<Result<RateLimitInfo, AppError>> => {
    try {
      // Skip if configured to do so
      if (config.skip && config.skip(req)) {
        return ok({
          limit: config.maxRequests,
          remaining: config.maxRequests,
          resetTime: Date.now() + config.windowMs,
          blocked: false,
        });
      }

      // Generate key for this request
      const key = config.keyGenerator ? config.keyGenerator(req) : getClientIP(req);
      const now = Date.now();
      
      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);
      
      // Reset if window has expired
      if (!entry || now >= entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + config.windowMs,
        };
      }
      
      // Increment request count
      entry.count++;
      rateLimitStore.set(key, entry);
      
      // Check if limit exceeded
      const blocked = entry.count > config.maxRequests;
      const remaining = Math.max(0, config.maxRequests - entry.count);
      
      if (blocked) {
        return err(new AppError(
          config.message || 'Too many requests, please try again later',
          'RATE_LIMIT_EXCEEDED',
          429,
          {
            limit: config.maxRequests,
            remaining: 0,
            resetTime: entry.resetTime,
            retryAfter: Math.ceil((entry.resetTime - now) / 1000),
          }
        ));
      }
      
      return ok({
        limit: config.maxRequests,
        remaining,
        resetTime: entry.resetTime,
        blocked: false,
      });
      
    } catch (error) {
      return err(new AppError(
        'Rate limiting check failed',
        'RATE_LIMIT_ERROR',
        500,
        { originalError: error }
      ));
    }
  };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  // Strict rate limiting for authentication endpoints
  AUTH: createRateLimit({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts, please try again in 15 minutes',
  }),
  
  // Moderate rate limiting for API endpoints
  API: createRateLimit({
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many API requests, please try again later',
  }),
  
  // Lenient rate limiting for general endpoints
  GENERAL: createRateLimit({
    maxRequests: 1000,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }),
  
  // Very strict for password reset
  PASSWORD_RESET: createRateLimit({
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many password reset attempts, please try again in 1 hour',
  }),
  
  // File upload rate limiting
  UPLOAD: createRateLimit({
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many upload attempts, please wait a moment',
  }),
};

/**
 * Get client IP address from request
 */
function getClientIP(req: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default if no IP found
  return 'unknown';
}

/**
 * Clean up expired entries from rate limit store
 * Should be called periodically in production
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(key: string, config: RateLimitConfig): RateLimitInfo {
  const entry = rateLimitStore.get(key);
  const now = Date.now();
  
  if (!entry || now >= entry.resetTime) {
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
      blocked: false,
    };
  }
  
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const blocked = entry.count >= config.maxRequests;
  
  return {
    limit: config.maxRequests,
    remaining,
    resetTime: entry.resetTime,
    blocked,
  };
}