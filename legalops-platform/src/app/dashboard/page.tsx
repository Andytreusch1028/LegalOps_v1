import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      {/* Welcome Header - Professional */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="font-semibold" style={{ fontSize: '36px', color: '#0f172a', marginBottom: '12px' }}>
          Welcome back, {session?.user?.name || "User"}! 👋
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b' }}>
          Here's what's happening with your legal operations today.
        </p>
      </div>

      {/* Quick Stats - Professional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '24px', marginBottom: '48px' }}>
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
              <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Total Orders</p>
              <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>0</p>
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
            borderLeft: '4px solid #10b981'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Active Orders</p>
              <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>0</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Documents</p>
              <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>0</p>
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

        <div
          className="bg-white rounded-xl"
          style={{
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #f59e0b'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Pending Tasks</p>
              <p className="font-bold" style={{ fontSize: '32px', color: '#0f172a' }}>0</p>
            </div>
            <div
              className="flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fef3c7'
              }}
            >
              <svg style={{ width: '28px', height: '28px', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Professional */}
      <div
        className="bg-white rounded-xl"
        style={{
          padding: '32px',
          marginBottom: '48px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}
      >
        <h2 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a', marginBottom: '24px' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '20px' }}>
          <Link
            href="/dashboard/orders/new"
            className="flex items-center rounded-xl transition-all duration-200"
            style={{
              gap: '16px',
              padding: '20px',
              border: '1.5px solid #e2e8f0',
              background: '#ffffff'
            }}
          >
            <div
              className="flex items-center justify-center rounded-lg transition-colors duration-200"
              style={{
                background: '#dbeafe',
                padding: '12px',
                width: '48px',
                height: '48px'
              }}
            >
              <svg style={{ width: '24px', height: '24px', color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold" style={{ fontSize: '15px', color: '#0f172a' }}>New Order</p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Create a new order</p>
            </div>
          </Link>

          <Link
            href="/dashboard/documents/upload"
            className="flex items-center rounded-xl transition-all duration-200"
            style={{
              gap: '16px',
              padding: '20px',
              border: '1.5px solid #e2e8f0',
              background: '#ffffff'
            }}
          >
            <div
              className="flex items-center justify-center rounded-lg transition-colors duration-200"
              style={{
                background: '#ede9fe',
                padding: '12px',
                width: '48px',
                height: '48px'
              }}
            >
              <svg style={{ width: '24px', height: '24px', color: '#7c3aed' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="font-semibold" style={{ fontSize: '15px', color: '#0f172a' }}>Upload Document</p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Add new documents</p>
            </div>
          </Link>

          <Link
            href="/dashboard/users"
            className="flex items-center rounded-xl transition-all duration-200"
            style={{
              gap: '16px',
              padding: '20px',
              border: '1.5px solid #e2e8f0',
              background: '#ffffff'
            }}
          >
            <div
              className="flex items-center justify-center rounded-lg transition-colors duration-200"
              style={{
                background: '#d1fae5',
                padding: '12px',
                width: '48px',
                height: '48px'
              }}
            >
              <svg style={{ width: '24px', height: '24px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold" style={{ fontSize: '15px', color: '#0f172a' }}>Manage Users</p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>View all users</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity - Professional */}
      <div
        className="bg-white rounded-xl"
        style={{
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}
      >
        <h2 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a', marginBottom: '24px' }}>Recent Activity</h2>
        <div className="text-center" style={{ padding: '48px 0' }}>
          <svg
            className="mx-auto"
            style={{ width: '64px', height: '64px', color: '#cbd5e1', marginBottom: '20px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-medium" style={{ fontSize: '18px', color: '#64748b', marginBottom: '8px' }}>No recent activity</p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>Your recent orders and updates will appear here</p>
        </div>
      </div>
    </div>
  );
}

