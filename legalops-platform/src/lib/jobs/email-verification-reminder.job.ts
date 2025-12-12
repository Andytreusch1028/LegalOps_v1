/**
 * Email Verification Reminder Job
 * 
 * Background job to send reminder emails to users who haven't verified their email addresses.
 * This job should be scheduled to run periodically (e.g., daily) to find unverified users
 * and send them reminder emails.
 */

import { BaseService } from '../services/base.service';
import { ILogger } from '../interfaces/logger.interface';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { IAuthEmailService } from '../interfaces/auth-email.interface';
import { Result, ok, err } from '../types/result';

/**
 * Email verification reminder job configuration
 */
export interface EmailVerificationReminderConfig {
  /**
   * How many hours after registration to send first reminder
   */
  firstReminderAfterHours: number;
  
  /**
   * How many hours after first reminder to send second reminder
   */
  secondReminderAfterHours: number;
  
  /**
   * Maximum age of unverified accounts to process (in days)
   */
  maxAccountAgeDays: number;
  
  /**
   * Batch size for processing users
   */
  batchSize: number;
}

/**
 * Default configuration
 */
export const DEFAULT_REMINDER_CONFIG: EmailVerificationReminderConfig = {
  firstReminderAfterHours: 24, // Send first reminder after 24 hours
  secondReminderAfterHours: 72, // Send second reminder after 72 hours total
  maxAccountAgeDays: 7, // Only process accounts up to 7 days old
  batchSize: 100 // Process 100 users at a time
};

/**
 * Job execution result
 */
export interface EmailVerificationReminderResult {
  processedUsers: number;
  firstRemindersSet: number;
  secondRemindersSent: number;
  errors: number;
  skippedUsers: number;
}

/**
 * Email verification reminder job
 */
export class EmailVerificationReminderJob extends BaseService {
  readonly name = 'EmailVerificationReminderJob';

  constructor(
    logger: ILogger,
    private readonly userRepository: IUserRepository,
    private readonly authEmailService: IAuthEmailService,
    private readonly config: EmailVerificationReminderConfig = DEFAULT_REMINDER_CONFIG
  ) {
    super(logger);
  }

  /**
   * Execute the email verification reminder job
   */
  async execute(): Promise<Result<EmailVerificationReminderResult>> {
    try {
      this.logInfo('Starting email verification reminder job');

      const result: EmailVerificationReminderResult = {
        processedUsers: 0,
        firstRemindersSet: 0,
        secondRemindersSent: 0,
        errors: 0,
        skippedUsers: 0
      };

      // Calculate cutoff dates
      const now = new Date();
      const maxAge = new Date(now.getTime() - (this.config.maxAccountAgeDays * 24 * 60 * 60 * 1000));
      const firstReminderCutoff = new Date(now.getTime() - (this.config.firstReminderAfterHours * 60 * 60 * 1000));
      const secondReminderCutoff = new Date(now.getTime() - (this.config.secondReminderAfterHours * 60 * 60 * 1000));

      this.logInfo('Processing unverified users', {
        maxAge: maxAge.toISOString(),
        firstReminderCutoff: firstReminderCutoff.toISOString(),
        secondReminderCutoff: secondReminderCutoff.toISOString(),
        batchSize: this.config.batchSize
      });

      // Get unverified users in batches
      let offset = 0;
      let hasMoreUsers = true;

      while (hasMoreUsers) {
        const usersResult = await this.userRepository.findUnverifiedUsers({
          limit: this.config.batchSize,
          offset,
          createdAfter: maxAge,
          createdBefore: firstReminderCutoff
        });

        if (!usersResult.success) {
          this.logError('Failed to fetch unverified users', usersResult.error);
          result.errors++;
          break;
        }

        const users = usersResult.data;
        if (users.length === 0) {
          hasMoreUsers = false;
          break;
        }

        // Process each user
        for (const user of users) {
          try {
            result.processedUsers++;

            // Skip if user doesn't have a valid verification token
            if (!user.emailVerificationToken) {
              this.logWarn('User has no verification token, skipping', { userId: user.id });
              result.skippedUsers++;
              continue;
            }

            // Check if token is expired
            if (user.emailVerificationExpires && user.emailVerificationExpires < now) {
              this.logWarn('User verification token expired, skipping', { userId: user.id });
              result.skippedUsers++;
              continue;
            }

            // Determine which reminder to send based on account age
            const accountAge = now.getTime() - user.createdAt.getTime();
            const hoursOld = accountAge / (1000 * 60 * 60);

            if (hoursOld >= this.config.secondReminderAfterHours && !user.secondReminderSent) {
              // Send second reminder
              await this.sendSecondReminder(user, result);
            } else if (hoursOld >= this.config.firstReminderAfterHours && !user.firstReminderSent) {
              // Send first reminder
              await this.sendFirstReminder(user, result);
            } else {
              // Not ready for reminder yet
              result.skippedUsers++;
            }

          } catch (error) {
            this.logError('Error processing user for verification reminder', error, { userId: user.id });
            result.errors++;
          }
        }

        offset += this.config.batchSize;
      }

      this.logInfo('Email verification reminder job completed', result);
      return ok(result);

    } catch (error) {
      return err(this.handleError(
        error,
        'Email verification reminder job failed',
        'EMAIL_VERIFICATION_REMINDER_JOB_FAILED',
        500
      ));
    }
  }

