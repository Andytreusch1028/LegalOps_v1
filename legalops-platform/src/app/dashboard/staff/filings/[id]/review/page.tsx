/**
 * LegalOps v1 - Staff Filing Review Page
 * 
 * Staff reviews filing and marks changes as substantive or minor
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Change {
  field: string;
  oldValue: string;
  newValue: string;
  changeType: 'SUBSTANTIVE' | 'MINOR';
  reason: string;
}

interface Filing {
  id: string;
  filingType: string;
  filingStatus: string;
  filingData: Record<string, unknown>;
  businessEntity: {
    legalName: string;
    documentNumber: string | null;
  };
}

export default function StaffFilingReviewPage() {
  const params = useParams();
  const router = useRouter();
  const filingId = params?.id as string;

  const [filing, setFiling] = useState<Filing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [changes, setChanges] = useState<Change[]>([]);
  const [overallReason, setOverallReason] = useState('');

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

  const addChange = () => {
    setChanges([
      ...changes,
      {
        field: '',
        oldValue: '',
        newValue: '',
        changeType: 'SUBSTANTIVE',
        reason: ''
      }
    ]);
  };

  const updateChange = (index: number, field: keyof Change, value: string) => {
    const updated = [...changes];
    updated[index] = { ...updated[index], [field]: value };
    setChanges(updated);
  };

  const removeChange = (index: number) => {
    setChanges(changes.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validate
    if (changes.length === 0) {
      alert('Please add at least one change.');
      return;
    }

    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      if (!change.field || !change.oldValue || !change.newValue || !change.reason) {
        alert(`Please fill in all fields for change ${i + 1}.`);
        return;
      }
    }

    if (!overallReason.trim()) {
      alert('Please provide an overall reason for the changes.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/staff/filings/${filingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes: changes.map(c => ({
            ...c,
            changedBy: 'Staff User', // TODO: Get from session
            changedAt: new Date().toISOString()
          })),
          overallReason
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.requiresApproval) {
          alert('✅ Review submitted! Customer approval notice created.');
        } else {
          alert('✅ Review submitted! Filing marked as ready to file (minor changes only).');
        }
        router.push('/dashboard/staff/filings');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
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
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading filing...</p>
      </div>
    );
  }

  if (!filing) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>Filing not found</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/dashboard/staff/filings"
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
          Back to Filings
        </Link>

        <h1 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px' }}>
          Review Filing
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b' }}>
          Document changes and mark them as substantive or minor
        </p>
      </div>

      {/* Filing Info */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Filing Type</p>
            <p className="font-semibold" style={{ fontSize: '16px', color: '#0f172a' }}>
              {filing.filingType.replace(/_/g, ' ')}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Business</p>
            <p className="font-semibold" style={{ fontSize: '16px', color: '#0f172a' }}>
              {filing.businessEntity.legalName}
            </p>
          </div>
        </div>
      </div>

      {/* Changes */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a' }}>
            Changes Made ({changes.length})
          </h2>
          <button
            onClick={addChange}
            style={{
              background: '#0ea5e9',
              color: 'white',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0284c7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0ea5e9';
            }}
          >
            + Add Change
          </button>
        </div>

        {changes.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>No changes added yet</p>
            <button
              onClick={addChange}
              style={{
                background: '#0ea5e9',
                color: 'white',
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Add First Change
            </button>
          </div>
        )}

        {changes.map((change, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              border: change.changeType === 'SUBSTANTIVE' ? '2px solid #fbbf24' : '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-semibold" style={{ fontSize: '16px', color: '#0f172a' }}>
                Change {index + 1}
              </h3>
              <button
                onClick={() => removeChange(index)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                Remove
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Field Name */}
              <div>
                <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', display: 'block', fontWeight: '500' }}>
                  Field Name
                </label>
                <input
                  type="text"
                  value={change.field}
                  onChange={(e) => updateChange(index, 'field', e.target.value)}
                  placeholder="e.g., registeredAgent.firstName"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Old/New Values */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', display: 'block', fontWeight: '500' }}>
                    Original Value
                  </label>
                  <input
                    type="text"
                    value={change.oldValue}
                    onChange={(e) => updateChange(index, 'oldValue', e.target.value)}
                    placeholder="Original value"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                      background: '#fef2f2'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', display: 'block', fontWeight: '500' }}>
                    Corrected Value
                  </label>
                  <input
                    type="text"
                    value={change.newValue}
                    onChange={(e) => updateChange(index, 'newValue', e.target.value)}
                    placeholder="Corrected value"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                      background: '#f0fdf4'
                    }}
                  />
                </div>
              </div>

              {/* Change Type */}
              <div>
                <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', display: 'block', fontWeight: '500' }}>
                  Change Type
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={`changeType-${index}`}
                      value="SUBSTANTIVE"
                      checked={change.changeType === 'SUBSTANTIVE'}
                      onChange={(e) => updateChange(index, 'changeType', e.target.value)}
                    />
                    <span style={{ fontSize: '14px', color: '#0f172a' }}>
                      ⚠️ Substantive (requires customer approval)
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={`changeType-${index}`}
                      value="MINOR"
                      checked={change.changeType === 'MINOR'}
                      onChange={(e) => updateChange(index, 'changeType', e.target.value)}
                    />
                    <span style={{ fontSize: '14px', color: '#0f172a' }}>
                      ✓ Minor (typo/formatting)
                    </span>
                  </label>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', display: 'block', fontWeight: '500' }}>
                  Reason for Change
                </label>
                <textarea
                  value={change.reason}
                  onChange={(e) => updateChange(index, 'reason', e.target.value)}
                  placeholder="Explain why this change was made..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Reason */}
      {changes.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <label style={{ fontSize: '14px', color: '#0f172a', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
            Overall Summary (shown to customer)
          </label>
          <textarea
            value={overallReason}
            onChange={(e) => setOverallReason(e.target.value)}
            placeholder="Provide a summary of all changes made to this filing..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      )}

      {/* Submit */}
      {changes.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: '32px'
        }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '500',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
              transition: 'all 0.2s',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.background = '#059669';
            }}
            onMouseLeave={(e) => {
              if (!submitting) e.currentTarget.style.background = '#10b981';
            }}
          >
            {submitting ? 'Submitting Review...' : '✅ Submit Review'}
          </button>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '12px', textAlign: 'center' }}>
            {changes.some(c => c.changeType === 'SUBSTANTIVE')
              ? '⚠️ Customer approval will be required before filing'
              : '✓ Filing will be marked as ready to file (minor changes only)'
            }
          </p>
        </div>
      )}
    </div>
  );
}

