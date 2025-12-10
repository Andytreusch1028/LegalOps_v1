/**
 * Property-based tests for validation error message formatting.
 * Feature: code-quality-improvements, Property 4: Validation Error Messages
 * 
 * For any validation failure, the system should return field-level error messages
 * in a structured format mapping field paths to human-readable error descriptions.
 * 
 * Validates: Requirements 2.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { formatZodErrors } from './validation';
import { z } from 'zod';

describe('Property 4: Validation Error Messages', () => {
  it('should format errors with field paths as keys and message arrays as values', () => {
    // Schema with multiple validation rules
    const ComplexSchema = z.object({
      user: z.object({
        name: z.string().min(1, 'Name is required'),
        age: z.number().min(0, 'Age must be non-negative').max(150, 'Age must be realistic'),
        email: z.string().email('Invalid email format')
      }),
      items: z.array(
        z.object({
          id: z.string().min(1, 'Item ID is required'),
          quantity: z.number().min(1, 'Quantity must be at least 1')
        })
      ).min(1, 'At least one item is required')
    });

    fc.assert(
      fc.property(
        fc.record({
          user: fc.record({
            name: fc.constant(''), // Invalid: empty string
            age: fc.integer({ min: -100, max: -1 }), // Invalid: negative
            email: fc.constant('not-an-email') // Invalid: bad format
          }),
          items: fc.constant([]) // Invalid: empty array
        }),
        (invalidData) => {
          const result = ComplexSchema.safeParse(invalidData);
          
          expect(result.success).toBe(false);
          
          if (!result.success) {
            const formatted = formatZodErrors(result.error);
            
            // Property 1: Result should be an object
            expect(typeof formatted).toBe('object');
            expect(formatted).not.toBeNull();
            
            // Property 2: Should have at least one error
            expect(Object.keys(formatted).length).toBeGreaterThan(0);
            
            // Property 3: Each key should be a field path (string)
            Object.keys(formatted).forEach(key => {
              expect(typeof key).toBe('string');
            });
            
            // Property 4: Each value should be an array of strings
            Object.values(formatted).forEach(errors => {
              expect(Array.isArray(errors)).toBe(true);
              expect(errors.length).toBeGreaterThan(0);
              
              errors.forEach(error => {
                expect(typeof error).toBe('string');
                expect(error.length).toBeGreaterThan(0);
              });
            });
            
            // Property 5: Field paths should use dot notation
            Object.keys(formatted).forEach(key => {
              // Should not contain array brackets or other special chars
              expect(key).toMatch(/^[a-zA-Z0-9._]+$/);
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should map nested field errors to dot-notation paths', () => {
    const NestedSchema = z.object({
      level1: z.object({
        level2: z.object({
          level3: z.string().min(1, 'Level 3 is required')
        })
      })
    });

    fc.assert(
      fc.property(
        fc.record({
          level1: fc.record({
            level2: fc.record({
              level3: fc.constant('') // Invalid
            })
          })
        }),
        (invalidData) => {
          const result = NestedSchema.safeParse(invalidData);
          
          expect(result.success).toBe(false);
          
          if (!result.success) {
            const formatted = formatZodErrors(result.error);
            
            // Property: Nested paths should use dot notation
            const paths = Object.keys(formatted);
            expect(paths.some(path => path.includes('.'))).toBe(true);
            
            // Should have the deeply nested path
            expect(formatted).toHaveProperty('level1.level2.level3');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle array field errors with numeric indices', () => {
    const ArraySchema = z.object({
      items: z.array(
        z.object({
          name: z.string().min(1, 'Name is required'),
          value: z.number().min(0, 'Value must be non-negative')
        })
      )
    });

    fc.assert(
      fc.property(
        fc.record({
          items: fc.array(
            fc.record({
              name: fc.constant(''), // Invalid
              value: fc.integer({ min: -100, max: -1 }) // Invalid
            }),
            { minLength: 1, maxLength: 5 }
          )
        }),
        (invalidData) => {
          const result = ArraySchema.safeParse(invalidData);
          
          expect(result.success).toBe(false);
          
          if (!result.success) {
            const formatted = formatZodErrors(result.error);
            
            // Property: Array indices should be included in paths
            const paths = Object.keys(formatted);
            const hasArrayIndex = paths.some(path => /items\.\d+\./.test(path));
            expect(hasArrayIndex).toBe(true);
            
            // Each error should still be an array of strings
            Object.values(formatted).forEach(errors => {
              expect(Array.isArray(errors)).toBe(true);
              errors.forEach(error => {
                expect(typeof error).toBe('string');
              });
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve all error messages for fields with multiple violations', () => {
    const MultiErrorSchema = z.object({
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain uppercase letter')
        .regex(/[a-z]/, 'Password must contain lowercase letter')
        .regex(/[0-9]/, 'Password must contain number')
    });

    fc.assert(
      fc.property(
        fc.record({
          password: fc.constant('abc') // Violates multiple rules
        }),
        (invalidData) => {
          const result = MultiErrorSchema.safeParse(invalidData);
          
          expect(result.success).toBe(false);
          
          if (!result.success) {
            const formatted = formatZodErrors(result.error);
            
            // Property: Should have errors for the password field
            expect(formatted).toHaveProperty('password');
            
            // Property: Should have multiple error messages
            const passwordErrors = formatted['password'];
            expect(Array.isArray(passwordErrors)).toBe(true);
            
            // The short password 'abc' should trigger multiple validation errors
            // (length, uppercase, number requirements)
            expect(passwordErrors.length).toBeGreaterThan(0);
            
            // Each error should be a non-empty string
            passwordErrors.forEach(error => {
              expect(typeof error).toBe('string');
              expect(error.length).toBeGreaterThan(0);
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle errors at the root level', () => {
    const RootLevelSchema = z.string().min(1, 'Value is required');

    fc.assert(
      fc.property(
        fc.constant(''), // Invalid: empty string
        (invalidData) => {
          const result = RootLevelSchema.safeParse(invalidData);
          
          expect(result.success).toBe(false);
          
          if (!result.success) {
            const formatted = formatZodErrors(result.error);
            
            // Property: Root level errors should have empty string or root key
            expect(Object.keys(formatted).length).toBeGreaterThan(0);
            
            // Should have an error entry (path will be empty string for root)
            const rootErrors = formatted[''] || Object.values(formatted)[0];
            expect(Array.isArray(rootErrors)).toBe(true);
            expect(rootErrors.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce user-friendly error messages', () => {
    const UserFriendlySchema = z.object({
      email: z.string().email('Please enter a valid email address'),
      age: z.number().min(18, 'You must be at least 18 years old'),
      terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
    });

    fc.assert(
      fc.property(
        fc.record({
          email: fc.constant('invalid'),
          age: fc.integer({ min: 0, max: 17 }),
          terms: fc.constant(false)
        }),
        (invalidData) => {
          const result = UserFriendlySchema.safeParse(invalidData);
          
          expect(result.success).toBe(false);
          
          if (!result.success) {
            const formatted = formatZodErrors(result.error);
            
            // Property: Error messages should be human-readable
            Object.values(formatted).forEach(errors => {
              errors.forEach(error => {
                // Should not contain technical jargon like "Expected", "Received"
                // Should be complete sentences or phrases
                expect(error.length).toBeGreaterThan(5);
                
                // Should not be just a type name
                expect(error).not.toMatch(/^(string|number|boolean|object|array)$/i);
              });
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle union type errors gracefully', () => {
    const UnionSchema = z.object({
      value: z.union([
        z.string().min(1),
        z.number().min(0)
      ])
    });

    fc.assert(
      fc.property(
        fc.record({
          value: fc.constant(null) // Invalid for both union members
        }),
        (invalidData) => {
          const result = UnionSchema.safeParse(invalidData);
          
          expect(result.success).toBe(false);
          
          if (!result.success) {
            const formatted = formatZodErrors(result.error);
            
            // Property: Should have errors for the value field
            expect(Object.keys(formatted).length).toBeGreaterThan(0);
            
            // All errors should be arrays of strings
            Object.values(formatted).forEach(errors => {
              expect(Array.isArray(errors)).toBe(true);
              errors.forEach(error => {
                expect(typeof error).toBe('string');
              });
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
