/**
 * Authentication Email Service Interface
 * 
 * Defines the contract for authentication-related email functionality.
 */

import { Result } from '../types/result';
import { User } from '@/generated/prisma';

/**
 * Request information for security notifications
 */
export interface RequestInfo {
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

/**
 * Authentication email service interface
 */
export interface IAuthEmailService {
  /**
   * Send email verification email
   */
  sendEmailVerification(user: User, verificationToken: string): Promise<Result<void>>;

  /**
   * Send password reset email
   */
  sendPasswordResetEmail(user: User, resetToken: string, requestInfo?: { ipAddress?: string }): Promise<Result<void>>;

  /**
   * Send welcome email after successful verification
   */
  sendWelcomeEmail(user: User): Promise<Result<void>>;

  /**
   * Send security notification
   */
  sendSecurityNotification(user: User, action: string, requestInfo: RequestInfo): Promise<Result<void>>;

  /**
   * Send verification reminder
   */
  sendVerificationReminder(user: User, verificationToken: string): Promise<Result<void>>;

  /**
   * Send password change confirmation
   */
  sendPasswordChangeConfirmation(user: User): Promise<Result<void>>;

  /**
   * Send account locked notification
   */
  sendAccountLockedNotification(user: User, reason: string): Promise<Result<void>>;

  /**
   * Send account unlocked notification
   */
  sendAccountUnlockedNotification(user: User): Promise<Result<void>>;

  /**
   * Schedule verification reminder (for background jobs)
   */
  scheduleVerificationReminder(user: User, verificationToken: string, delayHours?: number): Promise<Result<void>>;
}