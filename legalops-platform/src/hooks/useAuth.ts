/**
 * Authentication Hooks
 * 
 * Re-exports authentication hooks and provides additional utility hooks.
 */

// Re-export the main auth hook from context
export { useAuth, useIsAuthenticated, useCurrentUser, useAuthLoading } from '@/contexts/AuthContext';

// Re-export profile and session hooks
export { useProfile } from './useProfile';
export { useSession } from './useSession';

// Export types
export type { 
  AuthState, 
  AuthActions, 
  AuthContextType, 
  RegisterData 
} from '@/contexts/AuthContext';

export type { 
  ProfileState, 
  ProfileActions, 
  UseProfileReturn,
  AutoFillData,
  PrivacyPreferences 
} from './useProfile';

export type { 
  SessionState, 
  SessionActions, 
  UseSessionReturn,
  SessionInfo 
} from './useSession';