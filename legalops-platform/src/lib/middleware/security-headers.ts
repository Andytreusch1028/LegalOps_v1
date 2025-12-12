/**
 * Security Headers Middleware
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Implements security headers for enhanced protection
 */

import { NextRequest, NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  /** Content Security Policy */
  contentSecurityPolicy?: string | boolean;
  
  /** X-Frame-Options */
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string | boolean;
  
  /** X-Content-Type-Options */
  contentTypeOptions?: boolean;
  
  /** X-XSS-Protection */
  xssProtection?: boolean;
  
  /** Referrer-Policy */
  referrerPolicy?: string | boolean;
  
  /** Strict-Transport-Security */
  strictTransportSecurity?: string | boolean;
  
  /** Permissions-Policy */
  permissionsPolicy?: string | boolean;
  
  /** Cross-Origin-Embedder-Policy */
  crossOriginEmbedderPolicy?: string | boolean;
  
  /** Cross-Origin-Opener-Policy */
  crossOriginOpenerPolicy?: string | boolean;
  
  /** Cross-Origin-Resource-Policy */
  crossOriginResourcePolicy?: string | boolean;
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  contentSecurityPolicy: true,
  frameOptions: 'DENY',
  contentTypeOptions: true,
  xssProtection: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
  crossOriginEmbedderPolicy: 'require-corp',
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'same-origin',
};

/**
 * Default Content Security Policy
 */
const DEFAULT_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-* should be removed in production
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "child-src 'self'",
  "worker-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "manifest-src 'self'",
].join('; ');

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = {}
): NextResponse {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Content Security Policy
  if (fullConfig.contentSecurityPolicy) {
    const csp = typeof fullConfig.contentSecurityPolicy === 'string'
      ? fullConfig.contentSecurityPolicy
      : DEFAULT_CSP;
    response.headers.set('Content-Security-Policy', csp);
  }
  
  // X-Frame-Options
  if (fullConfig.frameOptions) {
    const frameOptions = typeof fullConfig.frameOptions === 'string'
      ? fullConfig.frameOptions
      : 'DENY';
    response.headers.set('X-Frame-Options', frameOptions);
  }
  
  // X-Content-Type-Options
  if (fullConfig.contentTypeOptions) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }
  
  // X-XSS-Protection
  if (fullConfig.xssProtection) {
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }
  
  // Referrer-Policy
  if (fullConfig.referrerPolicy) {
    const referrerPolicy = typeof fullConfig.referrerPolicy === 'string'
      ? fullConfig.referrerPolicy
      : 'strict-origin-when-cross-origin';
    response.headers.set('Referrer-Policy', referrerPolicy);
  }
  
  // Strict-Transport-Security
  if (fullConfig.strictTransportSecurity) {
    const hsts = typeof fullConfig.strictTransportSecurity === 'string'
      ? fullConfig.strictTransportSecurity
      : 'max-age=31536000; includeSubDomains';
    response.headers.set('Strict-Transport-Security', hsts);
  }
  
  // Permissions-Policy
  if (fullConfig.permissionsPolicy) {
    const permissionsPolicy = typeof fullConfig.permissionsPolicy === 'string'
      ? fullConfig.permissionsPolicy
      : 'camera=(), microphone=(), geolocation=()';
    response.headers.set('Permissions-Policy', permissionsPolicy);
  }
  
  // Cross-Origin-Embedder-Policy
  if (fullConfig.crossOriginEmbedderPolicy) {
    const coep = typeof fullConfig.crossOriginEmbedderPolicy === 'string'
      ? fullConfig.crossOriginEmbedderPolicy
      : 'require-corp';
    response.headers.set('Cross-Origin-Embedder-Policy', coep);
  }
  
  // Cross-Origin-Opener-Policy
  if (fullConfig.crossOriginOpenerPolicy) {
    const coop = typeof fullConfig.crossOriginOpenerPolicy === 'string'
      ? fullConfig.crossOriginOpenerPolicy
      : 'same-origin';
    response.headers.set('Cross-Origin-Opener-Policy', coop);
  }
  
  // Cross-Origin-Resource-Policy
  if (fullConfig.crossOriginResourcePolicy) {
    const corp = typeof fullConfig.crossOriginResourcePolicy === 'string'
      ? fullConfig.crossOriginResourcePolicy
      : 'same-origin';
    response.headers.set('Cross-Origin-Resource-Policy', corp);
  }
  
  return response;
}

