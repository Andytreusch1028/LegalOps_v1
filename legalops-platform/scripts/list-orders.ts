/**
 * Script to list all orders
 * Usage: npx tsx scripts/list-orders.ts
 */

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function listOrders() {
  try {
    console.log('📋 Fetching all orders...\n');

    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Show last 20 orders
    });

    if (orders.length === 0) {
      console.log('❌ No orders found!');
      console.log('\nCreate a test order at: http://localhost:3000/test-upsells');
      process.exit(0);
    }

    console.log(`Found ${orders.length} order(s):\n`);
    console.log('─'.repeat(100));

    orders.forEach((order, index) => {
      const userName = order.user?.firstName && order.user?.lastName
        ? `${order.user.firstName} ${order.user.lastName}`
        : order.user?.email || 'Unknown User';

      console.log(`\n${index + 1}. Order #${order.orderNumber}`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Customer: ${userName}`);
      console.log(`   Status: ${order.orderStatus} | Payment: ${order.paymentStatus}`);
      console.log(`   Total: $${Number(order.total).toFixed(2)}`);
      console.log(`   Items: ${order.orderItems.length}`);
      console.log(`   Created: ${order.createdAt.toLocaleString()}`);
      
      if (order.paidAt) {
        console.log(`   Paid At: ${order.paidAt.toLocaleString()}`);
      }

      // Show items
      if (order.orderItems.length > 0) {
        console.log(`   Services:`);
        order.orderItems.forEach((item) => {
          const needsData = item.requiresAdditionalData ? '📝' : '✓';
          const collected = item.additionalDataCollected ? '✅' : '⏳';
          console.log(`      ${needsData} ${item.description} - $${Number(item.totalPrice).toFixed(2)} ${item.requiresAdditionalData ? collected : ''}`);
        });
      }

      // Show action links
      if (order.paymentStatus === 'PENDING') {
        console.log(`   🔗 Checkout: http://localhost:3000/checkout/${order.id}`);
      } else if (order.paymentStatus === 'PAID') {
        const hasIncompleteItems = order.orderItems.some(
          (item) => item.requiresAdditionalData && !item.additionalDataCollected
        );
        if (hasIncompleteItems) {
          console.log(`   🔗 Complete Documents: http://localhost:3000/orders/${order.id}/complete-documents`);
        }
      }

      console.log('─'.repeat(100));
    });

    console.log('\n📊 Summary:');
    const pending = orders.filter((o) => o.paymentStatus === 'PENDING').length;
    const paid = orders.filter((o) => o.paymentStatus === 'PAID').length;
    console.log(`   Pending Payment: ${pending}`);
    console.log(`   Paid: ${paid}`);

    console.log('\n💡 Tips:');
    console.log('   • Copy an order ID to mark it as paid:');
    console.log('     npx tsx scripts/mark-order-paid.ts <orderId>');
    console.log('   • Or use Prisma Studio:');
    console.log('     npx prisma studio');

  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listOrders();

