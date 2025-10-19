/**
 * LegalOps v1 - User Info Component
 * 
 * Shows personalized user information in navigation
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserInfoProps {
  userName: string;
}

export default function UserInfo({ userName }: UserInfoProps) {
  const [memberSince, setMemberSince] = useState<string>('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/info');
      const data = await response.json();
      
      if (data.success && data.user?.createdAt) {
        const date = new Date(data.user.createdAt);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        setMemberSince(monthYear);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  return (
    <Link href="/dashboard/profile" className="text-right transition-opacity duration-200 hover:opacity-70">
      <p className="font-medium" style={{ fontSize: '14px', color: '#0f172a' }}>
        {userName}
      </p>
      <p style={{ fontSize: '12px', color: '#94a3b8' }}>
        {memberSince ? `Valued Customer Since ${memberSince}` : 'Loading...'}
      </p>
    </Link>
  );
}

