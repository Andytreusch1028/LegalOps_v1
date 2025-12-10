/**
 * Cache interface for data caching.
 * Provides a simple key-value cache abstraction.
 */
export interface ICache {
  /**
   * Get a value from the cache.
   * 
   * @template T - The type of the cached value
   * @param key - The cache key
   * @returns The cached value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in the cache.
   * 
   * @template T - The type of the value to cache
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Time to live in seconds (optional)
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete a value from the cache.
   * 
   * @param key - The cache key
   */
  delete(key: string): Promise<void>;

  /**
   * Delete multiple values from the cache by pattern.
   * 
   * @param pattern - The key pattern (e.g., "user:*")
   */
  deletePattern(pattern: string): Promise<void>;

  /**
   * Clear all values from the cache.
   */
  clear(): Promise<void>;

  /**
   * Check if a key exists in the cache.
   * 
   * @param key - The cache key
   * @returns True if the key exists
   */
  has(key: string): Promise<boolean>;
}
