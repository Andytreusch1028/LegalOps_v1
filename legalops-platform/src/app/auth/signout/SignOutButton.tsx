/**
 * Sign Out Button Component
 * Client component to handle sign out
 */

'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <button
      onClick={handleSignOut}
      style={{
        width: '100%',
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.4)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      Sign Out
    </button>
  );
}

