import { PrismaClient, UserProfile } from '@/generated/prisma';
import { BaseRepository } from './base.repository';
import { 
  IUserProfileRepository, 
  AutoFillData, 
  UserDataExport 
} from '../interfaces/user-profile-repository.interface';
import { ICache } from '../interfaces/cache.interface';
import { ILogger } from '../interfaces/logger.interface';
import { Result, ok, err } from '../types/result';
import { AppError } from '../types/result';

/**
 * User profile repository implementation.
 * Extends BaseRepository with profile-specific methods and auto-fill functionality.
 */
export class UserProfileRepository extends BaseRepository<UserProfile> implements IUserProfileRepository {
  readonly name = 'UserProfileRepository';

  constructor(
    prisma: PrismaClient,
    logger: ILogger,
    cache?: ICache
  ) {
    super(prisma, logger, cache);
    // Set longer cache TTL for profile data (1 hour)
    this.cacheTTL = 3600;
  }

  /**
   * Get the Prisma model delegate for UserProfile entities.
   */
  protected getModel() {
    return this.prisma.userProfile;
  }

  /**
   * Find a user profile by user ID.
   */
  async findByUserId(userId: string): Promise<Result<UserProfile | null>> {
    try {
      // Check cache first
      if (this.cache) {
        const cacheKey = `${this.name}:userId:${userId}`;
        const cached = await this.cache.get<UserProfile>(cacheKey);
        if (cached) {
          this.logger.debug(`[${this.name}] Cache hit for user ${userId}`);
          return ok(cached);
        }
      }

      const profile = await this.performanceLogger.measureQuery(
        `${this.name}.findByUserId`,
        () => this.getModel().findUnique({
          where: { userId }
        }),
        { userId }
      );

      // Cache the result
      if (profile && this.cache) {
        const cacheKey = `${this.name}:userId:${userId}`;
        await this.cache.set(cacheKey, profile, this.cacheTTL);
        this.logger.debug(`[${this.name}] Cached profile for user ${userId}`);
      }

      return ok(profile);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to find profile by user ID`, {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to find user profile',
        'PROFILE_FIND_BY_USER_ID_ERROR',
        500,
        { userId, originalError: error }
      ));
    }
  }

  /**
   * Update auto-fill data for a specific form type.
   */
  async updateAutoFillData(userId: string, formType: string, data: AutoFillData): Promise<Result<void>> {
    try {
      // Get or create profile
      let profile = await this.getModel().findUnique({ where: { userId } });
      
      if (!profile) {
        // Create new profile
        profile = await this.getModel().create({
          data: {
            userId,
            enableAutoFill: true,
            verifiedFields: [],
            lastAutoFillUpdate: new Date(),
            allowDataExport: true,
            allowMarketing: false,
            allowAnalytics: true
          }
        });
      }

      // Update profile with auto-fill data
      const updateData: any = {
        lastAutoFillUpdate: new Date()
      };

      if (data.personalInfo) {
        if (data.personalInfo.firstName) updateData.personalFirstName = data.personalInfo.firstName;
        if (data.personalInfo.lastName) updateData.personalLastName = data.personalInfo.lastName;
        if (data.personalInfo.middleName) updateData.personalMiddleName = data.personalInfo.middleName;
        if (data.personalInfo.phone) updateData.personalPhone = data.personalInfo.phone;
        if (data.personalInfo.alternatePhone) updateData.personalAltPhone = data.personalInfo.alternatePhone;
      }

      if (data.addresses) {
        if (data.addresses.personal) updateData.personalAddress = data.addresses.personal;
        if (data.addresses.mailing) updateData.mailingAddress = data.addresses.mailing;
        if (data.addresses.business) updateData.businessAddress = data.addresses.business;
      }

      if (data.businessInfo) {
        if (data.businessInfo.companyName) updateData.businessCompanyName = data.businessInfo.companyName;
        if (data.businessInfo.title) updateData.businessTitle = data.businessInfo.title;
        if (data.businessInfo.industry) updateData.businessIndustry = data.businessInfo.industry;
        if (data.businessInfo.businessPhone) updateData.businessPhone = data.businessInfo.businessPhone;
        if (data.businessInfo.businessEmail) updateData.businessEmail = data.businessInfo.businessEmail;
        if (data.businessInfo.fein) updateData.businessFEIN = data.businessInfo.fein;
        if (data.businessInfo.businessType) updateData.businessType = data.businessInfo.businessType;
      }

      await this.performanceLogger.measureQuery(
        `${this.name}.updateAutoFillData`,
        () => this.getModel().update({
          where: { userId },
          data: updateData
        }),
        { userId, formType }
      );

      // Invalidate cache
      await this.invalidateProfileCache(userId);

      this.logger.info(`[${this.name}] Updated auto-fill data for user ${userId}, form type ${formType}`);
      return ok(undefined);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to update auto-fill data`, {
        userId,
        formType,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to update auto-fill data',
        'PROFILE_UPDATE_AUTOFILL_ERROR',
        500,
        { userId, formType, originalError: error }
      ));
    }
  }

  /**
   * Get auto-fill data for a specific form type.
   */
  async getAutoFillData(userId: string, formType: string): Promise<Result<AutoFillData | null>> {
    try {
      const profileResult = await this.findByUserId(userId);
      if (!profileResult.success) {
        return err(profileResult.error);
      }

      const profile = profileResult.data;
      if (!profile || !profile.enableAutoFill) {
        return ok(null);
      }

      // Build auto-fill data from profile
      const autoFillData: AutoFillData = {};

      // Personal info
      if (profile.personalFirstName || profile.personalLastName || profile.personalPhone) {
        autoFillData.personalInfo = {
          firstName: profile.personalFirstName || undefined,
          lastName: profile.personalLastName || undefined,
          middleName: profile.personalMiddleName || undefined,
          phone: profile.personalPhone || undefined,
          alternatePhone: profile.personalAltPhone || undefined
        };
      }

      // Addresses
      if (profile.personalAddress || profile.mailingAddress || profile.businessAddress) {
        autoFillData.addresses = {
          personal: profile.personalAddress as any || undefined,
          mailing: profile.mailingAddress as any || undefined,
          business: profile.businessAddress as any || undefined
        };
      }

      // Business info
      if (profile.businessCompanyName || profile.businessEmail || profile.businessPhone) {
        autoFillData.businessInfo = {
          companyName: profile.businessCompanyName || undefined,
          title: profile.businessTitle || undefined,
          industry: profile.businessIndustry || undefined,
          businessPhone: profile.businessPhone || undefined,
          businessEmail: profile.businessEmail || undefined,
          fein: profile.businessFEIN || undefined,
          businessType: profile.businessType || undefined
        };
      }

      return ok(Object.keys(autoFillData).length > 0 ? autoFillData : null);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to get auto-fill data`, {
        userId,
        formType,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to get auto-fill data',
        'PROFILE_GET_AUTOFILL_ERROR',
        500,
        { userId, formType, originalError: error }
      ));
    }
  }

  /**
   * Mark specific fields as verified for high-confidence auto-fill.
   */
  async markFieldsAsVerified(userId: string, fieldNames: string[]): Promise<Result<void>> {
    try {
      const profileResult = await this.findByUserId(userId);
      if (!profileResult.success) {
        return err(profileResult.error);
      }

      let profile = profileResult.data;
      if (!profile) {
        // Create profile if it doesn't exist
        profile = await this.getModel().create({
          data: {
            userId,
            enableAutoFill: true,
            verifiedFields: fieldNames,
            lastAutoFillUpdate: new Date(),
            allowDataExport: true,
            allowMarketing: false,
            allowAnalytics: true
          }
        });
      } else {
        // Update verified fields (merge with existing)
        const existingFields = profile.verifiedFields || [];
        const newFields = [...new Set([...existingFields, ...fieldNames])];

        await this.performanceLogger.measureQuery(
          `${this.name}.markFieldsAsVerified`,
          () => this.getModel().update({
            where: { userId },
            data: { 
              verifiedFields: newFields,
              lastAutoFillUpdate: new Date()
            }
          }),
          { userId, fieldCount: fieldNames.length }
        );
      }

      // Invalidate cache
      await this.invalidateProfileCache(userId);

      this.logger.info(`[${this.name}] Marked ${fieldNames.length} fields as verified for user ${userId}`);
      return ok(undefined);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to mark fields as verified`, {
        userId,
        fieldNames,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to mark fields as verified',
        'PROFILE_MARK_VERIFIED_ERROR',
        500,
        { userId, fieldNames, originalError: error }
      ));
    }
  }

  /**
   * Get all verified fields for a user.
   */
  async getVerifiedFields(userId: string): Promise<Result<string[]>> {
    try {
      const profileResult = await this.findByUserId(userId);
      if (!profileResult.success) {
        return err(profileResult.error);
      }

      const profile = profileResult.data;
      return ok(profile?.verifiedFields || []);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to get verified fields`, {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to get verified fields',
        'PROFILE_GET_VERIFIED_ERROR',
        500,
        { userId, originalError: error }
      ));
    }
  }

  /**
   * Delete all user data for GDPR compliance.
   */
  async deleteUserData(userId: string): Promise<Result<void>> {
    try {
      // Delete in transaction to ensure consistency
      await this.prisma.$transaction(async (tx) => {
        // Delete user profile
        await tx.userProfile.deleteMany({ where: { userId } });
        
        // Delete form drafts
        await tx.formDraft.deleteMany({ where: { userId } });
        
        // Delete feedback (set userId to null to preserve feedback data)
        await tx.feedback.updateMany({
          where: { userId },
          data: { userId: null }
        });
        
        // Delete auth sessions
        await tx.authSession.deleteMany({ where: { userId } });
        
        // Note: We don't delete orders or risk assessments as they may be needed for business records
        // Instead, we could anonymize them by removing PII
      });

      // Invalidate cache
      await this.invalidateProfileCache(userId);

      this.logger.info(`[${this.name}] Deleted user data for user ${userId}`);
      return ok(undefined);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to delete user data`, {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to delete user data',
        'PROFILE_DELETE_USER_DATA_ERROR',
        500,
        { userId, originalError: error }
      ));
    }
  }

  /**
   * Export all user data for GDPR compliance.
   */
  async exportUserData(userId: string): Promise<Result<UserDataExport>> {
    try {
      const [profile, formDrafts, orders, feedback, riskAssessments] = await Promise.all([
        this.getModel().findUnique({ where: { userId } }),
        this.prisma.formDraft.findMany({ where: { userId } }),
        this.prisma.order.findMany({ where: { userId } }),
        this.prisma.feedback.findMany({ where: { userId } }),
        this.prisma.riskAssessment.findMany({ where: { userId } })
      ]);

      const exportData: UserDataExport = {
        profile: profile || {} as UserProfile,
        formDrafts,
        orders,
        feedback,
        riskAssessments,
        exportedAt: new Date()
      };

      this.logger.info(`[${this.name}] Exported user data for user ${userId}`);
      return ok(exportData);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to export user data`, {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to export user data',
        'PROFILE_EXPORT_USER_DATA_ERROR',
        500,
        { userId, originalError: error }
      ));
    }
  }

  /**
   * Update privacy preferences for a user.
   */
  async updatePrivacyPreferences(userId: string, preferences: {
    allowDataExport?: boolean;
    allowMarketing?: boolean;
    allowAnalytics?: boolean;
    dataRetentionDays?: number;
  }): Promise<Result<void>> {
    try {
      // Get or create profile
      let profile = await this.getModel().findUnique({ where: { userId } });
      
      if (!profile) {
        // Create new profile with preferences
        await this.getModel().create({
          data: {
            userId,
            enableAutoFill: true,
            verifiedFields: [],
            lastAutoFillUpdate: new Date(),
            allowDataExport: preferences.allowDataExport ?? true,
            allowMarketing: preferences.allowMarketing ?? false,
            allowAnalytics: preferences.allowAnalytics ?? true,
            dataRetentionDays: preferences.dataRetentionDays
          }
        });
      } else {
        // Update existing profile
        await this.performanceLogger.measureQuery(
          `${this.name}.updatePrivacyPreferences`,
          () => this.getModel().update({
            where: { userId },
            data: preferences
          }),
          { userId }
        );
      }

      // Invalidate cache
      await this.invalidateProfileCache(userId);

      this.logger.info(`[${this.name}] Updated privacy preferences for user ${userId}`);
      return ok(undefined);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to update privacy preferences`, {
        userId,
        preferences,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to update privacy preferences',
        'PROFILE_UPDATE_PRIVACY_ERROR',
        500,
        { userId, preferences, originalError: error }
      ));
    }
  }

  /**
   * Get profile completion percentage for a user.
   */
  async getProfileCompletionPercentage(userId: string): Promise<Result<number>> {
    try {
      const profileResult = await this.findByUserId(userId);
      if (!profileResult.success) {
        return err(profileResult.error);
      }

      const profile = profileResult.data;
      if (!profile) {
        return ok(0);
      }

      // Calculate completion based on filled fields
      const fields = [
        profile.personalFirstName,
        profile.personalLastName,
        profile.personalPhone,
        profile.personalAddress,
        profile.businessCompanyName,
        profile.businessEmail,
        profile.businessPhone
      ];

      const filledFields = fields.filter(field => field !== null && field !== undefined).length;
      const percentage = Math.round((filledFields / fields.length) * 100);

      return ok(percentage);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to get profile completion percentage`, {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to get profile completion percentage',
        'PROFILE_COMPLETION_ERROR',
        500,
        { userId, originalError: error }
      ));
    }
  }

  /**
   * Search profiles by criteria (admin function).
   */
  async searchProfiles(criteria: {
    companyName?: string;
    businessType?: string;
    industry?: string;
    hasBusinessInfo?: boolean;
    createdAfter?: Date;
    createdBefore?: Date;
  }, page: number = 1, pageSize: number = 20): Promise<Result<{
    data: UserProfile[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }>> {
    try {
      // Build where clause
      const where: any = {};

      if (criteria.companyName) {
        where.businessCompanyName = { contains: criteria.companyName, mode: 'insensitive' };
      }

      if (criteria.businessType) {
        where.businessType = { contains: criteria.businessType, mode: 'insensitive' };
      }

      if (criteria.industry) {
        where.businessIndustry = { contains: criteria.industry, mode: 'insensitive' };
      }

      if (criteria.hasBusinessInfo) {
        where.OR = [
          { businessCompanyName: { not: null } },
          { businessEmail: { not: null } },
          { businessPhone: { not: null } }
        ];
      }

      if (criteria.createdAfter) {
        where.createdAt = { ...where.createdAt, gte: criteria.createdAfter };
      }

      if (criteria.createdBefore) {
        where.createdAt = { ...where.createdAt, lte: criteria.createdBefore };
      }

      // Calculate pagination
      const skip = (page - 1) * pageSize;

      // Get total count and data in parallel
      const [total, profiles] = await Promise.all([
        this.getModel().count({ where }),
        this.getModel().findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' }
        })
      ]);

      const hasMore = skip + profiles.length < total;

      return ok({
        data: profiles,
        total,
        page,
        pageSize,
        hasMore
      });

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to search profiles`, {
        criteria,
        page,
        pageSize,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to search profiles',
        'PROFILE_SEARCH_ERROR',
        500,
        { criteria, page, pageSize, originalError: error }
      ));
    }
  }

  /**
   * Invalidate all cache entries for a specific user profile.
   */
  private async invalidateProfileCache(userId: string): Promise<void> {
    if (this.cache) {
      try {
        await Promise.all([
          this.cache.delete(`${this.name}:userId:${userId}`),
          this.cache.deletePattern(`${this.name}:*:${userId}`)
        ]);
        this.logger.debug(`[${this.name}] Invalidated cache for user ${userId}`);
      } catch (error) {
        this.logger.warn(`[${this.name}] Failed to invalidate profile cache`, {
          userId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }
}