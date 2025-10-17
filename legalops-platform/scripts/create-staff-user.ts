import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createStaffUser() {
  try {
    console.log('🔧 Creating Staff User...\n');

    // User details
    const email = 'staff@legalops.com';
    const password = 'staff123'; // Change this to a secure password
    const name = 'Staff Admin';
    const role = 'SITE_ADMIN'; // Options: USER, PARTNER, EMPLOYEE, SITE_ADMIN

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log(`📧 Email: ${existingUser.email}`);
      console.log(`👤 Name: ${existingUser.name}`);
      console.log(`🔑 Role: ${existingUser.role}`);
      console.log(`\n💡 To update the role, use Prisma Studio at http://localhost:5557`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        emailVerified: new Date(), // Mark as verified
      },
    });

    console.log('✅ Staff user created successfully!\n');
    console.log('📋 User Details:');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔒 Password: ${password}`);
    console.log(`   👤 Name: ${user.name}`);
    console.log(`   🔑 Role: ${user.role}`);
    console.log(`   ✓ Email Verified: Yes`);
    console.log(`\n🚀 You can now sign in at: http://localhost:3001/auth/signin`);
    console.log(`\n📊 Access Staff Dashboard at: http://localhost:3001/dashboard/staff/filings`);

  } catch (error) {
    console.error('❌ Error creating staff user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createStaffUser();

