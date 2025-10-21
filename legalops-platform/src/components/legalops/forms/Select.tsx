import React, { forwardRef } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '../theme';
import { FieldLabel } from './FieldLabel';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  tooltip?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, tooltip, required, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <FieldLabel
            htmlFor={props.id || props.name}
            label={label}
            required={required}
            tooltip={tooltip}
          />
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all appearance-none cursor-pointer',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id || props.name}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <div
            id={`${props.id || props.name}-error`}
            className="mt-2 flex items-start gap-2 text-sm text-red-600"
          >
            <CircleAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

