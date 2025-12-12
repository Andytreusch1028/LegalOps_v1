import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { BaseService } from './base.service';
import { IAuthenticationService, RegisterData, SessionMetadata, AuthSessionWithUser, PasswordResetData } from '../interfaces/authentication.interface';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { ISessionService } from '../interfaces/session.interface';
import { IAuthEmailService } from '../interfaces/auth-email.interface';
import { ILogger } from '../interfaces/logger.interface';
import { Result, ok, err } from '../types/result';
import { User } from '@/generated/prisma';

/**
 * Authentication service implementation.
 * Handles user registration, login, logout, and password management.
 */
export class AuthenticationService extends BaseService implements IAuthenticationService {
  readonly name = 'AuthenticationService';

  // Password requirements
  private static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly BCRYPT_SALT_ROUNDS = 12;
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION_MINUTES = 15;
  private static readonly EMAIL_VERIFICATION_EXPIRES_HOURS = 24;
  private static readonly PASSWORD_RESET_EXPIRES_HOURS = 1;

  constructor(
    logger: ILogger,
    private readonly userRepository: IUserRepository,
    private readonly sessionService: ISessionService,
    private readonly authEmailService: IAuthEmailService
  ) {
    super(logger);
  }

  /**
   * Register a new user account.
   */
  async register(userData: RegisterData): Promise<Result<User>> {
    try {
      this.logInfo('Starting user registration', { email: userData.email });

      // Validate email availability
      const emailAvailableResult = await this.isEmailAvailable(userData.email);
      if (!emailAvailableResult.success) {
        return err(emailAvailableResult.error);
      }

      if (!emailAvailableResult.data) {
        return err(this.createError(
          'Email address is already registered',
          'EMAIL_ALREADY_EXISTS',
          409,
          { email: userData.email }
        ));
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(userData.password);
      if (!passwordValidation.success) {
        return err(passwordValidation.error);
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, AuthenticationService.BCRYPT_SALT_ROUNDS);

      // Generate email verification token
      const emailVerificationToken = this.generateSecureToken();
      const emailVerificationExpires = new Date();
      emailVerificationExpires.setHours(emailVerificationExpires.getHours() + AuthenticationService.EMAIL_VERIFICATION_EXPIRES_HOURS);

      // Create user
      const createUserResult = await this.userRepository.create({
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
        loginAttempts: 0,
      });

      if (!createUserResult.success) {
        return err(this.handleError(
          createUserResult.error,
          'Failed to create user account',
          'USER_CREATION_FAILED',
          500,
          { email: userData.email }
        ));
      }

      const user = createUserResult.data;

      // Send verification email
      const emailResult = await this.authEmailService.sendEmailVerification(user, emailVerificationToken);

      if (!emailResult.success) {
        this.logWarn('Failed to send verification email', { 
          userId: user.id, 
          email: user.email,
          error: emailResult.error 
        });
        // Don't fail registration if email fails - user can request resend
      }

      this.logInfo('User registration completed', { 
        userId: user.id, 
        email: user.email 
      });

      return ok(user);

    } catch (error) {
      return err(this.handleError(
        error,
        'Registration failed due to unexpected error',
        'REGISTRATION_ERROR',
        500,
        { email: userData.email }
      ));
    }
  }

  /**
   * Authenticate a user with email and password.
   */
  async login(email: string, password: string, metadata?: SessionMetadata): Promise<Result<AuthSessionWithUser>> {
    try {
      this.logInfo('Starting user login', { email });

      // Find user by email
      const userResult = await this.userRepository.findByEmail(email);
      if (!userResult.success) {
        return err(userResult.error);
      }

      const user = userResult.data;
      if (!user) {
        return err(this.createError(
          'Invalid email or password',
          'INVALID_CREDENTIALS',
          401
        ));
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const lockoutMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
        return err(this.createError(
          `Account is locked. Try again in ${lockoutMinutes} minutes.`,
          'ACCOUNT_LOCKED',
          423,
          { lockedUntil: user.lockedUntil }
        ));
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return err(this.createError(
          'Please verify your email address before logging in',
          'EMAIL_NOT_VERIFIED',
          403,
          { userId: user.id }
        ));
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        // Increment login attempts
        await this.handleFailedLogin(user.id, user.loginAttempts);
        
        return err(this.createError(
          'Invalid email or password',
          'INVALID_CREDENTIALS',
          401
        ));
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0 || user.lockedUntil) {
        await this.userRepository.update(user.id, {
          loginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date()
        });
      } else {
        await this.userRepository.update(user.id, {
          lastLoginAt: new Date()
        });
      }

      // Create session
      const sessionResult = await this.sessionService.createSession(user.id, metadata || {});
      if (!sessionResult.success) {
        return err(sessionResult.error);
      }

      const session = sessionResult.data;

      // Send security notification for successful login
      const securityNotificationResult = await this.authEmailService.sendSecurityNotification(
        user, 
        'Successful login', 
        {
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
          location: metadata?.location
        }
      );

      if (!securityNotificationResult.success) {
        this.logWarn('Failed to send login security notification', { 
          userId: user.id, 
          error: securityNotificationResult.error 
        });
        // Don't fail login if security notification fails
      }

      this.logInfo('User login successful', { 
        userId: user.id, 
        email: user.email,
        sessionId: session.id
      });

      return ok({
        ...session,
        user: {
          ...user,
          loginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date()
        }
      });

    } catch (error) {
      return err(this.handleError(
        error,
        'Login failed due to unexpected error',
        'LOGIN_ERROR',
        500,
        { email }
      ));
    }
  }

  /**
   * Log out a user by invalidating their session.
   */
  async logout(sessionId: string): Promise<Result<void>> {
    try {
      this.logInfo('Starting user logout', { sessionId });

      const result = await this.sessionService.invalidateSession(sessionId);
      if (!result.success) {
        return err(result.error);
      }

      this.logInfo('User logout successful', { sessionId });
      return ok(undefined);

    } catch (error) {
      return err(this.handleError(
        error,
        'Logout failed due to unexpected error',
        'LOGOUT_ERROR',
        500,
        { sessionId }
      ));
    }
  }

  /**
   * Verify a user's email address using verification token.
   */
  async verifyEmail(token: string): Promise<Result<User>> {
    try {
      this.logInfo('Starting email verification', { token: token.substring(0, 8) + '...' });

      const userResult = await this.userRepository.findByVerificationToken(token);
      if (!userResult.success) {
        return err(userResult.error);
      }

      const user = userResult.data;
      if (!user) {
        return err(this.createError(
          'Invalid or expired verification token',
          'INVALID_TOKEN',
          400
        ));
      }

      // Check if token is expired
      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        return err(this.createError(
          'Verification token has expired',
          'TOKEN_EXPIRED',
          400,
          { userId: user.id }
        ));
      }

      // Activate user account
      const updateResult = await this.userRepository.update(user.id, {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      });

      if (!updateResult.success) {
        return err(updateResult.error);
      }

      const verifiedUser = updateResult.data;

      // Send welcome email
      const welcomeEmailResult = await this.authEmailService.sendWelcomeEmail(verifiedUser);
      if (!welcomeEmailResult.success) {
        this.logWarn('Failed to send welcome email', { 
          userId: verifiedUser.id, 
          email: verifiedUser.email,
          error: welcomeEmailResult.error 
        });
        // Don't fail verification if welcome email fails
      }

      this.logInfo('Email verification successful', { userId: user.id });
      return ok(verifiedUser);

    } catch (error) {
      return err(this.handleError(
        error,
        'Email verification failed due to unexpected error',
        'EMAIL_VERIFICATION_ERROR',
        500
      ));
    }
  }

