/**
 * Property-based tests for retry behavior with exponential backoff.
 * 
 * Feature: code-quality-improvements, Property 5: Retry Behavior
 * Validates: Requirements 2.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { withRetry, calculateNextDelay, isRetryableError, DEFAULT_RETRY_OPTIONS, type RetryOptions } from './retry';
import { AppError } from '../types/result';

describe('Retry Behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  /**
   * Property 5: Retry Behavior
   * For any external API call that fails with a retryable error, the system should 
   * retry with exponential backoff up to the configured maximum attempts before failing.
   */

  it('should retry up to maxAttempts times for retryable errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }), // maxAttempts
        fc.constantFrom('NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE'), // retryable error code
        async (maxAttempts, errorCode) => {
          let callCount = 0;
          const failingFn = vi.fn(async () => {
            callCount++;
            throw new AppError('Temporary failure', errorCode, 503);
          });

          const options: RetryOptions = {
            maxAttempts,
            initialDelay: 10,
            maxDelay: 100,
            backoffMultiplier: 2,
            retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE']
          };

          // Execute the retry logic
          const promise = withRetry(failingFn, options);
          
          // Fast-forward through all timers
          await vi.runAllTimersAsync();

          // Should throw after all attempts
          await expect(promise).rejects.toThrow();
          
          // Should have called the function exactly maxAttempts times
          expect(callCount).toBe(maxAttempts);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should succeed immediately if function succeeds on first attempt', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.anything(), // return value
        fc.integer({ min: 1, max: 10 }), // maxAttempts
        async (returnValue, maxAttempts) => {
          let callCount = 0;
          const successFn = vi.fn(async () => {
            callCount++;
            return returnValue;
          });

          const options: RetryOptions = {
            maxAttempts,
            initialDelay: 10,
            maxDelay: 100,
            backoffMultiplier: 2
          };

          const result = await withRetry(successFn, options);

          // Should succeed on first attempt
          expect(result).toEqual(returnValue);
          expect(callCount).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not retry non-retryable errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('VALIDATION_ERROR', 'NOT_FOUND', 'UNAUTHORIZED'), // non-retryable error
        fc.integer({ min: 2, max: 10 }), // maxAttempts > 1
        async (errorCode, maxAttempts) => {
          let callCount = 0;
          const failingFn = vi.fn(async () => {
            callCount++;
            throw new AppError('Non-retryable error', errorCode, 400);
          });

          const options: RetryOptions = {
            maxAttempts,
            initialDelay: 10,
            maxDelay: 100,
            backoffMultiplier: 2,
            retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE']
          };

          // Should throw immediately without retrying
          await expect(withRetry(failingFn, options)).rejects.toThrow();
          
          // Should have called the function only once
          expect(callCount).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should apply exponential backoff between retries', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 1000 }), // initialDelay
        fc.integer({ min: 2, max: 5 }), // backoffMultiplier
        fc.integer({ min: 5000, max: 20000 }), // maxDelay
        async (initialDelay, backoffMultiplier, maxDelay) => {
          const delays: number[] = [];
          let callCount = 0;
          
          const failingFn = vi.fn(async () => {
            callCount++;
            throw new AppError('Temporary failure', 'NETWORK_ERROR', 503);
          });

          const options: RetryOptions = {
            maxAttempts: 4,
            initialDelay,
            maxDelay,
            backoffMultiplier,
            retryableErrors: ['NETWORK_ERROR']
          };

          // Track setTimeout calls to verify delays
          const originalSetTimeout = global.setTimeout;
          vi.spyOn(global, 'setTimeout').mockImplementation(((callback: () => void, delay: number) => {
            if (delay > 0) {
              delays.push(delay);
            }
            return originalSetTimeout(callback, 0);
          }) as typeof setTimeout);

          const promise = withRetry(failingFn, options);
          await vi.runAllTimersAsync();
          await expect(promise).rejects.toThrow();

          // Verify exponential backoff pattern
          expect(delays.length).toBeGreaterThan(0);
          
          // First delay should be initialDelay
          expect(delays[0]).toBe(initialDelay);
          
          // Each subsequent delay should be previous * multiplier, capped at maxDelay
          for (let i = 1; i < delays.length; i++) {
            const expectedDelay = Math.min(delays[i - 1] * backoffMultiplier, maxDelay);
            expect(delays[i]).toBe(expectedDelay);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should succeed if function succeeds after some failures', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // failuresBeforeSuccess
        fc.anything(), // return value
        async (failuresBeforeSuccess, returnValue) => {
          let callCount = 0;
          const eventuallySucceedsFn = vi.fn(async () => {
            callCount++;
            if (callCount <= failuresBeforeSuccess) {
              throw new AppError('Temporary failure', 'NETWORK_ERROR', 503);
            }
            return returnValue;
          });

          const options: RetryOptions = {
            maxAttempts: failuresBeforeSuccess + 2, // Ensure enough attempts
            initialDelay: 10,
            maxDelay: 100,
            backoffMultiplier: 2,
            retryableErrors: ['NETWORK_ERROR']
          };

          const promise = withRetry(eventuallySucceedsFn, options);
          await vi.runAllTimersAsync();
          const result = await promise;

          // Should eventually succeed
          expect(result).toEqual(returnValue);
          
          // Should have called the function failuresBeforeSuccess + 1 times
          expect(callCount).toBe(failuresBeforeSuccess + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should respect maxDelay cap on exponential backoff', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 500 }), // initialDelay
        fc.integer({ min: 1000, max: 2000 }), // maxDelay (smaller than what exponential would reach)
        async (initialDelay, maxDelay) => {
          const delays: number[] = [];
          
          const failingFn = vi.fn(async () => {
            throw new AppError('Temporary failure', 'NETWORK_ERROR', 503);
          });

          const options: RetryOptions = {
            maxAttempts: 5,
            initialDelay,
            maxDelay,
            backoffMultiplier: 3, // High multiplier to quickly exceed maxDelay
            retryableErrors: ['NETWORK_ERROR']
          };

          vi.spyOn(global, 'setTimeout').mockImplementation(((callback: () => void, delay: number) => {
            if (delay > 0) {
              delays.push(delay);
            }
            return setTimeout(callback, 0);
          }) as typeof setTimeout);

          const promise = withRetry(failingFn, options);
          await vi.runAllTimersAsync();
          await expect(promise).rejects.toThrow();

          // All delays should be <= maxDelay
          delays.forEach(delay => {
            expect(delay).toBeLessThanOrEqual(maxDelay);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should throw the original error after all retries exhausted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }), // error message
        fc.constantFrom('NETWORK_ERROR', 'TIMEOUT'), // error code
        fc.integer({ min: 1, max: 5 }), // maxAttempts
        async (errorMessage, errorCode, maxAttempts) => {
          const originalError = new AppError(errorMessage, errorCode, 503);
          
          const failingFn = vi.fn(async () => {
            throw originalError;
          });

          const options: RetryOptions = {
            maxAttempts,
            initialDelay: 10,
            maxDelay: 100,
            backoffMultiplier: 2,
            retryableErrors: ['NETWORK_ERROR', 'TIMEOUT']
          };

          // Execute with proper error handling
          try {
            const promise = withRetry(failingFn, options);
            await vi.runAllTimersAsync();
            await promise;
            
            // Should not reach here
            expect.fail('Expected withRetry to throw an error');
          } catch (error) {
            // Should throw the original error
            expect(error).toBe(originalError);
            expect(error).toBeInstanceOf(AppError);
            if (error instanceof AppError) {
              expect(error.message).toBe(errorMessage);
              expect(error.code).toBe(errorCode);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('calculateNextDelay', () => {
  it('should calculate exponential backoff correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 5000 }), // currentDelay
        fc.integer({ min: 2, max: 10 }), // multiplier
        fc.integer({ min: 10000, max: 50000 }), // maxDelay
        (currentDelay, multiplier, maxDelay) => {
          const nextDelay = calculateNextDelay(currentDelay, multiplier, maxDelay);
          
          // Next delay should be current * multiplier, or maxDelay if that's smaller
          const expected = Math.min(currentDelay * multiplier, maxDelay);
          expect(nextDelay).toBe(expected);
          
          // Next delay should never exceed maxDelay
          expect(nextDelay).toBeLessThanOrEqual(maxDelay);
          
          // Next delay should be at least currentDelay (assuming multiplier >= 1)
          if (multiplier >= 1) {
            expect(nextDelay).toBeGreaterThanOrEqual(currentDelay);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should cap at maxDelay even with large multipliers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 5000 }),
        fc.integer({ min: 10, max: 100 }),
        fc.integer({ min: 5000, max: 10000 }),
        (currentDelay, multiplier, maxDelay) => {
          const nextDelay = calculateNextDelay(currentDelay, multiplier, maxDelay);
          expect(nextDelay).toBeLessThanOrEqual(maxDelay);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('isRetryableError', () => {
  it('should identify retryable AppErrors correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE'),
        fc.string(),
        (errorCode, message) => {
          const error = new AppError(message, errorCode, 503);
          const retryableErrors = ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE'];
          
          expect(isRetryableError(error, retryableErrors)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should identify non-retryable AppErrors correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('VALIDATION_ERROR', 'NOT_FOUND', 'UNAUTHORIZED'),
        fc.string(),
        (errorCode, message) => {
          const error = new AppError(message, errorCode, 400);
          const retryableErrors = ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE'];
          
          expect(isRetryableError(error, retryableErrors)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return true for all errors when no retryableErrors list provided', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (message, code) => {
          const error = new AppError(message, code, 500);
          
          expect(isRetryableError(error, undefined)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return false for non-AppError errors with retryableErrors list', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (message) => {
          const error = new Error(message);
          const retryableErrors = ['NETWORK_ERROR', 'TIMEOUT'];
          
          expect(isRetryableError(error, retryableErrors)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
