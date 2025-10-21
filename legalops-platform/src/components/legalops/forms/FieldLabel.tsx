import React from 'react';
import { CircleHelp } from 'lucide-react';
import { cn } from '../theme';

export interface FieldLabelProps {
  htmlFor?: string;
  label: string;
  required?: boolean;
  tooltip?: string;
  className?: string;
}

export function FieldLabel({ htmlFor, label, required, tooltip, className }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('flex items-center gap-2 text-[13px] font-medium text-slate-600 mb-2', className)}
    >
      <span>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {tooltip && (
        <div className="group relative">
          <CircleHelp className="w-4 h-4 text-slate-400 cursor-help" />
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
            {tooltip}
            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-900" />
          </div>
        </div>
      )}
    </label>
  );
}

