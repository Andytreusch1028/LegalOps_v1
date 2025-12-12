/**
 * Session Cleanup Background Job Service
 * 
 * Handles automated session cleanup, analytics, monitoring, and security alerts.
 * Runs as a background job to maintain session hygiene and security.
 */

import { BaseService } from './base.service';
import { ILogger } from '../interfaces/logger.interface';
import { ISessionService } from '../interfaces/session.interface';
import { ISessionRepository } from '../interfaces/session-repository.interface';
import { IAlertService } from '../interfaces/alert.interface';
import { Result, ok, err } from '../types/result';

/**
 * Session analytics data structure
 */
export interface SessionAnalytics {
  totalActiveSessions: number;
  expiredSessionsCleanedUp: number;
  suspiciousSessionsDetected: number;
  sessionsRotated: number;
  averageSessionDuration: number;
  uniqueActiveUsers: number;
  peakConcurrentSessions: number;
  sessionsByDevice: Record<string, number>;
  sessionsByLocation: Record<string, number>;
  securityAlertsGenerated: number;
}

/**
 * Suspicious activity patterns
 */
export interface SuspiciousActivity {
  sessionId: string;
  userId: string;
  activityType: 'MULTIPLE_IPS' | 'RAPID_LOCATION_CHANGE' | 'UNUSUAL_DEVICE' | 'CONCURRENT_SESSIONS' | 'BRUTE_FORCE_PATTERN';
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata: Record<string, any>;
  detectedAt: Date;
}

/**
 * Session cleanup configuration
 */
export interface SessionCleanupConfig {
  cleanupIntervalMs: number;
  analyticsRetentionDays: number;
  maxConcurrentSessionsPerUser: number;
  suspiciousActivityThresholds: {
    maxIpChangesPerHour: number;
    maxLocationChangesPerDay: number;
    maxConcurrentSessions: number;
    maxFailedAttemptsPerHour: number;
  };
  sessionRotationConfig: {
    enabled: boolean;
    rotateAfterHours: number;
    rotateOnSuspiciousActivity: boolean;
  };
}

/**
 * Default session cleanup configuration
 */
export const DEFAULT_SESSION_CLEANUP_CONFIG: SessionCleanupConfig = {
  cleanupIntervalMs: 60 * 60 * 1000, // 1 hour
  analyticsRetentionDays: 30,
  maxConcurrentSessionsPerUser: 10,
  suspiciousActivityThresholds: {
    maxIpChangesPerHour: 5,
    maxLocationChangesPerDay: 3,
    maxConcurrentSessions: 5,
    maxFailedAttemptsPerHour: 10
  },
  sessionRotationConfig: {
    enabled: true,
    rotateAfterHours: 12,
    rotateOnSuspiciousActivity: true
  }
};

/**
 * Session cleanup background job service
 */
export class SessionCleanupService extends BaseService {
  readonly name = 'SessionCleanupService';
  
  private cleanupTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastAnalytics: SessionAnalytics | null = null;

  constructor(
    logger: ILogger,
    private readonly sessionService: ISessionService,
    private readonly sessionRepository: ISessionRepository,
    private readonly alertService: IAlertService,
    private readonly config: SessionCleanupConfig = DEFAULT_SESSION_CLEANUP_CONFIG
  ) {
    super(logger);
  }

