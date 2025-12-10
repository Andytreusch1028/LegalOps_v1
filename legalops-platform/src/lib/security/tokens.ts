/**
 * Secure token generation utilities.
 * Uses cryptographically secure random values for authentication and security tokens.
 */

import crypto from 'crypto';

/**
 * Generates a cryptographically secure random token.
 * Uses Node.js crypto.randomBytes for secure random generation.
 * 
 * @param bytes - Number of random bytes to generate (default: 32)
 * @returns Base64URL-encoded token string
 * 
 * @example
 * ```typescript
 * const token = generateSecureToken(32);
 * // Result: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
 * ```
 */
export function generateSecureToken(bytes: number = 32): string {
  if (bytes < 16) {
    throw new Error('Token must be at least 16 bytes for security');
  }
  
  if (bytes > 256) {
    throw new Error('Token size exceeds maximum of 256 bytes');
  }
  
  return crypto.randomBytes(bytes).toString('base64url');
}

/**
 * Generates a secure session ID for user sessions.
 * Uses 32 bytes of entropy for high security.
 * 
 * @returns Session ID string
 * 
 * @example
 * ```typescript
 * const sessionId = generateSessionId();
 * // Result: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
 * ```
 */
export function generateSessionId(): string {
  return generateSecureToken(32);
}

/**
 * Generates a secure API key with a prefix.
 * Uses 48 bytes of entropy for maximum security.
 * 
 * @param prefix - Optional prefix for the API key (default: 'legalops')
 * @returns API key string with prefix
 * 
 * @example
 * ```typescript
 * const apiKey = generateApiKey();
 * // Result: 'legalops_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
 * ```
 */
export function generateApiKey(prefix: string = 'legalops'): string {
  const token = generateSecureToken(48);
  return `${prefix}_${token}`;
}

/**
 * Generates a secure password reset token.
 * Uses 32 bytes of entropy and includes expiration timestamp.
 * 
 * @param expiresInMinutes - Token expiration time in minutes (default: 60)
 * @returns Object with token and expiration timestamp
 * 
 * @example
 * ```typescript
 * const { token, expiresAt } = generatePasswordResetToken(30);
 * // Store token and expiresAt in database
 * ```
 */
export function generatePasswordResetToken(expiresInMinutes: number = 60): {
  token: string;
  expiresAt: Date;
} {
  const token = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  return { token, expiresAt };
}

/**
 * Generates a secure email verification token.
 * Uses 24 bytes of entropy for a shorter token suitable for email links.
 * 
 * @returns Email verification token
 * 
 * @example
 * ```typescript
 * const token = generateEmailVerificationToken();
 * // Use in verification email link
 * ```
 */
export function generateEmailVerificationToken(): string {
  return generateSecureToken(24);
}

/**
 * Generates a secure CSRF token for form protection.
 * Uses 32 bytes of entropy.
 * 
 * @returns CSRF token string
 * 
 * @example
 * ```typescript
 * const csrfToken = generateCsrfToken();
 * // Include in form as hidden field
 * ```
 */
export function generateCsrfToken(): string {
  return generateSecureToken(32);
}

/**
 * Generates a secure one-time password (OTP) code.
 * Uses cryptographically secure random numbers.
 * 
 * @param length - Number of digits in the OTP (default: 6)
 * @returns OTP code as string
 * 
 * @example
 * ```typescript
 * const otp = generateOTP(6);
 * // Result: '123456'
 * ```
 */
export function generateOTP(length: number = 6): string {
  if (length < 4 || length > 10) {
    throw new Error('OTP length must be between 4 and 10 digits');
  }
  
  const max = Math.pow(10, length);
  const randomValue = crypto.randomInt(0, max);
  
  return randomValue.toString().padStart(length, '0');
}

/**
 * Validates that a token has sufficient entropy.
 * Checks that the token is long enough and uses base64url encoding.
 * 
 * @param token - Token to validate
 * @param minBytes - Minimum number of bytes required (default: 16)
 * @returns True if token has sufficient entropy
 * 
 * @example
 * ```typescript
 * const isValid = validateTokenEntropy('a1b2c3d4e5f6g7h8', 16);
 * // Result: true or false
 * ```
 */
export function validateTokenEntropy(token: string, minBytes: number = 16): boolean {
  // Base64url encoding: 4 characters = 3 bytes
  // So minimum length = (minBytes * 4) / 3, rounded up
  const minLength = Math.ceil((minBytes * 4) / 3);
  
  if (token.length < minLength) {
    return false;
  }
  
  // Check if token uses base64url character set
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  return base64urlPattern.test(token);
}

/**
 * Hashes a token using SHA-256 for secure storage.
 * Tokens should be hashed before storing in database.
 * 
 * @param token - Token to hash
 * @returns Hex-encoded hash of the token
 * 
 * @example
 * ```typescript
 * const token = generateSecureToken(32);
 * const hashedToken = hashToken(token);
 * // Store hashedToken in database, send token to user
 * ```
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Compares a token with its hash in constant time to prevent timing attacks.
 * 
 * @param token - Token to verify
 * @param hashedToken - Stored hash to compare against
 * @returns True if token matches hash
 * 
 * @example
 * ```typescript
 * const isValid = verifyToken(userProvidedToken, storedHash);
 * if (isValid) {
 *   // Token is valid
 * }
 * ```
 */
export function verifyToken(token: string, hashedToken: string): boolean {
  const tokenHash = hashToken(token);
  
  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(tokenHash, 'hex'),
      Buffer.from(hashedToken, 'hex')
    );
  } catch {
    // If lengths don't match, timingSafeEqual throws
    return false;
  }
}
