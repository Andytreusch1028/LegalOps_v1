import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Result } from '../types/result';

/**
 * Password strength requirements
 */
export interface PasswordRequirements {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  minSpecialChars: number;
  forbiddenPatterns: string[];
  forbiddenWords: string[];
}

/**
 * Default password requirements (enterprise-grade)
 */
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  minSpecialChars: 1,
  forbiddenPatterns: [
    'password', '123456', 'qwerty', 'admin', 'user', 'login',
    'welcome', 'letmein', 'monkey', 'dragon', 'master'
  ],
  forbiddenWords: [
    'legalops', 'company', 'system', 'database'
  ]
};

/**
 * Password strength levels
 */
export enum PasswordStrength {
  VERY_WEAK = 0,
  WEAK = 1,
  FAIR = 2,
  GOOD = 3,
  STRONG = 4,
  VERY_STRONG = 5
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrength;
  score: number;
  errors: string[];
  suggestions: string[];
  estimatedCrackTime: string;
}

/**
 * Password hash configuration
 */
export interface HashConfig {
  algorithm: 'bcrypt' | 'scrypt' | 'argon2';
  saltRounds?: number; // For bcrypt
  keyLength?: number;  // For scrypt/argon2
  blockSize?: number;  // For scrypt
  parallelization?: number; // For scrypt
  memoryCost?: number; // For argon2
  timeCost?: number;   // For argon2
}

/**
 * Default hash configuration (bcrypt with 14 rounds for high security)
 */
export const DEFAULT_HASH_CONFIG: HashConfig = {
  algorithm: 'bcrypt',
  saltRounds: 14
};

/**
 * Secure password hashing service
 */
export class PasswordHasher {
  private config: HashConfig;

  constructor(config: HashConfig = DEFAULT_HASH_CONFIG) {
    this.config = config;
  }

