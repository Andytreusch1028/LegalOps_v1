import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryCache } from './memory-cache';

describe('MemoryCache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache();
  });

  afterEach(() => {
    cache.destroy();
  });

  describe('get and set', () => {
    it('should store and retrieve values', async () => {
      await cache.set('key1', 'value1');
      const result = await cache.get<string>('key1');

      expect(result).toBe('value1');
    });

    it('should return null for non-existent keys', async () => {
      const result = await cache.get('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle different data types', async () => {
      await cache.set('string', 'text');
      await cache.set('number', 42);
      await cache.set('object', { foo: 'bar' });
      await cache.set('array', [1, 2, 3]);

      expect(await cache.get('string')).toBe('text');
      expect(await cache.get('number')).toBe(42);
      expect(await cache.get('object')).toEqual({ foo: 'bar' });
      expect(await cache.get('array')).toEqual([1, 2, 3]);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire entries after TTL', async () => {
      await cache.set('key1', 'value1', 0.1); // 100ms TTL

      // Should exist immediately
      expect(await cache.get('key1')).toBe('value1');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be expired
      expect(await cache.get('key1')).toBeNull();
    });

    it('should not expire entries without TTL', async () => {
      await cache.set('key1', 'value1');

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should still exist
      expect(await cache.get('key1')).toBe('value1');
    });
  });

  describe('delete', () => {
    it('should delete a single key', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');

      await cache.delete('key1');

      expect(await cache.get('key1')).toBeNull();
      expect(await cache.get('key2')).toBe('value2');
    });
  });

  describe('deletePattern', () => {
    it('should delete keys matching pattern', async () => {
      await cache.set('user:1', 'user1');
      await cache.set('user:2', 'user2');
      await cache.set('order:1', 'order1');

      await cache.deletePattern('user:*');

      expect(await cache.get('user:1')).toBeNull();
      expect(await cache.get('user:2')).toBeNull();
      expect(await cache.get('order:1')).toBe('order1');
    });
  });

  describe('clear', () => {
    it('should clear all entries', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      await cache.set('key3', 'value3');

      await cache.clear();

      expect(await cache.get('key1')).toBeNull();
      expect(await cache.get('key2')).toBeNull();
      expect(await cache.get('key3')).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true for existing keys', async () => {
      await cache.set('key1', 'value1');

      expect(await cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent keys', async () => {
      expect(await cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired keys', async () => {
      await cache.set('key1', 'value1', 0.1); // 100ms TTL

      expect(await cache.has('key1')).toBe(true);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(await cache.has('key1')).toBe(false);
    });
  });
});
