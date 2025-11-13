/**
 * Script to make a user an admin
 * Usage: npx tsx scripts/make-admin.ts <email>
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: npx tsx scripts/make-admin.ts <email>');
    process.exit(1);
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      
      // List all users
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          role: true,
        },
      });
      
      console.log('\n📋 Available users:');
      allUsers.forEach((u) => {
        console.log(`  - ${u.email} (${u.role})`);
      });
      
      process.exit(1);
    }

    // Update user to admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'ADMIN',
        userType: 'ADMIN',
      },
    });

    console.log(`✅ User ${email} is now an admin!`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   User Type: ${updatedUser.userType}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();

