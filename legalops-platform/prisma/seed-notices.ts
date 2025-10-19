/**
 * LegalOps v1 - Seed Test Notices
 * 
 * Creates sample notices to test the Important Notices feature
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test notices...');

  // Get the first user
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('❌ No users found. Please run the main seed script first.');
    return;
  }

  console.log(`✅ Found user: ${user.email}`);

  // Get the first filing for this user
  const client = await prisma.client.findFirst({
    where: { userId: user.id },
    include: {
      businessEntities: {
        include: {
          filings: true
        }
      }
    }
  });

  let filing = client?.businessEntities[0]?.filings[0];

  // Delete all existing notices for this user first
  await prisma.notice.deleteMany({
    where: { userId: user.id }
  });
  console.log('✅ Cleared existing notices');

  // Update the filing with staff changes and set status to PENDING_CUSTOMER_APPROVAL
  if (filing) {
    filing = await prisma.filing.update({
      where: { id: filing.id },
      data: {
        filingStatus: 'PENDING_CUSTOMER_APPROVAL',
        requiresApproval: true,
        staffChanges: [
          {
            field: 'registeredAgent.firstName',
            oldValue: 'Jhon',
            newValue: 'John',
            changeType: 'SUBSTANTIVE',
            reason: 'Corrected name spelling - please verify this is correct.',
            changedBy: 'Sarah Johnson (Fulfillment Specialist)',
            changedAt: new Date().toISOString(),
          },
          {
            field: 'principalAddress.street',
            oldValue: '123 Main St',
            newValue: '123 Main Street',
            changeType: 'MINOR',
            reason: 'Standardized address format to match state requirements (spelled out "Street").',
            changedBy: 'Sarah Johnson (Fulfillment Specialist)',
            changedAt: new Date().toISOString(),
          },
        ],
        staffChangeReason: 'Corrected name spelling and standardized address format for state compliance.',
      }
    });
    console.log(`✅ Updated filing with staff changes: ${filing.id}`);
  }

  // Create test notices
  const notices = [
    {
      userId: user.id,
      type: 'APPROVAL_REQUIRED',
      priority: 'URGENT',
      title: 'ACTION REQUIRED: Approve Changes to Annual Report',
      message: 'We made corrections to your filing. Please review and approve before we can submit to the state.',
      filingId: filing?.id,
      actionUrl: filing ? `/dashboard/filings/${filing.id}/approve` : null,
      actionLabel: 'Review & Approve',
    },
    {
      userId: user.id,
      type: 'DOCUMENT_READY',
      priority: 'SUCCESS',
      title: 'DOCUMENT READY: Annual Report Completed',
      message: 'Your filing has been approved by the state. Official document is ready to download.',
      filingId: filing?.id,
      actionUrl: filing ? `/dashboard/filings/${filing.id}` : null,
      actionLabel: 'View Document',
    },
    {
      userId: user.id,
      type: 'PAYMENT_REQUIRED',
      priority: 'URGENT',
      title: 'Payment Required: Complete Your Order',
      message: 'Your filing is ready to submit. Please complete payment to proceed.',
      actionUrl: '/dashboard/billing',
      actionLabel: 'Make Payment',
    },
  ];

  for (const noticeData of notices) {
    const notice = await prisma.notice.create({
      data: noticeData
    });
    console.log(`✅ Created notice: ${notice.title}`);
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding notices:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

