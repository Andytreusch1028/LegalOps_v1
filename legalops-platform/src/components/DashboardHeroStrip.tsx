'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, AlertCircle, CheckCircle, TrendingUp, Info } from 'lucide-react';

interface DashboardHeroStripProps {
  userName: string;
  businessCount: number;
  pendingActions: number;
  averageHealthScore: number | null;
  hasBusinesses: boolean;
}

export default function DashboardHeroStrip({
  userName,
  businessCount,
  pendingActions,
  averageHealthScore,
  hasBusinesses
}: DashboardHeroStripProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine health score color and status
  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return { color: '#10b981', bg: '#d1fae5', label: 'Excellent' };
    if (score >= 75) return { color: '#0ea5e9', bg: '#e0f2fe', label: 'Good' };
    if (score >= 60) return { color: '#f59e0b', bg: '#fef3c7', label: 'Needs Attention' };
    return { color: '#ef4444', bg: '#fee2e2', label: 'Critical' };
  };

  const healthScoreData = averageHealthScore ? getHealthScoreColor(averageHealthScore) : null;

  // Determine primary CTA based on customer state
  const getPrimaryCTA = () => {
    if (!hasBusinesses) {
      return {
        text: 'Form Your First Business',
        href: '/services?category=FORMATION',
        icon: <Building2 className="w-5 h-5" />,
        description: 'Choose from LLC, Corporation, Nonprofit, and more'
      };
    }
    
    if (pendingActions > 0) {
      return {
        text: `Review ${pendingActions} ${pendingActions === 1 ? 'Item' : 'Items'}`,
        href: '/dashboard/businesses',
        icon: <AlertCircle className="w-5 h-5" />,
        description: `${pendingActions === 1 ? 'An important item needs' : 'Important items need'} your attention`
      };
    }

    if (healthScoreData && averageHealthScore! < 75) {
      return {
        text: 'Improve Your Health Score',
        href: '/dashboard/businesses',
        icon: <TrendingUp className="w-5 h-5" />,
        description: 'Take action to improve compliance'
      };
    }

    return {
      text: 'View All Businesses',
      href: '/dashboard/businesses',
      icon: <Building2 className="w-5 h-5" />,
      description: `Manage your ${businessCount} ${businessCount === 1 ? 'business' : 'businesses'}`
    };
  };

  const primaryCTA = getPrimaryCTA();

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        padding: '40px',
        marginBottom: '32px',
        boxShadow: '0 10px 40px -10px rgba(14, 165, 233, 0.4)'
      }}
    >
      {/* Glass overlay effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
          transform: 'translateY(-20%)',
        }}
      />

      {/* Decorative circles */}
      <div
        className="absolute"
        style={{
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(40px)'
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          filter: 'blur(30px)'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left: Welcome Message */}
          <div className="flex-1">
            <h1 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '12px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              Welcome back, {userName}! 👋
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.95)', lineHeight: '1.6', maxWidth: '600px' }}>
              {hasBusinesses
                ? `You're managing ${businessCount} ${businessCount === 1 ? 'business' : 'businesses'}. ${pendingActions > 0 ? `${pendingActions} ${pendingActions === 1 ? 'item needs' : 'items need'} your attention.` : 'Everything looks good!'}`
                : 'Ready to start your business journey? Let\'s get your Florida LLC formed today.'
              }
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 mt-6">
              {/* Businesses */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <Building2 className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: 'white', lineHeight: '1' }}>{businessCount}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', marginTop: '2px' }}>
                    {businessCount === 1 ? 'Business' : 'Businesses'}
                  </p>
                </div>
              </div>

              {/* Items Needing Attention */}
              {hasBusinesses && (
                <div className="flex items-center gap-3 relative">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: pendingActions > 0 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${pendingActions > 0 ? 'rgba(251, 191, 36, 0.5)' : 'rgba(16, 185, 129, 0.5)'}`
                    }}
                  >
                    {pendingActions > 0 ? (
                      <AlertCircle className="w-6 h-6 text-amber-100" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }} />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-emerald-100" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }} />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: 'white', lineHeight: '1' }}>{pendingActions}</p>
                      <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', marginTop: '2px' }}>
                        {pendingActions === 0 ? 'All Clear' : pendingActions === 1 ? 'Needs Attention' : 'Need Attention'}
                      </p>
                    </div>
                    <div
                      className="relative"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <Info
                        className="w-4 h-4 text-white opacity-70 hover:opacity-100 cursor-help transition-opacity"
                        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
                      />
                      {showTooltip && (
                        <div
                          className="absolute z-50"
                          style={{
                            bottom: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginBottom: '8px',
                            width: '280px'
                          }}
                        >
                          <div
                            style={{
                              background: 'rgba(15, 23, 42, 0.95)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              padding: '12px',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                            }}
                          >
                            <p style={{ fontSize: '12px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>
                              Items Needing Attention:
                            </p>
                            <ul style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6', paddingLeft: '16px' }}>
                              <li>Overdue annual reports</li>
                              <li>Dissolved businesses</li>
                              <li>Missing critical documents</li>
                              <li>Incomplete form drafts</li>
                            </ul>
                            <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px', fontStyle: 'italic' }}>
                              These are things YOU need to do (not orders we're processing)
                            </p>
                          </div>
                          {/* Tooltip arrow */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '-6px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '12px',
                              height: '12px',
                              background: 'rgba(15, 23, 42, 0.95)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderTop: 'none',
                              borderLeft: 'none',
                              rotate: '45deg'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Health Score */}
              {hasBusinesses && healthScoreData && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <span style={{ fontSize: '18px', fontWeight: '700', color: 'white', textShadow: '0 2px 3px rgba(0,0,0,0.2)' }}>
                      {Math.round(averageHealthScore!)}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: 'white', lineHeight: '1' }}>
                      {healthScoreData.label}
                    </p>
                    <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', marginTop: '2px' }}>
                      Avg Health Score
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Primary CTA */}
          <div className="flex-shrink-0">
            <Link
              href={primaryCTA.href}
              className="group relative overflow-hidden"
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '24px 32px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                textDecoration: 'none',
                transition: 'all 200ms',
                minWidth: '280px'
              }}
            >
              {/* Glass highlight */}
              <div
                className="absolute inset-0 rounded-12"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)',
                  transform: 'translateY(-30%)',
                }}
              />

              <div className="relative z-10 w-full">
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
                      }}
                    >
                      <div style={{ color: 'white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>
                        {primaryCTA.icon}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-sky-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
                  {primaryCTA.text}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                  {primaryCTA.description}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

