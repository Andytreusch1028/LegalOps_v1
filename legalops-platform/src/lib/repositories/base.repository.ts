import { PrismaClient } from '@/generated/prisma';
import {
  IBaseRepository,
  IRepository,
  Filter,
  CreateData,
  UpdateData
} from '../interfaces/repository.interface';
import { ICache } from '../interfaces/cache.interface';
import { ILogger } from '../interfaces/logger.interface';
import {
  calculateCursorPagination,
  buildCursorQuery,
  CursorPaginationResult
} from '../utils/pagination';
import { QueryPerformanceLogger, createQueryPerformanceLogger } from '../utils/query-performance';

/**
 * Abstract base repository class.
 * Provides common data access patterns with optional caching.
 * 
 * @template T - The entity type this repository manages
 */
export abstract class BaseRepository<T> implements IBaseRepository<T>, IRepository {
  /**
   * The name of the repository for logging and identification.
   * Must be implemented by derived classes.
   */
  abstract readonly name: string;

  /**
   * The Prisma model delegate for this entity.
   * Must be implemented by derived classes.
   * 
   * Example: For User entity, return prisma.user
   */
  protected abstract getModel(): any;

  /**
   * Default TTL for cached items in seconds.
   * Can be overridden by derived classes.
   */
  protected cacheTTL: number = 300; // 5 minutes

  /**
   * Query performance logger for monitoring database operations.
   */
  protected readonly performanceLogger: QueryPerformanceLogger;

