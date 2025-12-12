import crypto from 'crypto';
import { Result } from '../types/result';

/**
 * Token types for different use cases
 */
export enum TokenType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  SESSION = 'session',
  API_KEY = 'api_key',
  CSRF = 'csrf',
  TWO_FACTOR = 'two_factor'
}

/**
 * Token configuration options
 */
export interface TokenConfig {
  length: number;
  expiresInMs: number;
  includeTimestamp: boolean;
  includeChecksum: boolean;
  encoding: 'hex' | 'base64' | 'base64url';
}

/**
 * Default token configurations for different types
 */
export const TOKEN_CONFIGS: Record<TokenType, TokenConfig> = {
  [TokenType.EMAIL_VERIFICATION]: {
    length: 32,
    expiresInMs: 24 * 60 * 60 * 1000, // 24 hours
    includeTimestamp: true,
    includeChecksum: true,
    encoding: 'base64url'
  },
  [TokenType.PASSWORD_RESET]: {
    length: 32,
    expiresInMs: 60 * 60 * 1000, // 1 hour
    includeTimestamp: true,
    includeChecksum: true,
    encoding: 'base64url'
  },
  [TokenType.SESSION]: {
    length: 48,
    expiresInMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    includeTimestamp: true,
    includeChecksum: true,
    encoding: 'base64url'
  },
  [TokenType.API_KEY]: {
    length: 32,
    expiresInMs: 365 * 24 * 60 * 60 * 1000, // 1 year
    includeTimestamp: false,
    includeChecksum: true,
    encoding: 'base64url'
  },
  [TokenType.CSRF]: {
    length: 24,
    expiresInMs: 60 * 60 * 1000, // 1 hour
    includeTimestamp: true,
    includeChecksum: false,
    encoding: 'base64url'
  },
  [TokenType.TWO_FACTOR]: {
    length: 6,
    expiresInMs: 5 * 60 * 1000, // 5 minutes
    includeTimestamp: false,
    includeChecksum: false,
    encoding: 'hex'
  }
};

/**
 * Generated token information
 */
export interface GeneratedToken {
  token: string;
  expiresAt: Date;
  type: TokenType;
  metadata?: Record<string, any>;
}

/**
 * Token validation result
 */
export interface TokenValidation {
  isValid: boolean;
  isExpired: boolean;
  type: TokenType;
  generatedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Secure token generation service
 */
export class TokenGenerator {
  private secretKey: Buffer;

  constructor(secretKey: string) {
    this.secretKey = Buffer.from(secretKey, 'hex');
    
    if (this.secretKey.length < 32) {
      throw new Error('Secret key must be at least 32 bytes (64 hex characters)');
    }
  }

