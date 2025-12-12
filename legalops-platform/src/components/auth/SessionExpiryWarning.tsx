/**
 * Session Expiry Warning Component
 * 
 * Shows a warning when the user's session is about to expire
 * and provides options to extend the session or logout.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Session expiry warning props
 */
interface SessionExpiryWarningProps {
  className?: string;
}

/**
 * Format time remaining
 */
function formatTimeRemaining(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Session expiry warning component
 */
export function SessionExpiryWarning({ className = '' }: SessionExpiryWarningProps) {
  const { isAuthenticated, logout } = useAuth();
  const { sessionInfo, isSessionExpiring, extendSession } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  /**
   * Handle session extension
   */
  const handleExtendSession = useCallback(async () => {
    setIsExtending(true);
    try {
      const result = await extendSession();
      if (result.success) {
        setIsVisible(false);
      } else {
        console.error('Failed to extend session:', result.error);
      }
    } catch (error) {
      console.error('Error extending session:', error);
    } finally {
      setIsExtending(false);
    }
  }, [extendSession]);

  /**
   * Handle logout
   */
  const handleLogout = useCallback(async () => {
    await logout();
    setIsVisible(false);
  }, [logout]);

  /**
   * Update time remaining
   */
  useEffect(() => {
    if (isSessionExpiring && sessionInfo.timeUntilExpiry !== null) {
      setTimeRemaining(sessionInfo.timeUntilExpiry);
      setIsVisible(true);

      const interval = setInterval(() => {
        const remaining = sessionInfo.timeUntilExpiry;
        if (remaining !== null && remaining > 0) {
          setTimeRemaining(remaining);
        } else {
          setTimeRemaining(0);
          setIsVisible(false);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setIsVisible(false);
      setTimeRemaining(null);
    }
  }, [isSessionExpiring, sessionInfo.timeUntilExpiry]);

  /**
   * Listen for session expiring events
   */
  useEffect(() => {
    const handleSessionExpiring = (event: CustomEvent) => {
      setIsVisible(true);
      setTimeRemaining(event.detail.timeUntilExpiry);
    };

    window.addEventListener('sessionExpiring', handleSessionExpiring as EventListener);
    
    return () => {
      window.removeEventListener('sessionExpiring', handleSessionExpiring as EventListener);
    };
  }, []);

  /**
   * Don't show if not authenticated or not visible
   */
  if (!isAuthenticated || !isVisible || timeRemaining === null || timeRemaining <= 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Session Expiring Soon
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Your session will expire in{' '}
                <span className="font-semibold">
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </p>
              <p className="mt-1">
                Would you like to extend your session?
              </p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                type="button"
                onClick={handleExtendSession}
                disabled={isExtending}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExtending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-800" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Extending...
                  </>
                ) : (
                  'Extend Session'
                )}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="inline-flex text-yellow-400 hover:text-yellow-600 focus:outline-none focus:text-yellow-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Session status indicator component
 */
export function SessionStatusIndicator({ className = '' }: { className?: string }) {
  const { isAuthenticated } = useAuth();
  const { sessionInfo, isSessionValid, isSessionExpiring } = useSession();

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = () => {
    if (!isSessionValid) return 'bg-red-500';
    if (isSessionExpiring) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isSessionValid) return 'Session Invalid';
    if (isSessionExpiring) return 'Session Expiring';
    return 'Session Active';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-xs text-gray-600">{getStatusText()}</span>
      {sessionInfo.timeUntilExpiry && (
        <span className="text-xs text-gray-500">
          ({formatTimeRemaining(sessionInfo.timeUntilExpiry)})
        </span>
      )}
    </div>
  );
}