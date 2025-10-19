/**
 * LegalOps v1 - Customer Settings Page
 * 
 * Allows customers to configure their filing preferences
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserSettings {
  autoApproveMinorChanges: boolean;
  autoApproveGrantedAt: string | null;
  autoApproveAcknowledged: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoApprove = () => {
    if (!settings) return;

    // If turning ON, show confirmation dialog
    if (!settings.autoApproveMinorChanges) {
      setShowConfirmDialog(true);
    } else {
      // If turning OFF, just do it
      saveAutoApprove(false);
    }
  };

  const confirmAutoApprove = async () => {
    await saveAutoApprove(true);
    setShowConfirmDialog(false);
  };

  const saveAutoApprove = async (enabled: boolean) => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoApproveMinorChanges: enabled,
          autoApproveAcknowledged: enabled,
        })
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
        alert(enabled 
          ? '✅ Auto-approval enabled! We can now proceed faster with minor corrections.'
          : '✅ Auto-approval disabled. You will review all changes before filing.'
        );
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e5e7eb',
          borderTopColor: '#0ea5e9',
          borderRadius: '50%',
          margin: '0 auto',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>Failed to load settings</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="font-semibold" style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px' }}>
          ⚙️ Settings
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b' }}>
          Manage your filing preferences and account settings
        </p>
      </div>

      {/* Filing Preferences Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        marginBottom: '24px'
      }}>
        <h2 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a', marginBottom: '24px' }}>
          📋 Filing Preferences
        </h2>

        {/* Auto-Approve Toggle */}
        <div style={{
          padding: '24px',
          background: settings.autoApproveMinorChanges ? '#f0fdf4' : '#f8fafc',
          border: settings.autoApproveMinorChanges ? '2px solid #059669' : '2px solid #e2e8f0',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <h3 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>
                🚀 Fast-Track Minor Corrections
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px', lineHeight: '1.6' }}>
                Allow our team to make minor corrections and proceed with filing immediately, without waiting for your approval.
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
                <strong>Status:</strong> {settings.autoApproveMinorChanges ? (
                  <span style={{ color: '#059669' }}>✓ Enabled</span>
                ) : (
                  <span style={{ color: '#64748b' }}>○ Disabled</span>
                )}
                {settings.autoApproveGrantedAt && (
                  <span> • Enabled on {new Date(settings.autoApproveGrantedAt).toLocaleDateString()}</span>
                )}
              </p>
            </div>
            <button
              onClick={handleToggleAutoApprove}
              disabled={saving}
              style={{
                background: settings.autoApproveMinorChanges ? '#059669' : '#64748b',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                opacity: saving ? 0.6 : 1,
                marginLeft: '16px'
              }}
            >
              {saving ? 'Saving...' : settings.autoApproveMinorChanges ? 'Disable' : 'Enable'}
            </button>
          </div>

          {/* Examples */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '16px'
          }}>
            <p className="font-semibold" style={{ fontSize: '14px', color: '#0f172a', marginBottom: '12px' }}>
              Examples of minor corrections we can make:
            </p>
            <ul style={{ fontSize: '13px', color: '#64748b', paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
              <li>Fixing obvious typos (e.g., "Jhon" → "John")</li>
              <li>Standardizing address formats (e.g., "St" → "Street")</li>
              <li>Correcting capitalization (e.g., "JOHN DOE" → "John Doe")</li>
              <li>Formatting phone numbers (e.g., "3055551234" → "(305) 555-1234")</li>
              <li>Adding missing punctuation or abbreviations</li>
            </ul>
          </div>

          {/* Benefits & Risks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <p className="font-semibold" style={{ fontSize: '13px', color: '#059669', marginBottom: '8px' }}>
                ✓ Benefits:
              </p>
              <ul style={{ fontSize: '12px', color: '#065f46', paddingLeft: '16px', margin: 0, lineHeight: '1.6' }}>
                <li>Faster filing (no approval delays)</li>
                <li>Reduced back-and-forth</li>
                <li>Same-day processing possible</li>
              </ul>
            </div>
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fde047',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <p className="font-semibold" style={{ fontSize: '13px', color: '#d97706', marginBottom: '8px' }}>
                ⚠️ Important to know:
              </p>
              <ul style={{ fontSize: '12px', color: '#92400e', paddingLeft: '16px', margin: 0, lineHeight: '1.6' }}>
                <li>You won't review minor changes</li>
                <li>Small errors could be missed</li>
                <li>You can disable anytime</li>
              </ul>
            </div>
          </div>

          {/* Note about substantive changes */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '16px'
          }}>
            <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>
              <strong>Note:</strong> Substantive changes (like changing your business name, address, or registered agent) 
              will <strong>always</strong> require your approval, regardless of this setting.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a', marginBottom: '16px' }}>
              ⚡ Enable Fast-Track Processing?
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px', lineHeight: '1.6' }}>
              By enabling this feature, you authorize our team to make minor corrections and proceed with filing 
              immediately, without waiting for your approval.
            </p>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>
              <strong>You acknowledge that:</strong>
            </p>
            <ul style={{ fontSize: '13px', color: '#64748b', paddingLeft: '20px', marginBottom: '24px', lineHeight: '1.8' }}>
              <li>Minor corrections will be made without your review</li>
              <li>This may result in faster processing but could include small errors</li>
              <li>Substantive changes will still require your approval</li>
              <li>You can disable this feature at any time</li>
            </ul>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={saving}
                style={{
                  background: 'white',
                  color: '#64748b',
                  border: '2px solid #e2e8f0',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAutoApprove}
                disabled={saving}
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Enabling...' : 'I Understand, Enable Fast-Track'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

