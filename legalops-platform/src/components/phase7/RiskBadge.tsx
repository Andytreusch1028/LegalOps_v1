/**
 * RiskBadge Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Displays security confidence badge on checkout step 2
 * Shows risk level and score with appropriate styling
 */

import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskBadgeProps {
  /** Risk score from 0-100 */
  score: number;
  
  /** Risk level classification */
  level: RiskLevel;
  
  /** Optional: Show detailed score */
  showScore?: boolean;
  
  /** Optional: Size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Optional: Additional CSS classes */
  className?: string;
}

const riskConfig = {
  LOW: {
    icon: ShieldCheck,
    label: 'Secure',
    description: 'Low risk - processing normally',
    className: 'risk-badge-low',
    iconColor: 'rgb(16, 185, 129)', // emerald-500
  },
  MEDIUM: {
    icon: Shield,
    label: 'Verified',
    description: 'Medium risk - additional verification',
    className: 'risk-badge-medium',
    iconColor: 'rgb(245, 158, 11)', // amber-500
  },
  HIGH: {
    icon: ShieldAlert,
    label: 'Review Required',
    description: 'High risk - manual review required',
    className: 'risk-badge-high',
    iconColor: 'rgb(239, 68, 68)', // red-500
  },
  CRITICAL: {
    icon: AlertTriangle,
    label: 'Critical',
    description: 'Critical risk - approval required',
    className: 'risk-badge-critical',
    iconColor: 'rgb(127, 29, 29)', // red-900
  },
};

const sizeConfig = {
  sm: {
    padding: '6px 12px',
    fontSize: '12px',
    iconSize: 14,
  },
  md: {
    padding: '8px 16px',
    fontSize: '14px',
    iconSize: 16,
  },
  lg: {
    padding: '12px 20px',
    fontSize: '16px',
    iconSize: 20,
  },
};

export function RiskBadge({
  score,
  level,
  showScore = false,
  size = 'md',
  className = '',
}: RiskBadgeProps) {
  const config = riskConfig[level];
  const sizeStyle = sizeConfig[size];
  const Icon = config.icon;
  
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl font-medium ${config.className} ${className}`}
      style={{
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
      }}
      title={config.description}
    >
      <Icon size={sizeStyle.iconSize} color={config.iconColor} />
      <span>{config.label}</span>
      {showScore && (
        <span className="opacity-75">({score}/100)</span>
      )}
    </div>
  );
}

/**
 * Security Confidence Badge
 * Displays on checkout step 2 to build trust
 */
export interface SecurityBadgeProps {
  /** Risk assessment data */
  riskLevel: RiskLevel;
  riskScore: number;
  
  /** Optional: Show full details */
  showDetails?: boolean;
}

export function SecurityConfidenceBadge({
  riskLevel,
  riskScore,
  showDetails = false,
}: SecurityBadgeProps) {
  const isSecure = riskLevel === 'LOW' || riskLevel === 'MEDIUM';
  
  return (
    <div className="liquid-glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
      <div className="flex items-center gap-3">
        <RiskBadge score={riskScore} level={riskLevel} size="lg" />
        
        {isSecure && (
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">
              Secure Payment
            </h3>
            <p className="text-xs text-slate-600">
              Your transaction is protected and verified
            </p>
          </div>
        )}
        
        {!isSecure && (
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">
              Additional Verification Required
            </h3>
            <p className="text-xs text-slate-600">
              We need to verify some information before processing
            </p>
          </div>
        )}
      </div>
      
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Security Score: {riskScore}/100 • {riskConfig[riskLevel].description}
          </p>
        </div>
      )}
    </div>
  );
}