  /**
   * Generates a secure token of the specified type
   */
  generateToken(
    type: TokenType, 
    metadata?: Record<string, any>,
    customConfig?: Partial<TokenConfig>
  ): Result<GeneratedToken, Error> {
    try {
      const config = { ...TOKEN_CONFIGS[type], ...customConfig };
      const now = new Date();
      const expiresAt = new Date(now.getTime() + config.expiresInMs);

      let tokenData: Buffer;

      if (type === TokenType.TWO_FACTOR) {
        // Generate numeric code for 2FA
        const code = this.generateNumericCode(config.length);
        tokenData = Buffer.from(code, 'utf8');
      } else {
        // Generate random bytes
        tokenData = crypto.randomBytes(config.length);
      }

      let tokenParts: Buffer[] = [tokenData];

      // Add timestamp if required
      if (config.includeTimestamp) {
        const timestamp = Buffer.alloc(8);
        timestamp.writeBigUInt64BE(BigInt(now.getTime()), 0);
        tokenParts.push(timestamp);
      }

      // Add metadata if provided
      if (metadata) {
        const metadataBuffer = Buffer.from(JSON.stringify(metadata), 'utf8');
        const metadataLength = Buffer.alloc(2);
        metadataLength.writeUInt16BE(metadataBuffer.length, 0);
        tokenParts.push(metadataLength, metadataBuffer);
      }

      // Combine all parts
      const combinedData = Buffer.concat(tokenParts);

      // Add checksum if required
      if (config.includeChecksum) {
        const checksum = this.generateChecksum(combinedData);
        tokenParts.push(checksum);
      }

      // Final token
      const finalToken = Buffer.concat(tokenParts);
      
      // Encode based on configuration
      let encodedToken: string;
      switch (config.encoding) {
        case 'hex':
          encodedToken = finalToken.toString('hex');
          break;
        case 'base64':
          encodedToken = finalToken.toString('base64');
          break;
        case 'base64url':
          encodedToken = finalToken.toString('base64url');
          break;
        default:
          encodedToken = finalToken.toString('base64url');
      }

      // For 2FA, return just the numeric code
      if (type === TokenType.TWO_FACTOR) {
        encodedToken = tokenData.toString('utf8');
      }

      const result: GeneratedToken = {
        token: encodedToken,
        expiresAt,
        type,
        metadata
      };

      return Result.success(result);
    } catch (error) {
      return Result.failure(new Error(`Token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Validates a token and returns validation information
   */
  validateToken(token: string, type: TokenType): Result<TokenValidation, Error> {
    try {
      const config = TOKEN_CONFIGS[type];
      
      // Handle 2FA tokens separately
      if (type === TokenType.TWO_FACTOR) {
        return this.validate2FAToken(token);
      }

      let tokenBuffer: Buffer;
      
      // Decode based on configuration
      try {
        switch (config.encoding) {
          case 'hex':
            tokenBuffer = Buffer.from(token, 'hex');
            break;
          case 'base64':
            tokenBuffer = Buffer.from(token, 'base64');
            break;
          case 'base64url':
            tokenBuffer = Buffer.from(token, 'base64url');
            break;
          default:
            tokenBuffer = Buffer.from(token, 'base64url');
        }
      } catch {
        return Result.success({
          isValid: false,
          isExpired: false,
          type
        });
      }

      let offset = config.length;
      let generatedAt: Date | undefined;
      let expiresAt: Date | undefined;
      let metadata: Record<string, any> | undefined;

      // Extract timestamp if present
      if (config.includeTimestamp) {
        if (tokenBuffer.length < offset + 8) {
          return Result.success({
            isValid: false,
            isExpired: false,
            type
          });
        }
        
        const timestamp = tokenBuffer.readBigUInt64BE(offset);
        generatedAt = new Date(Number(timestamp));
        expiresAt = new Date(generatedAt.getTime() + config.expiresInMs);
        offset += 8;
      }

      // Extract metadata if present
      if (offset < tokenBuffer.length - (config.includeChecksum ? 32 : 0)) {
        const metadataLength = tokenBuffer.readUInt16BE(offset);
        offset += 2;
        
        if (offset + metadataLength <= tokenBuffer.length - (config.includeChecksum ? 32 : 0)) {
          const metadataBuffer = tokenBuffer.subarray(offset, offset + metadataLength);
          try {
            metadata = JSON.parse(metadataBuffer.toString('utf8'));
          } catch {
            // Invalid metadata, token is invalid
            return Result.success({
              isValid: false,
              isExpired: false,
              type
            });
          }
          offset += metadataLength;
        }
      }

      // Verify checksum if present
      if (config.includeChecksum) {
        const dataWithoutChecksum = tokenBuffer.subarray(0, tokenBuffer.length - 32);
        const providedChecksum = tokenBuffer.subarray(tokenBuffer.length - 32);
        const calculatedChecksum = this.generateChecksum(dataWithoutChecksum);
        
        if (!crypto.timingSafeEqual(providedChecksum, calculatedChecksum)) {
          return Result.success({
            isValid: false,
            isExpired: false,
            type
          });
        }
      }

      // Check expiration
      const now = new Date();
      const isExpired = expiresAt ? now > expiresAt : false;

      const validation: TokenValidation = {
        isValid: true,
        isExpired,
        type,
        generatedAt,
        expiresAt,
        metadata
      };

      return Result.success(validation);
    } catch (error) {
      return Result.failure(new Error(`Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Generates a numeric code for 2FA
   */
  private generateNumericCode(length: number): string {
    const digits = '0123456789';
    let code = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      code += digits[randomIndex];
    }
    
    return code;
  }

  /**
   * Validates a 2FA token (simple numeric code with time-based validation)
   */
  private validate2FAToken(token: string): Result<TokenValidation, Error> {
    const config = TOKEN_CONFIGS[TokenType.TWO_FACTOR];
    
    // Validate format (should be numeric)
    if (!/^\d+$/.test(token) || token.length !== config.length) {
      return Result.success({
        isValid: false,
        isExpired: false,
        type: TokenType.TWO_FACTOR
      });
    }

    // For 2FA tokens, we can't validate expiration without storing generation time
    // This would typically be handled by the calling service
    return Result.success({
      isValid: true,
      isExpired: false, // Caller should check expiration based on storage
      type: TokenType.TWO_FACTOR
    });
  }

  /**
   * Generates HMAC checksum for token integrity
   */
  private generateChecksum(data: Buffer): Buffer {
    return crypto.createHmac('sha256', this.secretKey).update(data).digest();
  }

  /**
   * Generates a new secret key for token generation
   */
  static generateSecretKey(keyLength: number = 64): string {
    return crypto.randomBytes(keyLength).toString('hex');
  }

  /**
   * Validates that a secret key has the correct format and length
   */
  static validateSecretKey(key: string, minLength: number = 64): boolean {
    try {
      const buffer = Buffer.from(key, 'hex');
      return buffer.length >= minLength / 2 && /^[0-9a-fA-F]+$/.test(key);
    } catch {
      return false;
    }
  }
}

/**
 * Utility functions for token operations
 */
export class TokenUtils {
  /**
   * Creates a token generator with environment-based secret key
   */
  static createTokenGenerator(): Result<TokenGenerator, Error> {
    const secretKey = process.env.TOKEN_SECRET_KEY;
    
    if (!secretKey) {
      return Result.failure(new Error('TOKEN_SECRET_KEY environment variable is required'));
    }

    if (!TokenGenerator.validateSecretKey(secretKey)) {
      return Result.failure(new Error('Invalid TOKEN_SECRET_KEY format or length'));
    }

    try {
      const generator = new TokenGenerator(secretKey);
      return Result.success(generator);
    } catch (error) {
      return Result.failure(new Error(`Failed to create token generator: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Generates a secure session token
   */
  static generateSessionToken(userId: string, metadata?: Record<string, any>): Result<GeneratedToken, Error> {
    const generatorResult = TokenUtils.createTokenGenerator();
    if (generatorResult.isFailure()) {
      return Result.failure(generatorResult.error);
    }

    const tokenMetadata = { userId, ...metadata };
    return generatorResult.value.generateToken(TokenType.SESSION, tokenMetadata);
  }

  /**
   * Generates an email verification token
   */
  static generateEmailVerificationToken(email: string, userId: string): Result<GeneratedToken, Error> {
    const generatorResult = TokenUtils.createTokenGenerator();
    if (generatorResult.isFailure()) {
      return Result.failure(generatorResult.error);
    }

    const metadata = { email, userId, purpose: 'email_verification' };
    return generatorResult.value.generateToken(TokenType.EMAIL_VERIFICATION, metadata);
  }

  /**
   * Generates a password reset token
   */
  static generatePasswordResetToken(email: string, userId: string): Result<GeneratedToken, Error> {
    const generatorResult = TokenUtils.createTokenGenerator();
    if (generatorResult.isFailure()) {
      return Result.failure(generatorResult.error);
    }

    const metadata = { email, userId, purpose: 'password_reset' };
    return generatorResult.value.generateToken(TokenType.PASSWORD_RESET, metadata);
  }

  /**
   * Generates a 2FA code
   */
  static generate2FACode(): Result<GeneratedToken, Error> {
    const generatorResult = TokenUtils.createTokenGenerator();
    if (generatorResult.isFailure()) {
      return Result.failure(generatorResult.error);
    }

    return generatorResult.value.generateToken(TokenType.TWO_FACTOR);
  }

  /**
   * Generates a CSRF token
   */
  static generateCSRFToken(sessionId: string): Result<GeneratedToken, Error> {
    const generatorResult = TokenUtils.createTokenGenerator();
    if (generatorResult.isFailure()) {
      return Result.failure(generatorResult.error);
    }

    const metadata = { sessionId, purpose: 'csrf_protection' };
    return generatorResult.value.generateToken(TokenType.CSRF, metadata);
  }

  /**
   * Validates any token type
   */
  static validateToken(token: string, type: TokenType): Result<TokenValidation, Error> {
    const generatorResult = TokenUtils.createTokenGenerator();
    if (generatorResult.isFailure()) {
      return Result.failure(generatorResult.error);
    }

    return generatorResult.value.validateToken(token, type);
  }
}