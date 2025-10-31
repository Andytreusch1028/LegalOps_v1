/**
 * SmartFormInput Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Enhanced input field with:
 * - Liquid Glass Blue glow for verified fields
 * - Auto-fill indicators
 * - Validation states
 */

import React, { InputHTMLAttributes } from 'react';
import { CheckCircle } from 'lucide-react';

export interface SmartFormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Field label */
  label: string;
  
  /** Field name */
  name: string;
  
  /** Field value */
  value: string | number;
  
  /** Change handler */
  onChange: (value: string) => void;
  
  /** Is this field verified from saved record? */
  isVerified?: boolean;
  
  /** Verification source */
  verificationSource?: 'saved' | 'previous-order' | 'user-profile';
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Required field */
  required?: boolean;
  
  /** Optional: Additional CSS classes */
  className?: string;
}

export function SmartFormInput({
  label,
  name,
  value,
  onChange,
  isVerified = false,
  verificationSource,
  error,
  helperText,
  required = false,
  className = '',
  ...inputProps
}: SmartFormInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  
  const verificationLabels = {
    'saved': 'From saved information',
    'previous-order': 'From previous order',
    'user-profile': 'From your profile',
  };
  
  return (
    <div className={`smart-form-input ${className}`} style={{ marginBottom: '20px' }}>
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {isVerified && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle size={14} />
            {verificationSource && verificationLabels[verificationSource]}
          </span>
        )}
      </label>
      
      {/* Input Field */}
      <input
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full px-4 py-3 rounded-lg border transition-all
          ${isVerified ? 'verified-field' : ''}
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${!error && !isVerified ? 'border-slate-300 focus:border-sky-500 focus:ring-sky-500' : ''}
        `}
        style={{
          outline: isFocused && !error ? '2px solid rgba(14, 165, 233, 0.2)' : 'none',
        }}
        {...inputProps}
      />
      
      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

/**
 * SmartFormTextarea Component
 * Textarea variant of SmartFormInput
 */
export interface SmartFormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  isVerified?: boolean;
  verificationSource?: 'saved' | 'previous-order' | 'user-profile';
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export function SmartFormTextarea({
  label,
  name,
  value,
  onChange,
  isVerified = false,
  verificationSource,
  error,
  helperText,
  required = false,
  className = '',
  ...textareaProps
}: SmartFormTextareaProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  
  const verificationLabels = {
    'saved': 'From saved information',
    'previous-order': 'From previous order',
    'user-profile': 'From your profile',
  };
  
  return (
    <div className={`smart-form-textarea ${className}`} style={{ marginBottom: '20px' }}>
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {isVerified && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle size={14} />
            {verificationSource && verificationLabels[verificationSource]}
          </span>
        )}
      </label>
      
      {/* Textarea Field */}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full px-4 py-3 rounded-lg border transition-all
          ${isVerified ? 'verified-field' : ''}
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${!error && !isVerified ? 'border-slate-300 focus:border-sky-500 focus:ring-sky-500' : ''}
        `}
        style={{
          outline: isFocused && !error ? '2px solid rgba(14, 165, 233, 0.2)' : 'none',
          minHeight: '120px',
        }}
        {...textareaProps}
      />
      
      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

/**
 * SmartFormSelect Component
 * Select dropdown variant of SmartFormInput
 */
export interface SmartFormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  isVerified?: boolean;
  verificationSource?: 'saved' | 'previous-order' | 'user-profile';
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export function SmartFormSelect({
  label,
  name,
  value,
  onChange,
  options,
  isVerified = false,
  verificationSource,
  error,
  helperText,
  required = false,
  className = '',
  ...selectProps
}: SmartFormSelectProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  
  const verificationLabels = {
    'saved': 'From saved information',
    'previous-order': 'From previous order',
    'user-profile': 'From your profile',
  };
  
  return (
    <div className={`smart-form-select ${className}`} style={{ marginBottom: '20px' }}>
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {isVerified && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle size={14} />
            {verificationSource && verificationLabels[verificationSource]}
          </span>
        )}
      </label>
      
      {/* Select Field */}
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full px-4 py-3 rounded-lg border transition-all
          ${isVerified ? 'verified-field' : ''}
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${!error && !isVerified ? 'border-slate-300 focus:border-sky-500 focus:ring-sky-500' : ''}
        `}
        style={{
          outline: isFocused && !error ? '2px solid rgba(14, 165, 233, 0.2)' : 'none',
        }}
        {...selectProps}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

