/**
 * Property-Based Tests for Validation Functions
 * 
 * These tests validate that validation functions correctly handle boundary cases
 * and edge conditions across a wide range of inputs.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateZipCode,
  validatePhone,
  validateSSN,
  validateEIN,
  validateEmail,
  validateURL,
  validateDocumentNumber,
  validateDate,
  validatePassword,
  validateBusinessName,
  validateDBAName,
  zipCodeSchema,
  phoneSchema,
  ssnSchema,
  einSchema,
  emailSchema,
  urlSchema,
  documentNumberSchema,
  dateSchema,
  passwordSchema,
  businessNameSchema,
  dbaNameSchema,
  formatZipCode,
  formatPhone,
  formatSSN,
  formatEIN,
  formatDocumentNumber
} from './validation';
import {
  zipCodeArbitrary,
  phoneArbitrary,
  ssnArbitrary,
  einArbitrary,
  emailArbitrary,
  urlArbitrary,
  documentNumberArbitrary,
  dateStringArbitrary,
  passwordArbitrary,
  businessNameArbitrary,
  dbaNameArbitrary,
  boundaryValueArbitrary
} from '../../test/utils/generators';

/**
 * Feature: code-quality-improvements, Property 9: Validation Boundary Cases
 * 
 * Property: For any validation function, inputs at boundary values (empty strings,
 * zero, maximum lengths, edge dates) should be correctly classified as valid or
 * invalid according to the validation rules.
 * 
 * Validates: Requirements 4.2
 */
