import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createCustomer() {
  const email = 'customer@example.com';
  const password = 'password123';
  
  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email }
  });
  
  if (existing) {
    console.log('❌ User already exists:', email);
    console.log('   Updating to INDIVIDUAL_CUSTOMER role...');
    
    const updated = await prisma.user.update({
      where: { email },
      data: {
        role: 'INDIVIDUAL_CUSTOMER',
        userType: 'CUSTOMER'
      }
    });
    
    console.log('✅ User updated:', updated.email);
    console.log('   Role:', updated.role);
    console.log('   UserType:', updated.userType);
  } else {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create new customer user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: 'Test',
        lastName: 'Customer',
        phone: '(555) 123-4567',
        userType: 'CUSTOMER',
        role: 'INDIVIDUAL_CUSTOMER',
        isActive: true
      }
    });
    
    console.log('✅ Customer created successfully!');
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   UserType:', user.userType);
  }
  
  console.log('\n🔐 You can now sign in with:');
  console.log('   Email: customer@example.com');
  console.log('   Password: password123');
  
  await prisma.$disconnect();
}

createCustomer().catch(console.error);

