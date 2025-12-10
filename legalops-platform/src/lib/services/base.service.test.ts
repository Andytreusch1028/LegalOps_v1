import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseService } from './base.service';
import { ILogger } from '../interfaces/logger.interface';
import { AppError } from '../types/result';

/**
 * Test implementation of BaseService
 */
class TestService extends BaseService {
  readonly name = 'TestService';

  constructor(logger: ILogger) {
    super(logger);
  }

  // Expose protected methods for testing
  public testLogError(error: unknown, context?: Record<string, unknown>) {
    return this.logError(error, context);
  }

  public testLogInfo(message: string, context?: Record<string, unknown>) {
    return this.logInfo(message, context);
  }

  public testLogWarn(message: string, context?: Record<string, unknown>) {
    return this.logWarn(message, context);
  }

  public testLogDebug(message: string, context?: Record<string, unknown>) {
    return this.logDebug(message, context);
  }

  public testCreateError(
    message: string,
    code: string,
    statusCode?: number,
    context?: Record<string, unknown>
  ) {
    return this.createError(message, code, statusCode, context);
  }

  public testHandleError(
    error: unknown,
    message: string,
    code: string,
    statusCode?: number,
    context?: Record<string, unknown>
  ) {
    return this.handleError(error, message, code, statusCode, context);
  }
}

describe('BaseService', () => {
  let mockLogger: ILogger;
  let service: TestService;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    };

    service = new TestService(mockLogger);
  });

  describe('name property', () => {
    it('should have a name property', () => {
      expect(service.name).toBe('TestService');
    });
  });

  describe('logging methods', () => {
    it('should log info messages with service context', () => {
      service.testLogInfo('Test message', { key: 'value' });

      expect(mockLogger.info).toHaveBeenCalledWith(
        '[TestService] Test message',
        { key: 'value' }
      );
    });

    it('should log warning messages with service context', () => {
      service.testLogWarn('Warning message', { key: 'value' });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[TestService] Warning message',
        { key: 'value' }
      );
    });

    it('should log debug messages with service context', () => {
      service.testLogDebug('Debug message', { key: 'value' });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        '[TestService] Debug message',
        { key: 'value' }
      );
    });

    it('should log errors with service context and stack trace', () => {
      const error = new Error('Test error');
      service.testLogError(error, { key: 'value' });

      expect(mockLogger.error).toHaveBeenCalledWith(
        '[TestService] Error: Test error',
        expect.objectContaining({
          error: 'Test error',
          stack: expect.any(String),
          key: 'value'
        })
      );
    });

    it('should log non-Error objects as strings', () => {
      service.testLogError('String error', { key: 'value' });

      expect(mockLogger.error).toHaveBeenCalledWith(
        '[TestService] Error: String error',
        expect.objectContaining({
          error: 'String error',
          key: 'value'
        })
      );
    });
  });

  describe('createError', () => {
    it('should create an AppError with default status code', () => {
      const error = service.testCreateError('Test error', 'TEST_ERROR');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.context).toBeUndefined();
    });

    it('should create an AppError with custom status code', () => {
      const error = service.testCreateError('Not found', 'NOT_FOUND', 404);

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
    });

    it('should create an AppError with context', () => {
      const context = { userId: '123', action: 'create' };
      const error = service.testCreateError(
        'Test error',
        'TEST_ERROR',
        500,
        context
      );

      expect(error.context).toEqual(context);
    });
  });

  describe('handleError', () => {
    it('should log and return AppError for generic errors', () => {
      const originalError = new Error('Original error');
      const result = service.testHandleError(
        originalError,
        'Failed to process',
        'PROCESS_FAILED',
        500,
        { userId: '123' }
      );

      expect(mockLogger.error).toHaveBeenCalled();
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Failed to process');
      expect(result.code).toBe('PROCESS_FAILED');
      expect(result.statusCode).toBe(500);
      expect(result.context).toEqual({
        originalError: 'Original error',
        userId: '123'
      });
    });

    it('should return existing AppError without wrapping', () => {
      const originalError = new AppError('Original', 'ORIGINAL_CODE', 400);
      const result = service.testHandleError(
        originalError,
        'Failed to process',
        'PROCESS_FAILED'
      );

      expect(result).toBe(originalError);
      expect(result.code).toBe('ORIGINAL_CODE');
      expect(result.statusCode).toBe(400);
    });

    it('should handle non-Error objects', () => {
      const result = service.testHandleError(
        'String error',
        'Failed to process',
        'PROCESS_FAILED'
      );

      expect(result).toBeInstanceOf(AppError);
      expect(result.context).toEqual({
        originalError: 'String error'
      });
    });
  });
});
