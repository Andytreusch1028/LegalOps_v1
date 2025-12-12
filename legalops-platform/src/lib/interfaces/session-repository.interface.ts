import { IBaseRepository } from './repository.interface';
import { Result } from '../types/result';
import { AuthSession } from '@/generated/prisma';

/**
 * Session repository interface.
 * Handles database operations for AuthSession entities.
 */
export interface ISessionRepository extends IBaseRepository<AuthSession> {
  /**
   * Find a session by session token.
   * 
   * @param sessionToken - The session token to search for
   * @returns Result containing the session or null if not found
   */
  findBySessionToken(sessionToken: string): Promise<Result<AuthSession | null>>;

  /**
   * Find all active sessions for a user.
   * 
   * @param userId - The user ID to search for
   * @returns Result containing the user's active sessions
   */
  findActiveSessionsByUserId(userId: string): Promise<Result<AuthSession[]>>;

  /**
   * Invalidate a specific session.
   * 
   * @param sessionId - The session ID to invalidate
   * @returns Result indicating success or error
   */
  invalidateSession(sessionId: string): Promise<Result<void>>;

  /**
   * Invalidate all sessions for a user.
   * 
   * @param userId - The user ID whose sessions to invalidate
   * @returns Result indicating success or error
   */
  invalidateAllUserSessions(userId: string): Promise<Result<void>>;

  /**
   * Clean up expired sessions.
   * 
   * @returns Result containing the number of sessions cleaned up
   */
  cleanupExpiredSessions(): Promise<Result<number>>;

  /**
   * Update session last accessed time.
   * 
   * @param sessionId - The session ID to update
   * @returns Result indicating success or error
   */
  updateLastAccessed(sessionId: string): Promise<Result<void>>;

  /**
   * Mark a session as suspicious.
   * 
   * @param sessionId - The session ID to mark as suspicious
   * @returns Result indicating success or error
   */
  markAsSuspicious(sessionId: string): Promise<Result<void>>;

  /**
   * Get session statistics.
   * 
   * @returns Result containing session statistics
   */
  getSessionStats(): Promise<Result<{
    totalActiveSessions: number;
    suspiciousSessions: number;
    expiredSessions: number;
    averageSessionDuration: number;
  }>>;

  /**
   * Find recent sessions within a time window.
   * 
   * @param timeWindowMs - Time window in milliseconds
   * @returns Result containing recent sessions
   */
  findRecentSessions(timeWindowMs: number): Promise<Result<AuthSession[]>>;

  /**
   * Find sessions older than a specific date.
   * 
   * @param cutoffDate - The cutoff date
   * @returns Result containing old sessions
   */
  findSessionsOlderThan(cutoffDate: Date): Promise<Result<AuthSession[]>>;

  /**
   * Find all active sessions.
   * 
   * @returns Result containing all active sessions
   */
  findActiveSessions(): Promise<Result<AuthSession[]>>;

  /**
   * Find user sessions since a specific date.
   * 
   * @param userId - The user ID
   * @param sinceDate - The date to search from
   * @returns Result containing user sessions since the date
   */
  findUserSessionsSince(userId: string, sinceDate: Date): Promise<Result<AuthSession[]>>;
}