  /**
   * Request a password reset for a user.
   */
  async requestPasswordReset(email: string): Promise<Result<void>> {
    try {
      this.logInfo('Starting password reset request', { email });

      const userResult = await this.userRepository.findByEmail(email);
      if (!userResult.success) {
        return err(userResult.error);
      }

      const user = userResult.data;
      if (!user) {
        // Don't reveal if email exists - return success anyway for security
        this.logInfo('Password reset requested for non-existent email', { email });
        return ok(undefined);
      }

      // Generate password reset token
      const passwordResetToken = this.generateSecureToken();
      const passwordResetExpires = new Date();
      passwordResetExpires.setHours(passwordResetExpires.getHours() + AuthenticationService.PASSWORD_RESET_EXPIRES_HOURS);

      // Update user with reset token
      const updateResult = await this.userRepository.update(user.id, {
        passwordResetToken,
        passwordResetExpires
      });

      if (!updateResult.success) {
        return err(updateResult.error);
      }

      // Send password reset email
      const emailResult = await this.authEmailService.sendPasswordResetEmail(user, passwordResetToken);

      if (!emailResult.success) {
        this.logWarn('Failed to send password reset email', { 
          userId: user.id, 
          email: user.email,
          error: emailResult.error 
        });
        return err(this.createError(
          'Failed to send password reset email',
          'EMAIL_SEND_FAILED',
          500
        ));
      }

      this.logInfo('Password reset email sent', { userId: user.id });
      return ok(undefined);

    } catch (error) {
      return err(this.handleError(
        error,
        'Password reset request failed due to unexpected error',
        'PASSWORD_RESET_REQUEST_ERROR',
        500,
        { email }
      ));
    }
  }

