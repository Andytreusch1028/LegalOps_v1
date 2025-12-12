/**
 * Authentication Components
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Export all authentication UI components
 */

export { LoginForm } from './LoginForm';
export type { LoginFormProps, LoginFormData } from './LoginForm';

export { RegisterForm } from './RegisterForm';
export type { RegisterFormProps, RegisterFormData } from './RegisterForm';

export { PasswordResetForm } from './PasswordResetForm';
export type { 
  PasswordResetFormProps, 
  PasswordResetRequestData, 
  PasswordResetCompleteData 
} from './PasswordResetForm';

export { EmailVerification } from './EmailVerification';
export type { EmailVerificationProps } from './EmailVerification';

// Authentication Guards
export { 
  RequireAuth, 
  RequireAdmin, 
  RequireVerified, 
  GuestOnly, 
  ConditionalAuth, 
  RoleGuard, 
  withAuth 
} from './AuthGuard';

// Session Management
export { SessionExpiryWarning, SessionStatusIndicator } from './SessionExpiryWarning';