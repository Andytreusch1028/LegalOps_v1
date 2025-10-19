/**
 * LegalOps v1 - Notices Badge Component
 * 
 * Shows count of unread notices in navigation
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NoticesBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchNoticeCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchNoticeCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNoticeCount = async () => {
    try {
      const response = await fetch('/api/notices');
      const data = await response.json();
      
      if (data.success) {
        setCount(data.notices.length);
      }
    } catch (error) {
      console.error('Error fetching notice count:', error);
    }
  };

  if (count === 0) {
    return (
      <Link
        href="/dashboard/notices"
        className="font-medium transition-colors duration-200"
        style={{ fontSize: '14px', color: '#64748b' }}
      >
        Notices
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/notices"
      className="font-medium transition-colors duration-200"
      style={{ 
        fontSize: '14px', 
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      Notices
      <span style={{
        background: '#f59e0b',
        color: 'white',
        fontSize: '11px',
        fontWeight: '600',
        padding: '2px 8px',
        borderRadius: '12px',
        minWidth: '20px',
        textAlign: 'center'
      }}>
        {count}
      </span>
    </Link>
  );
}

