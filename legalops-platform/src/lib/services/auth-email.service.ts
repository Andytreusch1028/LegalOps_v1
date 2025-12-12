/**
 * Authentication Email Service
 * 
 * Handles all authentication-related email workflows including:
 * - Email verification
 * - Password reset
 * - Welcome emails
 * - Security notifications
 * - Account status changes
 */

import { BaseService } from './base.service';
import { ILogger } from '../interfaces/logger.interface';
import { IEmailService } from './email-service';
import { Result, ok, err } from '../types/result';
import { 
  AuthEmailTemplates, 
  EmailVerificationData, 
  PasswordResetData, 
  WelcomeEmailData, 
  SecurityNotificationData 
} from '../templates/email/auth-email-templates';
import { User } from '@/generated/prisma';

/**
 * Email verification workflow data
 */
export interface EmailVerificationWorkflow {
  userId: string;
  email: string;
  verificationToken: string;
  expiresAt: Date;
  reminderSent?: boolean;
}

/**
 * Password reset workflow data
 */
export interface PasswordResetWorkflow {
  userId: string;
  email: string;
  resetToken: string;
  expiresAt: Date;
  requestedAt: Date;
  ipAddress?: string;
}

/**
 * Authentication email service interface
 */
export interface IAuthEmailService {
  sendEmailVerification(user: User, verificationToken: string): Promise<Result<void>>;
  sendPasswordResetEmail(user: User, resetToken: string, requestInfo?: { ipAddress?: string }): Promise<Result<void>>;
  sendWelcomeEmail(user: User): Promise<Result<void>>;
  sendSecurityNotification(user: User, action: string, requestInfo: { ipAddress?: string; userAgent?: string; location?: string }): Promise<Result<void>>;
  sendVerificationReminder(user: User, verificationToken: string): Promise<Result<void>>;
  sendPasswordChangeConfirmation(user: User): Promise<Result<void>>;
  sendAccountLockedNotification(user: User, reason: string): Promise<Result<void>>;
  sendAccountUnlockedNotification(user: User): Promise<Result<void>>;
}

/**
 * Authentication email service implementation
 */
export class AuthEmailService extends BaseService implements IAuthEmailService {
  readonly name = 'AuthEmailService';

  private readonly baseUrl: string;
  private readonly tokenExpiryHours: number = 24;

