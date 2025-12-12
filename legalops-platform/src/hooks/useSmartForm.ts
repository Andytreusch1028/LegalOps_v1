/**
 * useSmartForm Hook
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Provides Smart Form functionality:
 * - Auto-save drafts
 * - Auto-fill from saved records and user profile
 * - Field verification tracking
 * - Profile update prompts
 * - Cross-device synchronization
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';

export interface SmartFormOptions {
  /** Form type identifier (e.g., 'llc-formation', 'annual-report') */
  formType: string;

  /** Initial form data */
  initialData?: Record<string, unknown>;

  /** Auto-save interval in milliseconds (default: 5000) */
  autoSaveInterval?: number;

  /** Enable auto-fill from saved records */
  enableAutoFill?: boolean;

  /** Enable profile update prompts */
  enableProfileUpdates?: boolean;

  /** Fields that should trigger profile update prompts */
  profileUpdateFields?: string[];
}

export interface VerifiedField {
  fieldName: string;
  value: unknown;
  source: 'saved' | 'previous-order' | 'user-profile';
  verifiedAt: string;
}

export interface ProfileUpdateSuggestion {
  fieldName: string;
  currentValue: unknown;
  newValue: unknown;
  confidence: 'high' | 'medium' | 'low';
}

export function useSmartForm({
  formType,
  initialData = {},
  autoSaveInterval = 5000,
  enableAutoFill = true,
  enableProfileUpdates = true,
  profileUpdateFields = [],
}: SmartFormOptions) {
  const { isAuthenticated } = useAuth();
  const { profile, getAutoFillData, saveAutoFillData, getProfileAutoFillData, isFieldVerified } = useProfile();
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [verifiedFields, setVerifiedFields] = useState<VerifiedField[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [profileUpdateSuggestions, setProfileUpdateSuggestions] = useState<ProfileUpdateSuggestion[]>([]);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  
  /**
   * Load saved draft from API
   */
  const loadDraft = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`/api/forms/drafts?formType=${formType}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success && data.draft) {
        setFormData(prev => ({ ...prev, ...data.draft }));
        setLastSaved(new Date(data.savedAt));

        // Mark all loaded fields as verified from saved draft
        Object.keys(data.draft).forEach(fieldName => {
          setVerifiedFields(prev => [
            ...prev.filter(f => f.fieldName !== fieldName),
            {
              fieldName,
              value: data.draft[fieldName],
              source: 'saved',
              verifiedAt: new Date().toISOString(),
            },
          ]);
        });
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, [formType, isAuthenticated]);

  /**
   * Save draft to API
   */
  const saveDraft = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsSaving(true);

    try {
      const response = await fetch('/api/forms/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          formType,
          data: formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLastSaved(new Date(result.savedAt));
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [formType, formData, isAuthenticated]);

  /**
   * Load auto-fill data from user profile
   */
  const loadProfileAutoFill = useCallback(async () => {
    if (!isAuthenticated || !enableAutoFill || !profile?.autoFillPreferences.enableAutoFill || hasAutoFilled) {
      return;
    }

    try {
      // Get form-specific auto-fill data
      const autoFillData = await getAutoFillData(formType);
      
      // Get general profile data
      const profileData = getProfileAutoFillData();
      
      // Combine both sources, prioritizing form-specific data
      const combinedData = { ...profileData, ...autoFillData };
      
      // Filter out empty values
      const filteredData = Object.entries(combinedData).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>);

      if (Object.keys(filteredData).length > 0) {
        // Show confirmation dialog for auto-fill
        const confirmed = window.confirm(
          `We found ${Object.keys(filteredData).length} saved values that can be used to fill this form. Would you like to use them?`
        );

        if (confirmed) {
          setFormData(prev => ({ ...prev, ...filteredData }));
          setHasAutoFilled(true);

          // Mark profile fields as verified
          Object.keys(filteredData).forEach(fieldName => {
            const isFromProfile = isFieldVerified(fieldName);
            setVerifiedFields(prev => [
              ...prev.filter(f => f.fieldName !== fieldName),
              {
                fieldName,
                value: filteredData[fieldName],
                source: isFromProfile ? 'user-profile' : 'saved',
                verifiedAt: new Date().toISOString(),
              },
            ]);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load profile auto-fill:', error);
    }
  }, [isAuthenticated, enableAutoFill, profile, hasAutoFilled, formType, getAutoFillData, getProfileAutoFillData, isFieldVerified]);

  /**
   * Load saved draft and auto-fill data on mount
   */
  useEffect(() => {
    if (enableAutoFill && isAuthenticated) {
      loadDraft();
    }
  }, [enableAutoFill, isAuthenticated, loadDraft]);

  /**
   * Load profile auto-fill when profile is available
   */
  useEffect(() => {
    if (profile && !hasAutoFilled) {
      loadProfileAutoFill();
    }
  }, [profile, hasAutoFilled, loadProfileAutoFill]);

  /**
   * Auto-save draft when form data changes
   */
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      saveDraft();
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [formData, isDirty, autoSaveInterval, saveDraft]);
  
  /**
   * Check for profile update suggestions
   */
  const checkProfileUpdateSuggestions = useCallback((fieldName: string, newValue: unknown) => {
    if (!enableProfileUpdates || !profile || !profileUpdateFields.includes(fieldName)) {
      return;
    }

    const profileData = getProfileAutoFillData();
    const currentProfileValue = profileData[fieldName];

    // Only suggest update if values are different and new value is not empty
    if (currentProfileValue !== newValue && newValue && newValue !== '') {
      setProfileUpdateSuggestions(prev => {
        const existing = prev.find(s => s.fieldName === fieldName);
        const suggestion: ProfileUpdateSuggestion = {
          fieldName,
          currentValue: currentProfileValue,
          newValue,
          confidence: 'high', // Could be enhanced with more sophisticated logic
        };

        if (existing) {
          return prev.map(s => s.fieldName === fieldName ? suggestion : s);
        } else {
          return [...prev, suggestion];
        }
      });
    }
  }, [enableProfileUpdates, profile, profileUpdateFields, getProfileAutoFillData]);

  /**
   * Update form field value
   */
  const updateField = useCallback((fieldName: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    setIsDirty(true);

    // Check for profile update suggestions
    checkProfileUpdateSuggestions(fieldName, value);
  }, [checkProfileUpdateSuggestions]);

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((fields: Record<string, unknown>) => {
    setFormData(prev => ({
      ...prev,
      ...fields,
    }));
    setIsDirty(true);

    // Check for profile update suggestions for each field
    Object.entries(fields).forEach(([fieldName, value]) => {
      checkProfileUpdateSuggestions(fieldName, value);
    });
  }, [checkProfileUpdateSuggestions]);

  /**
   * Mark field as verified (from saved record)
   */
  const verifyField = useCallback((
    fieldName: string,
    value: unknown,
    source: VerifiedField['source']
  ) => {
    setVerifiedFields(prev => [
      ...prev.filter(f => f.fieldName !== fieldName),
      {
        fieldName,
        value,
        source,
        verifiedAt: new Date().toISOString(),
      },
    ]);
  }, []);
  
  /**
   * Check if field is verified
   */
  const isFormFieldVerified = useCallback((fieldName: string): boolean => {
    return verifiedFields.some(f => f.fieldName === fieldName);
  }, [verifiedFields]);

  /**
   * Get verification source for a field
   */
  const getFieldVerificationSource = useCallback((fieldName: string): VerifiedField['source'] | null => {
    const field = verifiedFields.find(f => f.fieldName === fieldName);
    return field?.source || null;
  }, [verifiedFields]);
  
  /**
   * Auto-fill from saved record with confirmation
   */
  const autoFillFromRecord = useCallback(async (
    record: Record<string, unknown>,
    source: VerifiedField['source']
  ) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'We found saved information. Would you like to use it to fill this form?'
    );
    
    if (!confirmed) return;
    
    // Update form data
    updateFields(record);
    
    // Mark all fields as verified
    Object.entries(record).forEach(([fieldName, value]) => {
      verifyField(fieldName, value, source);
    });
  }, [updateFields, verifyField]);

  /**
   * Apply profile update suggestions
   */
  const applyProfileUpdateSuggestions = useCallback(async (suggestions: ProfileUpdateSuggestion[]) => {
    if (!isAuthenticated || suggestions.length === 0) return;

    try {
      // Convert suggestions to profile update format
      const profileUpdates: any = {
        personalInfo: {},
        addresses: { personal: {}, mailing: {}, business: {} },
        businessInfo: {},
      };

      suggestions.forEach(suggestion => {
        const { fieldName, newValue } = suggestion;
        
        // Map form fields to profile structure
        if (['firstName', 'lastName', 'middleName', 'phone', 'alternatePhone'].includes(fieldName)) {
          profileUpdates.personalInfo[fieldName] = newValue;
        } else if (fieldName.startsWith('personal')) {
          const addressField = fieldName.replace('personal', '').toLowerCase();
          if (addressField === 'street') profileUpdates.addresses.personal.street = newValue;
          else if (addressField === 'street2') profileUpdates.addresses.personal.street2 = newValue;
          else if (addressField === 'city') profileUpdates.addresses.personal.city = newValue;
          else if (addressField === 'state') profileUpdates.addresses.personal.state = newValue;
          else if (addressField === 'zipcode') profileUpdates.addresses.personal.zipCode = newValue;
        } else if (fieldName.startsWith('mailing')) {
          const addressField = fieldName.replace('mailing', '').toLowerCase();
          if (addressField === 'street') profileUpdates.addresses.mailing.street = newValue;
          else if (addressField === 'street2') profileUpdates.addresses.mailing.street2 = newValue;
          else if (addressField === 'city') profileUpdates.addresses.mailing.city = newValue;
          else if (addressField === 'state') profileUpdates.addresses.mailing.state = newValue;
          else if (addressField === 'zipcode') profileUpdates.addresses.mailing.zipCode = newValue;
        } else if (fieldName.startsWith('business')) {
          const businessField = fieldName.replace('business', '').toLowerCase();
          if (businessField === 'street') profileUpdates.addresses.business.street = newValue;
          else if (businessField === 'street2') profileUpdates.addresses.business.street2 = newValue;
          else if (businessField === 'city') profileUpdates.addresses.business.city = newValue;
          else if (businessField === 'state') profileUpdates.addresses.business.state = newValue;
          else if (businessField === 'zipcode') profileUpdates.addresses.business.zipCode = newValue;
          else if (businessField === 'phone') profileUpdates.businessInfo.businessPhone = newValue;
          else if (businessField === 'email') profileUpdates.businessInfo.businessEmail = newValue;
        } else if (['companyName', 'jobTitle', 'industry', 'fein', 'businessType'].includes(fieldName)) {
          if (fieldName === 'jobTitle') profileUpdates.businessInfo.title = newValue;
          else profileUpdates.businessInfo[fieldName] = newValue;
        }
      });

      // Save to profile
      await saveAutoFillData(formType, profileUpdates, suggestions.map(s => s.fieldName));
      
      // Clear suggestions
      setProfileUpdateSuggestions([]);
      
    } catch (error) {
      console.error('Failed to apply profile updates:', error);
    }
  }, [isAuthenticated, formType, saveAutoFillData]);

  /**
   * Dismiss profile update suggestions
   */
  const dismissProfileUpdateSuggestions = useCallback((fieldNames?: string[]) => {
    if (fieldNames) {
      setProfileUpdateSuggestions(prev => prev.filter(s => !fieldNames.includes(s.fieldName)));
    } else {
      setProfileUpdateSuggestions([]);
    }
  }, []);
  
  /**
   * Clear draft
   */
  const clearDraft = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await fetch(`/api/forms/drafts?formType=${formType}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      setFormData(initialData);
      setVerifiedFields([]);
      setIsDirty(false);
      setLastSaved(null);
      setProfileUpdateSuggestions([]);
      setHasAutoFilled(false);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [formType, initialData, isAuthenticated]);
  
  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setVerifiedFields([]);
    setIsDirty(false);
    setProfileUpdateSuggestions([]);
    setHasAutoFilled(false);
  }, [initialData]);
  
  return {
    // Form data
    formData,
    updateField,
    updateFields,
    resetForm,
    
    // Verification
    verifiedFields,
    verifyField,
    isFieldVerified: isFormFieldVerified,
    getFieldVerificationSource,
    autoFillFromRecord,
    
    // Draft management
    isDirty,
    isSaving,
    lastSaved,
    saveDraft,
    clearDraft,
    
    // Profile integration
    profileUpdateSuggestions,
    applyProfileUpdateSuggestions,
    dismissProfileUpdateSuggestions,
    hasAutoFilled,
    
    // Authentication state
    isAuthenticated,
  };
}

