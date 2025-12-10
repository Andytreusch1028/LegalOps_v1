/**
 * Retry utility with exponential backoff for handling transient failures.
 * Implements configurable retry logic for operations that may fail temporarily.
 */

import { AppError } from '../types/result';
import type { ILogger } from '../interfaces/logger.interface';

/**
 * Configuration options for retry behavior.
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay in milliseconds before first retry */
  initialDelay: number;
  /** Maximum delay in milliseconds between retries */
  maxDelay: number;
  /** Multiplier for exponential backoff (e.g., 2 for doubling) */
  backoffMultiplier: number;
  /** Optional list of error codes that should trigger retries */
  retryableErrors?: string[];
  /** Optional logger for tracking retry attempts */
  logger?: ILogger;
}

/**
 * Default retry options for common use cases.
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE']
};

/**
 * Executes a function with retry logic and exponential backoff.
 * 
 * @template T - The return type of the function
 * @param fn - The async function to execute with retries
 * @param options - Configuration options for retry behavior
 * @returns Promise resolving to the function result
 * @throws The last error if all retry attempts fail
 * 
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => externalApiService.call(),
 *   {
 *     maxAttempts: 3,
 *     initialDelay: 1000,
 *     maxDelay: 10000,
 *     backoffMultiplier: 2,
 *     retryableErrors: ['NETWORK_ERROR', 'TIMEOUT']
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let attempt = 0;
  let delay = options.initialDelay;
  let lastError: unknown;
  
  while (attempt < options.maxAttempts) {
    try {
      // Log attempt if logger is provided
      if (options.logger && attempt > 0) {
        options.logger.info('Retrying operation', {
          attempt,
          maxAttempts: options.maxAttempts,
          delay,
          previousError: lastError instanceof AppError ? lastError.code : 'unknown'
        });
      }
      
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;
      
      // Check if error is retryable
      if (options.retryableErrors && error instanceof AppError) {
        if (!options.retryableErrors.includes(error.code)) {
          // Non-retryable error - log and throw immediately
          if (options.logger) {
            options.logger.warn('Non-retryable error encountered', {
              errorCode: error.code,
              attempt,
              maxAttempts: options.maxAttempts
            });
          }
          throw error;
        }
      }
      
      // Last attempt - log failure and throw error
      if (attempt >= options.maxAttempts) {
        if (options.logger) {
          options.logger.error('All retry attempts exhausted', {
            attempt,
            maxAttempts: options.maxAttempts,
            error: error instanceof AppError ? error.code : String(error)
          });
        }
        throw error;
      }
      
      // Log retry attempt
      if (options.logger) {
        options.logger.warn('Operation failed, will retry', {
          attempt,
          maxAttempts: options.maxAttempts,
          nextDelay: delay,
          error: error instanceof AppError ? error.code : String(error)
        });
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Calculate next delay with exponential backoff
      delay = Math.min(delay * options.backoffMultiplier, options.maxDelay);
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry logic failed unexpectedly');
}

/**
 * Determines if an error should be retried based on its type and code.
 * 
 * @param error - The error to check
 * @param retryableErrors - List of error codes that should be retried
 * @returns True if the error should be retried
 */
export function isRetryableError(error: unknown, retryableErrors?: string[]): boolean {
  if (!retryableErrors) {
    return true; // Retry all errors if no specific list provided
  }
  
  if (error instanceof AppError) {
    return retryableErrors.includes(error.code);
  }
  
  return false;
}

/**
 * Calculates the next delay using exponential backoff.
 * 
 * @param currentDelay - Current delay in milliseconds
 * @param multiplier - Backoff multiplier
 * @param maxDelay - Maximum allowed delay
 * @returns Next delay value capped at maxDelay
 */
export function calculateNextDelay(
  currentDelay: number,
  multiplier: number,
  maxDelay: number
): number {
  return Math.min(currentDelay * multiplier, maxDelay);
}
