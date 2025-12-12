import { IService } from './service.interface';
import { Result } from '../types/result';
import { UserProfile } from '@/generated/prisma';
import { AutoFillData, UserDataExport } from './user-profile-repository.interface';

/**
 * Profile data for creating or updating user profiles.
 */
export interface ProfileData {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    dateOfBirth?: Date;
    ssn?: string; // Will be encrypted
    phone?: string;
    alternatePhone?: string;
  };
  addresses?: {
    personal?: {
      street: string;
      street2?: string;
      city: string;
      state: string;
      zipCode: string;
    };
    mailing?: {
      street: string;
      street2?: string;
      city: string;
      state: string;
      zipCode: string;
    };
    business?: {
      street: string;
      street2?: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  businessInfo?: {
    companyName?: string;
    title?: string;
    industry?: string;
    businessPhone?: string;
    businessEmail?: string;
    fein?: string;
    businessType?: string;
  };
  autoFillPreferences?: {
    enableAutoFill?: boolean;
    verifiedFields?: string[];
  };
  privacySettings?: {
    allowDataExport?: boolean;
    allowMarketing?: boolean;
    allowAnalytics?: boolean;
    dataRetentionDays?: number;
  };
}

/**
 * Profile service interface.
 * Handles user profile management, auto-fill functionality, and privacy compliance.
 */
export interface IProfileService extends IService {
  /**
   * Get a user's profile.
   * 
   * @param userId - The user ID
   * @returns Result containing the user profile or null if not found
   */
  getProfile(userId: string): Promise<Result<UserProfile | null>>;

  /**
   * Create or update a user's profile.
   * 
   * @param userId - The user ID
   * @param profileData - The profile data to update
   * @returns Result containing the updated profile
   */
  updateProfile(userId: string, profileData: ProfileData): Promise<Result<UserProfile>>;

  /**
   * Get auto-fill data for a specific form type.
   * 
   * @param userId - The user ID
   * @param formType - The form type (e.g., 'llc-formation', 'annual-report')
   * @returns Result containing auto-fill data or null if not available
   */
  getAutoFillData(userId: string, formType: string): Promise<Result<AutoFillData | null>>;

  /**
   * Save auto-fill data from a completed form.
   * 
   * @param userId - The user ID
   * @param formType - The form type
   * @param data - The auto-fill data to save
   * @returns Result indicating success or error
   */
  saveAutoFillData(userId: string, formType: string, data: AutoFillData): Promise<Result<void>>;

  /**
   * Mark specific fields as verified for high-confidence auto-fill.
   * 
   * @param userId - The user ID
   * @param fieldNames - Array of field names to mark as verified
   * @param source - The verification source ('saved', 'previous-order', 'user-profile')
   * @returns Result indicating success or error
   */
  verifyFields(userId: string, fieldNames: string[], source: string): Promise<Result<void>>;

  /**
   * Get all verified fields for a user.
   * 
   * @param userId - The user ID
   * @returns Result containing array of verified field names
   */
  getVerifiedFields(userId: string): Promise<Result<string[]>>;

  /**
   * Delete a user's profile (GDPR compliance).
   * 
   * @param userId - The user ID whose profile to delete
   * @returns Result indicating success or error
   */
  deleteProfile(userId: string): Promise<Result<void>>;

  /**
   * Export all user data (GDPR compliance).
   * 
   * @param userId - The user ID whose data to export
   * @returns Result containing complete user data export
   */
  exportUserData(userId: string): Promise<Result<UserDataExport>>;

  /**
   * Update privacy preferences for a user.
   * 
   * @param userId - The user ID
   * @param preferences - Privacy preferences to update
   * @returns Result indicating success or error
   */
  updatePrivacyPreferences(userId: string, preferences: {
    allowDataExport?: boolean;
    allowMarketing?: boolean;
    allowAnalytics?: boolean;
    dataRetentionDays?: number;
  }): Promise<Result<void>>;

  /**
   * Get profile completion percentage for a user.
   * 
   * @param userId - The user ID
   * @returns Result containing completion percentage (0-100)
   */
  getProfileCompletionPercentage(userId: string): Promise<Result<number>>;

  /**
   * Suggest profile improvements based on usage patterns.
   * 
   * @param userId - The user ID
   * @returns Result containing array of improvement suggestions
   */
  getProfileSuggestions(userId: string): Promise<Result<string[]>>;

  /**
   * Validate profile data before saving.
   * 
   * @param profileData - The profile data to validate
   * @returns Result indicating if data is valid
   */
  validateProfileData(profileData: ProfileData): Result<boolean>;
}