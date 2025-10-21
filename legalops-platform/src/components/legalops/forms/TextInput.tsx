import React, { forwardRef } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn, inputBase } from '../theme';
import { FieldLabel } from './FieldLabel';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  tooltip?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'number';
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, tooltip, required, className, ...props }, ref) => {
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
        <input
          ref={ref}
          type={props.type || 'text'}
          className={cn(
            inputBase,
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id || props.name}-error` : undefined}
          {...props}
        />
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

TextInput.displayName = 'TextInput';

