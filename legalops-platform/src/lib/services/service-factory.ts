/**
 * Service Factory
 * 
 * Creates and manages service instances with proper dependency injection.
 */

import { PrismaClient } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ConsoleLogger } from '../logging/console-logger';
import { ILogger } from '../interfaces/logger.interface';
import { OrderService } from './order.service';
import { ErrorHandler } from '../errors/handler';
import { IAlertService } from '../interfaces/alert.interface';
import { createAlertService } from './alert.service';
import { OrderRepository, IOrderRepository } from '../repositories/order.repository';
import { ICache } from '../interfaces/cache.interface';
import { createCache } from '../caching/memory-cache';
import { EmailService, IEmailService } from './email-service';
import { USPSAddressValidationService, IUSPSAddressValidationService } from './usps-address-validation';
import { AuthenticationService } from './authentication.service';
import { IAuthenticationService } from '../interfaces/authentication.interface';
import { AuthEmailService } from './auth-email.service';
import { IAuthEmailService } from '../interfaces/auth-email.interface';
import { SessionService } from './session.service';
import { ISessionService } from '../interfaces/session.interface';
import { ProfileService } from './profile.service';
import { IProfileService } from '../interfaces/profile.interface';
import { UserRepository } from '../repositories/user.repository';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { UserProfileRepository } from '../repositories/user-profile.repository';
import { IUserProfileRepository } from '../interfaces/user-profile-repository.interface';
import { SessionRepository } from '../repositories/session.repository';
import { ISessionRepository } from '../interfaces/session-repository.interface';
import { AIRiskScoringService } from './ai-risk-scoring';
import { IRiskService } from './order.service';
import { SecurityFactory } from '../security';
import { SessionCleanupService } from './session-cleanup.service';
import { PrivacyComplianceService } from './privacy-compliance.service';

/**
 * Service factory for creating service instances.
 */
export class ServiceFactory {
  private static logger: ILogger;
  private static alertService: IAlertService;
  private static errorHandler: ErrorHandler;
  private static cache: ICache;
  private static orderRepository: IOrderRepository;
  private static orderService: OrderService;
  private static emailService: IEmailService;
  private static uspsService: IUSPSAddressValidationService;
  private static authenticationService: IAuthenticationService;
  private static authEmailService: IAuthEmailService;
  private static sessionService: ISessionService;
  private static profileService: IProfileService;
  private static userRepository: IUserRepository;
  private static userProfileRepository: IUserProfileRepository;
  private static sessionRepository: ISessionRepository;
  private static riskService: IRiskService;
  private static securityFactory: SecurityFactory;
  private static sessionCleanupService: SessionCleanupService;
  private static privacyComplianceService: PrivacyComplianceService;

  /**
   * Get logger instance.
   */
  static getLogger(): ILogger {
    if (!this.logger) {
      this.logger = new ConsoleLogger();
    }
    return this.logger;
  }

  /**
   * Get alert service instance.
   */
  static getAlertService(): IAlertService {
    if (!this.alertService) {
      this.alertService = createAlertService(this.getLogger());
    }
    return this.alertService;
  }

  /**
   * Get error handler instance.
   */
  static getErrorHandler(): ErrorHandler {
    if (!this.errorHandler) {
      this.errorHandler = new ErrorHandler(
        this.getLogger(),
        this.getAlertService()
      );
    }
    return this.errorHandler;
  }

  /**
   * Get cache instance.
   */
  static getCache(): ICache {
    if (!this.cache) {
      this.cache = createCache();
    }
    return this.cache;
  }

  /**
   * Get order repository instance.
   */
  static getOrderRepository(): IOrderRepository {
    if (!this.orderRepository) {
      this.orderRepository = new OrderRepository(
        prisma,
        this.getLogger(),
        this.getCache()
      );
    }
    return this.orderRepository;
  }

  /**
   * Get risk service instance.
   */
  static getRiskService(): IRiskService {
    if (!this.riskService) {
      this.riskService = new AIRiskScoringService(
        this.getLogger(),
        this.getUserRepository(),
        this.getOrderRepository()
      );
    }
    return this.riskService;
  }

  /**
   * Get order service instance.
   */
  static getOrderService(): OrderService {
    if (!this.orderService) {
      this.orderService = new OrderService(
        this.getLogger(),
        this.getOrderRepository(),
        this.getRiskService()
      );
    }
    return this.orderService;
  }

  /**
   * Get email service instance.
   */
  static getEmailService(): IEmailService {
    if (!this.emailService) {
      this.emailService = new EmailService(
        this.getLogger(),
        this.getUserRepository()
      );
    }
    return this.emailService;
  }

  /**
   * Get USPS address validation service instance.
   */
  static getUSPSService(): IUSPSAddressValidationService {
    if (!this.uspsService) {
      this.uspsService = new USPSAddressValidationService(this.getLogger());
    }
    return this.uspsService;
  }

