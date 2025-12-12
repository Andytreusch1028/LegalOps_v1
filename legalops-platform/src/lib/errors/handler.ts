/**
 * Centralized Error Handler
 * 
 * Provides consistent error handling across the application with:
 * - Type guards for different error types
 * - Prisma error mapping to AppError
 * - Error logging with context
 * - Critical error alerts
 */

import { Prisma } from '@/generated/prisma';
import { z } from 'zod';
import { AppError } from '../types/result';
import { ApiResponse, createErrorResponse } from '../types/api';
import { ILogger } from '../interfaces/logger.interface';

/**
 * Alert service interface for critical error notifications.
 */
export interface IAlertService {
  /**
   * Notify staff about critical errors.
   */
  notifyStaff(alert: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    context?: Record<string, unknown>;
  }): Promise<void>;
}

/**
 * Centralized error handler for consistent error processing.
 */
export class ErrorHandler {
  constructor(
    private readonly logger: ILogger,
    private readonly alertService?: IAlertService
  ) {}

  /**
   * Extract user context from request or context object for logging.
   */
  private extractUserContext(context?: Record<string, unknown>): Record<string, unknown> {
    const userContext: Record<string, unknown> = {};
    
    if (context) {
      // Extract common user identifiers
      if (context.userId) userContext.userId = context.userId;
      if (context.userEmail) userContext.userEmail = context.userEmail;
      if (context.sessionId) userContext.sessionId = context.sessionId;
      if (context.ipAddress) userContext.ipAddress = context.ipAddress;
      if (context.userAgent) userContext.userAgent = context.userAgent;
      if (context.isAuthenticated !== undefined) userContext.isAuthenticated = context.isAuthenticated;
      
      // Mask sensitive data for logging
      if (context.userEmail && typeof context.userEmail === 'string') {
        const email = context.userEmail as string;
        const [username, domain] = email.split('@');
        if (username && domain) {
          userContext.userEmail = `${username.charAt(0)}***@${domain}`;
        }
      }
    }
    
    return userContext;
  }

  /**
   * Handle any error and convert to structured API response.
   * 
   * @param error - The error to handle
   * @param context - Additional context for logging (can include user info)
   * @returns Structured API error response
   */
  async handle(
    error: unknown,
    context?: Record<string, unknown>
  ): Promise<ApiResponse<never>> {
    // Handle AppError (our custom error type)
    if (error instanceof AppError) {
      return this.handleAppError(error, context);
    }

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return this.handleZodError(error, context);
    }

    // Handle Prisma errors
    if (this.isPrismaError(error)) {
      return this.handlePrismaError(error, context);
    }

    // Handle unknown errors
    return this.handleUnknownError(error, context);
  }

  /**
   * Handle AppError instances.
   */
  private async handleAppError(
    error: AppError,
    context?: Record<string, unknown>
  ): Promise<ApiResponse<never>> {
    // Extract user context for logging
    const userContext = this.extractUserContext(context);
    
    // Log the error with user context
    this.logger.error(error.message, {
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
      userContext,
      ...context
    });

    // Alert staff for critical errors (5xx status codes)
    if (error.statusCode >= 500 && this.alertService) {
      await this.alertService.notifyStaff({
        severity: 'high',
        message: error.message,
        context: {
          code: error.code,
          errorContext: error.context,
          userContext,
          ...context
        }
      });
    }

    return createErrorResponse(
      error.code,
      error.message,
      error.context
    );
  }

  /**
   * Handle Zod validation errors.
   */
  private handleZodError(
    error: z.ZodError,
    context?: Record<string, unknown>
  ): ApiResponse<never> {
    const formattedErrors = this.formatZodErrors(error);
    const userContext = this.extractUserContext(context);

    this.logger.warn('Validation error', {
      errors: formattedErrors,
      userContext,
      ...context
    });

    return createErrorResponse(
      'VALIDATION_ERROR',
      'Validation failed',
      { errors: formattedErrors }
    );
  }

  /**
   * Handle Prisma database errors.
   */
  private async handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
    context?: Record<string, unknown>
  ): Promise<ApiResponse<never>> {
    const userContext = this.extractUserContext(context);
    
    this.logger.error('Database error', {
      code: error.code,
      meta: error.meta,
      userContext,
      ...context
    });

    // Map Prisma error codes to user-friendly messages
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        return createErrorResponse(
          'DUPLICATE_ENTRY',
          'A record with this value already exists',
          { field: error.meta?.target }
        );

      case 'P2025':
        // Record not found
        return createErrorResponse(
          'NOT_FOUND',
          'Record not found'
        );

      case 'P2003':
        // Foreign key constraint violation
        return createErrorResponse(
          'INVALID_REFERENCE',
          'Referenced record does not exist',
          { field: error.meta?.field_name }
        );

      case 'P2014':
        // Required relation violation
        return createErrorResponse(
          'INVALID_RELATION',
          'The change would violate a required relation',
          { relation: error.meta?.relation_name }
        );

      default:
        // Generic database error
        if (this.alertService) {
          await this.alertService.notifyStaff({
            severity: 'high',
            message: 'Unhandled database error',
            context: {
              code: error.code,
              meta: error.meta,
              ...context
            }
          });
        }

        return createErrorResponse(
          'DATABASE_ERROR',
          'Database operation failed'
        );
    }
  }

  /**
   * Handle unknown errors.
   */
  private async handleUnknownError(
    error: unknown,
    context?: Record<string, unknown>
  ): Promise<ApiResponse<never>> {
    const userContext = this.extractUserContext(context);
    
    // Log the unknown error with user context
    this.logger.error('Unhandled error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userContext,
      ...context
    });

    // Alert staff about unknown errors
    if (this.alertService) {
      await this.alertService.notifyStaff({
        severity: 'critical',
        message: 'Unhandled error occurred',
        context: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          userContext,
          ...context
        }
      });
    }

    return createErrorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred'
    );
  }

  /**
   * Type guard for Prisma errors.
   */
  private isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      (error instanceof Error && error.constructor.name === 'PrismaClientKnownRequestError')
    );
  }

  /**
   * Format Zod errors into a user-friendly structure.
   */
  private formatZodErrors(error: z.ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    error.issues.forEach(issue => {
      const path = issue.path.join('.');

      if (!formatted[path]) {
        formatted[path] = [];
      }

      formatted[path].push(issue.message);
    });

    return formatted;
  }
}

/**
 * Create a singleton error handler instance.
 * This can be imported and used across the application.
 */
let errorHandlerInstance: ErrorHandler | null = null;

export function createErrorHandler(
  logger: ILogger,
  alertService?: IAlertService
): ErrorHandler {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new ErrorHandler(logger, alertService);
  }
  return errorHandlerInstance;
}

export function getErrorHandler(): ErrorHandler {
  if (!errorHandlerInstance) {
    throw new Error('ErrorHandler not initialized. Call createErrorHandler first.');
  }
  return errorHandlerInstance;
}
