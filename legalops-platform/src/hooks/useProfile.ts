/**
 * Profile Management Hook
 * 
 * Provides profile data management functionality including:
 * - Profile data fetching and caching
 * - Profile updates
 * - Auto-fill data management
 * - Privacy preferences
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/generated/prisma';

/**
 * Auto-fill data interface
 */
export interface AutoFillData {
  [key: string]: any;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  business?: {
    businessName?: string;
    businessType?: string;
    ein?: string;
    industry?: string;
  };
}

/**
 * Privacy preferences interface
 */
export interface PrivacyPreferences {
  dataProcessing: {
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
    thirdPartySharing: boolean;
  };
  communications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    securityAlerts: boolean;
  };
  dataRetention: {
    profileData: 'indefinite' | '1year' | '2years' | '5years';
    activityLogs: 'indefinite' | '30days' | '90days' | '1year';
    formDrafts: 'indefinite' | '30days' | '90days' | '1year';
  };
  cookieConsent: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };
}

/**
 * Profile hook state interface
 */
export interface ProfileState {
  profile: UserProfile | null;
  autoFillData: AutoFillData;
  privacyPreferences: PrivacyPreferences | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Profile hook actions interface
 */
export interface ProfileActions {
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  updateAutoFillData: (formType: string, data: any) => Promise<{ success: boolean; error?: string }>;
  getAutoFillData: (formType: string) => Promise<any>;
  updatePrivacyPreferences: (preferences: Partial<PrivacyPreferences>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  exportData: () => Promise<{ success: boolean; data?: any; error?: string }>;
  deleteProfile: () => Promise<{ success: boolean; error?: string }>;
}

/**
 * Profile hook return type
 */
export interface UseProfileReturn extends ProfileState, ProfileActions {}

/**
 * Default privacy preferences
 */
const defaultPrivacyPreferences: PrivacyPreferences = {
  dataProcessing: {
    analytics: false,
    marketing: false,
    personalization: true,
    thirdPartySharing: false
  },
  communications: {
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    securityAlerts: true
  },
  dataRetention: {
    profileData: '2years',
    activityLogs: '1year',
    formDrafts: '1year'
  },
  cookieConsent: {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: true
  }
};

/**
 * Profile management hook
 */
export function useProfile(): UseProfileReturn {
  const { user, isAuthenticated } = useAuth();
  
  const [profileState, setProfileState] = useState<ProfileState>({
    profile: null,
    autoFillData: {},
    privacyPreferences: null,
    isLoading: false,
    error: null
  });

  /**
   * Update profile state
   */
  const updateProfileState = useCallback((updates: Partial<ProfileState>) => {
    setProfileState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Fetch profile data
   */
  const fetchProfile = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      updateProfileState({
        profile: null,
        autoFillData: {},
        privacyPreferences: null,
        isLoading: false,
        error: null
      });
      return;
    }

    try {
      updateProfileState({ isLoading: true, error: null });

      const response = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        updateProfileState({
          profile: data.profile,
          autoFillData: data.autoFillData || {},
          privacyPreferences: data.privacyPreferences || defaultPrivacyPreferences,
          isLoading: false,
          error: null
        });
      } else {
        const errorData = await response.json();
        updateProfileState({
          isLoading: false,
          error: errorData.error || 'Failed to fetch profile'
        });
      }
    } catch (error) {
      updateProfileState({
        isLoading: false,
        error: 'Network error. Please try again.'
      });
    }
  }, [isAuthenticated, user, updateProfileState]);

  /**
   * Update profile
   */
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    try {
      updateProfileState({ isLoading: true, error: null });

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        updateProfileState({
          profile: data.profile,
          isLoading: false,
          error: null
        });
        return { success: true };
      } else {
        updateProfileState({
          isLoading: false,
          error: data.error || 'Failed to update profile'
        });
        return { 
          success: false, 
          error: data.error || 'Failed to update profile' 
        };
      }
    } catch (error) {
      updateProfileState({
        isLoading: false,
        error: 'Network error. Please try again.'
      });
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }, [updateProfileState]);

  /**
   * Update auto-fill data
   */
  const updateAutoFillData = useCallback(async (formType: string, data: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/profile/autofill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formType, data }),
        credentials: 'include',
      });

      const responseData = await response.json();

      if (response.ok) {
        // Update local auto-fill data
        updateProfileState({
          autoFillData: {
            ...profileState.autoFillData,
            [formType]: data
          }
        });
        return { success: true };
      } else {
        return { 
          success: false, 
          error: responseData.error || 'Failed to update auto-fill data' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }, [profileState.autoFillData, updateProfileState]);

  /**
   * Get auto-fill data for specific form type
   */
  const getAutoFillData = useCallback(async (formType: string): Promise<any> => {
    try {
      const response = await fetch(`/api/profile/autofill/${formType}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.autoFillData;
      } else {
        console.error('Failed to fetch auto-fill data:', await response.text());
        return null;
      }
    } catch (error) {
      console.error('Network error fetching auto-fill data:', error);
      return null;
    }
  }, []);

  /**
   * Update privacy preferences
   */
  const updatePrivacyPreferences = useCallback(async (preferences: Partial<PrivacyPreferences>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/profile/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        updateProfileState({
          privacyPreferences: data.preferences
        });
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Failed to update privacy preferences' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }, [updateProfileState]);

  /**
   * Refresh profile data
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    await fetchProfile();
  }, [fetchProfile]);

  /**
   * Export user data
   */
  const exportData = useCallback(async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response = await fetch('/api/profile/export', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.exportData };
      } else {
        return { 
          success: false, 
          error: data.error || 'Failed to export data' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }, []);

  /**
   * Delete profile (GDPR right to be forgotten)
   */
  const deleteProfile = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Clear local state
        updateProfileState({
          profile: null,
          autoFillData: {},
          privacyPreferences: null,
          isLoading: false,
          error: null
        });
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Failed to delete profile' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }, [updateProfileState]);

  /**
   * Fetch profile on authentication change
   */
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    ...profileState,
    updateProfile,
    updateAutoFillData,
    getAutoFillData,
    updatePrivacyPreferences,
    refreshProfile,
    exportData,
    deleteProfile
  };
}