/**
 * SmartFormExample Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Example implementation showing Smart Forms with authentication integration
 */

import React from 'react';
import { Save, RotateCcw, User } from 'lucide-react';
import { useSmartForm } from '@/hooks/useSmartForm';
import { AuthenticatedSmartFormInput } from './AuthenticatedSmartFormInput';
import { ProfileUpdatePrompt } from './ProfileUpdatePrompt';

export interface SmartFormExampleProps {
  /** Form type identifier */
  formType: string;
  
  /** Form title */
  title: string;
  
  /** Form submission handler */
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  
  /** Loading state */
  isSubmitting?: boolean;
}

export function SmartFormExample({
  formType,
  title,
  onSubmit,
  isSubmitting = false,
}: SmartFormExampleProps) {
  const {
    formData,
    updateField,
    resetForm,
    isFieldVerified,
    getFieldVerificationSource,
    isDirty,
    isSaving,
    lastSaved,
    profileUpdateSuggestions,
    applyProfileUpdateSuggestions,
    dismissProfileUpdateSuggestions,
    isAuthenticated,
  } = useSmartForm({
    formType,
    enableAutoFill: true,
    enableProfileUpdates: true,
    profileUpdateFields: [
      'firstName',
      'lastName',
      'phone',
      'personalStreet',
      'personalCity',
      'personalState',
      'personalZipCode',
      'companyName',
      'jobTitle',
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleFieldChange = (fieldName: string) => (value: string) => {
    updateField(fieldName, value);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="liquid-glass-card text-center py-12">
          <User className="mx-auto text-slate-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Sign In Required</h2>
          <p className="text-slate-600 mb-6">
            Please sign in to access Smart Forms with auto-fill and draft saving capabilities.
          </p>
          <button className="liquid-glass-button">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Form Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          {lastSaved && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
          {isSaving && (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          )}
        </div>
      </div>

      {/* Profile Update Prompt */}
      {profileUpdateSuggestions.length > 0 && (
        <ProfileUpdatePrompt
          suggestions={profileUpdateSuggestions}
          onApply={applyProfileUpdateSuggestions}
          onDismiss={dismissProfileUpdateSuggestions}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="liquid-glass-card">
        <div className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <AuthenticatedSmartFormInput
                label="First Name"
                name="firstName"
                value={String(formData.firstName || '')}
                onChange={handleFieldChange('firstName')}
                isVerified={isFieldVerified('firstName')}
                verificationSource={getFieldVerificationSource('firstName')}
                required
                autoComplete="given-name"
              />
              
              <AuthenticatedSmartFormInput
                label="Last Name"
                name="lastName"
                value={String(formData.lastName || '')}
                onChange={handleFieldChange('lastName')}
                isVerified={isFieldVerified('lastName')}
                verificationSource={getFieldVerificationSource('lastName')}
                required
                autoComplete="family-name"
              />
            </div>

            <AuthenticatedSmartFormInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={String(formData.phone || '')}
              onChange={handleFieldChange('phone')}
              isVerified={isFieldVerified('phone')}
              verificationSource={getFieldVerificationSource('phone')}
              autoComplete="tel"
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Address Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Address</h2>
            
            <AuthenticatedSmartFormInput
              label="Street Address"
              name="personalStreet"
              value={String(formData.personalStreet || '')}
              onChange={handleFieldChange('personalStreet')}
              isVerified={isFieldVerified('personalStreet')}
              verificationSource={getFieldVerificationSource('personalStreet')}
              autoComplete="street-address"
              placeholder="123 Main Street"
            />

            <div className="grid grid-cols-3 gap-4">
              <AuthenticatedSmartFormInput
                label="City"
                name="personalCity"
                value={String(formData.personalCity || '')}
                onChange={handleFieldChange('personalCity')}
                isVerified={isFieldVerified('personalCity')}
                verificationSource={getFieldVerificationSource('personalCity')}
                autoComplete="address-level2"
              />
              
              <AuthenticatedSmartFormInput
                label="State"
                name="personalState"
                value={String(formData.personalState || '')}
                onChange={handleFieldChange('personalState')}
                isVerified={isFieldVerified('personalState')}
                verificationSource={getFieldVerificationSource('personalState')}
                autoComplete="address-level1"
                placeholder="CA"
              />
              
              <AuthenticatedSmartFormInput
                label="ZIP Code"
                name="personalZipCode"
                value={String(formData.personalZipCode || '')}
                onChange={handleFieldChange('personalZipCode')}
                isVerified={isFieldVerified('personalZipCode')}
                verificationSource={getFieldVerificationSource('personalZipCode')}
                autoComplete="postal-code"
                placeholder="12345"
              />
            </div>
          </div>

          {/* Business Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Information</h2>
            
            <AuthenticatedSmartFormInput
              label="Company Name"
              name="companyName"
              value={String(formData.companyName || '')}
              onChange={handleFieldChange('companyName')}
              isVerified={isFieldVerified('companyName')}
              verificationSource={getFieldVerificationSource('companyName')}
              autoComplete="organization"
              placeholder="Acme Corporation"
            />

            <AuthenticatedSmartFormInput
              label="Job Title"
              name="jobTitle"
              value={String(formData.jobTitle || '')}
              onChange={handleFieldChange('jobTitle')}
              isVerified={isFieldVerified('jobTitle')}
              verificationSource={getFieldVerificationSource('jobTitle')}
              autoComplete="organization-title"
              placeholder="Software Engineer"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-8">
          <button
            type="button"
            onClick={resetForm}
            disabled={!isDirty}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={16} />
            Reset Form
          </button>
          
          <div className="flex items-center gap-4">
            {isDirty && (
              <span className="text-sm text-slate-500">You have unsaved changes</span>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="liquid-glass-button flex items-center gap-2 py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Submit Form
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Smart Features Info */}
      <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <h3 className="font-medium text-slate-900 mb-2">Smart Features Active</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Auto-save: Your progress is automatically saved every 5 seconds</li>
          <li>• Auto-fill: Fields are pre-filled from your profile and previous forms</li>
          <li>• Verification: Verified fields are marked with a blue glow and checkmark</li>
          <li>• Profile Updates: New information can be saved to your profile for future use</li>
          <li>• Cross-device Sync: Access your drafts from any device</li>
        </ul>
      </div>
    </div>
  );
}