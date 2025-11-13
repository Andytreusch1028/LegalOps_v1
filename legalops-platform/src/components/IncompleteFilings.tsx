'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Clock, Trash2, AlertCircle } from 'lucide-react';

interface FormDraft {
  id: string;
  formType: string;
  displayName: string | null;
  currentStep: number;
  totalSteps: number;
  progress: number;
  emailRemindersEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  daysSinceUpdate: number;
}

const FORM_TYPE_CONFIG: Record<string, { name: string; url: string; icon: string }> = {
  DBA_REGISTRATION: {
    name: 'DBA Registration',
    url: '/services/fictitious-name-registration',
    icon: '📝',
  },
  LLC_FORMATION: {
    name: 'LLC Formation',
    url: '/services/llc-formation',
    icon: '🏢',
  },
  ANNUAL_REPORT: {
    name: 'Annual Report',
    url: '/services/annual-report',
    icon: '📊',
  },
  CORPORATION_FORMATION: {
    name: 'Corporation Formation',
    url: '/services/corporation-formation',
    icon: '🏛️',
  },
};

export default function IncompleteFilings() {
  const [drafts, setDrafts] = useState<FormDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const response = await fetch('/api/form-drafts/list');
      const data = await response.json();

      if (data.success) {
        setDrafts(data.drafts || []);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    setDeleting(draftId);

    try {
      const response = await fetch('/api/form-drafts/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId }),
      });

      if (response.ok) {
        // Remove from list
        setDrafts(prev => prev.filter(d => d.id !== draftId));
      } else {
        alert('Failed to delete draft. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Failed to delete draft. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (drafts.length === 0) {
    return null; // Don't show section if no incomplete filings
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      border: '2px solid #F59E0B',
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '32px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <AlertCircle size={28} className="text-amber-700" />
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>
            Incomplete Filings
          </h2>
          <p style={{ fontSize: '14px', color: '#B45309', marginBottom: '0' }}>
            You have {drafts.length} incomplete filing{drafts.length !== 1 ? 's' : ''} waiting to be completed
          </p>
        </div>
      </div>

      {/* Drafts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {drafts.map((draft) => {
          const config = FORM_TYPE_CONFIG[draft.formType] || {
            name: draft.formType,
            url: '#',
            icon: '📄',
          };

          return (
            <div
              key={draft.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #FCD34D',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all 0.2s',
              }}
            >
              {/* Left: Icon + Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                {/* Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#FEF3C7',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0,
                }}>
                  {config.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
                    {draft.displayName || config.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={14} />
                      Step {draft.currentStep} of {draft.totalSteps}
                    </span>
                    <span style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      {draft.daysSinceUpdate === 0 ? 'Today' :
                       draft.daysSinceUpdate === 1 ? 'Yesterday' :
                       `${draft.daysSinceUpdate} days ago`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: '#F3F4F6',
                    borderRadius: '3px',
                    marginTop: '12px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${draft.progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
                      borderRadius: '3px',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                {/* Resume Button */}
                <Link
                  href={config.url}
                  style={{
                    padding: '10px 20px',
                    background: '#F59E0B',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    display: 'inline-block',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#D97706'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#F59E0B'}
                >
                  Resume Filing
                </Link>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(draft.id)}
                  disabled={deleting === draft.id}
                  style={{
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    color: '#EF4444',
                    cursor: deleting === draft.id ? 'not-allowed' : 'pointer',
                    opacity: deleting === draft.id ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => !deleting && (e.currentTarget.style.background = '#FEE2E2')}
                  onMouseOut={(e) => !deleting && (e.currentTarget.style.background = 'transparent')}
                  title="Delete draft"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <p style={{
        fontSize: '13px',
        color: '#92400E',
        marginTop: '16px',
        marginBottom: '0',
        textAlign: 'center',
      }}>
        💡 Your progress is automatically saved every 30 seconds. You can return anytime to complete your filing.
      </p>
    </div>
  );
}

