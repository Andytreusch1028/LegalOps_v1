/**
 * ProfileManager Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Profile editing component with Liquid Glass design system
 */

import React, { useState } from 'react';
import { User, Save, AlertCircle, CheckCircle, Edit3, Camera } from 'lucide-react';
import { SmartFormInput, SmartFormSelect } from '../phase7/SmartFormInput';

export interface ProfileManagerProps {
  /** Current user profile data */
  profile: UserProfile;
  
  /** Form submission handler */
  onSubmit: (data: UserProfile) => Promise<void>;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Form-level error message */
  error?: string;
  
  /** Success callback */
  onSuccess?: () => void;
  
  /** Avatar upload handler */
  onAvatarUpload?: (file: File) => Promise<string>;
  
  /** Show verification badges */
  showVerification?: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  company?: {
    name: string;
    title: string;
    industry: string;
  };
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      marketing: boolean;
    };
  };
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
];

export function ProfileManager({
  profile,
  onSubmit,
  isLoading = false,
  error,
  onSuccess,
  onAvatarUpload,
  showVerification = true,
}: ProfileManagerProps) {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<'personal' | 'address' | 'company' | 'preferences'>('personal');
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Personal information validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Address validation (if provided)
    if (formData.address?.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.address.zipCode)) {
      errors['address.zipCode'] = 'Please enter a valid ZIP code';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
      setHasChanges(false);
      onSuccess?.();
    } catch (err) {
      // Error handling is managed by parent component
    }
  };

  const updateField = (path: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    
    setHasChanges(true);
    
    // Clear field error when user starts typing
    if (fieldErrors[path]) {
      setFieldErrors(prev => ({ ...prev, [path]: undefined }));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAvatarUpload) return;
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setFieldErrors(prev => ({ ...prev, avatar: 'Please select an image file' }));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setFieldErrors(prev => ({ ...prev, avatar: 'Image must be smaller than 5MB' }));
      return;
    }
    
    setIsUploading(true);
    try {
      const avatarUrl = await onAvatarUpload(file);
      updateField('avatar', avatarUrl);
      setFieldErrors(prev => ({ ...prev, avatar: undefined }));
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, avatar: 'Failed to upload image' }));
    } finally {
      setIsUploading(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'address', label: 'Address', icon: Edit3 },
    { id: 'company', label: 'Company', icon: Edit3 },
    { id: 'preferences', label: 'Preferences', icon: Edit3 },
  ] as const;

  return (
    <div className="profile-manager max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Settings</h1>
        <p className="text-slate-600">Manage your personal information and preferences</p>
      </div>

      {/* Form Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Update Failed</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={20} />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="liquid-glass-card">
            {/* Personal Information */}
            {activeSection === 'personal' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
                  {showVerification && formData.emailVerified && (
                    <span className="trust-badge">
                      <CheckCircle size={16} />
                      Verified
                    </span>
                  )}
                </div>

                {/* Avatar Upload */}
                {onAvatarUpload && (
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                        {formData.avatar ? (
                          <img
                            src={formData.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="text-slate-400" size={32} />
                        )}
                      </div>
                      {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="liquid-glass-button inline-flex items-center gap-2 cursor-pointer">
                        <Camera size={16} />
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                      <p className="text-sm text-slate-500 mt-1">JPG, PNG up to 5MB</p>
                      {fieldErrors.avatar && (
                        <p className="text-red-600 text-sm mt-1">{fieldErrors.avatar}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <SmartFormInput
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(value) => updateField('firstName', value)}
                    error={fieldErrors.firstName}
                    required
                    autoComplete="given-name"
                  />
                  
                  <SmartFormInput
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(value) => updateField('lastName', value)}
                    error={fieldErrors.lastName}
                    required
                    autoComplete="family-name"
                  />
                </div>

                {/* Email and Phone */}
                <SmartFormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => updateField('email', value)}
                  error={fieldErrors.email}
                  isVerified={showVerification && formData.emailVerified}
                  verificationSource="user-profile"
                  required
                  autoComplete="email"
                />

                <SmartFormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(value) => updateField('phone', value)}
                  error={fieldErrors.phone}
                  isVerified={showVerification && formData.phoneVerified}
                  verificationSource="user-profile"
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                />

                <SmartFormInput
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(value) => updateField('dateOfBirth', value)}
                  autoComplete="bday"
                />
              </div>
            )}

            {/* Address Information */}
            {activeSection === 'address' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Address Information</h2>

                <SmartFormInput
                  label="Street Address"
                  name="address.street"
                  value={formData.address?.street || ''}
                  onChange={(value) => updateField('address.street', value)}
                  autoComplete="street-address"
                  placeholder="123 Main Street"
                />

                <div className="grid grid-cols-2 gap-4">
                  <SmartFormInput
                    label="City"
                    name="address.city"
                    value={formData.address?.city || ''}
                    onChange={(value) => updateField('address.city', value)}
                    autoComplete="address-level2"
                  />
                  
                  <SmartFormSelect
                    label="State"
                    name="address.state"
                    value={formData.address?.state || ''}
                    onChange={(value) => updateField('address.state', value)}
                    options={US_STATES}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <SmartFormInput
                    label="ZIP Code"
                    name="address.zipCode"
                    value={formData.address?.zipCode || ''}
                    onChange={(value) => updateField('address.zipCode', value)}
                    error={fieldErrors['address.zipCode']}
                    autoComplete="postal-code"
                    placeholder="12345"
                  />
                  
                  <SmartFormInput
                    label="Country"
                    name="address.country"
                    value={formData.address?.country || 'United States'}
                    onChange={(value) => updateField('address.country', value)}
                    autoComplete="country-name"
                  />
                </div>
              </div>
            )}

            {/* Company Information */}
            {activeSection === 'company' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Company Information</h2>

                <SmartFormInput
                  label="Company Name"
                  name="company.name"
                  value={formData.company?.name || ''}
                  onChange={(value) => updateField('company.name', value)}
                  autoComplete="organization"
                  placeholder="Acme Corporation"
                />

                <SmartFormInput
                  label="Job Title"
                  name="company.title"
                  value={formData.company?.title || ''}
                  onChange={(value) => updateField('company.title', value)}
                  autoComplete="organization-title"
                  placeholder="Software Engineer"
                />

                <SmartFormInput
                  label="Industry"
                  name="company.industry"
                  value={formData.company?.industry || ''}
                  onChange={(value) => updateField('company.industry', value)}
                  placeholder="Technology"
                />
              </div>
            )}

            {/* Preferences */}
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Preferences</h2>

                <div className="grid grid-cols-2 gap-4">
                  <SmartFormSelect
                    label="Language"
                    name="preferences.language"
                    value={formData.preferences.language}
                    onChange={(value) => updateField('preferences.language', value)}
                    options={LANGUAGES}
                  />
                  
                  <SmartFormSelect
                    label="Timezone"
                    name="preferences.timezone"
                    value={formData.preferences.timezone}
                    onChange={(value) => updateField('preferences.timezone', value)}
                    options={TIMEZONES}
                  />
                </div>

                {/* Notification Preferences */}
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.notifications.email}
                        onChange={(e) => updateField('preferences.notifications.email', e.target.checked)}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                      <span className="text-slate-700">Email notifications</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.notifications.sms}
                        onChange={(e) => updateField('preferences.notifications.sms', e.target.checked)}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                      <span className="text-slate-700">SMS notifications</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.notifications.marketing}
                        onChange={(e) => updateField('preferences.notifications.marketing', e.target.checked)}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                      <span className="text-slate-700">Marketing communications</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                {hasChanges && 'You have unsaved changes'}
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="liquid-glass-button flex items-center gap-2 py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}