  /**
   * Reset a user's password using reset token.
   */
  async resetPassword(resetData: PasswordResetData): Promise<Result<User>> {
    try {
      this.logInfo('Starting password reset', { token: resetData.token.substring(0, 8) + '...' });

      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(resetData.newPassword);
      if (!passwordValidation.success) {
        return err(passwordValidation.error);
      }

      const userResult = await this.userRepository.findByPasswordResetToken(resetData.token);
      if (!userResult.success) {
        return err(userResult.error);
      }

      const user = userResult.data;
      if (!user) {
        return err(this.createError(
          'Invalid or expired reset token',
          'INVALID_TOKEN',
          400
        ));
      }

      // Check if token is expired
      if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        return err(this.createError(
          'Reset token has expired',
          'TOKEN_EXPIRED',
          400,
          { userId: user.id }
        ));
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(resetData.newPassword, AuthenticationService.BCRYPT_SALT_ROUNDS);

      // Update user with new password and clear reset token
      const updateResult = await this.userRepository.update(user.id, {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        loginAttempts: 0, // Reset login attempts
        lockedUntil: null // Clear any lockout
      });

      if (!updateResult.success) {
        return err(updateResult.error);
      }

      // Invalidate all existing sessions for security
      await this.sessionService.invalidateAllUserSessions(user.id);

      const updatedUser = updateResult.data;

      // Send password change confirmation email
      const confirmationResult = await this.authEmailService.sendPasswordChangeConfirmation(updatedUser);
      if (!confirmationResult.success) {
        this.logWarn('Failed to send password change confirmation', { 
          userId: updatedUser.id, 
          error: confirmationResult.error 
        });
        // Don't fail password reset if confirmation email fails
      }

      this.logInfo('Password reset successful', { userId: user.id });
      return ok(updatedUser);

    } catch (error) {
      return err(this.handleError(
        error,
        'Password reset failed due to unexpected error',
        'PASSWORD_RESET_ERROR',
        500
      ));
    }
  }

  /**
   * Validate an authentication session.
   */
  async validateSession(sessionId: string): Promise<Result<AuthSessionWithUser>> {
    try {
      const sessionResult = await this.sessionService.validateSession(sessionId);
      if (!sessionResult.success) {
        return err(sessionResult.error);
      }

      const session = sessionResult.data;

      // Get user data
      const userResult = await this.userRepository.findById(session.userId);
      if (!userResult.success) {
        return err(userResult.error);
      }

      const user = userResult.data;
      if (!user) {
        return err(this.createError(
          'User not found for session',
          'USER_NOT_FOUND',
          404,
          { sessionId, userId: session.userId }
        ));
      }

      return ok({
        ...session,
        user
      });

    } catch (error) {
      return err(this.handleError(
        error,
        'Session validation failed due to unexpected error',
        'SESSION_VALIDATION_ERROR',
        500,
        { sessionId }
      ));
    }
  }

  /**
   * Check if an email address is available for registration.
   */
  async isEmailAvailable(email: string): Promise<Result<boolean>> {
    try {
      const userResult = await this.userRepository.findByEmail(email);
      if (!userResult.success) {
        return err(userResult.error);
      }

      return ok(userResult.data === null);

    } catch (error) {
      return err(this.handleError(
        error,
        'Email availability check failed',
        'EMAIL_CHECK_ERROR',
        500,
        { email }
      ));
    }
  }

