/**
 * PasswordResetForm Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Password reset form with email request and reset completion flows
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Key, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { SmartFormInput } from '../phase7/SmartFormInput';

export interface PasswordResetFormProps {
  /** Current step in the reset flow */
  step: 'request' | 'reset';
  
  /** Form submission handler */
  onSubmit: (data: PasswordResetRequestData | PasswordResetCompleteData) => Promise<void>;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Form-level error message */
  error?: string;
  
  /** Success callback */
  onSuccess?: () => void;
  
  /** Back to login callback */
  onBackToLogin?: () => void;
  
  /** Email for reset (when in reset step) */
  email?: string;
  
  /** Reset token (when in reset step) */
  token?: string;
}

export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetCompleteData {
  token: string;
  password: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export function PasswordResetForm({
  step,
  onSubmit,
  isLoading = false,
  error,
  onSuccess,
  onBackToLogin,
  email = '',
  token = '',
}: PasswordResetFormProps) {
  const [requestData, setRequestData] = useState<PasswordResetRequestData>({
    email: email,
  });
  
  const [resetData, setResetData] = useState<PasswordResetCompleteData>({
    token: token,
    password: '',
    confirmPassword: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isValid: false,
  });
  const [emailSent, setEmailSent] = useState(false);

  const checkPasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;
    
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }
    
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }
    
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }
    
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }
    
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }
    
    return {
      score,
      feedback,
      isValid: score >= 4,
    };
  };

  const validateRequestForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!requestData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateResetForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!resetData.password) {
      errors.password = 'Password is required';
    } else if (!passwordStrength.isValid) {
      errors.password = 'Password does not meet security requirements';
    }
    
    if (!resetData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (resetData.password !== resetData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'request') {
      if (!validateRequestForm()) return;
      
      try {
        await onSubmit(requestData);
        setEmailSent(true);
      } catch (err) {
        // Error handling is managed by parent component
      }
    } else {
      if (!validateResetForm()) return;
      
      try {
        await onSubmit(resetData);
        onSuccess?.();
      } catch (err) {
        // Error handling is managed by parent component
      }
    }
  };

  const updateRequestField = (field: keyof PasswordResetRequestData, value: string) => {
    setRequestData(prev => ({ ...prev, [field]: value }));
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const updateResetField = (field: keyof PasswordResetCompleteData, value: string) => {
    setResetData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength.score <= 2) return 'Weak';
    if (passwordStrength.score <= 3) return 'Fair';
    return 'Strong';
  };

  // Email sent success state
  if (step === 'request' && emailSent) {
    return (
      <div className="password-reset-form max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h1>
          <p className="text-slate-600">
            We've sent password reset instructions to{' '}
            <span className="font-medium">{requestData.email}</span>
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          
          <button
            onClick={() => setEmailSent(false)}
            className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
          >
            Try a different email address
          </button>
        </div>

        {onBackToLogin && (
          <div className="mt-8">
            <button
              onClick={onBackToLogin}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-700 transition-colors mx-auto"
            >
              <ArrowLeft size={16} />
              Back to sign in
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="password-reset-form max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {step === 'request' ? 'Reset Password' : 'Create New Password'}
        </h1>
        <p className="text-slate-600">
          {step === 'request'
            ? 'Enter your email address and we\'ll send you reset instructions'
            : 'Enter your new password below'
          }
        </p>
      </div>

      {/* Form Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">
              {step === 'request' ? 'Reset Request Failed' : 'Password Reset Failed'}
            </p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 'request' ? (
          /* Email Request Form */
          <SmartFormInput
            label="Email Address"
            name="email"
            type="email"
            value={requestData.email}
            onChange={(value) => updateRequestField('email', value)}
            error={fieldErrors.email}
            helperText="We'll send reset instructions to this email address"
            required
            autoComplete="email"
            placeholder="Enter your email address"
          />
        ) : (
          /* Password Reset Form */
          <>
            {/* New Password Field */}
            <div className="relative">
              <SmartFormInput
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={resetData.password}
                onChange={(value) => updateResetField('password', value)}
                error={fieldErrors.password}
                required
                autoComplete="new-password"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              
              {/* Password Strength Indicator */}
              {resetData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                  
                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-sm text-slate-600">
                      <p className="mb-1">Password needs:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {passwordStrength.feedback.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <SmartFormInput
                label="Confirm New Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={resetData.confirmPassword}
                onChange={(value) => updateResetField('confirmPassword', value)}
                error={fieldErrors.confirmPassword}
                required
                autoComplete="new-password"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="liquid-glass-button w-full flex items-center justify-center gap-2 py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {step === 'request' ? 'Sending...' : 'Updating Password...'}
            </>
          ) : (
            <>
              {step === 'request' ? <Mail size={20} /> : <Key size={20} />}
              {step === 'request' ? 'Send Reset Instructions' : 'Update Password'}
            </>
          )}
        </button>
      </form>

      {/* Back to Login */}
      {onBackToLogin && (
        <div className="mt-8 text-center">
          <button
            onClick={onBackToLogin}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-700 transition-colors mx-auto"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </button>
        </div>
      )}
    </div>
  );
}