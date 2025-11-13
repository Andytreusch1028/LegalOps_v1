'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  Mail, 
  Calendar, 
  ShoppingCart, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  userRole?: string;
}

export default function DashboardSidebar({ userRole = 'INDIVIDUAL_CUSTOMER' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard/customer',
      icon: LayoutDashboard,
      roles: ['INDIVIDUAL_CUSTOMER', 'PROFESSIONAL_CUSTOMER']
    },
    {
      name: 'My Businesses',
      href: '/dashboard/businesses',
      icon: Building2,
      roles: ['INDIVIDUAL_CUSTOMER', 'PROFESSIONAL_CUSTOMER']
    },
    {
      name: 'Documents',
      href: '/dashboard/documents',
      icon: FileText,
      roles: ['INDIVIDUAL_CUSTOMER', 'PROFESSIONAL_CUSTOMER']
    },
    {
      name: 'RA Mail',
      href: '/dashboard/ra-mail',
      icon: Mail,
      roles: ['INDIVIDUAL_CUSTOMER', 'PROFESSIONAL_CUSTOMER'],
      badge: 'NEW'
    },
    {
      name: 'Calendar',
      href: '/dashboard/calendar',
      icon: Calendar,
      roles: ['INDIVIDUAL_CUSTOMER', 'PROFESSIONAL_CUSTOMER']
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: ShoppingCart,
      roles: ['INDIVIDUAL_CUSTOMER', 'PROFESSIONAL_CUSTOMER']
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['INDIVIDUAL_CUSTOMER', 'PROFESSIONAL_CUSTOMER']
    }
  ];

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const isActive = (href: string) => {
    if (href === '/dashboard/customer') {
      return pathname === '/dashboard' || pathname === '/dashboard/customer';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col"
        style={{
          width: collapsed ? '80px' : '260px',
          minHeight: '100vh',
          background: 'white',
          borderRight: '1px solid #e2e8f0',
          transition: 'width 0.3s ease',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto'
        }}
      >
        {/* Collapse Toggle Button */}
        <div
          style={{
            padding: collapsed ? '20px 0' : '20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: collapsed ? 'center' : 'flex-end'
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#0ea5e9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            {collapsed ? <ChevronRight size={20} color="#64748b" /> : <ChevronLeft size={20} color="#64748b" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: collapsed ? '20px 0' : '20px', flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href} style={{ marginBottom: '8px' }}>
                  <Link
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: collapsed ? '0' : '12px',
                      padding: collapsed ? '12px 0' : '12px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      background: active ? '#f0f9ff' : 'transparent',
                      color: active ? '#0ea5e9' : '#64748b',
                      fontWeight: active ? '600' : '500',
                      fontSize: '14px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.color = '#0f172a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#64748b';
                      }
                    }}
                  >
                    <Icon size={20} />
                    {!collapsed && (
                      <>
                        <span>{item.name}</span>
                        {item.badge && (
                          <span
                            style={{
                              marginLeft: 'auto',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              background: '#0ea5e9',
                              color: 'white'
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Placeholder for future features */}
        {!collapsed && (
          <div
            style={{
              padding: '20px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#94a3b8'
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#64748b' }}>
              Coming Soon
            </p>
            <p style={{ margin: 0 }}>
              🤖 AI Health Score<br />
              📊 Compliance Insights<br />
              🔔 Smart Reminders
            </p>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          padding: '8px 0',
          zIndex: 50,
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center'
          }}
        >
          {visibleMenuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    textDecoration: 'none',
                    color: active ? '#0ea5e9' : '#64748b',
                    fontSize: '11px',
                    fontWeight: active ? '600' : '500',
                    position: 'relative'
                  }}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ef4444'
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

