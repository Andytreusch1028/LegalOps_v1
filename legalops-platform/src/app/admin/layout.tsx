/**
 * Admin Dashboard Layout
 * Provides navigation sidebar and layout for all admin pages
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Building2, 
  ShoppingCart, 
  AlertTriangle, 
  MessageSquare, 
  FileText,
  LayoutDashboard,
  Settings
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is admin
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/entities', label: 'Business Entities', icon: Building2 },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/risk', label: 'Risk Assessments', icon: AlertTriangle },
    { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { href: '/admin/form-drafts', label: 'Form Drafts', icon: FileText },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        color: 'white',
        padding: '32px 0',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px', marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            margin: 0,
          }}>
            LegalOps Admin
          </h1>
          <p style={{ 
            fontSize: '14px', 
            opacity: 0.9,
            margin: '8px 0 0 0',
          }}>
            {session.user.email}
          </p>
        </div>

        {/* Navigation */}
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 24px',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  fontSize: '15px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderLeft = '4px solid white';
                  e.currentTarget.style.paddingLeft = '20px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderLeft = 'none';
                  e.currentTarget.style.paddingLeft = '24px';
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ 
          position: 'absolute', 
          bottom: '32px', 
          left: '24px', 
          right: '24px' 
        }}>
          <Link
            href="/api/auth/signout"
            style={{
              display: 'block',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '32px',
        overflowY: 'auto',
      }}>
        {children}
      </main>
    </div>
  );
}

