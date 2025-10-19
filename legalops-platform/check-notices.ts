/**
 * Check what notices exist in the database
 */

import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking notices in database...\n');

  const notices = await prisma.notice.findMany({
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`Found ${notices.length} total notices:\n`);

  notices.forEach((notice, index) => {
    console.log(`${index + 1}. ${notice.title}`);
    console.log(`   User: ${notice.user.email}`);
    console.log(`   Type: ${notice.type}`);
    console.log(`   Priority: ${notice.priority}`);
    console.log(`   Dismissed: ${notice.isDismissed}`);
    console.log(`   Action: ${notice.actionLabel || 'None'}`);
    console.log(`   Created: ${notice.createdAt}`);
    console.log('');
  });

  // Check non-dismissed notices
  const activeNotices = notices.filter(n => !n.isDismissed);
  console.log(`\n📌 Active (non-dismissed) notices: ${activeNotices.length}`);
  activeNotices.forEach((notice) => {
    console.log(`   - ${notice.title} (${notice.actionLabel})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