  /**
   * Get user repository instance.
   */
  static getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository(
        prisma,
        this.getLogger(),
        this.getCache()
      );
    }
    return this.userRepository;
  }

  /**
   * Get user profile repository instance.
   */
  static getUserProfileRepository(): IUserProfileRepository {
    if (!this.userProfileRepository) {
      this.userProfileRepository = new UserProfileRepository(
        prisma,
        this.getLogger(),
        this.getCache()
      );
    }
    return this.userProfileRepository;
  }

  /**
   * Get session repository instance.
   */
  static getSessionRepository(): ISessionRepository {
    if (!this.sessionRepository) {
      this.sessionRepository = new SessionRepository(
        prisma,
        this.getLogger(),
        this.getCache()
      );
    }
    return this.sessionRepository;
  }

  /**
   * Get session service instance.
   */
  static getSessionService(): ISessionService {
    if (!this.sessionService) {
      this.sessionService = new SessionService(
        this.getLogger(),
        this.getSessionRepository(),
        this.getCache()
      );
    }
    return this.sessionService;
  }

  /**
   * Get auth email service instance.
   */
  static getAuthEmailService(): IAuthEmailService {
    if (!this.authEmailService) {
      this.authEmailService = new AuthEmailService(
        this.getLogger(),
        this.getEmailService()
      );
    }
    return this.authEmailService;
  }

  /**
   * Get authentication service instance.
   */
  static getAuthenticationService(): IAuthenticationService {
    if (!this.authenticationService) {
      this.authenticationService = new AuthenticationService(
        this.getLogger(),
        this.getUserRepository(),
        this.getSessionService(),
        this.getAuthEmailService()
      );
    }
    return this.authenticationService;
  }

  /**
   * Get profile service instance.
   */
  static getProfileService(): IProfileService {
    if (!this.profileService) {
      this.profileService = new ProfileService(
        this.getLogger(),
        this.getUserProfileRepository()
      );
    }
    return this.profileService;
  }

  /**
   * Get security factory instance.
   */
  static getSecurityFactory(): SecurityFactory {
    if (!this.securityFactory) {
      this.securityFactory = new SecurityFactory();
    }
    return this.securityFactory;
  }

  /**
   * Convenience method to get field encryption utility.
   */
  static getFieldEncryption() {
    return this.getSecurityFactory().createFieldEncryption();
  }

  /**
   * Convenience method to get token generator utility.
   */
  static getTokenGenerator() {
    return this.getSecurityFactory().createTokenGenerator();
  }

  /**
   * Convenience method to get data masker utility.
   */
  static getDataMasker() {
    return this.getSecurityFactory().createDataMasker();
  }

  /**
   * Convenience method to get password hasher utility.
   */
  static getPasswordHasher() {
    return this.getSecurityFactory().createPasswordHasher();
  }

  /**
   * Convenience method to get password validator utility.
   */
  static getPasswordValidator() {
    return this.getSecurityFactory().createPasswordValidator();
  }

  /**
   * Convenience method to get key manager utility.
   */
  static getKeyManager() {
    return this.getSecurityFactory().createKeyManager();
  }

  /**
   * Get session cleanup service instance.
   */
  static getSessionCleanupService(): SessionCleanupService {
    if (!this.sessionCleanupService) {
      this.sessionCleanupService = new SessionCleanupService(
        this.getLogger(),
        this.getSessionService(),
        this.getSessionRepository(),
        this.getAlertService()
      );
    }
    return this.sessionCleanupService;
  }

  /**
   * Get privacy compliance service instance.
   */
  static getPrivacyComplianceService(): PrivacyComplianceService {
    if (!this.privacyComplianceService) {
      this.privacyComplianceService = new PrivacyComplianceService(
        this.getLogger(),
        this.getUserRepository(),
        this.getUserProfileRepository(),
        this.getSessionRepository()
      );
    }
    return this.privacyComplianceService;
  }

  /**
   * Get Prisma client instance.
   */
  static getPrismaClient(): PrismaClient {
    return prisma;
  }

  /**
   * Reset all service instances (useful for testing).
   * This clears all cached service instances, forcing them to be recreated.
   */
  static resetServices(): void {
    this.logger = undefined as any;
    this.alertService = undefined as any;
    this.errorHandler = undefined as any;
    this.cache = undefined as any;
    this.orderRepository = undefined as any;
    this.orderService = undefined as any;
    this.emailService = undefined as any;
    this.uspsService = undefined as any;
    this.authenticationService = undefined as any;
    this.authEmailService = undefined as any;
    this.sessionService = undefined as any;
    this.profileService = undefined as any;
    this.userRepository = undefined as any;
    this.userProfileRepository = undefined as any;
    this.sessionRepository = undefined as any;
    this.riskService = undefined as any;
    this.securityFactory = undefined as any;
    this.sessionCleanupService = undefined as any;
    this.privacyComplianceService = undefined as any;
  }
}
