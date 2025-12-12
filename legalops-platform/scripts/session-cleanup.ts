#!/usr/bin/env tsx

/**
 * Session Cleanup CLI Script
 * 
 * Command-line interface for managing the session cleanup background job.
 * Usage: npx tsx scripts/session-cleanup.ts [command]
 */

import { sessionCleanupJob } from '../src/lib/jobs/session-cleanup.job';
import { ServiceFactory } from '../src/lib/services/service-factory';

/**
 * Available CLI commands
 */
const COMMANDS = {
  start: 'Start the session cleanup job',
  stop: 'Stop the session cleanup job',
  restart: 'Restart the session cleanup job',
  status: 'Show job status and health',
  trigger: 'Trigger a manual cleanup cycle',
  help: 'Show this help message'
};

/**
 * Display help message
 */
function showHelp() {
  console.log('\nSession Cleanup Job CLI\n');
  console.log('Usage: npx tsx scripts/session-cleanup.ts [command]\n');
  console.log('Commands:');
  
  for (const [command, description] of Object.entries(COMMANDS)) {
    console.log(`  ${command.padEnd(10)} ${description}`);
  }
  
  console.log('\nExamples:');
  console.log('  npx tsx scripts/session-cleanup.ts start');
  console.log('  npx tsx scripts/session-cleanup.ts status');
  console.log('  npx tsx scripts/session-cleanup.ts trigger\n');
}

/**
 * Format duration in milliseconds to human readable format
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${Math.round(ms / 3600000)}h`;
}

/**
 * Display job status and health
 */
function showStatus() {
  const health = sessionCleanupJob.getHealth();
  const analytics = sessionCleanupJob.getLastAnalytics();

  console.log('\n📊 Session Cleanup Job Status\n');
  
  // Basic status
  console.log(`Status: ${health.status.toUpperCase()}`);
  console.log(`Running: ${sessionCleanupJob.isRunning() ? '✅ Yes' : '❌ No'}`);
  
  if (health.uptime > 0) {
    console.log(`Uptime: ${formatDuration(health.uptime)}`);
  }
  
  // Run statistics
  console.log(`\n📈 Statistics:`);
  console.log(`  Total runs: ${health.runCount}`);
  console.log(`  Errors: ${health.errorCount}`);
  
  if (health.lastRunAt) {
    console.log(`  Last run: ${health.lastRunAt.toISOString()}`);
  }
  
  if (health.lastSuccessAt) {
    console.log(`  Last success: ${health.lastSuccessAt.toISOString()}`);
  }
  
  if (health.lastErrorAt) {
    console.log(`  Last error: ${health.lastErrorAt.toISOString()}`);
    console.log(`  Error message: ${health.lastError}`);
  }

  // Analytics
  if (analytics) {
    console.log(`\n🔍 Last Cleanup Analytics:`);
    console.log(`  Active sessions: ${analytics.totalActiveSessions}`);
    console.log(`  Expired cleaned: ${analytics.expiredSessionsCleanedUp}`);
    console.log(`  Suspicious detected: ${analytics.suspiciousSessionsDetected}`);
    console.log(`  Sessions rotated: ${analytics.sessionsRotated}`);
    console.log(`  Unique users: ${analytics.uniqueActiveUsers}`);
    console.log(`  Security alerts: ${analytics.securityAlertsGenerated}`);
    
    if (analytics.averageSessionDuration > 0) {
      console.log(`  Avg session duration: ${formatDuration(analytics.averageSessionDuration)}`);
    }
  }
  
  console.log('');
}

/**
 * Main CLI function
 */
async function main() {
  const command = process.argv[2]?.toLowerCase();
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }

  if (!Object.keys(COMMANDS).includes(command)) {
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }

  const logger = ServiceFactory.getLogger();

  try {
    switch (command) {
      case 'start':
        console.log('🚀 Starting session cleanup job...');
        const startResult = await sessionCleanupJob.start();
        
        if (startResult.isSuccess()) {
          console.log('✅ Session cleanup job started successfully');
          showStatus();
        } else {
          console.error('❌ Failed to start session cleanup job:', startResult.error.message);
          process.exit(1);
        }
        break;

      case 'stop':
        console.log('🛑 Stopping session cleanup job...');
        const stopResult = await sessionCleanupJob.stop();
        
        if (stopResult.isSuccess()) {
          console.log('✅ Session cleanup job stopped successfully');
        } else {
          console.error('❌ Failed to stop session cleanup job:', stopResult.error.message);
          process.exit(1);
        }
        break;

      case 'restart':
        console.log('🔄 Restarting session cleanup job...');
        const restartResult = await sessionCleanupJob.restart();
        
        if (restartResult.isSuccess()) {
          console.log('✅ Session cleanup job restarted successfully');
          showStatus();
        } else {
          console.error('❌ Failed to restart session cleanup job:', restartResult.error.message);
          process.exit(1);
        }
        break;

      case 'status':
        showStatus();
        break;

      case 'trigger':
        console.log('⚡ Triggering manual cleanup cycle...');
        const triggerResult = await sessionCleanupJob.triggerCleanup();
        
        if (triggerResult.isSuccess()) {
          console.log('✅ Manual cleanup cycle completed successfully');
          
          const analytics = triggerResult.value;
          console.log('\n📊 Cleanup Results:');
          console.log(`  Expired sessions cleaned: ${analytics.expiredSessionsCleanedUp}`);
          console.log(`  Suspicious sessions detected: ${analytics.suspiciousSessionsDetected}`);
          console.log(`  Sessions rotated: ${analytics.sessionsRotated}`);
          console.log(`  Security alerts generated: ${analytics.securityAlertsGenerated}`);
        } else {
          console.error('❌ Failed to trigger manual cleanup:', triggerResult.error.message);
          process.exit(1);
        }
        break;
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  
  try {
    await sessionCleanupJob.stop();
    console.log('✅ Session cleanup job stopped');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Run the CLI
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});