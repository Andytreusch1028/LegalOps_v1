/**
 * Root Layout with Authentication Provider
 * 
 * Wraps the entire application with authentication context and session management.
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SessionExpiryWarning } from '@/components/auth/SessionExpiryWarning';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LegalOps Platform',
  description: 'Florida Business Formation Services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <SessionExpiryWarning />
        </AuthProvider>
      </body>
    </html>
  );
}