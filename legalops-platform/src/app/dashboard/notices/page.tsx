/**
 * LegalOps v1 - Notices Page
 * 
 * Dedicated page for viewing all important notices
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Notice {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
  filing?: {
    businessEntity: {
      legalName: string;
      documentNumber?: string;
    };
  };
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices');
      const data = await response.json();
      
      if (data.success) {
        setNotices(data.notices);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissNotice = async (noticeId: string) => {
    try {
      const response = await fetch(`/api/notices/${noticeId}/dismiss`, {
        method: 'POST',
      });

      if (response.ok) {
        setNotices(notices.filter(n => n.id !== noticeId));
      }
    } catch (error) {
      console.error('Error dismissing notice:', error);
    }
  };

  const dismissAll = async () => {
    if (!confirm('Are you sure you want to dismiss all notices?')) {
      return;
    }

    try {
      await Promise.all(notices.map(notice => dismissNotice(notice.id)));
    } catch (error) {
      console.error('Error dismissing all notices:', error);
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return {
          bg: '#fef3c7',
          border: '#f59e0b',
          icon: '⚠️',
          iconBg: '#fbbf24'
        };
      case 'ATTENTION':
        return {
          bg: '#dbeafe',
          border: '#3b82f6',
          icon: '📄',
          iconBg: '#60a5fa'
        };
      case 'SUCCESS':
        return {
          bg: '#d1fae5',
          border: '#10b981',
          icon: '✅',
          iconBg: '#34d399'
        };
      default:
        return {
          bg: '#f3f4f6',
          border: '#9ca3af',
          icon: '📋',
          iconBg: '#d1d5db'
        };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
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
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading notices...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h1 className="font-semibold" style={{ fontSize: '36px', color: '#0f172a' }}>
            Important Notices
          </h1>
          {notices.length > 1 && (
            <button
              onClick={dismissAll}
              style={{
                background: 'white',
                border: '2px solid #e2e8f0',
                color: '#64748b',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              Dismiss All
            </button>
          )}
        </div>
        <p style={{ fontSize: '16px', color: '#64748b' }}>
          {notices.length === 0 
            ? 'You have no pending notices. All caught up! 🎉'
            : `You have ${notices.length} pending ${notices.length === 1 ? 'notice' : 'notices'} requiring your attention.`
          }
        </p>
      </div>

      {/* Notices List */}
      {notices.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h2 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>
            All Caught Up!
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            You have no pending notices at this time.
          </p>
          <Link
            href="/dashboard/customer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#0ea5e9',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notices.map((notice) => {
            const styles = getPriorityStyles(notice.priority);
            
            return (
              <div
                key={notice.id}
                style={{
                  background: 'white',
                  border: `2px solid ${styles.border}`,
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s'
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: styles.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0
                }}>
                  {styles.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h3 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '4px' }}>
                    {notice.title}
                  </h3>
                  
                  {notice.filing && (
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                      {notice.filing.businessEntity.legalName}
                      {notice.filing.businessEntity.documentNumber && ` • ${notice.filing.businessEntity.documentNumber}`}
                    </p>
                  )}
                  
                  <p style={{ fontSize: '14px', color: '#475569', marginBottom: '16px', lineHeight: '1.6' }}>
                    {notice.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {notice.actionUrl && notice.actionLabel && (
                      <Link
                        href={notice.actionUrl}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#0ea5e9',
                          color: 'white',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          textDecoration: 'none',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#0284c7';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#0ea5e9';
                        }}
                      >
                        {notice.actionLabel}
                        <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                    
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {getTimeAgo(notice.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => dismissNotice(notice.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.color = '#64748b';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#cbd5e1';
                  }}
                  title="Dismiss"
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