  /**
   * Send first reminder and mark as sent
   */
  private async sendFirstReminder(user: any, result: EmailVerificationReminderResult): Promise<void> {
    try {
      // Send reminder email
      const emailResult = await this.authEmailService.sendVerificationReminder(user, user.emailVerificationToken);
      
      if (emailResult.success) {
        // Mark first reminder as sent
        await this.userRepository.update(user.id, {
          firstReminderSent: true,
          firstReminderSentAt: new Date()
        });
        
        result.firstRemindersSet++;
        this.logInfo('First verification reminder sent', { userId: user.id, email: user.email });
      } else {
        this.logError('Failed to send first verification reminder', emailResult.error, { userId: user.id });
        result.errors++;
      }
    } catch (error) {
      this.logError('Error sending first verification reminder', error, { userId: user.id });
      result.errors++;
    }
  }

  /**
   * Send second reminder and mark as sent
   */
  private async sendSecondReminder(user: any, result: EmailVerificationReminderResult): Promise<void> {
    try {
      // Send reminder email
      const emailResult = await this.authEmailService.sendVerificationReminder(user, user.emailVerificationToken);
      
      if (emailResult.success) {
        // Mark second reminder as sent
        await this.userRepository.update(user.id, {
          secondReminderSent: true,
          secondReminderSentAt: new Date()
        });
        
        result.secondRemindersSent++;
        this.logInfo('Second verification reminder sent', { userId: user.id, email: user.email });
      } else {
        this.logError('Failed to send second verification reminder', emailResult.error, { userId: user.id });
        result.errors++;
      }
    } catch (error) {
      this.logError('Error sending second verification reminder', error, { userId: user.id });
      result.errors++;
    }
  }

  /**
   * Clean up expired verification tokens
   */
  async cleanupExpiredTokens(): Promise<Result<{ cleanedUp: number }>> {
    try {
      this.logInfo('Starting cleanup of expired verification tokens');

      const now = new Date();
      
      // Find users with expired verification tokens
      const expiredUsersResult = await this.userRepository.findUsersWithExpiredVerificationTokens(now);
      
      if (!expiredUsersResult.success) {
        return err(expiredUsersResult.error);
      }

      const expiredUsers = expiredUsersResult.data;
      let cleanedUp = 0;

      for (const user of expiredUsers) {
        try {
          // Clear expired token
          await this.userRepository.update(user.id, {
            emailVerificationToken: null,
            emailVerificationExpires: null,
            firstReminderSent: false,
            secondReminderSent: false
          });
          
          cleanedUp++;
          this.logInfo('Cleared expired verification token', { userId: user.id });
        } catch (error) {
          this.logError('Failed to clear expired verification token', error, { userId: user.id });
        }
      }

      this.logInfo('Expired verification token cleanup completed', { cleanedUp });
      return ok({ cleanedUp });

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to cleanup expired verification tokens',
        'VERIFICATION_TOKEN_CLEANUP_FAILED',
        500
      ));
    }
  }
}