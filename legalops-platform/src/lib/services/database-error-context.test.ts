import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { BaseService } from './base.service';
import { ILogger } from '../interfaces/logger.interface';
import { AppError, Result, err } from '../types/result';

/**
 * Feature: code-quality-improvements, Property 3: Database Error Context
 * 
 * For any database operation that fails, the error should be wrapped in an AppError 
 * with business context including the operation type and relevant entity IDs before 
 * being propagated to the caller.
 * 
 * Validates: Requirements 2.2
 */

/**
 * Test service that simulates database operations
 */
class TestDatabaseService extends BaseService {
  readonly name = 'TestDatabaseService';

  constructor(logger: ILogger) {
    super(logger);
  }

  /**
   * Simulates a database operation that might fail
   */
  async performDatabaseOperation(
    operationType: string,
    entityId: string,
    shouldFail: boolean,
    errorToThrow?: Error
  ): Promise<Result<any, AppError>> {
    try {
      if (shouldFail) {
        throw errorToThrow || new Error('Database operation failed');
      }
      return { success: true, data: { id: entityId } };
    } catch (error) {
      // This is the pattern we're testing - wrapping database errors with context
      const appError = this.handleError(
        error,
        `Failed to ${operationType}`,
        `${operationType.toUpperCase()}_FAILED`,
        500,
        {
          operationType,
          entityId
        }
      );
      return err(appError);
    }
  }
}

describe('Database Error Context Property Tests', () => {
  let mockLogger: ILogger;
  let service: TestDatabaseService;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    };

    service = new TestDatabaseService(mockLogger);
  });

  /**
   * Property 3: Database Error Context
   * 
   * For any database operation that fails, the error should be wrapped in an AppError
   * with business context including the operation type and relevant entity IDs.
   */
  it('should wrap database errors with operation type and entity ID context', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random operation types
        fc.constantFrom('create', 'update', 'delete', 'fetch', 'query'),
        // Generate random entity IDs (non-whitespace)
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        // Generate random error messages (non-whitespace)
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (operationType, entityId, errorMessage) => {
          // Simulate a database operation failure
          const result = await service.performDatabaseOperation(
            operationType,
            entityId,
            true,
            new Error(errorMessage)
          );

          // Verify the result is a failure
          expect(result.success).toBe(false);

          if (!result.success) {
            const error = result.error;

            // Verify it's an AppError
            expect(error).toBeInstanceOf(AppError);
            expect(error.name).toBe('AppError');

            // Verify the error has business context
            expect(error.context).toBeDefined();
            expect(error.context).toHaveProperty('operationType');
            expect(error.context).toHaveProperty('entityId');

            // Verify the context contains the correct values
            expect(error.context?.operationType).toBe(operationType);
            expect(error.context?.entityId).toBe(entityId);

            // Verify the error has a proper code
            expect(error.code).toBe(`${operationType.toUpperCase()}_FAILED`);

            // Verify the error has a descriptive message
            expect(error.message).toContain(operationType);

            // Verify the error has appropriate status code
            expect(error.statusCode).toBe(500);

            // Verify the original error is preserved in context
            expect(error.context).toHaveProperty('originalError');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Database errors should preserve original error information
   */
  it('should preserve original error information in context', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        async (operationType, entityId, originalErrorMessage) => {
          const originalError = new Error(originalErrorMessage);
          
          const result = await service.performDatabaseOperation(
            operationType,
            entityId,
            true,
            originalError
          );

          if (!result.success) {
            const error = result.error;
            
            // Verify original error message is preserved
            expect(error.context?.originalError).toBe(originalErrorMessage);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Successful operations should not create errors
   */
  it('should not create errors for successful database operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('create', 'update', 'delete', 'fetch', 'query'),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        async (operationType, entityId) => {
          const result = await service.performDatabaseOperation(
            operationType,
            entityId,
            false
          );

          // Verify the result is successful
          expect(result.success).toBe(true);

          if (result.success) {
            expect(result.data).toBeDefined();
            expect(result.data.id).toBe(entityId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Error context should include all relevant entity identifiers
   */
  it('should include multiple entity identifiers in error context when provided', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.record({
          userId: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          orderId: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          itemId: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)
        }),
        async (operationType, entityIds) => {
          try {
            throw new Error('Database operation failed');
          } catch (error) {
            const appError = service['handleError'](
              error,
              `Failed to ${operationType}`,
              `${operationType.toUpperCase()}_FAILED`,
              500,
              {
                operationType,
                ...entityIds
              }
            );

            // Verify all entity IDs are in context
            expect(appError.context).toHaveProperty('userId', entityIds.userId);
            expect(appError.context).toHaveProperty('orderId', entityIds.orderId);
            expect(appError.context).toHaveProperty('itemId', entityIds.itemId);
            expect(appError.context).toHaveProperty('operationType', operationType);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Error wrapping should maintain error type information
   */
  it('should maintain AppError type when re-wrapping AppError instances', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 400, max: 599 }),
        async (operationType, entityId, errorMessage, statusCode) => {
          // Create an original AppError
          const originalAppError = new AppError(
            errorMessage,
            'ORIGINAL_ERROR',
            statusCode,
            { originalContext: 'test' }
          );

          try {
            throw originalAppError;
          } catch (error) {
            const wrappedError = service['handleError'](
              error,
              `Failed to ${operationType}`,
              `${operationType.toUpperCase()}_FAILED`,
              500,
              {
                operationType,
                entityId
              }
            );

            // When wrapping an AppError, it should return the original AppError
            // (as per BaseService.handleError implementation)
            expect(wrappedError).toBe(originalAppError);
            expect(wrappedError.code).toBe('ORIGINAL_ERROR');
            expect(wrappedError.statusCode).toBe(statusCode);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Error logging should occur for all database failures
   */
  it('should log errors with context for all database operation failures', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('create', 'update', 'delete', 'fetch', 'query'),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        async (operationType, entityId) => {
          // Clear previous calls
          vi.clearAllMocks();

          await service.performDatabaseOperation(
            operationType,
            entityId,
            true,
            new Error('Test error')
          );

          // Verify error was logged
          expect(mockLogger.error).toHaveBeenCalled();
          
          // Verify the log includes service name
          const logCall = vi.mocked(mockLogger.error).mock.calls[0];
          expect(logCall[0]).toContain('TestDatabaseService');
        }
      ),
      { numRuns: 100 }
    );
  });
});
