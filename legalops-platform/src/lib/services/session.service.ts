import crypto from 'crypto';
import { BaseService } from './base.service';
import { ISessionService, SessionMetadata } from '../interfaces/session.interface';
import { ISessionRepository } from '../interfaces/session-repository.interface';
import { ICache } from '../interfaces/cache.interface';
import { ILogger } from '../interfaces/logger.interface';
import { Result, ok, err } from '../types/result';
import { AuthSession } from '@/generated/prisma';

/**
 * Session service implementation.
 * Handles authentication session creation, validation, and cleanup.
 */
export class SessionService extends BaseService implements ISessionService {
  readonly name = 'SessionService';

  // Session configuration
  private static readonly SESSION_DURATION_HOURS = 24;
  private static readonly SESSION_REFRESH_THRESHOLD_HOURS = 2;
  private static readonly MAX_SESSIONS_PER_USER = 10;
  private static readonly CACHE_TTL_SECONDS = 900; // 15 minutes

  constructor(
    logger: ILogger,
    private readonly sessionRepository: ISessionRepository,
    private readonly cache: ICache
  ) {
    super(logger);
  }

  /**
   * Create a new authentication session for a user.
   */
  async createSession(userId: string, metadata: SessionMetadata): Promise<Result<AuthSession>> {
    try {
      this.logInfo('Creating new session', { userId });

      // Check if user has too many active sessions
      const userSessionsResult = await this.sessionRepository.findActiveSessionsByUserId(userId);
      if (!userSessionsResult.success) {
        return err(userSessionsResult.error);
      }

      const activeSessions = userSessionsResult.data;
      if (activeSessions.length >= SessionService.MAX_SESSIONS_PER_USER) {
        // Clean up oldest sessions
        const oldestSessions = activeSessions
          .sort((a, b) => a.lastAccessedAt.getTime() - b.lastAccessedAt.getTime())
          .slice(0, activeSessions.length - SessionService.MAX_SESSIONS_PER_USER + 1);

        for (const session of oldestSessions) {
          await this.sessionRepository.invalidateSession(session.id);
          await this.cache.delete(`session:${session.sessionToken}`);
        }

        this.logInfo('Cleaned up old sessions for user', { 
          userId, 
          cleanedSessions: oldestSessions.length 
        });
      }

      // Generate secure session token
      const sessionToken = this.generateSessionToken();
      
      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + SessionService.SESSION_DURATION_HOURS);

      // Create session
      const createResult = await this.sessionRepository.create({
        userId,
        sessionToken,
        expiresAt,
        lastAccessedAt: new Date(),
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        deviceFingerprint: metadata.deviceFingerprint,
        isActive: true,
        isSuspicious: false
      });

      if (!createResult.success) {
        return err(this.handleError(
          createResult.error,
          'Failed to create session',
          'SESSION_CREATION_FAILED',
          500,
          { userId }
        ));
      }

      const session = createResult.data;

      // Cache the session
      await this.cacheSession(session);

      // Check for suspicious activity
      await this.detectSuspiciousActivity(session, metadata);

      this.logInfo('Session created successfully', { 
        userId, 
        sessionId: session.id,
        expiresAt: session.expiresAt
      });

      return ok(session);

    } catch (error) {
      return err(this.handleError(
        error,
        'Session creation failed due to unexpected error',
        'SESSION_CREATION_ERROR',
        500,
        { userId }
      ));
    }
  }

  /**
   * Validate an existing authentication session.
   */
  async validateSession(sessionId: string): Promise<Result<AuthSession>> {
    try {
      // Try to get session from cache first
      const cachedSession = await this.getSessionFromCache(sessionId);
      if (cachedSession) {
        // Check if session is still valid
        if (this.isSessionValid(cachedSession)) {
          // Update last accessed time
          await this.updateSessionAccess(cachedSession);
          return ok(cachedSession);
        } else {
          // Session expired, remove from cache
          await this.cache.delete(`session:${cachedSession.sessionToken}`);
        }
      }

      // Get session from database
      const sessionResult = await this.sessionRepository.findById(sessionId);
      if (!sessionResult.success) {
        return err(sessionResult.error);
      }

      const session = sessionResult.data;
      if (!session) {
        return err(this.createError(
          'Session not found',
          'SESSION_NOT_FOUND',
          404,
          { sessionId }
        ));
      }

      // Check if session is valid
      if (!this.isSessionValid(session)) {
        return err(this.createError(
          'Session has expired',
          'SESSION_EXPIRED',
          401,
          { sessionId, expiresAt: session.expiresAt }
        ));
      }

      // Update last accessed time
      await this.updateSessionAccess(session);

      // Cache the session
      await this.cacheSession(session);

      return ok(session);

    } catch (error) {
      return err(this.handleError(
        error,
        'Session validation failed due to unexpected error',
        'SESSION_VALIDATION_ERROR',
        500,
        { sessionId }
      ));
    }
  }

  /**
   * Refresh an existing session (extend expiration).
   */
  async refreshSession(sessionId: string): Promise<Result<AuthSession>> {
    try {
      this.logInfo('Refreshing session', { sessionId });

      const sessionResult = await this.sessionRepository.findById(sessionId);
      if (!sessionResult.success) {
        return err(sessionResult.error);
      }

      const session = sessionResult.data;
      if (!session) {
        return err(this.createError(
          'Session not found',
          'SESSION_NOT_FOUND',
          404,
          { sessionId }
        ));
      }

      // Check if session needs refresh
      const now = new Date();
      const timeUntilExpiry = session.expiresAt.getTime() - now.getTime();
      const refreshThreshold = SessionService.SESSION_REFRESH_THRESHOLD_HOURS * 60 * 60 * 1000;

      if (timeUntilExpiry > refreshThreshold) {
        // Session doesn't need refresh yet
        return ok(session);
      }

      // Extend expiration
      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + SessionService.SESSION_DURATION_HOURS);

      const updateResult = await this.sessionRepository.update(session.id, {
        expiresAt: newExpiresAt,
        lastAccessedAt: now
      });

      if (!updateResult.success) {
        return err(updateResult.error);
      }

      const refreshedSession = updateResult.data;

      // Update cache
      await this.cacheSession(refreshedSession);

      this.logInfo('Session refreshed successfully', { 
        sessionId, 
        newExpiresAt: refreshedSession.expiresAt 
      });

      return ok(refreshedSession);

    } catch (error) {
      return err(this.handleError(
        error,
        'Session refresh failed due to unexpected error',
        'SESSION_REFRESH_ERROR',
        500,
        { sessionId }
      ));
    }
  }

  /**
   * Invalidate a specific session.
   */
  async invalidateSession(sessionId: string): Promise<Result<void>> {
    try {
      this.logInfo('Invalidating session', { sessionId });

      // Get session to find token for cache removal
      const sessionResult = await this.sessionRepository.findById(sessionId);
      if (sessionResult.success && sessionResult.data) {
        await this.cache.delete(`session:${sessionResult.data.sessionToken}`);
      }

      const result = await this.sessionRepository.invalidateSession(sessionId);
      if (!result.success) {
        return err(result.error);
      }

      this.logInfo('Session invalidated successfully', { sessionId });
      return ok(undefined);

    } catch (error) {
      return err(this.handleError(
        error,
        'Session invalidation failed due to unexpected error',
        'SESSION_INVALIDATION_ERROR',
        500,
        { sessionId }
      ));
    }
  }

  /**
   * Invalidate all sessions for a specific user.
   */
  async invalidateAllUserSessions(userId: string): Promise<Result<void>> {
    try {
      this.logInfo('Invalidating all user sessions', { userId });

      // Get user sessions to remove from cache
      const userSessionsResult = await this.sessionRepository.findActiveSessionsByUserId(userId);
      if (userSessionsResult.success) {
        for (const session of userSessionsResult.data) {
          await this.cache.delete(`session:${session.sessionToken}`);
        }
      }

      const result = await this.sessionRepository.invalidateAllUserSessions(userId);
      if (!result.success) {
        return err(result.error);
      }

      this.logInfo('All user sessions invalidated successfully', { userId });
      return ok(undefined);

    } catch (error) {
      return err(this.handleError(
        error,
        'User session invalidation failed due to unexpected error',
        'USER_SESSION_INVALIDATION_ERROR',
        500,
        { userId }
      ));
    }
  }

  /**
   * Clean up expired sessions.
   */
  async cleanupExpiredSessions(): Promise<Result<number>> {
    try {
      this.logInfo('Starting expired session cleanup');

      const result = await this.sessionRepository.cleanupExpiredSessions();
      if (!result.success) {
        return err(result.error);
      }

      const cleanedCount = result.data;

      this.logInfo('Expired session cleanup completed', { cleanedCount });
      return ok(cleanedCount);

    } catch (error) {
      return err(this.handleError(
        error,
        'Session cleanup failed due to unexpected error',
        'SESSION_CLEANUP_ERROR',
        500
      ));
    }
  }

  /**
   * Get active sessions for a user.
   */
  async getUserSessions(userId: string): Promise<Result<AuthSession[]>> {
    try {
      const result = await this.sessionRepository.findActiveSessionsByUserId(userId);
      if (!result.success) {
        return err(result.error);
      }

      return ok(result.data);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to get user sessions',
        'GET_USER_SESSIONS_ERROR',
        500,
        { userId }
      ));
    }
  }

  /**
   * Mark a session as suspicious.
   */
  async markSessionSuspicious(sessionId: string, reason: string): Promise<Result<void>> {
    try {
      this.logWarn('Marking session as suspicious', { sessionId, reason });

      const result = await this.sessionRepository.markAsSuspicious(sessionId);
      if (!result.success) {
        return err(result.error);
      }

      // Remove from cache to force database lookup
      const sessionResult = await this.sessionRepository.findById(sessionId);
      if (sessionResult.success && sessionResult.data) {
        await this.cache.delete(`session:${sessionResult.data.sessionToken}`);
      }

      this.logWarn('Session marked as suspicious', { sessionId, reason });
      return ok(undefined);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to mark session as suspicious',
        'MARK_SUSPICIOUS_ERROR',
        500,
        { sessionId, reason }
      ));
    }
  }

  /**
   * Generate a cryptographically secure session token.
   */
  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Check if a session is valid (not expired and active).
   */
  private isSessionValid(session: AuthSession): boolean {
    const now = new Date();
    return session.isActive && 
           session.expiresAt > now && 
           !session.isSuspicious;
  }

  /**
   * Update session last accessed time.
   */
  private async updateSessionAccess(session: AuthSession): Promise<void> {
    const now = new Date();
    
    // Only update if it's been more than 5 minutes since last update
    const timeSinceLastAccess = now.getTime() - session.lastAccessedAt.getTime();
    if (timeSinceLastAccess > 5 * 60 * 1000) {
      await this.sessionRepository.updateLastAccessed(session.id);
      session.lastAccessedAt = now;
      
      // Update cache with new access time
      await this.cacheSession(session);
    }
  }

  /**
   * Cache a session for faster access.
   */
  private async cacheSession(session: AuthSession): Promise<void> {
    try {
      await this.cache.set(
        `session:${session.sessionToken}`,
        JSON.stringify(session),
        SessionService.CACHE_TTL_SECONDS
      );
    } catch (error) {
      this.logWarn('Failed to cache session', { 
        sessionId: session.id, 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Rotate a session by creating a new session token and invalidating the old one.
   */
  async rotateSession(sessionId: string): Promise<Result<AuthSession>> {
    try {
      this.logInfo('Rotating session', { sessionId });

      // Get the current session
      const sessionResult = await this.sessionRepository.findById(sessionId);
      if (!sessionResult.success || !sessionResult.data) {
        return err(this.createError(
          'Session not found for rotation',
          'SESSION_NOT_FOUND',
          404,
          { sessionId }
        ));
      }

      const currentSession = sessionResult.data;

      // Generate new session token
      const newSessionToken = crypto.randomBytes(32).toString('hex');

      // Update the session with new token and extended expiration
      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + SessionService.SESSION_DURATION_HOURS);

      const updateResult = await this.sessionRepository.update(sessionId, {
        sessionToken: newSessionToken,
        expiresAt: newExpiresAt,
        lastAccessedAt: new Date()
      });

      if (!updateResult.success) {
        return err(updateResult.error);
      }

      const rotatedSession = updateResult.data;

      // Remove old session from cache and cache new one
      await this.cache.delete(`session:${currentSession.sessionToken}`);
      await this.cacheSession(rotatedSession);

      this.logInfo('Session rotated successfully', { 
        sessionId, 
        newToken: newSessionToken.substring(0, 8) + '...',
        newExpiresAt: rotatedSession.expiresAt
      });

      return ok(rotatedSession);
    } catch (error) {
      return err(this.handleError(
        error,
        'Session rotation failed',
        'SESSION_ROTATION_FAILED',
        500,
        { sessionId }
      ));
    }
  }

  /**
   * Get recent sessions for a user within the specified time window.
   */
  async getRecentSessions(userId: string, timeWindowMs: number): Promise<Result<AuthSession[]>> {
    try {
      const cutoffTime = new Date(Date.now() - timeWindowMs);
      
      const result = await this.sessionRepository.findUserSessionsSince(userId, cutoffTime);
      
      if (!result.success) {
        return err(result.error);
      }

      return ok(result.data);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to get recent sessions',
        'GET_RECENT_SESSIONS_FAILED',
        500,
        { userId, timeWindowMs }
      ));
    }
  }

  /**
   * Get a session from cache.
   */
  private async getSessionFromCache(sessionId: string): Promise<AuthSession | null> {
    try {
      // We need the session token to get from cache, but we only have the ID
      // This is a limitation - we'd need to cache by both ID and token
      // For now, we'll skip cache lookup by ID and only use it in validateSession
      return null;
    } catch (error) {
      this.logWarn('Failed to get session from cache', { 
        sessionId, 
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Detect suspicious activity based on session metadata.
   */
  private async detectSuspiciousActivity(session: AuthSession, metadata: SessionMetadata): Promise<void> {
    try {
      // Get recent sessions for the user to compare
      const userSessionsResult = await this.sessionRepository.findActiveSessionsByUserId(session.userId);
      if (!userSessionsResult.success) {
        return;
      }

      const recentSessions = userSessionsResult.data
        .filter(s => s.id !== session.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);

      let suspiciousReasons: string[] = [];

      // Check for rapid session creation
      const recentSessionCount = recentSessions.filter(s => {
        const timeDiff = session.createdAt.getTime() - s.createdAt.getTime();
        return timeDiff < 5 * 60 * 1000; // 5 minutes
      }).length;

      if (recentSessionCount >= 3) {
        suspiciousReasons.push('Rapid session creation');
      }

      // Check for different IP addresses
      if (metadata.ipAddress && recentSessions.length > 0) {
        const differentIPs = recentSessions.filter(s => 
          s.ipAddress && s.ipAddress !== metadata.ipAddress
        ).length;

        if (differentIPs > 0 && recentSessions.length > 0) {
          const differentIPRatio = differentIPs / recentSessions.length;
          if (differentIPRatio > 0.5) {
            suspiciousReasons.push('Multiple IP addresses');
          }
        }
      }

      // Check for different user agents
      if (metadata.userAgent && recentSessions.length > 0) {
        const differentUserAgents = recentSessions.filter(s => 
          s.userAgent && s.userAgent !== metadata.userAgent
        ).length;

        if (differentUserAgents > 0 && recentSessions.length > 0) {
          const differentUARatio = differentUserAgents / recentSessions.length;
          if (differentUARatio > 0.7) {
            suspiciousReasons.push('Multiple user agents');
          }
        }
      }

      // Mark as suspicious if any red flags
      if (suspiciousReasons.length > 0) {
        await this.markSessionSuspicious(session.id, suspiciousReasons.join(', '));
      }

    } catch (error) {
      this.logWarn('Failed to detect suspicious activity', { 
        sessionId: session.id, 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}