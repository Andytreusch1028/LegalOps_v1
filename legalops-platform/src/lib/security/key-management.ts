import crypto from 'crypto';
import { Result } from '../types/result';

/**
 * Key types for different purposes
 */
export enum KeyType {
  ENCRYPTION = 'encryption',
  SIGNING = 'signing',
  HMAC = 'hmac',
  TOKEN = 'token',
  SESSION = 'session'
}

/**
 * Key rotation policy
 */
export interface KeyRotationPolicy {
  rotationIntervalMs: number;
  maxKeyAge: number;
  gracePeriodMs: number;
  autoRotate: boolean;
}

/**
 * Key metadata
 */
export interface KeyMetadata {
  id: string;
  type: KeyType;
  algorithm: string;
  keyLength: number;
  createdAt: Date;
  expiresAt?: Date;
  rotatedAt?: Date;
  isActive: boolean;
  version: number;
  purpose: string;
}

/**
 * Managed encryption key
 */
export interface ManagedKey {
  metadata: KeyMetadata;
  key: Buffer;
  derivedKeys?: Map<string, Buffer>;
}

/**
 * Key derivation configuration
 */
export interface KeyDerivationConfig {
  algorithm: 'pbkdf2' | 'hkdf' | 'scrypt';
  iterations?: number;
  keyLength: number;
  salt?: Buffer;
  info?: Buffer; // For HKDF
}

/**
 * Default key rotation policies
 */
export const DEFAULT_ROTATION_POLICIES: Record<KeyType, KeyRotationPolicy> = {
  [KeyType.ENCRYPTION]: {
    rotationIntervalMs: 90 * 24 * 60 * 60 * 1000, // 90 days
    maxKeyAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    gracePeriodMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    autoRotate: true
  },
  [KeyType.SIGNING]: {
    rotationIntervalMs: 180 * 24 * 60 * 60 * 1000, // 180 days
    maxKeyAge: 730 * 24 * 60 * 60 * 1000, // 2 years
    gracePeriodMs: 60 * 24 * 60 * 60 * 1000, // 60 days
    autoRotate: true
  },
  [KeyType.HMAC]: {
    rotationIntervalMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxKeyAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    gracePeriodMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    autoRotate: true
  },
  [KeyType.TOKEN]: {
    rotationIntervalMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxKeyAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    gracePeriodMs: 24 * 60 * 60 * 1000, // 1 day
    autoRotate: true
  },
  [KeyType.SESSION]: {
    rotationIntervalMs: 24 * 60 * 60 * 1000, // 1 day
    maxKeyAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    gracePeriodMs: 2 * 60 * 60 * 1000, // 2 hours
    autoRotate: true
  }
};

/**
 * Key storage interface for different backends
 */
export interface KeyStorage {
  storeKey(keyId: string, keyData: string, metadata: KeyMetadata): Promise<Result<void, Error>>;
  retrieveKey(keyId: string): Promise<Result<{ keyData: string; metadata: KeyMetadata } | null, Error>>;
  listKeys(type?: KeyType): Promise<Result<KeyMetadata[], Error>>;
  deleteKey(keyId: string): Promise<Result<void, Error>>;
  updateMetadata(keyId: string, metadata: Partial<KeyMetadata>): Promise<Result<void, Error>>;
}

/**
 * In-memory key storage (for development/testing)
 */
export class InMemoryKeyStorage implements KeyStorage {
  private keys = new Map<string, { keyData: string; metadata: KeyMetadata }>();

