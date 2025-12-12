import sgMail from '@sendgrid/mail';
import { BaseService } from './base.service';
import { ILogger } from '../interfaces/logger.interface';
import { Result, ok, err } from '../types/result';
import { IUserRepository } from '../interfaces/user-repository.interface';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@legalops.com';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailResult {
  sent: boolean;
  messageId?: string;
}

/**
 * Email service interface.
 */
export interface IEmailService {
  sendEmail(options: EmailOptions): Promise<Result<EmailResult>>;
  sendOrderConfirmationEmail(
    email: string,
    orderNumber: string,
    amount: number,
    serviceName: string
  ): Promise<Result<EmailResult>>;
  sendOrderDeclinedEmail(
    email: string,
    orderNumber: string,
    reason: string
  ): Promise<Result<EmailResult>>;
  sendPublicationCertificationEmail(
    email: string,
    fictitiousName: string,
    newspaperName: string,
    publicationDate: string,
    certificationDate: string
  ): Promise<Result<EmailResult>>;
  
  // Authentication-related email methods
  sendVerificationEmail(
    email: string,
    token: string,
    firstName: string
  ): Promise<Result<EmailResult>>;
  sendPasswordResetEmail(
    email: string,
    token: string,
    firstName: string
  ): Promise<Result<EmailResult>>;
  sendWelcomeEmail(
    email: string,
    firstName: string
  ): Promise<Result<EmailResult>>;
  sendAccountDeletionConfirmation(
    email: string,
    firstName: string
  ): Promise<Result<EmailResult>>;
}

/**
 * Email service implementation using SendGrid.
 * Extends BaseService for consistent error handling and logging.
 */
export class EmailService extends BaseService implements IEmailService {
  readonly name = 'EmailService';

  constructor(
    logger: ILogger,
    private readonly userRepository?: IUserRepository
  ) {
    super(logger);
  }

  /**
   * Send an email using SendGrid.
   * 
   * @param options - Email options
   * @returns Result with email sending status
   */
  async sendEmail(options: EmailOptions): Promise<Result<EmailResult>> {
    this.logger.debug(`[${this.name}] Sending email to ${options.to}`);

    try {
      // Check if SendGrid is configured
      if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.startsWith('SG.test_')) {
        this.logger.warn(`[${this.name}] SendGrid API key not configured or using test key. Email not sent.`);
        this.logger.warn(`[${this.name}] Would have sent email to: ${options.to}`);
        this.logger.warn(`[${this.name}] Subject: ${options.subject}`);
        
        return ok({
          sent: false,
          messageId: 'test-mode'
        });
      }

      const response = await sgMail.send({
        to: options.to,
        from: FROM_EMAIL,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.info(`[${this.name}] Email sent successfully to ${options.to}`);

      return ok({
        sent: true,
        messageId: response[0]?.headers?.['x-message-id'] as string
      });

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to send email to ${options.to}`, {
        error,
        subject: options.subject
      });

      return err(this.createError(
        `Failed to send email to ${options.to}`,
        'EMAIL_SEND_FAILED',
        500,
        { originalError: error }
      ));
    }
  }

  /**
   * Send order confirmation email.
   * 
   * @param email - Recipient email address
   * @param orderNumber - Order number
   * @param amount - Order amount
   * @param serviceName - Service name
   * @returns Result with email sending status
   */
  async sendOrderConfirmationEmail(
    email: string,
    orderNumber: string,
    amount: number,
    serviceName: string
  ): Promise<Result<EmailResult>> {
    this.logger.debug(`[${this.name}] Sending order confirmation email for order ${orderNumber}`);
    
    // Try to get user context if user repository is available
    let userContext: { isAuthenticated: boolean; firstName?: string } = { isAuthenticated: false };
    
    if (this.userRepository) {
      try {
        const userResult = await this.userRepository.findByEmail(email);
        if (userResult.isSuccess() && userResult.value) {
          userContext = {
            isAuthenticated: true,
            firstName: userResult.value.firstName || undefined
          };
        }
      } catch (error) {
        this.logWarn('Failed to get user context for order confirmation email', {
          email,
          orderNumber,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Log order confirmation with user context
    this.logInfo('Sending order confirmation email', {
      email,
      orderNumber,
      amount,
      serviceName,
      emailType: 'order_confirmation',
      isAuthenticated: userContext.isAuthenticated,
      hasUserAccount: userContext.isAuthenticated
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
            .order-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed! 🎉</h1>
              <p>Thank you for your order</p>
            </div>

            <div class="content">
              <p>Hi there,</p>
              <p>Your order has been successfully received and payment has been processed. Here are your order details:</p>

              <div class="order-details">
                <div class="detail-row">
                  <strong>Order Number:</strong>
                  <span>${orderNumber}</span>
                </div>
                <div class="detail-row">
                  <strong>Service:</strong>
                  <span>${serviceName}</span>
                </div>
                <div class="detail-row">
                  <strong>Amount Paid:</strong>
                  <span>$${amount.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                  <strong>Date:</strong>
                  <span>${new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <h3>What's Next?</h3>
              <ol>
                <li>We'll review your filing information</li>
                <li>Our team will prepare your documents</li>
                <li>We'll file with the Florida Department of State</li>
                <li>You'll receive updates via email</li>
              </ol>

              <p>You can track your order status anytime by logging into your dashboard.</p>

              <a href="${process.env.NEXTAUTH_URL}/dashboard/orders/${orderNumber}" class="button">View Order</a>
            </div>

            <div class="footer">
              <p>LegalOps - Florida Business Formation Services</p>
              <p>Questions? Contact us at support@legalops.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Order Confirmed - ${orderNumber}`,
      html,
    });
  }

