/**
 * Logger interface for dependency injection.
 * Provides structured logging capabilities across the application.
 */
export interface ILogger {
  /**
   * Log an informational message.
   * 
   * @param message - The log message
   * @param context - Additional context data
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Log a warning message.
   * 
   * @param message - The log message
   * @param context - Additional context data
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Log an error message.
   * 
   * @param message - The log message
   * @param context - Additional context data including error details
   */
  error(message: string, context?: Record<string, unknown>): void;

  /**
   * Log a debug message.
   * 
   * @param message - The log message
   * @param context - Additional context data
   */
  debug(message: string, context?: Record<string, unknown>): void;
}
