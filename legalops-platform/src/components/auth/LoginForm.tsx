/**
 * LoginForm Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Login form with Liquid Glass design system integration
 */

import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { SmartFormInput } from '../phase7/SmartFormInput';

export interface LoginFormProps {
  /** Form submission handler */
  onSubmit: (data: LoginFormData) => Promise<void>;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Form-level error message */
  error?: string;
  
  /** Success callback */
  onSuccess?: () => void;
  
  /** Forgot password callback */
  onForgotPassword?: () => void;
  
  /** Register callback */
  onRegister?: () => void;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  error,
  onSuccess,
  onForgotPassword,
  onRegister,
}: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof LoginFormData, string>> = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
      onSuccess?.();
    } catch (err) {
      // Error handling is managed by parent component
    }
  };

  const updateField = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="login-form max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-slate-600">Sign in to your account to continue</p>
      </div>

      {/* Form Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Sign In Failed</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <SmartFormInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={(value) => updateField('email', value)}
          error={fieldErrors.email}
          required
          autoComplete="email"
          placeholder="Enter your email address"
        />

        {/* Password Field */}
        <div className="relative">
          <SmartFormInput
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(value) => updateField('password', value)}
            error={fieldErrors.password}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => updateField('rememberMe', e.target.checked)}
              className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
            />
            <span className="text-sm text-slate-700">Remember me</span>
          </label>
          
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
            >
              Forgot password?
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="liquid-glass-button w-full flex items-center justify-center gap-2 py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              <LogIn size={20} />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Register Link */}
      {onRegister && (
        <div className="mt-8 text-center">
          <p className="text-slate-600">
            Don't have an account?{' '}
            <button
              onClick={onRegister}
              className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
            >
              Create one now
            </button>
          </p>
        </div>
      )}
    </div>
  );
}