/**
 * Security headers middleware factory
 */
export function createSecurityHeaders(config: SecurityHeadersConfig = {}) {
  return (response: NextResponse): NextResponse => {
    return applySecurityHeaders(response, config);
  };
}

/**
 * Predefined security header configurations
 */
export const SecurityHeaders = {
  // Strict security headers for production
  STRICT: createSecurityHeaders({
    contentSecurityPolicy: [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "child-src 'none'",
      "worker-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; '),
    frameOptions: 'DENY',
    strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
  }),
  
  // Moderate security headers for development
  DEVELOPMENT: createSecurityHeaders({
    contentSecurityPolicy: DEFAULT_CSP,
    frameOptions: 'SAMEORIGIN',
    strictTransportSecurity: false, // Don't enforce HTTPS in development
  }),
  
  // API-specific security headers
  API: createSecurityHeaders({
    contentSecurityPolicy: "default-src 'none'",
    frameOptions: 'DENY',
    contentTypeOptions: true,
    crossOriginResourcePolicy: 'cross-origin',
  }),
};

/**
 * Get security headers as object (useful for manual application)
 */
export function getSecurityHeaders(config: SecurityHeadersConfig = {}): Record<string, string> {
  const headers: Record<string, string> = {};
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (fullConfig.contentSecurityPolicy) {
    const csp = typeof fullConfig.contentSecurityPolicy === 'string'
      ? fullConfig.contentSecurityPolicy
      : DEFAULT_CSP;
    headers['Content-Security-Policy'] = csp;
  }
  
  if (fullConfig.frameOptions) {
    const frameOptions = typeof fullConfig.frameOptions === 'string'
      ? fullConfig.frameOptions
      : 'DENY';
    headers['X-Frame-Options'] = frameOptions;
  }
  
  if (fullConfig.contentTypeOptions) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }
  
  if (fullConfig.xssProtection) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }
  
  if (fullConfig.referrerPolicy) {
    const referrerPolicy = typeof fullConfig.referrerPolicy === 'string'
      ? fullConfig.referrerPolicy
      : 'strict-origin-when-cross-origin';
    headers['Referrer-Policy'] = referrerPolicy;
  }
  
  if (fullConfig.strictTransportSecurity) {
    const hsts = typeof fullConfig.strictTransportSecurity === 'string'
      ? fullConfig.strictTransportSecurity
      : 'max-age=31536000; includeSubDomains';
    headers['Strict-Transport-Security'] = hsts;
  }
  
  if (fullConfig.permissionsPolicy) {
    const permissionsPolicy = typeof fullConfig.permissionsPolicy === 'string'
      ? fullConfig.permissionsPolicy
      : 'camera=(), microphone=(), geolocation=()';
    headers['Permissions-Policy'] = permissionsPolicy;
  }
  
  if (fullConfig.crossOriginEmbedderPolicy) {
    const coep = typeof fullConfig.crossOriginEmbedderPolicy === 'string'
      ? fullConfig.crossOriginEmbedderPolicy
      : 'require-corp';
    headers['Cross-Origin-Embedder-Policy'] = coep;
  }
  
  if (fullConfig.crossOriginOpenerPolicy) {
    const coop = typeof fullConfig.crossOriginOpenerPolicy === 'string'
      ? fullConfig.crossOriginOpenerPolicy
      : 'same-origin';
    headers['Cross-Origin-Opener-Policy'] = coop;
  }
  
  if (fullConfig.crossOriginResourcePolicy) {
    const corp = typeof fullConfig.crossOriginResourcePolicy === 'string'
      ? fullConfig.crossOriginResourcePolicy
      : 'same-origin';
    headers['Cross-Origin-Resource-Policy'] = corp;
  }
  
  return headers;
}