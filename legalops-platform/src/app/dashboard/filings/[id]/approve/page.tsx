/**
 * LegalOps v1 - Filing Approval Page
 * 
 * Customer reviews and approves staff changes to their filing
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { formatFieldName } from '@/lib/utils/format-field-name';

interface Change {
  field: string;
  oldValue: string;
  newValue: string;
  changeType: 'SUBSTANTIVE' | 'MINOR';
  reason: string;
  changedBy: string;
  changedAt: string;
}

interface Filing {
  id: string;
  filingType: string;
  filingStatus: string;
  staffChanges: Change[];
  staffChangeReason: string;
  businessEntity: {
    legalName: string;
    documentNumber: string | null;
  };
}

export default function FilingApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const filingId = params?.id as string;

  const [filing, setFiling] = useState<Filing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  useEffect(() => {
    if (filingId) {
      fetchFiling();
    }
  }, [filingId]);

  const fetchFiling = async () => {
    try {
      const response = await fetch(`/api/filings/${filingId}`);
      const data = await response.json();

      if (data.success) {
        setFiling(data.filing);
      }
    } catch (error) {
      console.error('Error fetching filing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve these changes? We will proceed with filing to the state.')) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/filings/${filingId}/approve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Changes approved! We will now proceed with your filing.');
        router.push('/dashboard/customer');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error approving filing:', error);
      alert('Failed to approve changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      alert('Please provide details about what you would like us to revise.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/filings/${filingId}/request-revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionNotes }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Revision request submitted. Our team will review and contact you.');
        router.push('/dashboard/customer');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error requesting revision:', error);
      alert('Failed to submit revision request. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading filing details...</p>
      </div>
    );
  }

  if (!filing) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>Filing not found</p>
        <Link href="/dashboard/customer" style={{ color: '#0ea5e9', marginTop: '1rem', display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const changes: Change[] = filing.staffChanges || [];

  // CRITICAL SAFEGUARD: If filing requires approval but has no changes logged, this is a system error
  // Automatically notify staff and show customer a professional holding message
  if (filing.filingStatus === 'PENDING_CUSTOMER_APPROVAL' && changes.length === 0) {
    // Trigger automatic staff notification (fire and forget)
    fetch('/api/internal/alert-staff-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errorType: 'CHANGES_NOT_LOGGED',
        filingId: filing.id,
        businessName: filing.businessEntity.legalName,
        filingType: filing.filingType,
      })
    }).catch(err => console.error('Failed to alert staff:', err));

    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem' }}>
        <div style={{
          background: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h1 className="font-semibold" style={{ fontSize: '24px', color: '#92400e', marginBottom: '16px' }}>
            We're Preparing Your Review
          </h1>
          <p style={{ fontSize: '16px', color: '#78350f', marginBottom: '24px', lineHeight: '1.6' }}>
            Our team is finalizing the details of the changes made to your filing.
            We'll send you a notification as soon as everything is ready for your review.
          </p>
          <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '24px' }}>
            <strong>Business:</strong> {filing.businessEntity.legalName}<br />
            <strong>Filing Type:</strong> {filing.filingType.replace(/_/g, ' ')}<br />
            <strong>Status:</strong> Being prepared for your review
          </p>
          <div style={{
            background: '#fef9c3',
            border: '1px solid #fde047',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <p style={{ fontSize: '14px', color: '#713f12', marginBottom: '8px' }}>
              <strong>What's happening:</strong>
            </p>
            <ul style={{ fontSize: '14px', color: '#78350f', paddingLeft: '20px', margin: 0 }}>
              <li>Our fulfillment team has been automatically notified</li>
              <li>They're documenting the specific changes made</li>
              <li>You'll receive a notification when ready (usually within 1 hour)</li>
            </ul>
          </div>
          <Link
            href="/dashboard/customer"
            style={{
              background: '#f59e0b',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-block'
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/dashboard/customer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748b',
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '16px'
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '2px solid #fbbf24'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ⚠️
            </div>
            <div>
              <h1 className="font-semibold" style={{ fontSize: '24px', color: '#0f172a', marginBottom: '4px' }}>
                APPROVAL REQUIRED
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Please review the changes made by our team
              </p>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            borderRadius: '8px',
            padding: '16px',
            borderLeft: '3px solid #0ea5e9'
          }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Filing</p>
            <p className="font-semibold" style={{ fontSize: '16px', color: '#0f172a', marginBottom: '8px' }}>
              {filing.filingType.replace(/_/g, ' ')}
            </p>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Business</p>
            <p className="font-semibold" style={{ fontSize: '16px', color: '#0f172a' }}>
              {filing.businessEntity.legalName}
              {filing.businessEntity.documentNumber && ` • ${filing.businessEntity.documentNumber}`}
            </p>
          </div>
        </div>
      </div>

      {/* Changes List */}
      <div style={{ marginBottom: '32px' }}>
        <h2 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a', marginBottom: '16px' }}>
          📝 Changes Made by Our Team
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
          Our fulfillment team reviewed your filing and made the following corrections. Please review and approve:
        </p>

        {/* NOTE: This should NEVER render due to safeguard above that redirects to holding page */}
        {changes.length === 0 && (
          <div style={{
            background: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#92400e', fontWeight: '600', marginBottom: '8px' }}>
              ⏳ Changes Being Documented
            </p>
            <p style={{ color: '#78350f', fontSize: '14px' }}>
              Our team is finalizing the change documentation. You'll be notified when ready.
            </p>
          </div>
        )}

        {changes.map((change, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              marginBottom: '16px',
              border: change.changeType === 'SUBSTANTIVE' ? '2px solid #fbbf24' : '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 className="font-semibold" style={{ fontSize: '16px', color: '#0f172a' }}>
                Change {index + 1} of {changes.length}
              </h3>
              <span style={{
                background: change.changeType === 'SUBSTANTIVE' ? '#fef3c7' : '#f1f5f9',
                color: change.changeType === 'SUBSTANTIVE' ? '#d97706' : '#64748b',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {change.changeType === 'SUBSTANTIVE' ? '⚠️ Requires Approval' : '✓ Minor Change'}
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>Field:</p>
              <p style={{ fontSize: '14px', color: '#0f172a' }}>{formatFieldName(change.field)}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>Original:</p>
                <div style={{
                  background: '#fee2e2',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #fecaca'
                }}>
                  <p style={{ fontSize: '14px', color: '#991b1b', fontFamily: 'monospace' }}>{change.oldValue}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>Corrected:</p>
                <div style={{
                  background: '#d1fae5',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #a7f3d0'
                }}>
                  <p style={{ fontSize: '14px', color: '#065f46', fontFamily: 'monospace' }}>{change.newValue}</p>
                </div>
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '12px'
            }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>Reason:</p>
              <p style={{ fontSize: '14px', color: '#0f172a' }}>{change.reason}</p>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
              <span>Changed by: {change.changedBy}</span>
              <span>•</span>
              <span>{new Date(change.changedAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Section */}
      {!showRevisionForm ? (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: '32px'
        }}>
          <h3 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '12px' }}>
            ✅ Approval
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
            By clicking "Approve Changes" below, you confirm that:
          </p>
          <ul style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>You have reviewed all changes listed above</li>
            <li style={{ marginBottom: '8px' }}>The corrected information is accurate</li>
            <li style={{ marginBottom: '8px' }}>You authorize us to file with the state</li>
          </ul>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleApprove}
              disabled={submitting}
              style={{
                background: '#10b981',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.background = '#059669';
              }}
              onMouseLeave={(e) => {
                if (!submitting) e.currentTarget.style.background = '#10b981';
              }}
            >
              {submitting ? 'Processing...' : '✅ Approve Changes & Proceed'}
            </button>

            <button
              onClick={() => setShowRevisionForm(true)}
              disabled={submitting}
              style={{
                background: 'white',
                color: '#64748b',
                padding: '12px 24px',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              Request Revision
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: '32px'
        }}>
          <h3 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '12px' }}>
            📝 Request Revision
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
            Please describe what you would like us to revise:
          </p>

          <textarea
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="Example: The registered agent name should be 'Jane Smith' not 'John Smith'..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              fontSize: '14px',
              fontFamily: 'inherit',
              marginBottom: '16px',
              resize: 'vertical'
            }}
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleRequestRevision}
              disabled={submitting || !revisionNotes.trim()}
              style={{
                background: '#0ea5e9',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '500',
                cursor: (submitting || !revisionNotes.trim()) ? 'not-allowed' : 'pointer',
                opacity: (submitting || !revisionNotes.trim()) ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Revision Request'}
            </button>

            <button
              onClick={() => {
                setShowRevisionForm(false);
                setRevisionNotes('');
              }}
              disabled={submitting}
              style={{
                background: 'white',
                color: '#64748b',
                padding: '12px 24px',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