  /**
   * Validate password strength.
   */
  validatePasswordStrength(password: string): Result<boolean> {
    const errors: string[] = [];

    if (password.length < AuthenticationService.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${AuthenticationService.MIN_PASSWORD_LENGTH} characters long`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (errors.length > 0) {
      return err(this.createError(
        'Password does not meet strength requirements',
        'WEAK_PASSWORD',
        400,
        { requirements: errors }
      ));
    }

    return ok(true);
  }

  /**
   * Handle failed login attempt.
   */
  private async handleFailedLogin(userId: string, currentAttempts: number): Promise<void> {
    const newAttempts = currentAttempts + 1;
    
    if (newAttempts >= AuthenticationService.MAX_LOGIN_ATTEMPTS) {
      // Lock account
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + AuthenticationService.LOCKOUT_DURATION_MINUTES);
      
      await this.userRepository.update(userId, {
        loginAttempts: newAttempts,
        lockedUntil
      });

      // Get user for notification
      const userResult = await this.userRepository.findById(userId);
      if (userResult.success && userResult.data) {
        const user = userResult.data;
        const lockReason = `Too many failed login attempts (${newAttempts}/${AuthenticationService.MAX_LOGIN_ATTEMPTS})`;
        
        // Send account locked notification
        const notificationResult = await this.authEmailService.sendAccountLockedNotification(user, lockReason);
        if (!notificationResult.success) {
          this.logWarn('Failed to send account locked notification', { 
            userId, 
            error: notificationResult.error 
          });
        }
      }

      this.logWarn('Account locked due to too many failed login attempts', { 
        userId, 
        attempts: newAttempts,
        lockedUntil 
      });
    } else {
      await this.userRepository.update(userId, {
        loginAttempts: newAttempts
      });

      this.logWarn('Failed login attempt recorded', { 
        userId, 
        attempts: newAttempts 
      });
    }
  }

  /**
   * Unlock a user account (admin function)
   */
  async unlockAccount(userId: string): Promise<Result<User>> {
    try {
      this.logInfo('Unlocking user account', { userId });

      // Get user first
      const userResult = await this.userRepository.findById(userId);
      if (!userResult.success || !userResult.data) {
        return err(this.createError(
          'User not found',
          'USER_NOT_FOUND',
          404,
          { userId }
        ));
      }

      const user = userResult.data;

      // Unlock account
      const updateResult = await this.userRepository.update(userId, {
        loginAttempts: 0,
        lockedUntil: null
      });

      if (!updateResult.success) {
        return err(updateResult.error);
      }

      const unlockedUser = updateResult.data;

      // Send account unlocked notification
      const notificationResult = await this.authEmailService.sendAccountUnlockedNotification(unlockedUser);
      if (!notificationResult.success) {
        this.logWarn('Failed to send account unlocked notification', { 
          userId, 
          error: notificationResult.error 
        });
        // Don't fail unlock if notification fails
      }

      this.logInfo('Account unlocked successfully', { userId });
      return ok(unlockedUser);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to unlock account',
        'ACCOUNT_UNLOCK_FAILED',
        500,
        { userId }
      ));
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string): Promise<Result<void>> {
    try {
      this.logInfo('Resending email verification', { email });

      // Find user by email
      const userResult = await this.userRepository.findByEmail(email);
      if (!userResult.success || !userResult.data) {
        return err(this.createError(
          'User not found',
          'USER_NOT_FOUND',
          404,
          { email }
        ));
      }

      const user = userResult.data;

      // Check if already verified
      if (user.emailVerified) {
        return err(this.createError(
          'Email is already verified',
          'EMAIL_ALREADY_VERIFIED',
          400,
          { userId: user.id }
        ));
      }

      // Generate new verification token
      const emailVerificationToken = this.generateSecureToken();
      const emailVerificationExpires = new Date();
      emailVerificationExpires.setHours(emailVerificationExpires.getHours() + AuthenticationService.EMAIL_VERIFICATION_EXPIRES_HOURS);

      // Update user with new token
      const updateResult = await this.userRepository.update(user.id, {
        emailVerificationToken,
        emailVerificationExpires
      });

      if (!updateResult.success) {
        return err(updateResult.error);
      }

      const updatedUser = updateResult.data;

      // Send verification email
      const emailResult = await this.authEmailService.sendEmailVerification(updatedUser, emailVerificationToken);
      if (!emailResult.success) {
        return err(emailResult.error);
      }

      this.logInfo('Email verification resent successfully', { 
        userId: user.id, 
        email: user.email 
      });

      return ok(undefined);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to resend email verification',
        'EMAIL_VERIFICATION_RESEND_FAILED',
        500,
        { email }
      ));
    }
  }

  /**
   * Generate a cryptographically secure token.
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}