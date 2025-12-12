/**
 * Dashboard Page
 * 
 * Protected page that requires authentication and email verification.
 */

'use client';

import React from 'react';
import { RequireAuth, RequireVerified } from '@/components/auth';
import { useAuth, useProfile, useSession } from '@/hooks/useAuth';
import { SessionStatusIndicator } from '@/components/auth/SessionExpiryWarning';

/**
 * Dashboard content component
 */
function DashboardContent() {
  const { user, logout } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { sessionInfo } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <SessionStatusIndicator />
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        User Information
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        {user?.email}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Session Status
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Active
                      </dd>
                      <dd className="text-sm text-gray-500">
                        Last activity: {sessionInfo.lastActivity?.toLocaleTimeString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Status Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Profile Status
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {profileLoading ? 'Loading...' : (profile ? 'Complete' : 'Incomplete')}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        {user?.emailVerified ? 'Email verified' : 'Email not verified'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors">
                Create New Form
              </button>
              <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
                View Orders
              </button>
              <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors">
                Manage Profile
              </button>
              <button className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors">
                Settings
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

/**
 * Dashboard page with authentication guards
 */
export default function DashboardPage() {
  return (
    <RequireAuth>
      <RequireVerified>
        <DashboardContent />
      </RequireVerified>
    </RequireAuth>
  );
}