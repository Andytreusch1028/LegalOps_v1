/**
 * Reset the approval notice to make it visible again
 */

import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Resetting approval notice...\n');

  // Find the approval notice
  const approvalNotice = await prisma.notice.findFirst({
    where: {
      type: 'APPROVAL_REQUIRED',
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!approvalNotice) {
    console.log('❌ No approval notice found');
    return;
  }

  console.log(`Found notice: ${approvalNotice.title}`);
  console.log(`Currently dismissed: ${approvalNotice.isDismissed}`);

  // Un-dismiss it
  const updated = await prisma.notice.update({
    where: { id: approvalNotice.id },
        data: {
      isDismissed: false,
      isRead: false,
    }
  });

  console.log(`\n✅ Notice un-dismissed!`);
  console.log(`Now dismissed: ${updated.isDismissed}`);
  console.log(`\nRefresh your browser to see the "Review & Approve" notice!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

