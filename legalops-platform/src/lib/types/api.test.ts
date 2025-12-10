import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createErrorResponse, type ApiResponse } from './api';
import { AppError } from './result';

/**
 * Feature: code-quality-improvements, Property 2: Error Response Structure
 * 
 * Property: For any API route that encounters an error, the response should follow 
 * the ApiResponse structure with success: false, an error object containing code 
 * and message, and appropriate HTTP status code.
 * 
 * Validates: Requirements 2.1
 */
describe('Property 2: Error Response Structure', () => {
  it('should always return structured error responses with required fields', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary error codes
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        // Generate arbitrary error messages
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        // Generate optional error details
        fc.option(
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.oneof(
              fc.array(fc.string()),
              fc.string(),
              fc.integer(),
              fc.boolean()
            )
          ),
          { nil: undefined }
        ),
        (errorCode, errorMessage, errorDetails) => {
          // Create error response using the helper function
          const response = createErrorResponse(
            errorCode,
            errorMessage,
            errorDetails
          );

          // Property 1: Response must have success: false
          expect(response.success).toBe(false);

          // Property 2: Response must have an error object
          expect(response.error).toBeDefined();
          expect(response.error).not.toBeNull();

          // Property 3: Error object must have code and message
          expect(response.error?.code).toBe(errorCode);
          expect(response.error?.message).toBe(errorMessage);

          // Property 4: Error details should match if provided
          if (errorDetails !== undefined) {
            expect(response.error?.details).toEqual(errorDetails);
          }

          // Property 5: Response must have metadata
          expect(response.meta).toBeDefined();
          expect(response.meta?.timestamp).toBeDefined();
          expect(response.meta?.requestId).toBeDefined();

          // Property 6: Timestamp should be valid ISO string
          expect(() => new Date(response.meta!.timestamp)).not.toThrow();
          expect(new Date(response.meta!.timestamp).toISOString()).toBe(response.meta!.timestamp);

          // Property 7: Request ID should follow expected format
          expect(response.meta?.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);

          // Property 8: Response should not have data field on error
          expect(response.data).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle AppError instances correctly', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary error messages
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        // Generate arbitrary error codes
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        // Generate HTTP status codes (400-599)
        fc.integer({ min: 400, max: 599 }),
        // Generate optional context
        fc.option(
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.oneof(
              fc.string(),
              fc.integer(),
              fc.boolean()
            )
          ),
          { nil: undefined }
        ),
        (message, code, statusCode, context) => {
          // Create an AppError
          const appError = new AppError(message, code, statusCode, context);

          // Create error response from AppError
          const response = createErrorResponse(
            appError.code,
            appError.message,
            appError.context
          );

          // Verify the response structure
          expect(response.success).toBe(false);
          expect(response.error?.code).toBe(code);
          expect(response.error?.message).toBe(message);
          
          if (context !== undefined) {
            expect(response.error?.details).toEqual(context);
          }

          // Verify AppError properties are preserved
          expect(appError.statusCode).toBe(statusCode);
          expect(appError.name).toBe('AppError');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain error response structure across different error types', () => {
    fc.assert(
      fc.property(
        // Generate different error scenarios
        fc.constantFrom(
          { code: 'VALIDATION_ERROR', statusCode: 400 },
          { code: 'UNAUTHORIZED', statusCode: 401 },
          { code: 'FORBIDDEN', statusCode: 403 },
          { code: 'NOT_FOUND', statusCode: 404 },
          { code: 'CONFLICT', statusCode: 409 },
          { code: 'INTERNAL_ERROR', statusCode: 500 },
          { code: 'SERVICE_UNAVAILABLE', statusCode: 503 }
        ),
        fc.string({ minLength: 1, maxLength: 200 }),
        (errorType, message) => {
          const response = createErrorResponse(
            errorType.code,
            message
          );

          // All error responses should have consistent structure
          expect(response).toHaveProperty('success', false);
          expect(response).toHaveProperty('error');
          expect(response.error).toHaveProperty('code');
          expect(response.error).toHaveProperty('message');
          expect(response).toHaveProperty('meta');
          expect(response.meta).toHaveProperty('timestamp');
          expect(response.meta).toHaveProperty('requestId');

          // Verify error code matches
          expect(response.error?.code).toBe(errorType.code);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle validation errors with field-level details', () => {
    fc.assert(
      fc.property(
        // Generate field names
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
        // Generate error messages for each field
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 5 }),
        (fieldNames, errorMessages) => {
          // Create validation error details
          const details: Record<string, string[]> = {};
          fieldNames.forEach((field, index) => {
            details[field] = [errorMessages[index % errorMessages.length]];
          });

          const response = createErrorResponse(
            'VALIDATION_ERROR',
            'Validation failed',
            details
          );

          // Verify structure
          expect(response.success).toBe(false);
          expect(response.error?.code).toBe('VALIDATION_ERROR');
          expect(response.error?.details).toEqual(details);

          // Verify all fields are present in details
          fieldNames.forEach(field => {
            expect(response.error?.details).toHaveProperty(field);
            expect(Array.isArray(response.error?.details?.[field])).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure error responses never have data field', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 200 }),
        (code, message) => {
          const response = createErrorResponse(code, message);

          // Error responses should never have a data field
          expect(response.data).toBeUndefined();
          expect('data' in response).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate unique request IDs for each error response', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 200 }),
        (code, message) => {
          // Create multiple error responses
          const response1 = createErrorResponse(code, message);
          const response2 = createErrorResponse(code, message);

          // Request IDs should be unique
          expect(response1.meta?.requestId).not.toBe(response2.meta?.requestId);

          // Both should follow the format
          expect(response1.meta?.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
          expect(response2.meta?.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
        }
      ),
      { numRuns: 100 }
    );
  });
});
