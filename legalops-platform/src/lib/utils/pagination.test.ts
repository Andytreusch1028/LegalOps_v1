/**
 * Property-based tests for pagination utilities.
 * Feature: code-quality-improvements
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateCursorPagination,
  buildCursorQuery,
  validatePaginationLimit,
  extractCursor,
  extractLimit,
  createPaginationMeta
} from './pagination';

/**
 * Feature: code-quality-improvements, Property 12: Pagination Consistency
 * 
 * For any paginated query, fetching all pages and concatenating results should
 * produce the same set of items as fetching without pagination (order-preserved).
 * 
 * Validates: Requirements 5.3
 */
describe('Property 12: Pagination Consistency', () => {
  /**
   * Helper to simulate a paginated fetch through all pages.
   * This mimics what would happen in a real repository.
   */
  function fetchAllPages<T extends { id: string }>(
    allItems: T[],
    pageSize: number
  ): T[] {
    const result: T[] = [];
    let cursor: string | undefined = undefined;
    
    // Keep fetching pages until we've got everything
    while (true) {
      // Simulate fetching a page with cursor
      const startIndex = cursor 
        ? allItems.findIndex(item => item.id === cursor) + 1
        : 0;
      
      // Fetch pageSize + 1 items (the N+1 pattern)
      const pageItems = allItems.slice(startIndex, startIndex + pageSize + 1);
      
      // Calculate pagination
      const paginationResult = calculateCursorPagination(pageItems, pageSize);
      
      // Add items to result
      result.push(...paginationResult.items);
      
      // Check if we're done
      if (!paginationResult.hasMore) {
        break;
      }
      
      // Move to next page
      cursor = paginationResult.nextCursor;
      
      // Safety check to prevent infinite loops
      if (!cursor || result.length > allItems.length) {
        break;
      }
    }
    
    return result;
  }

  it('should return the same items when paginating through all pages as fetching all at once', () => {
    fc.assert(
      fc.property(
        // Generate an array of items with unique IDs
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string(),
            value: fc.integer()
          }),
          { minLength: 0, maxLength: 100 }
        ).map(items => {
          // Ensure unique IDs by adding index
          return items.map((item, idx) => ({
            ...item,
            id: `item-${idx}`
          }));
        }),
        // Generate a page size
        fc.integer({ min: 1, max: 20 }),
        (allItems, pageSize) => {
          // Fetch all items through pagination
          const paginatedItems = fetchAllPages(allItems, pageSize);
          
          // Property: Paginated fetch should return same items as all items
          expect(paginatedItems.length).toBe(allItems.length);
          
          // Property: Items should be in the same order
          paginatedItems.forEach((item, index) => {
            expect(item.id).toBe(allItems[index].id);
            expect(item.name).toBe(allItems[index].name);
            expect(item.value).toBe(allItems[index].value);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly calculate hasMore for any dataset and page size', () => {
    fc.assert(
      fc.property(
        // Generate items
        fc.array(
          fc.record({ id: fc.uuid(), data: fc.string() }),
          { minLength: 0, maxLength: 50 }
        ).map((items, idx) => 
          items.map((item, i) => ({ ...item, id: `id-${idx}-${i}` }))
        ),
        // Generate page size
        fc.integer({ min: 1, max: 20 }),
        (items, pageSize) => {
          // Simulate fetching with N+1 pattern
          const fetchedItems = items.slice(0, pageSize + 1);
          const result = calculateCursorPagination(fetchedItems, pageSize);
          
          // Property: hasMore should be true only if we have more items than pageSize
          const expectedHasMore = items.length > pageSize;
          expect(result.hasMore).toBe(expectedHasMore);
          
          // Property: returned items should not exceed pageSize
          expect(result.items.length).toBeLessThanOrEqual(pageSize);
          
          // Property: if hasMore is true, we should have exactly pageSize items
          if (result.hasMore) {
            expect(result.items.length).toBe(pageSize);
          }
          
          // Property: if hasMore is false, we should have all remaining items
          if (!result.hasMore) {
            expect(result.items.length).toBe(Math.min(items.length, pageSize));
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide correct nextCursor for pagination', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ id: fc.uuid(), value: fc.integer() }),
          { minLength: 2, maxLength: 50 }
        ).map((items, idx) => 
          items.map((item, i) => ({ ...item, id: `id-${idx}-${i}` }))
        ),
        fc.integer({ min: 1, max: 10 }),
        (items, pageSize) => {
          // Only test when we have more items than pageSize
          if (items.length <= pageSize) {
            return true; // Skip this case
          }
          
          // Fetch first page
          const fetchedItems = items.slice(0, pageSize + 1);
          const result = calculateCursorPagination(fetchedItems, pageSize);
          
          // Property: if hasMore is true, nextCursor should be the last item's id
          if (result.hasMore) {
            expect(result.nextCursor).toBeDefined();
            expect(result.nextCursor).toBe(result.items[result.items.length - 1].id);
          }
          
          // Property: if hasMore is false, nextCursor should be undefined
          if (!result.hasMore) {
            expect(result.nextCursor).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge cases: empty arrays, single items, exact page boundaries', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant([]), // Empty array
          fc.array(fc.record({ id: fc.uuid() }), { minLength: 1, maxLength: 1 }), // Single item
          fc.tuple(
            fc.integer({ min: 1, max: 20 }),
            fc.integer({ min: 1, max: 20 })
          ).chain(([pageSize, _]) => 
            // Generate exactly pageSize items
            fc.constant(
              Array.from({ length: pageSize }, (_, i) => ({ id: `id-${i}` }))
            ).map(items => ({ items, pageSize }))
          )
        ),
        (testCase) => {
          if (Array.isArray(testCase)) {
            // Empty or single item case
            const items = testCase.map((item, i) => ({ ...item, id: `id-${i}` }));
            const pageSize = 10;
            const result = calculateCursorPagination(items, pageSize);
            
            expect(result.items.length).toBe(items.length);
            expect(result.hasMore).toBe(false);
            expect(result.nextCursor).toBeUndefined();
          } else {
            // Exact page boundary case
            const { items, pageSize } = testCase;
            const result = calculateCursorPagination(items, pageSize);
            
            // When items.length === pageSize, hasMore should be false
            expect(result.hasMore).toBe(false);
            expect(result.items.length).toBe(pageSize);
            expect(result.nextCursor).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should build correct Prisma query for cursor-based pagination', () => {
    fc.assert(
      fc.property(
        fc.option(fc.uuid(), { nil: undefined }),
        fc.integer({ min: 1, max: 100 }),
        fc.option(
          fc.record({
            field: fc.constantFrom('createdAt', 'updatedAt', 'name'),
            direction: fc.constantFrom('asc' as const, 'desc' as const)
          }).map(({ field, direction }) => ({ [field]: direction })),
          { nil: undefined }
        ),
        (cursor, limit, orderBy) => {
          const query = buildCursorQuery(cursor, limit, orderBy);
          
          // Property: take should always be limit + 1 (N+1 pattern)
          expect(query.take).toBe(limit + 1);
          
          // Property: if cursor is provided, cursor and skip should be set
          if (cursor) {
            expect(query.cursor).toEqual({ id: cursor });
            expect(query.skip).toBe(1);
          } else {
            expect(query.cursor).toBeUndefined();
            expect(query.skip).toBeUndefined();
          }
          
          // Property: orderBy should match input
          if (orderBy) {
            expect(query.orderBy).toEqual(orderBy);
          } else {
            expect(query.orderBy).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate and clamp pagination limits correctly', () => {
    fc.assert(
      fc.property(
        fc.option(fc.integer({ min: -100, max: 200 }), { nil: undefined }),
        fc.integer({ min: 1, max: 200 }),
        (limit, maxLimit) => {
          const validated = validatePaginationLimit(limit, maxLimit);
          
          // Property: result should always be positive
          expect(validated).toBeGreaterThan(0);
          
          // Property: result should never exceed maxLimit
          expect(validated).toBeLessThanOrEqual(maxLimit);
          
          // Property: if limit is undefined or invalid, should return min(default, maxLimit)
          if (limit === undefined || limit < 1) {
            expect(validated).toBe(Math.min(20, maxLimit));
          }
          
          // Property: if limit is valid but exceeds max, should return max
          if (limit !== undefined && limit > maxLimit) {
            expect(validated).toBe(maxLimit);
          }
          
          // Property: if limit is valid and within bounds, should return limit
          if (limit !== undefined && limit >= 1 && limit <= maxLimit) {
            expect(validated).toBe(limit);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should extract cursor from query parameters correctly', () => {
    fc.assert(
      fc.property(
        fc.option(fc.uuid(), { nil: undefined }),
        (cursor) => {
          // Test with URLSearchParams
          const urlParams = new URLSearchParams();
          if (cursor) {
            urlParams.set('cursor', cursor);
          }
          
          const extractedFromUrl = extractCursor(urlParams);
          expect(extractedFromUrl).toBe(cursor);
          
          // Test with Record
          const recordParams: Record<string, string> = cursor ? { cursor } : {};
          const extractedFromRecord = extractCursor(recordParams);
          expect(extractedFromRecord).toBe(cursor);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should extract and validate limit from query parameters', () => {
    fc.assert(
      fc.property(
        fc.option(fc.integer({ min: -50, max: 200 }).map(String), { nil: undefined }),
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 50, max: 200 }),
        (limitStr, defaultLimit, maxLimit) => {
          // Test with URLSearchParams
          const urlParams = new URLSearchParams();
          if (limitStr) {
            urlParams.set('limit', limitStr);
          }
          
          const extracted = extractLimit(urlParams, defaultLimit, maxLimit);
          
          // Property: result should always be positive
          expect(extracted).toBeGreaterThan(0);
          
          // Property: result should never exceed maxLimit
          expect(extracted).toBeLessThanOrEqual(maxLimit);
          
          // Property: if no limit provided, should return default
          if (!limitStr) {
            expect(extracted).toBe(defaultLimit);
          }
          
          // Property: if limit is invalid (negative or NaN), should return default
          const parsedLimit = parseInt(limitStr || '', 10);
          if (limitStr && (isNaN(parsedLimit) || parsedLimit < 1)) {
            expect(extracted).toBe(defaultLimit);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create correct pagination metadata', () => {
    fc.assert(
      fc.property(
        fc.record({
          cursor: fc.option(fc.uuid(), { nil: undefined }),
          limit: fc.integer({ min: 1, max: 100 }),
          totalCount: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined })
        }),
        fc.boolean(),
        fc.option(fc.uuid(), { nil: undefined }),
        fc.option(fc.uuid(), { nil: undefined }),
        (options, hasMore, currentCursor, nextCursor) => {
          const meta = createPaginationMeta(options, hasMore, currentCursor, nextCursor);
          
          // Property: pageSize should match limit
          expect(meta.pageSize).toBe(options.limit);
          
          // Property: hasMore should match input
          expect(meta.hasMore).toBe(hasMore);
          
          // Property: cursor should match nextCursor
          expect(meta.cursor).toBe(nextCursor);
          
          // Property: total should match totalCount or be 0
          expect(meta.total).toBe(options.totalCount || 0);
          
          // Property: page should be a positive number
          expect(meta.page).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
