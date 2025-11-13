'use client';

/**
 * LegalOps v1 - Health Score Details Modal
 * 
 * Displays detailed breakdown of business health score with:
 * - Overall score with visual indicator
 * - Compliance, Documents, and Payments breakdowns
 * - Specific factors affecting each category
 * - Actionable recommendations to improve score
 */

import { X, CheckCircle, AlertCircle, XCircle, TrendingUp } from 'lucide-react';

interface HealthFactor {
  name: string;
  impact: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

interface HealthScoreBreakdown {
  totalScore: number;
  compliance: {
    score: number;
    maxScore: number;
    factors: HealthFactor[];
  };
  documents: {
    score: number;
    maxScore: number;
    factors: HealthFactor[];
  };
  payments: {
    score: number;
    maxScore: number;
    factors: HealthFactor[];
  };
  recommendations: string[];
}

interface HealthScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  breakdown: HealthScoreBreakdown;
}

export default function HealthScoreModal({ isOpen, onClose, businessName, breakdown }: HealthScoreModalProps) {
  if (!isOpen) return null;

  // Get overall health status
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: '#059669', bg: '#d1fae5' };
    if (score >= 75) return { label: 'Good', color: '#0284c7', bg: '#dbeafe' };
    if (score >= 60) return { label: 'Needs Attention', color: '#d97706', bg: '#fef3c7' };
    return { label: 'Critical', color: '#dc2626', bg: '#fee2e2' };
  };

  const healthStatus = getHealthStatus(breakdown.totalScore);

  // Get icon for factor status
  const getFactorIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle size={16} color="#059669" />;
      case 'warning':
        return <AlertCircle size={16} color="#d97706" />;
      case 'critical':
        return <XCircle size={16} color="#dc2626" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          maxWidth: '700px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: 'white', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                Business Health Score
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                {businessName}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
              }}
            >
              <X size={20} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Overall Score */}
          <div
            style={{
              background: `linear-gradient(135deg, ${healthStatus.bg} 0%, ${healthStatus.bg}dd 100%)`,
              border: `2px solid ${healthStatus.color}`,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '24px'
            }}
          >
            <div
              style={{
                width: '100px',
                height: '100px',
                background: 'white',
                border: `3px solid ${healthStatus.color}`,
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '36px', fontWeight: '700', color: healthStatus.color, lineHeight: '1' }}>
                {breakdown.totalScore}
              </span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', marginTop: '4px' }}>
                out of 100
              </span>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: healthStatus.color, marginBottom: '4px' }}>
                {healthStatus.label} Health
              </div>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', marginBottom: '12px' }}>
                {breakdown.totalScore >= 90 && 'Your business is in excellent standing with all compliance requirements met.'}
                {breakdown.totalScore >= 75 && breakdown.totalScore < 90 && 'Your business is in good health with minor improvements recommended.'}
                {breakdown.totalScore >= 60 && breakdown.totalScore < 75 && 'Your business needs attention in some areas to maintain compliance.'}
                {breakdown.totalScore < 60 && 'Your business has critical issues that require immediate attention.'}
              </p>

              {/* Compliance Status Labels */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {breakdown.compliance.factors.map((factor, index) => {
                  // Show status labels for annual report compliance
                  if (factor.name === 'Administratively Dissolved') {
                    return (
                      <span key={index} style={{
                        background: '#7c2d12',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ❌ Administratively Dissolved
                      </span>
                    );
                  }
                  if (factor.name === 'Imminent Revocation Risk') {
                    return (
                      <span key={index} style={{
                        background: '#dc2626',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ⏳ Pending Revocation
                      </span>
                    );
                  }
                  if (factor.name === 'Annual Report Late') {
                    return (
                      <span key={index} style={{
                        background: '#d97706',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ⚠️ Late — $400 Fee Due
                      </span>
                    );
                  }
                  if (factor.name === 'Recently Reinstated') {
                    return (
                      <span key={index} style={{
                        background: '#0284c7',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        🔄 Reinstated
                      </span>
                    );
                  }
                  if (factor.status === 'good' && factor.impact === 0) {
                    return (
                      <span key={index} style={{
                        background: '#059669',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ✅ Active
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
              Score Breakdown
            </h3>

            {/* Compliance */}
            <ScoreCategory
              title="Compliance"
              score={breakdown.compliance.score}
              maxScore={breakdown.compliance.maxScore}
              factors={breakdown.compliance.factors}
              getFactorIcon={getFactorIcon}
            />

            {/* Documents */}
            <ScoreCategory
              title="Documents"
              score={breakdown.documents.score}
              maxScore={breakdown.documents.maxScore}
              factors={breakdown.documents.factors}
              getFactorIcon={getFactorIcon}
            />

            {/* Payments */}
            <ScoreCategory
              title="Payments"
              score={breakdown.payments.score}
              maxScore={breakdown.payments.maxScore}
              factors={breakdown.payments.factors}
              getFactorIcon={getFactorIcon}
            />
          </div>

          {/* Recommendations */}
          {breakdown.recommendations.length > 0 && (
            <div
              style={{
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '12px',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <TrendingUp size={20} color="#0ea5e9" />
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                  Recommendations to Improve
                </h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {breakdown.recommendations.map((rec, index) => (
                  <li key={index} style={{ fontSize: '14px', color: '#334155', marginBottom: '8px', lineHeight: '1.5' }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}

// Score Category Component
function ScoreCategory({
  title,
  score,
  maxScore,
  factors,
  getFactorIcon
}: {
  title: string;
  score: number;
  maxScore: number;
  factors: HealthFactor[];
  getFactorIcon: (status: string) => JSX.Element | null;
}) {
  const percentage = (score / maxScore) * 100;
  const barColor = percentage >= 90 ? '#059669' : percentage >= 75 ? '#0284c7' : percentage >= 60 ? '#d97706' : '#dc2626';

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
          {title}
        </span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: barColor }}>
          {score}/{maxScore}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: barColor,
            transition: 'width 0.3s ease-out'
          }}
        />
      </div>

      {/* Factors */}
      {factors.length > 0 && (
        <div style={{ paddingLeft: '12px' }}>
          {factors.map((factor, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '8px',
                padding: '8px',
                background: '#f8fafc',
                borderRadius: '6px'
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {getFactorIcon(factor.status)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a', marginBottom: '2px' }}>
                  {factor.name}
                  {factor.impact > 0 && (
                    <span style={{ fontSize: '12px', color: '#dc2626', marginLeft: '6px' }}>
                      (-{factor.impact} pts)
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {factor.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

