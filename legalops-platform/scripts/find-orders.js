const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function findOrders() {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        requiresAdditionalData: true,
        additionalDataCollected: false,
      },
      select: {
        id: true,
        orderId: true,
        serviceType: true,
        dataCollectionFormType: true,
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
      take: 5,
    });

    console.log('Orders with items requiring document completion:');
    console.log(JSON.stringify(orderItems, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findOrders();

