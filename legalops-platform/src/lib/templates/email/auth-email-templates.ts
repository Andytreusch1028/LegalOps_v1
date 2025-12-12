/**
 * Authentication Email Templates
 * 
 * Provides email templates for authentication workflows including:
 * - Email verification
 * - Password reset
 * - Welcome emails
 * - Account security notifications
 */

import { Result, ok, err } from '../../types/result';

/**
 * Email template data interfaces
 */
export interface EmailVerificationData {
  firstName: string;
  verificationUrl: string;
  expiresIn: string;
}

export interface PasswordResetData {
  firstName: string;
  resetUrl: string;
  expiresIn: string;
  requestedAt: string;
}

export interface WelcomeEmailData {
  firstName: string;
  lastName: string;
  loginUrl: string;
  supportUrl: string;
}

export interface SecurityNotificationData {
  firstName: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
}

/**
 * Email template result
 */
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Authentication email templates class
 */
export class AuthEmailTemplates {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  private static readonly COMPANY_NAME = 'LegalOps Platform';
  private static readonly SUPPORT_EMAIL = 'support@legalops.com';

  /**
   * Generate email verification template
   */
  static generateEmailVerification(data: EmailVerificationData): Result<EmailTemplate> {
    try {
      const subject = `Verify your ${this.COMPANY_NAME} account`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .content { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .button:hover { background: #1d4ed8; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
            .security-note { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${this.COMPANY_NAME}</div>
            </div>
            
            <div class="content">
              <h2>Welcome, ${data.firstName}!</h2>
              <p>Thank you for creating your ${this.COMPANY_NAME} account. To complete your registration and start using our platform, please verify your email address.</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
              </p>
              
              <div class="security-note">
                <strong>Security Note:</strong> This verification link will expire in ${data.expiresIn}. If you didn't create this account, please ignore this email.
              </div>
              
              <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${data.verificationUrl}</p>
            </div>
            
            <div class="footer">
              <p>Need help? Contact us at <a href="mailto:${this.SUPPORT_EMAIL}">${this.SUPPORT_EMAIL}</a></p>
              <p>&copy; 2024 ${this.COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Welcome to ${this.COMPANY_NAME}!

Hi ${data.firstName},

Thank you for creating your ${this.COMPANY_NAME} account. To complete your registration, please verify your email address by clicking the link below:

${data.verificationUrl}

This verification link will expire in ${data.expiresIn}.

If you didn't create this account, please ignore this email.

Need help? Contact us at ${this.SUPPORT_EMAIL}

© 2024 ${this.COMPANY_NAME}. All rights reserved.
      `.trim();

      return ok({ subject, html, text });
    } catch (error) {
      return err(new Error(`Failed to generate email verification template: ${error}`));
    }
  }

  /**
   * Generate password reset template
   */
  static generatePasswordReset(data: PasswordResetData): Result<EmailTemplate> {
    try {
      const subject = `Reset your ${this.COMPANY_NAME} password`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .content { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .button:hover { background: #b91c1c; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
            .security-note { background: #fef2f2; border: 1px solid #ef4444; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${this.COMPANY_NAME}</div>
            </div>
            
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hi ${data.firstName},</p>
              <p>We received a request to reset your password for your ${this.COMPANY_NAME} account on ${data.requestedAt}.</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.resetUrl}" class="button">Reset Password</a>
              </p>
              
              <div class="security-note">
                <strong>Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This reset link will expire in ${data.expiresIn}</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password will remain unchanged until you create a new one</li>
                </ul>
              </div>
              
              <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${data.resetUrl}</p>
            </div>
            
            <div class="footer">
              <p>If you're having trouble, contact us at <a href="mailto:${this.SUPPORT_EMAIL}">${this.SUPPORT_EMAIL}</a></p>
              <p>&copy; 2024 ${this.COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Password Reset Request - ${this.COMPANY_NAME}

Hi ${data.firstName},

We received a request to reset your password for your ${this.COMPANY_NAME} account on ${data.requestedAt}.

To reset your password, click the link below:
${data.resetUrl}

Security Notice:
- This reset link will expire in ${data.expiresIn}
- If you didn't request this reset, please ignore this email
- Your password will remain unchanged until you create a new one

If you're having trouble, contact us at ${this.SUPPORT_EMAIL}

© 2024 ${this.COMPANY_NAME}. All rights reserved.
      `.trim();

      return ok({ subject, html, text });
    } catch (error) {
      return err(new Error(`Failed to generate password reset template: ${error}`));
    }
  }

  /**
   * Generate welcome email template
   */
  static generateWelcomeEmail(data: WelcomeEmailData): Result<EmailTemplate> {
    try {
      const subject = `Welcome to ${this.COMPANY_NAME}, ${data.firstName}!`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .content { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .button:hover { background: #047857; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
            .feature-list { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .feature-item { margin: 10px 0; padding-left: 20px; position: relative; }
            .feature-item:before { content: "✓"; position: absolute; left: 0; color: #059669; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${this.COMPANY_NAME}</div>
            </div>
            
            <div class="content">
              <h2>Welcome to ${this.COMPANY_NAME}!</h2>
              <p>Hi ${data.firstName},</p>
              <p>Congratulations! Your account has been successfully verified and you're now ready to start using ${this.COMPANY_NAME}.</p>
              
              <div class="feature-list">
                <h3>What you can do now:</h3>
                <div class="feature-item">Create and manage legal documents with Smart Forms</div>
                <div class="feature-item">Auto-fill forms with your saved profile information</div>
                <div class="feature-item">Track your document orders and submissions</div>
                <div class="feature-item">Access your personalized dashboard</div>
                <div class="feature-item">Manage your privacy preferences and data</div>
              </div>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.loginUrl}" class="button">Get Started</a>
              </p>
              
              <p>If you have any questions or need assistance, our support team is here to help. Visit our <a href="${data.supportUrl}">support center</a> or reply to this email.</p>
            </div>
            
            <div class="footer">
              <p>Questions? Contact us at <a href="mailto:${this.SUPPORT_EMAIL}">${this.SUPPORT_EMAIL}</a></p>
              <p>&copy; 2024 ${this.COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Welcome to ${this.COMPANY_NAME}!

Hi ${data.firstName},

Congratulations! Your account has been successfully verified and you're now ready to start using ${this.COMPANY_NAME}.

What you can do now:
✓ Create and manage legal documents with Smart Forms
✓ Auto-fill forms with your saved profile information
✓ Track your document orders and submissions
✓ Access your personalized dashboard
✓ Manage your privacy preferences and data

Get started: ${data.loginUrl}

If you have any questions or need assistance, our support team is here to help. Visit our support center at ${data.supportUrl} or reply to this email.

Questions? Contact us at ${this.SUPPORT_EMAIL}

© 2024 ${this.COMPANY_NAME}. All rights reserved.
      `.trim();

      return ok({ subject, html, text });
    } catch (error) {
      return err(new Error(`Failed to generate welcome email template: ${error}`));
    }
  }

  /**
   * Generate security notification template
   */
  static generateSecurityNotification(data: SecurityNotificationData): Result<EmailTemplate> {
    try {
      const subject = `Security Alert: ${data.action} - ${this.COMPANY_NAME}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .content { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .alert { background: #fef2f2; border: 1px solid #ef4444; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${this.COMPANY_NAME}</div>
            </div>
            
            <div class="content">
              <div class="alert">
                <h2 style="color: #dc2626; margin-top: 0;">🔒 Security Alert</h2>
                <p><strong>Action:</strong> ${data.action}</p>
                <p><strong>Time:</strong> ${data.timestamp}</p>
              </div>
              
              <p>Hi ${data.firstName},</p>
              <p>We detected the following security-related activity on your ${this.COMPANY_NAME} account:</p>
              
              <div class="details">
                <h3>Activity Details:</h3>
                <p><strong>Action:</strong> ${data.action}</p>
                <p><strong>Date & Time:</strong> ${data.timestamp}</p>
                <p><strong>IP Address:</strong> ${data.ipAddress}</p>
                <p><strong>Device:</strong> ${data.userAgent}</p>
                ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
              </div>
              
              <p><strong>If this was you:</strong> No action is required. This notification is for your security awareness.</p>
              
              <p><strong>If this wasn't you:</strong> Please immediately:</p>
              <ul>
                <li>Change your password</li>
                <li>Review your account activity</li>
                <li>Contact our support team</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>Security concerns? Contact us immediately at <a href="mailto:${this.SUPPORT_EMAIL}">${this.SUPPORT_EMAIL}</a></p>
              <p>&copy; 2024 ${this.COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Security Alert - ${this.COMPANY_NAME}

Hi ${data.firstName},

We detected the following security-related activity on your ${this.COMPANY_NAME} account:

Activity Details:
- Action: ${data.action}
- Date & Time: ${data.timestamp}
- IP Address: ${data.ipAddress}
- Device: ${data.userAgent}
${data.location ? `- Location: ${data.location}` : ''}

If this was you: No action is required. This notification is for your security awareness.

If this wasn't you: Please immediately:
- Change your password
- Review your account activity
- Contact our support team

Security concerns? Contact us immediately at ${this.SUPPORT_EMAIL}

© 2024 ${this.COMPANY_NAME}. All rights reserved.
      `.trim();

      return ok({ subject, html, text });
    } catch (error) {
      return err(new Error(`Failed to generate security notification template: ${error}`));
    }
  }

  /**
   * Generate verification token expiry reminder template
   */
  static generateVerificationReminder(data: EmailVerificationData): Result<EmailTemplate> {
    try {
      const subject = `Reminder: Verify your ${this.COMPANY_NAME} account`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .content { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .button:hover { background: #d97706; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
            .reminder-note { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${this.COMPANY_NAME}</div>
            </div>
            
            <div class="content">
              <h2>Don't forget to verify your account!</h2>
              <p>Hi ${data.firstName},</p>
              <p>We noticed you haven't verified your ${this.COMPANY_NAME} account yet. To start using all our features, please verify your email address.</p>
              
              <div class="reminder-note">
                <strong>⏰ Time Sensitive:</strong> Your verification link will expire in ${data.expiresIn}. After that, you'll need to request a new verification email.
              </div>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.verificationUrl}" class="button">Verify Email Now</a>
              </p>
              
              <p>Once verified, you'll be able to:</p>
              <ul>
                <li>Access your personalized dashboard</li>
                <li>Create and manage legal documents</li>
                <li>Save your profile for auto-fill</li>
                <li>Track your orders and submissions</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>Need help? Contact us at <a href="mailto:${this.SUPPORT_EMAIL}">${this.SUPPORT_EMAIL}</a></p>
              <p>&copy; 2024 ${this.COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Reminder: Verify your ${this.COMPANY_NAME} account

Hi ${data.firstName},

We noticed you haven't verified your ${this.COMPANY_NAME} account yet. To start using all our features, please verify your email address.

⏰ Time Sensitive: Your verification link will expire in ${data.expiresIn}. After that, you'll need to request a new verification email.

Verify your email: ${data.verificationUrl}

Once verified, you'll be able to:
- Access your personalized dashboard
- Create and manage legal documents
- Save your profile for auto-fill
- Track your orders and submissions

Need help? Contact us at ${this.SUPPORT_EMAIL}

© 2024 ${this.COMPANY_NAME}. All rights reserved.
      `.trim();

      return ok({ subject, html, text });
    } catch (error) {
      return err(new Error(`Failed to generate verification reminder template: ${error}`));
    }
  }
}