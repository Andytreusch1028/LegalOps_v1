import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { cn, cardBase } from '../theme';
import { formatCurrency } from '../utils';

export interface OrderLineItem {
  label: string;
  value: number;
  description?: string;
}

export interface OrderSummaryCardProps {
  items: OrderLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  showRiskBadge?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  loading?: boolean;
}

export function OrderSummaryCard({
  items,
  subtotal,
  tax,
  total,
  showRiskBadge = false,
  riskLevel = 'low',
  loading = false,
}: OrderSummaryCardProps) {
  const riskConfig = {
    low: {
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'Low Risk',
    },
    medium: {
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'Medium Risk',
    },
    high: {
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'High Risk',
    },
  };

  if (loading) {
    return (
      <div className={cn(cardBase, 'p-6')}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-6" />
          <div className="space-y-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-1/4" />
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between">
              <div className="h-6 bg-slate-200 rounded w-1/4" />
              <div className="h-6 bg-slate-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(cardBase, 'p-6')}>
      <h3 className="text-xl font-semibold text-slate-900 mb-6">Order Summary</h3>

      {/* Line Items */}
      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                {item.description && (
                  <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-900 ml-4">
                {formatCurrency(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Subtotal */}
      <div className="flex justify-between items-center py-3 border-t border-slate-200">
        <span className="text-sm text-slate-600">Subtotal</span>
        <span className="text-sm font-medium text-slate-900">{formatCurrency(subtotal)}</span>
      </div>

      {/* Tax */}
      <div className="flex justify-between items-center py-3 border-t border-slate-200">
        <span className="text-sm text-slate-600">Tax</span>
        <span className="text-sm font-medium text-slate-900">{formatCurrency(tax)}</span>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center py-4 border-t-2 border-slate-300 mt-2">
        <span className="text-lg font-semibold text-slate-900">Total</span>
        <span className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</span>
      </div>

      {/* Risk Badge */}
      {showRiskBadge && (
        <div
          className={cn(
            'mt-6 p-4 rounded-lg border flex items-start gap-3',
            riskConfig[riskLevel].bg,
            riskConfig[riskLevel].border
          )}
        >
          <ShieldCheck className={cn('w-5 h-5 flex-shrink-0 mt-0.5', riskConfig[riskLevel].color)} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-sm font-semibold', riskConfig[riskLevel].color)}>
                {riskConfig[riskLevel].label}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              This order has been verified and assessed for fraud risk.
            </p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-slate-600">
            Your payment information is encrypted and secure. We never store your full card details.
          </p>
        </div>
      </div>
    </div>
  );
}

