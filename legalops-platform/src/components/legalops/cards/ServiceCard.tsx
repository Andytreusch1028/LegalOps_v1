import React from 'react';
import { Building2, ChevronRight } from 'lucide-react';
import { cn, cardBase, cardHover } from '../theme';
import { formatCurrency } from '../utils';

export interface ServiceCardProps {
  title: string;
  description: string;
  price: number;
  icon?: React.ReactNode;
  accentColor?: 'sky' | 'green' | 'amber' | 'purple';
  badge?: string;
  onClick?: () => void;
  loading?: boolean;
}

export function ServiceCard({
  title,
  description,
  price,
  icon,
  accentColor = 'sky',
  badge,
  onClick,
  loading = false,
}: ServiceCardProps) {
  const accentClasses = {
    sky: 'border-l-sky-500',
    green: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    purple: 'border-l-violet-500',
  };

  const badgeClasses = {
    sky: 'bg-sky-100 text-sky-700 border-sky-200',
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    purple: 'bg-violet-100 text-violet-700 border-violet-200',
  };

  if (loading) {
    return (
      <div className={cn(cardBase, 'border-l-4', accentClasses[accentColor], 'p-6')}>
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-slate-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-full" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="h-6 bg-slate-200 rounded w-20" />
            <div className="h-8 bg-slate-200 rounded w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        cardBase,
        cardHover,
        'border-l-4',
        accentClasses[accentColor],
        'p-6 cursor-pointer group'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 flex-shrink-0">
            {icon || <Building2 className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              {badge && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium border',
                    badgeClasses[accentColor]
                  )}
                >
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 line-clamp-2">{description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="text-2xl font-semibold text-slate-900">
          {formatCurrency(price)}
        </div>
        <div
          className="flex items-center gap-2 text-sky-600 font-medium text-sm group-hover:gap-3 transition-all"
          style={{ padding: '12px 24px' }}
        >
          <span>Learn More</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