  /**
   * Send order declined email.
   * 
   * @param email - Recipient email address
   * @param orderNumber - Order number
   * @param reason - Decline reason
   * @returns Result with email sending status
   */
  async sendOrderDeclinedEmail(
    email: string,
    orderNumber: string,
    reason: string
  ): Promise<Result<EmailResult>> {
    this.logger.debug(`[${this.name}] Sending order declined email for order ${orderNumber}`);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #fee2e2; color: #991b1b; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Review Required</h1>
            </div>

            <div class="content">
              <p>Hi there,</p>
              <p>We were unable to process your order at this time. This is a standard security measure to protect both you and our business.</p>

              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Reason:</strong> ${reason}</p>

              <p><strong>Important:</strong> No charges have been made to your payment method.</p>

              <p>If you believe this is an error or would like to discuss your order, please contact our support team:</p>
              <ul>
                <li>Email: support@legalops.com</li>
                <li>Phone: 1-800-555-0123</li>
              </ul>

              <p>We apologize for any inconvenience.</p>
            </div>

            <div class="footer">
              <p>LegalOps - Florida Business Formation Services</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Order Review Required - ${orderNumber}`,
      html,
    });
  }

  /**
   * Send publication certification email.
   * 
   * @param email - Recipient email address
   * @param fictitiousName - Fictitious name
   * @param newspaperName - Newspaper name
   * @param publicationDate - Publication date
   * @param certificationDate - Certification date
   * @returns Result with email sending status
   */
  async sendPublicationCertificationEmail(
    email: string,
    fictitiousName: string,
    newspaperName: string,
    publicationDate: string,
    certificationDate: string
  ): Promise<Result<EmailResult>> {
    this.logger.debug(`[${this.name}] Sending publication certification email for ${fictitiousName}`);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
            .certification-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #10B981; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .warning-box { background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 6px; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Publication Certification Confirmed</h1>
            </div>

            <div class="content">
              <p>Hi there,</p>
              <p>This email confirms that you have certified newspaper publication for your DBA filing. This is an important legal requirement for your fictitious name registration in Florida.</p>

              <div class="certification-details">
                <h3 style="margin-top: 0; color: #065F46;">Certification Details</h3>
                <div class="detail-row">
                  <strong>Fictitious Name:</strong>
                  <span>${fictitiousName}</span>
                </div>
                <div class="detail-row">
                  <strong>Newspaper Name:</strong>
                  <span>${newspaperName}</span>
                </div>
                <div class="detail-row">
                  <strong>Publication Date:</strong>
                  <span>${new Date(publicationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <strong>Certification Date:</strong>
                  <span>${certificationDate}</span>
                </div>
              </div>

              <div class="warning-box">
                <strong style="color: #92400E;">⚠️ Important Legal Notice</strong>
                <p style="margin: 8px 0 0 0; color: #78350F; font-size: 14px;">
                  This certification is a legal statement that you have published the required notice in a newspaper of general circulation.
                  False certification may result in rejection of your filing and potential penalties under Florida law.
                </p>
              </div>

              <h3>What's Next?</h3>
              <ol>
                <li>Complete your payment to submit your DBA filing</li>
                <li>We'll review your information and publication certification</li>
                <li>We'll file your DBA with the Florida Department of State</li>
                <li>You'll receive your official registration confirmation</li>
              </ol>

              <p><strong>Keep this email for your records.</strong> It serves as proof of your certification and the details you provided.</p>

              <p>If you did not make this certification or believe this is an error, please contact us immediately.</p>
            </div>

            <div class="footer">
              <p>LegalOps - Florida Business Formation Services</p>
              <p>Questions? Contact us at support@legalops.com</p>
              <p style="margin-top: 10px; font-size: 11px; color: #9CA3AF;">
                This is an automated confirmation email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Publication Certification Confirmed - ${fictitiousName}`,
      html,
    });
  }

  /**
   * Send email verification email.
   * 
   * @param email - Recipient email address
   * @param token - Verification token
   * @param firstName - User's first name
   * @returns Result with email sending status
   */
  async sendVerificationEmail(
    email: string,
    token: string,
    firstName: string
  ): Promise<Result<EmailResult>> {
    this.logger.debug(`[${this.name}] Sending verification email to ${email}`);
    
    // Log user context for audit trail
    this.logInfo('Sending email verification', {
      email,
      firstName,
      emailType: 'verification',
      hasToken: !!token
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 15px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to LegalOps! 🎉</h1>
              <p>Please verify your email address</p>
            </div>

            <div class="content">
              <p>Hi ${firstName},</p>
              <p>Thank you for creating an account with LegalOps. To complete your registration and start using our services, please verify your email address by clicking the button below:</p>

              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>

              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
                ${verificationUrl}
              </p>

              <div class="warning">
                <strong>⚠️ Important:</strong> This verification link will expire in 24 hours for security reasons.
              </div>

              <p>Once verified, you'll be able to:</p>
              <ul>
                <li>Access your personalized dashboard</li>
                <li>Save form drafts and auto-fill information</li>
                <li>Track your orders and filings</li>
                <li>Receive important updates about your business</li>
              </ul>

              <p>If you didn't create this account, please ignore this email.</p>
            </div>

            <div class="footer">
              <p>LegalOps - Florida Business Formation Services</p>
              <p>Questions? Contact us at support@legalops.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify your LegalOps account',
      html,
    });
  }

  /**
   * Send password reset email.
   * 
   * @param email - Recipient email address
   * @param token - Password reset token
   * @param firstName - User's first name
   * @returns Result with email sending status
   */
  async sendPasswordResetEmail(
    email: string,
    token: string,
    firstName: string
  ): Promise<Result<EmailResult>> {
    this.logger.debug(`[${this.name}] Sending password reset email to ${email}`);
    
    // Log user context for audit trail
    this.logInfo('Sending password reset email', {
      email,
      firstName,
      emailType: 'password_reset',
      hasToken: !!token
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #fee2e2; color: #991b1b; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 15px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 15px 0; }
            .security-notice { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 15px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>

            <div class="content">
              <p>Hi ${firstName},</p>
              <p>We received a request to reset the password for your LegalOps account. If you made this request, click the button below to create a new password:</p>

              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>

              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
                ${resetUrl}
              </p>

              <div class="warning">
                <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour for security reasons.
              </div>

              <div class="security-notice">
                <strong>🛡️ Security Notice:</strong>
                <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                  <li>If you didn't request this password reset, please ignore this email</li>
                  <li>Your current password will remain unchanged</li>
                  <li>Consider enabling two-factor authentication for added security</li>
                </ul>
              </div>

              <p>If you're having trouble accessing your account or didn't request this reset, please contact our support team immediately.</p>
            </div>

            <div class="footer">
              <p>LegalOps - Florida Business Formation Services</p>
              <p>Questions? Contact us at support@legalops.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset your LegalOps password',
      html,
    });
  }

  /**
   * Send welcome email after successful verification.
   * 
   * @param email - Recipient email address
   * @param firstName - User's first name
   * @returns Result with email sending status
   */
  async sendWelcomeEmail(
    email: string,
    firstName: string
  ): Promise<Result<EmailResult>> {
    this.logger.debug(`[${this.name}] Sending welcome email to ${email}`);
    
    // Log user context for audit trail
    this.logInfo('Sending welcome email', {
      email,
      firstName,
      emailType: 'welcome'
    });

    const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 15px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            .feature-box { background: white; border-radius: 6px; padding: 15px; margin: 15px 0; border-left: 4px solid #10b981; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to LegalOps!</h1>
              <p>Your account is now active</p>
            </div>

            <div class="content">
              <p>Hi ${firstName},</p>
              <p>Congratulations! Your email has been verified and your LegalOps account is now fully active. You're ready to start forming your Florida business with confidence.</p>

              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
              </div>

              <h3>What you can do now:</h3>

              <div class="feature-box">
                <h4 style="margin-top: 0; color: #065f46;">🏢 Form Your Business</h4>
                <p style="margin-bottom: 0;">Create LLCs, Corporations, or register DBAs with our guided forms and AI assistance.</p>
              </div>

              <div class="feature-box">
                <h4 style="margin-top: 0; color: #065f46;">📋 Smart Auto-Fill</h4>
                <p style="margin-bottom: 0;">Save time with intelligent form filling that remembers your information across filings.</p>
              </div>

              <div class="feature-box">
                <h4 style="margin-top: 0; color: #065f46;">📊 Track Everything</h4>
                <p style="margin-bottom: 0;">Monitor your filings, view documents, and stay compliant with your personalized dashboard.</p>
              </div>

              <div class="feature-box">
                <h4 style="margin-top: 0; color: #065f46;">🛡️ AI Risk Protection</h4>
                <p style="margin-bottom: 0;">Our AI reviews your filings for accuracy and compliance before submission.</p>
              </div>

              <h3>Need help getting started?</h3>
              <ul>
                <li>📚 Check out our <a href="${process.env.NEXTAUTH_URL}/guides">step-by-step guides</a></li>
                <li>💬 Chat with our support team</li>
                <li>📞 Call us at 1-800-555-0123</li>
                <li>📧 Email us at support@legalops.com</li>
              </ul>

              <p>We're here to make your business formation journey as smooth as possible. Welcome aboard!</p>
            </div>

            <div class="footer">
              <p>LegalOps - Florida Business Formation Services</p>
              <p>Questions? We're here to help at support@legalops.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to LegalOps - Your account is ready!',
      html,
    });
  }

  /**
   * Send account deletion confirmation email.
   * 
   * @param email - Recipient email address
   * @param firstName - User's first name
   * @returns Result with email sending status
   */
  async sendAccountDeletionConfirmation(
    email: string,
    firstName: string
  ): Promise<Result<EmailResult>> {
    this.logger.debug(`[${this.name}] Sending account deletion confirmation email to ${email}`);
    
    // Log user context for audit trail
    this.logInfo('Sending account deletion confirmation email', {
      email,
      firstName,
      emailType: 'account_deletion_confirmation'
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #3b82f6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Deletion Confirmed</h1>
              <p>Your LegalOps account has been permanently deleted</p>
            </div>

            <div class="content">
              <p>Hi ${firstName},</p>
              <p>This email confirms that your LegalOps account and associated personal data have been permanently deleted from our systems as requested.</p>

              <div class="warning">
                <strong>⚠️ Important:</strong> This action cannot be undone. Your account and personal data have been permanently removed.
              </div>

              <h3>What was deleted:</h3>
              <ul>
                <li>Your user account and profile information</li>
                <li>Personal data and preferences</li>
                <li>Form drafts and saved information</li>
                <li>Session data and login history</li>
                <li>Communication preferences</li>
              </ul>

              <div class="info-box">
                <h4 style="margin-top: 0; color: #1f2937;">📋 Records Retained for Legal Compliance</h4>
                <p>In accordance with our Privacy Policy and legal requirements, some business records may be retained for:</p>
                <ul style="margin-bottom: 0;">
                  <li>Tax record keeping (7 years)</li>
                  <li>Business transaction records (7 years)</li>
                  <li>Legal document filings (10 years)</li>
                  <li>Fraud prevention and security monitoring</li>
                </ul>
              </div>

              <h3>What this means:</h3>
              <ul>
                <li>You can no longer log into your LegalOps account</li>
                <li>You will not receive any further communications from us (except legally required notices)</li>
                <li>Your personal data has been removed from our marketing and analytics systems</li>
                <li>Any active services or subscriptions have been cancelled</li>
              </ul>

              <div class="info-box">
                <h4 style="margin-top: 0; color: #1f2937;">🔄 Need Our Services Again?</h4>
                <p style="margin-bottom: 0;">If you need our services in the future, you can create a new account at any time. However, you will need to re-enter all your information as your previous data cannot be recovered.</p>
              </div>

              <p>Thank you for using LegalOps. We're sorry to see you go, and we wish you the best in your business endeavors.</p>
            </div>

            <div class="footer">
              <p>LegalOps - Florida Business Formation Services</p>
              <p>This is an automated confirmation email. Please do not reply to this message.</p>
              <p>If you believe this deletion was made in error, please contact support@legalops.com immediately.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'LegalOps Account Deletion Confirmed',
      html,
    });
  }
}

