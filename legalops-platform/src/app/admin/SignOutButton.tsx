/**
 * Admin Sign Out Button Component
 * Client component for interactive sign out button
 */

'use client';

import Link from 'next/link';

export default function SignOutButton() {
  return (
    <Link
      href="/auth/signout"
      style={{
        display: 'block',
        padding: '12px 24px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        color: 'white',
        textDecoration: 'none',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      Sign Out
    </Link>
  );
}

