/**
 * Script to reset a user's password
 * Usage: npx tsx scripts/reset-password.ts <email> <new-password>
 */

import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('❌ Please provide email and new password');
    console.log('Usage: npx tsx scripts/reset-password.ts <email> <new-password>');
    process.exit(1);
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
      },
    });

    console.log(`✅ Password reset successful for ${email}`);
    console.log(`   New password: ${newPassword}`);
    console.log(`\n🔐 You can now sign in with:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();

