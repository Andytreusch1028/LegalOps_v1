/**
 * Script to list all users
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        userType: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\n💡 Create an account at: http://localhost:3000/checkout/create-account');
    } else {
      console.log(`\n📋 Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Type: ${user.userType}`);
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();

