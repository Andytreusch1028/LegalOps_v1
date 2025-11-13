import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import NoticesBadge from "@/components/NoticesBadge";
import UserInfo from "@/components/UserInfo";
import DashboardSidebar from "@/components/DashboardSidebar";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Get user role for sidebar
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  await prisma.$disconnect();

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Top Navigation Bar - Professional */}
      <nav
        className="bg-white"
        style={{
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div className="flex justify-between" style={{ height: '72px' }}>
            {/* Left side - Logo and Nav */}
            <div className="flex" style={{ gap: '48px' }}>
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/dashboard" className="flex items-center" style={{ gap: '12px' }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <span className="font-semibold" style={{ fontSize: '20px', color: '#0f172a' }}>
                    LegalOps
                  </span>
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden sm:flex items-center" style={{ gap: '32px' }}>
                <Link
                  href="/dashboard"
                  className="font-medium transition-colors duration-200"
                  style={{ fontSize: '14px', color: '#64748b' }}
                >
                  Dashboard
                </Link>
                <NoticesBadge />
                <Link
                  href="/dashboard/users"
                  className="font-medium transition-colors duration-200"
                  style={{ fontSize: '14px', color: '#64748b' }}
                >
                  Users
                </Link>
                <Link
                  href="/dashboard/orders"
                  className="font-medium transition-colors duration-200"
                  style={{ fontSize: '14px', color: '#64748b' }}
                >
                  Orders
                </Link>
                <Link
                  href="/dashboard/documents"
                  className="font-medium transition-colors duration-200"
                  style={{ fontSize: '14px', color: '#64748b' }}
                >
                  Documents
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="font-medium transition-colors duration-200"
                  style={{ fontSize: '14px', color: '#64748b' }}
                >
                  Settings
                </Link>
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center" style={{ gap: '20px' }}>
              {/* User info */}
              <UserInfo userName={session.user?.name || "User"} />

              {/* User avatar */}
              <Link href="/dashboard/profile">
                <div
                  className="flex items-center justify-center font-bold text-white transition-all duration-200 cursor-pointer"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)'
                  }}
                >
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </Link>

              {/* Sign out button */}
              <Link
                href="/api/auth/signout"
                className="font-medium transition-all duration-200"
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  color: '#475569',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout with Sidebar */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)' }}>
        {/* Left Sidebar */}
        <DashboardSidebar userRole={user?.role || 'INDIVIDUAL_CUSTOMER'} />

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '48px 24px 80px 24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer
        className="bg-white"
        style={{
          borderTop: '1px solid #e2e8f0',
          marginTop: 'auto'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
          <p className="text-center" style={{ fontSize: '14px', color: '#94a3b8' }}>
            © 2025 LegalOps. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

