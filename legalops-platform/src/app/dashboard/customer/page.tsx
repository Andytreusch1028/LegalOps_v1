/**
 * LegalOps v1 - Individual Customer Dashboard
 * 
 * Dashboard for individual customers managing their own businesses.
 * Shows: My Businesses, Quick Stats, Popular Services, Recent Activity
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BusinessEntity {
  id: string;
  legalName: string;
  documentNumber: string | null;
  entityType: string;
  status: string;
  filingDate: Date | null;
}

export default function CustomerDashboard() {
  const [businesses, setBusinesses] = useState<BusinessEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's businesses
    fetch('/api/filings/annual-report')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBusinesses(data.entities || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching businesses:', err);
        setLoading(false);
      });
  }, []);

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
        <p style={{ color: '#6b7280' }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="font-semibold" style={{ fontSize: '36px', color: '#0f172a', marginBottom: '12px' }}>
          Welcome back! 👋
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b' }}>
          Here's what's happening with your legal operations today.
        </p>
      </div>

      {/* MY BUSINESSES - Primary Section */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="font-semibold" style={{ fontSize: '24px', color: '#0f172a' }}>
            My Businesses ({businesses.length})
          </h2>
          <Link
            href="/dashboard/services/llc-formation"
            style={{
              background: '#0ea5e9',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            + Add New Business
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div
            className="bg-white rounded-xl"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg style={{ width: '32px', height: '32px', color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a', marginBottom: '0.5rem' }}>
              No businesses yet
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '1.5rem' }}>
              Get started by forming your first LLC or Corporation
            </p>
            <Link
              href="/dashboard/services/llc-formation"
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
              Form Your First Business
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px' }}>
            {businesses.map((business) => (
              <div
                key={business.id}
                className="bg-white rounded-xl"
                style={{
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e2e8f0',
                  borderTop: '4px solid #0ea5e9',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)';
                }}
              >
                {/* Business Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#dbeafe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <svg style={{ width: '24px', height: '24px', color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                {/* Business Name */}
                <h3 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>
                  {business.legalName}
                </h3>

                {/* Status Badge */}
                <div style={{ marginBottom: '12px' }}>
                  <span style={{
                    background: business.status === 'ACTIVE' ? '#d1fae5' : '#fef3c7',
                    color: business.status === 'ACTIVE' ? '#059669' : '#d97706',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {business.status === 'ACTIVE' ? '✅ Active' : '⏳ Pending'}
                  </span>
                </div>

                {/* Business Details */}
                <div style={{ marginBottom: '16px', fontSize: '13px', color: '#64748b' }}>
                  <p style={{ marginBottom: '4px' }}>
                    <strong>Type:</strong> Florida {business.entityType}
                  </p>
                  {business.documentNumber && (
                    <p style={{ marginBottom: '4px' }}>
                      <strong>Doc #:</strong> {business.documentNumber}
                    </p>
                  )}
                  {business.filingDate && (
                    <p>
                      <strong>Formed:</strong> {new Date(business.filingDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    href={`/dashboard/businesses/${business.id}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#0f172a',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#0ea5e9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    View
                  </Link>
                  <Link
                    href="/dashboard/filings/annual-report"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px',
                      background: '#0ea5e9',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: 'white',
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
                    File Report
                  </Link>
                </div>
              </div>
            ))}

            {/* Add New Business Card */}
            <Link
              href="/dashboard/services/llc-formation"
              className="bg-white rounded-xl"
              style={{
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
                border: '2px dashed #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '280px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0ea5e9';
                e.currentTarget.style.background = '#f0f9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = 'white';
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>
                Add New Business
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
                Form LLC, Corporation,<br />or Nonprofit
              </p>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '24px', marginBottom: '48px' }}>
        <div
          className="bg-white rounded-xl"
          style={{
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #0ea5e9'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Active Businesses</p>
              <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>{businesses.filter(b => b.status === 'ACTIVE').length}</p>
            </div>
            <div
              className="flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#dbeafe'
              }}
            >
              <svg style={{ width: '28px', height: '28px', color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-xl"
          style={{
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #10b981'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Pending Orders</p>
              <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>0</p>
            </div>
            <div
              className="flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#d1fae5'
              }}
            >
              <svg style={{ width: '28px', height: '28px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-xl"
          style={{
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #8b5cf6'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Documents</p>
              <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>0</p>
            </div>
            <div
              className="flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ede9fe'
              }}
            >
              <svg style={{ width: '28px', height: '28px', color: '#7c3aed' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-xl"
          style={{
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #f59e0b'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Pending Tasks</p>
              <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>0</p>
            </div>
            <div
              className="flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fef3c7'
              }}
            >
              <svg style={{ width: '28px', height: '28px', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

