#!/usr/bin/env tsx

/**
 * Email Verification Reminders CLI Script
 * 
 * Manages email verification reminder jobs and cleanup tasks.
 * 
 * Usage:
 *   npm run email-reminders send        # Send verification reminders
 *   npm run email-reminders cleanup     # Clean up expired tokens
 *   npm run email-reminders status      # Show reminder statistics
 */

import { ServiceFactory } from '../src/lib/services/service-factory';
import { EmailVerificationReminderJob } from '../src/lib/jobs/email-verification-reminder.job';

/**
 * Show usage information
 */
function showUsage(): void {
  console.log(`
Email Verification Reminders Management

Usage:
  npm run email-reminders <command>

Commands:
  send      Send verification reminder emails to unverified users
  cleanup   Clean up expired verification tokens
  status    Show verification reminder statistics
  help      Show this help message

Examples:
  npm run email-reminders send
  npm run email-reminders cleanup
  npm run email-reminders status
`);
}

/**
 * Send verification reminders
 */
async function sendReminders(): Promise<void> {
  try {
    console.log('🔄 Starting email verification reminder job...');

    const logger = ServiceFactory.getLogger();
    const userRepository = ServiceFactory.getUserRepository();
    const authEmailService = ServiceFactory.getAuthEmailService();

    const reminderJob = new EmailVerificationReminderJob(
      logger,
      userRepository,
      authEmailService
    );

    const result = await reminderJob.execute();

    if (result.success) {
      const stats = result.data;
      console.log('✅ Email verification reminder job completed successfully!');
      console.log(`
📊 Results:
  • Processed users: ${stats.processedUsers}
  • First reminders sent: ${stats.firstRemindersSet}
  • Second reminders sent: ${stats.secondRemindersSent}
  • Skipped users: ${stats.skippedUsers}
  • Errors: ${stats.errors}
`);

      if (stats.errors > 0) {
        console.log('⚠️  Some errors occurred. Check the logs for details.');
        process.exit(1);
      }
    } else {
      console.error('❌ Email verification reminder job failed:', result.error.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

/**
 * Clean up expired tokens
 */
async function cleanupExpiredTokens(): Promise<void> {
  try {
    console.log('🔄 Starting expired verification token cleanup...');

    const logger = ServiceFactory.getLogger();
    const userRepository = ServiceFactory.getUserRepository();
    const authEmailService = ServiceFactory.getAuthEmailService();

    const reminderJob = new EmailVerificationReminderJob(
      logger,
      userRepository,
      authEmailService
    );

    const result = await reminderJob.cleanupExpiredTokens();

    if (result.success) {
      const stats = result.data;
      console.log('✅ Expired token cleanup completed successfully!');
      console.log(`
📊 Results:
  • Tokens cleaned up: ${stats.cleanedUp}
`);
    } else {
      console.error('❌ Expired token cleanup failed:', result.error.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

/**
 * Show verification reminder statistics
 */
async function showStatus(): Promise<void> {
  try {
    console.log('🔄 Gathering verification reminder statistics...');

    const userRepository = ServiceFactory.getUserRepository();

    // Get unverified user counts
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // This would require additional repository methods to get these statistics
    // For now, we'll show a placeholder message
    console.log('📊 Verification Reminder Statistics:');
    console.log(`
  • Total unverified users: [Requires additional repository methods]
  • Users needing first reminder: [Requires additional repository methods]
  • Users needing second reminder: [Requires additional repository methods]
  • Expired tokens: [Requires additional repository methods]

Note: To get detailed statistics, additional repository methods need to be implemented.
`);

  } catch (error) {
    console.error('❌ Failed to get statistics:', error);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const command = process.argv[2];

  switch (command) {
    case 'send':
      await sendReminders();
      break;
    
    case 'cleanup':
      await cleanupExpiredTokens();
      break;
    
    case 'status':
      await showStatus();
      break;
    
    case 'help':
    case '--help':
    case '-h':
      showUsage();
      break;
    
    default:
      console.error('❌ Unknown command:', command);
      showUsage();
      process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { main };