/**
 * Security utilities for the LegalOps platform
 * 
 * This module provides comprehensive security utilities including:
 * - Field-level encryption for sensitive data
 * - Secure token generation and validation
 * - Data masking for PII protection in logs
 * - Enhanced password hashing and validation
 * - Encryption key management system
 */

// Field-level encryption
export {
  FieldEncryption,
  EncryptionUtils,
  DEFAULT_ENCRYPTION_CONFIG,
  type EncryptionConfig,
  type EncryptedData
} from './encryption';

// Token generation and validation
export {
  TokenGenerator,
  TokenUtils,
  TokenType,
  TOKEN_CONFIGS,
  type TokenConfig,
  type GeneratedToken,
  type TokenValidation
} from './token-generation';

// Data masking for PII protection
export {
  DataMasker,
  MaskingUtils,
  MaskingStrategy,
  DEFAULT_MASKING_CONFIGS,
  PII_PATTERNS,
  PII_FIELD_NAMES,
  type MaskingConfig
} from './data-masking';

// Password hashing and validation
export {
  PasswordHasher,
  PasswordValidator,
  PasswordUtils,
  PasswordStrength,
  DEFAULT_PASSWORD_REQUIREMENTS,
  DEFAULT_HASH_CONFIG,
  type PasswordRequirements,
  type PasswordValidationResult,
  type HashConfig
} from './password-hashing';

// Key management
export {
  KeyManager,
  KeyManagementUtils,
  InMemoryKeyStorage,
  EnvironmentKeyStorage,
  KeyType,
  DEFAULT_ROTATION_POLICIES,
  type KeyStorage,
  type KeyMetadata,
  type ManagedKey,
  type KeyRotationPolicy,
  type KeyDerivationConfig
} from './key-management';

/**
 * Security configuration interface for the entire security module
 */
export interface SecurityConfig {
  encryption?: {
    masterKey?: string;
    algorithm?: string;
    keyLength?: number;
  };
  tokens?: {
    secretKey?: string;
    defaultExpiration?: number;
  };
  passwords?: {
    minLength?: number;
    saltRounds?: number;
    requireComplexity?: boolean;
  };
  masking?: {
    autoDetectPII?: boolean;
    maskChar?: string;
    preserveLength?: boolean;
  };
  keyManagement?: {
    storage?: 'environment' | 'memory' | 'custom';
    autoRotation?: boolean;
    rotationInterval?: number;
  };
}

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32
  },
  tokens: {
    defaultExpiration: 24 * 60 * 60 * 1000 // 24 hours
  },
  passwords: {
    minLength: 12,
    saltRounds: 14,
    requireComplexity: true
  },
  masking: {
    autoDetectPII: true,
    maskChar: '*',
    preserveLength: true
  },
  keyManagement: {
    storage: 'environment',
    autoRotation: true,
    rotationInterval: 90 * 24 * 60 * 60 * 1000 // 90 days
  }
};

/**
 * Security utilities factory for creating configured instances
 */
export class SecurityFactory {
  private config: SecurityConfig;

  constructor(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
  }

  /**
   * Creates a configured field encryption instance
   */
  createFieldEncryption(): Result<FieldEncryption, Error> {
    return EncryptionUtils.createFieldEncryption();
  }

  /**
   * Creates a configured token generator
   */
  createTokenGenerator(): Result<TokenGenerator, Error> {
    return TokenUtils.createTokenGenerator();
  }

  /**
   * Creates a configured data masker
   */
  createDataMasker(): DataMasker {
    return new DataMasker(this.config.masking?.autoDetectPII ?? true);
  }

  /**
   * Creates a configured password hasher
   */
  createPasswordHasher(): PasswordHasher {
    const hashConfig: HashConfig = {
      algorithm: 'bcrypt',
      saltRounds: this.config.passwords?.saltRounds ?? 14
    };
    return new PasswordHasher(hashConfig);
  }

  /**
   * Creates a configured password validator
   */
  createPasswordValidator(): PasswordValidator {
    const requirements: PasswordRequirements = {
      ...DEFAULT_PASSWORD_REQUIREMENTS,
      minLength: this.config.passwords?.minLength ?? 12
    };
    return new PasswordValidator(requirements);
  }

  /**
   * Creates a configured key manager
   */
  createKeyManager(): KeyManager {
    const storageType = this.config.keyManagement?.storage ?? 'environment';
    
    let storage: KeyStorage;
    switch (storageType) {
      case 'memory':
        storage = new InMemoryKeyStorage();
        break;
      case 'environment':
      default:
        storage = new EnvironmentKeyStorage();
        break;
    }

    return new KeyManager(storage);
  }

  /**
   * Updates the security configuration
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets the current security configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

/**
 * Default security factory instance
 */
export const defaultSecurityFactory = new SecurityFactory();

/**
 * Convenience functions using the default factory
 */
export const createFieldEncryption = () => defaultSecurityFactory.createFieldEncryption();
export const createTokenGenerator = () => defaultSecurityFactory.createTokenGenerator();
export const createDataMasker = () => defaultSecurityFactory.createDataMasker();
export const createPasswordHasher = () => defaultSecurityFactory.createPasswordHasher();
export const createPasswordValidator = () => defaultSecurityFactory.createPasswordValidator();
export const createKeyManager = () => defaultSecurityFactory.createKeyManager();

// Re-export Result type for convenience
export { Result } from '../types/result';