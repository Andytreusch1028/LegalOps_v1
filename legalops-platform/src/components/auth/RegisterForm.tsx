/**
 * RegisterForm Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Registration form with email verification flow and Liquid Glass design
 */

import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { SmartFormInput } from '../phase7/SmartFormInput';

export interface RegisterFormProps {
  /** Form submission handler */
  onSubmit: (data: RegisterFormData) => Promise<void>;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Form-level error message */
  error?: string;
  
  /** Success callback */
  onSuccess?: () => void;
  
  /** Login callback */
  onLogin?: () => void;
  
  /** Email verification sent callback */
  onVerificationSent?: (email: string) => void;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  marketingConsent: boolean;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export function RegisterForm({
  onSubmit,
  isLoading = false,
  error,
  onSuccess,
  onLogin,
  onVerificationSent,
}: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    marketingConsent: false,
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isValid: false,
  });

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

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof RegisterFormData, string>> = {};
    
    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!passwordStrength.isValid) {
      errors.password = 'Password does not meet security requirements';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Terms acceptance validation
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
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
      onVerificationSent?.(formData.email);
      onSuccess?.();
    } catch (err) {
      // Error handling is managed by parent component
    }
  };

  const updateField = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update password strength when password changes
    if (field === 'password' && typeof value === 'string') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Clear field error when user starts typing
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

  return (
    <div className="register-form max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h1>
        <p className="text-slate-600">Join us to get started with your legal documents</p>
      </div>

      {/* Form Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Registration Failed</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <SmartFormInput
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={(value) => updateField('firstName', value)}
            error={fieldErrors.firstName}
            required
            autoComplete="given-name"
            placeholder="First name"
          />
          
          <SmartFormInput
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={(value) => updateField('lastName', value)}
            error={fieldErrors.lastName}
            required
            autoComplete="family-name"
            placeholder="Last name"
          />
        </div>

        {/* Email Field */}
        <SmartFormInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={(value) => updateField('email', value)}
          error={fieldErrors.email}
          helperText="We'll send a verification email to this address"
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
          {formData.password && (
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
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(value) => updateField('confirmPassword', value)}
            error={fieldErrors.confirmPassword}
            required
            autoComplete="new-password"
            placeholder="Confirm your password"
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

        {/* Terms and Marketing Consent */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => updateField('acceptTerms', e.target.checked)}
              className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 mt-0.5"
            />
            <span className="text-sm text-slate-700">
              I agree to the{' '}
              <a href="/terms" className="text-sky-600 hover:text-sky-700 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-sky-600 hover:text-sky-700 font-medium">
                Privacy Policy
              </a>
            </span>
          </label>
          
          {fieldErrors.acceptTerms && (
            <p className="text-red-600 text-sm">{fieldErrors.acceptTerms}</p>
          )}
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.marketingConsent}
              onChange={(e) => updateField('marketingConsent', e.target.checked)}
              className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 mt-0.5"
            />
            <span className="text-sm text-slate-700">
              I'd like to receive updates about new features and legal insights (optional)
            </span>
          </label>
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
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus size={20} />
              Create Account
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      {onLogin && (
        <div className="mt-8 text-center">
          <p className="text-slate-600">
            Already have an account?{' '}
            <button
              onClick={onLogin}
              className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      )}
    </div>
  );
}