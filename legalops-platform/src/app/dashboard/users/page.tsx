'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

interface DatabaseStats {
  totalUsers: number;
  totalOrders: number;
  totalDocuments: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    connection: string;
    statistics: DatabaseStats;
    users: User[];
  };
  timestamp: string;
}

export default function UsersPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-db');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    try {
      setCreating(true);
      const response = await fetch('/api/test-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `user-${Date.now()}@example.com`,
          name: `Test User ${new Date().toLocaleTimeString()}`,
        }),
      });

      if (response.ok) {
        // Refresh the user list
        await fetchUsers();
      }
    } catch (err) {
      console.error('Failed to create user:', err);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div
            className="mx-auto rounded-full animate-spin"
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e2e8f0',
              borderTopColor: '#0ea5e9'
            }}
          />
          <p className="font-medium" style={{ marginTop: '16px', fontSize: '14px', color: '#64748b' }}>
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div
          className="bg-white rounded-xl"
          style={{
            padding: '32px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}
        >
          <h2 className="font-semibold" style={{ fontSize: '24px', color: '#ef4444', marginBottom: '16px' }}>
            Error
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={fetchUsers}
            className="font-semibold transition-all duration-200"
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              color: '#ffffff',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="font-semibold" style={{ fontSize: '36px', color: '#0f172a', marginBottom: '12px' }}>
          User Management
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b' }}>
          Manage users and view system statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '24px', marginBottom: '48px' }}>
        <div
          className="bg-white rounded-xl"
          style={{
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #0ea5e9'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                Total Users
              </p>
              <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>
                {data?.data.statistics.totalUsers || 0}
              </p>
            </div>
            <div
              className="flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#dbeafe'
              }}
            >
              <svg style={{ width: '28px', height: '28px', color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-xl"
          style={{
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #10b981'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                Total Orders
              </p>
              <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>
                {data?.data.statistics.totalOrders || 0}
              </p>
            </div>
            <div
              className="flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#d1fae5'
              }}
            >
              <svg style={{ width: '28px', height: '28px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-xl"
          style={{
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #8b5cf6'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                Total Documents
              </p>
              <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>
                {data?.data.statistics.totalDocuments || 0}
              </p>
            </div>
            <div
              className="flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ede9fe'
              }}
            >
              <svg style={{ width: '28px', height: '28px', color: '#7c3aed' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex" style={{ gap: '16px', marginBottom: '32px' }}>
        <button
          onClick={createTestUser}
          disabled={creating}
          className="font-semibold transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            gap: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            color: '#ffffff',
            background: creating ? '#94a3b8' : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            borderRadius: '8px',
            border: 'none',
            cursor: creating ? 'not-allowed' : 'pointer',
            boxShadow: creating ? 'none' : '0 2px 8px rgba(14, 165, 233, 0.25)'
          }}
        >
          {creating ? (
            <>
              <div
                className="rounded-full animate-spin"
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent'
                }}
              />
              Creating...
            </>
          ) : (
            <>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Test User
            </>
          )}
        </button>

        <button
          onClick={fetchUsers}
          className="font-semibold transition-all duration-200 flex items-center"
          style={{
            gap: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            color: '#475569',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            cursor: 'pointer'
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Users Table */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a' }}>
            All Users
          </h2>
        </div>

        {data?.data.users.length === 0 ? (
          <div className="text-center" style={{ padding: '64px 32px' }}>
            <svg
              className="mx-auto"
              style={{ width: '64px', height: '64px', color: '#cbd5e1', marginBottom: '20px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="font-medium" style={{ fontSize: '18px', color: '#64748b', marginBottom: '8px' }}>
              No users yet
            </p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              Click "Add Test User" to create your first user
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th className="font-medium text-left" style={{ padding: '12px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Name
                  </th>
                  <th className="font-medium text-left" style={{ padding: '12px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Email
                  </th>
                  <th className="font-medium text-left" style={{ padding: '12px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Role
                  </th>
                  <th className="font-medium text-left" style={{ padding: '12px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Created
                  </th>
                  <th className="font-medium text-left" style={{ padding: '12px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white" style={{ borderTop: '1px solid #e2e8f0' }}>
                {data?.data.users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="transition-colors duration-150"
                    style={{
                      borderBottom: index < data.data.users.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div className="font-medium" style={{ fontSize: '14px', color: '#0f172a' }}>
                        {user.name || 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '14px', color: '#0f172a' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span
                        className="font-semibold inline-flex"
                        style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          borderRadius: '9999px',
                          background: '#d1fae5',
                          color: '#065f46'
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <code
                        style={{
                          fontSize: '12px',
                          color: '#64748b',
                          background: '#f1f5f9',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {user.id.substring(0, 12)}...
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center" style={{ marginTop: '32px' }}>
        <p style={{ fontSize: '13px', color: '#94a3b8' }}>
          Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}
        </p>
      </div>
    </div>
  );
}

