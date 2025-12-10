/**
 * Pagination utilities for cursor-based pagination.
 * Provides helper functions for implementing efficient pagination in repositories.
 */

import { PaginationMeta } from '../types/api';

/**
 * Options for cursor-based pagination.
 */
export interface CursorPaginationOptions {
  /** The cursor to start from (optional, for subsequent pages) */
  cursor?: string;
  /** Number of items to fetch per page */
  limit: number;
  /** Total count of items (optional, for calculating hasMore) */
  totalCount?: number;
}

/**
 * Result of a cursor-based pagination query.
 * 
 * @template T - The type of items in the result
 */
export interface CursorPaginationResult<T> {
  /** The items for this page */
  items: T[];
  /** The cursor for the next page (if available) */
  nextCursor?: string;
  /** Whether there are more items available */
  hasMore: boolean;
  /** Total count of items (if provided) */
  totalCount?: number;
}

/**
 * Calculate pagination metadata from cursor-based query results.
 * 
 * This function implements the "fetch N+1" pattern where we fetch one extra
 * item to determine if there are more pages available.
 * 
 * @template T - The type of items with an 'id' field
 * @param items - The items fetched (should be limit + 1)
 * @param limit - The requested page size
 * @param totalCount - Optional total count of all items
 * @returns Pagination result with metadata
 * 
 * @example
 * ```typescript
 * // Fetch limit + 1 items
 * const items = await prisma.order.findMany({
 *   take: limit + 1,
 *   cursor: cursor ? { id: cursor } : undefined,
 *   skip: cursor ? 1 : 0
 * });
 * 
 * // Calculate pagination metadata
 * const result = calculateCursorPagination(items, limit);
 * ```
 */
export function calculateCursorPagination<T extends { id: string }>(
  items: T[],
  limit: number,
  totalCount?: number
): CursorPaginationResult<T> {
  // Check if we have more items than requested
  const hasMore = items.length > limit;
  
  // Take only the requested number of items
  const pageItems = hasMore ? items.slice(0, limit) : items;
  
  // Get the cursor for the next page (last item's id)
  const nextCursor = hasMore && pageItems.length > 0
    ? pageItems[pageItems.length - 1].id
    : undefined;
  
  return {
    items: pageItems,
    nextCursor,
    hasMore,
    totalCount
  };
}

/**
 * Create pagination metadata for API responses.
 * 
 * @param options - Pagination options
 * @param hasMore - Whether there are more items available
 * @param currentCursor - The cursor used for this page
 * @param nextCursor - The cursor for the next page
 * @returns Pagination metadata object
 */
export function createPaginationMeta(
  options: CursorPaginationOptions,
  hasMore: boolean,
  currentCursor?: string,
  nextCursor?: string
): PaginationMeta {
  // Calculate page number (approximate, since cursor-based pagination doesn't have exact pages)
  const page = currentCursor ? 1 : 1; // For cursor-based, we don't track exact page numbers
  
  return {
    total: options.totalCount || 0,
    page,
    pageSize: options.limit,
    hasMore,
    cursor: nextCursor
  };
}

/**
 * Build a Prisma query object for cursor-based pagination.
 * 
 * @param cursor - The cursor to start from (optional)
 * @param limit - Number of items to fetch
 * @param orderBy - Optional ordering configuration
 * @returns Prisma query object with pagination parameters
 * 
 * @example
 * ```typescript
 * const query = buildCursorQuery(cursor, 20, { createdAt: 'desc' });
 * const items = await prisma.order.findMany({
 *   ...query,
 *   where: { userId: 'user123' }
 * });
 * ```
 */
export function buildCursorQuery(
  cursor: string | undefined,
  limit: number,
  orderBy?: Record<string, 'asc' | 'desc'>
): {
  take: number;
  cursor?: { id: string };
  skip?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
} {
  const query: {
    take: number;
    cursor?: { id: string };
    skip?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  } = {
    take: limit + 1 // Fetch one extra to check if there are more
  };
  
  if (cursor) {
    query.cursor = { id: cursor };
    query.skip = 1; // Skip the cursor itself
  }
  
  if (orderBy) {
    query.orderBy = orderBy;
  }
  
  return query;
}

/**
 * Validate pagination parameters.
 * 
 * @param limit - The requested page size
 * @param maxLimit - Maximum allowed page size
 * @returns Validated and clamped limit
 * 
 * @example
 * ```typescript
 * const limit = validatePaginationLimit(requestedLimit, 100);
 * ```
 */
export function validatePaginationLimit(
  limit: number | undefined,
  maxLimit: number = 100
): number {
  const defaultLimit = 20;
  
  if (!limit || limit < 1) {
    // Return the smaller of default and maxLimit
    return Math.min(defaultLimit, maxLimit);
  }
  
  return Math.min(limit, maxLimit);
}

/**
 * Extract cursor from query parameters.
 * 
 * @param params - Query parameters
 * @returns The cursor string or undefined
 */
export function extractCursor(params: URLSearchParams | Record<string, string | string[]>): string | undefined {
  if (params instanceof URLSearchParams) {
    return params.get('cursor') || undefined;
  }
  
  const cursor = params.cursor;
  return typeof cursor === 'string' ? cursor : undefined;
}

/**
 * Extract limit from query parameters with validation.
 * 
 * @param params - Query parameters
 * @param defaultLimit - Default limit if not provided
 * @param maxLimit - Maximum allowed limit
 * @returns Validated limit
 */
export function extractLimit(
  params: URLSearchParams | Record<string, string | string[]>,
  defaultLimit: number = 20,
  maxLimit: number = 100
): number {
  let limitStr: string | undefined;
  
  if (params instanceof URLSearchParams) {
    limitStr = params.get('limit') || undefined;
  } else {
    const limit = params.limit;
    limitStr = typeof limit === 'string' ? limit : undefined;
  }
  
  if (!limitStr) {
    return defaultLimit;
  }
  
  const limit = parseInt(limitStr, 10);
  
  if (isNaN(limit) || limit < 1) {
    return defaultLimit;
  }
  
  return Math.min(limit, maxLimit);
}