  /**
   * Hashes a password using the configured algorithm
   */
  async hashPassword(password: string): Promise<Result<string, Error>> {
    try {
      if (!password || typeof password !== 'string') {
        return Result.failure(new Error('Password must be a non-empty string'));
      }

      switch (this.config.algorithm) {
        case 'bcrypt':
          return await this.hashWithBcrypt(password);
        case 'scrypt':
          return await this.hashWithScrypt(password);
        case 'argon2':
          return await this.hashWithArgon2(password);
        default:
          return Result.failure(new Error(`Unsupported hashing algorithm: ${this.config.algorithm}`));
      }
    } catch (error) {
      return Result.failure(new Error(`Password hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Verifies a password against its hash
   */
  async verifyPassword(password: string, hash: string): Promise<Result<boolean, Error>> {
    try {
      if (!password || !hash) {
        return Result.failure(new Error('Password and hash are required'));
      }

      // Detect algorithm from hash format
      const algorithm = this.detectHashAlgorithm(hash);
      
      switch (algorithm) {
        case 'bcrypt':
          return await this.verifyWithBcrypt(password, hash);
        case 'scrypt':
          return await this.verifyWithScrypt(password, hash);
        case 'argon2':
          return await this.verifyWithArgon2(password, hash);
        default:
          return Result.failure(new Error('Unable to detect hash algorithm'));
      }
    } catch (error) {
      return Result.failure(new Error(`Password verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Checks if a password hash needs to be rehashed (e.g., due to updated security requirements)
   */
  needsRehash(hash: string): boolean {
    try {
      const algorithm = this.detectHashAlgorithm(hash);
      
      if (algorithm !== this.config.algorithm) {
        return true;
      }

      if (algorithm === 'bcrypt') {
        const rounds = this.extractBcryptRounds(hash);
        return rounds < (this.config.saltRounds || 12);
      }

      // For other algorithms, we'd need to parse their parameters
      // For now, assume they need rehashing if they're not bcrypt
      return algorithm !== 'bcrypt';
    } catch {
      return true; // If we can't parse it, assume it needs rehashing
    }
  }

  /**
   * Hashes password with bcrypt
   */
  private async hashWithBcrypt(password: string): Promise<Result<string, Error>> {
    try {
      const saltRounds = this.config.saltRounds || 12;
      const hash = await bcrypt.hash(password, saltRounds);
      return Result.success(hash);
    } catch (error) {
      return Result.failure(new Error(`Bcrypt hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Verifies password with bcrypt
   */
  private async verifyWithBcrypt(password: string, hash: string): Promise<Result<boolean, Error>> {
    try {
      const isValid = await bcrypt.compare(password, hash);
      return Result.success(isValid);
    } catch (error) {
      return Result.failure(new Error(`Bcrypt verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Hashes password with scrypt (Node.js built-in)
   */
  private async hashWithScrypt(password: string): Promise<Result<string, Error>> {
    return new Promise((resolve) => {
      try {
        const salt = crypto.randomBytes(32);
        const keyLength = this.config.keyLength || 64;
        
        crypto.scrypt(password, salt, keyLength, (err, derivedKey) => {
          if (err) {
            resolve(Result.failure(new Error(`Scrypt hashing failed: ${err.message}`)));
            return;
          }
          
          const hash = `scrypt:${salt.toString('hex')}:${derivedKey.toString('hex')}`;
          resolve(Result.success(hash));
        });
      } catch (error) {
        resolve(Result.failure(new Error(`Scrypt hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)));
      }
    });
  }

  /**
   * Verifies password with scrypt
   */
  private async verifyWithScrypt(password: string, hash: string): Promise<Result<boolean, Error>> {
    return new Promise((resolve) => {
      try {
        const parts = hash.split(':');
        if (parts.length !== 3 || parts[0] !== 'scrypt') {
          resolve(Result.failure(new Error('Invalid scrypt hash format')));
          return;
        }

        const salt = Buffer.from(parts[1], 'hex');
        const storedKey = Buffer.from(parts[2], 'hex');
        const keyLength = storedKey.length;

        crypto.scrypt(password, salt, keyLength, (err, derivedKey) => {
          if (err) {
            resolve(Result.failure(new Error(`Scrypt verification failed: ${err.message}`)));
            return;
          }

          const isValid = crypto.timingSafeEqual(storedKey, derivedKey);
          resolve(Result.success(isValid));
        });
      } catch (error) {
        resolve(Result.failure(new Error(`Scrypt verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)));
      }
    });
  }

  /**
   * Placeholder for Argon2 (would require external library)
   */
  private async hashWithArgon2(password: string): Promise<Result<string, Error>> {
    return Result.failure(new Error('Argon2 support requires additional library installation'));
  }

  /**
   * Placeholder for Argon2 verification
   */
  private async verifyWithArgon2(password: string, hash: string): Promise<Result<boolean, Error>> {
    return Result.failure(new Error('Argon2 support requires additional library installation'));
  }

  /**
   * Detects the hashing algorithm from hash format
   */
  private detectHashAlgorithm(hash: string): string {
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return 'bcrypt';
    }
    if (hash.startsWith('scrypt:')) {
      return 'scrypt';
    }
    if (hash.startsWith('$argon2')) {
      return 'argon2';
    }
    return 'unknown';
  }

  /**
   * Extracts bcrypt rounds from hash
   */
  private extractBcryptRounds(hash: string): number {
    const match = hash.match(/^\$2[aby]\$(\d+)\$/);
    return match ? parseInt(match[1], 10) : 0;
  }
}

/**
 * Password validation service
 */
export class PasswordValidator {
  private requirements: PasswordRequirements;

  constructor(requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS) {
    this.requirements = requirements;
  }

  /**
   * Validates a password against security requirements
   */
  validatePassword(password: string, userInfo?: { email?: string; name?: string }): PasswordValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Basic length check
    if (password.length < this.requirements.minLength) {
      errors.push(`Password must be at least ${this.requirements.minLength} characters long`);
    } else {
      score += 1;
    }

    if (password.length > this.requirements.maxLength) {
      errors.push(`Password must not exceed ${this.requirements.maxLength} characters`);
    }

    // Character requirements
    if (this.requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
      suggestions.push('Add uppercase letters (A-Z)');
    } else if (this.requirements.requireUppercase) {
      score += 1;
    }

    if (this.requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
      suggestions.push('Add lowercase letters (a-z)');
    } else if (this.requirements.requireLowercase) {
      score += 1;
    }

    if (this.requirements.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
      suggestions.push('Add numbers (0-9)');
    } else if (this.requirements.requireNumbers) {
      score += 1;
    }

    if (this.requirements.requireSpecialChars) {
      const specialChars = (password.match(/[^a-zA-Z0-9]/g) || []).length;
      if (specialChars < this.requirements.minSpecialChars) {
        errors.push(`Password must contain at least ${this.requirements.minSpecialChars} special character(s)`);
        suggestions.push('Add special characters (!@#$%^&*)');
      } else {
        score += 1;
      }
    }

    // Check for forbidden patterns
    const lowerPassword = password.toLowerCase();
    for (const pattern of this.requirements.forbiddenPatterns) {
      if (lowerPassword.includes(pattern.toLowerCase())) {
        errors.push(`Password cannot contain common patterns like "${pattern}"`);
        suggestions.push('Avoid common words and patterns');
        break;
      }
    }

    // Check for forbidden words
    for (const word of this.requirements.forbiddenWords) {
      if (lowerPassword.includes(word.toLowerCase())) {
        errors.push(`Password cannot contain "${word}"`);
        suggestions.push('Avoid company or system-related words');
        break;
      }
    }

    // Check against user info
    if (userInfo) {
      if (userInfo.email && lowerPassword.includes(userInfo.email.split('@')[0].toLowerCase())) {
        errors.push('Password cannot contain parts of your email address');
        suggestions.push('Use a password unrelated to your email');
      }
      
      if (userInfo.name && lowerPassword.includes(userInfo.name.toLowerCase())) {
        errors.push('Password cannot contain your name');
        suggestions.push('Use a password unrelated to your personal information');
      }
    }

    // Advanced strength checks
    score += this.calculateComplexityScore(password);

    // Determine strength level
    const strength = this.calculateStrength(score, errors.length);
    
    // Estimate crack time
    const estimatedCrackTime = this.estimateCrackTime(password, strength);

    // Add suggestions based on strength
    if (strength < PasswordStrength.GOOD) {
      suggestions.push('Consider using a passphrase with multiple words');
      suggestions.push('Mix different types of characters');
      suggestions.push('Make your password longer for better security');
    }

    return {
      isValid: errors.length === 0,
      strength,
      score,
      errors,
      suggestions,
      estimatedCrackTime
    };
  }

  /**
   * Calculates complexity score based on entropy and patterns
   */
  private calculateComplexityScore(password: string): number {
    let score = 0;

    // Length bonus
    if (password.length >= 16) score += 2;
    else if (password.length >= 12) score += 1;

    // Character diversity
    const charSets = [
      /[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/
    ];
    const usedSets = charSets.filter(set => set.test(password)).length;
    score += usedSets;

    // Avoid repeated characters
    const repeatedChars = password.match(/(.)\1{2,}/g);
    if (!repeatedChars) score += 1;

    // Avoid sequential patterns
    const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
    if (!hasSequential) score += 1;

    // Keyboard patterns
    const keyboardPatterns = /(?:qwer|wert|erty|rtyu|tyui|yuio|uiop|asdf|sdfg|dfgh|fghj|ghjk|hjkl|zxcv|xcvb|cvbn|vbnm)/i.test(password);
    if (!keyboardPatterns) score += 1;

    return Math.min(score, 5); // Cap at 5 additional points
  }

  /**
   * Calculates overall password strength
   */
  private calculateStrength(score: number, errorCount: number): PasswordStrength {
    if (errorCount > 0) {
      return PasswordStrength.VERY_WEAK;
    }

    if (score >= 10) return PasswordStrength.VERY_STRONG;
    if (score >= 8) return PasswordStrength.STRONG;
    if (score >= 6) return PasswordStrength.GOOD;
    if (score >= 4) return PasswordStrength.FAIR;
    if (score >= 2) return PasswordStrength.WEAK;
    
    return PasswordStrength.VERY_WEAK;
  }

  /**
   * Estimates time to crack password
   */
  private estimateCrackTime(password: string, strength: PasswordStrength): string {
    const charSets = [
      { pattern: /[a-z]/, size: 26 },
      { pattern: /[A-Z]/, size: 26 },
      { pattern: /\d/, size: 10 },
      { pattern: /[^a-zA-Z0-9]/, size: 32 }
    ];

    let charsetSize = 0;
    for (const charset of charSets) {
      if (charset.pattern.test(password)) {
        charsetSize += charset.size;
      }
    }

    const entropy = Math.log2(Math.pow(charsetSize, password.length));
    const guessesPerSecond = 1000000000; // 1 billion guesses per second (modern hardware)
    const secondsToCrack = Math.pow(2, entropy - 1) / guessesPerSecond;

    if (secondsToCrack < 60) return 'Less than 1 minute';
    if (secondsToCrack < 3600) return `${Math.ceil(secondsToCrack / 60)} minutes`;
    if (secondsToCrack < 86400) return `${Math.ceil(secondsToCrack / 3600)} hours`;
    if (secondsToCrack < 31536000) return `${Math.ceil(secondsToCrack / 86400)} days`;
    if (secondsToCrack < 31536000000) return `${Math.ceil(secondsToCrack / 31536000)} years`;
    
    return 'Centuries or more';
  }
}

/**
 * Utility functions for password operations
 */
export class PasswordUtils {
  private static defaultHasher = new PasswordHasher();
  private static defaultValidator = new PasswordValidator();

  /**
   * Hashes a password with default configuration
   */
  static async hashPassword(password: string): Promise<Result<string, Error>> {
    return PasswordUtils.defaultHasher.hashPassword(password);
  }

  /**
   * Verifies a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<Result<boolean, Error>> {
    return PasswordUtils.defaultHasher.verifyPassword(password, hash);
  }

  /**
   * Validates a password with default requirements
   */
  static validatePassword(password: string, userInfo?: { email?: string; name?: string }): PasswordValidationResult {
    return PasswordUtils.defaultValidator.validatePassword(password, userInfo);
  }

  /**
   * Generates a secure random password
   */
  static generateSecurePassword(length: number = 16, includeSymbols: boolean = true): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = includeSymbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';

    // Ensure at least one character from each required set
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    if (includeSymbols) {
      password += symbols[crypto.randomInt(0, symbols.length)];
    }

    // Fill the rest randomly
    const remainingLength = length - password.length;
    for (let i = 0; i < remainingLength; i++) {
      password += allChars[crypto.randomInt(0, allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => crypto.randomInt(0, 3) - 1).join('');
  }

  /**
   * Checks if a password hash needs rehashing
   */
  static needsRehash(hash: string): boolean {
    return PasswordUtils.defaultHasher.needsRehash(hash);
  }

  /**
   * Creates a custom password hasher
   */
  static createHasher(config: HashConfig): PasswordHasher {
    return new PasswordHasher(config);
  }

  /**
   * Creates a custom password validator
   */
  static createValidator(requirements: PasswordRequirements): PasswordValidator {
    return new PasswordValidator(requirements);
  }
}