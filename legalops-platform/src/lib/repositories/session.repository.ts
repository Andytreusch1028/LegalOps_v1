import { PrismaClient, AuthSession } from '@/generated/prisma';
import { BaseRepository } from './base.repository';
import { ISessionRepository } from '../interfaces/session-repository.interface';
import { ICache } from '../interfaces/cache.interface';
import { ILogger } from '../interfaces/logger.interface';
import { Result, ok, err } from '../types/result';
import { AppError } from '../types/result';

/**
 * Session repository implementation.
 * Extends BaseRepository with session-specific methods and cleanup functionality.
 */
export class SessionRepository extends BaseRepository<AuthSession> implements ISessionRepository {
  readonly name = 'SessionRepository';

  constructor(
    prisma: PrismaClient,
    logger: ILogger,
    cache?: ICache
  ) {
    super(prisma, logger, cache);
    // Set shorter cache TTL for session data (15 minutes)
    this.cacheTTL = 900;
  }

  /**
   * Get the Prisma model delegate for AuthSession entities.
   */
  protected getModel() {
    return this.prisma.authSession;
  }

  /**
   * Find a session by session token.
   */
  async findBySessionToken(sessionToken: string): Promise<Result<AuthSession | null>> {
    try {
      // Check cache first
      if (this.cache) {
        const cacheKey = `${this.name}:token:${sessionToken}`;
        const cached = await this.cache.get<AuthSession>(cacheKey);
        if (cached) {
          this.logger.debug(`[${this.name}] Cache hit for session token`);
          return ok(cached);
        }
      }

      const session = await this.performanceLogger.measureQuery(
        `${this.name}.findBySessionToken`,
        () => this.getModel().findUnique({
          where: { sessionToken }
        }),
        { hasToken: !!sessionToken }
      );

      // Cache the result
      if (session && this.cache) {
        const cacheKey = `${this.name}:token:${sessionToken}`;
        await this.cache.set(cacheKey, session, this.cacheTTL);
        this.logger.debug(`[${this.name}] Cached session by token`);
      }

      return ok(session);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to find session by token`, {
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to find session by token',
        'SESSION_FIND_BY_TOKEN_ERROR',
        500,
        { originalError: error }
      ));
    }
  }

  /**
   * Find all active sessions for a user.
   */
  async findActiveSessionsByUserId(userId: string): Promise<Result<AuthSession[]>> {
    try {
      const sessions = await this.performanceLogger.measureQuery(
        `${this.name}.findActiveSessionsByUserId`,
        () => this.getModel().findMany({
          where: {
            userId,
            isActive: true,
            expiresAt: { gt: new Date() }
          },
          orderBy: { lastAccessedAt: 'desc' }
        }),
        { userId }
      );

      return ok(sessions);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to find active sessions by user ID`, {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to find active sessions by user ID',
        'SESSION_FIND_ACTIVE_BY_USER_ERROR',
        500,
        { userId, originalError: error }
      ));
    }
  }

  /**
   * Invalidate a specific session.
   */
  async invalidateSession(sessionId: string): Promise<Result<void>> {
    try {
      // Get session to find token for cache removal
      const session = await this.getModel().findUnique({
        where: { id: sessionId }
      });

      // Update session to inactive
      await this.performanceLogger.measureQuery(
        `${this.name}.invalidateSession`,
        () => this.getModel().update({
          where: { id: sessionId },
          data: { isActive: false }
        }),
        { sessionId }
      );

      // Remove from cache
      if (session && this.cache) {
        await Promise.all([
          this.cache.delete(`${this.name}:token:${session.sessionToken}`),
          this.cache.delete(this.getCacheKey(sessionId))
        ]);
        this.logger.debug(`[${this.name}] Removed session from cache`);
      }

      this.logger.info(`[${this.name}] Invalidated session ${sessionId}`);
      return ok(undefined);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to invalidate session`, {
        sessionId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to invalidate session',
        'SESSION_INVALIDATE_ERROR',
        500,
        { sessionId, originalError: error }
      ));
    }
  }

  /**
   * Invalidate all sessions for a user.
   */
  async invalidateAllUserSessions(userId: string): Promise<Result<void>> {
    try {
      // Get user sessions for cache removal
      const sessions = await this.getModel().findMany({
        where: { userId, isActive: true },
        select: { id: true, sessionToken: true }
      });

      // Update all user sessions to inactive
      await this.performanceLogger.measureQuery(
        `${this.name}.invalidateAllUserSessions`,
        () => this.getModel().updateMany({
          where: { userId, isActive: true },
          data: { isActive: false }
        }),
        { userId }
      );

      // Remove from cache
      if (this.cache) {
        const cachePromises = sessions.flatMap(session => [
          this.cache!.delete(`${this.name}:token:${session.sessionToken}`),
          this.cache!.delete(this.getCacheKey(session.id))
        ]);
        await Promise.all(cachePromises);
        this.logger.debug(`[${this.name}] Removed ${sessions.length} sessions from cache`);
      }

      this.logger.info(`[${this.name}] Invalidated all sessions for user ${userId}`);
      return ok(undefined);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to invalidate all user sessions`, {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to invalidate all user sessions',
        'SESSION_INVALIDATE_ALL_USER_ERROR',
        500,
        { userId, originalError: error }
      ));
    }
  }

  /**
   * Clean up expired sessions.
   */
  async cleanupExpiredSessions(): Promise<Result<number>> {
    try {
      const now = new Date();

      // Get expired sessions for cache removal
      const expiredSessions = await this.getModel().findMany({
        where: {
          OR: [
            { expiresAt: { lte: now } },
            { isActive: false }
          ]
        },
        select: { id: true, sessionToken: true }
      });

      // Delete expired sessions
      const deleteResult = await this.performanceLogger.measureQuery(
        `${this.name}.cleanupExpiredSessions`,
        () => this.getModel().deleteMany({
          where: {
            OR: [
              { expiresAt: { lte: now } },
              { isActive: false }
            ]
          }
        }),
        { expiredCount: expiredSessions.length }
      );

      // Remove from cache
      if (this.cache && expiredSessions.length > 0) {
        const cachePromises = expiredSessions.flatMap(session => [
          this.cache!.delete(`${this.name}:token:${session.sessionToken}`),
          this.cache!.delete(this.getCacheKey(session.id))
        ]);
        await Promise.all(cachePromises);
        this.logger.debug(`[${this.name}] Removed ${expiredSessions.length} expired sessions from cache`);
      }

      const cleanedCount = deleteResult.count;
      this.logger.info(`[${this.name}] Cleaned up ${cleanedCount} expired sessions`);
      return ok(cleanedCount);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to cleanup expired sessions`, {
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to cleanup expired sessions',
        'SESSION_CLEANUP_ERROR',
        500,
        { originalError: error }
      ));
    }
  }

  /**
   * Update session last accessed time.
   */
  async updateLastAccessed(sessionId: string): Promise<Result<void>> {
    try {
      await this.performanceLogger.measureQuery(
        `${this.name}.updateLastAccessed`,
        () => this.getModel().update({
          where: { id: sessionId },
          data: { lastAccessedAt: new Date() }
        }),
        { sessionId }
      );

      // Invalidate cache to force refresh
      if (this.cache) {
        await this.cache.delete(this.getCacheKey(sessionId));
      }

      return ok(undefined);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to update last accessed time`, {
        sessionId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to update session last accessed time',
        'SESSION_UPDATE_LAST_ACCESSED_ERROR',
        500,
        { sessionId, originalError: error }
      ));
    }
  }

  /**
   * Mark a session as suspicious.
   */
  async markAsSuspicious(sessionId: string): Promise<Result<void>> {
    try {
      await this.performanceLogger.measureQuery(
        `${this.name}.markAsSuspicious`,
        () => this.getModel().update({
          where: { id: sessionId },
          data: { isSuspicious: true }
        }),
        { sessionId }
      );

      // Invalidate cache to force refresh
      if (this.cache) {
        const session = await this.getModel().findUnique({
          where: { id: sessionId },
          select: { sessionToken: true }
        });

        if (session) {
          await Promise.all([
            this.cache.delete(`${this.name}:token:${session.sessionToken}`),
            this.cache.delete(this.getCacheKey(sessionId))
          ]);
        }
      }

      this.logger.warn(`[${this.name}] Marked session ${sessionId} as suspicious`);
      return ok(undefined);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to mark session as suspicious`, {
        sessionId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to mark session as suspicious',
        'SESSION_MARK_SUSPICIOUS_ERROR',
        500,
        { sessionId, originalError: error }
      ));
    }
  }

  /**
   * Get session statistics.
   */
  async getSessionStats(): Promise<Result<{
    totalActiveSessions: number;
    suspiciousSessions: number;
    expiredSessions: number;
    averageSessionDuration: number;
  }>> {
    try {
      const now = new Date();

      const [
        totalActiveSessions,
        suspiciousSessions,
        expiredSessions,
        sessionDurations
      ] = await Promise.all([
        this.getModel().count({
          where: {
            isActive: true,
            expiresAt: { gt: now }
          }
        }),
        this.getModel().count({
          where: {
            isSuspicious: true,
            isActive: true
          }
        }),
        this.getModel().count({
          where: {
            OR: [
              { expiresAt: { lte: now } },
              { isActive: false }
            ]
          }
        }),
        this.getModel().findMany({
          where: {
            isActive: false,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
          },
          select: {
            createdAt: true,
            lastAccessedAt: true
          }
        })
      ]);

      // Calculate average session duration
      let averageSessionDuration = 0;
      if (sessionDurations.length > 0) {
        const totalDuration = sessionDurations.reduce((sum, session) => {
          const duration = session.lastAccessedAt.getTime() - session.createdAt.getTime();
          return sum + duration;
        }, 0);
        averageSessionDuration = Math.round(totalDuration / sessionDurations.length / (1000 * 60)); // Convert to minutes
      }

      return ok({
        totalActiveSessions,
        suspiciousSessions,
        expiredSessions,
        averageSessionDuration
      });

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to get session statistics`, {
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to get session statistics',
        'SESSION_STATS_ERROR',
        500,
        { originalError: error }
      ));
    }
  }

  /**
   * Override the base create method to return a Result type.
   */
  async create(data: Omit<AuthSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<AuthSession>> {
    try {
      const session = await super.create(data);
      
      // Cache the new session
      if (this.cache) {
        await this.cache.set(`${this.name}:token:${session.sessionToken}`, session, this.cacheTTL);
      }
      
      return ok(session);
    } catch (error) {
      this.logger.error(`[${this.name}] Failed to create session`, {
        userId: data.userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to create session',
        'SESSION_CREATE_ERROR',
        500,
        { userId: data.userId, originalError: error }
      ));
    }
  }

  /**
   * Override the base findById method to return a Result type.
   */
  async findById(id: string): Promise<Result<AuthSession | null>> {
    try {
      const session = await super.findById(id);
      return ok(session);
    } catch (error) {
      this.logger.error(`[${this.name}] Failed to find session by ID`, {
        id,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to find session by ID',
        'SESSION_FIND_BY_ID_ERROR',
        500,
        { id, originalError: error }
      ));
    }
  }

  /**
   * Find recent sessions within a time window.
   */
  async findRecentSessions(timeWindowMs: number): Promise<Result<AuthSession[]>> {
    try {
      const cutoffTime = new Date(Date.now() - timeWindowMs);
      
      const sessions = await this.performanceLogger.measureQuery(
        `${this.name}.findRecentSessions`,
        () => this.getModel().findMany({
          where: {
            lastAccessedAt: {
              gte: cutoffTime
            }
          },
          orderBy: {
            lastAccessedAt: 'desc'
          }
        })
      );

      return ok(sessions);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to find recent sessions',
        'FIND_RECENT_SESSIONS_FAILED',
        500,
        { timeWindowMs }
      ));
    }
  }

  /**
   * Find sessions older than a specific date.
   */
  async findSessionsOlderThan(cutoffDate: Date): Promise<Result<AuthSession[]>> {
    try {
      const sessions = await this.performanceLogger.measureQuery(
        `${this.name}.findSessionsOlderThan`,
        () => this.getModel().findMany({
          where: {
            createdAt: {
              lt: cutoffDate
            },
            isActive: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        })
      );

      return ok(sessions);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to find sessions older than date',
        'FIND_OLD_SESSIONS_FAILED',
        500,
        { cutoffDate }
      ));
    }
  }

  /**
   * Find all active sessions.
   */
  async findActiveSessions(): Promise<Result<AuthSession[]>> {
    try {
      const now = new Date();
      
      const sessions = await this.performanceLogger.measureQuery(
        `${this.name}.findActiveSessions`,
        () => this.getModel().findMany({
          where: {
            isActive: true,
            expiresAt: {
              gt: now
            }
          },
          orderBy: {
            lastAccessedAt: 'desc'
          }
        })
      );

      return ok(sessions);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to find active sessions',
        'FIND_ACTIVE_SESSIONS_FAILED',
        500
      ));
    }
  }

  /**
   * Find user sessions since a specific date.
   */
  async findUserSessionsSince(userId: string, sinceDate: Date): Promise<Result<AuthSession[]>> {
    try {
      const sessions = await this.performanceLogger.measureQuery(
        `${this.name}.findUserSessionsSince`,
        () => this.getModel().findMany({
          where: {
            userId,
            lastAccessedAt: {
              gte: sinceDate
            }
          },
          orderBy: {
            lastAccessedAt: 'desc'
          }
        })
      );

      return ok(sessions);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to find user sessions since date',
        'FIND_USER_SESSIONS_SINCE_FAILED',
        500,
        { userId, sinceDate }
      ));
    }
  }
}