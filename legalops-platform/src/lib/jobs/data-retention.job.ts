/**
 * Data Retention Policy Enforcement Job
 * 
 * Background job that enforces data retention policies by automatically
 * deleting or anonymizing data that has exceeded its retention period.
 */

import { BaseService } from '../services/base.service';
import { ServiceFactory } from '../services/service-factory';
import { ILogger } from '../interfaces/logger.interface';
import { Result, ok, err } from '../types/result';

/**
 * Data retention job configuration
 */
export interface DataRetentionJobConfig {
  enabled: boolean;
  runIntervalMs: number; // How often to run the job
  batchSize: number; // How many records to process at once
  dryRun: boolean; // If true, only log what would be deleted without actually deleting
}

/**
 * Default configuration
 */
export const DEFAULT_DATA_RETENTION_CONFIG: DataRetentionJobConfig = {
  enabled: process.env.DATA_RETENTION_ENABLED !== 'false',
  runIntervalMs: 24 * 60 * 60 * 1000, // Daily
  batchSize: 100,
  dryRun: process.env.DATA_RETENTION_DRY_RUN === 'true'
};

/**
 * Data retention enforcement results
 */
export interface DataRetentionResult {
  runId: string;
  startedAt: Date;
  completedAt: Date;
  dryRun: boolean;
  summary: {
    profilesProcessed: number;
    profilesDeleted: number;
    logsProcessed: number;
    logsDeleted: number;
    draftsProcessed: number;
    draftsDeleted: number;
    sessionsProcessed: number;
    sessionsDeleted: number;
  };
  errors: Array<{
    type: string;
    message: string;
    recordId?: string;
  }>;
}

/**
 * Data retention policy enforcement job
 */
export class DataRetentionJob extends BaseService {
  readonly name = 'DataRetentionJob';
  
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastRun: Date | null = null;
  private config: DataRetentionJobConfig;

  constructor(
    logger: ILogger,
    config: DataRetentionJobConfig = DEFAULT_DATA_RETENTION_CONFIG
  ) {
    super(logger);
    this.config = config;
  }

  /**
   * Start the data retention job
   */
  async start(): Promise<Result<void>> {
    try {
      if (!this.config.enabled) {
        this.logInfo('Data retention job is disabled by configuration');
        return ok(undefined);
      }

      if (this.isRunning) {
        this.logWarn('Data retention job is already running');
        return ok(undefined);
      }

      this.logInfo('Starting data retention enforcement job', {
        interval: this.config.runIntervalMs,
        batchSize: this.config.batchSize,
        dryRun: this.config.dryRun
      });

      this.isRunning = true;

      // Run initial enforcement
      await this.runRetentionEnforcement();

      // Schedule recurring enforcement
      this.timer = setInterval(async () => {
        try {
          await this.runRetentionEnforcement();
        } catch (error) {
          this.logError('Error in scheduled retention enforcement', error);
        }
      }, this.config.runIntervalMs);

      this.logInfo('Data retention job started successfully');
      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to start data retention job',
        'DATA_RETENTION_START_FAILED',
        500
      ));
    }
  }

  /**
   * Stop the data retention job
   */
  async stop(): Promise<Result<void>> {
    try {
      if (!this.isRunning) {
        this.logWarn('Data retention job is not running');
        return ok(undefined);
      }

      this.logInfo('Stopping data retention enforcement job');

      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }

      this.isRunning = false;

      this.logInfo('Data retention job stopped successfully');
      return ok(undefined);
    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to stop data retention job',
        'DATA_RETENTION_STOP_FAILED',
        500
      ));
    }
  }

  /**
   * Run data retention enforcement
   */
  async runRetentionEnforcement(): Promise<Result<DataRetentionResult>> {
    const runId = `retention_${Date.now()}`;
    const startedAt = new Date();

    try {
      this.logInfo('Starting data retention enforcement run', { runId, dryRun: this.config.dryRun });

      const result: DataRetentionResult = {
        runId,
        startedAt,
        completedAt: new Date(), // Will be updated at the end
        dryRun: this.config.dryRun,
        summary: {
          profilesProcessed: 0,
          profilesDeleted: 0,
          logsProcessed: 0,
          logsDeleted: 0,
          draftsProcessed: 0,
          draftsDeleted: 0,
          sessionsProcessed: 0,
          sessionsDeleted: 0
        },
        errors: []
      };

      // Get privacy compliance service
      const privacyService = ServiceFactory.getPrivacyComplianceService();

      // Enforce retention policies
      const enforcementResult = await privacyService.enforceDataRetentionPolicies();
      
      if (enforcementResult.isSuccess()) {
        const enforcement = enforcementResult.data;
        result.summary.profilesDeleted = enforcement.profilesDeleted;
        result.summary.logsDeleted = enforcement.logsDeleted;
        result.summary.draftsDeleted = enforcement.draftsDeleted;
      } else {
        result.errors.push({
          type: 'ENFORCEMENT_ERROR',
          message: enforcementResult.error.message
        });
      }

      // Clean up expired sessions
      const sessionService = ServiceFactory.getSessionService();
      const sessionCleanupResult = await sessionService.cleanupExpiredSessions();
      
      if (sessionCleanupResult.isSuccess()) {
        result.summary.sessionsDeleted = sessionCleanupResult.data;
      } else {
        result.errors.push({
          type: 'SESSION_CLEANUP_ERROR',
          message: sessionCleanupResult.error.message
        });
      }

      // Additional retention enforcement would go here:
      // - Clean up old audit logs
      // - Remove expired temporary files
      // - Anonymize old analytics data
      // - etc.

      result.completedAt = new Date();
      this.lastRun = result.completedAt;

      this.logInfo('Data retention enforcement completed', {
        runId,
        duration: result.completedAt.getTime() - result.startedAt.getTime(),
        summary: result.summary,
        errorCount: result.errors.length
      });

      return ok(result);
    } catch (error) {
      return err(this.handleError(
        error,
        'Data retention enforcement failed',
        'DATA_RETENTION_ENFORCEMENT_FAILED',
        500,
        { runId }
      ));
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      enabled: this.config.enabled,
      lastRun: this.lastRun,
      config: this.config
    };
  }

  /**
   * Update job configuration
   */
  updateConfig(newConfig: Partial<DataRetentionJobConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logInfo('Data retention job configuration updated', this.config);
  }
}

/**
 * Singleton instance for the data retention job
 */
let dataRetentionJobInstance: DataRetentionJob | null = null;

/**
 * Get the data retention job instance
 */
export function getDataRetentionJob(): DataRetentionJob {
  if (!dataRetentionJobInstance) {
    dataRetentionJobInstance = new DataRetentionJob(ServiceFactory.getLogger());
  }
  return dataRetentionJobInstance;
}

/**
 * Start the data retention job
 */
export const startDataRetentionJob = () => getDataRetentionJob().start();

/**
 * Stop the data retention job
 */
export const stopDataRetentionJob = () => getDataRetentionJob().stop();

/**
 * Get data retention job status
 */
export const getDataRetentionJobStatus = () => getDataRetentionJob().getStatus();