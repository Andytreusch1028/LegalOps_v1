/**
 * LegalOps v1 - My Businesses Page
 * 
 * Portfolio view showing all businesses owned by the user
 * Grid/card layout with key information and quick actions
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@/generated/prisma';
import MyBusinessesClient from '@/components/MyBusinessesClient';
import { calculateHealthScore } from '@/lib/healthScore';

const prisma = new PrismaClient();

export default async function MyBusinessesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch all businesses for this user
  const businesses = await prisma.businessEntity.findMany({
    where: {
      client: {
        userId: session.user.id
      }
    },
    include: {
      client: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      },
      addresses: {
        where: {
          addressType: 'PRINCIPAL'
        },
        take: 1
      },
      registeredAgent: {
        select: {
          id: true,
          agentType: true,
          firstName: true,
          lastName: true,
          companyName: true
        }
      },
      filings: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1 // Most recent filing
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate health scores for all businesses
  const businessesWithHealth = await Promise.all(
    businesses.map(async (business) => {
      try {
        const healthData = await calculateHealthScore(business.id);
        return {
          ...business,
          healthScore: healthData.totalScore,
          healthBreakdown: healthData
        };
      } catch (error) {
        console.error(`Failed to calculate health score for ${business.id}:`, error);
        return {
          ...business,
          healthScore: null,
          healthBreakdown: null
        };
      }
    })
  );

  return <MyBusinessesClient businesses={businessesWithHealth} />;
}