  constructor(
    logger: ILogger,
    private readonly emailService: IEmailService
  ) {
    super(logger);
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  /**
   * Send email verification email
   */
  async sendEmailVerification(user: User, verificationToken: string): Promise<Result<void>> {
    try {
      this.logInfo('Sending email verification', { 
        userId: user.id, 
        email: user.email 
      });

      const verificationUrl = `${this.baseUrl}/auth/verify-email?token=${verificationToken}`;
      const expiresIn = `${this.tokenExpiryHours} hours`;

      const templateData: EmailVerificationData = {
        firstName: user.firstName || 'User',
        verificationUrl,
        expiresIn
      };

      const templateResult = AuthEmailTemplates.generateEmailVerification(templateData);
      if (!templateResult.success) {
        return err(templateResult.error);
      }

      const template = templateResult.data;

      const emailResult = await this.emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        category: 'authentication',
        userId: user.id
      });

      if (!emailResult.success) {
        return err(emailResult.error);
      }

      this.logInfo('Email verification sent successfully', { 
        userId: user.id,
        messageId: emailResult.data.messageId
      });

      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to send email verification',
        'EMAIL_VERIFICATION_SEND_FAILED',
        500,
        { userId: user.id, email: user.email }
      ));
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    user: User, 
    resetToken: string, 
    requestInfo?: { ipAddress?: string }
  ): Promise<Result<void>> {
    try {
      this.logInfo('Sending password reset email', { 
        userId: user.id, 
        email: user.email,
        ipAddress: requestInfo?.ipAddress
      });

      const resetUrl = `${this.baseUrl}/auth/reset-password?token=${resetToken}`;
      const expiresIn = `${this.tokenExpiryHours} hours`;
      const requestedAt = new Date().toLocaleString();

      const templateData: PasswordResetData = {
        firstName: user.firstName || 'User',
        resetUrl,
        expiresIn,
        requestedAt
      };

      const templateResult = AuthEmailTemplates.generatePasswordReset(templateData);
      if (!templateResult.success) {
        return err(templateResult.error);
      }

      const template = templateResult.data;

      const emailResult = await this.emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        category: 'authentication',
        userId: user.id
      });

      if (!emailResult.success) {
        return err(emailResult.error);
      }

      // Send security notification for password reset request
      if (requestInfo?.ipAddress) {
        await this.sendSecurityNotification(user, 'Password reset requested', {
          ipAddress: requestInfo.ipAddress,
          userAgent: 'Unknown',
          location: 'Unknown'
        });
      }

      this.logInfo('Password reset email sent successfully', { 
        userId: user.id,
        messageId: emailResult.data.messageId
      });

      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to send password reset email',
        'PASSWORD_RESET_EMAIL_SEND_FAILED',
        500,
        { userId: user.id, email: user.email }
      ));
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(user: User): Promise<Result<void>> {
    try {
      this.logInfo('Sending welcome email', { 
        userId: user.id, 
        email: user.email 
      });

      const loginUrl = `${this.baseUrl}/auth/login`;
      const supportUrl = `${this.baseUrl}/support`;

      const templateData: WelcomeEmailData = {
        firstName: user.firstName || 'User',
        lastName: user.lastName || '',
        loginUrl,
        supportUrl
      };

      const templateResult = AuthEmailTemplates.generateWelcomeEmail(templateData);
      if (!templateResult.success) {
        return err(templateResult.error);
      }

      const template = templateResult.data;

      const emailResult = await this.emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        category: 'welcome',
        userId: user.id
      });

      if (!emailResult.success) {
        return err(emailResult.error);
      }

      this.logInfo('Welcome email sent successfully', { 
        userId: user.id,
        messageId: emailResult.data.messageId
      });

      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to send welcome email',
        'WELCOME_EMAIL_SEND_FAILED',
        500,
        { userId: user.id, email: user.email }
      ));
    }
  }

  /**
   * Send security notification
   */
  async sendSecurityNotification(
    user: User, 
    action: string, 
    requestInfo: { 
      ipAddress?: string; 
      userAgent?: string; 
      location?: string; 
    }
  ): Promise<Result<void>> {
    try {
      this.logInfo('Sending security notification', { 
        userId: user.id, 
        email: user.email,
        action,
        ipAddress: requestInfo.ipAddress
      });

      const templateData: SecurityNotificationData = {
        firstName: user.firstName || 'User',
        action,
        timestamp: new Date().toLocaleString(),
        ipAddress: requestInfo.ipAddress || 'Unknown',
        userAgent: requestInfo.userAgent || 'Unknown',
        location: requestInfo.location
      };

      const templateResult = AuthEmailTemplates.generateSecurityNotification(templateData);
      if (!templateResult.success) {
        return err(templateResult.error);
      }

      const template = templateResult.data;

      const emailResult = await this.emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        category: 'security',
        userId: user.id
      });

      if (!emailResult.success) {
        return err(emailResult.error);
      }

      this.logInfo('Security notification sent successfully', { 
        userId: user.id,
        action,
        messageId: emailResult.data.messageId
      });

      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to send security notification',
        'SECURITY_NOTIFICATION_SEND_FAILED',
        500,
        { userId: user.id, email: user.email, action }
      ));
    }
  }

  /**
   * Send verification reminder
   */
  async sendVerificationReminder(user: User, verificationToken: string): Promise<Result<void>> {
    try {
      this.logInfo('Sending verification reminder', { 
        userId: user.id, 
        email: user.email 
      });

      const verificationUrl = `${this.baseUrl}/auth/verify-email?token=${verificationToken}`;
      const expiresIn = `${this.tokenExpiryHours} hours`;

      const templateData: EmailVerificationData = {
        firstName: user.firstName || 'User',
        verificationUrl,
        expiresIn
      };

      const templateResult = AuthEmailTemplates.generateVerificationReminder(templateData);
      if (!templateResult.success) {
        return err(templateResult.error);
      }

      const template = templateResult.data;

      const emailResult = await this.emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        category: 'authentication',
        userId: user.id
      });

      if (!emailResult.success) {
        return err(emailResult.error);
      }

      this.logInfo('Verification reminder sent successfully', { 
        userId: user.id,
        messageId: emailResult.data.messageId
      });

      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to send verification reminder',
        'VERIFICATION_REMINDER_SEND_FAILED',
        500,
        { userId: user.id, email: user.email }
      ));
    }
  }

  /**
   * Send password change confirmation
   */
  async sendPasswordChangeConfirmation(user: User): Promise<Result<void>> {
    try {
      this.logInfo('Sending password change confirmation', { 
        userId: user.id, 
        email: user.email 
      });

      const subject = 'Password Changed Successfully - LegalOps Platform';
      const html = `
        <h2>Password Changed Successfully</h2>
        <p>Hi ${user.firstName || 'User'},</p>
        <p>Your password has been successfully changed for your LegalOps Platform account.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `;
      const text = `
Password Changed Successfully

Hi ${user.firstName || 'User'},

Your password has been successfully changed for your LegalOps Platform account.

If you didn't make this change, please contact our support team immediately.

Time: ${new Date().toLocaleString()}
      `.trim();

      const emailResult = await this.emailService.sendEmail({
        to: user.email,
        subject,
        html,
        text,
        category: 'security',
        userId: user.id
      });

      if (!emailResult.success) {
        return err(emailResult.error);
      }

      this.logInfo('Password change confirmation sent successfully', { 
        userId: user.id,
        messageId: emailResult.data.messageId
      });

      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to send password change confirmation',
        'PASSWORD_CHANGE_CONFIRMATION_SEND_FAILED',
        500,
        { userId: user.id, email: user.email }
      ));
    }
  }

  /**
   * Send account locked notification
   */
  async sendAccountLockedNotification(user: User, reason: string): Promise<Result<void>> {
    try {
      this.logInfo('Sending account locked notification', { 
        userId: user.id, 
        email: user.email,
        reason
      });

      const subject = 'Account Temporarily Locked - LegalOps Platform';
      const html = `
        <h2>Account Temporarily Locked</h2>
        <p>Hi ${user.firstName || 'User'},</p>
        <p>Your LegalOps Platform account has been temporarily locked for security reasons.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p>If you believe this is an error, please contact our support team.</p>
      `;
      const text = `
Account Temporarily Locked

Hi ${user.firstName || 'User'},

Your LegalOps Platform account has been temporarily locked for security reasons.

Reason: ${reason}
Time: ${new Date().toLocaleString()}

If you believe this is an error, please contact our support team.
      `.trim();

      const emailResult = await this.emailService.sendEmail({
        to: user.email,
        subject,
        html,
        text,
        category: 'security',
        userId: user.id
      });

      if (!emailResult.success) {
        return err(emailResult.error);
      }

      this.logInfo('Account locked notification sent successfully', { 
        userId: user.id,
        reason,
        messageId: emailResult.data.messageId
      });

      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to send account locked notification',
        'ACCOUNT_LOCKED_NOTIFICATION_SEND_FAILED',
        500,
        { userId: user.id, email: user.email, reason }
      ));
    }
  }

  /**
   * Send account unlocked notification
   */
  async sendAccountUnlockedNotification(user: User): Promise<Result<void>> {
    try {
      this.logInfo('Sending account unlocked notification', { 
        userId: user.id, 
        email: user.email 
      });

      const subject = 'Account Unlocked - LegalOps Platform';
      const loginUrl = `${this.baseUrl}/auth/login`;
      
      const html = `
        <h2>Account Unlocked</h2>
        <p>Hi ${user.firstName || 'User'},</p>
        <p>Your LegalOps Platform account has been unlocked and you can now log in normally.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><a href="${loginUrl}">Log in to your account</a></p>
        <p>If you have any concerns, please contact our support team.</p>
      `;
      const text = `
Account Unlocked

Hi ${user.firstName || 'User'},

Your LegalOps Platform account has been unlocked and you can now log in normally.

Time: ${new Date().toLocaleString()}

Log in: ${loginUrl}

If you have any concerns, please contact our support team.
      `.trim();

      const emailResult = await this.emailService.sendEmail({
        to: user.email,
        subject,
        html,
        text,
        category: 'security',
        userId: user.id
      });

      if (!emailResult.success) {
        return err(emailResult.error);
      }

      this.logInfo('Account unlocked notification sent successfully', { 
        userId: user.id,
        messageId: emailResult.data.messageId
      });

      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to send account unlocked notification',
        'ACCOUNT_UNLOCKED_NOTIFICATION_SEND_FAILED',
        500,
        { userId: user.id, email: user.email }
      ));
    }
  }

  /**
   * Schedule verification reminder (to be called by background job)
   */
  async scheduleVerificationReminder(
    user: User, 
    verificationToken: string, 
    delayHours: number = 24
  ): Promise<Result<void>> {
    try {
      // In a real implementation, this would schedule a background job
      // For now, we'll just log the scheduling
      this.logInfo('Verification reminder scheduled', {
        userId: user.id,
        email: user.email,
        delayHours
      });

      // TODO: Implement actual job scheduling with a job queue system
      // This could use Bull, Agenda, or similar job queue library

      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to schedule verification reminder',
        'VERIFICATION_REMINDER_SCHEDULE_FAILED',
        500,
        { userId: user.id, email: user.email }
      ));
    }
  }
}