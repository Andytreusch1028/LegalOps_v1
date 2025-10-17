/**
 * Staff Filing Review Dashboard
 * 
 * Shows pending filings that need review before submission
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface FilingSubmission {
  id: string;
  orderId: string;
  filingType: string;
  status: string;
  agentConfidence: number;
  formScreenshot: string;
  createdAt: string;
  order: {
    orderNumber: string;
    businessName: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function StaffFilingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filings, setFilings] = useState<FilingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiling, setSelectedFiling] = useState<FilingSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check if user is staff
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Load pending filings
  useEffect(() => {
    loadFilings();
  }, []);

  const loadFilings = async () => {
    try {
      const response = await fetch('/api/filing/pending');
      if (response.ok) {
        const data = await response.json();
        setFilings(data.filings);
      }
    } catch (error) {
      console.error('Error loading filings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/filing/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          approved: true,
          notes: reviewNotes,
        }),
      });

      if (response.ok) {
        alert('Filing approved and submitted!');
        setSelectedFiling(null);
        setReviewNotes('');
        loadFilings();
      } else {
        alert('Error approving filing');
      }
    } catch (error) {
      console.error('Error approving filing:', error);
      alert('Error approving filing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!confirm('Are you sure you want to reject this filing?')) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/filing/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          approved: false,
          notes: reviewNotes,
        }),
      });

      if (response.ok) {
        alert('Filing rejected');
        setSelectedFiling(null);
        setReviewNotes('');
        loadFilings();
      } else {
        alert('Error rejecting filing');
      }
    } catch (error) {
      console.error('Error rejecting filing:', error);
      alert('Error rejecting filing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>Loading filings...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      padding: '48px 96px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: '700', 
          color: '#1e293b',
          marginBottom: '12px'
        }}>
          📋 Filing Review Dashboard
        </h1>
        <p style={{ fontSize: '18px', color: '#64748b' }}>
          Review AI-filled forms before submission to Sunbiz
        </p>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '24px',
        marginBottom: '48px'
      }}>
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            Pending Review
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#0ea5e9' }}>
            {filings.filter(f => f.status === 'FORM_FILLED').length}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            Avg Confidence
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#10b981' }}>
            {filings.length > 0
              ? Math.round(filings.reduce((sum, f) => sum + (f.agentConfidence || 0), 0) / filings.length * 100)
              : 0}%
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            Total Today
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#8b5cf6' }}>
            {filings.length}
          </div>
        </div>
      </div>

      {/* Filings List */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '32px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>
            Pending Filings
          </h2>
        </div>

        {filings.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: '#64748b' }}>
              No pending filings to review
            </p>
          </div>
        ) : (
          <div>
            {filings.map((filing) => (
              <div
                key={filing.id}
                style={{
                  padding: '24px 32px',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                onClick={() => setSelectedFiling(filing)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                      {filing.order.businessName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      Order #{filing.order.orderNumber} • {filing.filingType.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                      Customer: {filing.order.user.name || filing.order.user.email}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: filing.agentConfidence >= 0.9 ? '#d1fae5' : '#fef3c7',
                      color: filing.agentConfidence >= 0.9 ? '#065f46' : '#92400e',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      {Math.round(filing.agentConfidence * 100)}% Confidence
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(filing.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedFiling && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '48px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '32px', 
              borderBottom: '1px solid #e2e8f0',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                    Review Filing: {selectedFiling.order.businessName}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>
                    Order #{selectedFiling.order.orderNumber} • AI Confidence: {Math.round(selectedFiling.agentConfidence * 100)}%
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFiling(null)}
                  style={{
                    padding: '12px 24px',
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#475569'
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Screenshot */}
            <div style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
                Filled Form Preview
              </h3>
              <div style={{ 
                border: '2px solid #e2e8f0', 
                borderRadius: '8px', 
                overflow: 'hidden',
                marginBottom: '32px'
              }}>
                <img 
                  src={selectedFiling.formScreenshot} 
                  alt="Form screenshot"
                  style={{ width: '100%', display: 'block' }}
                />
              </div>

              {/* Review Notes */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  marginBottom: '12px'
                }}>
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this filing..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={() => handleApprove(selectedFiling.id)}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {submitting ? 'Processing...' : '✅ Approve & Submit'}
                </button>

                <button
                  onClick={() => handleReject(selectedFiling.id)}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                    boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  {submitting ? 'Processing...' : '❌ Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

