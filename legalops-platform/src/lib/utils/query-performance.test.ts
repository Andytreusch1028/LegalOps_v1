/**
 * Query Performance Tests
 * 
 * Tests for the query performance logging utilities.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryPerformanceLogger, createQueryPerformanceLogger, analyzeQueryPerformance } from './query-performance';
import { ILogger } from '../interfaces/logger.interface';

describe('QueryPerformanceLogger', () => {
  let mockLogger: ILogger;
  let performanceLogger: QueryPerformanceLogger;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
    
    performanceLogger = new QueryPerformanceLogger(mockLogger, {
      warnThreshold: 100,
      errorThreshold: 500,
      logThreshold: 10
    });
  });

  it('should measure query execution time', async () => {
    const mockOperation = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return 'result';
    });

    const result = await performanceLogger.measureQuery('test-query', mockOperation);

    expect(result).toBe('result');
    expect(mockOperation).toHaveBeenCalledOnce();
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining('Query executed'),
      expect.objectContaining({
        query: 'test-query',
        executionTime: expect.any(Number)
      })
    );
  });

  it('should log warnings for slow queries', async () => {
    const mockOperation = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
      return 'result';
    });

    await performanceLogger.measureQuery('slow-query', mockOperation);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Query performance warning'),
      expect.objectContaining({
        query: 'slow-query',
        executionTime: expect.any(Number)
      })
    );
  });

  it('should log errors for very slow queries', async () => {
    const mockOperation = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return 'result';
    });

    await performanceLogger.measureQuery('very-slow-query', mockOperation);

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Slow query detected'),
      expect.objectContaining({
        query: 'very-slow-query',
        executionTime: expect.any(Number)
      })
    );
  });

  it('should handle query failures', async () => {
    const mockError = new Error('Query failed');
    const mockOperation = vi.fn(async () => {
      throw mockError;
    });

    await expect(
      performanceLogger.measureQuery('failing-query', mockOperation)
    ).rejects.toThrow('Query failed');

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Query failed: failing-query',
      expect.objectContaining({
        executionTime: expect.any(Number),
        error: 'Query failed'
      })
    );
  });

  it('should include row count for array results', async () => {
    const mockResult = [1, 2, 3, 4, 5];
    const mockOperation = vi.fn(async () => mockResult);

    const result = await performanceLogger.measureQuery('array-query', mockOperation);

    expect(result).toEqual(mockResult);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining('Query executed'),
      expect.objectContaining({
        query: 'array-query',
        rowCount: 5
      })
    );
  });
});

describe('analyzeQueryPerformance', () => {
  it('should suggest optimizations for slow queries', () => {
    const metrics = {
      query: 'orders.findMany',
      executionTime: 2000,
      rowCount: 500
    };

    const suggestions = analyzeQueryPerformance(metrics);

    expect(suggestions).toContain('Add database indexes on frequently queried fields');
    expect(suggestions).toContain('Use select to fetch only needed fields instead of entire records');
  });

  it('should suggest pagination for large result sets', () => {
    const metrics = {
      query: 'orders.findMany',
      executionTime: 300,
      rowCount: 5000
    };

    const suggestions = analyzeQueryPerformance(metrics);

    expect(suggestions).toContain('Use take/limit to restrict the number of results returned');
    expect(suggestions).toContain('Implement cursor-based pagination for large datasets');
  });

  it('should suggest includes and caching for findMany queries', () => {
    const metrics = {
      query: 'orders.findMany',
      executionTime: 600,
      rowCount: 100
    };

    const suggestions = analyzeQueryPerformance(metrics);

    expect(suggestions).toContain('Use include to fetch related data in a single query instead of multiple queries');
    expect(suggestions).toContain('Cache frequently accessed data with appropriate TTL');
  });
});

describe('createQueryPerformanceLogger', () => {
  it('should create a logger with default thresholds', () => {
    const mockLogger: ILogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    const logger = createQueryPerformanceLogger(mockLogger);

    expect(logger).toBeInstanceOf(QueryPerformanceLogger);
  });

  it('should create a logger with custom thresholds', () => {
    const mockLogger: ILogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    const customThresholds = {
      warnThreshold: 200,
      errorThreshold: 1000
    };

    const logger = createQueryPerformanceLogger(mockLogger, customThresholds);

    expect(logger).toBeInstanceOf(QueryPerformanceLogger);
  });
});