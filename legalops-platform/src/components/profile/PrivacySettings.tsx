/**
 * PrivacySettings Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Privacy controls and data management settings
 */

import React, { useState } from 'react';
import { Shield, Save, AlertCircle, Eye, EyeOff, Download, Trash2, Clock, Lock } from 'lucide-react';
import { SmartFormSelect } from '../phase7/SmartFormInput';

export interface PrivacySettingsProps {
  /** Current privacy settings */
  settings: PrivacySettings;
  
  /** Form submission handler */
  onSubmit: (data: PrivacySettings) => Promise<void>;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Form-level error message */
  error?: string;
  
  /** Success callback */
  onSuccess?: () => void;
  
  /** Data export handler */
  onExportData?: () => Promise<void>;
  
  /** Account deletion handler */
  onDeleteAccount?: () => Promise<void>;
}

export interface PrivacySettings {
  dataVisibility: {
    profilePublic: boolean;
    showEmail: boolean;
    showPhone: boolean;
    showAddress: boolean;
    showCompany: boolean;
  };
  dataRetention: {
    retainFormDrafts: boolean;
    draftRetentionDays: number;
    retainCompletedForms: boolean;
    completedFormRetentionDays: number;
    retainActivityLogs: boolean;
    activityLogRetentionDays: number;
  };
  dataSharing: {
    allowAnalytics: boolean;
    allowMarketing: boolean;
    allowThirdPartyIntegrations: boolean;
    shareAnonymizedData: boolean;
  };
  security: {
    requireTwoFactor: boolean;
    sessionTimeout: number;
    allowMultipleSessions: boolean;
    logSecurityEvents: boolean;
  };
  communications: {
    securityAlerts: boolean;
    privacyUpdates: boolean;
    dataProcessingNotifications: boolean;
    breachNotifications: boolean;
  };
}

const RETENTION_OPTIONS = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '6 months' },
  { value: '365', label: '1 year' },
  { value: '730', label: '2 years' },
  { value: '1095', label: '3 years' },
  { value: '0', label: 'Never delete' },
];

const SESSION_TIMEOUT_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '240', label: '4 hours' },
  { value: '480', label: '8 hours' },
  { value: '1440', label: '24 hours' },
  { value: '0', label: 'Never timeout' },
];

