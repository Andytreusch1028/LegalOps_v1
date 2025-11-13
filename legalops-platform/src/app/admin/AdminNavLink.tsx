/**
 * Admin Navigation Link Component
 * Client component for interactive navigation links
 */

'use client';

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

interface AdminNavLinkProps {
  href: string;
  label: string;
  iconName: string;
}

const iconMap = {
  'LayoutDashboard': LayoutDashboard,
  'Users': Users,
  'Building2': Building2,
  'ShoppingCart': ShoppingCart,
  'AlertTriangle': AlertTriangle,
  'MessageSquare': MessageSquare,
  'FileText': FileText,
  'Settings': Settings,
};

export default function AdminNavLink({ href, label, iconName }: AdminNavLinkProps) {
  const Icon = iconMap[iconName as keyof typeof iconMap];

  return (
    <Link
      href={href}
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
      <span>{label}</span>
    </Link>
  );
}