  /**
   * Start the background cleanup job
   */
  async start(): Promise<Result<void>> {
    try {
      if (this.isRunning) {
        this.logWarn('Session cleanup service is already running');
        return ok(undefined);
      }

      this.logInfo('Starting session cleanup background service', {
        cleanupInterval: this.config.cleanupIntervalMs,
        config: this.config
      });

      this.isRunning = true;

      // Run initial cleanup
      await this.runCleanupCycle();

      // Schedule recurring cleanup
      this.cleanupTimer = setInterval(async () => {
        try {
          await this.runCleanupCycle();
        } catch (error) {
          this.logError('Error in scheduled cleanup cycle', error);
        }
      }, this.config.cleanupIntervalMs);

      this.logInfo('Session cleanup service started successfully');
      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to start session cleanup service',
        'SESSION_CLEANUP_START_FAILED',
        500
      ));
    }
  }

  /**
   * Stop the background cleanup job
   */
  async stop(): Promise<Result<void>> {
    try {
      if (!this.isRunning) {
        this.logWarn('Session cleanup service is not running');
        return ok(undefined);
      }

      this.logInfo('Stopping session cleanup background service');

      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
      }

      this.isRunning = false;

      this.logInfo('Session cleanup service stopped successfully');
      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to stop session cleanup service',
        'SESSION_CLEANUP_STOP_FAILED',
        500
      ));
    }
  }

  /**
   * Run a complete cleanup cycle
   */
  async runCleanupCycle(): Promise<Result<SessionAnalytics>> {
    try {
      this.logInfo('Starting session cleanup cycle');

      const analytics: SessionAnalytics = {
        totalActiveSessions: 0,
        expiredSessionsCleanedUp: 0,
        suspiciousSessionsDetected: 0,
        sessionsRotated: 0,
        averageSessionDuration: 0,
        uniqueActiveUsers: 0,
        peakConcurrentSessions: 0,
        sessionsByDevice: {},
        sessionsByLocation: {},
        securityAlertsGenerated: 0
      };

      // Step 1: Clean up expired sessions
      const cleanupResult = await this.cleanupExpiredSessions();
      if (cleanupResult.isSuccess()) {
        analytics.expiredSessionsCleanedUp = cleanupResult.value;
      }

      // Step 2: Detect suspicious activity
      const suspiciousActivityResult = await this.detectSuspiciousActivity();
      if (suspiciousActivityResult.isSuccess()) {
        analytics.suspiciousSessionsDetected = suspiciousActivityResult.value.length;
        
        // Generate security alerts for suspicious activity
        for (const activity of suspiciousActivityResult.value) {
          await this.generateSecurityAlert(activity);
          analytics.securityAlertsGenerated++;
        }
      }

      // Step 3: Rotate sessions if needed
      const rotationResult = await this.rotateSessionsIfNeeded();
      if (rotationResult.isSuccess()) {
        analytics.sessionsRotated = rotationResult.value;
      }

      // Step 4: Collect session analytics
      const analyticsResult = await this.collectSessionAnalytics();
      if (analyticsResult.isSuccess()) {
        Object.assign(analytics, analyticsResult.value);
      }

      // Step 5: Clean up old analytics data
      await this.cleanupOldAnalytics();

      this.lastAnalytics = analytics;

      this.logInfo('Session cleanup cycle completed', analytics);

      return ok(analytics);
    } catch (error) {
      return err(this.handleError(
        error,
        'Session cleanup cycle failed',
        'SESSION_CLEANUP_CYCLE_FAILED',
        500
      ));
    }
  }

  /**
   * Clean up expired sessions
   */
  private async cleanupExpiredSessions(): Promise<Result<number>> {
    try {
      this.logDebug('Cleaning up expired sessions');

      const result = await this.sessionService.cleanupExpiredSessions();
      
      if (result.isSuccess()) {
        const cleanedCount = result.value;
        this.logInfo('Expired sessions cleaned up', { cleanedCount });
        return ok(cleanedCount);
      } else {
        this.logError('Failed to clean up expired sessions', result.error);
        return err(result.error);
      }
    } catch (error) {
      return err(this.handleError(
        error,
        'Expired session cleanup failed',
        'EXPIRED_SESSION_CLEANUP_FAILED',
        500
      ));
    }
  }

  /**
   * Detect suspicious activity patterns
   */
  private async detectSuspiciousActivity(): Promise<Result<SuspiciousActivity[]>> {
    try {
      this.logDebug('Detecting suspicious session activity');

      const suspiciousActivities: SuspiciousActivity[] = [];

      // Get recent session activity (last 24 hours)
      const recentSessionsResult = await this.sessionRepository.findRecentSessions(24 * 60 * 60 * 1000);
      
      if (!recentSessionsResult.isSuccess()) {
        return err(recentSessionsResult.error);
      }

      const recentSessions = recentSessionsResult.value;

      // Group sessions by user
      const sessionsByUser = new Map<string, typeof recentSessions>();
      for (const session of recentSessions) {
        if (!sessionsByUser.has(session.userId)) {
          sessionsByUser.set(session.userId, []);
        }
        sessionsByUser.get(session.userId)!.push(session);
      }

      // Analyze each user's sessions for suspicious patterns
      for (const [userId, userSessions] of sessionsByUser.entries()) {
        // Check for multiple concurrent sessions
        const activeSessions = userSessions.filter(s => s.isActive);
        if (activeSessions.length > this.config.suspiciousActivityThresholds.maxConcurrentSessions) {
          suspiciousActivities.push({
            sessionId: activeSessions[0].id,
            userId,
            activityType: 'CONCURRENT_SESSIONS',
            description: `User has ${activeSessions.length} concurrent active sessions`,
            riskLevel: activeSessions.length > 10 ? 'CRITICAL' : 'HIGH',
            metadata: { 
              sessionCount: activeSessions.length,
              sessionIds: activeSessions.map(s => s.id)
            },
            detectedAt: new Date()
          });
        }

        // Check for rapid IP changes
        const ipChanges = this.countIpChanges(userSessions);
        if (ipChanges > this.config.suspiciousActivityThresholds.maxIpChangesPerHour) {
          suspiciousActivities.push({
            sessionId: userSessions[0].id,
            userId,
            activityType: 'MULTIPLE_IPS',
            description: `User changed IP addresses ${ipChanges} times in the last hour`,
            riskLevel: ipChanges > 10 ? 'CRITICAL' : 'HIGH',
            metadata: { 
              ipChangeCount: ipChanges,
              uniqueIps: [...new Set(userSessions.map(s => s.ipAddress))]
            },
            detectedAt: new Date()
          });
        }

        // Check for unusual devices
        const deviceFingerprints = new Set(userSessions.map(s => s.deviceFingerprint).filter(Boolean));
        if (deviceFingerprints.size > 5) {
          suspiciousActivities.push({
            sessionId: userSessions[0].id,
            userId,
            activityType: 'UNUSUAL_DEVICE',
            description: `User accessed from ${deviceFingerprints.size} different devices recently`,
            riskLevel: deviceFingerprints.size > 10 ? 'HIGH' : 'MEDIUM',
            metadata: { 
              deviceCount: deviceFingerprints.size,
              devices: Array.from(deviceFingerprints)
            },
            detectedAt: new Date()
          });
        }
      }

      this.logInfo('Suspicious activity detection completed', {
        activitiesDetected: suspiciousActivities.length,
        criticalActivities: suspiciousActivities.filter(a => a.riskLevel === 'CRITICAL').length
      });

      return ok(suspiciousActivities);
    } catch (error) {
      return err(this.handleError(
        error,
        'Suspicious activity detection failed',
        'SUSPICIOUS_ACTIVITY_DETECTION_FAILED',
        500
      ));
    }
  }

  /**
   * Rotate sessions based on security policies
   */
  private async rotateSessionsIfNeeded(): Promise<Result<number>> {
    try {
      if (!this.config.sessionRotationConfig.enabled) {
        return ok(0);
      }

      this.logDebug('Checking sessions for rotation');

      let rotatedCount = 0;

      // Get sessions that need rotation (older than rotation threshold)
      const rotationThreshold = new Date();
      rotationThreshold.setHours(rotationThreshold.getHours() - this.config.sessionRotationConfig.rotateAfterHours);

      const oldSessionsResult = await this.sessionRepository.findSessionsOlderThan(rotationThreshold);
      
      if (!oldSessionsResult.isSuccess()) {
        return err(oldSessionsResult.error);
      }

      const oldSessions = oldSessionsResult.value;

      for (const session of oldSessions) {
        // Rotate the session (create new session token, invalidate old one)
        const rotationResult = await this.sessionService.rotateSession(session.id);
        
        if (rotationResult.isSuccess()) {
          rotatedCount++;
          this.logDebug('Session rotated', { 
            sessionId: session.id, 
            userId: session.userId 
          });
        } else {
          this.logWarn('Failed to rotate session', { 
            sessionId: session.id, 
            error: rotationResult.error.message 
          });
        }
      }

      this.logInfo('Session rotation completed', { rotatedCount });

      return ok(rotatedCount);
    } catch (error) {
      return err(this.handleError(
        error,
        'Session rotation failed',
        'SESSION_ROTATION_FAILED',
        500
      ));
    }
  }

  /**
   * Collect session analytics
   */
  private async collectSessionAnalytics(): Promise<Result<Partial<SessionAnalytics>>> {
    try {
      this.logDebug('Collecting session analytics');

      const analytics: Partial<SessionAnalytics> = {};

      // Get all active sessions
      const activeSessionsResult = await this.sessionRepository.findActiveSessions();
      
      if (!activeSessionsResult.isSuccess()) {
        return err(activeSessionsResult.error);
      }

      const activeSessions = activeSessionsResult.value;

      analytics.totalActiveSessions = activeSessions.length;
      analytics.uniqueActiveUsers = new Set(activeSessions.map(s => s.userId)).size;

      // Calculate average session duration
      const now = new Date();
      const sessionDurations = activeSessions.map(s => 
        now.getTime() - s.createdAt.getTime()
      );
      analytics.averageSessionDuration = sessionDurations.length > 0 
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
        : 0;

      // Group sessions by device type
      analytics.sessionsByDevice = {};
      for (const session of activeSessions) {
        const deviceType = this.extractDeviceType(session.userAgent || 'unknown');
        analytics.sessionsByDevice[deviceType] = (analytics.sessionsByDevice[deviceType] || 0) + 1;
      }

      // Group sessions by location (based on IP)
      analytics.sessionsByLocation = {};
      for (const session of activeSessions) {
        const location = await this.getLocationFromIP(session.ipAddress || 'unknown');
        analytics.sessionsByLocation[location] = (analytics.sessionsByLocation[location] || 0) + 1;
      }

      this.logDebug('Session analytics collected', analytics);

      return ok(analytics);
    } catch (error) {
      return err(this.handleError(
        error,
        'Session analytics collection failed',
        'SESSION_ANALYTICS_FAILED',
        500
      ));
    }
  }

  /**
   * Generate security alert for suspicious activity
   */
  private async generateSecurityAlert(activity: SuspiciousActivity): Promise<void> {
    try {
      const severity = this.mapRiskLevelToSeverity(activity.riskLevel);
      
      await this.alertService.notifyStaff({
        severity,
        message: `Suspicious session activity detected: ${activity.description}`,
        context: {
          activityType: activity.activityType,
          userId: activity.userId,
          sessionId: activity.sessionId,
          riskLevel: activity.riskLevel,
          metadata: activity.metadata,
          detectedAt: activity.detectedAt
        }
      });

      this.logWarn('Security alert generated for suspicious activity', {
        activityType: activity.activityType,
        userId: activity.userId,
        riskLevel: activity.riskLevel
      });
    } catch (error) {
      this.logError('Failed to generate security alert', error);
    }
  }

  /**
   * Clean up old analytics data
   */
  private async cleanupOldAnalytics(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.analyticsRetentionDays);

      // This would typically clean up analytics data from a database
      // For now, we'll just log the cleanup
      this.logDebug('Cleaning up analytics data older than', { cutoffDate });
    } catch (error) {
      this.logError('Failed to clean up old analytics data', error);
    }
  }

  /**
   * Get current session analytics
   */
  getLastAnalytics(): SessionAnalytics | null {
    return this.lastAnalytics;
  }

  /**
   * Check if the service is running
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Helper method to count IP changes in the last hour
   */
  private countIpChanges(sessions: any[]): number {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSessions = sessions
      .filter(s => s.lastAccessedAt > oneHourAgo)
      .sort((a, b) => a.lastAccessedAt.getTime() - b.lastAccessedAt.getTime());

    let changes = 0;
    let lastIp = '';

    for (const session of recentSessions) {
      if (lastIp && session.ipAddress !== lastIp) {
        changes++;
      }
      lastIp = session.ipAddress || '';
    }

    return changes;
  }

  /**
   * Extract device type from user agent
   */
  private extractDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else if (ua.includes('bot') || ua.includes('crawler')) {
      return 'bot';
    } else {
      return 'desktop';
    }
  }

  /**
   * Get location from IP address (simplified implementation)
   */
  private async getLocationFromIP(ipAddress: string): Promise<string> {
    // In a real implementation, this would use a GeoIP service
    // For now, return a simplified location based on IP patterns
    if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) {
      return 'local';
    } else if (ipAddress === 'unknown' || ipAddress === '127.0.0.1') {
      return 'unknown';
    } else {
      return 'external';
    }
  }

  /**
   * Map risk level to alert severity
   */
  private mapRiskLevelToSeverity(riskLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (riskLevel) {
      case 'LOW': return 'low';
      case 'MEDIUM': return 'medium';
      case 'HIGH': return 'high';
      case 'CRITICAL': return 'critical';
      default: return 'medium';
    }
  }
}