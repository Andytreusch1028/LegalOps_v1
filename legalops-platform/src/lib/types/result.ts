/**
 * Result type for operations that can succeed or fail.
 * Provides type-safe error handling without throwing exceptions.
 * 
 * @template T - The type of the success value
 * @template E - The type of the error (defaults to AppError)
 */
export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Application error class with structured error information.
 * Extends the base Error class with additional context for better error handling.
 */
export class AppError extends Error {
  /**
   * Creates a new AppError instance.
   * 
   * @param message - Human-readable error message
   * @param code - Machine-readable error code for programmatic handling
   * @param statusCode - HTTP status code (defaults to 500)
   * @param context - Additional context data for debugging
   */
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Creates a successful Result.
 * 
 * @template T - The type of the success value
 * @param data - The success value
 * @returns A Result indicating success
 */
export const ok = <T>(data: T): Result<T, never> => ({ 
  success: true, 
  data 
});

/**
 * Creates a failed Result.
 * 
 * @template E - The type of the error
 * @param error - The error value
 * @returns A Result indicating failure
 */
export const err = <E>(error: E): Result<never, E> => ({ 
  success: false, 
  error 
});

/**
 * Type guard to check if a Result is successful.
 * 
 * @param result - The Result to check
 * @returns True if the Result is successful
 */
export function isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to check if a Result is a failure.
 * 
 * @param result - The Result to check
 * @returns True if the Result is a failure
 */
export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false;
}
