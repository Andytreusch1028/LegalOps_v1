/**
 * Authentication Context
 * 
 * Provides app-wide authentication state management including:
 * - User authentication status
 * - Session management
 * - Profile data access
 * - Authentication actions (login, logout, register)
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User } from '@/generated/prisma';

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;
  lastActivity: Date | null;
}

/**
 * Authentication actions interface
 */
export interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  checkAuthStatus: () => Promise<void>;
}

/**
 * Registration data interface
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Authentication context type
 */
export interface AuthContextType extends AuthState, AuthActions {}

/**
 * Default authentication state
 */
const defaultAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sessionId: null,
  lastActivity: null
};

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  /**
   * Update authentication state
   */
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      updateAuthState({ isLoading: true });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies for session management
      });

      const data = await response.json();

      if (response.ok && data.user) {
        updateAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          sessionId: data.sessionId,
          lastActivity: new Date()
        });

        return { success: true };
      } else {
        updateAuthState({ isLoading: false });
        return { 
          success: false, 
          error: data.error || 'Login failed' 
        };
      }
    } catch (error) {
      updateAuthState({ isLoading: false });
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }, [updateAuthState]);

  /**
   * Register new user
   */
  const register = useCallback(async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      updateAuthState({ isLoading: true });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        updateAuthState({ isLoading: false });
        return { success: true };
      } else {
        updateAuthState({ isLoading: false });
        return { 
          success: false, 
          error: data.error || 'Registration failed' 
        };
      }
    } catch (error) {
      updateAuthState({ isLoading: false });
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }, [updateAuthState]);

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state regardless of API success
      updateAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionId: null,
        lastActivity: null
      });
    }
  }, [updateAuthState]);

  /**
   * Refresh session and user data
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          updateAuthState({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            sessionId: data.sessionId,
            lastActivity: new Date()
          });
        } else {
          updateAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            sessionId: null,
            lastActivity: null
          });
        }
      } else {
        updateAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          sessionId: null,
          lastActivity: null
        });
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      updateAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionId: null,
        lastActivity: null
      });
    }
  }, [updateAuthState]);

  /**
   * Update user data in state
   */
  const updateUser = useCallback((userData: Partial<User>): void => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null
    }));
  }, []);

  /**
   * Check authentication status
   */
  const checkAuthStatus = useCallback(async (): Promise<void> => {
    await refreshSession();
  }, [refreshSession]);

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  /**
   * Set up session refresh interval
   */
  useEffect(() => {
    if (authState.isAuthenticated) {
      // Refresh session every 15 minutes
      const interval = setInterval(() => {
        refreshSession();
      }, 15 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [authState.isAuthenticated, refreshSession]);

  /**
   * Update last activity on user interaction
   */
  useEffect(() => {
    if (authState.isAuthenticated) {
      const updateActivity = () => {
        updateAuthState({ lastActivity: new Date() });
      };

      // Listen for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, updateActivity, { passive: true });
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, updateActivity);
        });
      };
    }
  }, [authState.isAuthenticated, updateAuthState]);

  /**
   * Context value
   */
  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    refreshSession,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to get current user
 */
export function useCurrentUser(): User | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to get authentication loading state
 */
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}