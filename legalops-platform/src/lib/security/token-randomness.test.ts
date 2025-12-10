/**
 * Property-Based Tests for Token Randomness
 * 
 * Feature: code-quality-improvements, Property 16: Token Randomness
 * Validates: Requirements 6.4
 * 
 * Tests that authentication tokens use cryptographically secure random values
 * with sufficient entropy across all token generation functions.
 */

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  generateSecureToken,
  generateSessionId,
  generateApiKey,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateCsrfToken,
  generateOTP,
  validateTokenEntropy,
  hashToken,
  verifyToken
} from './tokens';

describe('Property 16: Token Randomness', () => {
  /**
   * Property: Generated tokens have sufficient entropy
   * 
   * For any token generated with a specified byte size,
   * the token should have at least that many bytes of entropy.
   */
  test('tokens have sufficient entropy based on byte size', () => {
    const byteSizeArbitrary = fc.integer({ min: 16, max: 128 });
    
    fc.assert(
      fc.property(byteSizeArbitrary, (bytes) => {
        const token = generateSecureToken(bytes);
        
        // Token should pass entropy validation
        expect(validateTokenEntropy(token, bytes)).toBe(true);
        
        // Token length should be appropriate for base64url encoding
        // Base64url: 4 characters = 3 bytes, so length ≈ (bytes * 4) / 3
        const expectedMinLength = Math.ceil((bytes * 4) / 3);
        expect(token.length).toBeGreaterThanOrEqual(expectedMinLength);
        
        // Token should only contain base64url characters
        expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Tokens are unique (no collisions)
   * 
   * For any set of generated tokens, each token should be unique.
   * This tests that the random generation doesn't produce duplicates.
   */
  test('generated tokens are unique with no collisions', () => {
    const countArbitrary = fc.integer({ min: 10, max: 100 });
    
    fc.assert(
      fc.property(countArbitrary, (count) => {
        const tokens = new Set<string>();
        
        // Generate multiple tokens
        for (let i = 0; i < count; i++) {
          const token = generateSecureToken(32);
          tokens.add(token);
        }
        
        // All tokens should be unique
        expect(tokens.size).toBe(count);
      }),
      { numRuns: 50 } // Fewer runs since we generate many tokens per run
    );
  });
  
  /**
   * Property: Session IDs have minimum 32 bytes entropy
   * 
   * For any session ID generated, it should have at least 32 bytes
   * of entropy for security.
   */
  test('session IDs have at least 32 bytes of entropy', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const sessionId = generateSessionId();
        
        // Should have at least 32 bytes of entropy
        expect(validateTokenEntropy(sessionId, 32)).toBe(true);
        
        // Should be base64url encoded
        expect(sessionId).toMatch(/^[A-Za-z0-9_-]+$/);
        
        // Should be reasonably long
        expect(sessionId.length).toBeGreaterThanOrEqual(43); // 32 bytes ≈ 43 chars
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: API keys have minimum 48 bytes entropy
   * 
   * For any API key generated, it should have at least 48 bytes
   * of entropy for maximum security.
   */
  test('API keys have at least 48 bytes of entropy', () => {
    const prefixArbitrary = fc.oneof(
      fc.constant('legalops'),
      fc.constant('test'),
      fc.constant('dev'),
      fc.stringMatching(/^[a-z]{3,10}$/)
    );
    
    fc.assert(
      fc.property(prefixArbitrary, (prefix) => {
        const apiKey = generateApiKey(prefix);
        
        // Should start with prefix
        expect(apiKey).toMatch(new RegExp(`^${prefix}_`));
        
        // Extract token part (after prefix and first underscore)
        // Note: token itself may contain underscores (base64url allows _ and -)
        const tokenPart = apiKey.substring(prefix.length + 1);
        
        // Token part should have at least 48 bytes of entropy
        expect(validateTokenEntropy(tokenPart, 48)).toBe(true);
        
        // Should be base64url encoded
        expect(tokenPart).toMatch(/^[A-Za-z0-9_-]+$/);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Password reset tokens have sufficient entropy and expiration
   * 
   * For any password reset token generated, it should have sufficient
   * entropy and a valid expiration timestamp.
   */
  test('password reset tokens have entropy and valid expiration', () => {
    const expirationMinutesArbitrary = fc.integer({ min: 15, max: 1440 }); // 15 min to 24 hours
    
    fc.assert(
      fc.property(expirationMinutesArbitrary, (minutes) => {
        const before = Date.now();
        const { token, expiresAt } = generatePasswordResetToken(minutes);
        const after = Date.now();
        
        // Token should have at least 32 bytes of entropy
        expect(validateTokenEntropy(token, 32)).toBe(true);
        
        // Expiration should be in the future
        expect(expiresAt.getTime()).toBeGreaterThan(before);
        
        // Expiration should be approximately the specified minutes in the future
        const expectedExpiration = before + (minutes * 60 * 1000);
        const tolerance = 1000; // 1 second tolerance
        expect(Math.abs(expiresAt.getTime() - expectedExpiration)).toBeLessThan(tolerance);
        
        // Expiration should not be too far in the future
        expect(expiresAt.getTime()).toBeLessThanOrEqual(after + (minutes * 60 * 1000) + tolerance);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Email verification tokens have sufficient entropy
   * 
   * For any email verification token, it should have at least 24 bytes
   * of entropy.
   */
  test('email verification tokens have at least 24 bytes of entropy', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const token = generateEmailVerificationToken();
        
        // Should have at least 24 bytes of entropy
        expect(validateTokenEntropy(token, 24)).toBe(true);
        
        // Should be base64url encoded
        expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: CSRF tokens have sufficient entropy
   * 
   * For any CSRF token, it should have at least 32 bytes of entropy.
   */
  test('CSRF tokens have at least 32 bytes of entropy', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const token = generateCsrfToken();
        
        // Should have at least 32 bytes of entropy
        expect(validateTokenEntropy(token, 32)).toBe(true);
        
        // Should be base64url encoded
        expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: OTP codes have correct length and are numeric
   * 
   * For any OTP generated with a specified length,
   * it should be exactly that length and contain only digits.
   */
  test('OTP codes have correct length and are numeric', () => {
    const lengthArbitrary = fc.integer({ min: 4, max: 10 });
    
    fc.assert(
      fc.property(lengthArbitrary, (length) => {
        const otp = generateOTP(length);
        
        // Should be exactly the specified length
        expect(otp.length).toBe(length);
        
        // Should contain only digits
        expect(otp).toMatch(/^\d+$/);
        
        // Should be padded with leading zeros if necessary
        const numValue = parseInt(otp, 10);
        expect(numValue).toBeGreaterThanOrEqual(0);
        expect(numValue).toBeLessThan(Math.pow(10, length));
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: OTP codes are uniformly distributed
   * 
   * For any set of OTP codes generated, they should be reasonably
   * distributed (not all the same or following a pattern).
   */
  test('OTP codes are uniformly distributed', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const otps = new Set<string>();
        const count = 50;
        
        // Generate multiple OTPs
        for (let i = 0; i < count; i++) {
          const otp = generateOTP(6);
          otps.add(otp);
        }
        
        // Should have good uniqueness (at least 80% unique for 6-digit OTPs)
        // With 1,000,000 possible values, 50 samples should rarely collide
        expect(otps.size).toBeGreaterThanOrEqual(count * 0.8);
      }),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Token hashing is deterministic
   * 
   * For any token, hashing it multiple times should produce
   * the same hash value.
   */
  test('token hashing is deterministic', () => {
    const tokenArbitrary = fc.string({ minLength: 10, maxLength: 100 });
    
    fc.assert(
      fc.property(tokenArbitrary, (token) => {
        const hash1 = hashToken(token);
        const hash2 = hashToken(token);
        const hash3 = hashToken(token);
        
        // All hashes should be identical
        expect(hash1).toBe(hash2);
        expect(hash2).toBe(hash3);
        
        // Hash should be hex-encoded SHA-256 (64 characters)
        expect(hash1).toMatch(/^[a-f0-9]{64}$/);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Token verification works correctly
   * 
   * For any token, verifying it against its hash should succeed,
   * and verifying it against a different hash should fail.
   */
  test('token verification correctly validates tokens', () => {
    const tokenArbitrary = fc.string({ minLength: 10, maxLength: 100 });
    
    fc.assert(
      fc.property(tokenArbitrary, (token) => {
        const hash = hashToken(token);
        
        // Correct token should verify
        expect(verifyToken(token, hash)).toBe(true);
        
        // Modified token should not verify
        const modifiedToken = token + 'x';
        expect(verifyToken(modifiedToken, hash)).toBe(false);
        
        // Different token should not verify
        const differentToken = token.split('').reverse().join('');
        if (differentToken !== token) {
          expect(verifyToken(differentToken, hash)).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Token generation rejects invalid parameters
   * 
   * For any invalid byte size (too small or too large),
   * token generation should throw an error.
   */
  test('token generation rejects invalid byte sizes', () => {
    const invalidByteSizeArbitrary = fc.oneof(
      fc.integer({ min: -100, max: 15 }),  // Too small
      fc.integer({ min: 257, max: 1000 })  // Too large
    );
    
    fc.assert(
      fc.property(invalidByteSizeArbitrary, (bytes) => {
        expect(() => generateSecureToken(bytes)).toThrow();
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: OTP generation rejects invalid lengths
   * 
   * For any invalid OTP length (too small or too large),
   * OTP generation should throw an error.
   */
  test('OTP generation rejects invalid lengths', () => {
    const invalidLengthArbitrary = fc.oneof(
      fc.integer({ min: -10, max: 3 }),   // Too small
      fc.integer({ min: 11, max: 100 })   // Too large
    );
    
    fc.assert(
      fc.property(invalidLengthArbitrary, (length) => {
        expect(() => generateOTP(length)).toThrow();
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Different tokens have different hashes
   * 
   * For any two different tokens, their hashes should be different.
   * This validates that the hash function doesn't have collisions
   * for different inputs.
   */
  test('different tokens produce different hashes', () => {
    const tokenPairArbitrary = fc.tuple(
      fc.string({ minLength: 10, maxLength: 100 }),
      fc.string({ minLength: 10, maxLength: 100 })
    ).filter(([t1, t2]) => t1 !== t2);
    
    fc.assert(
      fc.property(tokenPairArbitrary, ([token1, token2]) => {
        const hash1 = hashToken(token1);
        const hash2 = hashToken(token2);
        
        // Different tokens should produce different hashes
        expect(hash1).not.toBe(hash2);
      }),
      { numRuns: 100 }
    );
  });
});
