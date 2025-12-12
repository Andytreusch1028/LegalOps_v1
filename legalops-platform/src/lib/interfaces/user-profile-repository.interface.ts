import { IBaseRepository } from './repository.interface';
import { Result } from '../types/result';
import { UserProfile } from '@/generated/prisma';

/**
 * Auto-fill data structure for form population.
 */
export interface AutoFillData {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
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
}

/**
 * User data export structure for GDPR compliance.
 */
export interface UserDataExport {
  profile: UserProfile;
  formDrafts: any[];
  orders: any[];
  feedback: any[];
  riskAssessments: any[];
  exportedAt: Date;
}

/**
 * User profile repository interface.
 * Handles database operations for UserProfile entities with auto-fill and privacy features.
 */
export interface IUserProfileRepository extends IBaseRepository<UserProfile> {
  /**
   * Find a user profile by user ID.
   * 
   * @param userId - The user ID to search for
   * @returns Result containing the user profile or null if not found
   */
  findByUserId(userId: string): Promise<Result<UserProfile | null>>;

  /**
   * Update auto-fill data for a specific form type.
   * 
   * @param userId - The user ID
   * @param formType - The form type (e.g., 'llc-formation', 'annual-report')
   * @param data - The auto-fill data to store
   * @returns Result indicating success or error
   */
  updateAutoFillData(userId: string, formType: string, data: AutoFillData): Promise<Result<void>>;

  /**
   * Get auto-fill data for a specific form type.
   * 
   * @param userId - The user ID
   * @param formType - The form type to get data for
   * @returns Result containing the auto-fill data or null if not found
   */
  getAutoFillData(userId: string, formType: string): Promise<Result<AutoFillData | null>>;

  /**
   * Mark specific fields as verified for high-confidence auto-fill.
   * 
   * @param userId - The user ID
   * @param fieldNames - Array of field names to mark as verified
   * @returns Result indicating success or error
   */
  markFieldsAsVerified(userId: string, fieldNames: string[]): Promise<Result<void>>;

  /**
   * Get all verified fields for a user.
   * 
   * @param userId - The user ID
   * @returns Result containing array of verified field names
   */
  getVerifiedFields(userId: string): Promise<Result<string[]>>;

  /**
   * Delete all user data for GDPR compliance.
   * 
   * @param userId - The user ID whose data to delete
   * @returns Result indicating success or error
   */
  deleteUserData(userId: string): Promise<Result<void>>;

  /**
   * Export all user data for GDPR compliance.
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
   * Search profiles by criteria (admin function).
   * 
   * @param criteria - Search criteria
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   * @returns Result containing paginated profile data
   */
  searchProfiles(criteria: {
    companyName?: string;
    businessType?: string;
    industry?: string;
    hasBusinessInfo?: boolean;
    createdAfter?: Date;
    createdBefore?: Date;
  }, page: number, pageSize: number): Promise<Result<{
    data: UserProfile[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }>>;
}