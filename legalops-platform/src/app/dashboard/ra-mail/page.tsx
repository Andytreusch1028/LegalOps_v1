'use client';

import { useEffect, useState } from 'react';
import { Mail, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function RAMailPage() {
  const [hasRAService, setHasRAService] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Check if user has registered agent service
    // For now, show placeholder
    setTimeout(() => {
      setHasRAService(false);
      setLoading(false);
    }, 500);
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
        <p style={{ color: '#6b7280' }}>Loading your mail...</p>
      </div>
    );
  }

  // If user doesn't have RA service, show upsell
  if (!hasRAService) {
    return (
      <div>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px' }}>
            Registered Agent Mail
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b' }}>
            Get your official business mail scanned and delivered digitally
          </p>
        </div>

        {/* Upsell Card */}
        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            maxWidth: '800px',
            margin: '0 auto'
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}
          >
            <Mail size={40} color="white" />
          </div>

          <h2 className="font-semibold" style={{ fontSize: '28px', color: '#0f172a', marginBottom: '16px' }}>
            Never Miss Important Mail Again
          </h2>

          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
            Our Registered Agent service receives your official business mail, scans it,
            and delivers it to your dashboard instantly. No more waiting for postal mail
            or missing critical deadlines.
          </p>

          {/* Features Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{ gap: '24px', marginBottom: '32px', textAlign: 'left' }}
          >
            {/* Feature 1 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: '#dbeafe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FileText size={24} color="#0284c7" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                  Instant Digital Delivery
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  Mail scanned and uploaded within 24 hours of receipt
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: '#d1fae5',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CheckCircle size={24} color="#059669" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                  State Compliance
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  Required for all Florida LLCs and Corporations
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: '#fef3c7',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertCircle size={24} color="#d97706" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                  Never Miss Deadlines
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  Get notified immediately when important mail arrives
                </p>
              </div>
            </div>

            {/* Feature 4 - Coming Soon */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: '#ede9fe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: '24px' }}>🤖</span>
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                  AI Summaries <span style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: '600' }}>COMING SOON</span>
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  AI reads your mail and explains what it means in plain English
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div
            style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px'
            }}
          >
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
              Registered Agent Service
            </p>
            <p className="font-bold" style={{ fontSize: '36px', color: '#0f172a', marginBottom: '4px' }}>
              $99<span style={{ fontSize: '18px', fontWeight: '500', color: '#64748b' }}>/year</span>
            </p>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              First year included with LLC/Corporation formation
            </p>
          </div>

          {/* CTA Button */}
          <button
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: 'white',
              padding: '16px 48px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 165, 233, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
            }}
          >
            Add Registered Agent Service
          </button>

          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '16px' }}>
            Questions? <a href="/support" style={{ color: '#0ea5e9', textDecoration: 'underline' }}>Contact our team</a>
          </p>
        </div>

        {/* Info Section */}
        <div
          style={{
            marginTop: '48px',
            padding: '24px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            maxWidth: '800px',
            margin: '48px auto 0'
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <AlertCircle size={24} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 className="font-semibold" style={{ fontSize: '16px', color: '#92400e', marginBottom: '8px' }}>
                Why You Need a Registered Agent
              </h3>
              <p style={{ fontSize: '14px', color: '#78350f', lineHeight: '1.6' }}>
                Florida law requires all LLCs and Corporations to maintain a registered agent
                with a physical Florida address. Your registered agent receives official legal
                documents, government notices, and service of process on behalf of your business.
                Without one, your business cannot remain in good standing.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user has RA service, show mail inbox (placeholder for now)
  return (
    <div>
      <h1 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a', marginBottom: '32px' }}>
        Registered Agent Mail
      </h1>

      {/* Placeholder for mail inbox */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}
      >
        <Clock size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
        <h2 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>
          Mail Inbox Coming Soon
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Your registered agent mail will appear here once we receive it.
        </p>
      </div>
    </div>
  );
}

