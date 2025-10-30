/**
 * Script to check order items details
 * Usage: npx tsx scripts/check-order-items.ts <orderId>
 */

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function checkOrderItems(orderId: string) {
  try {
    console.log(`Checking order: ${orderId}\n`);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      console.error('❌ Order not found!');
      process.exit(1);
    }

    console.log(`📋 Order #${order.orderNumber}`);
    console.log(`   Payment Status: ${order.paymentStatus}`);
    console.log(`   Total Items: ${order.orderItems.length}\n`);

    console.log('─'.repeat(100));
    console.log('ORDER ITEMS DETAILS:\n');

    order.orderItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.description}`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Service Type: ${item.serviceType}`);
      console.log(`   Price: $${Number(item.totalPrice).toFixed(2)}`);
      console.log(`   Requires Additional Data: ${item.requiresAdditionalData ? '✅ YES' : '❌ NO'}`);
      console.log(`   Data Collection Form Type: ${item.dataCollectionFormType || 'None'}`);
      console.log(`   Additional Data Collected: ${item.additionalDataCollected ? '✅ YES' : '❌ NO'}`);
      console.log(`   Additional Data: ${item.additionalData ? JSON.stringify(item.additionalData, null, 2) : 'None'}`);
      console.log('─'.repeat(100));
    });

    // Summary
    const needsData = order.orderItems.filter(i => i.requiresAdditionalData && !i.additionalDataCollected);
    console.log(`\n📊 Summary:`);
    console.log(`   Items requiring data: ${order.orderItems.filter(i => i.requiresAdditionalData).length}`);
    console.log(`   Items with data collected: ${order.orderItems.filter(i => i.additionalDataCollected).length}`);
    console.log(`   Items still needing data: ${needsData.length}`);

    if (needsData.length > 0) {
      console.log(`\n⚠️  These items need data collection:`);
      needsData.forEach(item => {
        console.log(`   • ${item.description} (${item.dataCollectionFormType})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const orderId = process.argv[2];

if (!orderId) {
  console.error('❌ Please provide an order ID!');
  console.log('\nUsage:');
  console.log('  npx tsx scripts/check-order-items.ts <orderId>');
  process.exit(1);
}

checkOrderItems(orderId);