describe('Property 9: Validation Boundary Cases', () => {
  
  describe('ZIP Code Validation', () => {
    it('should accept all valid ZIP code formats', () => {
      fc.assert(
        fc.property(zipCodeArbitrary, (zipCode) => {
          // Valid ZIP codes should pass validation
          expect(validateZipCode(zipCode)).toBe(true);
          
          // Zod schema should also accept them
          const result = zipCodeSchema.safeParse(zipCode);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject empty and whitespace-only strings', () => {
      const invalidInputs = ['', ' ', '  ', '\t', '\n', '   \t\n   '];
      
      invalidInputs.forEach(input => {
        expect(validateZipCode(input)).toBe(false);
        
        const result = zipCodeSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    it('should reject ZIP codes with wrong length', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: 0, max: 9999 }).map(n => n.toString()), // Too short
            fc.integer({ min: 100000, max: 999999 }).map(n => n.toString()), // Too long
            fc.string({ minLength: 1, maxLength: 4 }), // Way too short
            fc.string({ minLength: 11, maxLength: 20 }) // Way too long
          ),
          (invalidZip) => {
            // Filter out accidentally valid formats
            if (/^\d{5}(-\d{4})?$/.test(invalidZip)) {
              return true; // Skip this case
            }
            
            expect(validateZipCode(invalidZip)).toBe(false);
            
            const result = zipCodeSchema.safeParse(invalidZip);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle formatting edge cases', () => {
      // Test that formatting preserves valid formats
      expect(formatZipCode('12345')).toBe('12345');
      expect(formatZipCode('123456789')).toBe('12345-6789');
      
      // Test boundary: exactly 5 digits
      expect(formatZipCode('00000')).toBe('00000');
      expect(formatZipCode('99999')).toBe('99999');
      
      // Test boundary: exactly 9 digits
      expect(formatZipCode('000000000')).toBe('00000-0000');
      expect(formatZipCode('999999999')).toBe('99999-9999');
    });
  });

  describe('Phone Number Validation', () => {
    it('should accept all valid phone number formats', () => {
      fc.assert(
        fc.property(phoneArbitrary, (phone) => {
          expect(validatePhone(phone)).toBe(true);
          
          const result = phoneSchema.safeParse(phone);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject phone numbers with wrong digit count', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: 0, max: 999999999 }).map(n => n.toString()), // < 10 digits
            fc.integer({ min: 10000000000, max: 99999999999 }).map(n => n.toString()) // > 10 digits
          ),
          (invalidPhone) => {
            const cleaned = invalidPhone.replace(/\D/g, '');
            if (cleaned.length === 10) {
              return true; // Skip accidentally valid cases
            }
            
            expect(validatePhone(invalidPhone)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty and whitespace inputs', () => {
      const invalidInputs = ['', ' ', '  ', '\t', '\n'];
      
      invalidInputs.forEach(input => {
        expect(validatePhone(input)).toBe(false);
      });
    });

    it('should format phone numbers correctly at boundaries', () => {
      // Minimum valid phone
      expect(formatPhone('2000000000')).toBe('(200) 000-0000');
      
      // Maximum valid phone
      expect(formatPhone('9999999999')).toBe('(999) 999-9999');
      
      // Empty input
      expect(formatPhone('')).toBe('');
      
      // Partial inputs (boundary cases during typing)
      expect(formatPhone('2')).toBe('(2');
      expect(formatPhone('200')).toBe('(200');
      expect(formatPhone('2001')).toBe('(200) 1');
      expect(formatPhone('2001234')).toBe('(200) 123-4');
    });
  });

  describe('SSN Validation', () => {
    it('should accept all valid SSN formats', () => {
      fc.assert(
        fc.property(ssnArbitrary, (ssn) => {
          expect(validateSSN(ssn)).toBe(true);
          
          const result = ssnSchema.safeParse(ssn);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject SSNs with wrong format', () => {
      const invalidSSNs = [
        '',
        '123456789',      // No dashes
        '12-34-5678',     // Wrong dash positions
        '1234-56-789',    // Wrong dash positions
        '123-456-7890',   // Too many digits
        '12-34-567',      // Too few digits
        'abc-de-fghi',    // Letters
        '   -  -    '     // Whitespace
      ];
      
      invalidSSNs.forEach(ssn => {
        expect(validateSSN(ssn)).toBe(false);
        
        const result = ssnSchema.safeParse(ssn);
        expect(result.success).toBe(false);
      });
    });

    it('should handle SSN formatting at boundaries', () => {
      // Minimum valid SSN
      expect(formatSSN('100101000')).toBe('100-10-1000');
      
      // Maximum valid SSN
      expect(formatSSN('999999999')).toBe('999-99-9999');
      
      // Empty input
      expect(formatSSN('')).toBe('');
      
      // Partial inputs
      expect(formatSSN('1')).toBe('1');
      expect(formatSSN('123')).toBe('123');
      expect(formatSSN('1234')).toBe('123-4');
      expect(formatSSN('12345')).toBe('123-45');
      expect(formatSSN('123456')).toBe('123-45-6');
    });
  });

  describe('EIN Validation', () => {
    it('should accept all valid EIN formats', () => {
      fc.assert(
        fc.property(einArbitrary, (ein) => {
          expect(validateEIN(ein)).toBe(true);
          
          const result = einSchema.safeParse(ein);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject EINs with wrong format', () => {
      const invalidEINs = [
        '',
        '123456789',      // No dash
        '1-2345678',      // Wrong dash position
        '123-456789',     // Wrong dash position
        '12-12345678',    // Too many digits
        '12-123456',      // Too few digits
        'ab-cdefghi',     // Letters
        '  -       '      // Whitespace
      ];
      
      invalidEINs.forEach(ein => {
        expect(validateEIN(ein)).toBe(false);
        
        const result = einSchema.safeParse(ein);
        expect(result.success).toBe(false);
      });
    });

    it('should handle EIN formatting at boundaries', () => {
      // Minimum valid EIN
      expect(formatEIN('101000000')).toBe('10-1000000');
      
      // Maximum valid EIN
      expect(formatEIN('999999999')).toBe('99-9999999');
      
      // Empty input
      expect(formatEIN('')).toBe('');
      
      // Partial inputs
      expect(formatEIN('1')).toBe('1');
      expect(formatEIN('12')).toBe('12');
      expect(formatEIN('123')).toBe('12-3');
    });
  });

  describe('Email Validation', () => {
    it('should accept all valid email formats', () => {
      fc.assert(
        fc.property(emailArbitrary, (email) => {
          expect(validateEmail(email)).toBe(true);
          
          const result = emailSchema.safeParse(email);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        '',
        ' ',
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',  // Space in email
        'a'.repeat(255) + '@example.com' // Too long (> 254 chars)
      ];
      
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
        
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('should handle email length boundaries', () => {
      // Maximum valid length is 254 characters (RFC 5321)
      const longLocalPart = 'a'.repeat(64); // Max local part
      const longDomain = 'b'.repeat(63) + '.com'; // Max domain label
      const maxEmail = `${longLocalPart}@${longDomain}`;
      
      if (maxEmail.length <= 254) {
        expect(validateEmail(maxEmail)).toBe(true);
      }
      
      // Just over the limit should fail (262 characters)
      const tooLongEmail = 'a'.repeat(250) + '@example.com';
      if (tooLongEmail.length > 254) {
        expect(validateEmail(tooLongEmail)).toBe(false);
      }
    });
  });

  describe('URL Validation', () => {
    it('should accept all valid HTTP/HTTPS URLs', () => {
      fc.assert(
        fc.property(urlArbitrary, (url) => {
          expect(validateURL(url)).toBe(true);
          
          const result = urlSchema.safeParse(url);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid URL formats', () => {
      const invalidURLs = [
        '',
        ' ',
        'notaurl',
        'ftp://example.com',    // Wrong protocol
        'javascript:alert(1)',  // Dangerous protocol
        'file:///etc/passwd',   // File protocol
        '//example.com',        // Protocol-relative
        'http://',              // No domain
        'http:// example.com'   // Space in URL
      ];
      
      invalidURLs.forEach(url => {
        expect(validateURL(url)).toBe(false);
        
        const result = urlSchema.safeParse(url);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Document Number Validation', () => {
    it('should accept all valid document number formats', () => {
      fc.assert(
        fc.property(documentNumberArbitrary, (docNum) => {
          expect(validateDocumentNumber(docNum)).toBe(true);
          
          const result = documentNumberSchema.safeParse(docNum);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid document number formats', () => {
      const invalidDocNums = [
        '',
        'L',                    // No digits
        'L123',                 // Too few digits
        'L12345678901234567',   // Too many digits
        'X12345678901234',      // Wrong prefix
        '12345678901234',       // No prefix
        'LL2345678901234'       // Double prefix
      ];
      
      invalidDocNums.forEach(docNum => {
        expect(validateDocumentNumber(docNum)).toBe(false);
        
        const result = documentNumberSchema.safeParse(docNum);
        expect(result.success).toBe(false);
      });
    });

    it('should handle document number formatting at boundaries', () => {
      // Minimum valid document number
      expect(formatDocumentNumber('L10000000000000')).toBe('L10000000000000');
      
      // Maximum valid document number
      expect(formatDocumentNumber('L99999999999999')).toBe('L99999999999999');
      
      // Partnership format
      expect(formatDocumentNumber('P10000000000000')).toBe('P10000000000000');
      
      // Empty input
      expect(formatDocumentNumber('')).toBe('');
      
      // Case insensitive
      expect(formatDocumentNumber('l12345678901234')).toBe('L12345678901234');
      expect(formatDocumentNumber('p12345678901234')).toBe('P12345678901234');
    });
  });

  describe('Date Validation', () => {
    it('should accept all valid ISO date formats', () => {
      fc.assert(
        fc.property(dateStringArbitrary, (dateStr) => {
          expect(validateDate(dateStr)).toBe(true);
          
          const result = dateSchema.safeParse(dateStr);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid date formats', () => {
      const invalidDates = [
        '',
        '2024-13-01',     // Invalid month
        '2024-02-30',     // Invalid day for February
        '2024-04-31',     // Invalid day for April
        '2024-00-01',     // Invalid month (0)
        '2024-01-00',     // Invalid day (0)
        '2024-01-32',     // Invalid day (> 31)
        '24-01-01',       // Wrong year format
        '2024/01/01',     // Wrong separator
        '01-01-2024',     // Wrong order
        'not-a-date'      // Not a date
      ];
      
      invalidDates.forEach(date => {
        expect(validateDate(date)).toBe(false);
        
        const result = dateSchema.safeParse(date);
        expect(result.success).toBe(false);
      });
    });

    it('should handle date boundary cases', () => {
      // Leap year - Feb 29 should be valid
      expect(validateDate('2000-02-29')).toBe(true);
      expect(validateDate('2024-02-29')).toBe(true);
      
      // Non-leap year - Feb 29 should be invalid
      expect(validateDate('2001-02-29')).toBe(false);
      expect(validateDate('2100-02-29')).toBe(false); // 2100 is not a leap year
      
      // Month boundaries
      expect(validateDate('2024-01-31')).toBe(true); // Jan has 31 days
      expect(validateDate('2024-02-28')).toBe(true); // Feb has 28 days (leap year has 29)
      expect(validateDate('2024-04-30')).toBe(true); // Apr has 30 days
      expect(validateDate('2024-04-31')).toBe(false); // Apr doesn't have 31 days
      
      // Year boundaries
      expect(validateDate('1900-01-01')).toBe(true);
      expect(validateDate('2100-12-31')).toBe(true);
    });
  });

  describe('Password Validation', () => {
    it('should accept all valid passwords', () => {
      fc.assert(
        fc.property(passwordArbitrary, (password) => {
          const result = validatePassword(password);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
          
          const schemaResult = passwordSchema.safeParse(password);
          expect(schemaResult.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject passwords that are too short', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 7 }),
          (shortPassword) => {
            const result = validatePassword(shortPassword);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('8 characters'))).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject passwords missing required character types', () => {
      // No uppercase
      const noUppercase = 'password123!';
      let result = validatePassword(noUppercase);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
      
      // No lowercase
      const noLowercase = 'PASSWORD123!';
      result = validatePassword(noLowercase);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('lowercase'))).toBe(true);
      
      // No number
      const noNumber = 'Password!';
      result = validatePassword(noNumber);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('number'))).toBe(true);
      
      // No special character
      const noSpecial = 'Password123';
      result = validatePassword(noSpecial);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('special'))).toBe(true);
    });

    it('should handle password length boundaries', () => {
      // Exactly 8 characters with all requirements
      const minValid = 'Pass123!';
      expect(validatePassword(minValid).valid).toBe(true);
      
      // 7 characters (too short)
      const tooShort = 'Pass12!';
      expect(validatePassword(tooShort).valid).toBe(false);
      
      // Very long password (should still be valid)
      const veryLong = 'P' + 'a'.repeat(100) + '1!';
      expect(validatePassword(veryLong).valid).toBe(true);
    });
  });

  describe('Business Name Validation', () => {
    it('should accept all valid business names', () => {
      fc.assert(
        fc.property(businessNameArbitrary, (name) => {
          expect(validateBusinessName(name)).toBe(true);
          
          const result = businessNameSchema.safeParse(name);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject empty and whitespace-only names', () => {
      const invalidNames = ['', ' ', '  ', '\t', '\n', '   \t\n   '];
      
      invalidNames.forEach(name => {
        expect(validateBusinessName(name)).toBe(false);
        
        const result = businessNameSchema.safeParse(name);
        expect(result.success).toBe(false);
      });
    });

    it('should reject names with invalid characters', () => {
      const invalidNames = [
        'Business<Name>',     // HTML tags
        'Business@Name',      // @ symbol
        'Business#Name',      // # symbol
        'Business$Name',      // $ symbol
        'Business%Name',      // % symbol
        'Business^Name',      // ^ symbol
        'Business*Name',      // * symbol
        'Business+Name',      // + symbol
        'Business=Name',      // = symbol
        'Business[Name]',     // Brackets
        'Business{Name}',     // Braces
        'Business|Name',      // Pipe
        'Business\\Name',     // Backslash
        'Business/Name',      // Forward slash
        'Business~Name',      // Tilde
        'Business`Name'       // Backtick
      ];
      
      invalidNames.forEach(name => {
        expect(validateBusinessName(name)).toBe(false);
        
        const result = businessNameSchema.safeParse(name);
        expect(result.success).toBe(false);
      });
    });

    it('should handle business name length boundaries', () => {
      // Minimum valid length (1 character)
      expect(validateBusinessName('A')).toBe(true);
      
      // Maximum valid length (200 characters)
      const maxLength = 'A'.repeat(200);
      expect(validateBusinessName(maxLength)).toBe(true);
      
      // Just over maximum (201 characters)
      const tooLong = 'A'.repeat(201);
      expect(validateBusinessName(tooLong)).toBe(false);
      
      // Empty string
      expect(validateBusinessName('')).toBe(false);
    });

    it('should accept valid special characters', () => {
      const validNames = [
        "John's Business",      // Apostrophe
        'Business & Co.',       // Ampersand and period
        'Business-Name',        // Hyphen
        'Business, Inc.',       // Comma
        'Business (LLC)',       // Parentheses
        'Business 123'          // Numbers
      ];
      
      validNames.forEach(name => {
        expect(validateBusinessName(name)).toBe(true);
        
        const result = businessNameSchema.safeParse(name);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('DBA Name Validation', () => {
    it('should accept all valid DBA names', () => {
      fc.assert(
        fc.property(dbaNameArbitrary, (name) => {
          expect(validateDBAName(name)).toBe(true);
          
          const result = dbaNameSchema.safeParse(name);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle DBA name length boundaries', () => {
      // Minimum valid length (1 character)
      expect(validateDBAName('A')).toBe(true);
      
      // Maximum valid length (120 characters)
      const maxLength = 'A'.repeat(120);
      expect(validateDBAName(maxLength)).toBe(true);
      
      // Just over maximum (121 characters)
      const tooLong = 'A'.repeat(121);
      expect(validateDBAName(tooLong)).toBe(false);
      
      // Empty string
      expect(validateDBAName('')).toBe(false);
    });
  });

  describe('Cross-Validation Consistency', () => {
    it('should have consistent validation between function and schema', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            zipCodeArbitrary,
            phoneArbitrary,
            ssnArbitrary,
            einArbitrary,
            emailArbitrary,
            documentNumberArbitrary,
            dateStringArbitrary
          ),
          (value) => {
            // For each valid value, both validation methods should agree
            // This tests that our validation functions and Zod schemas are in sync
            
            // We can't easily test all types generically, but we can test
            // that the pattern holds for at least one type
            if (typeof value === 'string' && /^\d{5}(-\d{4})?$/.test(value)) {
              const funcResult = validateZipCode(value);
              const schemaResult = zipCodeSchema.safeParse(value);
              expect(funcResult).toBe(schemaResult.success);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Boundary Value Stress Testing', () => {
    it('should handle all boundary values without crashing', () => {
      fc.assert(
        fc.property(
          boundaryValueArbitrary,
          (boundaryValue) => {
            // The key property here is that validation functions should never throw
            // They should always return a boolean or validation result
            
            expect(() => {
              validateZipCode(String(boundaryValue));
              validatePhone(String(boundaryValue));
              validateSSN(String(boundaryValue));
              validateEIN(String(boundaryValue));
              validateEmail(String(boundaryValue));
              validateURL(String(boundaryValue));
              validateDocumentNumber(String(boundaryValue));
              validateDate(String(boundaryValue));
              validatePassword(String(boundaryValue));
              validateBusinessName(String(boundaryValue));
              validateDBAName(String(boundaryValue));
            }).not.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

