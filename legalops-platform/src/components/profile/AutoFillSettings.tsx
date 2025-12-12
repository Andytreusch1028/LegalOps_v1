/**
 * AutoFillSettings Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Auto-fill preferences management with form type configuration
 */

import React, { useState } from 'react';
import { Settings, Save, AlertCircle, CheckCircle, Eye, EyeOff, Trash2, Plus } from 'lucide-react';
import { SmartFormInput, SmartFormSelect } from '../phase7/SmartFormInput';

export interface AutoFillSettingsProps {
  /** Current auto-fill settings */
  settings: AutoFillSettings;
  
  /** Form submission handler */
  onSubmit: (data: AutoFillSettings) => Promise<void>;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Form-level error message */
  error?: string;
  
  /** Success callback */
  onSuccess?: () => void;
  
  /** Available form types */
  formTypes?: FormType[];
}

export interface AutoFillSettings {
  enabled: boolean;
  formConfigurations: FormConfiguration[];
  globalPreferences: {
    autoSave: boolean;
    promptBeforeUpdate: boolean;
    retainHistory: boolean;
    maxHistoryEntries: number;
  };
  fieldMappings: FieldMapping[];
}

export interface FormType {
  id: string;
  name: string;
  description: string;
  category: 'legal' | 'business' | 'personal' | 'financial';
}

export interface FormConfiguration {
  formTypeId: string;
  enabled: boolean;
  autoFillFields: string[];
  excludedFields: string[];
  verificationRequired: boolean;
  priority: number;
}

export interface FieldMapping {
  id: string;
  fieldName: string;
  profilePath: string;
  displayName: string;
  dataType: 'text' | 'email' | 'phone' | 'date' | 'address' | 'number';
  sensitive: boolean;
  enabled: boolean;
}

const DEFAULT_FORM_TYPES: FormType[] = [
  { id: 'incorporation', name: 'Business Incorporation', description: 'LLC and Corporation formation documents', category: 'legal' },
  { id: 'contract', name: 'Contract Templates', description: 'Service agreements and contracts', category: 'legal' },
  { id: 'employment', name: 'Employment Forms', description: 'Job applications and HR documents', category: 'business' },
  { id: 'tax', name: 'Tax Documents', description: 'Tax forms and financial filings', category: 'financial' },
  { id: 'personal', name: 'Personal Documents', description: 'Personal legal documents', category: 'personal' },
];

const DEFAULT_FIELD_MAPPINGS: FieldMapping[] = [
  { id: '1', fieldName: 'firstName', profilePath: 'firstName', displayName: 'First Name', dataType: 'text', sensitive: false, enabled: true },
  { id: '2', fieldName: 'lastName', profilePath: 'lastName', displayName: 'Last Name', dataType: 'text', sensitive: false, enabled: true },
  { id: '3', fieldName: 'email', profilePath: 'email', displayName: 'Email Address', dataType: 'email', sensitive: true, enabled: true },
  { id: '4', fieldName: 'phone', profilePath: 'phone', displayName: 'Phone Number', dataType: 'phone', sensitive: true, enabled: true },
  { id: '5', fieldName: 'address', profilePath: 'address.street', displayName: 'Street Address', dataType: 'address', sensitive: true, enabled: true },
  { id: '6', fieldName: 'city', profilePath: 'address.city', displayName: 'City', dataType: 'text', sensitive: false, enabled: true },
  { id: '7', fieldName: 'state', profilePath: 'address.state', displayName: 'State', dataType: 'text', sensitive: false, enabled: true },
  { id: '8', fieldName: 'zipCode', profilePath: 'address.zipCode', displayName: 'ZIP Code', dataType: 'text', sensitive: false, enabled: true },
  { id: '9', fieldName: 'companyName', profilePath: 'company.name', displayName: 'Company Name', dataType: 'text', sensitive: false, enabled: true },
  { id: '10', fieldName: 'jobTitle', profilePath: 'company.title', displayName: 'Job Title', dataType: 'text', sensitive: false, enabled: true },
];

