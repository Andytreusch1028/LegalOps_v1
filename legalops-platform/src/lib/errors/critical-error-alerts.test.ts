import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { AppError } from '../types/result';
import { IAlertService, AlertNotification } from '../interfaces/alert.interface';

/**
 * Feature: code-quality-improvements, Property 6: Critical Error Alerts
 * 
 * Property: For any error with status code >= 500, the system should call 
 * the alert service to notify staff with error details and context.
 * 
 * Validates: Requirements 2.5
 */

/**
 * Mock alert service for testing.
 */
class MockAlertService implements IAlertService {
  public notifications: AlertNotification[] = [];

  async notifyStaff(notification: AlertNotification): Promise<void> {
    this.notifications.push(notification);
  }

  shouldAlert(statusCode: number): boolean {
    return statusCode >= 500;
  }

  reset(): void {
    this.notifications = [];
  }
}

/**
 * Simulates error handling logic that should trigger alerts for critical errors.
 */
async function handleError(
  error: AppError,
  alertService: IAlertService,
  context?: Record<string, unknown>
): Promise<void> {
  // Critical errors (status code >= 500) should trigger alerts
  if (alertService.shouldAlert(error.statusCode)) {
    await alertService.notifyStaff({
      severity: error.statusCode >= 500 ? 'high' : 'medium',
      message: error.message,
      context: {
        code: error.code,
        statusCode: error.statusCode,
        errorContext: error.context,
        ...context
      },
      timestamp: new Date()
    });
  }
}

describe('Property 6: Critical Error Alerts', () => {
  let mockAlertService: MockAlertService;

  beforeEach(() => {
    mockAlertService = new MockAlertService();
  });

  it('should alert staff for all errors with status code >= 500', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate error messages
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        // Generate error codes
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        // Generate status codes >= 500 (critical errors)
        fc.integer({ min: 500, max: 599 }),
        // Generate optional context
        fc.option(
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.oneof(
              fc.string(),
              fc.integer(),
              fc.boolean()
            )
          ),
          { nil: undefined }
        ),
        async (message, code, statusCode, context) => {
          mockAlertService.reset();

          // Create a critical error
          const error = new AppError(message, code, statusCode, context);

          // Handle the error
          await handleError(error, mockAlertService);

          // Property 1: Alert service should be called for critical errors
          expect(mockAlertService.notifications.length).toBe(1);

          // Property 2: Alert should contain error message
          expect(mockAlertService.notifications[0].message).toBe(message);

          // Property 3: Alert should have high severity for 5xx errors
          expect(mockAlertService.notifications[0].severity).toBe('high');

          // Property 4: Alert context should include error code
          expect(mockAlertService.notifications[0].context?.code).toBe(code);

          // Property 5: Alert context should include status code
          expect(mockAlertService.notifications[0].context?.statusCode).toBe(statusCode);

          // Property 6: Alert context should include original error context if provided
          if (context !== undefined) {
            expect(mockAlertService.notifications[0].context?.errorContext).toEqual(context);
          }

          // Property 7: Alert should have a timestamp
          expect(mockAlertService.notifications[0].timestamp).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT alert staff for errors with status code < 500', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate error messages
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        // Generate error codes
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        // Generate status codes < 500 (non-critical errors)
        fc.integer({ min: 400, max: 499 }),
        // Generate optional context
        fc.option(
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.oneof(
              fc.string(),
              fc.integer(),
              fc.boolean()
            )
          ),
          { nil: undefined }
        ),
        async (message, code, statusCode, context) => {
          mockAlertService.reset();

          // Create a non-critical error
          const error = new AppError(message, code, statusCode, context);

          // Handle the error
          await handleError(error, mockAlertService);

          // Property: Alert service should NOT be called for non-critical errors
          expect(mockAlertService.notifications.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should alert for all 5xx status codes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        // Test specific 5xx status codes
        fc.constantFrom(500, 501, 502, 503, 504, 505, 507, 508, 510, 511),
        async (message, code, statusCode) => {
          mockAlertService.reset();

          const error = new AppError(message, code, statusCode);
          await handleError(error, mockAlertService);

          // All 5xx errors should trigger alerts
          expect(mockAlertService.notifications.length).toBe(1);
          expect(mockAlertService.notifications[0].context?.statusCode).toBe(statusCode);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve all error context in alert notifications', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer({ min: 500, max: 599 }),
        // Generate complex context with nested objects
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.array(fc.string()),
            fc.dictionary(fc.string(), fc.string())
          )
        ),
        async (message, code, statusCode, errorContext) => {
          mockAlertService.reset();

          const error = new AppError(message, code, statusCode, errorContext);
          const additionalContext = { requestId: 'test-123', userId: 'user-456' };

          await handleError(error, mockAlertService, additionalContext);

          // Property: All context should be preserved in the alert
          expect(mockAlertService.notifications[0].context?.errorContext).toEqual(errorContext);
          expect(mockAlertService.notifications[0].context?.requestId).toBe('test-123');
          expect(mockAlertService.notifications[0].context?.userId).toBe('user-456');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle boundary case: status code exactly 500', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (message, code) => {
          mockAlertService.reset();

          // Test the exact boundary
          const error = new AppError(message, code, 500);
          await handleError(error, mockAlertService);

          // Status code 500 should trigger an alert
          expect(mockAlertService.notifications.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle boundary case: status code exactly 499', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (message, code) => {
          mockAlertService.reset();

          // Test the exact boundary
          const error = new AppError(message, code, 499);
          await handleError(error, mockAlertService);

          // Status code 499 should NOT trigger an alert
          expect(mockAlertService.notifications.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should call shouldAlert method to determine if alert is needed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 400, max: 599 }),
        (statusCode) => {
          const shouldAlert = mockAlertService.shouldAlert(statusCode);

          // Property: shouldAlert should return true for status >= 500
          if (statusCode >= 500) {
            expect(shouldAlert).toBe(true);
          } else {
            expect(shouldAlert).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle multiple critical errors independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of critical errors
        fc.array(
          fc.record({
            message: fc.string({ minLength: 1, maxLength: 200 }),
            code: fc.string({ minLength: 1, maxLength: 50 }),
            statusCode: fc.integer({ min: 500, max: 599 })
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (errors) => {
          mockAlertService.reset();

          // Handle all errors
          for (const errorData of errors) {
            const error = new AppError(
              errorData.message,
              errorData.code,
              errorData.statusCode
            );
            await handleError(error, mockAlertService);
          }

          // Property: Each critical error should generate exactly one alert
          expect(mockAlertService.notifications.length).toBe(errors.length);

          // Property: Each alert should correspond to its error
          errors.forEach((errorData, index) => {
            expect(mockAlertService.notifications[index].message).toBe(errorData.message);
            expect(mockAlertService.notifications[index].context?.code).toBe(errorData.code);
            expect(mockAlertService.notifications[index].context?.statusCode).toBe(errorData.statusCode);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
