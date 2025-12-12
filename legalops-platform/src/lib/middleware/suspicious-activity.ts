/**
 * Suspicious Activity Detection Middleware
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Detects and responds to suspicious user behavior and security threats
 */

import { NextRequest } from 'next/server';
import { Result, AppError, err, ok } from '@/lib/types/result';
import { ServiceFactory } from '@/lib/services/service-factory';

export interface SuspiciousActivityConfig {
  /** Enable IP-based detection */
  enableIPDetection?: boolean;
  
  /** Enable user agent detection */
  enableUserAgentDetection?: boolean;
  
  /** Enable behavioral detection */
  enableBehavioralDetection?: boolean;
  
  /** Enable geolocation detection */
  enableGeolocationDetection?: boolean;
  
  /** Custom detection rules */
  customRules?: SuspiciousActivityRule[];
  
  /** Action to take when suspicious activity is detected */
  action?: 'log' | 'block' | 'challenge';
  
  /** Callback for suspicious activity events */
  onSuspiciousActivity?: (event: SuspiciousActivityEvent) => Promise<void>;
}

export interface SuspiciousActivityRule {
  /** Rule name */
  name: string;
  
  /** Rule description */
  description: string;
  
  /** Rule severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /** Rule detection function */
  detect: (context: ActivityContext) => boolean;
  
  /** Rule-specific action */
  action?: 'log' | 'block' | 'challenge';
}

export interface ActivityContext {
  /** Request object */
  request: NextRequest;
  
  /** User ID if authenticated */
  userId?: string;
  
  /** Client IP address */
  clientIP: string;
  
  /** User agent string */
  userAgent: string;
  
  /** Request timestamp */
  timestamp: number;
  
  /** Request path */
  path: string;
  
  /** Request method */
  method: string;
  
  /** Additional context data */
  metadata?: Record<string, unknown>;
}

export interface SuspiciousActivityEvent {
  /** Event ID */
  id: string;
  
  /** Event type */
  type: 'ip_anomaly' | 'user_agent_anomaly' | 'behavioral_anomaly' | 'geolocation_anomaly' | 'custom_rule';
  
  /** Event severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /** Event description */
  description: string;
  
  /** User ID if available */
  userId?: string;
  
  /** Client IP address */
  clientIP: string;
  
  /** User agent */
  userAgent: string;
  
  /** Request details */
  request: {
    method: string;
    path: string;
    headers: Record<string, string>;
  };
  
  /** Detection rule that triggered */
  rule?: string;
  
  /** Event timestamp */
  timestamp: number;
  
  /** Additional event data */
  metadata?: Record<string, unknown>;
}

// In-memory store for activity tracking (use Redis in production)
const activityStore = new Map<string, ActivityRecord[]>();

interface ActivityRecord {
  timestamp: number;
  path: string;
  method: string;
  userAgent: string;
  userId?: string;
}

/**
 * Default suspicious activity rules
 */
const DEFAULT_RULES: SuspiciousActivityRule[] = [
  {
    name: 'rapid_requests',
    description: 'Too many requests in short time period',
    severity: 'medium',
    detect: (context) => {
      const records = getActivityRecords(context.clientIP);
      const recentRequests = records.filter(r => 
        context.timestamp - r.timestamp < 60000 // Last minute
      );
      return recentRequests.length > 50; // More than 50 requests per minute
    },
  },
  
  {
    name: 'suspicious_user_agent',
    description: 'Suspicious or automated user agent detected',
    severity: 'low',
    detect: (context) => {
      const ua = context.userAgent.toLowerCase();
      const suspiciousPatterns = [
        'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java',
        'automated', 'test', 'monitor', 'check', 'scan'
      ];
      return suspiciousPatterns.some(pattern => ua.includes(pattern));
    },
  },
  
  {
    name: 'auth_brute_force',
    description: 'Multiple failed authentication attempts',
    severity: 'high',
    detect: (context) => {
      if (!context.path.includes('/auth/')) return false;
      
      const records = getActivityRecords(context.clientIP);
      const authAttempts = records.filter(r => 
        r.path.includes('/auth/') && 
        context.timestamp - r.timestamp < 300000 // Last 5 minutes
      );
      return authAttempts.length > 10; // More than 10 auth attempts in 5 minutes
    },
    action: 'block',
  },
  
  {
    name: 'multiple_user_agents',
    description: 'Multiple different user agents from same IP',
    severity: 'medium',
    detect: (context) => {
      const records = getActivityRecords(context.clientIP);
      const recentRecords = records.filter(r => 
        context.timestamp - r.timestamp < 3600000 // Last hour
      );
      const uniqueUserAgents = new Set(recentRecords.map(r => r.userAgent));
      return uniqueUserAgents.size > 5; // More than 5 different user agents
    },
  },
  
  {
    name: 'sensitive_endpoint_access',
    description: 'Accessing sensitive endpoints without proper authentication',
    severity: 'high',
    detect: (context) => {
      const sensitiveEndpoints = ['/admin', '/api/admin', '/api/users', '/api/export'];
      const isSensitive = sensitiveEndpoints.some(endpoint => 
        context.path.startsWith(endpoint)
      );
      return isSensitive && !context.userId;
    },
    action: 'block',
  },
  
  {
    name: 'unusual_request_pattern',
    description: 'Unusual request patterns indicating automation',
    severity: 'medium',
    detect: (context) => {
      const records = getActivityRecords(context.clientIP);
      const recentRecords = records.filter(r => 
        context.timestamp - r.timestamp < 600000 // Last 10 minutes
      );
      
      if (recentRecords.length < 10) return false;
      
      // Check for perfectly timed requests (indicating automation)
      const intervals = [];
      for (let i = 1; i < recentRecords.length; i++) {
        intervals.push(recentRecords[i].timestamp - recentRecords[i-1].timestamp);
      }
      
      // If most intervals are very similar, it's likely automated
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const similarIntervals = intervals.filter(interval => 
        Math.abs(interval - avgInterval) < 1000 // Within 1 second
      );
      
      return similarIntervals.length / intervals.length > 0.8; // 80% similar timing
    },
  },
];

