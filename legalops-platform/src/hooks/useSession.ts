/**
 * Session Management Hook
 * 
 * Provides session management functionality including:
 * - Session validation and refresh
 * - Session timeout handling
 * - Activity tracking
 * - Session security monitoring
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Session information interface
 */
export interface SessionInfo {
  sessionId: string | null;
  expiresAt: Date | null;
  lastActivity: Date | null;
  isActive: boolean;
  timeUntilExpiry: number | null; // in milliseconds
  warningThreshold: number; // in milliseconds
}

/**
 * Session hook state interface
 */
export interface SessionState {
  sessionInfo: SessionInfo;
  isSessionValid: boolean;
  isSessionExpiring: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Session hook actions interface
 */
export interface SessionActions {
  refreshSession: () => Promise<{ success: boolean; error?: string }>;
  extendSession: () => Promise<{ success: boolean; error?: string }>;
  invalidateSession: () => Promise<void>;
  checkSessionStatus: () => Promise<void>;
  updateActivity: () => void;
}

/**
 * Session hook return type
 */
export interface UseSessionReturn extends SessionState, SessionActions {}

/**
 * Session configuration
 */
const SESSION_CONFIG = {
  WARNING_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  REFRESH_INTERVAL: 15 * 60 * 1000, // Refresh every 15 minutes
  ACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity
  CHECK_INTERVAL: 60 * 1000, // Check session every minute
};

/**
 * Session management hook
 */
export function useSession(): UseSessionReturn {
  const { isAuthenticated, sessionId, lastActivity, logout } = useAuth();
  
  const [sessionState, setSessionState] = useState<SessionState>({
    sessionInfo: {
      sessionId: null,
      expiresAt: null,
      lastActivity: null,
      isActive: false,
      timeUntilExpiry: null,
      warningThreshold: SESSION_CONFIG.WARNING_THRESHOLD
    },
    isSessionValid: false,
    isSessionExpiring: false,
    isLoading: false,
    error: null
  });

  // Refs for intervals
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update session state
   */
  const updateSessionState = useCallback((updates: Partial<SessionState>) => {
    setSessionState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Calculate time until expiry
   */
  const calculateTimeUntilExpiry = useCallback((expiresAt: Date | null): number | null => {
    if (!expiresAt) return null;
    return Math.max(0, expiresAt.getTime() - Date.now());
  }, []);

  /**
   * Update session info
   */
  const updateSessionInfo = useCallback((sessionData: any) => {
    const expiresAt = sessionData.expiresAt ? new Date(sessionData.expiresAt) : null;
    const timeUntilExpiry = calculateTimeUntilExpiry(expiresAt);
    
    const sessionInfo: SessionInfo = {
      sessionId: sessionData.sessionId || sessionId,
      expiresAt,
      lastActivity: lastActivity,
      isActive: isAuthenticated,
      timeUntilExpiry,
      warningThreshold: SESSION_CONFIG.WARNING_THRESHOLD
    };

    const isSessionExpiring = timeUntilExpiry !== null && timeUntilExpiry <= SESSION_CONFIG.WARNING_THRESHOLD;

    updateSessionState({
      sessionInfo,
      isSessionValid: isAuthenticated && timeUntilExpiry !== null && timeUntilExpiry > 0,
      isSessionExpiring,
      error: null
    });

    // Set up warning timeout if session is expiring soon
    if (isSessionExpiring && warningTimeoutRef.current === null) {
      warningTimeoutRef.current = setTimeout(() => {
        // Trigger session expiry warning
        console.warn('Session expiring soon');
        // You could dispatch a custom event here for UI components to listen to
        window.dispatchEvent(new CustomEvent('sessionExpiring', { 
          detail: { timeUntilExpiry } 
        }));
      }, Math.max(0, timeUntilExpiry - SESSION_CONFIG.WARNING_THRESHOLD));
    }
  }, [sessionId, lastActivity, isAuthenticated, calculateTimeUntilExpiry, updateSessionState]);

  /**
   * Fetch session status from server
   */
  const fetchSessionStatus = useCallback(async (): Promise<any> => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Session validation failed');
      }
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Refresh session
   */
  const refreshSession = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      updateSessionState({ isLoading: true, error: null });

      const sessionData = await fetchSessionStatus();
      updateSessionInfo(sessionData);

      updateSessionState({ isLoading: false });
      return { success: true };
    } catch (error) {
      updateSessionState({
        isLoading: false,
        error: 'Failed to refresh session',
        isSessionValid: false
      });
      return { 
        success: false, 
        error: 'Failed to refresh session' 
      };
    }
  }, [fetchSessionStatus, updateSessionInfo, updateSessionState]);

  /**
   * Extend session
   */
  const extendSession = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/session/extend', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const sessionData = await response.json();
        updateSessionInfo(sessionData);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || 'Failed to extend session' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }, [updateSessionInfo]);

  /**
   * Invalidate session
   */
  const invalidateSession = useCallback(async (): Promise<void> => {
    try {
      await logout();
      
      // Clear session state
      updateSessionState({
        sessionInfo: {
          sessionId: null,
          expiresAt: null,
          lastActivity: null,
          isActive: false,
          timeUntilExpiry: null,
          warningThreshold: SESSION_CONFIG.WARNING_THRESHOLD
        },
        isSessionValid: false,
        isSessionExpiring: false,
        error: null
      });

      // Clear intervals
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
    } catch (error) {
      console.error('Error invalidating session:', error);
    }
  }, [logout, updateSessionState]);

  /**
   * Check session status
   */
  const checkSessionStatus = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      const sessionData = await fetchSessionStatus();
      updateSessionInfo(sessionData);
    } catch (error) {
      console.error('Session check failed:', error);
      // If session check fails, invalidate the session
      await invalidateSession();
    }
  }, [isAuthenticated, fetchSessionStatus, updateSessionInfo, invalidateSession]);

  /**
   * Update activity timestamp
   */
  const updateActivity = useCallback((): void => {
    if (isAuthenticated) {
      updateSessionState({
        sessionInfo: {
          ...sessionState.sessionInfo,
          lastActivity: new Date()
        }
      });
    }
  }, [isAuthenticated, sessionState.sessionInfo, updateSessionState]);

  /**
   * Set up session monitoring when authenticated
   */
  useEffect(() => {
    if (isAuthenticated && sessionId) {
      // Initial session check
      checkSessionStatus();

      // Set up periodic session refresh
      refreshIntervalRef.current = setInterval(() => {
        refreshSession();
      }, SESSION_CONFIG.REFRESH_INTERVAL);

      // Set up periodic session status check
      checkIntervalRef.current = setInterval(() => {
        checkSessionStatus();
      }, SESSION_CONFIG.CHECK_INTERVAL);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      };
    } else {
      // Clear intervals when not authenticated
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }
  }, [isAuthenticated, sessionId, checkSessionStatus, refreshSession]);

  /**
   * Handle session expiry
   */
  useEffect(() => {
    if (sessionState.isSessionExpiring && sessionState.sessionInfo.timeUntilExpiry !== null) {
      if (sessionState.sessionInfo.timeUntilExpiry <= 0) {
        // Session has expired, log out
        invalidateSession();
      }
    }
  }, [sessionState.isSessionExpiring, sessionState.sessionInfo.timeUntilExpiry, invalidateSession]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...sessionState,
    refreshSession,
    extendSession,
    invalidateSession,
    checkSessionStatus,
    updateActivity
  };
}