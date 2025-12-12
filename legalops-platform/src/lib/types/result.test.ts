/**
 * Property-based tests for Result type operations.
 * 
 * Feature: code-quality-improvements, Property 7: Service Result Types
 * Validates: Requirements 3.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Result, AppError, ok, err, isOk, isErr } from './result';

describe('Result Type Operations', () => {
  /**
   * Property 7: Service Result Types
   * For any service method that performs an operation, the return type should be 
   * Result<T, AppError> indicating either success with data or failure with a typed error.
   */
  
  it('should create successful Results with ok() that have success=true and contain data', () => {
    fc.assert(
      fc.property(
        fc.anything(),
        (data) => {
          const result = ok(data);
          
          // Result should indicate success
          expect(result.success).toBe(true);
          
          // Result should contain the data
          if (result.success) {
            expect(result.data).toEqual(data);
          }
          
          // isOk type guard should return true
          expect(isOk(result)).toBe(true);
          expect(isErr(result)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create failed Results with err() that have success=false and contain error', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        fc.integer({ min: 400, max: 599 }),
        (message, code, statusCode) => {
          const error = new AppError(message, code, statusCode);
          const result = err(error);
          
          // Result should indicate failure
          expect(result.success).toBe(false);
          
          // Result should contain the error
          if (!result.success) {
            expect(result.error).toBe(error);
            expect(result.error.message).toBe(message);
            expect(result.error.code).toBe(code);
            expect(result.error.statusCode).toBe(statusCode);
          }
          
          // isErr type guard should return true
          expect(isErr(result)).toBe(true);
          expect(isOk(result)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain AppError properties through Result wrapping', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9\s\-_.,!?]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Z_]+$/.test(s)),
        fc.integer({ min: 400, max: 599 }),
        fc.option(fc.dictionary(fc.string(), fc.anything())),
        (message, code, statusCode, context) => {
          const error = new AppError(message, code, statusCode, context || undefined);
          const result: Result<never, AppError> = err(error);
          
          if (!result.success) {
            // All AppError properties should be preserved
            expect(result.error.message).toBe(message);
            expect(result.error.code).toBe(code);
            expect(result.error.statusCode).toBe(statusCode);
            expect(result.error.context).toEqual(context || undefined);
            expect(result.error.name).toBe('AppError');
            
            // Error should be an instance of Error and AppError
            expect(result.error instanceof Error).toBe(true);
            expect(result.error instanceof AppError).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never have both data and error properties accessible', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.anything().map(data => ({ type: 'ok' as const, value: data })),
          fc.tuple(fc.string(), fc.string()).map(([msg, code]) => ({ 
            type: 'err' as const, 
            value: new AppError(msg, code) 
          }))
        ),
        (input) => {
          const result: Result<unknown, AppError> = 
            input.type === 'ok' ? ok(input.value) : err(input.value);
          
          // TypeScript ensures this at compile time, but we verify at runtime
          if (result.success) {
            // Success results have data, not error
            expect('data' in result).toBe(true);
            expect('error' in result).toBe(false);
          } else {
            // Error results have error, not data
            expect('error' in result).toBe(true);
            expect('data' in result).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle AppError with various status codes correctly', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        fc.constantFrom(400, 401, 403, 404, 409, 422, 500, 502, 503),
        (message, code, statusCode) => {
          const error = new AppError(message, code, statusCode);
          
          expect(error.statusCode).toBe(statusCode);
          expect(error.message).toBe(message);
          expect(error.code).toBe(code);
          
          // Verify it can be used in a Result
          const result = err(error);
          expect(isErr(result)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should use default status code 500 when not provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9\s\-_.,!?]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Z_]+$/.test(s)),
        (message, code) => {
          const error = new AppError(message, code);
          
          expect(error.statusCode).toBe(500);
          expect(error.message).toBe(message);
          expect(error.code).toBe(code);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve context data in AppError', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        fc.dictionary(fc.string(), fc.oneof(
          fc.string(),
          fc.integer(),
          fc.boolean(),
          fc.constant(null)
        )),
        (message, code, context) => {
          const error = new AppError(message, code, 500, context);
          
          expect(error.context).toEqual(context);
          
          // Context should be accessible through Result
          const result = err(error);
          if (!result.success) {
            expect(result.error.context).toEqual(context);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain type safety with different data types', () => {
    // Test with various data types
    const stringResult = ok('test string');
    expect(isOk(stringResult)).toBe(true);
    if (stringResult.success) {
      const _typeCheck: string = stringResult.data; // TypeScript compile-time check
      expect(typeof stringResult.data).toBe('string');
    }

    const numberResult = ok(42);
    expect(isOk(numberResult)).toBe(true);
    if (numberResult.success) {
      const _typeCheck: number = numberResult.data; // TypeScript compile-time check
      expect(typeof numberResult.data).toBe('number');
    }

    const objectResult = ok({ id: '123', name: 'test' });
    expect(isOk(objectResult)).toBe(true);
    if (objectResult.success) {
      const _typeCheck: { id: string; name: string } = objectResult.data; // TypeScript compile-time check
      expect(typeof objectResult.data).toBe('object');
    }

    const arrayResult = ok([1, 2, 3]);
    expect(isOk(arrayResult)).toBe(true);
    if (arrayResult.success) {
      const _typeCheck: number[] = arrayResult.data; // TypeScript compile-time check
      expect(Array.isArray(arrayResult.data)).toBe(true);
    }
  });
});
