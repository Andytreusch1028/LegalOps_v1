/**
 * LegalOps v1 - Important Notices Component
 * 
 * Displays urgent notices and action items at the top of the dashboard
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

export default function ImportantNotices() {
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
        // Remove from UI
        setNotices(notices.filter(n => n.id !== noticeId));
      }
    } catch (error) {
      console.error('Error dismissing notice:', error);
    }
  };

  const dismissAll = async () => {
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
    return null; // Don't show anything while loading
  }

  if (notices.length === 0) {
    return null; // Don't show section if no notices
  }

  // Show max 3 notices on dashboard
  const displayNotices = notices.slice(0, 3);
  const hasMore = notices.length > 3;

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      border: '2px solid #fbbf24',
      marginBottom: '32px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #fef3c7',
        background: '#fffbeb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            🔔
          </div>
          <h2 className="font-semibold" style={{ fontSize: '16px', color: '#0f172a' }}>
            Important Notices ({notices.length})
          </h2>
        </div>

        <Link
          href="/dashboard/notices"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#0ea5e9',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
            transition: 'all 0.2s',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f9ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          View All →
        </Link>
      </div>

      {/* Notices - Compact View */}
      <div style={{ padding: '12px' }}>
        {displayNotices.map((notice) => {
          const styles = getPriorityStyles(notice.priority);

          return (
            <div
              key={notice.id}
              style={{
                background: 'white',
                border: `1px solid ${styles.border}`,
                borderRadius: '8px',
                padding: '12px 16px',
                margin: '8px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
            >
              {/* Icon */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: styles.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0
              }}>
                {styles.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 className="font-semibold" style={{ fontSize: '14px', color: '#0f172a', marginBottom: '2px' }}>
                  {notice.title}
                </h3>

                {notice.filing && (
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                    {notice.filing.businessEntity.legalName}
                  </p>
                )}

                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                  {notice.message.length > 80 ? notice.message.substring(0, 80) + '...' : notice.message}
                </p>
              </div>

              {/* Action Button */}
              {notice.actionUrl && notice.actionLabel && (
                <Link
                  href={notice.actionUrl}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#0ea5e9',
                    color: 'white',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0284c7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0ea5e9';
                  }}
                >
                  {notice.actionLabel}
                  <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          );
        })}

        {hasMore && (
          <div style={{ padding: '8px', textAlign: 'center' }}>
            <Link
              href="/dashboard/notices"
              style={{
                color: '#0ea5e9',
                fontSize: '13px',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#0ea5e9';
              }}
            >
              + {notices.length - 3} more notice{notices.length - 3 > 1 ? 's' : ''}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