// Legacy function exports for backward compatibility
// These will be deprecated in favor of the EmailService class

/**
 * @deprecated Use EmailService.sendEmail() instead
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const emailService = new EmailService(console as any);
  const result = await emailService.sendEmail(options);
  return result.success && result.data.sent;
}

/**
 * @deprecated Use EmailService.sendOrderConfirmationEmail() instead
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  amount: number,
  serviceName: string
): Promise<boolean> {
  const emailService = new EmailService(console as any);
  const result = await emailService.sendOrderConfirmationEmail(email, orderNumber, amount, serviceName);
  return result.success && result.data.sent;
}

/**
 * @deprecated Use EmailService.sendOrderDeclinedEmail() instead
 */
export async function sendOrderDeclinedEmail(
  email: string,
  orderNumber: string,
  reason: string
): Promise<boolean> {
  const emailService = new EmailService(console as any);
  const result = await emailService.sendOrderDeclinedEmail(email, orderNumber, reason);
  return result.success && result.data.sent;
}

/**
 * @deprecated Use EmailService.sendPublicationCertificationEmail() instead
 */
export async function sendPublicationCertificationEmail(
  email: string,
  fictitiousName: string,
  newspaperName: string,
  publicationDate: string,
  certificationDate: string
): Promise<boolean> {
  const emailService = new EmailService(console as any);
  const result = await emailService.sendPublicationCertificationEmail(
    email,
    fictitiousName,
    newspaperName,
    publicationDate,
    certificationDate
  );
  return result.success && result.data.sent;
}