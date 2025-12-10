/**
 * Property-based tests for input sanitization.
 * Feature: code-quality-improvements, Property 14: Input Sanitization
 * 
 * For any user input containing HTML or script tags, the sanitized output should
 * have all potentially dangerous tags and attributes removed while preserving safe content.
 * 
 * Validates: Requirements 6.1
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  sanitizeHtml,
  sanitizeForLog,
  sanitizeInput,
  sanitizeFilename,
  validateFileUpload,
  stripHtmlTags,
  escapeHtml
} from './sanitization';

describe('Property 14: Input Sanitization', () => {
  describe('HTML Sanitization', () => {
    it('should remove script tags from any input', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.string(),
          (beforeScript, afterScript) => {
            const maliciousInput = `${beforeScript}<script>alert('xss')</script>${afterScript}`;
            const sanitized = sanitizeHtml(maliciousInput);
            
            // Property: Script tags should never appear in sanitized output
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).not.toContain('</script>');
            expect(sanitized.toLowerCase()).not.toContain('<script');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should remove event handlers from any input', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('onclick', 'onerror', 'onload', 'onmouseover', 'onfocus'),
          fc.string({ minLength: 1, maxLength: 50 }),
          (eventHandler, content) => {
            const maliciousInput = `<div ${eventHandler}="alert('xss')">${content}</div>`;
            const sanitized = sanitizeHtml(maliciousInput);
            
            // Property: Event handlers should be removed
            expect(sanitized.toLowerCase()).not.toContain(eventHandler.toLowerCase());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should remove javascript: protocol from any input', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (jsCode) => {
            const maliciousInput = `<a href="javascript:${jsCode}">Click me</a>`;
            const sanitized = sanitizeHtml(maliciousInput);
            
            // Property: javascript: protocol should be removed
            expect(sanitized.toLowerCase()).not.toContain('javascript:');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve safe HTML tags', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('<') && !s.includes('>')),
          (safeContent) => {
            const safeInput = `<p><strong>${safeContent}</strong></p>`;
            const sanitized = sanitizeHtml(safeInput);
            
            // Property: Safe tags should be preserved
            expect(sanitized).toContain('<p>');
            expect(sanitized).toContain('</p>');
            expect(sanitized).toContain('<strong>');
            expect(sanitized).toContain('</strong>');
            expect(sanitized).toContain(safeContent);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should remove dangerous tags while preserving content', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('<') && !s.includes('>')),
          (content) => {
            const maliciousInput = `<iframe>${content}</iframe>`;
            const sanitized = sanitizeHtml(maliciousInput);
            
            // Property: Dangerous tags should be removed but content may be preserved
            expect(sanitized.toLowerCase()).not.toContain('<iframe');
            expect(sanitized.toLowerCase()).not.toContain('</iframe>');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle nested malicious content', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          (content) => {
            const maliciousInput = `<div><script><script>alert('${content}')</script></script></div>`;
            const sanitized = sanitizeHtml(maliciousInput);
            
            // Property: All script tags should be removed, even nested ones
            expect(sanitized.toLowerCase()).not.toContain('<script');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Log Sanitization', () => {
    it('should redact sensitive field names', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 20 }),
          fc.string({ minLength: 8, maxLength: 20 }),
          (password, token) => {
            const sensitiveData = {
              password,
              token,
              apiKey: 'secret123',
              normalField: 'safe-value'
            };
            
            const sanitized = sanitizeForLog(sensitiveData) as Record<string, unknown>;
            
            // Property: Sensitive fields should be redacted
            expect(sanitized.password).toBe('[REDACTED]');
            expect(sanitized.token).toBe('[REDACTED]');
            expect(sanitized.apiKey).toBe('[REDACTED]');
            
            // Property: Non-sensitive fields should be preserved
            expect(sanitized.normalField).toBe('safe-value');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should redact SSN patterns in strings', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 999 }),
          fc.integer({ min: 10, max: 99 }),
          fc.integer({ min: 1000, max: 9999 }),
          fc.string({ minLength: 0, maxLength: 20 }),
          (part1, part2, part3, extraText) => {
            const ssn = `${part1}-${part2}-${part3}`;
            const textWithSSN = `User SSN: ${ssn} ${extraText}`;
            
            const sanitized = sanitizeForLog(textWithSSN);
            
            // Property: SSN should be redacted
            expect(sanitized).toContain('[SSN-REDACTED]');
            expect(sanitized).not.toContain(ssn);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should redact email addresses in strings', () => {
      fc.assert(
        fc.property(
          fc.emailAddress().filter(e => /^[a-zA-Z0-9][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e)),
          fc.string({ minLength: 0, maxLength: 20 }),
          (email, extraText) => {
            const textWithEmail = `Contact: ${email} ${extraText}`;
            
            const sanitized = sanitizeForLog(textWithEmail);
            
            // Property: Email should be redacted
            expect(sanitized).toContain('[EMAIL-REDACTED]');
            expect(sanitized).not.toContain(email);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle nested objects recursively', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 20 }),
          (secret) => {
            const nestedData = {
              level1: {
                level2: {
                  password: secret,
                  safeData: 'visible'
                }
              }
            };
            
            const sanitized = sanitizeForLog(nestedData) as any;
            
            // Property: Nested sensitive fields should be redacted
            expect(sanitized.level1.level2.password).toBe('[REDACTED]');
            
            // Property: Nested safe fields should be preserved
            expect(sanitized.level1.level2.safeData).toBe('visible');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle arrays of objects', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              password: fc.string({ minLength: 8, maxLength: 20 }),
              username: fc.string({ minLength: 3, maxLength: 20 })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (users) => {
            const sanitized = sanitizeForLog(users) as any[];
            
            // Property: All passwords in array should be redacted
            sanitized.forEach((user, index) => {
              expect(user.password).toBe('[REDACTED]');
              expect(user.username).toBe(users[index].username);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Input Sanitization', () => {
    it('should trim whitespace from any input', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.nat({ max: 10 }),
          fc.nat({ max: 10 }),
          (content, leadingSpaces, trailingSpaces) => {
            const input = ' '.repeat(leadingSpaces) + content + ' '.repeat(trailingSpaces);
            const sanitized = sanitizeInput(input);
            
            // Property: Leading and trailing whitespace should be removed
            expect(sanitized).not.toMatch(/^\s/);
            expect(sanitized).not.toMatch(/\s$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should normalize multiple spaces to single space', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.nat({ min: 2, max: 10 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          (part1, spaces, part2) => {
            const input = part1 + ' '.repeat(spaces) + part2;
            const sanitized = sanitizeInput(input);
            
            // Property: Multiple consecutive spaces should become single space
            expect(sanitized).not.toMatch(/\s{2,}/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should remove control characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (content) => {
            // Add some control characters
            const input = content + '\x00\x01\x02\x03\x04\x05\x06\x07\x08';
            const sanitized = sanitizeInput(input);
            
            // Property: Control characters should be removed
            expect(sanitized).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Filename Sanitization', () => {
    it('should remove path traversal attempts', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('/') && !s.includes('\\')),
          (filename) => {
            const maliciousInput = `../../../etc/${filename}`;
            const sanitized = sanitizeFilename(maliciousInput);
            
            // Property: Path traversal should be removed
            expect(sanitized).not.toContain('..');
            expect(sanitized).not.toContain('/');
            expect(sanitized).not.toContain('\\');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should remove dangerous characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (basename) => {
            const maliciousInput = `${basename}<>:"|?*`;
            const sanitized = sanitizeFilename(maliciousInput);
            
            // Property: Dangerous characters should be removed
            expect(sanitized).not.toMatch(/[<>:"|?*]/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should limit filename length', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 300, maxLength: 500 }),
          (longFilename) => {
            const sanitized = sanitizeFilename(longFilename);
            
            // Property: Filename should not exceed 255 characters
            expect(sanitized.length).toBeLessThanOrEqual(255);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide default name for empty input', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '////', '\\\\\\'),
          (emptyInput) => {
            const sanitized = sanitizeFilename(emptyInput);
            
            // Property: Empty input should get default name
            expect(sanitized.length).toBeGreaterThan(0);
            expect(sanitized).toBe('unnamed');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('File Upload Validation', () => {
    it('should reject files with disallowed types', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('application/x-msdownload', 'application/x-executable', 'text/html'),
          fc.string({ minLength: 1, maxLength: 20 }),
          (disallowedType, filename) => {
            const file = new File(['content'], filename, { type: disallowedType });
            
            const result = validateFileUpload(file, {
              allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
            });
            
            // Property: Disallowed file types should be rejected
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject files exceeding max size', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 11, max: 100 }),
          (sizeMB) => {
            const content = 'x'.repeat(sizeMB * 1024 * 1024);
            const file = new File([content], 'large.pdf', { type: 'application/pdf' });
            
            const result = validateFileUpload(file, {
              maxSize: 10 * 1024 * 1024 // 10MB
            });
            
            // Property: Files exceeding max size should be rejected
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('exceeds maximum'))).toBe(true);
          }
        ),
        { numRuns: 50 } // Fewer runs since creating large files is expensive
      );
    });

    it('should accept files with allowed types and sizes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('image/jpeg', 'image/png', 'application/pdf'),
          fc.constantFrom('test.jpg', 'test.png', 'test.pdf'),
          (allowedType, filename) => {
            const file = new File(['small content'], filename, { type: allowedType });
            
            const result = validateFileUpload(file, {
              allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
              allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
              maxSize: 10 * 1024 * 1024
            });
            
            // Property: Valid files should be accepted
            expect(result.valid).toBe(true);
            expect(result.errors.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should sanitize filenames in validation result', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (filename) => {
            const maliciousFilename = `../../../${filename}<>:"|?*`;
            const file = new File(['content'], maliciousFilename, { type: 'image/jpeg' });
            
            const result = validateFileUpload(file);
            
            // Property: Sanitized filename should not contain dangerous characters
            expect(result.sanitizedFilename).not.toContain('..');
            expect(result.sanitizedFilename).not.toMatch(/[<>:"|?*]/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('HTML Stripping and Escaping', () => {
    it('should strip all HTML tags', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => {
            // Filter out strings that are only whitespace or contain HTML chars
            return !s.includes('<') && !s.includes('>') && s.trim().length > 0;
          }),
          (content) => {
            const html = `<div><p><strong>${content}</strong></p></div>`;
            const stripped = stripHtmlTags(html);
            
            // Property: No HTML tags should remain
            expect(stripped).not.toContain('<');
            expect(stripped).not.toContain('>');
            
            // Property: Content should be preserved (trimmed)
            expect(stripped).toContain(content.trim());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should escape HTML special characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (content) => {
            const malicious = `<script>${content}</script>`;
            const escaped = escapeHtml(malicious);
            
            // Property: Special characters should be escaped
            expect(escaped).not.toContain('<script>');
            expect(escaped).toContain('&lt;');
            expect(escaped).toContain('&gt;');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should escape all dangerous characters', () => {
      fc.assert(
        fc.property(
          fc.constant('&<>"\'/'),
          (dangerousChars) => {
            const escaped = escapeHtml(dangerousChars);
            
            // Property: All dangerous characters should be escaped
            expect(escaped).toContain('&amp;');
            expect(escaped).toContain('&lt;');
            expect(escaped).toContain('&gt;');
            expect(escaped).toContain('&quot;');
            expect(escaped).toContain('&#x27;');
            expect(escaped).toContain('&#x2F;');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
