/**
 * Session Cleanup Startup Script
 * 
 * Automatically starts the session cleanup background job when the application starts.
 * Handles environment-based configuration and graceful error handling.
 */

import { sessionCleanupJob } from '../jobs/session-cleanup.job';
import { ServiceFactory } from '../services/service-factory';

/**
 * Configuration for session cleanup startup
 */
interface SessionCleanupStartupConfig {
  enabled: boolean;
  autoStart: boolean;
  startDelay: number; // Delay in milliseconds before starting
}

/**
 * Get session cleanup startup configuration from environment variables
 */
function getStartupConfig(): SessionCleanupStartupConfig {
  return {
    enabled: process.env.SESSION_CLEANUP_ENABLED !== 'false', // Default to enabled
    autoStart: process.env.SESSION_CLEANUP_AUTO_START !== 'false', // Default to auto-start
    startDelay: parseInt(process.env.SESSION_CLEANUP_START_DELAY || '5000', 10) // Default 5 seconds
  };
}

/**
 * Initialize and start the session cleanup job
 */
export async function initializeSessionCleanup(): Promise<void> {
  const logger = ServiceFactory.getLogger();
  const config = getStartupConfig();

  try {
    logger.info('Initializing session cleanup service', config);

    if (!config.enabled) {
      logger.info('Session cleanup service is disabled by configuration');
      return;
    }

    if (!config.autoStart) {
      logger.info('Session cleanup auto-start is disabled by configuration');
      return;
    }

    // Add startup delay to allow other services to initialize
    if (config.startDelay > 0) {
      logger.info(`Waiting ${config.startDelay}ms before starting session cleanup service`);
      await new Promise(resolve => setTimeout(resolve, config.startDelay));
    }

    // Start the session cleanup job
    const startResult = await sessionCleanupJob.start();

    if (startResult.isSuccess()) {
      logger.info('Session cleanup service started successfully during application startup');
      
      // Log initial health status
      const health = sessionCleanupJob.getHealth();
      logger.info('Session cleanup service health', health);
    } else {
      logger.error('Failed to start session cleanup service during application startup', startResult.error);
      
      // Don't throw error to prevent application startup failure
      // The service can be started manually later via API
    }
  } catch (error) {
    logger.error('Error during session cleanup service initialization', error);
    
    // Don't throw error to prevent application startup failure
  }
}

/**
 * Shutdown the session cleanup job gracefully
 */
export async function shutdownSessionCleanup(): Promise<void> {
  const logger = ServiceFactory.getLogger();

  try {
    logger.info('Shutting down session cleanup service');

    const stopResult = await sessionCleanupJob.stop();

    if (stopResult.isSuccess()) {
      logger.info('Session cleanup service stopped successfully during application shutdown');
    } else {
      logger.error('Error stopping session cleanup service during application shutdown', stopResult.error);
    }
  } catch (error) {
    logger.error('Error during session cleanup service shutdown', error);
  }
}

/**
 * Check if session cleanup should be enabled based on environment
 */
export function shouldEnableSessionCleanup(): boolean {
  const config = getStartupConfig();
  return config.enabled;
}

/**
 * Get session cleanup service status for health checks
 */
export function getSessionCleanupStatus() {
  return {
    isRunning: sessionCleanupJob.isRunning(),
    status: sessionCleanupJob.getStatus(),
    health: sessionCleanupJob.getHealth(),
    analytics: sessionCleanupJob.getLastAnalytics()
  };
}