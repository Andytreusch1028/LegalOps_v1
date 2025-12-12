/**
 * Alert Service Implementation
 * 
 * Provides staff notification capabilities for critical system errors.
 * Supports multiple notification channels and severity-based routing.
 */

import { IAlertService, AlertNotification, AlertSeverity } from '../interfaces/alert.interface';
import { ILogger } from '../interfaces/logger.interface';

/**
 * Alert configuration for different notification channels.
 */
export interface AlertConfig {
  /** Enable email notifications */
  emailEnabled: boolean;
  /** Email addresses for staff notifications */
  staffEmails: string[];
  /** Enable Slack notifications */
  slackEnabled: boolean;
  /** Slack webhook URL */
  slackWebhookUrl?: string;
  /** Enable console logging for alerts */
  consoleEnabled: boolean;
  /** Minimum severity level to trigger alerts */
  minSeverity: AlertSeverity;
}

/**
 * Production-ready alert service with multiple notification channels.
 */
export class AlertService implements IAlertService {
  private readonly severityLevels: Record<AlertSeverity, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };

  constructor(
    private readonly config: AlertConfig,
    private readonly logger: ILogger
  ) {}

  /**
   * Notify staff of an issue through configured channels.
   */
  async notifyStaff(notification: AlertNotification): Promise<void> {
    // Add timestamp if not provided
    const alert: AlertNotification = {
      ...notification,
      timestamp: notification.timestamp || new Date()
    };

    // Check if alert meets minimum severity threshold
    if (!this.shouldAlert(alert.severity)) {
      this.logger.debug('Alert below minimum severity threshold', {
        severity: alert.severity,
        minSeverity: this.config.minSeverity,
        message: alert.message
      });
      return;
    }

    this.logger.info('Sending staff alert', {
      severity: alert.severity,
      message: alert.message,
      context: alert.context
    });

    // Send notifications through all enabled channels
    const promises: Promise<void>[] = [];

    if (this.config.consoleEnabled) {
      promises.push(this.sendConsoleAlert(alert));
    }

    if (this.config.emailEnabled && this.config.staffEmails.length > 0) {
      promises.push(this.sendEmailAlert(alert));
    }

    if (this.config.slackEnabled && this.config.slackWebhookUrl) {
      promises.push(this.sendSlackAlert(alert));
    }

    // Wait for all notifications to complete
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      this.logger.error('Error sending staff alerts', {
        error,
        alert: {
          severity: alert.severity,
          message: alert.message
        }
      });
    }
  }

  /**
   * Check if an error should trigger an alert based on severity.
   */
  shouldAlert(severity: AlertSeverity): boolean {
    const alertLevel = this.severityLevels[severity];
    const minLevel = this.severityLevels[this.config.minSeverity];
    return alertLevel >= minLevel;
  }

  /**
   * Send alert to console (always available fallback).
   */
  private async sendConsoleAlert(alert: AlertNotification): Promise<void> {
    const timestamp = alert.timestamp?.toISOString() || new Date().toISOString();
    const emoji = this.getSeverityEmoji(alert.severity);
    
    console.error(
      `${emoji} [ALERT - ${alert.severity.toUpperCase()}] ${timestamp}\n` +
      `Message: ${alert.message}\n` +
      `Context: ${JSON.stringify(alert.context, null, 2)}`
    );
  }

  /**
   * Send alert via email (requires email service configuration).
   */
  private async sendEmailAlert(alert: AlertNotification): Promise<void> {
    try {
      // In a real implementation, this would use an email service like:
      // - SendGrid
      // - AWS SES
      // - Nodemailer with SMTP
      // - Resend
      
      const subject = `🚨 ${alert.severity.toUpperCase()} Alert: ${alert.message}`;
      const body = this.formatEmailBody(alert);

      // Placeholder for email sending logic
      this.logger.info('Email alert would be sent', {
        to: this.config.staffEmails,
        subject,
        severity: alert.severity
      });

      // TODO: Implement actual email sending
      // await emailService.send({
      //   to: this.config.staffEmails,
      //   subject,
      //   html: body
      // });

    } catch (error) {
      this.logger.error('Failed to send email alert', {
        error,
        alert: { severity: alert.severity, message: alert.message }
      });
    }
  }

  /**
   * Send alert to Slack channel.
   */
  private async sendSlackAlert(alert: AlertNotification): Promise<void> {
    if (!this.config.slackWebhookUrl) {
      return;
    }

    try {
      const payload = {
        text: `🚨 ${alert.severity.toUpperCase()} Alert`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${this.getSeverityEmoji(alert.severity)} ${alert.severity.toUpperCase()} Alert`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Message:* ${alert.message}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Time:* ${alert.timestamp?.toISOString() || new Date().toISOString()}`
            }
          }
        ]
      };

      // Add context if available
      if (alert.context && Object.keys(alert.context).length > 0) {
        payload.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Context:*\n\`\`\`${JSON.stringify(alert.context, null, 2)}\`\`\``
          }
        });
      }

      const response = await fetch(this.config.slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
      }

      this.logger.debug('Slack alert sent successfully', {
        severity: alert.severity,
        message: alert.message
      });

    } catch (error) {
      this.logger.error('Failed to send Slack alert', {
        error,
        alert: { severity: alert.severity, message: alert.message }
      });
    }
  }

  /**
   * Get emoji for severity level.
   */
  private getSeverityEmoji(severity: AlertSeverity): string {
    switch (severity) {
      case 'low':
        return '🟡';
      case 'medium':
        return '🟠';
      case 'high':
        return '🔴';
      case 'critical':
        return '🚨';
      default:
        return '⚠️';
    }
  }

  /**
   * Format email body for alert notifications.
   */
  private formatEmailBody(alert: AlertNotification): string {
    const timestamp = alert.timestamp?.toISOString() || new Date().toISOString();
    
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h1 style="color: #dc3545; margin-top: 0;">
              ${this.getSeverityEmoji(alert.severity)} ${alert.severity.toUpperCase()} Alert
            </h1>
            
            <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #333;">Message:</h3>
              <p style="color: #666;">${alert.message}</p>
            </div>
            
            <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #333;">Timestamp:</h3>
              <p style="color: #666;">${timestamp}</p>
            </div>
            
            ${alert.context ? `
              <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #333;">Context:</h3>
                <pre style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; color: #666;">${JSON.stringify(alert.context, null, 2)}</pre>
              </div>
            ` : ''}
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
              <p>This alert was generated automatically by the LegalOps platform.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

/**
 * Create alert service with environment-based configuration.
 */
export function createAlertService(logger: ILogger): IAlertService {
  const config: AlertConfig = {
    emailEnabled: process.env.ALERT_EMAIL_ENABLED === 'true',
    staffEmails: process.env.ALERT_STAFF_EMAILS?.split(',') || [],
    slackEnabled: process.env.ALERT_SLACK_ENABLED === 'true',
    slackWebhookUrl: process.env.ALERT_SLACK_WEBHOOK_URL,
    consoleEnabled: true, // Always enable console as fallback
    minSeverity: (process.env.ALERT_MIN_SEVERITY as AlertSeverity) || 'medium'
  };

  return new AlertService(config, logger);
}