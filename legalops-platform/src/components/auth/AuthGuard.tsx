/**
 * Authentication Guard Components
 * 
 * Provides route protection and authentication checks including:
 * - RequireAuth - Requires user to be authenticated
 * - RequireAdmin - Requires user to be admin
 * - RequireVerified - Requires email verification
 * - GuestOnly - Only allows unauthenticated users
 */

'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Base auth guard props
 */
interface BaseAuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Loading component
 */
function AuthLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Checking authentication...</span>
    </div>
  );
}

/**
 * Unauthorized access component
 */
function UnauthorizedAccess({ message = "You don't have permission to access this page." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl text-red-500 mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">{message}</p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

/**
 * Require Authentication Guard
 * Redirects to login if user is not authenticated
 */
export function RequireAuth({ 
  children, 
  fallback, 
  redirectTo = '/auth/login' 
}: BaseAuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShouldRedirect(true);
      // Store the current path for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      
      // Redirect after a short delay to avoid hydration issues
      setTimeout(() => {
        router.push(redirectTo);
      }, 100);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return fallback || <AuthLoadingSpinner />;
  }

  if (!isAuthenticated || shouldRedirect) {
    return fallback || <AuthLoadingSpinner />;
  }

  return <>{children}</>;
}

/**
 * Require Admin Guard
 * Requires user to be authenticated and have admin role
 */
export function RequireAdmin({ 
  children, 
  fallback, 
  redirectTo = '/dashboard' 
}: BaseAuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setShouldRedirect(true);
        const currentPath = window.location.pathname + window.location.search;
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 100);
      } else if (!isAdmin) {
        setShouldRedirect(true);
        setTimeout(() => {
          router.push(redirectTo);
        }, 100);
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router, redirectTo]);

  if (isLoading) {
    return fallback || <AuthLoadingSpinner />;
  }

  if (!isAuthenticated || shouldRedirect) {
    return fallback || <AuthLoadingSpinner />;
  }

  if (!isAdmin) {
    return fallback || <UnauthorizedAccess message="Admin access required." />;
  }

  return <>{children}</>;
}

/**
 * Require Email Verification Guard
 * Requires user to have verified their email address
 */
export function RequireVerified({ 
  children, 
  fallback, 
  redirectTo = '/auth/verify-email' 
}: BaseAuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const isVerified = user?.emailVerified === true;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setShouldRedirect(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 100);
      } else if (!isVerified) {
        setShouldRedirect(true);
        setTimeout(() => {
          router.push(redirectTo);
        }, 100);
      }
    }
  }, [isAuthenticated, isVerified, isLoading, router, redirectTo]);

  if (isLoading) {
    return fallback || <AuthLoadingSpinner />;
  }

  if (!isAuthenticated || shouldRedirect) {
    return fallback || <AuthLoadingSpinner />;
  }

  if (!isVerified) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl text-yellow-500 mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verification Required</h1>
          <p className="text-gray-600 mb-4">Please verify your email address to continue.</p>
          <button
            onClick={() => router.push(redirectTo)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Verify Email
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Guest Only Guard
 * Only allows unauthenticated users (for login/register pages)
 */
export function GuestOnly({ 
  children, 
  fallback, 
  redirectTo = '/dashboard' 
}: BaseAuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setShouldRedirect(true);
      // Check if there's a stored redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      const targetPath = redirectPath || redirectTo;
      
      // Clear the stored redirect path
      sessionStorage.removeItem('redirectAfterLogin');
      
      setTimeout(() => {
        router.push(targetPath);
      }, 100);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return fallback || <AuthLoadingSpinner />;
  }

  if (isAuthenticated || shouldRedirect) {
    return fallback || <AuthLoadingSpinner />;
  }

  return <>{children}</>;
}

/**
 * Conditional Auth Guard
 * Shows different content based on authentication status
 */
interface ConditionalAuthProps {
  authenticated: ReactNode;
  unauthenticated: ReactNode;
  loading?: ReactNode;
}

export function ConditionalAuth({ 
  authenticated, 
  unauthenticated, 
  loading 
}: ConditionalAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <>{loading || <AuthLoadingSpinner />}</>;
  }

  return <>{isAuthenticated ? authenticated : unauthenticated}</>;
}

/**
 * Role-based Guard
 * Shows content based on user role
 */
interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  if (!isAuthenticated) {
    return fallback || <UnauthorizedAccess message="Authentication required." />;
  }

  const userRole = user?.role;
  const hasPermission = userRole && allowedRoles.includes(userRole);

  if (!hasPermission) {
    return fallback || <UnauthorizedAccess message="Insufficient permissions." />;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for route protection
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    requireVerified?: boolean;
    guestOnly?: boolean;
    allowedRoles?: string[];
  } = {}
) {
  const {
    requireAuth = true,
    requireAdmin = false,
    requireVerified = false,
    guestOnly = false,
    allowedRoles = []
  } = options;

  return function AuthenticatedComponent(props: P) {
    if (guestOnly) {
      return (
        <GuestOnly>
          <Component {...props} />
        </GuestOnly>
      );
    }

    if (requireAdmin) {
      return (
        <RequireAdmin>
          <Component {...props} />
        </RequireAdmin>
      );
    }

    if (allowedRoles.length > 0) {
      return (
        <RoleGuard allowedRoles={allowedRoles}>
          <Component {...props} />
        </RoleGuard>
      );
    }

    if (requireVerified) {
      return (
        <RequireVerified>
          <RequireAuth>
            <Component {...props} />
          </RequireAuth>
        </RequireVerified>
      );
    }

    if (requireAuth) {
      return (
        <RequireAuth>
          <Component {...props} />
        </RequireAuth>
      );
    }

    return <Component {...props} />;
  };
}