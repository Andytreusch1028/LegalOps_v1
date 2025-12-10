import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConsoleLogger } from './console-logger';

describe('ConsoleLogger', () => {
  let logger: ConsoleLogger;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  let consoleDebugSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  describe('without service name', () => {
    beforeEach(() => {
      logger = new ConsoleLogger();
    });

    it('should log info messages', () => {
      logger.info('Test message', { key: 'value' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('INFO');
      expect(logCall).toContain('Test message');
    });

    it('should log warning messages', () => {
      logger.warn('Warning message', { key: 'value' });

      expect(consoleWarnSpy).toHaveBeenCalled();
      const logCall = consoleWarnSpy.mock.calls[0][0];
      expect(logCall).toContain('WARN');
      expect(logCall).toContain('Warning message');
    });

    it('should log error messages', () => {
      logger.error('Error message', { key: 'value' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toContain('ERROR');
      expect(logCall).toContain('Error message');
    });
  });

  describe('with service name', () => {
    beforeEach(() => {
      logger = new ConsoleLogger('TestService');
    });

    it('should include service name in logs', () => {
      logger.info('Test message');

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('[TestService]');
    });
  });

  describe('debug logging', () => {
    it('should log debug messages in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      logger = new ConsoleLogger('TestService');
      logger.debug('Debug message', { key: 'value' });

      expect(consoleDebugSpy).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not log debug messages in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      logger = new ConsoleLogger('TestService');
      logger.debug('Debug message', { key: 'value' });

      expect(consoleDebugSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('context logging', () => {
    beforeEach(() => {
      logger = new ConsoleLogger('TestService');
    });

    it('should include context in logs', () => {
      const context = { userId: '123', action: 'create' };
      logger.info('Test message', context);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0][1]).toEqual(context);
    });

    it('should handle empty context', () => {
      logger.info('Test message');

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0][1]).toBe('');
    });
  });
});