export function AutoFillSettings({
  settings,
  onSubmit,
  isLoading = false,
  error,
  onSuccess,
  formTypes = DEFAULT_FORM_TYPES,
}: AutoFillSettingsProps) {
  const [formData, setFormData] = useState<AutoFillSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'forms' | 'fields'>('general');
  const [showSensitiveFields, setShowSensitiveFields] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      setHasChanges(false);
      onSuccess?.();
    } catch (err) {
      // Error handling is managed by parent component
    }
  };

  const updateGlobalPreference = (key: keyof AutoFillSettings['globalPreferences'], value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      globalPreferences: {
        ...prev.globalPreferences,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const updateFormConfiguration = (formTypeId: string, updates: Partial<FormConfiguration>) => {
    setFormData(prev => {
      const existingIndex = prev.formConfigurations.findIndex(config => config.formTypeId === formTypeId);
      
      if (existingIndex >= 0) {
        const newConfigurations = [...prev.formConfigurations];
        newConfigurations[existingIndex] = { ...newConfigurations[existingIndex], ...updates };
        return { ...prev, formConfigurations: newConfigurations };
      } else {
        const newConfiguration: FormConfiguration = {
          formTypeId,
          enabled: true,
          autoFillFields: [],
          excludedFields: [],
          verificationRequired: false,
          priority: prev.formConfigurations.length + 1,
          ...updates,
        };
        return { ...prev, formConfigurations: [...prev.formConfigurations, newConfiguration] };
      }
    });
    setHasChanges(true);
  };

  const updateFieldMapping = (fieldId: string, updates: Partial<FieldMapping>) => {
    setFormData(prev => ({
      ...prev,
      fieldMappings: prev.fieldMappings.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
    setHasChanges(true);
  };

  const addCustomFieldMapping = () => {
    const newField: FieldMapping = {
      id: Date.now().toString(),
      fieldName: '',
      profilePath: '',
      displayName: '',
      dataType: 'text',
      sensitive: false,
      enabled: true,
    };
    
    setFormData(prev => ({
      ...prev,
      fieldMappings: [...prev.fieldMappings, newField],
    }));
    setHasChanges(true);
  };

  const removeFieldMapping = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fieldMappings: prev.fieldMappings.filter(field => field.id !== fieldId),
    }));
    setHasChanges(true);
  };

  const getFormConfiguration = (formTypeId: string): FormConfiguration => {
    return formData.formConfigurations.find(config => config.formTypeId === formTypeId) || {
      formTypeId,
      enabled: false,
      autoFillFields: [],
      excludedFields: [],
      verificationRequired: false,
      priority: 0,
    };
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'forms', label: 'Form Types', icon: CheckCircle },
    { id: 'fields', label: 'Field Mappings', icon: Plus },
  ] as const;

  return (
    <div className="autofill-settings max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Auto-Fill Settings</h1>
        <p className="text-slate-600">Configure how your profile data is used to auto-fill forms</p>
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

      {/* Master Toggle */}
      <div className="liquid-glass-card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-slate-900">Enable Auto-Fill</h3>
            <p className="text-slate-600 text-sm">Automatically populate form fields with your saved information</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, enabled: e.target.checked }));
                setHasChanges(true);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>
      </div>

      {formData.enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Tabs */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="liquid-glass-card">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-6">General Preferences</h2>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-slate-700 font-medium">Auto-save form data</span>
                        <p className="text-slate-500 text-sm">Automatically save form data as you type</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.globalPreferences.autoSave}
                        onChange={(e) => updateGlobalPreference('autoSave', e.target.checked)}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-slate-700 font-medium">Prompt before updating profile</span>
                        <p className="text-slate-500 text-sm">Ask before updating your profile with new form data</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.globalPreferences.promptBeforeUpdate}
                        onChange={(e) => updateGlobalPreference('promptBeforeUpdate', e.target.checked)}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-slate-700 font-medium">Retain form history</span>
                        <p className="text-slate-500 text-sm">Keep a history of previously entered values</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.globalPreferences.retainHistory}
                        onChange={(e) => updateGlobalPreference('retainHistory', e.target.checked)}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                    </label>

                    {formData.globalPreferences.retainHistory && (
                      <SmartFormInput
                        label="Maximum history entries"
                        name="maxHistoryEntries"
                        type="number"
                        value={formData.globalPreferences.maxHistoryEntries.toString()}
                        onChange={(value) => updateGlobalPreference('maxHistoryEntries', parseInt(value) || 10)}
                        helperText="Number of previous values to remember for each field"
                        min="1"
                        max="50"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Form Types Configuration */}
              {activeTab === 'forms' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">Form Type Settings</h2>
                  </div>

                  <div className="space-y-4">
                    {formTypes.map((formType) => {
                      const config = getFormConfiguration(formType.id);
                      return (
                        <div key={formType.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-medium text-slate-900">{formType.name}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  formType.category === 'legal' ? 'bg-blue-100 text-blue-700' :
                                  formType.category === 'business' ? 'bg-green-100 text-green-700' :
                                  formType.category === 'financial' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-purple-100 text-purple-700'
                                }`}>
                                  {formType.category}
                                </span>
                              </div>
                              <p className="text-slate-600 text-sm">{formType.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer ml-4">
                              <input
                                type="checkbox"
                                checked={config.enabled}
                                onChange={(e) => updateFormConfiguration(formType.id, { enabled: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                            </label>
                          </div>

                          {config.enabled && (
                            <div className="space-y-3 pt-3 border-t border-slate-100">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={config.verificationRequired}
                                  onChange={(e) => updateFormConfiguration(formType.id, { verificationRequired: e.target.checked })}
                                  className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                                />
                                <span className="text-slate-700 text-sm">Require verification before auto-fill</span>
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Field Mappings */}
              {activeTab === 'fields' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">Field Mappings</h2>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setShowSensitiveFields(!showSensitiveFields)}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-700 transition-colors"
                      >
                        {showSensitiveFields ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showSensitiveFields ? 'Hide' : 'Show'} sensitive fields
                      </button>
                      <button
                        type="button"
                        onClick={addCustomFieldMapping}
                        className="liquid-glass-button flex items-center gap-2 py-2 px-4"
                      >
                        <Plus size={16} />
                        Add Field
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {formData.fieldMappings
                      .filter(field => showSensitiveFields || !field.sensitive)
                      .map((field) => (
                        <div key={field.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.enabled}
                                onChange={(e) => updateFieldMapping(field.id, { enabled: e.target.checked })}
                                className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                              />
                            </label>

                            <div className="flex-1 grid grid-cols-3 gap-4">
                              <SmartFormInput
                                label="Display Name"
                                name={`field-${field.id}-displayName`}
                                value={field.displayName}
                                onChange={(value) => updateFieldMapping(field.id, { displayName: value })}
                                className="mb-0"
                              />

                              <SmartFormInput
                                label="Field Name"
                                name={`field-${field.id}-fieldName`}
                                value={field.fieldName}
                                onChange={(value) => updateFieldMapping(field.id, { fieldName: value })}
                                className="mb-0"
                              />

                              <SmartFormInput
                                label="Profile Path"
                                name={`field-${field.id}-profilePath`}
                                value={field.profilePath}
                                onChange={(value) => updateFieldMapping(field.id, { profilePath: value })}
                                className="mb-0"
                                placeholder="e.g., firstName, address.street"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              {field.sensitive && (
                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                                  Sensitive
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => removeFieldMapping(field.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}