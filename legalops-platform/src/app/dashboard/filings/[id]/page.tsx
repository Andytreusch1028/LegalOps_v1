/**
 * LegalOps v1 - Filing Detail Page
 * 
 * Shows complete filing information with options to:
 * - View on Sunbiz (if applicable)
 * - Save locally as PDF
 * - Print
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Address {
  street: string;
  suite?: string;
  city: string;
  state: string;
  zipCode: string;
  addressType: string;
}

interface RegisteredAgent {
  agentType: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  address?: Address;
}

interface ManagerOfficer {
  firstName: string;
  lastName: string;
  title?: string;
  roleType: string;
  address: string;
}

interface BusinessEntity {
  id: string;
  legalName: string;
  entityType: string;
  documentNumber?: string;
  feiNumber?: string;
  status: string;
  addresses: Address[];
  registeredAgent?: RegisteredAgent;
  managersOfficers: ManagerOfficer[];
}

interface Filing {
  id: string;
  filingType: string;
  status: string;
  filingData: any;
  confirmationNumber?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  businessEntity: BusinessEntity;
}

export default function FilingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const filingId = params.id as string;

  const [filing, setFiling] = useState<Filing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filingId) return;

    fetch(`/api/filings/${filingId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFiling(data.filing);
        } else {
          setError(data.error || 'Failed to load filing');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching filing:', err);
        setError('Failed to load filing details');
        setLoading(false);
      });
  }, [filingId]);

  const handlePrint = () => {
    // TODO: When official PDF is stored, open and print that PDF
    // For now, print the current page
    window.print();
  };

  const handleSaveLocal = () => {
    // TODO: When official PDF is stored in database, download that PDF
    // For now, show a message
    alert('Official document will be available after filing is submitted to Sunbiz and the stamped PDF is stored.');
  };

  const getSunbizUrl = (documentNumber: string) => {
    return `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResultDetail?inquirytype=DocumentNumber&directionType=Initial&searchNameOrder=${documentNumber}&aggregateId=doml-${documentNumber.toLowerCase()}&searchTerm=${documentNumber}`;
  };

  const getStatusDisplay = (status: string | null | undefined) => {
    const statusMap: { [key: string]: { icon: string; label: string; bg: string; color: string } } = {
      'DRAFT': { icon: '📝', label: 'Draft', bg: '#f3f4f6', color: '#6b7280' },
      'PENDING_PAYMENT': { icon: '💳', label: 'Pending Payment', bg: '#fef3c7', color: '#d97706' },
      'PAID': { icon: '✅', label: 'Paid', bg: '#dbeafe', color: '#0284c7' },
      'IN_REVIEW': { icon: '🔍', label: 'In Review', bg: '#e0e7ff', color: '#6366f1' },
      'PENDING_CUSTOMER_APPROVAL': { icon: '⚠️', label: 'Approval Required', bg: '#fed7aa', color: '#ea580c' },
      'APPROVED_BY_CUSTOMER': { icon: '✅', label: 'Approved', bg: '#d1fae5', color: '#059669' },
      'READY_TO_FILE': { icon: '📋', label: 'Ready to File', bg: '#dbeafe', color: '#0284c7' },
      'SUBMITTED': { icon: '📤', label: 'Submitted', bg: '#e0e7ff', color: '#6366f1' },
      'COMPLETED': { icon: '✅', label: 'Completed', bg: '#d1fae5', color: '#059669' },
      'REJECTED': { icon: '❌', label: 'Rejected', bg: '#fee2e2', color: '#dc2626' },
      'CANCELLED': { icon: '🚫', label: 'Cancelled', bg: '#f3f4f6', color: '#6b7280' },
    };

    if (!status) {
      return { icon: '📝', label: 'Draft', bg: '#f3f4f6', color: '#6b7280' };
    }

    return statusMap[status] || { icon: '📝', label: status.replace(/_/g, ' '), bg: '#dbeafe', color: '#0284c7' };
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
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading filing details...</p>
      </div>
    );
  }

  if (error || !filing) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: '#fee2e2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <svg style={{ width: '32px', height: '32px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a', marginBottom: '0.5rem' }}>
          {error || 'Filing not found'}
        </h2>
        <Link
          href="/dashboard/customer"
          style={{
            background: '#0ea5e9',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontWeight: '500',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const principalAddress = filing.businessEntity.addresses.find(a => a.addressType === 'PRINCIPAL');
  const mailingAddress = filing.businessEntity.addresses.find(a => a.addressType === 'MAILING');

  return (
    <div>
      {/* Header - Hidden when printing */}
      <div className="no-print" style={{ marginBottom: '32px' }}>
        <Link
          href={`/dashboard/businesses/${filing.businessEntity.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
            marginBottom: '16px'
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Business Details
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a', marginBottom: '12px' }}>
              {filing.filingType.replace(/_/g, ' ')}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {(() => {
                const statusInfo = getStatusDisplay(filing.status);
                return (
                  <span style={{
                    background: statusInfo.bg,
                    color: statusInfo.color,
                    padding: '6px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                );
              })()}
              <span style={{ fontSize: '14px', color: '#64748b' }}>
                {filing.businessEntity.legalName}
              </span>
              {filing.confirmationNumber && (
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                  Confirmation: {filing.confirmationNumber}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {filing.businessEntity.documentNumber && (
              <a
                href={getSunbizUrl(filing.businessEntity.documentNumber)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0ea5e9';
                  e.currentTarget.style.borderColor = '#0ea5e9';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#0f172a';
                }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Sunbiz
              </a>
            )}
            
            {filing.status === 'COMPLETED' && filing.confirmationNumber && (
              <button
                onClick={handleSaveLocal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#10b981',
                  border: 'none',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981';
                }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Official PDF
              </button>
            )}

            {filing.status === 'COMPLETED' && filing.confirmationNumber && (
              <button
                onClick={handlePrint}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#8b5cf6',
                  border: 'none',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#7c3aed';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#8b5cf6';
                }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Official PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Print Header - Only visible when printing */}
      <div className="print-only" style={{ display: 'none', marginBottom: '32px', paddingBottom: '16px', borderBottom: '2px solid #e2e8f0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>LegalOps Filing Record</h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>Generated on {new Date().toLocaleString()}</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1" style={{ gap: '24px' }}>
        
        {/* Filing Information Card */}
        <div
          className="bg-white rounded-xl"
          style={{
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}
        >
          <h2 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>
            📋 Filing Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Filing Type</p>
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>{filing.filingType.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Status</p>
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>{getStatusDisplay(filing.status).label}</p>
            </div>
            {filing.confirmationNumber && (
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Confirmation Number</p>
                <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>{filing.confirmationNumber}</p>
              </div>
            )}
            {filing.submittedAt && (
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Submitted</p>
                <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
                  {new Date(filing.submittedAt).toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Created</p>
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
                {new Date(filing.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Business Entity Card */}
        <div
          className="bg-white rounded-xl"
          style={{
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}
        >
          <h2 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>
            🏢 Business Entity
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Legal Name</p>
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>{filing.businessEntity.legalName}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Entity Type</p>
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>Florida {filing.businessEntity.entityType}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Document Number</p>
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
                {filing.businessEntity.documentNumber || 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>FEI/EIN</p>
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
                {filing.businessEntity.feiNumber || 'Not provided'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Status</p>
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>{filing.businessEntity.status}</p>
            </div>
          </div>
        </div>

        {/* Addresses */}
        {(principalAddress || mailingAddress) && (
          <div
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <h2 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>
              📍 Addresses
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {principalAddress && (
                <div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                    Principal Address
                  </p>
                  <p style={{ fontSize: '15px', color: '#0f172a' }}>
                    {principalAddress.street}
                    {principalAddress.suite && `, ${principalAddress.suite}`}
                    <br />
                    {principalAddress.city}, {principalAddress.state} {principalAddress.zipCode}
                  </p>
                </div>
              )}
              {mailingAddress && (
                <div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                    Mailing Address
                  </p>
                  <p style={{ fontSize: '15px', color: '#0f172a' }}>
                    {mailingAddress.street}
                    {mailingAddress.suite && `, ${mailingAddress.suite}`}
                    <br />
                    {mailingAddress.city}, {mailingAddress.state} {mailingAddress.zipCode}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Registered Agent */}
        {filing.businessEntity.registeredAgent && (
          <div
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <h2 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>
              👤 Registered Agent
            </h2>
            <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500', marginBottom: '4px' }}>
              {filing.businessEntity.registeredAgent.agentType === 'INDIVIDUAL'
                ? `${filing.businessEntity.registeredAgent.firstName} ${filing.businessEntity.registeredAgent.lastName}`
                : filing.businessEntity.registeredAgent.companyName}
            </p>
            {filing.businessEntity.registeredAgent.address && (
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                {filing.businessEntity.registeredAgent.address.street}
                {filing.businessEntity.registeredAgent.address.suite && `, ${filing.businessEntity.registeredAgent.address.suite}`}
                <br />
                {filing.businessEntity.registeredAgent.address.city}, {filing.businessEntity.registeredAgent.address.state} {filing.businessEntity.registeredAgent.address.zipCode}
              </p>
            )}
          </div>
        )}

        {/* Managers/Officers */}
        {filing.businessEntity.managersOfficers.length > 0 && (
          <div
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <h2 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>
              👥 Managers & Officers ({filing.businessEntity.managersOfficers.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filing.businessEntity.managersOfficers.map((person, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500', marginBottom: '4px' }}>
                    {person.firstName} {person.lastName}
                  </p>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                    {person.title || person.roleType}
                  </p>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    {person.address}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}

