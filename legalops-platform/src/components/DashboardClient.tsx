'use client';

import { useState } from 'react';
import Link from 'next/link';
import ImportantNotices from '@/components/ImportantNotices';
import IncompleteFilings from '@/components/IncompleteFilings';
import DashboardHeroStrip from '@/components/DashboardHeroStrip';

interface BusinessEntity {
  id: string;
  legalName: string;
  documentNumber: string | null;
  entityType: string;
  status: string;
  filingDate: Date | null;
}

interface DashboardStats {
  activeBusinesses: number;
  pendingOrders: number;
  documents: number;
  incompleteFiling: number;
}

interface Activity {
  id: string;
  type: 'order' | 'draft' | 'business';
  action: string;
  description: string;
  subtitle?: string;
  thirdLine?: string;
  metadata?: string;
  timestamp: Date;
}

interface DashboardClientProps {
  businesses: BusinessEntity[];
  stats: DashboardStats;
  recentActivity: Activity[];
  userName: string;
  averageHealthScore: number | null;
  pendingActions: number;
}

export default function DashboardClient({
  businesses,
  stats,
  recentActivity,
  userName,
  averageHealthScore,
  pendingActions
}: DashboardClientProps) {
  // Helper function to format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  // Helper function to get icon and color for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return { icon: '✅', bg: '#d1fae5' }; // Green for completed orders
      case 'draft':
        return { icon: '📝', bg: '#fef3c7' }; // Yellow for drafts
      case 'business':
        return { icon: '🏢', bg: '#dbeafe' }; // Blue for businesses
      default:
        return { icon: '📄', bg: '#f1f5f9' };
    }
  };

  return (
    <div>
      {/* Hero Strip */}
      <DashboardHeroStrip
        userName={userName}
        businessCount={businesses.length}
        pendingActions={pendingActions}
        averageHealthScore={averageHealthScore}
        hasBusinesses={businesses.length > 0}
      />

      {/* IMPORTANT NOTICES */}
      <ImportantNotices />

      {/* INCOMPLETE FILINGS */}
      <IncompleteFilings />

      {/* Quick Stats */}
      <div style={{ marginBottom: '48px' }}>
        <h2 className="font-semibold" style={{ fontSize: '24px', color: '#0f172a', marginBottom: '24px' }}>
          Quick Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '24px' }}>
          {/* Active Businesses */}
          <div
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #0ea5e9'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Active Businesses
                </p>
                <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>
                  {stats.activeBusinesses}
                </p>
              </div>
              <div
                className="flex items-center justify-center"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#dbeafe'
                }}
              >
                <svg style={{ width: '28px', height: '28px', color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #10b981'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Pending Orders
                </p>
                <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>
                  {stats.pendingOrders}
                </p>
              </div>
              <div
                className="flex items-center justify-center"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#d1fae5'
                }}
              >
                <svg style={{ width: '28px', height: '28px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #8b5cf6'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Documents
                </p>
                <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>
                  {stats.documents}
                </p>
              </div>
              <div
                className="flex items-center justify-center"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#ede9fe'
                }}
              >
                <svg style={{ width: '28px', height: '28px', color: '#7c3aed' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Incomplete Filings */}
          <div
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #f59e0b'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Incomplete Filings
                </p>
                <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>
                  {stats.incompleteFiling}
                </p>
              </div>
              <div
                className="flex items-center justify-center"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#fef3c7'
                }}
              >
                <svg style={{ width: '28px', height: '28px', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h2 className="font-semibold" style={{ fontSize: '24px', color: '#0f172a', marginBottom: '24px' }}>
            Recent Activity
          </h2>
          <div
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    paddingBottom: index < recentActivity.length - 1 ? '16px' : '0',
                    borderBottom: index < recentActivity.length - 1 ? '1px solid #e2e8f0' : 'none'
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: getActivityIcon(activity.type).bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0
                    }}
                  >
                    {getActivityIcon(activity.type).icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <p className="font-medium" style={{ fontSize: '14px', color: '#0f172a' }}>
                        {activity.action}
                      </p>
                      {activity.metadata && (
                        <span style={{
                          fontSize: '11px',
                          color: '#64748b',
                          background: '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          {activity.metadata}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500', marginBottom: '2px' }}>
                      {activity.description}
                    </p>
                    {activity.subtitle && (
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>
                        {activity.subtitle}
                      </p>
                    )}
                    {activity.thirdLine && (
                      <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                        {activity.thirdLine}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div style={{ flexShrink: 0 }}>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Popular Services */}
      <div style={{ marginBottom: '48px' }}>
        <h2 className="font-semibold" style={{ fontSize: '24px', color: '#0f172a', marginBottom: '24px' }}>
          Popular Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '20px' }}>
          {/* DBA Registration */}
          <Link
            href="/services/fictitious-name-registration"
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#0ea5e9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: '#fef3c7',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '24px' }}>📄</span>
            </div>
            <div>
              <h3 className="font-semibold" style={{ fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                Register DBA
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Fictitious Name Registration
              </p>
            </div>
          </Link>

          {/* Annual Report */}
          <Link
            href="/dashboard/filings/annual-report"
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#0ea5e9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: '#dbeafe',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '24px' }}>📋</span>
            </div>
            <div>
              <h3 className="font-semibold" style={{ fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                File Annual Report
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Keep your business compliant
              </p>
            </div>
          </Link>

          {/* Form New LLC */}
          <Link
            href="/services/llc-formation"
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#0ea5e9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: '#d1fae5',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '24px' }}>🏢</span>
            </div>
            <div>
              <h3 className="font-semibold" style={{ fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                Form New LLC
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Start a new business
              </p>
            </div>
          </Link>

          {/* Form New Corporation */}
          <Link
            href="/services/corporation-formation"
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#0ea5e9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: '#e0e7ff',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '24px' }}>🏛️</span>
            </div>
            <div>
              <h3 className="font-semibold" style={{ fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                Form New Corporation
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Incorporate your business
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

