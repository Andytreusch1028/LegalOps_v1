import { ICache } from '../interfaces/cache.interface';

/**
 * Cache entry with expiration time.
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

/**
 * In-memory cache implementation.
 * Suitable for development and single-instance deployments.
 * For production with multiple instances, use Redis or similar.
 */
export class MemoryCache implements ICache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000);
  }

  /**
   * Get a value from the cache.
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set a value in the cache.
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;

    this.cache.set(key, {
      value,
      expiresAt
    });
  }

  /**
   * Delete a value from the cache.
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Delete multiple values from the cache by pattern.
   */
  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all values from the cache.
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Check if a key exists in the cache.
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clean up expired entries.
   */
  private cleanupExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Destroy the cache and cleanup resources.
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

/**
 * Factory function to create a cache instance.
 * 
 * @returns A cache instance
 */
export function createCache(): ICache {
  return new MemoryCache();
}
