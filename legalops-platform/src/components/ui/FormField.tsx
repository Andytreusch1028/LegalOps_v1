/**
 * FormField Component
 * 
 * A reusable form field component with built-in validation, error display,
 * and consistent styling across the application.
 * 
 * @module components/ui/FormField
 */

import React from 'react';
import { cn } from '@/components/legalops/theme';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  /**
   * Label text for the form field
   */
  label?: string;
  
  /**
   * Error message to display below the field
   */
  error?: string;
  
  /**
   * Helper text to display below the field
   */
  helperText?: string;
  
  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;
  
  /**
   * Whether to render as a textarea instead of input
   * @default false
   */
  multiline?: boolean;
  
  /**
   * Number of rows for textarea (only applies when multiline=true)
   * @default 3
   */
  rows?: number;
  
  /**
   * Icon to display at the start of the input
   */
  startIcon?: React.ReactNode;
  
  /**
   * Icon to display at the end of the input
   */
  endIcon?: React.ReactNode;
  
  /**
   * Additional className for the container
   */
  containerClassName?: string;
}

/**
 * FormField component with built-in validation and error display
 * 
 * @example
 * ```tsx
 * <FormField
 *   label="Email Address"
 *   type="email"
 *   required
 *   error={errors.email}
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 * ```
 */
export const FormField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      multiline = false,
      rows = 3,
      startIcon,
      endIcon,
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const hasError = Boolean(error);
    
    const inputClasses = cn(
      // Base styles
      'w-full px-4 py-2.5',
      'border rounded-lg',
      'bg-white text-slate-900',
      'placeholder:text-slate-400',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'transition-all duration-200',
      'disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-500',
      // Icon padding
      startIcon && 'pl-10',
      endIcon && 'pr-10',
      // Error state
      hasError
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-slate-300 focus:ring-sky-500 focus:border-sky-500',
      // Custom className
      className
    );
    
    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={fieldId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Start Icon */}
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {startIcon}
            </div>
          )}
          
          {/* Input or Textarea */}
          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={fieldId}
              rows={rows}
              className={inputClasses}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined
              }
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={fieldId}
              className={inputClasses}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined
              }
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
          
          {/* End Icon */}
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <p
            id={`${fieldId}-error`}
            className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        
        {/* Helper Text */}
        {!error && helperText && (
          <p
            id={`${fieldId}-helper`}
            className="mt-1.5 text-sm text-slate-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
