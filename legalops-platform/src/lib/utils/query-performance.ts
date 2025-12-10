/**
 * Query Performance Logging Utility
 * 
 * Provides utilities for logging database query performance and identifying slow queries.
 * Helps monitor query execution times and optimize database performance.
 */

import { ILogger } from '../interfaces/logger.interface';

/**
 * Query performance metrics.
 */
export interface QueryMetrics {
  /** Query identifier or description */
  query: string;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Number of rows returned/affected */
  rowCount?: number;
  /** Additional context about the query */
  context?: Record<string, unknown>;
}

/**
 * Performance thresholds for query logging.
 */
export interface PerformanceThresholds {
  /** Warn if query takes longer than this (ms) */
  warnThreshold: number;
  /** Error if query takes longer than this (ms) */
  errorThreshold: number;
  /** Log all queries that take longer than this (ms) */
  logThreshold: number;
}

/**
 * Default performance thresholds.
 */
export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  warnThreshold: 1000, // 1 second
  errorThreshold: 5000, // 5 seconds
  logThreshold: 100 // 100ms
};

/**
 * Query performance logger.
 * Wraps database operations to measure and log execution times.
 */
export class QueryPerformanceLogger {
  private thresholds: PerformanceThresholds;

  constructor(
    private readonly logger: ILogger,
    thresholds: Partial<PerformanceThresholds> = {}
  ) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Measure and log the performance of a database operation.
   * 
   * @param queryName - Name or description of the query
   * @param operation - The database operation to measure
   * @param context - Additional context for logging
   * @returns The result of the operation
   */
  async measureQuery<T>(
    queryName: string,
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const executionTime = performance.now() - startTime;
      
      // Determine row count if result is an array
      const rowCount = Array.isArray(result) ? result.length : undefined;
      
      this.logQueryPerformance({
        query: queryName,
        executionTime,
        rowCount,
        context
      });
      
      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      this.logger.error(`Query failed: ${queryName}`, {
        executionTime,
        error: error instanceof Error ? error.message : String(error),
        context
      });
      
      throw error;
    }
  }

  /**
   * Log query performance metrics based on thresholds.
   * 
   * @param metrics - The query performance metrics
   */
  private logQueryPerformance(metrics: QueryMetrics): void {
    const { query, executionTime, rowCount, context } = metrics;
    
    const logData = {
      query,
      executionTime: Math.round(executionTime * 100) / 100, // Round to 2 decimal places
      rowCount,
      ...context
    };

    if (executionTime >= this.thresholds.errorThreshold) {
      this.logger.error(`Slow query detected (${executionTime.toFixed(2)}ms)`, logData);
    } else if (executionTime >= this.thresholds.warnThreshold) {
      this.logger.warn(`Query performance warning (${executionTime.toFixed(2)}ms)`, logData);
    } else if (executionTime >= this.thresholds.logThreshold) {
      this.logger.debug(`Query executed (${executionTime.toFixed(2)}ms)`, logData);
    }
  }

  /**
   * Create a performance-aware wrapper for Prisma operations.
   * 
   * @param prismaClient - The Prisma client instance
   * @returns Wrapped Prisma client with performance logging
   */
  wrapPrismaClient<T extends Record<string, any>>(prismaClient: T): T {
    const logger = this;
    
    return new Proxy(prismaClient, {
      get(target, prop) {
        const originalValue = target[prop];
        
        // If it's a model (like prisma.order, prisma.user, etc.)
        if (typeof originalValue === 'object' && originalValue !== null) {
          return new Proxy(originalValue, {
            get(modelTarget, modelProp) {
              const originalMethod = modelTarget[modelProp];
              
              // If it's a query method (findMany, findUnique, create, etc.)
              if (typeof originalMethod === 'function' && 
                  typeof modelProp === 'string' &&
                  ['findMany', 'findUnique', 'findFirst', 'create', 'update', 'delete', 'upsert', 'count'].includes(modelProp)) {
                
                return function(...args: any[]) {
                  const queryName = `${String(prop)}.${modelProp}`;
                  return logger.measureQuery(queryName, () => originalMethod.apply(modelTarget, args));
                };
              }
              
              return originalMethod;
            }
          });
        }
        
        return originalValue;
      }
    });
  }
}

/**
 * Decorator for measuring method performance.
 * 
 * @param queryName - Name of the query for logging
 * @param logger - Query performance logger instance
 */
export function measurePerformance(queryName: string, logger: QueryPerformanceLogger) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return await logger.measureQuery(
        queryName,
        () => originalMethod.apply(this, args),
        { method: propertyKey, args: args.length }
      );
    };
    
    return descriptor;
  };
}

/**
 * Utility function to create a performance logger with default settings.
 * 
 * @param logger - The base logger instance
 * @param thresholds - Optional custom thresholds
 * @returns Configured query performance logger
 */
export function createQueryPerformanceLogger(
  logger: ILogger,
  thresholds?: Partial<PerformanceThresholds>
): QueryPerformanceLogger {
  return new QueryPerformanceLogger(logger, thresholds);
}

/**
 * Query optimization hints and best practices.
 */
export const QUERY_OPTIMIZATION_TIPS = {
  SELECT_SPECIFIC_FIELDS: 'Use select to fetch only needed fields instead of entire records',
  USE_INCLUDES: 'Use include to fetch related data in a single query instead of multiple queries',
  ADD_INDEXES: 'Add database indexes on frequently queried fields',
  LIMIT_RESULTS: 'Use take/limit to restrict the number of results returned',
  USE_PAGINATION: 'Implement cursor-based pagination for large datasets',
  AVOID_N_PLUS_ONE: 'Avoid N+1 queries by using include or batch operations',
  CACHE_RESULTS: 'Cache frequently accessed data with appropriate TTL',
  OPTIMIZE_WHERE_CLAUSES: 'Structure WHERE clauses to use indexes effectively'
} as const;

/**
 * Analyze query performance and provide optimization suggestions.
 * 
 * @param metrics - Query performance metrics
 * @returns Array of optimization suggestions
 */
export function analyzeQueryPerformance(metrics: QueryMetrics): string[] {
  const suggestions: string[] = [];
  const { executionTime, rowCount, query } = metrics;
  
  // Slow query suggestions
  if (executionTime > 1000) {
    suggestions.push(QUERY_OPTIMIZATION_TIPS.ADD_INDEXES);
    suggestions.push(QUERY_OPTIMIZATION_TIPS.SELECT_SPECIFIC_FIELDS);
  }
  
  // Large result set suggestions
  if (rowCount && rowCount > 1000) {
    suggestions.push(QUERY_OPTIMIZATION_TIPS.LIMIT_RESULTS);
    suggestions.push(QUERY_OPTIMIZATION_TIPS.USE_PAGINATION);
  }
  
  // Query pattern suggestions
  if (query.includes('findMany') && executionTime > 500) {
    suggestions.push(QUERY_OPTIMIZATION_TIPS.USE_INCLUDES);
    suggestions.push(QUERY_OPTIMIZATION_TIPS.CACHE_RESULTS);
  }
  
  return suggestions;
}