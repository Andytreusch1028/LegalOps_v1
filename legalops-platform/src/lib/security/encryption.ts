import crypto from 'crypto';
import { Result } from '../types/result';

/**
 * Configuration for encryption operations
 */
export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
  saltLength: number;
}

/**
 * Default encryption configuration using AES-256-GCM
 */
export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32, // 256 bits
  ivLength: 16,  // 128 bits
  tagLength: 16, // 128 bits
  saltLength: 32 // 256 bits
};

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  data: string;
  iv: string;
  tag: string;
  salt: string;
}

/**
 * Field-level encryption service for sensitive profile data
 */
export class FieldEncryption {
  private config: EncryptionConfig;
  private masterKey: Buffer;

  constructor(masterKey: string, config: EncryptionConfig = DEFAULT_ENCRYPTION_CONFIG) {
    this.config = config;
    this.masterKey = Buffer.from(masterKey, 'hex');
    
    if (this.masterKey.length !== config.keyLength) {
      throw new Error(`Master key must be ${config.keyLength} bytes (${config.keyLength * 2} hex characters)`);
    }
  }

  /**
   * Derives an encryption key from the master key and salt
   */
  private deriveKey(salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(this.masterKey, salt, 100000, this.config.keyLength, 'sha256');
  }

  /**
   * Encrypts a string value using AES-256-GCM
   */
  encrypt(plaintext: string): Result<EncryptedData, Error> {
    try {
      if (!plaintext || typeof plaintext !== 'string') {
        return Result.failure(new Error('Invalid plaintext: must be a non-empty string'));
      }

      // Generate random salt and IV
      const salt = crypto.randomBytes(this.config.saltLength);
      const iv = crypto.randomBytes(this.config.ivLength);
      
      // Derive encryption key from master key and salt
      const key = this.deriveKey(salt);
      
      // Create cipher
      const cipher = crypto.createCipher(this.config.algorithm, key);
      cipher.setAAD(salt); // Use salt as additional authenticated data
      
      // Encrypt the data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();

      const result: EncryptedData = {
        data: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        salt: salt.toString('hex')
      };

      return Result.success(result);
    } catch (error) {
      return Result.failure(new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Decrypts an encrypted value
   */
  decrypt(encryptedData: EncryptedData): Result<string, Error> {
    try {
      if (!encryptedData || !encryptedData.data || !encryptedData.iv || !encryptedData.tag || !encryptedData.salt) {
        return Result.failure(new Error('Invalid encrypted data: missing required fields'));
      }

      // Convert hex strings back to buffers
      const salt = Buffer.from(encryptedData.salt, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      
      // Derive the same key used for encryption
      const key = this.deriveKey(salt);
      
      // Create decipher
      const decipher = crypto.createDecipher(this.config.algorithm, key);
      decipher.setAuthTag(tag);
      decipher.setAAD(salt);
      
      // Decrypt the data
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return Result.success(decrypted);
    } catch (error) {
      return Result.failure(new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Encrypts multiple fields in an object
   */
  encryptFields<T extends Record<string, any>>(
    data: T, 
    fieldsToEncrypt: (keyof T)[]
  ): Result<T & { _encrypted: Record<string, EncryptedData> }, Error> {
    try {
      const result = { ...data } as T & { _encrypted: Record<string, EncryptedData> };
      result._encrypted = {};

      for (const field of fieldsToEncrypt) {
        const value = data[field];
        if (value !== null && value !== undefined) {
          const encryptResult = this.encrypt(String(value));
          if (encryptResult.isFailure()) {
            return Result.failure(new Error(`Failed to encrypt field ${String(field)}: ${encryptResult.error.message}`));
          }
          
          result._encrypted[String(field)] = encryptResult.value;
          // Remove the plaintext field
          delete result[field];
        }
      }

      return Result.success(result);
    } catch (error) {
      return Result.failure(new Error(`Field encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Decrypts multiple fields in an object
   */
  decryptFields<T extends Record<string, any>>(
    data: T & { _encrypted?: Record<string, EncryptedData> }, 
    fieldsToDecrypt: string[]
  ): Result<T, Error> {
    try {
      const result = { ...data } as T;
      
      if (data._encrypted) {
        for (const field of fieldsToDecrypt) {
          const encryptedValue = data._encrypted[field];
          if (encryptedValue) {
            const decryptResult = this.decrypt(encryptedValue);
            if (decryptResult.isFailure()) {
              return Result.failure(new Error(`Failed to decrypt field ${field}: ${decryptResult.error.message}`));
            }
            
            (result as any)[field] = decryptResult.value;
          }
        }
        
        // Remove the encrypted data object
        delete (result as any)._encrypted;
      }

      return Result.success(result);
    } catch (error) {
      return Result.failure(new Error(`Field decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Generates a new master key for encryption
   */
  static generateMasterKey(keyLength: number = DEFAULT_ENCRYPTION_CONFIG.keyLength): string {
    return crypto.randomBytes(keyLength).toString('hex');
  }

  /**
   * Validates that a master key has the correct format and length
   */
  static validateMasterKey(key: string, keyLength: number = DEFAULT_ENCRYPTION_CONFIG.keyLength): boolean {
    try {
      const buffer = Buffer.from(key, 'hex');
      return buffer.length === keyLength && /^[0-9a-fA-F]+$/.test(key);
    } catch {
      return false;
    }
  }
}

/**
 * Utility functions for common encryption operations
 */
export class EncryptionUtils {
  /**
   * Creates a field encryption instance with environment-based master key
   */
  static createFieldEncryption(): Result<FieldEncryption, Error> {
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    
    if (!masterKey) {
      return Result.failure(new Error('ENCRYPTION_MASTER_KEY environment variable is required'));
    }

    if (!FieldEncryption.validateMasterKey(masterKey)) {
      return Result.failure(new Error('Invalid ENCRYPTION_MASTER_KEY format or length'));
    }

    try {
      const encryption = new FieldEncryption(masterKey);
      return Result.success(encryption);
    } catch (error) {
      return Result.failure(new Error(`Failed to create field encryption: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Encrypts sensitive profile fields
   */
  static async encryptProfileData(profileData: any): Promise<Result<any, Error>> {
    const encryptionResult = EncryptionUtils.createFieldEncryption();
    if (encryptionResult.isFailure()) {
      return Result.failure(encryptionResult.error);
    }

    const encryption = encryptionResult.value;
    const sensitiveFields = [
      'ssn', 'taxId', 'driversLicense', 'passport', 
      'bankAccount', 'creditCard', 'dateOfBirth'
    ];

    return encryption.encryptFields(profileData, sensitiveFields);
  }

  /**
   * Decrypts sensitive profile fields
   */
  static async decryptProfileData(encryptedProfileData: any): Promise<Result<any, Error>> {
    const encryptionResult = EncryptionUtils.createFieldEncryption();
    if (encryptionResult.isFailure()) {
      return Result.failure(encryptionResult.error);
    }

    const encryption = encryptionResult.value;
    const sensitiveFields = [
      'ssn', 'taxId', 'driversLicense', 'passport', 
      'bankAccount', 'creditCard', 'dateOfBirth'
    ];

    return encryption.decryptFields(encryptedProfileData, sensitiveFields);
  }
}