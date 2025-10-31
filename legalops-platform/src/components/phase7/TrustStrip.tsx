/**
 * TrustStrip Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Displays trust signals across checkout and public pages
 * Shows: "Secure Payment", "State Approved", "AI Reviewed"
 */

import React from 'react';
import { Lock, CheckCircle, Sparkles, Shield } from 'lucide-react';

export interface TrustSignal {
  icon: 'lock' | 'check' | 'sparkles' | 'shield';
  label: string;
  description?: string;
}

export interface TrustStripProps {
  /** Trust signals to display */
  signals?: TrustSignal[];
  
  /** Layout variant */
  variant?: 'horizontal' | 'vertical';
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Optional: Additional CSS classes */
  className?: string;
}

const iconMap = {
  lock: Lock,
  check: CheckCircle,
  sparkles: Sparkles,
  shield: Shield,
};

const defaultSignals: TrustSignal[] = [
  {
    icon: 'lock',
    label: 'Secure Payment',
    description: 'SSL encrypted and PCI compliant',
  },
  {
    icon: 'check',
    label: 'State Approved',
    description: 'Authorized Florida filing agent',
  },
  {
    icon: 'sparkles',
    label: 'AI Reviewed',
    description: 'Automated accuracy verification',
  },
];

const sizeConfig = {
  sm: {
    iconSize: 16,
    fontSize: '12px',
    gap: '8px',
    padding: '8px 12px',
  },
  md: {
    iconSize: 20,
    fontSize: '14px',
    gap: '12px',
    padding: '12px 16px',
  },
  lg: {
    iconSize: 24,
    fontSize: '16px',
    gap: '16px',
    padding: '16px 20px',
  },
};

export function TrustStrip({
  signals = defaultSignals,
  variant = 'horizontal',
  size = 'md',
  className = '',
}: TrustStripProps) {
  const sizeStyle = sizeConfig[size];
  
  return (
    <div
      className={`trust-strip ${variant === 'horizontal' ? 'flex flex-wrap' : 'flex flex-col'} ${className}`}
      style={{
        gap: sizeStyle.gap,
        padding: sizeStyle.padding,
        background: 'rgba(255, 255, 255, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      {signals.map((signal, index) => {
        const Icon = iconMap[signal.icon];
        
        return (
          <div
            key={index}
            className="flex items-center gap-2"
            title={signal.description}
          >
            <Icon
              size={sizeStyle.iconSize}
              className="text-emerald-500"
              strokeWidth={2}
            />
            <span
              className="font-medium text-slate-700"
              style={{ fontSize: sizeStyle.fontSize }}
            >
              {signal.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Checkout Trust Strip
 * Pre-configured for checkout pages
 */
export function CheckoutTrustStrip() {
  return (
    <TrustStrip
      signals={[
        {
          icon: 'lock',
          label: 'Secure Payment',
          description: '256-bit SSL encryption',
        },
        {
          icon: 'shield',
          label: 'Fraud Protected',
          description: 'AI-powered fraud detection',
        },
        {
          icon: 'check',
          label: 'State Approved',
          description: 'Licensed Florida filing agent',
        },
      ]}
      size="md"
      variant="horizontal"
    />
  );
}

/**
 * Service Page Trust Strip
 * Pre-configured for service detail pages
 */
export function ServiceTrustStrip() {
  return (
    <TrustStrip
      signals={[
        {
          icon: 'check',
          label: 'State Approved',
          description: 'Authorized by Florida Department of State',
        },
        {
          icon: 'sparkles',
          label: 'AI Assisted',
          description: 'Automated form completion and review',
        },
        {
          icon: 'shield',
          label: 'Secure & Private',
          description: 'Your data is encrypted and protected',
        },
      ]}
      size="sm"
      variant="vertical"
    />
  );
}

