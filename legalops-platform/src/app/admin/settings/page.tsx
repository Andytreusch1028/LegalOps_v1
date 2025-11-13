/**
 * Admin Settings Page
 * Configure admin dashboard settings and preferences
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Settings, User, Bell, Shield, Database, Mail } from 'lucide-react';

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#1E293B',
          margin: '0 0 8px 0',
        }}>
          Admin Settings
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748B',
          margin: 0,
        }}>
          Configure your admin dashboard preferences and system settings
        </p>
      </div>

      {/* Settings Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile Settings */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              background: '#EEF2FF',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User size={20} style={{ color: '#6366F1' }} />
            </div>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1E293B',
              margin: 0,
            }}>
              Profile Settings
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Email
              </div>
              <div style={{ fontSize: '15px', color: '#1E293B' }}>
                {session.user.email}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Role
              </div>
              <span style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                background: '#EEF2FF',
                color: '#6366F1',
                display: 'inline-block',
              }}>
                {session.user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              background: '#FEF3C7',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bell size={20} style={{ color: '#F59E0B' }} />
            </div>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1E293B',
              margin: 0,
            }}>
              Notification Preferences
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              background: '#F8FAFC',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B', marginBottom: '4px' }}>
                  New Order Notifications
                </div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  Receive email notifications when new orders are placed
                </div>
              </div>
              <span style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                background: '#DCFCE7',
                color: '#16A34A',
              }}>
                Enabled
              </span>
            </div>

            <div style={{
              padding: '16px',
              background: '#F8FAFC',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B', marginBottom: '4px' }}>
                  High-Risk Order Alerts
                </div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  Get notified immediately when high-risk orders are detected
                </div>
              </div>
              <span style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                background: '#DCFCE7',
                color: '#16A34A',
              }}>
                Enabled
              </span>
            </div>

            <div style={{
              padding: '16px',
              background: '#F8FAFC',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B', marginBottom: '4px' }}>
                  Customer Feedback Alerts
                </div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  Receive notifications for negative customer feedback
                </div>
              </div>
              <span style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                background: '#DCFCE7',
                color: '#16A34A',
              }}>
                Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              background: '#FEE2E2',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={20} style={{ color: '#DC2626' }} />
            </div>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1E293B',
              margin: 0,
            }}>
              Security Settings
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              background: '#F8FAFC',
              borderRadius: '8px',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B', marginBottom: '4px' }}>
                Two-Factor Authentication
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
                Add an extra layer of security to your account
              </div>
              <button style={{
                padding: '8px 16px',
                background: '#6366F1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}>
                Enable 2FA
              </button>
            </div>

            <div style={{
              padding: '16px',
              background: '#F8FAFC',
              borderRadius: '8px',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B', marginBottom: '4px' }}>
                Change Password
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
                Update your password regularly for better security
              </div>
              <button style={{
                padding: '8px 16px',
                background: '#6366F1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}>
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              background: '#DCFCE7',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Database size={20} style={{ color: '#16A34A' }} />
            </div>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1E293B',
              margin: 0,
            }}>
              System Information
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Platform Version
              </div>
              <div style={{ fontSize: '15px', color: '#1E293B', fontFamily: 'monospace' }}>
                v1.0.0
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Database Status
              </div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '500',
                background: '#DCFCE7',
                color: '#16A34A',
              }}>
                Connected
              </span>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Environment
              </div>
              <div style={{ fontSize: '15px', color: '#1E293B', fontFamily: 'monospace' }}>
                Development
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Last Backup
              </div>
              <div style={{ fontSize: '15px', color: '#1E293B' }}>
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

