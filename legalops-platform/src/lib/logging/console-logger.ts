import { ILogger } from '../interfaces/logger.interface';

/**
 * Console-based logger implementation.
 * Provides structured logging to the console with timestamp and context.
 */
export class ConsoleLogger implements ILogger {
  constructor(private readonly serviceName?: string) {}

  /**
   * Log an informational message.
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('INFO', message, context);
  }

  /**
   * Log a warning message.
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('WARN', message, context);
  }

  /**
   * Log an error message.
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log('ERROR', message, context);
  }

  /**
   * Log a debug message.
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, context);
    }
  }

  /**
   * Internal logging method that formats and outputs log entries.
   */
  private log(
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
    message: string,
    context?: Record<string, unknown>
  ): void {
    const timestamp = new Date().toISOString();
    const service = this.serviceName ? `[${this.serviceName}]` : '';
    const logEntry = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...context
    };

    const logMessage = `${timestamp} ${level} ${service} ${message}`;

    switch (level) {
      case 'ERROR':
        console.error(logMessage, context || '');
        break;
      case 'WARN':
        console.warn(logMessage, context || '');
        break;
      case 'DEBUG':
        console.debug(logMessage, context || '');
        break;
      default:
        console.log(logMessage, context || '');
    }

    // In production, you might want to send logs to a logging service
    if (process.env.NODE_ENV === 'production' && level === 'ERROR') {
      // TODO: Send to external logging service (e.g., Sentry, LogRocket)
      // this.sendToExternalService(logEntry);
    }
  }
}

/**
 * Factory function to create a logger instance.
 * 
 * @param serviceName - Optional service name for context
 * @returns A logger instance
 */
export function createLogger(serviceName?: string): ILogger {
  return new ConsoleLogger(serviceName);
}
