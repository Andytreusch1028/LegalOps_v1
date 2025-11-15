/**
 * useSmartForm Hook
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Provides Smart Form functionality:
 * - Auto-save drafts
 * - Auto-fill from saved records
 * - Field verification tracking
 * - One-click confirmation dialogs
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface SmartFormOptions {
  /** Form type identifier (e.g., 'llc-formation', 'annual-report') */
  formType: string;

  /** Initial form data */
  initialData?: Record<string, unknown>;

  /** Auto-save interval in milliseconds (default: 5000) */
  autoSaveInterval?: number;

  /** Enable auto-fill from saved records */
  enableAutoFill?: boolean;
}

export interface VerifiedField {
  fieldName: string;
  value: unknown;
  source: 'saved' | 'previous-order' | 'user-profile';
  verifiedAt: string;
}

export function useSmartForm({
  formType,
  initialData = {},
  autoSaveInterval = 5000,
  enableAutoFill = true,
}: SmartFormOptions) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [verifiedFields, setVerifiedFields] = useState<VerifiedField[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  /**
   * Load saved draft from API
   */
  const loadDraft = useCallback(async () => {
    try {
      const response = await fetch(`/api/forms/drafts?formType=${formType}`);
      const data = await response.json();

      if (data.draft) {
        setFormData(prev => ({ ...prev, ...data.draft }));
        setLastSaved(new Date(data.savedAt));

        // Mark all loaded fields as verified
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
  }, [formType]);

  /**
   * Save draft to API
   */
  const saveDraft = useCallback(async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/forms/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
  }, [formType, formData]);

  /**
   * Load saved draft on mount
   */
  useEffect(() => {
    if (enableAutoFill) {
      loadDraft();
    }
  }, [enableAutoFill, loadDraft]);

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
   * Update form field value
   */
  const updateField = useCallback((fieldName: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    setIsDirty(true);
  }, []);

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((fields: Record<string, unknown>) => {
    setFormData(prev => ({
      ...prev,
      ...fields,
    }));
    setIsDirty(true);
  }, []);

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
  const isFieldVerified = useCallback((fieldName: string): boolean => {
    return verifiedFields.some(f => f.fieldName === fieldName);
  }, [verifiedFields]);
  
  /**
   * Auto-fill from saved record with confirmation
   */
  const autoFillFromRecord = useCallback(async (
    record: Record<string, any>,
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
   * Clear draft
   */
  const clearDraft = async () => {
    try {
      await fetch(`/api/forms/drafts?formType=${formType}`, {
        method: 'DELETE',
      });
      
      setFormData(initialData);
      setVerifiedFields([]);
      setIsDirty(false);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };
  
  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setVerifiedFields([]);
    setIsDirty(false);
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
    isFieldVerified,
    autoFillFromRecord,
    
    // Draft management
    isDirty,
    isSaving,
    lastSaved,
    saveDraft,
    clearDraft,
  };
}

