/**
 * LegalOps v1 - Dashboard Router
 *
 * Routes users to the appropriate dashboard based on their role:
 * - INDIVIDUAL_CUSTOMER → /dashboard/customer
 * - PROFESSIONAL_CUSTOMER → /dashboard/professional
 * - FULFILLMENT_STAFF → /dashboard/fulfillment
 * - MANAGER → /dashboard/operations
 * - EXECUTIVE → /dashboard/executive
 * - ADMIN → /admin
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Get user with role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case 'INDIVIDUAL_CUSTOMER':
      redirect('/dashboard/customer');

    case 'PROFESSIONAL_CUSTOMER':
      redirect('/dashboard/professional');

    case 'FULFILLMENT_STAFF':
      redirect('/dashboard/fulfillment');

    case 'MANAGER':
      redirect('/dashboard/operations');

    case 'EXECUTIVE':
      redirect('/dashboard/executive');

    case 'ADMIN':
      redirect('/admin');

    default:
      // Default to customer dashboard
      redirect('/dashboard/customer');
  }
}

