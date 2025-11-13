/**
 * LegalOps v1 - Individual Customer Dashboard
 * 
 * Dashboard for individual customers managing their own businesses.
 * Shows: My Businesses, Quick Stats, Popular Services, Recent Activity
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@/generated/prisma';
import DashboardClient from '@/components/DashboardClient';
import { calculateHealthScore } from '@/lib/healthScore';

const prisma = new PrismaClient();

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch all dashboard data in parallel
  const [user, businesses, orders, formDrafts, recentOrders, recentDrafts, recentBusinesses] = await Promise.all([
    // Get user details
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        email: true
      }
    }),
    // Get user's businesses
    prisma.businessEntity.findMany({
      where: {
        client: {
          userId: session.user.id
        }
      },
      select: {
        id: true,
        legalName: true,
        documentNumber: true,
        entityType: true,
        status: true,
        filingDate: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),

    // Get pending orders
    prisma.order.findMany({
      where: {
        userId: session.user.id,
        orderStatus: {
          in: ['PENDING', 'PROCESSING']
        }
      },
      select: {
        id: true,
        orderStatus: true,
        createdAt: true
      }
    }),

    // Get incomplete filings (form drafts)
    prisma.formDraft.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        formType: true,
        currentStep: true,
        totalSteps: true,
        displayName: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    }),

    // Get recent orders for activity feed
    prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        total: true,
        createdAt: true,
        orderItems: {
          select: {
            serviceType: true,
            description: true,
            additionalData: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    }),

    // Get recent form drafts for activity feed
    prisma.formDraft.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        formType: true,
        displayName: true,
        currentStep: true,
        totalSteps: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    }),

    // Get recent businesses for activity feed
    prisma.businessEntity.findMany({
      where: {
        client: {
          userId: session.user.id
        }
      },
      select: {
        id: true,
        legalName: true,
        entityType: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })
  ]);

  await prisma.$disconnect();

  // Calculate health scores for all businesses and count pending actions
  const healthScoresAndActions = await Promise.all(
    businesses.map(async (business) => {
      const fullBusiness = await prisma.businessEntity.findUnique({
        where: { id: business.id },
        include: {
          registeredAgent: true,
          managersOfficers: true
        }
      });
      if (!fullBusiness) return { score: null, actions: 0 };

      const healthScore = calculateHealthScore(fullBusiness);

      // Count pending actions for this business
      let businessActions = 0;

      // Check compliance factors for critical issues
      if (healthScore.compliance?.factors) {
        healthScore.compliance.factors.forEach((factor: any) => {
          if (factor.status === 'critical') {
            businessActions++; // Overdue annual report, dissolved, etc.
          }
        });
      }

      // Check document factors for missing critical documents
      if (healthScore.documents?.factors) {
        healthScore.documents.factors.forEach((factor: any) => {
          if (factor.status === 'critical') {
            businessActions++; // Missing EIN, etc.
          }
        });
      }

      return { score: healthScore.totalScore, actions: businessActions };
    })
  );

  // Calculate average health score
  const validScores = healthScoresAndActions
    .map(item => item.score)
    .filter((score): score is number => score !== null);
  const averageHealthScore = validScores.length > 0
    ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    : null;

  // Count total pending actions (things customer needs to do)
  const pendingActions =
    healthScoresAndActions.reduce((sum, item) => sum + item.actions, 0) + // Critical health issues
    formDrafts.length; // Incomplete form drafts

  // Calculate stats
  const stats = {
    activeBusinesses: businesses.filter(b => b.status === 'ACTIVE').length,
    pendingOrders: orders.length,
    documents: 0, // TODO: Implement when Document model is created
    incompleteFiling: formDrafts.length
  };

  // Combine and format recent activity
  type Activity = {
    id: string;
    type: 'order' | 'draft' | 'business';
    action: string;
    description: string;
    subtitle?: string;
    thirdLine?: string;
    metadata?: string;
    timestamp: Date;
  };

  const activities: Activity[] = [
    // Orders
    ...recentOrders.map(order => {
      // Get a user-friendly description from the service type
      let serviceName = 'Order';
      let subtitle = '';
      let thirdLine = '';

      if (order.orderItems.length > 0) {
        const item = order.orderItems[0];
        const serviceType = item.serviceType;

        // Convert service type to readable format with consistent terminology
        if (serviceType === 'FICTITIOUS_NAME_REGISTRATION') {
          serviceName = 'Fictitious Name (DBA)';
        } else {
          serviceName = serviceType
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
        }

        // Try to extract business/fictitious name from additionalData
        if (item.additionalData && typeof item.additionalData === 'object') {
          const data = item.additionalData as any;

          // For fictitious name registrations - show entity name and DBA name separately
          if (serviceType === 'FICTITIOUS_NAME_REGISTRATION') {
            // Line 2: Show the business entity that will use the DBA
            if (data.businessEntityOwners && data.businessEntityOwners.length > 0) {
              subtitle = `for ${data.businessEntityOwners[0].entityName}`;
            } else if (data.individualOwners && data.individualOwners.length > 0) {
              const owner = data.individualOwners[0];
              subtitle = `for ${owner.firstName} ${owner.lastName}`;
            } else {
              subtitle = 'for [Business name not assigned]';
            }

            // Line 3: Show the DBA name if it exists
            if (data.fictitiousName) {
              thirdLine = `doing business as ${data.fictitiousName}`;
            }
          }
          // For LLC/Corp formations
          else if (data.legalName) {
            subtitle = `for ${data.legalName}`;
          }
          // For other services with business name
          else if (data.businessName) {
            subtitle = `for ${data.businessName}`;
          }
        }
      }

      return {
        id: order.id,
        type: 'order' as const,
        action: order.orderStatus === 'COMPLETED' ? 'Order completed' : 'Order created',
        description: serviceName,
        subtitle: subtitle || undefined,
        thirdLine: thirdLine || undefined,
        metadata: `$${Number(order.total).toFixed(2)}`,
        timestamp: order.createdAt
      };
    }),
    // Form drafts
    ...recentDrafts.map(draft => {
      const formName = draft.displayName || draft.formType.replace(/_/g, ' ');
      const progress = draft.totalSteps ? `Step ${draft.currentStep} of ${draft.totalSteps}` : 'In progress';

      return {
        id: draft.id,
        type: 'draft' as const,
        action: 'Draft saved',
        description: formName,
        metadata: progress,
        timestamp: draft.updatedAt
      };
    }),
    // Businesses
    ...recentBusinesses.map(business => {
      const entityType = business.entityType
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());

      return {
        id: business.id,
        type: 'business' as const,
        action: 'Business added',
        description: business.legalName,
        metadata: entityType,
        timestamp: business.createdAt
      };
    })
  ];

  // Sort by timestamp (most recent first) and take top 5
  const recentActivity = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  return (
    <DashboardClient
      businesses={businesses}
      stats={stats}
      recentActivity={recentActivity}
      userName={user?.firstName || user?.email?.split('@')[0] || 'there'}
      averageHealthScore={averageHealthScore}
      pendingActions={pendingActions}
    />
  );
}

