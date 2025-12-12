/**
 * AuthenticatedSmartFormInput Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Enhanced SmartFormInput with authentication integration and verification tracking
 */

import React from 'react';
import { SmartFormInput, SmartFormInputProps } from '../phase7/SmartFormInput';

export interface AuthenticatedSmartFormInputProps extends Omit<SmartFormInputProps, 'isVerified' | 'verificationSource'> {
  /** Check if field is verified from useSmartForm */
  isVerified?: boolean;
  
  /** Verification source from useSmartForm */
  verificationSource?: 'saved' | 'previous-order' | 'user-profile';
  
  /** Show verification badge even if not verified */
  showVerificationStatus?: boolean;
  
  /** Custom verification label */
  verificationLabel?: string;
}

export function AuthenticatedSmartFormInput({
  isVerified = false,
  verificationSource,
  showVerificationStatus = true,
  verificationLabel,
  ...props
}: AuthenticatedSmartFormInputProps) {
  // Determine verification display
  const displayVerification = showVerificationStatus && isVerified;
  const displaySource = verificationSource || 'user-profile';
  
  // Custom verification label if provided
  const customVerificationLabels = {
    'saved': verificationLabel || 'From saved information',
    'previous-order': verificationLabel || 'From previous order',
    'user-profile': verificationLabel || 'From your profile',
  };

  return (
    <SmartFormInput
      {...props}
      isVerified={displayVerification}
      verificationSource={displayVerification ? displaySource : undefined}
    />
  );
}