  /**
   * Creates a new BaseRepository instance.
   * 
   * @param prisma - Prisma client instance
   * @param logger - Logger instance for structured logging
   * @param cache - Optional cache instance for data caching
   */
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly logger: ILogger,
    protected readonly cache?: ICache
  ) {
    this.performanceLogger = createQueryPerformanceLogger(logger);
  }

  /**
   * Find an entity by its ID.
   * Checks cache first if caching is enabled.
   */
  async findById(id: string): Promise<T | null> {
    // Check cache first
    if (this.cache) {
      const cacheKey = this.getCacheKey(id);
      const cached = await this.cache.get<T>(cacheKey);

      if (cached) {
        this.logger.debug(`[${this.name}] Cache hit for ${cacheKey}`);
        return cached;
      }
    }

    // Fetch from database with performance logging
    const model = this.getModel();
    const result = await this.performanceLogger.measureQuery(
      `${this.name}.findById`,
      () => model.findUnique({ where: { id } }),
      { id }
    );

    // Cache the result
    if (result && this.cache) {
      const cacheKey = this.getCacheKey(id);
      await this.cache.set(cacheKey, result, this.cacheTTL);
      this.logger.debug(`[${this.name}] Cached ${cacheKey}`);
    }

    return result;
  }

  /**
   * Find multiple entities matching the filter.
   */
  async findMany(filter?: Filter<T>): Promise<T[]> {
    const model = this.getModel();
    const query: any = {};

    if (filter) {
      // Apply limit
      if (filter.limit) {
        query.take = filter.limit;
      }

      // Apply offset
      if (filter.offset) {
        query.skip = filter.offset;
      }

      // Apply cursor-based pagination
      if (filter.cursor) {
        query.cursor = { id: filter.cursor };
        query.skip = 1; // Skip the cursor itself
      }

      // Apply ordering
      if (filter.orderBy) {
        query.orderBy = {
          [filter.orderBy.field as string]: filter.orderBy.direction
        };
      }

      // Apply where clause (filter out pagination/ordering fields)
      const whereClause: any = {};
      for (const [key, value] of Object.entries(filter)) {
        if (!['limit', 'offset', 'cursor', 'orderBy'].includes(key)) {
          whereClause[key] = value;
        }
      }

      if (Object.keys(whereClause).length > 0) {
        query.where = whereClause;
      }
    }

    return await this.performanceLogger.measureQuery(
      `${this.name}.findMany`,
      () => model.findMany(query),
      { filter, queryKeys: Object.keys(query) }
    );
  }

  /**
   * Find a single entity matching the filter.
   */
  async findOne(filter: Filter<T>): Promise<T | null> {
    const results = await this.findMany({ ...filter, limit: 1 });
    return results[0] || null;
  }

  /**
   * Create a new entity.
   * Invalidates cache if caching is enabled.
   */
  async create(data: CreateData<T>): Promise<T> {
    const model = this.getModel();
    const result = await model.create({
      data
    });

    this.logger.info(`[${this.name}] Created entity with id: ${result.id}`);

    return result;
  }

  /**
   * Update an existing entity.
   * Invalidates cache if caching is enabled.
   */
  async update(id: string, data: UpdateData<T>): Promise<T> {
    const model = this.getModel();
    const result = await model.update({
      where: { id },
      data
    });

    // Invalidate cache
    if (this.cache) {
      const cacheKey = this.getCacheKey(id);
      await this.cache.delete(cacheKey);
      this.logger.debug(`[${this.name}] Invalidated cache for ${cacheKey}`);
    }

    this.logger.info(`[${this.name}] Updated entity with id: ${id}`);

    return result;
  }

  /**
   * Delete an entity.
   * Invalidates cache if caching is enabled.
   */
  async delete(id: string): Promise<void> {
    const model = this.getModel();
    await model.delete({
      where: { id }
    });

    // Invalidate cache
    if (this.cache) {
      const cacheKey = this.getCacheKey(id);
      await this.cache.delete(cacheKey);
      this.logger.debug(`[${this.name}] Invalidated cache for ${cacheKey}`);
    }

    this.logger.info(`[${this.name}] Deleted entity with id: ${id}`);
  }

  /**
   * Count entities matching the filter.
   */
  async count(filter?: Filter<T>): Promise<number> {
    const model = this.getModel();
    const query: any = {};

    if (filter) {
      // Apply where clause (filter out pagination/ordering fields)
      const whereClause: any = {};
      for (const [key, value] of Object.entries(filter)) {
        if (!['limit', 'offset', 'cursor', 'orderBy'].includes(key)) {
          whereClause[key] = value;
        }
      }

      if (Object.keys(whereClause).length > 0) {
        query.where = whereClause;
      }
    }

    return await model.count(query);
  }

  /**
   * Check if an entity exists.
   */
  async exists(id: string): Promise<boolean> {
    // Check cache first
    if (this.cache) {
      const cacheKey = this.getCacheKey(id);
      const hasCache = await this.cache.has(cacheKey);
      if (hasCache) {
        return true;
      }
    }

    // Check database
    const model = this.getModel();
    const count = await model.count({
      where: { id }
    });

    return count > 0;
  }

  /**
   * Generate a cache key for an entity.
   * 
   * @param id - The entity ID
   * @returns The cache key
   */
  protected getCacheKey(id: string): string {
    return `${this.name}:${id}`;
  }

  /**
   * Invalidate all cache entries for this repository.
   */
  protected async invalidateCache(): Promise<void> {
    if (this.cache) {
      await this.cache.deletePattern(`${this.name}:*`);
      this.logger.debug(`[${this.name}] Invalidated all cache entries`);
    }
  }

  /**
   * Find entities with cursor-based pagination.
   * Uses the "fetch N+1" pattern to efficiently determine if more pages exist.
   * 
   * @param cursor - Optional cursor to start from
   * @param limit - Number of items per page
   * @param filter - Optional additional filter criteria
   * @param orderBy - Optional ordering configuration
   * @returns Pagination result with items and metadata
   * 
   * @example
   * ```typescript
   * const result = await repository.findManyPaginated(cursor, 20, { status: 'active' });
   * console.log(result.items); // Array of items
   * console.log(result.hasMore); // true if more pages exist
   * console.log(result.nextCursor); // Cursor for next page
   * ```
   */
  async findManyPaginated(
    cursor: string | undefined,
    limit: number,
    filter?: Omit<Filter<T>, 'cursor' | 'limit' | 'offset'>,
    orderBy?: Record<string, 'asc' | 'desc'>
  ): Promise<CursorPaginationResult<T & { id: string }>> {
    const model = this.getModel();
    
    // Build the pagination query
    const paginationQuery = buildCursorQuery(cursor, limit, orderBy);
    
    // Build the where clause from filter
    const whereClause: any = {};
    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        if (!['orderBy'].includes(key)) {
          whereClause[key] = value;
        }
      }
    }
    
    // Execute the query
    const items = await model.findMany({
      ...paginationQuery,
      ...(Object.keys(whereClause).length > 0 && { where: whereClause })
    });
    
    // Calculate pagination metadata
    return calculateCursorPagination(items, limit);
  }
}
