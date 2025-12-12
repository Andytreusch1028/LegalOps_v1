/**
 * EmailVerification Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Email verification component with resend functionality and status display
 */

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export interface EmailVerificationProps {
  /** User's email address */
  email: string;
  
  /** Verification token (if verifying) */
  token?: string;
  
  /** Current verification status */
  status: 'pending' | 'verifying' | 'success' | 'error' | 'expired';
  
  /** Error message */
  error?: string;
  
  /** Resend verification email handler */
  onResendEmail: (email: string) => Promise<void>;
  
  /** Verify token handler */
  onVerifyToken?: (token: string) => Promise<void>;
  
  /** Continue after verification */
  onContinue?: () => void;
  
  /** Back to login */
  onBackToLogin?: () => void;
  
  /** Change email address */
  onChangeEmail?: () => void;
}

export function EmailVerification({
  email,
  token,
  status,
  error,
  onResendEmail,
  onVerifyToken,
  onContinue,
  onBackToLogin,
  onChangeEmail,
}: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  // Auto-verify token if provided
  useEffect(() => {
    if (token && onVerifyToken && status === 'pending') {
      onVerifyToken(token);
    }
  }, [token, onVerifyToken, status]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return;
    
    setIsResending(true);
    try {
      await onResendEmail(email);
      setResendCount(prev => prev + 1);
      // Increase cooldown with each resend to prevent spam
      setResendCooldown(Math.min(60, 30 + (resendCount * 15)));
    } catch (err) {
      // Error handling is managed by parent component
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-600" size={48} />;
      case 'error':
      case 'expired':
        return <AlertCircle className="text-red-600" size={48} />;
      case 'verifying':
        return (
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <Mail className="text-sky-600" size={48} />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      case 'expired':
        return 'Link Expired';
      case 'verifying':
        return 'Verifying...';
      default:
        return 'Check Your Email';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Your email address has been successfully verified. You can now access all features.';
      case 'error':
        return error || 'There was a problem verifying your email address. Please try again.';
      case 'expired':
        return 'The verification link has expired. Please request a new one.';
      case 'verifying':
        return 'Please wait while we verify your email address...';
      default:
        return `We've sent a verification email to ${email}. Click the link in the email to verify your account.`;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-100';
      case 'error':
      case 'expired':
        return 'bg-red-100';
      case 'verifying':
        return 'bg-sky-100';
      default:
        return 'bg-slate-100';
    }
  };

  return (
    <div className="email-verification max-w-md mx-auto text-center">
      {/* Status Icon */}
      <div className={`w-20 h-20 ${getStatusColor()} rounded-full flex items-center justify-center mx-auto mb-6`}>
        {getStatusIcon()}
      </div>

      {/* Status Title */}
      <h1 className="text-2xl font-bold text-slate-900 mb-4">
        {getStatusTitle()}
      </h1>

      {/* Status Message */}
      <p className="text-slate-600 mb-8 leading-relaxed">
        {getStatusMessage()}
      </p>

      {/* Action Buttons */}
      <div className="space-y-4">
        {status === 'success' && onContinue && (
          <button
            onClick={onContinue}
            className="liquid-glass-button w-full flex items-center justify-center gap-2 py-3 px-4"
          >
            <CheckCircle size={20} />
            Continue to Dashboard
          </button>
        )}

        {(status === 'pending' || status === 'error' || status === 'expired') && (
          <>
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className="liquid-glass-button w-full flex items-center justify-center gap-2 py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <RefreshCw size={20} />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  Resend Verification Email
                </>
              )}
            </button>

            {onChangeEmail && (
              <button
                onClick={onChangeEmail}
                className="w-full py-2 px-4 text-sky-600 hover:text-sky-700 font-medium transition-colors"
              >
                Use a different email address
              </button>
            )}
          </>
        )}
      </div>

      {/* Help Text */}
      {status === 'pending' && (
        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-medium text-slate-900 mb-2">Didn't receive the email?</h3>
          <ul className="text-sm text-slate-600 space-y-1 text-left">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure {email} is correct</li>
            <li>• Wait a few minutes for delivery</li>
            <li>• Try resending the verification email</li>
          </ul>
        </div>
      )}

      {/* Resend Limit Warning */}
      {resendCount >= 3 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
            <div className="text-left">
              <p className="text-yellow-800 font-medium">Too many requests</p>
              <p className="text-yellow-700 text-sm mt-1">
                You've requested several verification emails. Please check your email carefully or contact support if you continue having issues.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Back to Login */}
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