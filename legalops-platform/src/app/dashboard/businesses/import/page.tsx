'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ImportBusinessPage() {
  const router = useRouter();
  const [documentNumber, setDocumentNumber] = useState('');
  const [entityName, setEntityName] = useState('');
  const [searchType, setSearchType] = useState<'DOCUMENT_NUMBER' | 'ENTITY_NAME'>('DOCUMENT_NUMBER');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f9fafb, #e5e7eb)'
    }}>
      <div style={{ padding: '32px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => router.back()}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>

          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#0f172a', textAlign: 'center' }}>
            Import Your Business from Sunbiz
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.125rem', lineHeight: '1.6', textAlign: 'center' }}>
            Search for your existing Florida business and import it to your account
          </p>
        </div>

        {/* Search Type Selector */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
            Search By
          </label>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => setSearchType('DOCUMENT_NUMBER')}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '8px',
                border: searchType === 'DOCUMENT_NUMBER' ? '2px solid #0ea5e9' : '2px solid #e5e7eb',
                background: searchType === 'DOCUMENT_NUMBER' ? '#eff6ff' : 'white',
                color: searchType === 'DOCUMENT_NUMBER' ? '#0ea5e9' : '#64748b',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Document Number
            </button>
            <button
              onClick={() => setSearchType('ENTITY_NAME')}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '8px',
                border: searchType === 'ENTITY_NAME' ? '2px solid #0ea5e9' : '2px solid #e5e7eb',
                background: searchType === 'ENTITY_NAME' ? '#eff6ff' : 'white',
                color: searchType === 'ENTITY_NAME' ? '#0ea5e9' : '#64748b',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Business Name
            </button>
          </div>

          {/* Search Input */}
          {searchType === 'DOCUMENT_NUMBER' ? (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                Document Number
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g., L12000012345"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              />
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                Your Document Number is a unique identifier (e.g., L12000012345 for LLCs, P12000012345 for Corporations)
              </p>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                Business Name
              </label>
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="e.g., Acme LLC"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              />
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                Enter your business name exactly as it appears on Sunbiz
              </p>
            </div>
          )}

          {/* Search Button */}
          <button
            disabled
            style={{
              width: '100%',
              marginTop: '1.5rem',
              padding: '12px 24px',
              background: '#9ca3af',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'not-allowed'
            }}
          >
            Search Sunbiz (Coming Soon)
          </button>
        </div>

        {/* Coming Soon Notice */}
        <div style={{
          background: '#fef3c7',
          border: '2px solid #fbbf24',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{
              width: '24px',
              height: '24px',
              flexShrink: 0
            }}>
              <svg style={{ width: '24px', height: '24px', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#78350f', marginBottom: '0.5rem' }}>
                Feature Coming in Month 3-4
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#92400e', lineHeight: '1.6', marginBottom: '1rem' }}>
                Automatic Sunbiz integration is planned for Month 3-4 of our development roadmap. This feature will allow you to:
              </p>
              <ul style={{ fontSize: '0.9375rem', color: '#92400e', lineHeight: '1.8', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Search for your business by Document Number or Name</li>
                <li>Automatically import all business details from Sunbiz</li>
                <li>Verify your business status in real-time</li>
                <li>Auto-fill forms with official state records</li>
              </ul>
              <p style={{ fontSize: '0.9375rem', color: '#92400e', lineHeight: '1.6' }}>
                For now, please use the manual workaround below.
              </p>
            </div>
          </div>
        </div>

        {/* Manual Workaround */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0f172a', marginBottom: '1rem' }}>
            Manual Workaround
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Until automatic import is available, you can manually add your business information:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'start',
              gap: '1rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: '#0ea5e9', fontWeight: '700', fontSize: '14px' }}>1</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>
                  Look up your business on Sunbiz.org
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                  Visit the official Florida Sunbiz website to find your business details
                </p>
                <a
                  href="https://search.sunbiz.org/Inquiry/CorporationSearch/ByName"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#0ea5e9',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'none'
                  }}
                >
                  Search Sunbiz.org
                  <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'start',
              gap: '1rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: '#0ea5e9', fontWeight: '700', fontSize: '14px' }}>2</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>
                  File your Annual Report with the information from Sunbiz
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                  Use the Annual Report service and manually enter your business details
                </p>
                <Link
                  href="/services/annual-report"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#0ea5e9',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'none'
                  }}
                >
                  Go to Annual Report Service
                  <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative: Form New Business */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.75rem' }}>
            Don't have a business yet?
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Start a new LLC, Corporation, or other business entity in Florida
          </p>
          <Link
            href="/services?category=FORMATION"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#10b981',
              color: 'white',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#10b981';
            }}
          >
            Browse Formation Services
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}

