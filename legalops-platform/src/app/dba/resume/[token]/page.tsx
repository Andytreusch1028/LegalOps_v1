/**
 * LegalOps v1 - DBA Resume Page
 * 
 * Landing page for magic link - loads saved DBA draft and redirects to wizard
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DBAResumePageProps {
  params: {
    token: string;
  };
}

export default function DBAResumePage({ params }: DBAResumePageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('Loading your saved DBA registration...');

  useEffect(() => {
    async function loadDraft() {
      try {
        const response = await fetch(`/api/dba/get-draft/${params.token}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 410) {
            setStatus('expired');
            setMessage('This link has expired. Please start a new DBA registration.');
          } else {
            setStatus('error');
            setMessage(data.error || 'Failed to load your saved registration.');
          }
          return;
        }

        // Success! Store form data in sessionStorage and redirect
        sessionStorage.setItem('dba_draft_data', JSON.stringify(data.formData));
        sessionStorage.setItem('dba_draft_email', data.email);
        
        setStatus('success');
        setMessage('Success! Redirecting to your DBA registration...');

        // Redirect to DBA service page after 1.5 seconds
        setTimeout(() => {
          router.push('/services/fictitious-name-registration?resume=true');
        }, 1500);

      } catch (error) {
        console.error('Error loading draft:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    }

    loadDraft();
  }, [params.token, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '48px 40px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#0EA5E9',
          marginBottom: '32px',
        }}>
          LegalOps
        </div>

        {/* Status Icon */}
        <div style={{ marginBottom: '24px' }}>
          {status === 'loading' && (
            <Loader2 size={64} className="text-sky-500 animate-spin" style={{ margin: '0 auto' }} />
          )}
          {status === 'success' && (
            <CheckCircle size={64} className="text-green-500" style={{ margin: '0 auto' }} />
          )}
          {status === 'error' && (
            <XCircle size={64} className="text-red-500" style={{ margin: '0 auto' }} />
          )}
          {status === 'expired' && (
            <Clock size={64} className="text-amber-500" style={{ margin: '0 auto' }} />
          )}
        </div>

        {/* Message */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '16px',
          lineHeight: '1.3',
        }}>
          {status === 'loading' && 'Loading Your Registration'}
          {status === 'success' && 'Welcome Back!'}
          {status === 'error' && 'Oops! Something Went Wrong'}
          {status === 'expired' && 'Link Expired'}
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          lineHeight: '1.6',
          marginBottom: '32px',
        }}>
          {message}
        </p>

        {/* Action Buttons */}
        {status === 'error' || status === 'expired' ? (
          <button
            onClick={() => router.push('/services/fictitious-name-registration')}
            style={{
              background: '#0EA5E9',
              color: '#FFFFFF',
              padding: '14px 32px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0284C7'}
            onMouseOut={(e) => e.currentTarget.style.background = '#0EA5E9'}
          >
            Start New DBA Registration
          </button>
        ) : null}

        {/* Help Text */}
        {(status === 'error' || status === 'expired') && (
          <p style={{
            fontSize: '14px',
            color: '#9CA3AF',
            marginTop: '24px',
            lineHeight: '1.6',
          }}>
            Need help? Contact us at{' '}
            <a href="mailto:support@legalops.com" style={{ color: '#0EA5E9', textDecoration: 'none' }}>
              support@legalops.com
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

