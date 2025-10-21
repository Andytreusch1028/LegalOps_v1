import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { cn, cardBase } from '../theme';

export interface SuccessStep {
  title: string;
  description: string;
  eta?: string;
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
    <div className={cn(cardBase, 'p-8 md:p-12 text-center')}>
      {/* Success Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-semibold text-slate-900 mb-2">{title}</h1>

      {/* Subtitle */}
      {subtitle && <p className="text-lg text-slate-600 mb-6">{subtitle}</p>}

      {/* Order Number */}
      {orderNumber && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg mb-6">
          <span className="text-sm text-slate-600">Order Number:</span>
          <span className="text-sm font-semibold text-slate-900">{orderNumber}</span>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="max-w-md mx-auto mb-8">
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      )}

      {/* Steps */}
      {steps && steps.length > 0 && (
        <div className="mt-8 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 text-left">What Happens Next</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-left"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                  {step.eta && (
                    <p className="text-xs text-slate-500 mt-2">
                      <span className="font-medium">ETA:</span> {step.eta}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 w-full sm:w-auto"
            >
              {primaryAction.label}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 w-full sm:w-auto"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

