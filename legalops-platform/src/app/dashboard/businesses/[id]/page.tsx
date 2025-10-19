/**
 * LegalOps v1 - Business Detail Page
 * 
 * Shows complete information about a specific business entity
 * Includes "View on Sunbiz" link to official Florida records
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
}

interface RegisteredAgent {
  agentType: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: Address;
}

interface ManagerOfficer {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  roleType: string;
  address: string;
}

interface Filing {
  id: string;
  filingType: string;
  status: string;
  createdAt: string;
}

interface Business {
  id: string;
  legalName: string;
  dbaName?: string;
  entityType: string;
  documentNumber?: string;
  feiNumber?: string;
  filingDate?: string;
  status: string;
  purpose?: string;
  principalAddress?: Address;
  mailingAddress?: Address;
  registeredAgent?: RegisteredAgent;
  managersOfficers: ManagerOfficer[];
  filings: Filing[];
  createdAt: string;
}

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) return;

    fetch(`/api/businesses/${businessId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBusiness(data.business);
        } else {
          setError(data.error || 'Failed to load business');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching business:', err);
        setError('Failed to load business details');
        setLoading(false);
      });
  }, [businessId]);

  // Generate Sunbiz URL
  const getSunbizUrl = (documentNumber: string) => {
    // Florida Sunbiz direct document lookup
    return `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResultDetail?inquirytype=DocumentNumber&directionType=Initial&searchNameOrder=${documentNumber}&aggregateId=doml-${documentNumber.toLowerCase()}&searchTerm=${documentNumber}`;
  };

  const getStatusDisplay = (status: string | null | undefined) => {
    const statusMap: { [key: string]: { bg: string; color: string; label: string } } = {
      'DRAFT': { bg: '#f3f4f6', color: '#6b7280', label: 'Draft' },
      'PENDING_PAYMENT': { bg: '#fef3c7', color: '#d97706', label: 'Pending Payment' },
      'PAID': { bg: '#dbeafe', color: '#0284c7', label: 'Paid' },
      'IN_REVIEW': { bg: '#e0e7ff', color: '#6366f1', label: 'In Review' },
      'PENDING_CUSTOMER_APPROVAL': { bg: '#fed7aa', color: '#ea580c', label: 'Approval Required' },
      'APPROVED_BY_CUSTOMER': { bg: '#d1fae5', color: '#059669', label: 'Approved' },
      'READY_TO_FILE': { bg: '#dbeafe', color: '#0284c7', label: 'Ready to File' },
      'SUBMITTED': { bg: '#e0e7ff', color: '#6366f1', label: 'Submitted' },
      'COMPLETED': { bg: '#d1fae5', color: '#059669', label: 'Completed' },
      'REJECTED': { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
      'CANCELLED': { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelled' },
    };

    if (!status) {
      return { bg: '#f3f4f6', color: '#6b7280', label: 'Draft' };
    }

    return statusMap[status] || { bg: '#dbeafe', color: '#0284c7', label: status.replace(/_/g, ' ') };
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
        <p style={{ color: '#6b7280' }}>Loading business details...</p>
      </div>
    );
  }

  if (error || !business) {
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
          {error || 'Business not found'}
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '1.5rem' }}>
          Unable to load business details
        </p>
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

  return (
    <div>
      {/* Header with Back Button */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/dashboard/customer"
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
          Back to Dashboard
        </Link>

        {/* Business Name and Status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a', marginBottom: '12px' }}>
              {business.legalName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{
                background: business.status === 'ACTIVE' ? '#d1fae5' : '#fef3c7',
                color: business.status === 'ACTIVE' ? '#059669' : '#d97706',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                {business.status === 'ACTIVE' ? '✅ Active' : '⏳ Pending'}
              </span>
              <span style={{ fontSize: '14px', color: '#64748b' }}>
                Florida {business.entityType}
              </span>
              {business.documentNumber && (
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                  Doc #: {business.documentNumber}
                </span>
              )}
            </div>
          </div>

          {/* View on Sunbiz Button */}
          {business.documentNumber && (
            <a
              href={getSunbizUrl(business.documentNumber)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                padding: '10px 20px',
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
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            href="/dashboard/filings/annual-report"
            style={{
              background: '#0ea5e9',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            File Annual Report
          </Link>
          <button
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Amend Business
          </button>
          <button
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Change Agent
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '24px' }}>
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Business Information Card */}
          <div
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <h2 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>
              📋 Business Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Document Number</p>
                <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
                  {business.documentNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>FEI/EIN</p>
                <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
                  {business.feiNumber || 'Not provided'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Formation Date</p>
                <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
                  {business.filingDate ? new Date(business.filingDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Entity Type</p>
                <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
                  Florida {business.entityType}
                </p>
              </div>
              {business.dbaName && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>DBA (Doing Business As)</p>
                  <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
                    {business.dbaName}
                  </p>
                </div>
              )}
              {business.purpose && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Business Purpose</p>
                  <p style={{ fontSize: '15px', color: '#0f172a' }}>
                    {business.purpose}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Addresses Card */}
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
            
            {business.principalAddress && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                  Principal Address
                </p>
                <p style={{ fontSize: '15px', color: '#0f172a' }}>
                  {business.principalAddress.street}
                  {business.principalAddress.suite && `, ${business.principalAddress.suite}`}
                  <br />
                  {business.principalAddress.city}, {business.principalAddress.state} {business.principalAddress.zipCode}
                </p>
              </div>
            )}

            {business.mailingAddress && (
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                  Mailing Address
                </p>
                <p style={{ fontSize: '15px', color: '#0f172a' }}>
                  {business.mailingAddress.street}
                  {business.mailingAddress.suite && `, ${business.mailingAddress.suite}`}
                  <br />
                  {business.mailingAddress.city}, {business.mailingAddress.state} {business.mailingAddress.zipCode}
                </p>
              </div>
            )}
          </div>

          {/* Registered Agent Card */}
          {business.registeredAgent && (
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
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
                  {business.registeredAgent.agentType === 'INDIVIDUAL'
                    ? `${business.registeredAgent.firstName} ${business.registeredAgent.lastName}`
                    : business.registeredAgent.companyName}
                </p>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  {business.registeredAgent.agentType === 'INDIVIDUAL' ? 'Individual' : 'Company'}
                </p>
              </div>
              {business.registeredAgent.address && (
                <p style={{ fontSize: '14px', color: '#0f172a', marginBottom: '12px' }}>
                  {business.registeredAgent.address.street}
                  {business.registeredAgent.address.suite && `, ${business.registeredAgent.address.suite}`}
                  <br />
                  {business.registeredAgent.address.city}, {business.registeredAgent.address.state} {business.registeredAgent.address.zipCode}
                </p>
              )}
              {(business.registeredAgent.email || business.registeredAgent.phone) && (
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  {business.registeredAgent.email && <p>Email: {business.registeredAgent.email}</p>}
                  {business.registeredAgent.phone && <p>Phone: {business.registeredAgent.phone}</p>}
                </div>
              )}
            </div>
          )}

          {/* Managers/Officers Card */}
          {business.managersOfficers.length > 0 && (
            <div
              className="bg-white rounded-xl"
              style={{
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0'
              }}
            >
              <h2 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>
                👥 Managers & Officers ({business.managersOfficers.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {business.managersOfficers.map((person) => (
                  <div
                    key={person.id}
                    style={{
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500', marginBottom: '4px' }}>
                      {person.firstName} {person.lastName}
                    </p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
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

        {/* Right Column - Activity */}
        <div>
          {/* Recent Activity Card */}
          <div
            className="bg-white rounded-xl"
            style={{
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <h2 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>
              📊 Recent Activity
            </h2>
            {business.filings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {business.filings.map((filing) => (
                  <Link
                    key={filing.id}
                    href={`/dashboard/filings/${filing.id}`}
                    style={{
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      borderLeft: '3px solid #0ea5e9',
                      textDecoration: 'none',
                      display: 'block',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e0f2fe';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <p style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500', marginBottom: '4px' }}>
                      {filing.filingType.replace(/_/g, ' ')}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(filing.createdAt).toLocaleDateString()}
                    </p>
                    {(() => {
                      const statusInfo = getStatusDisplay(filing.status);
                      return (
                        <span style={{
                          display: 'inline-block',
                          marginTop: '6px',
                          padding: '2px 8px',
                          background: statusInfo.bg,
                          color: statusInfo.color,
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {statusInfo.label}
                        </span>
                      );
                    })()}
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>No activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