export function PrivacySettings({
  settings,
  onSubmit,
  isLoading = false,
  error,
  onSuccess,
  onExportData,
  onDeleteAccount,
}: PrivacySettingsProps) {
  const [formData, setFormData] = useState<PrivacySettings>(settings);
  const [activeSection, setActiveSection] = useState<'visibility' | 'retention' | 'sharing' | 'security' | 'communications'>('visibility');
  const [hasChanges, setHasChanges] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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

  const updateSetting = (section: keyof PrivacySettings, key: string, value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleExportData = async () => {
    if (!onExportData) return;
    
    setIsExporting(true);
    try {
      await onExportData();
    } catch (err) {
      // Error handling is managed by parent component
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!onDeleteAccount) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.'
    );
    
    if (!confirmed) return;
    
    setIsDeletingAccount(true);
    try {
      await onDeleteAccount();
    } catch (err) {
      // Error handling is managed by parent component
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const sections = [
    { id: 'visibility', label: 'Data Visibility', icon: Eye },
    { id: 'retention', label: 'Data Retention', icon: Clock },
    { id: 'sharing', label: 'Data Sharing', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'communications', label: 'Communications', icon: AlertCircle },
  ] as const;

  return (
    <div className="privacy-settings max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Privacy Settings</h1>
        <p className="text-slate-600">Control how your data is used, stored, and shared</p>
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

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="liquid-glass-card">
            {/* Data Visibility */}
            {activeSection === 'visibility' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Data Visibility</h2>
                <p className="text-slate-600 mb-6">Control what information is visible in your profile</p>

                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Public profile</span>
                      <p className="text-slate-500 text-sm">Make your profile visible to other users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.dataVisibility.profilePublic}
                      onChange={(e) => updateSetting('dataVisibility', 'profilePublic', e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Show email address</span>
                      <p className="text-slate-500 text-sm">Display your email in your public profile</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.dataVisibility.showEmail}
                      onChange={(e) => updateSetting('dataVisibility', 'showEmail', e.target.checked)}
                      disabled={!formData.dataVisibility.profilePublic}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 disabled:opacity-50"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Show phone number</span>
                      <p className="text-slate-500 text-sm">Display your phone number in your public profile</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.dataVisibility.showPhone}
                      onChange={(e) => updateSetting('dataVisibility', 'showPhone', e.target.checked)}
                      disabled={!formData.dataVisibility.profilePublic}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 disabled:opacity-50"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Show address</span>
                      <p className="text-slate-500 text-sm">Display your address in your public profile</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.dataVisibility.showAddress}
                      onChange={(e) => updateSetting('dataVisibility', 'showAddress', e.target.checked)}
                      disabled={!formData.dataVisibility.profilePublic}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 disabled:opacity-50"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Show company information</span>
                      <p className="text-slate-500 text-sm">Display your company details in your public profile</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.dataVisibility.showCompany}
                      onChange={(e) => updateSetting('dataVisibility', 'showCompany', e.target.checked)}
                      disabled={!formData.dataVisibility.profilePublic}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 disabled:opacity-50"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Data Retention */}
            {activeSection === 'retention' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Data Retention</h2>
                <p className="text-slate-600 mb-6">Control how long your data is stored</p>

                <div className="space-y-6">
                  <div>
                    <label className="flex items-center justify-between cursor-pointer mb-4">
                      <div>
                        <span className="text-slate-700 font-medium">Retain form drafts</span>
                        <p className="text-slate-500 text-sm">Keep your unfinished forms for later completion</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.dataRetention.retainFormDrafts}
                        onChange={(e) => updateSetting('dataRetention', 'retainFormDrafts', e.target.checked)}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                    </label>
                    
                    {formData.dataRetention.retainFormDrafts && (
                      <SmartFormSelect
                        label="Draft retention period"
                        name="draftRetentionDays"
                        value={formData.dataRetention.draftRetentionDays.toString()}
                        onChange={(value) => updateSetting('dataRetention', 'draftRetentionDays', parseInt(value))}
                        options={RETENTION_OPTIONS}
                      />
                    )}
                  </div>

                  <div>
                    <label className="flex items-center justify-between cursor-pointer mb-4">
                      <div>
                        <span className="text-slate-700 font-medium">Retain completed forms</span>
                        <p className="text-slate-500 text-sm">Keep copies of your completed forms</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.dataRetention.retainCompletedForms}
                        onChange={(e) => updateSetting('dataRetention', 'retainCompletedForms', e.target.checked)}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                    </label>
                    
                    {formData.dataRetention.retainCompletedForms && (
                      <SmartFormSelect
                        label="Completed form retention period"
                        name="completedFormRetentionDays"
                        value={formData.dataRetention.completedFormRetentionDays.toString()}
                        onChange={(value) => updateSetting('dataRetention', 'completedFormRetentionDays', parseInt(value))}
                        options={RETENTION_OPTIONS}
                      />
                    )}
                  </div>

                  <div>
                    <label className="flex items-center justify-between cursor-pointer mb-4">
                      <div>
                        <span className="text-slate-700 font-medium">Retain activity logs</span>
                        <p className="text-slate-500 text-sm">Keep logs of your account activity</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.dataRetention.retainActivityLogs}
                        onChange={(e) => updateSetting('dataRetention', 'retainActivityLogs', e.target.checked)}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                    </label>
                    
                    {formData.dataRetention.retainActivityLogs && (
                      <SmartFormSelect
                        label="Activity log retention period"
                        name="activityLogRetentionDays"
                        value={formData.dataRetention.activityLogRetentionDays.toString()}
                        onChange={(value) => updateSetting('dataRetention', 'activityLogRetentionDays', parseInt(value))}
                        options={RETENTION_OPTIONS}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Data Sharing */}
            {activeSection === 'sharing' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Data Sharing</h2>
                <p className="text-slate-600 mb-6">Control how your data is shared and used</p>

                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Allow analytics</span>
                      <p className="text-slate-500 text-sm">Help us improve our service with usage analytics</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.dataSharing.allowAnalytics}
                      onChange={(e) => updateSetting('dataSharing', 'allowAnalytics', e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Allow marketing communications</span>
                      <p className="text-slate-500 text-sm">Receive personalized offers and updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.dataSharing.allowMarketing}
                      onChange={(e) => updateSetting('dataSharing', 'allowMarketing', e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Allow third-party integrations</span>
                      <p className="text-slate-500 text-sm">Enable integrations with external services</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.dataSharing.allowThirdPartyIntegrations}
                      onChange={(e) => updateSetting('dataSharing', 'allowThirdPartyIntegrations', e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Share anonymized data</span>
                      <p className="text-slate-500 text-sm">Contribute to research with anonymized data</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.dataSharing.shareAnonymizedData}
                      onChange={(e) => updateSetting('dataSharing', 'shareAnonymizedData', e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Security Settings</h2>
                <p className="text-slate-600 mb-6">Configure security and access controls</p>

                <div className="space-y-6">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Require two-factor authentication</span>
                      <p className="text-slate-500 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.security.requireTwoFactor}
                      onChange={(e) => updateSetting('security', 'requireTwoFactor', e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                  </label>

                  <SmartFormSelect
                    label="Session timeout"
                    name="sessionTimeout"
                    value={formData.security.sessionTimeout.toString()}
                    onChange={(value) => updateSetting('security', 'sessionTimeout', parseInt(value))}
                    options={SESSION_TIMEOUT_OPTIONS}
                    helperText="Automatically log out after this period of inactivity"
                  />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Allow multiple sessions</span>
                      <p className="text-slate-500 text-sm">Stay logged in on multiple devices simultaneously</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.security.allowMultipleSessions}
                      onChange={(e) => updateSetting('security', 'allowMultipleSessions', e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Log security events</span>
                      <p className="text-slate-500 text-sm">Keep a record of login attempts and security events</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.security.logSecurityEvents}
                      onChange={(e) => updateSetting('security', 'logSecurityEvents', e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Communications */}
            {activeSection === 'communications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Communication Preferences</h2>
                <p className="text-slate-600 mb-6">Choose what notifications you want to receive</p>

                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Security alerts</span>
                      <p className="text-slate-500 text-sm">Get notified about suspicious account activity</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.communications.securityAlerts}
                      onChange={(e) => updateSetting('communications', 'securityAlerts', e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Privacy policy updates</span>
                      <p className="text-slate-500 text-sm">Be informed when our privacy policy changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.communications.privacyUpdates}
                      onChange={(e) => updateSetting('communications', 'privacyUpdates', e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Data processing notifications</span>
                      <p className="text-slate-500 text-sm">Get updates about how your data is being processed</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.communications.dataProcessingNotifications}
                      onChange={(e) => updateSetting('communications', 'dataProcessingNotifications', e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-slate-700 font-medium">Data breach notifications</span>
                      <p className="text-slate-500 text-sm">Be immediately notified of any data breaches</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.communications.breachNotifications}
                      onChange={(e) => updateSetting('communications', 'breachNotifications', e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                  </label>
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

          {/* Data Management Actions */}
          <div className="mt-8 liquid-glass-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Data Management</h3>
              <button
                onClick={() => setShowDangerZone(!showDangerZone)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-700 transition-colors"
              >
                {showDangerZone ? <EyeOff size={16} /> : <Eye size={16} />}
                {showDangerZone ? 'Hide' : 'Show'} danger zone
              </button>
            </div>

            <div className="space-y-4">
              {/* Export Data */}
              {onExportData && (
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">Export your data</h4>
                    <p className="text-slate-600 text-sm">Download a copy of all your personal data</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="liquid-glass-button flex items-center gap-2 py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Export Data
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Delete Account */}
              {showDangerZone && onDeleteAccount && (
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">Delete your account</h4>
                      <p className="text-red-700 text-sm">Permanently delete your account and all associated data</p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeletingAccount ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Delete Account
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                    <p className="text-red-800 text-sm font-medium">⚠️ This action cannot be undone</p>
                    <p className="text-red-700 text-sm mt-1">
                      All your data, including forms, drafts, and profile information will be permanently deleted.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}