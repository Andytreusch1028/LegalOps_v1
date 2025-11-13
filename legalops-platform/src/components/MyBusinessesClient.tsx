'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Calendar, FileText, ExternalLink } from 'lucide-react';
import HealthScoreModal from './HealthScoreModal';

interface Address {
  street: string;
  suite?: string | null;
  city: string;
  state: string;
  zipCode: string;
}

interface RegisteredAgent {
  id: string;
  agentType: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
}

interface Filing {
  id: string;
  filingType: string;
  createdAt: Date;
}

interface Business {
  id: string;
  legalName: string;
  dbaName?: string | null;
  entityType: string;
  documentNumber?: string | null;
  feiNumber?: string | null;
  filingDate?: Date | null;
  status: string;
  addresses: Address[];
  registeredAgent?: RegisteredAgent | null;
  filings: Filing[];
  createdAt: Date;
  healthScore?: number | null;
  healthBreakdown?: any;
}

interface MyBusinessesClientProps {
  businesses: Business[];
}

export default function MyBusinessesClient({ businesses }: MyBusinessesClientProps) {
  // Modal state
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate Sunbiz URL
  const getSunbizUrl = (documentNumber: string) => {
    return `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResultDetail?inquirytype=DocumentNumber&directionType=Initial&searchNameOrder=${documentNumber}&aggregateId=doml-${documentNumber.toLowerCase()}&searchTerm=${documentNumber}`;
  };

  // Format entity type for display
  const formatEntityType = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  // Open health score modal
  const openHealthModal = (business: Business) => {
    setSelectedBusiness(business);
    setIsModalOpen(true);
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: { bg: '#d1fae5', color: '#059669', label: '✅ Active' },
      PENDING: { bg: '#fef3c7', color: '#d97706', label: '⏳ Pending' },
      FILED: { bg: '#dbeafe', color: '#0284c7', label: '📋 Filed' },
      INACTIVE: { bg: '#f3f4f6', color: '#6b7280', label: '⏸️ Inactive' },
      DISSOLVED: { bg: '#fee2e2', color: '#dc2626', label: '❌ Dissolved' }
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  // Get health score badge styling
  const getHealthScoreBadge = (score: number | null | undefined) => {
    if (score === null || score === undefined) {
      return { bg: '#f3f4f6', color: '#6b7280', label: 'N/A', ring: '#d1d5db' };
    }

    if (score >= 90) {
      return { bg: '#d1fae5', color: '#059669', label: `${score}`, ring: '#10b981' };
    } else if (score >= 75) {
      return { bg: '#dbeafe', color: '#0284c7', label: `${score}`, ring: '#0ea5e9' };
    } else if (score >= 60) {
      return { bg: '#fef3c7', color: '#d97706', label: `${score}`, ring: '#f59e0b' };
    } else {
      return { bg: '#fee2e2', color: '#dc2626', label: `${score}`, ring: '#ef4444' };
    }
  };

  if (businesses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            background: '#f0f9ff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}
        >
          <Building2 size={40} color="#0ea5e9" />
        </div>
        <h2 className="font-semibold" style={{ fontSize: '24px', color: '#0f172a', marginBottom: '0.5rem' }}>
          No Businesses Yet
        </h2>
        <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '2rem' }}>
          Start your first business formation to see it here
        </p>
        <Link
          href="/services"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: '#0ea5e9',
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0284c7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0ea5e9';
          }}
        >
          Browse Services
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px' }}>
            My Businesses
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b' }}>
            Manage your {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'}
          </p>
        </div>
        <Link
          href="/services"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: '#0ea5e9',
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0284c7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0ea5e9';
          }}
        >
          + Add Business
        </Link>
      </div>

      {/* Business Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        style={{ gap: '24px' }}
      >
        {businesses.map((business) => {
          const statusBadge = getStatusBadge(business.status);
          const healthBadge = getHealthScoreBadge(business.healthScore);
          const principalAddress = business.addresses[0];

          return (
            <div
              key={business.id}
              className="bg-white rounded-xl"
              style={{
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07), 0 20px 30px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Business Icon & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Building2 size={24} color="white" />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Health Score Badge */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (business.healthBreakdown) {
                        openHealthModal(business);
                      }
                    }}
                    disabled={!business.healthBreakdown}
                    style={{
                      width: '56px',
                      height: '56px',
                      background: healthBadge.bg,
                      border: `2px solid ${healthBadge.ring}`,
                      borderRadius: '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: business.healthBreakdown ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      padding: 0
                    }}
                    title={business.healthScore !== null && business.healthScore !== undefined ? `Click to view health score details (${business.healthScore}/100)` : 'Health score not calculated'}
                    onMouseEnter={(e) => {
                      if (business.healthBreakdown) {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${healthBadge.ring}40`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ fontSize: '18px', fontWeight: '700', color: healthBadge.color, lineHeight: '1' }}>
                      {healthBadge.label}
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: '500', color: healthBadge.color, marginTop: '2px' }}>
                      {business.healthScore !== null && business.healthScore !== undefined ? 'HEALTH' : ''}
                    </span>
                  </button>
                  {/* Status Badge */}
                  <span
                    style={{
                      background: statusBadge.bg,
                      color: statusBadge.color,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {statusBadge.label}
                  </span>
                </div>
              </div>

              {/* Business Name */}
              <h3 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '4px' }}>
                {business.legalName}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Florida {formatEntityType(business.entityType)}
              </p>

              {/* Key Info */}
              <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {business.documentNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} color="#64748b" />
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      Doc #: {business.documentNumber}
                    </span>
                  </div>
                )}
                {business.filingDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color="#64748b" />
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      Filed: {new Date(business.filingDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {principalAddress && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <svg style={{ width: '14px', height: '14px', marginTop: '2px', flexShrink: 0 }} fill="none" stroke="#64748b" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                      {principalAddress.city}, {principalAddress.state}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <Link
                  href={`/dashboard/businesses/${business.id}`}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#0ea5e9',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0284c7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0ea5e9';
                  }}
                >
                  View Details
                </Link>
                {business.documentNumber && (
                  <a
                    href={getSunbizUrl(business.documentNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      color: '#64748b',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0ea5e9';
                      e.currentTarget.style.color = '#0ea5e9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.color = '#64748b';
                    }}
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Health Score Modal */}
      {selectedBusiness && selectedBusiness.healthBreakdown && (
        <HealthScoreModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          businessName={selectedBusiness.legalName}
          breakdown={selectedBusiness.healthBreakdown}
        />
      )}
    </div>
  );
}

