import crypto from 'crypto';
import { BaseService } from './base.service';
import { IProfileService, ProfileData } from '../interfaces/profile.interface';
import { IUserProfileRepository, AutoFillData, UserDataExport } from '../interfaces/user-profile-repository.interface';
import { ILogger } from '../interfaces/logger.interface';
import { Result, ok, err } from '../types/result';
import { UserProfile } from '@/generated/prisma';

/**
 * Profile service implementation.
 * Handles user profile management, auto-fill functionality, and privacy compliance.
 */
export class ProfileService extends BaseService implements IProfileService {
  readonly name = 'ProfileService';

  // Encryption configuration
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

  constructor(
    logger: ILogger,
    private readonly profileRepository: IUserProfileRepository
  ) {
    super(logger);
  }

  /**
   * Get a user's profile.
   */
  async getProfile(userId: string): Promise<Result<UserProfile | null>> {
    try {
      this.logInfo('Getting user profile', { userId });

      const result = await this.profileRepository.findByUserId(userId);
      if (!result.success) {
        return err(result.error);
      }

      const profile = result.data;
      if (profile) {
        // Decrypt sensitive fields
        const decryptedProfile = await this.decryptSensitiveFields(profile);
        return ok(decryptedProfile);
      }

      return ok(null);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to get user profile',
        'PROFILE_GET_ERROR',
        500,
        { userId }
      ));
    }
  }

  /**
   * Create or update a user's profile.
   */
  async updateProfile(userId: string, profileData: ProfileData): Promise<Result<UserProfile>> {
    try {
      this.logInfo('Updating user profile', { userId });

      // Validate profile data
      const validationResult = this.validateProfileData(profileData);
      if (!validationResult.success) {
        return err(validationResult.error);
      }

      // Get existing profile or prepare for creation
      const existingProfileResult = await this.profileRepository.findByUserId(userId);
      if (!existingProfileResult.success) {
        return err(existingProfileResult.error);
      }

      const existingProfile = existingProfileResult.data;

      // Prepare update data
      const updateData: any = {};

      // Handle personal information
      if (profileData.personalInfo) {
        if (profileData.personalInfo.firstName !== undefined) {
          updateData.personalFirstName = profileData.personalInfo.firstName;
        }
        if (profileData.personalInfo.lastName !== undefined) {
          updateData.personalLastName = profileData.personalInfo.lastName;
        }
        if (profileData.personalInfo.middleName !== undefined) {
          updateData.personalMiddleName = profileData.personalInfo.middleName;
        }
        if (profileData.personalInfo.dateOfBirth !== undefined) {
          updateData.personalDateOfBirth = profileData.personalInfo.dateOfBirth;
        }
        if (profileData.personalInfo.ssn !== undefined) {
          // Encrypt SSN before storing
          updateData.personalSSN = await this.encryptSensitiveData(profileData.personalInfo.ssn);
        }
        if (profileData.personalInfo.phone !== undefined) {
          updateData.personalPhone = profileData.personalInfo.phone;
        }
        if (profileData.personalInfo.alternatePhone !== undefined) {
          updateData.personalAltPhone = profileData.personalInfo.alternatePhone;
        }
      }

      // Handle addresses
      if (profileData.addresses) {
        if (profileData.addresses.personal !== undefined) {
          updateData.personalAddress = profileData.addresses.personal;
        }
        if (profileData.addresses.mailing !== undefined) {
          updateData.mailingAddress = profileData.addresses.mailing;
        }
        if (profileData.addresses.business !== undefined) {
          updateData.businessAddress = profileData.addresses.business;
        }
      }

      // Handle business information
      if (profileData.businessInfo) {
        if (profileData.businessInfo.companyName !== undefined) {
          updateData.businessCompanyName = profileData.businessInfo.companyName;
        }
        if (profileData.businessInfo.title !== undefined) {
          updateData.businessTitle = profileData.businessInfo.title;
        }
        if (profileData.businessInfo.industry !== undefined) {
          updateData.businessIndustry = profileData.businessInfo.industry;
        }
        if (profileData.businessInfo.businessPhone !== undefined) {
          updateData.businessPhone = profileData.businessInfo.businessPhone;
        }
        if (profileData.businessInfo.businessEmail !== undefined) {
          updateData.businessEmail = profileData.businessInfo.businessEmail;
        }
        if (profileData.businessInfo.fein !== undefined) {
          updateData.businessFEIN = profileData.businessInfo.fein;
        }
        if (profileData.businessInfo.businessType !== undefined) {
          updateData.businessType = profileData.businessInfo.businessType;
        }
      }

      // Handle auto-fill preferences
      if (profileData.autoFillPreferences) {
        if (profileData.autoFillPreferences.enableAutoFill !== undefined) {
          updateData.enableAutoFill = profileData.autoFillPreferences.enableAutoFill;
        }
        if (profileData.autoFillPreferences.verifiedFields !== undefined) {
          updateData.verifiedFields = profileData.autoFillPreferences.verifiedFields;
        }
        updateData.lastAutoFillUpdate = new Date();
      }

      // Handle privacy settings
      if (profileData.privacySettings) {
        if (profileData.privacySettings.allowDataExport !== undefined) {
          updateData.allowDataExport = profileData.privacySettings.allowDataExport;
        }
        if (profileData.privacySettings.allowMarketing !== undefined) {
          updateData.allowMarketing = profileData.privacySettings.allowMarketing;
        }
        if (profileData.privacySettings.allowAnalytics !== undefined) {
          updateData.allowAnalytics = profileData.privacySettings.allowAnalytics;
        }
        if (profileData.privacySettings.dataRetentionDays !== undefined) {
          updateData.dataRetentionDays = profileData.privacySettings.dataRetentionDays;
        }
      }

      let profile: UserProfile;

      if (existingProfile) {
        // Update existing profile
        const updateResult = await this.profileRepository.update(existingProfile.id, updateData);
        if (!updateResult.success) {
          return err(updateResult.error);
        }
        profile = updateResult.data;
      } else {
        // Create new profile
        const createData = {
          userId,
          enableAutoFill: true,
          verifiedFields: [],
          lastAutoFillUpdate: new Date(),
          allowDataExport: true,
          allowMarketing: false,
          allowAnalytics: true,
          ...updateData
        };

        const createResult = await this.profileRepository.create(createData);
        if (!createResult.success) {
          return err(createResult.error);
        }
        profile = createResult.data;
      }

      // Decrypt sensitive fields before returning
      const decryptedProfile = await this.decryptSensitiveFields(profile);

      this.logInfo('Profile updated successfully', { userId, profileId: profile.id });
      return ok(decryptedProfile);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to update user profile',
        'PROFILE_UPDATE_ERROR',
        500,
        { userId }
      ));
    }
  }

  /**
   * Get auto-fill data for a specific form type.
   */
  async getAutoFillData(userId: string, formType: string): Promise<Result<AutoFillData | null>> {
    try {
      this.logInfo('Getting auto-fill data', { userId, formType });

      const result = await this.profileRepository.getAutoFillData(userId, formType);
      if (!result.success) {
        return err(result.error);
      }

      return ok(result.data);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to get auto-fill data',
        'PROFILE_GET_AUTOFILL_ERROR',
        500,
        { userId, formType }
      ));
    }
  }

  /**
   * Save auto-fill data from a completed form.
   */
  async saveAutoFillData(userId: string, formType: string, data: AutoFillData): Promise<Result<void>> {
    try {
      this.logInfo('Saving auto-fill data', { userId, formType });

      const result = await this.profileRepository.updateAutoFillData(userId, formType, data);
      if (!result.success) {
        return err(result.error);
      }

      this.logInfo('Auto-fill data saved successfully', { userId, formType });
      return ok(undefined);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to save auto-fill data',
        'PROFILE_SAVE_AUTOFILL_ERROR',
        500,
        { userId, formType }
      ));
    }
  }

  /**
   * Mark specific fields as verified for high-confidence auto-fill.
   */
  async verifyFields(userId: string, fieldNames: string[], source: string): Promise<Result<void>> {
    try {
      this.logInfo('Verifying fields', { userId, fieldCount: fieldNames.length, source });

      const result = await this.profileRepository.markFieldsAsVerified(userId, fieldNames);
      if (!result.success) {
        return err(result.error);
      }

      this.logInfo('Fields verified successfully', { 
        userId, 
        fieldCount: fieldNames.length, 
        source 
      });
      return ok(undefined);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to verify fields',
        'PROFILE_VERIFY_FIELDS_ERROR',
        500,
        { userId, fieldNames, source }
      ));
    }
  }

  /**
   * Get all verified fields for a user.
   */
  async getVerifiedFields(userId: string): Promise<Result<string[]>> {
    try {
      const result = await this.profileRepository.getVerifiedFields(userId);
      if (!result.success) {
        return err(result.error);
      }

      return ok(result.data);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to get verified fields',
        'PROFILE_GET_VERIFIED_ERROR',
        500,
        { userId }
      ));
    }
  }

  /**
   * Delete a user's profile (GDPR compliance).
   */
  async deleteProfile(userId: string): Promise<Result<void>> {
    try {
      this.logInfo('Deleting user profile for GDPR compliance', { userId });

      const result = await this.profileRepository.deleteUserData(userId);
      if (!result.success) {
        return err(result.error);
      }

      this.logInfo('User profile deleted successfully', { userId });
      return ok(undefined);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to delete user profile',
        'PROFILE_DELETE_ERROR',
        500,
        { userId }
      ));
    }
  }

  /**
   * Export all user data (GDPR compliance).
   */
  async exportUserData(userId: string): Promise<Result<UserDataExport>> {
    try {
      this.logInfo('Exporting user data for GDPR compliance', { userId });

      const result = await this.profileRepository.exportUserData(userId);
      if (!result.success) {
        return err(result.error);
      }

      const exportData = result.data;

      // Decrypt sensitive fields in the profile
      if (exportData.profile) {
        exportData.profile = await this.decryptSensitiveFields(exportData.profile);
      }

      this.logInfo('User data exported successfully', { userId });
      return ok(exportData);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to export user data',
        'PROFILE_EXPORT_ERROR',
        500,
        { userId }
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
      this.logInfo('Updating privacy preferences', { userId });

      const result = await this.profileRepository.updatePrivacyPreferences(userId, preferences);
      if (!result.success) {
        return err(result.error);
      }

      this.logInfo('Privacy preferences updated successfully', { userId });
      return ok(undefined);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to update privacy preferences',
        'PROFILE_UPDATE_PRIVACY_ERROR',
        500,
        { userId, preferences }
      ));
    }
  }

  /**
   * Get profile completion percentage for a user.
   */
  async getProfileCompletionPercentage(userId: string): Promise<Result<number>> {
    try {
      const result = await this.profileRepository.getProfileCompletionPercentage(userId);
      if (!result.success) {
        return err(result.error);
      }

      return ok(result.data);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to get profile completion percentage',
        'PROFILE_COMPLETION_ERROR',
        500,
        { userId }
      ));
    }
  }

  /**
   * Suggest profile improvements based on usage patterns.
   */
  async getProfileSuggestions(userId: string): Promise<Result<string[]>> {
    try {
      const suggestions: string[] = [];

      // Get profile completion percentage
      const completionResult = await this.getProfileCompletionPercentage(userId);
      if (completionResult.success) {
        const completion = completionResult.data;

        if (completion < 50) {
          suggestions.push('Complete your profile to enable faster form filling');
        }

        if (completion < 80) {
          suggestions.push('Add business information to streamline business formation');
        }
      }

      // Get profile to check specific fields
      const profileResult = await this.getProfile(userId);
      if (profileResult.success && profileResult.data) {
        const profile = profileResult.data;

        if (!profile.personalPhone) {
          suggestions.push('Add a phone number for important notifications');
        }

        if (!profile.businessEmail && profile.businessCompanyName) {
          suggestions.push('Add a business email for professional communications');
        }

        if (!profile.personalAddress) {
          suggestions.push('Add your address for accurate document delivery');
        }

        if (profile.verifiedFields.length === 0) {
          suggestions.push('Verify your information to enable trusted auto-fill');
        }
      }

      return ok(suggestions);

    } catch (error) {
      return err(this.handleError(
        error,
        'Failed to get profile suggestions',
        'PROFILE_SUGGESTIONS_ERROR',
        500,
        { userId }
      ));
    }
  }

  /**
   * Validate profile data before saving.
   */
  validateProfileData(profileData: ProfileData): Result<boolean> {
    const errors: string[] = [];

    // Validate personal info
    if (profileData.personalInfo) {
      const { personalInfo } = profileData;

      if (personalInfo.firstName && personalInfo.firstName.length > 100) {
        errors.push('First name must be 100 characters or less');
      }

      if (personalInfo.lastName && personalInfo.lastName.length > 100) {
        errors.push('Last name must be 100 characters or less');
      }

      if (personalInfo.phone && !/^\+?[\d\s\-\(\)]+$/.test(personalInfo.phone)) {
        errors.push('Phone number format is invalid');
      }

      if (personalInfo.ssn && !/^\d{3}-?\d{2}-?\d{4}$/.test(personalInfo.ssn)) {
        errors.push('SSN format is invalid');
      }
    }

    // Validate business info
    if (profileData.businessInfo) {
      const { businessInfo } = profileData;

      if (businessInfo.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessInfo.businessEmail)) {
        errors.push('Business email format is invalid');
      }

      if (businessInfo.fein && !/^\d{2}-?\d{7}$/.test(businessInfo.fein)) {
        errors.push('FEIN format is invalid');
      }
    }

    // Validate addresses
    if (profileData.addresses) {
      const addresses = [
        profileData.addresses.personal,
        profileData.addresses.mailing,
        profileData.addresses.business
      ].filter(Boolean);

      for (const address of addresses) {
        if (address) {
          if (!address.street || address.street.length === 0) {
            errors.push('Address street is required');
          }
          if (!address.city || address.city.length === 0) {
            errors.push('Address city is required');
          }
          if (!address.state || address.state.length === 0) {
            errors.push('Address state is required');
          }
          if (!address.zipCode || !/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
            errors.push('Address zip code format is invalid');
          }
        }
      }
    }

    if (errors.length > 0) {
      return err(this.createError(
        'Profile data validation failed',
        'PROFILE_VALIDATION_ERROR',
        400,
        { validationErrors: errors }
      ));
    }

    return ok(true);
  }

  /**
   * Encrypt sensitive data before storing.
   */
  private async encryptSensitiveData(data: string): Promise<string> {
    try {
      const key = Buffer.from(ProfileService.ENCRYPTION_KEY, 'hex');
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(ProfileService.ENCRYPTION_ALGORITHM, key);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      this.logError('Failed to encrypt sensitive data', { error });
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt sensitive data after retrieving.
   */
  private async decryptSensitiveData(encryptedData: string): Promise<string> {
    try {
      const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
      const key = Buffer.from(ProfileService.ENCRYPTION_KEY, 'hex');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipher(ProfileService.ENCRYPTION_ALGORITHM, key);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logError('Failed to decrypt sensitive data', { error });
      return '[ENCRYPTED]'; // Return placeholder if decryption fails
    }
  }

  /**
   * Decrypt sensitive fields in a profile.
   */
  private async decryptSensitiveFields(profile: UserProfile): Promise<UserProfile> {
    const decryptedProfile = { ...profile };

    if (profile.personalSSN) {
      try {
        decryptedProfile.personalSSN = await this.decryptSensitiveData(profile.personalSSN);
      } catch (error) {
        this.logWarn('Failed to decrypt SSN', { profileId: profile.id });
        decryptedProfile.personalSSN = '[ENCRYPTED]';
      }
    }

    return decryptedProfile;
  }
}