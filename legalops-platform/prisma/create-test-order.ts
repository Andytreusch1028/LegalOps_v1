/**
 * Create a test individual service order for testing upsells
 * Run with: npx tsx prisma/create-test-order.ts
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    console.log('🔍 Finding test user...');
    
    // Find the first user in the database
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error('❌ No users found. Please create a user first.');
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.email}`);
    
    // Find LLC Formation service
    console.log('🔍 Finding LLC Formation service...');
    const llcService = await prisma.service.findFirst({
      where: { slug: 'llc-formation' },
    });
    
    if (!llcService) {
      console.error('❌ LLC Formation service not found. Please run seed first.');
      process.exit(1);
    }
    
    console.log(`✅ Found service: ${llcService.name}`);
    
    // Create order
    console.log('📝 Creating test order...');
    const orderNumber = `TEST-${Date.now()}`;
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        subtotal: llcService.totalPrice,
        tax: 0,
        total: llcService.totalPrice,
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        orderItems: {
          create: [
            {
              serviceType: 'LLC_FORMATION',
              description: 'Florida LLC Formation',
              quantity: 1,
              unitPrice: llcService.totalPrice,
              totalPrice: llcService.totalPrice,
            },
          ],
        },
      },
      include: {
        orderItems: true,
      },
    });
    
    console.log('\n✅ Test order created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Order Number: ${order.orderNumber}`);
    console.log(`🆔 Order ID: ${order.id}`);
    console.log(`💰 Total: $${Number(order.total).toFixed(2)}`);
    console.log(`👤 User: ${user.email}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔗 Test the upsells at:');
    console.log(`   http://localhost:3000/checkout/${order.id}`);
    console.log('\n💡 This order has NO package, so upsells will display!');
    
  } catch (error) {
    console.error('❌ Error creating test order:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();

