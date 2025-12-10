/**
 * Property-based tests for validation middleware.
 * Feature: code-quality-improvements
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateRequest, validateQueryParams, validateValue, formatZodErrors } from './validation';
import { z } from 'zod';
import { NextRequest } from 'next/server';

/**
 * Feature: code-quality-improvements, Property 1: API Request Validation
 * 
 * For any API route that accepts a request body, validation using Zod schemas
 * should occur before any business logic executes, and invalid requests should
 * return 400 status codes with structured error details.
 * 
 * Validates: Requirements 1.2
 */
describe('Property 1: API Request Validation', () => {
  const TestSchema = z.object({
    name: z.string().min(1),
    age: z.number().min(0).max(150),
    email: z.string().email()
  });

  it('should validate valid request bodies and return success', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          age: fc.integer({ min: 0, max: 150 }),
          email: fc.emailAddress().filter(e => {
            // Filter to emails that Zod will accept (no special chars at start)
            return /^[a-zA-Z0-9][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e);
          })
        }),
        async (validData) => {
          // Create a mock NextRequest with valid data
          const request = new NextRequest('http://localhost/api/test', {
            method: 'POST',
            body: JSON.stringify(validData)
          });

          const validator = validateRequest(TestSchema);
          const result = await validator(request);

          // Property: Valid data should always pass validation
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toEqual(validData);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject invalid request bodies with 400 status code', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.oneof(
            fc.constant(''), // Empty string (invalid)
            fc.constant(null), // Null (invalid)
            fc.integer() // Wrong type (invalid)
          ),
          age: fc.oneof(
            fc.integer({ min: -100, max: -1 }), // Negative (invalid)
            fc.integer({ min: 151, max: 1000 }), // Too high (invalid)
            fc.string() // Wrong type (invalid)
          ),
          email: fc.oneof(
            fc.constant('not-an-email'), // Invalid format
            fc.constant(''), // Empty
            fc.integer() // Wrong type
          )
        }),
        async (invalidData) => {
          const request = new NextRequest('http://localhost/api/test', {
            method: 'POST',
            body: JSON.stringify(invalidData)
          });

          const validator = validateRequest(TestSchema);
          const result = await validator(request);

          // Property: Invalid data should always fail validation with 400 status
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.statusCode).toBe(400);
            expect(result.error.code).toBe('VALIDATION_ERROR');
            expect(result.error.context).toHaveProperty('errors');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle malformed JSON with 400 status code', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter(s => {
          try {
            JSON.parse(s);
            return false; // Valid JSON, skip
          } catch {
            return true; // Invalid JSON, use it
          }
        }),
        async (malformedJson) => {
          const request = new NextRequest('http://localhost/api/test', {
            method: 'POST',
            body: malformedJson
          });

          const validator = validateRequest(TestSchema);
          const result = await validator(request);

          // Property: Malformed JSON should always fail with 400 status
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.statusCode).toBe(400);
            expect(['INVALID_JSON', 'REQUEST_PARSE_ERROR']).toContain(result.error.code);
          }
        }
      ),
      { numRuns: 50 } // Fewer runs since generating invalid JSON is expensive
    );
  });

  it('should validate query parameters correctly', () => {
    const QuerySchema = z.object({
      page: z.string().transform(Number).pipe(z.number().min(1)),
      limit: z.string().transform(Number).pipe(z.number().min(1).max(100))
    });

    fc.assert(
      fc.property(
        fc.record({
          page: fc.integer({ min: 1, max: 1000 }).map(String),
          limit: fc.integer({ min: 1, max: 100 }).map(String)
        }),
        (validParams) => {
          const searchParams = new URLSearchParams(validParams);
          const result = validateQueryParams(QuerySchema, searchParams);

          // Property: Valid query params should pass validation
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.page).toBeGreaterThanOrEqual(1);
            expect(result.data.limit).toBeGreaterThanOrEqual(1);
            expect(result.data.limit).toBeLessThanOrEqual(100);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject invalid query parameters with 400 status', () => {
    const QuerySchema = z.object({
      page: z.string().transform(Number).pipe(z.number().min(1)),
      limit: z.string().transform(Number).pipe(z.number().min(1).max(100))
    });

    fc.assert(
      fc.property(
        fc.record({
          page: fc.oneof(
            fc.constant('0'), // Below minimum
            fc.constant('-1'), // Negative
            fc.constant('abc') // Not a number
          ),
          limit: fc.oneof(
            fc.constant('0'), // Below minimum
            fc.constant('101'), // Above maximum
            fc.constant('xyz') // Not a number
          )
        }),
        (invalidParams) => {
          const searchParams = new URLSearchParams(invalidParams);
          const result = validateQueryParams(QuerySchema, searchParams);

          // Property: Invalid query params should fail with 400 status
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.statusCode).toBe(400);
            expect(result.error.code).toBe('INVALID_QUERY_PARAMS');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate single values correctly', () => {
    const EmailSchema = z.string().email();

    fc.assert(
      fc.property(
        fc.emailAddress().filter(e => {
          // Filter to emails that Zod will accept
          return /^[a-zA-Z0-9][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e);
        }),
        (validEmail) => {
          const result = validateValue(EmailSchema, validEmail, 'email');

          // Property: Valid emails should pass validation
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toBe(validEmail);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format Zod errors into field-level messages', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.constant(''), // Will fail min length
          age: fc.integer({ min: -100, max: -1 }), // Will fail min value
          email: fc.constant('not-an-email') // Will fail email format
        }),
        (invalidData) => {
          const result = TestSchema.safeParse(invalidData);
          
          expect(result.success).toBe(false);
          
          if (!result.success) {
            const formatted = formatZodErrors(result.error);
            
            // Property: Formatted errors should be a record of field paths to error arrays
            expect(typeof formatted).toBe('object');
            expect(Object.keys(formatted).length).toBeGreaterThan(0);
            
            // Each field should have an array of error messages
            Object.values(formatted).forEach(errors => {
              expect(Array.isArray(errors)).toBe(true);
              expect(errors.length).toBeGreaterThan(0);
              errors.forEach(error => {
                expect(typeof error).toBe('string');
                expect(error.length).toBeGreaterThan(0);
              });
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
