import React from 'react';
import { cn } from '../theme';

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('mb-12 pb-12 border-b border-slate-100 last:border-b-0', className)}>
      <div className="mb-8">
        <h2 className="text-2xl font-light text-slate-900 mb-2">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

