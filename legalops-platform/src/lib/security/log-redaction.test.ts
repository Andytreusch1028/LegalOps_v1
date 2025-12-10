/**
 * Property-Based Tests for Log Redaction
 * 
 * Feature: code-quality-improvements, Property 17: Log Redaction
 * Validates: Requirements 6.5
 * 
 * Tests that sensitive patterns (emails, phone numbers, SSNs, credit cards, passwords)
 * are properly redacted or masked before logging across all data types.
 */

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { sanitizeForLog } from '../utils/sanitization';
import {
  emailArbitrary,
  phoneArbitrary,
  ssnArbitrary
} from '../../../test/utils/generators';

describe('Property 17: Log Redaction', () => {
  /**
   * Property: Sensitive field names are redacted
   * 
   * For any object containing fields with sensitive names (password, token, secret, etc.),
   * those fields should be redacted to '[REDACTED]' in the sanitized output.
   */
  test('sensitive field names are always redacted', () => {
    const sensitiveFieldNames = [
      'password',
      'token',
      'secret',
      'apikey',
      'api_key',
      'ssn',
      'social_security',
      'credit_card',
      'creditcard',
      'cvv',
      'pin'
    ];
    
    const objectArbitrary = fc.record({
      fieldName: fc.constantFrom(...sensitiveFieldNames),
      value: fc.string({ minLength: 1, maxLength: 100 })
    }).map(({ fieldName, value }) => ({
      [fieldName]: value,
      normalField: 'normal value'
    }));
    
    fc.assert(
      fc.property(objectArbitrary, (obj) => {
        const sanitized = sanitizeForLog(obj) as Record<string, unknown>;
        
        // Find the sensitive field
        const sensitiveField = Object.keys(obj).find(key => 
          key !== 'normalField'
        );
        
        if (sensitiveField) {
          // Sensitive field should be redacted
          expect(sanitized[sensitiveField]).toBe('[REDACTED]');
        }
        
        // Normal field should not be redacted
        expect(sanitized.normalField).toBe('normal value');
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: SSN patterns are redacted in strings
   * 
   * For any string containing an SSN pattern (XXX-XX-XXXX),
   * the SSN should be replaced with '[SSN-REDACTED]'.
   */
  test('SSN patterns are redacted in strings', () => {
    const stringWithSSNArbitrary = fc.tuple(
      fc.string({ minLength: 0, maxLength: 50 }).filter(s => !/\d{3}-\d{2}-\d{4}/.test(s)), // Avoid accidental SSN patterns
      ssnArbitrary, // Use the generator from test utils which creates valid SSNs
      fc.string({ minLength: 0, maxLength: 50 }).filter(s => !/\d{3}-\d{2}-\d{4}/.test(s))
    ).map(([before, ssn, after]) => `${before} ${ssn} ${after}`); // Add spaces for word boundaries
    
    fc.assert(
      fc.property(stringWithSSNArbitrary, (str) => {
        const sanitized = sanitizeForLog(str) as string;
        
        // SSN pattern should be redacted
        expect(sanitized).toContain('[SSN-REDACTED]');
        
        // Original SSN should not be present
        expect(sanitized).not.toMatch(/\b\d{3}-\d{2}-\d{4}\b/);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Credit card patterns are redacted in strings
   * 
   * For any string containing a credit card pattern (16 digits with optional separators),
   * the card number should be replaced with '[CARD-REDACTED]'.
   */
  test('credit card patterns are redacted in strings', () => {
    // Generate valid credit card format: 4 groups of 4 digits with consistent separator
    const creditCardArbitrary = fc.tuple(
      fc.integer({ min: 1000, max: 9999 }),
      fc.integer({ min: 1000, max: 9999 }),
      fc.integer({ min: 1000, max: 9999 }),
      fc.integer({ min: 1000, max: 9999 }),
      fc.constantFrom('', ' ', '-')
    ).map(([p1, p2, p3, p4, sep]) => {
      // Ensure consistent separator usage
      if (sep === '') {
        return `${p1}${p2}${p3}${p4}`;
      }
      return `${p1}${sep}${p2}${sep}${p3}${sep}${p4}`;
    });
    
    const stringWithCardArbitrary = fc.tuple(
      fc.string({ minLength: 0, maxLength: 50 }).filter(s => !/\d{4}/.test(s)), // Avoid accidental card patterns
      creditCardArbitrary,
      fc.string({ minLength: 0, maxLength: 50 }).filter(s => !/\d{4}/.test(s))
    ).map(([before, card, after]) => `${before} ${card} ${after}`); // Add spaces to ensure word boundaries
    
    fc.assert(
      fc.property(stringWithCardArbitrary, (str) => {
        const sanitized = sanitizeForLog(str) as string;
        
        // Card pattern should be redacted
        expect(sanitized).toContain('[CARD-REDACTED]');
        
        // Original card number should not be present (check for 4 groups of 4 digits)
        expect(sanitized).not.toMatch(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Email patterns are redacted in strings
   * 
   * For any string containing an email address,
   * the email should be replaced with '[EMAIL-REDACTED]'.
   */
  test('email patterns are redacted in strings', () => {
    const stringWithEmailArbitrary = fc.tuple(
      fc.string({ minLength: 0, maxLength: 50 }).filter(s => !s.includes('@')),
      emailArbitrary,
      fc.string({ minLength: 0, maxLength: 50 }).filter(s => !s.includes('@'))
    ).map(([before, email, after]) => `${before} ${email} ${after}`); // Add spaces for word boundaries
    
    fc.assert(
      fc.property(stringWithEmailArbitrary, (str) => {
        const sanitized = sanitizeForLog(str) as string;
        
        // Email pattern should be redacted
        expect(sanitized).toContain('[EMAIL-REDACTED]');
        
        // Original email should not be present
        expect(sanitized).not.toMatch(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Phone patterns are redacted in strings
   * 
   * For any string containing a phone number pattern,
   * the phone number should be replaced with '[PHONE-REDACTED]'.
   */
  test('phone patterns are redacted in strings', () => {
    // Generate valid phone format: XXX-XXX-XXXX or XXX.XXX.XXXX or XXXXXXXXXX
    const phonePatternArbitrary = fc.tuple(
      fc.integer({ min: 100, max: 999 }),
      fc.integer({ min: 100, max: 999 }),
      fc.integer({ min: 1000, max: 9999 }),
      fc.constantFrom('-', '.', '')
    ).map(([area, exchange, line, sep]) => {
      if (sep === '') {
        return `${area}${exchange}${line}`;
      }
      return `${area}${sep}${exchange}${sep}${line}`;
    });
    
    const stringWithPhoneArbitrary = fc.tuple(
      fc.string({ minLength: 0, maxLength: 50 }).filter(s => !/\d{3}/.test(s)), // Avoid accidental phone patterns
      phonePatternArbitrary,
      fc.string({ minLength: 0, maxLength: 50 }).filter(s => !/\d{3}/.test(s))
    ).map(([before, phone, after]) => `${before} ${phone} ${after}`); // Add spaces for word boundaries
    
    fc.assert(
      fc.property(stringWithPhoneArbitrary, (str) => {
        const sanitized = sanitizeForLog(str) as string;
        
        // Phone pattern should be redacted
        expect(sanitized).toContain('[PHONE-REDACTED]');
        
        // Original phone should not be present
        expect(sanitized).not.toMatch(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Nested objects have sensitive fields redacted
   * 
   * For any nested object structure containing sensitive fields,
   * all sensitive fields at any depth should be redacted.
   */
  test('nested objects have sensitive fields redacted at all levels', () => {
    const nestedObjectArbitrary = fc.record({
      user: fc.record({
        name: fc.string({ minLength: 1, maxLength: 50 }),
        email: emailArbitrary,
        password: fc.string({ minLength: 8, maxLength: 20 })
      }),
      payment: fc.record({
        amount: fc.integer({ min: 100, max: 100000 }),
        token: fc.string({ minLength: 20, maxLength: 50 }),
        last4: fc.string({ minLength: 4, maxLength: 4 })
      }),
      metadata: fc.record({
        ip: fc.string({ minLength: 7, maxLength: 15 }),
        apikey: fc.string({ minLength: 20, maxLength: 50 })
      })
    });
    
    fc.assert(
      fc.property(nestedObjectArbitrary, (obj) => {
        const sanitized = sanitizeForLog(obj) as any;
        
        // Sensitive fields should be redacted
        expect(sanitized.user.password).toBe('[REDACTED]');
        expect(sanitized.payment.token).toBe('[REDACTED]');
        expect(sanitized.metadata.apikey).toBe('[REDACTED]');
        
        // Non-sensitive fields should not be redacted
        expect(sanitized.user.name).toBe(obj.user.name);
        expect(sanitized.payment.amount).toBe(obj.payment.amount);
        expect(sanitized.metadata.ip).toBe(obj.metadata.ip);
        
        // Email should be redacted in the string value
        expect(sanitized.user.email).toContain('[EMAIL-REDACTED]');
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Arrays are sanitized recursively
   * 
   * For any array containing objects with sensitive fields,
   * all sensitive fields in all array elements should be redacted.
   */
  test('arrays are sanitized recursively', () => {
    const arrayArbitrary = fc.array(
      fc.record({
        id: fc.integer({ min: 1, max: 1000 }),
        password: fc.string({ minLength: 8, maxLength: 20 }),
        name: fc.string({ minLength: 1, maxLength: 50 })
      }),
      { minLength: 1, maxLength: 10 }
    );
    
    fc.assert(
      fc.property(arrayArbitrary, (arr) => {
        const sanitized = sanitizeForLog(arr) as any[];
        
        // All elements should have passwords redacted
        sanitized.forEach((item, index) => {
          expect(item.password).toBe('[REDACTED]');
          expect(item.name).toBe(arr[index].name);
          expect(item.id).toBe(arr[index].id);
        });
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Multiple sensitive patterns in one string are all redacted
   * 
   * For any string containing multiple types of sensitive data,
   * all sensitive patterns should be redacted.
   */
  test('multiple sensitive patterns in one string are all redacted', () => {
    const multiSensitiveArbitrary = fc.tuple(
      emailArbitrary,
      ssnArbitrary,
      fc.tuple(
        fc.integer({ min: 1000, max: 9999 }),
        fc.integer({ min: 1000, max: 9999 }),
        fc.integer({ min: 1000, max: 9999 }),
        fc.integer({ min: 1000, max: 9999 })
      ).map(([p1, p2, p3, p4]) => `${p1}-${p2}-${p3}-${p4}`)
    ).map(([email, ssn, card]) => 
      `User: ${email}, SSN: ${ssn}, Card: ${card}`
    );
    
    fc.assert(
      fc.property(multiSensitiveArbitrary, (str) => {
        const sanitized = sanitizeForLog(str) as string;
        
        // All patterns should be redacted
        expect(sanitized).toContain('[EMAIL-REDACTED]');
        expect(sanitized).toContain('[SSN-REDACTED]');
        expect(sanitized).toContain('[CARD-REDACTED]');
        
        // Original sensitive data should not be present
        expect(sanitized).not.toMatch(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        expect(sanitized).not.toMatch(/\b\d{3}-\d{2}-\d{4}\b/);
        expect(sanitized).not.toMatch(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Case-insensitive field name matching
   * 
   * For any object with sensitive field names in different cases,
   * all variations should be redacted.
   */
  test('sensitive field names are matched case-insensitively', () => {
    const caseVariationsArbitrary = fc.record({
      fieldName: fc.constantFrom(
        'password', 'Password', 'PASSWORD', 'PaSsWoRd',
        'token', 'Token', 'TOKEN',
        'secret', 'Secret', 'SECRET',
        'apiKey', 'ApiKey', 'APIKEY', 'api_key', 'API_KEY'
      ),
      value: fc.string({ minLength: 1, maxLength: 100 })
    }).map(({ fieldName, value }) => ({
      [fieldName]: value,
      normalField: 'normal value'
    }));
    
    fc.assert(
      fc.property(caseVariationsArbitrary, (obj) => {
        const sanitized = sanitizeForLog(obj) as Record<string, unknown>;
        
        // Find the sensitive field
        const sensitiveField = Object.keys(obj).find(key => 
          key !== 'normalField'
        );
        
        if (sensitiveField) {
          // Sensitive field should be redacted regardless of case
          expect(sanitized[sensitiveField]).toBe('[REDACTED]');
        }
        
        // Normal field should not be redacted
        expect(sanitized.normalField).toBe('normal value');
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Non-sensitive data is preserved
   * 
   * For any object containing only non-sensitive data,
   * all data should be preserved unchanged.
   */
  test('non-sensitive data is preserved unchanged', () => {
    const nonSensitiveArbitrary = fc.record({
      id: fc.integer({ min: 1, max: 1000000 }),
      name: fc.string({ minLength: 1, maxLength: 100 }),
      age: fc.integer({ min: 0, max: 120 }),
      address: fc.string({ minLength: 1, maxLength: 200 }),
      status: fc.constantFrom('active', 'inactive', 'pending'),
      metadata: fc.record({
        createdAt: fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') })
          .map(d => d.toISOString()),
        updatedAt: fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') })
          .map(d => d.toISOString()),
        version: fc.integer({ min: 1, max: 100 })
      })
    });
    
    fc.assert(
      fc.property(nonSensitiveArbitrary, (obj) => {
        const sanitized = sanitizeForLog(obj);
        
        // Non-sensitive data should be preserved
        expect(sanitized).toEqual(obj);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Null and undefined values are handled safely
   * 
   * For any data structure containing null or undefined values,
   * sanitization should not throw errors.
   */
  test('null and undefined values are handled safely', () => {
    const nullishArbitrary = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.record({
        field1: fc.constant(null),
        field2: fc.constant(undefined),
        field3: fc.string()
      }),
      fc.array(fc.oneof(fc.constant(null), fc.constant(undefined), fc.string()))
    );
    
    fc.assert(
      fc.property(nullishArbitrary, (data) => {
        // Should not throw
        expect(() => sanitizeForLog(data)).not.toThrow();
        
        const sanitized = sanitizeForLog(data);
        
        // Should return the same value for null/undefined, or a sanitized version for objects/arrays
        // Note: undefined is a valid return value when input is undefined
        if (data === null) {
          expect(sanitized).toBe(null);
        } else if (data === undefined) {
          expect(sanitized).toBe(undefined);
        } else {
          expect(sanitized).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Primitive types are handled correctly
   * 
   * For any primitive value (number, boolean, null),
   * sanitization should return the value unchanged.
   */
  test('primitive types are handled correctly', () => {
    const primitiveArbitrary = fc.oneof(
      fc.integer(),
      fc.float(),
      fc.boolean(),
      fc.constant(null)
    );
    
    fc.assert(
      fc.property(primitiveArbitrary, (value) => {
        const sanitized = sanitizeForLog(value);
        
        // Primitives should be returned unchanged
        expect(sanitized).toBe(value);
      }),
      { numRuns: 100 }
    );
  });
});