/**
 * Suspicious activity detection middleware factory
 */
export function createSuspiciousActivityDetection(config: SuspiciousActivityConfig = {}) {
  const fullConfig = {
    enableIPDetection: true,
    enableUserAgentDetection: true,
    enableBehavioralDetection: true,
    enableGeolocationDetection: false,
    customRules: [],
    action: 'log' as const,
    ...config,
  };
  
  const allRules = [...DEFAULT_RULES, ...fullConfig.customRules];
  
  return async (req: NextRequest, userId?: string): Promise<Result<void, AppError>> => {
    try {
      const clientIP = getClientIP(req);
      const userAgent = req.headers.get('user-agent') || 'unknown';
      const timestamp = Date.now();
      
      const context: ActivityContext = {
        request: req,
        userId,
        clientIP,
        userAgent,
        timestamp,
        path: req.nextUrl.pathname,
        method: req.method,
      };
      
      // Record this activity
      recordActivity(clientIP, {
        timestamp,
        path: context.path,
        method: context.method,
        userAgent,
        userId,
      });
      
      // Check all rules
      const triggeredRules = allRules.filter(rule => {
        try {
          return rule.detect(context);
        } catch (error) {
          console.error(`Error in suspicious activity rule ${rule.name}:`, error);
          return false;
        }
      });
      
      // Handle triggered rules
      for (const rule of triggeredRules) {
        const event: SuspiciousActivityEvent = {
          id: generateEventId(),
          type: 'custom_rule',
          severity: rule.severity,
          description: rule.description,
          userId,
          clientIP,
          userAgent,
          request: {
            method: context.method,
            path: context.path,
            headers: Object.fromEntries(req.headers.entries()),
          },
          rule: rule.name,
          timestamp,
        };
        
        // Log the event
        await logSuspiciousActivity(event);
        
        // Call callback if provided
        if (fullConfig.onSuspiciousActivity) {
          await fullConfig.onSuspiciousActivity(event);
        }
        
        // Determine action to take
        const action = rule.action || fullConfig.action;
        
        if (action === 'block') {
          return err(new AppError(
            'Suspicious activity detected',
            'SUSPICIOUS_ACTIVITY_BLOCKED',
            403,
            { rule: rule.name, severity: rule.severity }
          ));
        }
        
        if (action === 'challenge') {
          return err(new AppError(
            'Additional verification required',
            'SUSPICIOUS_ACTIVITY_CHALLENGE',
            429,
            { rule: rule.name, severity: rule.severity }
          ));
        }
      }
      
      return ok(undefined);
      
    } catch (error) {
      console.error('Suspicious activity detection error:', error);
      return ok(undefined); // Don't block on detection errors
    }
  };
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
 * Record activity for an IP address
 */
function recordActivity(ip: string, record: ActivityRecord): void {
  const records = activityStore.get(ip) || [];
  records.push(record);
  
  // Keep only last 1000 records per IP
  if (records.length > 1000) {
    records.splice(0, records.length - 1000);
  }
  
  activityStore.set(ip, records);
}

/**
 * Get activity records for an IP address
 */
function getActivityRecords(ip: string): ActivityRecord[] {
  return activityStore.get(ip) || [];
}

/**
 * Generate unique event ID
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log suspicious activity event
 */
async function logSuspiciousActivity(event: SuspiciousActivityEvent): Promise<void> {
  try {
    // In production, this should log to a security monitoring system
    console.warn('Suspicious activity detected:', {
      id: event.id,
      type: event.type,
      severity: event.severity,
      description: event.description,
      clientIP: event.clientIP,
      userId: event.userId,
      rule: event.rule,
      timestamp: new Date(event.timestamp).toISOString(),
    });
    
    // TODO: Integrate with security monitoring service
    // await securityMonitoringService.logEvent(event);
    
  } catch (error) {
    console.error('Failed to log suspicious activity:', error);
  }
}

/**
 * Clean up old activity records
 */
export function cleanupActivityStore(): void {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
  
  for (const [ip, records] of activityStore.entries()) {
    const filteredRecords = records.filter(record => record.timestamp > cutoff);
    
    if (filteredRecords.length === 0) {
      activityStore.delete(ip);
    } else {
      activityStore.set(ip, filteredRecords);
    }
  }
}

/**
 * Get activity statistics for monitoring
 */
export function getActivityStats(): {
  totalIPs: number;
  totalRecords: number;
  suspiciousIPs: string[];
} {
  const totalIPs = activityStore.size;
  let totalRecords = 0;
  const suspiciousIPs: string[] = [];
  
  for (const [ip, records] of activityStore.entries()) {
    totalRecords += records.length;
    
    // Mark IPs with high activity as suspicious
    const recentRecords = records.filter(r => 
      Date.now() - r.timestamp < 3600000 // Last hour
    );
    
    if (recentRecords.length > 100) {
      suspiciousIPs.push(ip);
    }
  }
  
  return {
    totalIPs,
    totalRecords,
    suspiciousIPs,
  };
}