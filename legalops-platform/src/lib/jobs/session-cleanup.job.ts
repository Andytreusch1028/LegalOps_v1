/**
 * Session Cleanup Background Job
 * 
 * Manages the session cleanup service as a background job.
 * Can be started/stopped and provides health monitoring.
 */

import { SessionCleanupService } from '../services/session-cleanup.service';
import { ServiceFactory } from '../services/service-factory';
import { ILogger } from '../interfaces/logger.interface';
import { Result, ok, err } from '../types/result';

/**
 * Job status enumeration
 */
export enum JobStatus {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  ERROR = 'error'
}

/**
 * Job health information
 */
export interface JobHealth {
  status: JobStatus;
  lastRunAt: Date | null;
  lastSuccessAt: Date | null;
  lastErrorAt: Date | null;
  lastError: string | null;
  runCount: number;
  errorCount: number;
  uptime: number;
}

/**
 * Session cleanup background job manager
 */
export class SessionCleanupJob {
  private static instance: SessionCleanupJob | null = null;
  
  private cleanupService: SessionCleanupService | null = null;
  private logger: ILogger;
  private status: JobStatus = JobStatus.STOPPED;
  private startedAt: Date | null = null;
  private lastRunAt: Date | null = null;
  private lastSuccessAt: Date | null = null;
  private lastErrorAt: Date | null = null;
  private lastError: string | null = null;
  private runCount = 0;
  private errorCount = 0;

  private constructor() {
    this.logger = ServiceFactory.getLogger();
  }

  /**
   * Get singleton instance of the job
   */
  static getInstance(): SessionCleanupJob {
    if (!SessionCleanupJob.instance) {
      SessionCleanupJob.instance = new SessionCleanupJob();
    }
    return SessionCleanupJob.instance;
  }

  /**
   * Start the session cleanup job
   */
  async start(): Promise<Result<void>> {
    try {
      if (this.status === JobStatus.RUNNING) {
        this.logger.warn('Session cleanup job is already running');
        return ok(undefined);
      }

      this.logger.info('Starting session cleanup background job');
      this.status = JobStatus.STARTING;

      // Create cleanup service with dependencies from ServiceFactory
      this.cleanupService = new SessionCleanupService(
        this.logger,
        ServiceFactory.getSessionService(),
        ServiceFactory.getSessionRepository(),
        ServiceFactory.getAlertService()
      );

      // Start the cleanup service
      const startResult = await this.cleanupService.start();
      
      if (startResult.isFailure()) {
        this.status = JobStatus.ERROR;
        this.lastError = startResult.error.message;
        this.lastErrorAt = new Date();
        this.errorCount++;
        return err(startResult.error);
      }

      this.status = JobStatus.RUNNING;
      this.startedAt = new Date();
      this.lastSuccessAt = new Date();
      this.runCount++;

      this.logger.info('Session cleanup background job started successfully');

      // Set up process handlers for graceful shutdown
      this.setupProcessHandlers();

      return ok(undefined);
    } catch (error) {
      this.status = JobStatus.ERROR;
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.lastErrorAt = new Date();
      this.errorCount++;

      this.logger.error('Failed to start session cleanup job', error);
      
      return err(new Error(`Failed to start session cleanup job: ${this.lastError}`));
    }
  }

  /**
   * Stop the session cleanup job
   */
  async stop(): Promise<Result<void>> {
    try {
      if (this.status === JobStatus.STOPPED) {
        this.logger.warn('Session cleanup job is already stopped');
        return ok(undefined);
      }

      this.logger.info('Stopping session cleanup background job');
      this.status = JobStatus.STOPPING;

      if (this.cleanupService) {
        const stopResult = await this.cleanupService.stop();
        
        if (stopResult.isFailure()) {
          this.logger.error('Error stopping cleanup service', stopResult.error);
          // Continue with shutdown even if there's an error
        }

        this.cleanupService = null;
      }

      this.status = JobStatus.STOPPED;
      this.startedAt = null;

      this.logger.info('Session cleanup background job stopped successfully');

      return ok(undefined);
    } catch (error) {
      this.status = JobStatus.ERROR;
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.lastErrorAt = new Date();
      this.errorCount++;

      this.logger.error('Failed to stop session cleanup job', error);
      
      return err(new Error(`Failed to stop session cleanup job: ${this.lastError}`));
    }
  }

