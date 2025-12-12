import { IService } from './service.interface';
import { Result } from '../types/result';
import { AuthSession } from '@/generated/prisma';

/**
 * Session metadata for tracking authentication sessions.
 */
export interface SessionMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
}

/**
 * Session service interface.
 * Handles authentication session creation, validation, and cleanup.
 */
export interface ISessionService extends IService {
  /**
   * Create a new authentication session for a user.
   * 
   * @param userId - The user ID to create a session for
   * @param metadata - Session metadata (IP, user agent, etc.)
   * @returns Result containing the created session or error
   */
  createSession(userId: string, metadata: SessionMetadata): Promise<Result<AuthSession>>;

  /**
   * Validate an existing authentication session.
   * 
   * @param sessionId - The session ID to validate
   * @returns Result containing the session or error if invalid/expired
   */
  validateSession(sessionId: string): Promise<Result<AuthSession>>;

  /**
   * Refresh an existing session (extend expiration).
   * 
   * @param sessionId - The session ID to refresh
   * @returns Result containing the refreshed session or error
   */
  refreshSession(sessionId: string): Promise<Result<AuthSession>>;

  /**
   * Invalidate a specific session.
   * 
   * @param sessionId - The session ID to invalidate
   * @returns Result indicating success or error
   */
  invalidateSession(sessionId: string): Promise<Result<void>>;

  /**
   * Invalidate all sessions for a specific user.
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
   * Get active sessions for a user.
   * 
   * @param userId - The user ID to get sessions for
   * @returns Result containing the user's active sessions
   */
  getUserSessions(userId: string): Promise<Result<AuthSession[]>>;

  /**
   * Mark a session as suspicious.
   * 
   * @param sessionId - The session ID to mark as suspicious
   * @param reason - The reason for marking as suspicious
   * @returns Result indicating success or error
   */
  markSessionSuspicious(sessionId: string, reason: string): Promise<Result<void>>;
}