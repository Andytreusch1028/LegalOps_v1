/**
 * Sign Out Page
 * Simple page to sign out the user
 */

import SignOutButton from './SignOutButton';

export default function SignOutPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    }}>
      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        maxWidth: '400px',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1E293B',
          marginBottom: '16px',
        }}>
          Sign Out
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#64748B',
          marginBottom: '32px',
        }}>
          Are you sure you want to sign out?
        </p>
        <SignOutButton />
      </div>
    </div>
  );
}

