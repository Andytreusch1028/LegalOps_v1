/**
 * Alert severity levels for staff notifications.
 */
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Alert notification payload.
 */
export interface AlertNotification {
  /**
   * Severity level of the alert.
   */
  severity: AlertSeverity;

  /**
   * Human-readable alert message.
   */
  message: string;

  /**
   * Additional context data for debugging.
   */
  context?: Record<string, unknown>;

  /**
   * Timestamp when the alert was created.
   */
  timestamp?: Date;
}

/**
 * Alert service interface for notifying staff of critical issues.
 * Provides methods to send alerts through various channels.
 */
export interface IAlertService {
  /**
   * Notify staff of an issue.
   * 
   * @param notification - The alert notification to send
   * @returns Promise that resolves when the notification is sent
   */
  notifyStaff(notification: AlertNotification): Promise<void>;

  /**
   * Check if an error should trigger an alert based on its status code.
   * 
   * @param statusCode - HTTP status code
   * @returns True if the error should trigger an alert
   */
  shouldAlert(statusCode: number): boolean;
}