  /**
   * Restart the session cleanup job
   */
  async restart(): Promise<Result<void>> {
    this.logger.info('Restarting session cleanup background job');

    const stopResult = await this.stop();
    if (stopResult.isFailure()) {
      return stopResult;
    }

    // Wait a moment before restarting
    await new Promise(resolve => setTimeout(resolve, 1000));

    return this.start();
  }

  /**
   * Get job health information
   */
  getHealth(): JobHealth {
    const uptime = this.startedAt ? Date.now() - this.startedAt.getTime() : 0;

    return {
      status: this.status,
      lastRunAt: this.lastRunAt,
      lastSuccessAt: this.lastSuccessAt,
      lastErrorAt: this.lastErrorAt,
      lastError: this.lastError,
      runCount: this.runCount,
      errorCount: this.errorCount,
      uptime
    };
  }

  /**
   * Get current job status
   */
  getStatus(): JobStatus {
    return this.status;
  }

  /**
   * Check if the job is running
   */
  isRunning(): boolean {
    return this.status === JobStatus.RUNNING;
  }

  /**
   * Get the last analytics from the cleanup service
   */
  getLastAnalytics() {
    return this.cleanupService?.getLastAnalytics() || null;
  }

  /**
   * Manually trigger a cleanup cycle (for testing or manual intervention)
   */
  async triggerCleanup(): Promise<Result<any>> {
    try {
      if (!this.cleanupService) {
        return err(new Error('Cleanup service is not running'));
      }

      this.logger.info('Manually triggering session cleanup cycle');
      this.lastRunAt = new Date();

      const result = await this.cleanupService.runCleanupCycle();
      
      if (result.isSuccess()) {
        this.lastSuccessAt = new Date();
        this.runCount++;
        this.logger.info('Manual cleanup cycle completed successfully');
      } else {
        this.lastErrorAt = new Date();
        this.lastError = result.error.message;
        this.errorCount++;
        this.logger.error('Manual cleanup cycle failed', result.error);
      }

      return result;
    } catch (error) {
      this.lastErrorAt = new Date();
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.errorCount++;

      this.logger.error('Failed to trigger manual cleanup', error);
      
      return err(new Error(`Failed to trigger cleanup: ${this.lastError}`));
    }
  }

  /**
   * Set up process handlers for graceful shutdown
   */
  private setupProcessHandlers(): void {
    const gracefulShutdown = async (signal: string) => {
      this.logger.info(`Received ${signal}, shutting down session cleanup job gracefully`);
      
      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        this.logger.error('Error during graceful shutdown', error);
        process.exit(1);
      }
    };

    // Handle various shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception in session cleanup job', error);
      this.status = JobStatus.ERROR;
      this.lastError = error.message;
      this.lastErrorAt = new Date();
      this.errorCount++;
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled promise rejection in session cleanup job', { reason, promise });
      this.status = JobStatus.ERROR;
      this.lastError = reason instanceof Error ? reason.message : String(reason);
      this.lastErrorAt = new Date();
      this.errorCount++;
    });
  }
}

/**
 * Convenience functions for managing the session cleanup job
 */
export const sessionCleanupJob = SessionCleanupJob.getInstance();

/**
 * Start the session cleanup job
 */
export const startSessionCleanupJob = () => sessionCleanupJob.start();

/**
 * Stop the session cleanup job
 */
export const stopSessionCleanupJob = () => sessionCleanupJob.stop();

/**
 * Get session cleanup job health
 */
export const getSessionCleanupJobHealth = () => sessionCleanupJob.getHealth();

/**
 * Trigger manual cleanup
 */
export const triggerManualCleanup = () => sessionCleanupJob.triggerCleanup();