  async storeKey(keyId: string, keyData: string, metadata: KeyMetadata): Promise<Result<void, Error>> {
    try {
      this.keys.set(keyId, { keyData, metadata });
      return Result.success(undefined);
    } catch (error) {
      return Result.failure(new Error(`Failed to store key: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async retrieveKey(keyId: string): Promise<Result<{ keyData: string; metadata: KeyMetadata } | null, Error>> {
    try {
      const key = this.keys.get(keyId) || null;
      return Result.success(key);
    } catch (error) {
      return Result.failure(new Error(`Failed to retrieve key: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async listKeys(type?: KeyType): Promise<Result<KeyMetadata[], Error>> {
    try {
      const keys = Array.from(this.keys.values())
        .map(k => k.metadata)
        .filter(metadata => !type || metadata.type === type);
      return Result.success(keys);
    } catch (error) {
      return Result.failure(new Error(`Failed to list keys: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async deleteKey(keyId: string): Promise<Result<void, Error>> {
    try {
      this.keys.delete(keyId);
      return Result.success(undefined);
    } catch (error) {
      return Result.failure(new Error(`Failed to delete key: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async updateMetadata(keyId: string, metadata: Partial<KeyMetadata>): Promise<Result<void, Error>> {
    try {
      const existing = this.keys.get(keyId);
      if (!existing) {
        return Result.failure(new Error('Key not found'));
      }
      
      existing.metadata = { ...existing.metadata, ...metadata };
      return Result.success(undefined);
    } catch (error) {
      return Result.failure(new Error(`Failed to update metadata: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }
}

/**
 * Environment-based key storage (uses environment variables)
 */
export class EnvironmentKeyStorage implements KeyStorage {
  private keyPrefix: string;

  constructor(keyPrefix: string = 'LEGALOPS_KEY_') {
    this.keyPrefix = keyPrefix;
  }

  async storeKey(keyId: string, keyData: string, metadata: KeyMetadata): Promise<Result<void, Error>> {
    // Environment storage is read-only in runtime
    return Result.failure(new Error('Environment key storage is read-only'));
  }

  async retrieveKey(keyId: string): Promise<Result<{ keyData: string; metadata: KeyMetadata } | null, Error>> {
    try {
      const envKey = `${this.keyPrefix}${keyId.toUpperCase()}`;
      const keyData = process.env[envKey];
      
      if (!keyData) {
        return Result.success(null);
      }

      // Create basic metadata for environment keys
      const metadata: KeyMetadata = {
        id: keyId,
        type: this.inferKeyType(keyId),
        algorithm: 'aes-256-gcm',
        keyLength: Buffer.from(keyData, 'hex').length,
        createdAt: new Date(), // Unknown, use current time
        isActive: true,
        version: 1,
        purpose: 'Environment-managed key'
      };

      return Result.success({ keyData, metadata });
    } catch (error) {
      return Result.failure(new Error(`Failed to retrieve environment key: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async listKeys(type?: KeyType): Promise<Result<KeyMetadata[], Error>> {
    try {
      const keys: KeyMetadata[] = [];
      
      for (const [envVar, value] of Object.entries(process.env)) {
        if (envVar.startsWith(this.keyPrefix) && value) {
          const keyId = envVar.substring(this.keyPrefix.length).toLowerCase();
          const keyType = this.inferKeyType(keyId);
          
          if (!type || keyType === type) {
            keys.push({
              id: keyId,
              type: keyType,
              algorithm: 'aes-256-gcm',
              keyLength: Buffer.from(value, 'hex').length,
              createdAt: new Date(),
              isActive: true,
              version: 1,
              purpose: 'Environment-managed key'
            });
          }
        }
      }
      
      return Result.success(keys);
    } catch (error) {
      return Result.failure(new Error(`Failed to list environment keys: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async deleteKey(keyId: string): Promise<Result<void, Error>> {
    return Result.failure(new Error('Cannot delete environment keys'));
  }

  async updateMetadata(keyId: string, metadata: Partial<KeyMetadata>): Promise<Result<void, Error>> {
    return Result.failure(new Error('Cannot update environment key metadata'));
  }

  private inferKeyType(keyId: string): KeyType {
    const id = keyId.toLowerCase();
    if (id.includes('encrypt')) return KeyType.ENCRYPTION;
    if (id.includes('sign')) return KeyType.SIGNING;
    if (id.includes('hmac')) return KeyType.HMAC;
    if (id.includes('token')) return KeyType.TOKEN;
    if (id.includes('session')) return KeyType.SESSION;
    return KeyType.ENCRYPTION; // Default
  }
}

/**
 * Encryption key management service
 */
export class KeyManager {
  private storage: KeyStorage;
  private keyCache = new Map<string, ManagedKey>();
  private rotationPolicies: Map<KeyType, KeyRotationPolicy>;

  constructor(storage: KeyStorage, customPolicies?: Partial<Record<KeyType, KeyRotationPolicy>>) {
    this.storage = storage;
    this.rotationPolicies = new Map();
    
    // Set up rotation policies
    for (const [type, policy] of Object.entries(DEFAULT_ROTATION_POLICIES)) {
      this.rotationPolicies.set(type as KeyType, {
        ...policy,
        ...customPolicies?.[type as KeyType]
      });
    }
  }

  /**
   * Generates a new encryption key
   */
  async generateKey(
    type: KeyType,
    purpose: string,
    keyLength: number = 32,
    algorithm: string = 'aes-256-gcm'
  ): Promise<Result<ManagedKey, Error>> {
    try {
      const keyId = this.generateKeyId(type, purpose);
      const keyBuffer = crypto.randomBytes(keyLength);
      
      const metadata: KeyMetadata = {
        id: keyId,
        type,
        algorithm,
        keyLength,
        createdAt: new Date(),
        isActive: true,
        version: 1,
        purpose
      };

      // Set expiration based on rotation policy
      const policy = this.rotationPolicies.get(type);
      if (policy) {
        metadata.expiresAt = new Date(Date.now() + policy.maxKeyAge);
      }

      const managedKey: ManagedKey = {
        metadata,
        key: keyBuffer,
        derivedKeys: new Map()
      };

      // Store the key
      const storeResult = await this.storage.storeKey(
        keyId,
        keyBuffer.toString('hex'),
        metadata
      );

      if (storeResult.isFailure()) {
        return Result.failure(storeResult.error);
      }

      // Cache the key
      this.keyCache.set(keyId, managedKey);

      return Result.success(managedKey);
    } catch (error) {
      return Result.failure(new Error(`Key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Retrieves a key by ID
   */
  async getKey(keyId: string): Promise<Result<ManagedKey | null, Error>> {
    try {
      // Check cache first
      const cachedKey = this.keyCache.get(keyId);
      if (cachedKey) {
        return Result.success(cachedKey);
      }

      // Retrieve from storage
      const retrieveResult = await this.storage.retrieveKey(keyId);
      if (retrieveResult.isFailure()) {
        return Result.failure(retrieveResult.error);
      }

      const stored = retrieveResult.value;
      if (!stored) {
        return Result.success(null);
      }

      const managedKey: ManagedKey = {
        metadata: stored.metadata,
        key: Buffer.from(stored.keyData, 'hex'),
        derivedKeys: new Map()
      };

      // Cache the key
      this.keyCache.set(keyId, managedKey);

      return Result.success(managedKey);
    } catch (error) {
      return Result.failure(new Error(`Key retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Gets the active key for a specific type and purpose
   */
  async getActiveKey(type: KeyType, purpose: string): Promise<Result<ManagedKey | null, Error>> {
    try {
      const listResult = await this.storage.listKeys(type);
      if (listResult.isFailure()) {
        return Result.failure(listResult.error);
      }

      const keys = listResult.value
        .filter(k => k.purpose === purpose && k.isActive)
        .sort((a, b) => b.version - a.version);

      if (keys.length === 0) {
        return Result.success(null);
      }

      return this.getKey(keys[0].id);
    } catch (error) {
      return Result.failure(new Error(`Active key retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Derives a key from a master key
   */
  async deriveKey(
    masterKeyId: string,
    derivationPurpose: string,
    config: KeyDerivationConfig
  ): Promise<Result<Buffer, Error>> {
    try {
      const masterKeyResult = await this.getKey(masterKeyId);
      if (masterKeyResult.isFailure()) {
        return Result.failure(masterKeyResult.error);
      }

      const masterKey = masterKeyResult.value;
      if (!masterKey) {
        return Result.failure(new Error('Master key not found'));
      }

      // Check if we already have this derived key cached
      const cacheKey = `${derivationPurpose}:${JSON.stringify(config)}`;
      const cachedDerived = masterKey.derivedKeys?.get(cacheKey);
      if (cachedDerived) {
        return Result.success(cachedDerived);
      }

      let derivedKey: Buffer;

      switch (config.algorithm) {
        case 'pbkdf2':
          derivedKey = await this.deriveWithPBKDF2(masterKey.key, config);
          break;
        case 'hkdf':
          derivedKey = this.deriveWithHKDF(masterKey.key, config);
          break;
        case 'scrypt':
          derivedKey = await this.deriveWithScrypt(masterKey.key, config);
          break;
        default:
          return Result.failure(new Error(`Unsupported derivation algorithm: ${config.algorithm}`));
      }

      // Cache the derived key
      if (!masterKey.derivedKeys) {
        masterKey.derivedKeys = new Map();
      }
      masterKey.derivedKeys.set(cacheKey, derivedKey);

      return Result.success(derivedKey);
    } catch (error) {
      return Result.failure(new Error(`Key derivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Rotates a key (creates new version, marks old as inactive)
   */
  async rotateKey(keyId: string): Promise<Result<ManagedKey, Error>> {
    try {
      const oldKeyResult = await this.getKey(keyId);
      if (oldKeyResult.isFailure()) {
        return Result.failure(oldKeyResult.error);
      }

      const oldKey = oldKeyResult.value;
      if (!oldKey) {
        return Result.failure(new Error('Key not found for rotation'));
      }

      // Generate new key with incremented version
      const newKeyResult = await this.generateKey(
        oldKey.metadata.type,
        oldKey.metadata.purpose,
        oldKey.metadata.keyLength,
        oldKey.metadata.algorithm
      );

      if (newKeyResult.isFailure()) {
        return Result.failure(newKeyResult.error);
      }

      const newKey = newKeyResult.value;
      newKey.metadata.version = oldKey.metadata.version + 1;

      // Mark old key as inactive
      const updateResult = await this.storage.updateMetadata(keyId, {
        isActive: false,
        rotatedAt: new Date()
      });

      if (updateResult.isFailure()) {
        return Result.failure(updateResult.error);
      }

      // Update cache
      oldKey.metadata.isActive = false;
      oldKey.metadata.rotatedAt = new Date();

      return Result.success(newKey);
    } catch (error) {
      return Result.failure(new Error(`Key rotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Checks if keys need rotation and rotates them if auto-rotation is enabled
   */
  async checkAndRotateKeys(): Promise<Result<string[], Error>> {
    try {
      const rotatedKeys: string[] = [];
      
      for (const [type, policy] of this.rotationPolicies.entries()) {
        if (!policy.autoRotate) continue;

        const listResult = await this.storage.listKeys(type);
        if (listResult.isFailure()) {
          continue; // Skip this type on error
        }

        const keys = listResult.value.filter(k => k.isActive);
        
        for (const keyMetadata of keys) {
          const age = Date.now() - keyMetadata.createdAt.getTime();
          
          if (age >= policy.rotationIntervalMs) {
            const rotateResult = await this.rotateKey(keyMetadata.id);
            if (rotateResult.isSuccess()) {
              rotatedKeys.push(keyMetadata.id);
            }
          }
        }
      }

      return Result.success(rotatedKeys);
    } catch (error) {
      return Result.failure(new Error(`Key rotation check failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Derives key using PBKDF2
   */
  private async deriveWithPBKDF2(masterKey: Buffer, config: KeyDerivationConfig): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const salt = config.salt || crypto.randomBytes(32);
      const iterations = config.iterations || 100000;
      
      crypto.pbkdf2(masterKey, salt, iterations, config.keyLength, 'sha256', (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
  }

  /**
   * Derives key using HKDF
   */
  private deriveWithHKDF(masterKey: Buffer, config: KeyDerivationConfig): Buffer {
    const salt = config.salt || Buffer.alloc(0);
    const info = config.info || Buffer.alloc(0);
    
    return crypto.hkdfSync('sha256', masterKey, salt, info, config.keyLength);
  }

  /**
   * Derives key using scrypt
   */
  private async deriveWithScrypt(masterKey: Buffer, config: KeyDerivationConfig): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const salt = config.salt || crypto.randomBytes(32);
      
      crypto.scrypt(masterKey, salt, config.keyLength, (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
  }

  /**
   * Generates a unique key ID
   */
  private generateKeyId(type: KeyType, purpose: string): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `${type}_${purpose.replace(/\s+/g, '_').toLowerCase()}_${timestamp}_${random}`;
  }
}

/**
 * Utility functions for key management
 */
export class KeyManagementUtils {
  /**
   * Creates a key manager with environment-based storage
   */
  static createEnvironmentKeyManager(keyPrefix?: string): KeyManager {
    const storage = new EnvironmentKeyStorage(keyPrefix);
    return new KeyManager(storage);
  }

  /**
   * Creates a key manager with in-memory storage (for testing)
   */
  static createInMemoryKeyManager(): KeyManager {
    const storage = new InMemoryKeyStorage();
    return new KeyManager(storage);
  }

  /**
   * Validates key strength and format
   */
  static validateKey(key: Buffer, minLength: number = 32): Result<boolean, Error> {
    try {
      if (key.length < minLength) {
        return Result.failure(new Error(`Key too short: ${key.length} bytes, minimum ${minLength} required`));
      }

      // Check for weak keys (all zeros, all ones, etc.)
      const allZeros = key.every(byte => byte === 0);
      const allOnes = key.every(byte => byte === 255);
      
      if (allZeros || allOnes) {
        return Result.failure(new Error('Weak key detected: key contains only identical bytes'));
      }

      return Result.success(true);
    } catch (error) {
      return Result.failure(new Error(`Key validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Securely wipes a key from memory
   */
  static wipeKey(key: Buffer): void {
    if (key && key.length > 0) {
      crypto.randomFillSync(key);
    }
  }

  /**
   * Generates environment variable names for keys
   */
  static generateEnvKeyName(type: KeyType, purpose: string, prefix: string = 'LEGALOPS_KEY_'): string {
    const sanitized = purpose.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    return `${prefix}${type.toUpperCase()}_${sanitized}`;
  }
}