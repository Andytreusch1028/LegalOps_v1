import { IService } from './service.interface';
import { Result } from '../types/result';
import { User, AuthSession } from '@/generated/prisma';

/**
 * Registration data for new user accounts.
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/**
 * Session metadata for tracking authentication sessions.
 */
export interface SessionMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
}

/**
 * Authentication session with user data.
 */
export interface AuthSessionWithUser extends AuthSession {
  user: User;
}

/**
 * Password reset request data.
 */
export interface PasswordResetData {
  token: string;
  newPassword: string;
}

/**
 * Authentication service interface.
 * Handles user registration, login, logout, and password management.
 */
export interface IAuthenticationService extends IService {
  /**
   * Register a new user account.
   * 
   * @param userData - User registration data
   * @returns Result containing the created user or error
   */
  register(userData: RegisterData): Promise<Result<User>>;

  /**
   * Authenticate a user with email and password.
   * 
   * @param email - User's email address
   * @param password - User's password
   * @param metadata - Session metadata (IP, user agent, etc.)
   * @returns Result containing auth session with user data or error
   */
  login(email: string, password: string, metadata?: SessionMetadata): Promise<Result<AuthSessionWithUser>>;

  /**
   * Log out a user by invalidating their session.
   * 
   * @param sessionId - The session ID to invalidate
   * @returns Result indicating success or error
   */
  logout(sessionId: string): Promise<Result<void>>;

  /**
   * Verify a user's email address using verification token.
   * 
   * @param token - Email verification token
   * @returns Result containing the verified user or error
   */
  verifyEmail(token: string): Promise<Result<User>>;

  /**
   * Request a password reset for a user.
   * 
   * @param email - User's email address
   * @returns Result indicating success or error
   */
  requestPasswordReset(email: string): Promise<Result<void>>;

  /**
   * Reset a user's password using reset token.
   * 
   * @param resetData - Password reset data with token and new password
   * @returns Result containing the updated user or error
   */
  resetPassword(resetData: PasswordResetData): Promise<Result<User>>;

  /**
   * Validate an authentication session.
   * 
   * @param sessionId - The session ID to validate
   * @returns Result containing auth session with user data or error
   */
  validateSession(sessionId: string): Promise<Result<AuthSessionWithUser>>;

  /**
   * Check if an email address is available for registration.
   * 
   * @param email - Email address to check
   * @returns Result indicating if email is available
   */
  isEmailAvailable(email: string): Promise<Result<boolean>>;

  /**
   * Validate password strength.
   * 
   * @param password - Password to validate
   * @returns Result indicating if password is strong enough
   */
  validatePasswordStrength(password: string): Result<boolean>;
}