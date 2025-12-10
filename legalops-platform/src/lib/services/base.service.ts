import { IService } from '../interfaces/service.interface';
import { ILogger } from '../interfaces/logger.interface';
import { AppError } from '../types/result';

/**
 * Abstract base service class.
 * Provides common functionality for all service implementations.
 * 
 * Services encapsulate business logic and should be the primary way
 * to interact with data and perform operations.
 */
export abstract class BaseService implements IService {
  /**
   * The name of the service for logging and identification.
   * Must be implemented by derived classes.
   */
  abstract readonly name: string;

  /**
   * Creates a new BaseService instance.
   * 
   * @param logger - Logger instance for structured logging
   */
  protected constructor(protected readonly logger: ILogger) {}

  /**
   * Logs an error with service context.
   * 
   * @param error - The error to log
   * @param context - Additional context data
   */
  protected logError(error: unknown, context?: Record<string, unknown>): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.logger.error(`[${this.name}] Error: ${errorMessage}`, {
      error: errorMessage,
      stack: errorStack,
      ...context
    });
  }

  /**
   * Logs an informational message with service context.
   * 
   * @param message - The message to log
   * @param context - Additional context data
   */
  protected logInfo(message: string, context?: Record<string, unknown>): void {
    this.logger.info(`[${this.name}] ${message}`, context);
  }

  /**
   * Logs a warning message with service context.
   * 
   * @param message - The message to log
   * @param context - Additional context data
   */
  protected logWarn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(`[${this.name}] ${message}`, context);
  }

  /**
   * Logs a debug message with service context.
   * 
   * @param message - The message to log
   * @param context - Additional context data
   */
  protected logDebug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(`[${this.name}] ${message}`, context);
  }

  /**
   * Creates a new AppError with consistent formatting.
   * 
   * @param message - Human-readable error message
   * @param code - Machine-readable error code
   * @param statusCode - HTTP status code (defaults to 500)
   * @param context - Additional context data
   * @returns A new AppError instance
   */
  protected createError(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ): AppError {
    return new AppError(message, code, statusCode, context);
  }

  /**
   * Handles an error by logging it and optionally creating an AppError.
   * 
   * @param error - The error to handle
   * @param message - Custom error message
   * @param code - Error code
   * @param statusCode - HTTP status code
   * @param context - Additional context
   * @returns An AppError instance
   */
  protected handleError(
    error: unknown,
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ): AppError {
    this.logError(error, context);

    if (error instanceof AppError) {
      return error;
    }

    return this.createError(message, code, statusCode, {
      originalError: error instanceof Error ? error.message : String(error),
      ...context
    });
  }
}
