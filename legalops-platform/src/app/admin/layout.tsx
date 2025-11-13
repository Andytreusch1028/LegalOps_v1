/**
 * Admin Dashboard Layout
 * Provides navigation sidebar and layout for all admin pages
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNavLink from './AdminNavLink';
import SignOutButton from './SignOutButton';

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
    { href: '/admin', label: 'Dashboard', iconName: 'LayoutDashboard' },
    { href: '/admin/customers', label: 'Customers', iconName: 'Users' },
    { href: '/admin/entities', label: 'Business Entities', iconName: 'Building2' },
    { href: '/admin/orders', label: 'Orders', iconName: 'ShoppingCart' },
    { href: '/admin/risk', label: 'Risk Assessments', iconName: 'AlertTriangle' },
    { href: '/admin/feedback', label: 'Feedback', iconName: 'MessageSquare' },
    { href: '/admin/form-drafts', label: 'Form Drafts', iconName: 'FileText' },
    { href: '/admin/settings', label: 'Settings', iconName: 'Settings' },
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
          {navItems.map((item) => (
            <AdminNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              iconName={item.iconName}
            />
          ))}
        </nav>

        {/* Logout */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: '24px',
          right: '24px'
        }}>
          <SignOutButton />
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

