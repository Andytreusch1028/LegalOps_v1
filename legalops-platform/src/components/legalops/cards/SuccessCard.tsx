import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { cn, cardBase } from '../theme';

export interface SuccessStep {
  title: string;
  description: string;
  eta?: string;
  isRush?: boolean;
}

export interface SuccessCardProps {
  title: string;
  subtitle?: string;
  orderNumber?: string;
  message?: string;
  steps?: SuccessStep[];
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function SuccessCard({
  title,
  subtitle,
  orderNumber,
  message,
  steps,
  primaryAction,
  secondaryAction,
}: SuccessCardProps) {
  return (
    <div
      className="bg-white rounded-xl text-center"
      style={{
        padding: '48px 32px',
        border: '3px solid #10b981',
        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
        background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
      }}
    >
      {/* Success Icon */}
      <div
        className="inline-flex items-center justify-center rounded-full"
        style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          border: '3px solid #10b981',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          marginBottom: '24px',
        }}
      >
        <CheckCircle2 className="text-emerald-600" style={{ width: '40px', height: '40px' }} />
      </div>

      {/* Title */}
      <h1 className="text-slate-900 font-bold" style={{ fontSize: '36px', marginBottom: '12px' }}>{title}</h1>

      {/* Subtitle */}
      {subtitle && <p className="text-slate-600" style={{ fontSize: '20px', marginBottom: '24px' }}>{subtitle}</p>}

      {/* Order Number */}
      {orderNumber && (
        <div
          className="inline-flex items-center rounded-lg"
          style={{
            gap: '12px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '2px solid #0ea5e9',
            boxShadow: '0 3px 10px rgba(14, 165, 233, 0.2)',
            marginBottom: '24px',
          }}
        >
          <span className="text-slate-600 font-medium" style={{ fontSize: '16px' }}>Order Number:</span>
          <span className="text-slate-900 font-bold" style={{ fontSize: '16px' }}>{orderNumber}</span>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="mx-auto" style={{ maxWidth: '600px', marginBottom: '32px' }}>
          <p className="text-slate-600" style={{ fontSize: '16px', lineHeight: '1.6' }}>{message}</p>
        </div>
      )}

      {/* Steps */}
      {steps && steps.length > 0 && (
        <div style={{ marginTop: '32px', marginBottom: '32px' }}>
          <h2 className="text-slate-900 font-bold text-left" style={{ fontSize: '24px', marginBottom: '24px' }}>What Happens Next</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {steps.map((step, index) => {
              // Check if this is a rush processing step
              const isRushStep = step.isRush || step.description.includes('🚀');

              return (
                <div
                  key={index}
                  className="flex items-start rounded-lg text-left"
                  style={{
                    gap: '16px',
                    padding: '20px',
                    background: isRushStep
                      ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: isRushStep
                      ? '3px solid #f59e0b'
                      : '2px solid #cbd5e1',
                    boxShadow: isRushStep
                      ? '0 6px 20px rgba(245, 158, 11, 0.3)'
                      : '0 3px 10px rgba(100, 116, 139, 0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Diagonal RUSH Banner */}
                  {isRushStep && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '-32px',
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        color: '#78350f',
                        padding: '6px 40px',
                        fontSize: '12px',
                        fontWeight: '800',
                        letterSpacing: '0.5px',
                        transform: 'rotate(45deg)',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                        border: '1px solid #d97706',
                        zIndex: 10,
                      }}
                    >
                      RUSH
                    </div>
                  )}

                  <div
                    className="flex-shrink-0 rounded-full flex items-center justify-center font-bold"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: isRushStep
                        ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                      border: isRushStep
                        ? '2px solid #d97706'
                        : '2px solid #0ea5e9',
                      boxShadow: isRushStep
                        ? '0 3px 10px rgba(245, 158, 11, 0.3)'
                        : '0 2px 6px rgba(14, 165, 233, 0.2)',
                      fontSize: '18px',
                      color: isRushStep ? '#78350f' : '#0284c7',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-900 font-bold" style={{ fontSize: '16px', marginBottom: '8px' }}>{step.title}</h3>
                    <p className={isRushStep ? 'text-amber-900' : 'text-slate-600'} style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: isRushStep ? '600' : '400' }}>{step.description}</p>
                    {step.eta && (
                      <p className={isRushStep ? 'text-amber-800' : 'text-slate-500'} style={{ fontSize: '14px', marginTop: '8px', fontWeight: isRushStep ? '700' : '600' }}>
                        <span className="font-semibold">ETA:</span> {step.eta}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center" style={{ gap: '16px', marginTop: '32px' }}>
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="inline-flex items-center justify-center text-white rounded-xl font-bold transition-all duration-300 w-full sm:w-auto"
              style={{
                gap: '8px',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: '2px solid #2563eb',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                fontSize: '16px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {primaryAction.label}
              <ChevronRight style={{ width: '20px', height: '20px' }} />
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center justify-center text-slate-700 rounded-xl font-bold transition-all duration-300 w-full sm:w-auto"
              style={{
                gap: '8px',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                border: '2px solid #cbd5e1',
                boxShadow: '0 4px 12px rgba(100, 116, 139, 0.2)',
                fontSize: '16px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(100, 116, 139, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(100, 116, 139, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

