"use client";

import Link from "next/link";

/**
 * Landing Page - Jony Ive Design Philosophy
 * Principles: Minimalism, Clarity, Functionality First
 */

export default function Home() {
  return (
    <div
      className="min-h-screen flex items-center justify-center page-enter"
      style={{
        padding: '96px 24px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
      }}
    >
      <div className="w-full" style={{ maxWidth: '1200px' }}>
        {/* Main Card - Professional with generous spacing */}
        <div
          className="bg-white rounded-xl text-center"
          style={{
            padding: '80px 64px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 20px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}
        >

          {/* Logo/Brand Icon */}
          <div className="flex justify-center" style={{ marginBottom: '32px' }}>
            <div
              className="inline-flex items-center justify-center"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.25)'
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
          </div>

          {/* Logo/Title - Professional Typography */}
          <div style={{ marginBottom: '48px' }}>
            <h1 className="font-semibold tracking-tight" style={{ fontSize: '56px', color: '#0f172a', marginBottom: '16px', lineHeight: '1.1' }}>
              LegalOps
            </h1>
            <p style={{ fontSize: '20px', color: '#64748b', fontWeight: '400' }}>
              Streamline your legal operations with confidence
            </p>
          </div>

          {/* Status Indicator - Professional */}
          <div
            className="inline-flex items-center"
            style={{
              gap: '10px',
              background: '#f0fdf4',
              color: '#15803d',
              padding: '12px 20px',
              borderRadius: '10px',
              marginBottom: '64px',
              border: '1px solid #bbf7d0'
            }}
          >
            <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>System Ready</span>
          </div>

          {/* Features - Professional Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '32px', marginBottom: '64px' }}>

            {/* Feature 1 */}
            <div className="group">
              <div
                className="rounded-xl transition-all duration-200"
                style={{
                  background: '#f8fafc',
                  padding: '32px 24px',
                  border: '1px solid #e2e8f0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  className="flex items-center justify-center mx-auto"
                  style={{
                    width: '56px',
                    height: '56px',
                    background: '#dbeafe',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}
                >
                  <svg style={{ width: '28px', height: '28px', color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold" style={{ color: '#0f172a', marginBottom: '12px', fontSize: '16px' }}>User Management</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                  Secure authentication and role-based access control
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div
                className="rounded-xl transition-all duration-200"
                style={{
                  background: '#f8fafc',
                  padding: '32px 24px',
                  border: '1px solid #e2e8f0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  className="flex items-center justify-center mx-auto"
                  style={{
                    width: '56px',
                    height: '56px',
                    background: '#dbeafe',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}
                >
                  <svg style={{ width: '28px', height: '28px', color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-semibold" style={{ color: '#0f172a', marginBottom: '12px', fontSize: '16px' }}>Order Tracking</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                  LLC and corporate formation services management
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div
                className="rounded-xl transition-all duration-200"
                style={{
                  background: '#f8fafc',
                  padding: '32px 24px',
                  border: '1px solid #e2e8f0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  className="flex items-center justify-center mx-auto"
                  style={{
                    width: '56px',
                    height: '56px',
                    background: '#dbeafe',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}
                >
                  <svg style={{ width: '28px', height: '28px', color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold" style={{ color: '#0f172a', marginBottom: '12px', fontSize: '16px' }}>Document Management</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                  Secure storage and processing of legal documents
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons - Professional */}
          <div className="flex flex-col sm:flex-row justify-center" style={{ gap: '16px', marginBottom: '56px' }}>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center font-medium text-white transition-all duration-200"
              style={{
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderRadius: '10px',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
              }}
            >
              Go to Dashboard
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center font-medium transition-all duration-200"
              style={{
                padding: '16px 40px',
                background: '#f1f5f9',
                color: '#0f172a',
                borderRadius: '10px',
                fontSize: '15px',
                border: '1px solid #e2e8f0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
              }}
            >
              Sign In
            </Link>
          </div>

          {/* Tech Stack - Professional */}
          <div style={{ paddingTop: '48px', borderTop: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>
              Built with modern technology
            </p>
            <div className="flex flex-wrap justify-center" style={{ gap: '12px' }}>
              <span style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', color: '#475569', border: '1px solid #e2e8f0' }}>Next.js 15</span>
              <span style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', color: '#475569', border: '1px solid #e2e8f0' }}>TypeScript</span>
              <span style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', color: '#475569', border: '1px solid #e2e8f0' }}>Prisma</span>
              <span style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', color: '#475569', border: '1px solid #e2e8f0' }}>PostgreSQL</span>
              <span style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', color: '#475569', border: '1px solid #e2e8f0' }}>Tailwind CSS</span>
            </div>
          </div>
        </div>

        {/* Footer - Minimal */}
        <div className="text-center" style={{ marginTop: '48px' }}>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            © 2025 LegalOps. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
