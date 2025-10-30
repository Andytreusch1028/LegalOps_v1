/**
 * Script to mark an order as PAID
 * Usage: npx tsx scripts/mark-order-paid.ts <orderId>
 */

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function markOrderAsPaid(orderId: string) {
  try {
    console.log(`Looking for order: ${orderId}`);

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      console.error('❌ Order not found!');
      console.log('\nTip: Get the order ID from the checkout URL:');
      console.log('http://localhost:3000/checkout/[ORDER_ID_HERE]');
      process.exit(1);
    }

    console.log('\n📋 Order Details:');
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Current Status: ${order.paymentStatus}`);
    console.log(`   Total: $${Number(order.total).toFixed(2)}`);
    console.log(`   Items: ${order.orderItems.length}`);

    if (order.paymentStatus === 'PAID') {
      console.log('\n✅ Order is already marked as PAID!');
      console.log(`   Paid At: ${order.paidAt}`);
      process.exit(0);
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    });

    console.log('\n✅ Order successfully marked as PAID!');
    console.log(`   Payment Status: ${updatedOrder.paymentStatus}`);
    console.log(`   Paid At: ${updatedOrder.paidAt}`);
    console.log('\n🎯 Next Step:');
    console.log(`   Go to: http://localhost:3000/orders/${orderId}/complete-documents`);
  } catch (error) {
    console.error('❌ Error updating order:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get order ID from command line arguments
const orderId = process.argv[2];

if (!orderId) {
  console.error('❌ Please provide an order ID!');
  console.log('\nUsage:');
  console.log('  npx tsx scripts/mark-order-paid.ts <orderId>');
  console.log('\nExample:');
  console.log('  npx tsx scripts/mark-order-paid.ts clxxx123456789');
  console.log('\nTip: Get the order ID from the checkout URL:');
  console.log('  http://localhost:3000/checkout/[ORDER_ID_HERE]');
  process.exit(1);
}

markOrderAsPaid(orderId);

