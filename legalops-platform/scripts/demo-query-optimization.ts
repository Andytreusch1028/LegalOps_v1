/**
 * Query Optimization Demo Script
 * 
 * Demonstrates the performance improvements from database query optimizations:
 * - Index usage
 * - Select optimization
 * - N+1 query elimination
 * - Cursor-based pagination
 */

import { PrismaClient } from '@/generated/prisma';
import { ConsoleLogger } from '@/lib/logging/console-logger';
import { OptimizedQueryService } from '@/lib/services/optimized-query.service';
import { QueryPerformanceLogger, createQueryPerformanceLogger } from '@/lib/utils/query-performance';

const prisma = new PrismaClient();
const logger = new ConsoleLogger();
const performanceLogger = createQueryPerformanceLogger(logger);
const optimizedService = new OptimizedQueryService(prisma, logger);

/**
 * Demo: Unoptimized vs Optimized Order Queries
 */
async function demoOrderQueries() {
  console.log('\n🔍 Demo: Order Query Optimization\n');

  // 1. Unoptimized: Fetch all fields (SELECT *)
  console.log('❌ UNOPTIMIZED: Fetching all fields');
  await performanceLogger.measureQuery(
    'unoptimized-orders-all-fields',
    async () => {
      return await prisma.order.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' }
      });
    }
  );

  // 2. Optimized: Fetch only needed fields (SELECT specific)
  console.log('\n✅ OPTIMIZED: Fetching only needed fields');
  await optimizedService.getOrderSummaries(undefined, 50);

  // 3. Unoptimized: N+1 query pattern
  console.log('\n❌ UNOPTIMIZED: N+1 query pattern');
  await performanceLogger.measureQuery(
    'unoptimized-n-plus-one',
    async () => {
      const orders = await prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      });

      // This creates N+1 queries (1 for orders + N for each order's items)
      for (const order of orders) {
        await prisma.orderItem.findMany({
          where: { orderId: order.id }
        });
      }

      return orders;
    }
  );

  // 4. Optimized: Single query with include
  console.log('\n✅ OPTIMIZED: Single query with include');
  await performanceLogger.measureQuery(
    'optimized-with-include',
    async () => {
      return await prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
    }
  );
}

/**
 * Demo: Pagination Performance
 */
async function demoPagination() {
  console.log('\n📄 Demo: Pagination Performance\n');

  // 1. Unoptimized: Offset-based pagination (OFFSET/LIMIT)
  console.log('❌ UNOPTIMIZED: Offset-based pagination (page 100)');
  await performanceLogger.measureQuery(
    'unoptimized-offset-pagination',
    async () => {
      const page = 100;
      const limit = 20;
      const offset = (page - 1) * limit;

      return await prisma.order.findMany({
        skip: offset, // This gets slower as offset increases
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
    }
  );

  // 2. Optimized: Cursor-based pagination
  console.log('\n✅ OPTIMIZED: Cursor-based pagination');
  
  // First, get a cursor from somewhere in the middle
  const sampleOrders = await prisma.order.findMany({
    take: 1000,
    orderBy: { createdAt: 'desc' }
  });
  const cursor = sampleOrders[999]?.id; // Use the 1000th order as cursor

  if (cursor) {
    await optimizedService.getOrdersPaginated(cursor, 20);
  }
}

/**
 * Demo: Index Usage
 */
async function demoIndexUsage() {
  console.log('\n🗂️  Demo: Index Usage\n');

  // 1. Query using indexed field (userId)
  console.log('✅ INDEXED: Query by userId (has index)');
  await performanceLogger.measureQuery(
    'indexed-user-query',
    async () => {
      return await prisma.order.findMany({
        where: { userId: 'sample-user-id' },
        take: 50
      });
    }
  );

  // 2. Query using indexed field (orderStatus)
  console.log('\n✅ INDEXED: Query by orderStatus (has index)');
  await performanceLogger.measureQuery(
    'indexed-status-query',
    async () => {
      return await prisma.order.findMany({
        where: { orderStatus: 'PENDING' },
        take: 50
      });
    }
  );

  // 3. Query using composite index (userId + createdAt)
  console.log('\n✅ COMPOSITE INDEX: Query by userId and date range');
  await performanceLogger.measureQuery(
    'composite-index-query',
    async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      return await prisma.order.findMany({
        where: {
          userId: 'sample-user-id',
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    }
  );
}

/**
 * Demo: Aggregation Queries
 */
async function demoAggregation() {
  console.log('\n📊 Demo: Aggregation Performance\n');

  // 1. Unoptimized: Multiple separate queries
  console.log('❌ UNOPTIMIZED: Multiple separate queries');
  await performanceLogger.measureQuery(
    'unoptimized-multiple-queries',
    async () => {
      const totalOrders = await prisma.order.count();
      const totalRevenue = await prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true }
      });
      const pendingOrders = await prisma.order.count({
        where: { orderStatus: 'PENDING' }
      });
      const completedOrders = await prisma.order.count({
        where: { orderStatus: 'COMPLETED' }
      });

      return { totalOrders, totalRevenue, pendingOrders, completedOrders };
    }
  );

  // 2. Optimized: Parallel queries
  console.log('\n✅ OPTIMIZED: Parallel aggregation queries');
  await optimizedService.getOrderAnalytics();
}

/**
 * Demo: Batch Operations
 */
async function demoBatchOperations() {
  console.log('\n🔄 Demo: Batch Operations\n');

  // Get some sample order IDs
  const sampleOrders = await prisma.order.findMany({
    take: 5,
    select: { id: true }
  });
  const orderIds = sampleOrders.map(order => order.id);

  if (orderIds.length === 0) {
    console.log('No orders found for batch demo');
    return;
  }

  // 1. Unoptimized: Individual updates
  console.log('❌ UNOPTIMIZED: Individual updates');
  await performanceLogger.measureQuery(
    'unoptimized-individual-updates',
    async () => {
      for (const orderId of orderIds) {
        await prisma.order.update({
          where: { id: orderId },
          data: { orderStatus: 'PROCESSING' }
        });
      }
      return orderIds.length;
    }
  );

  // 2. Optimized: Batch update
  console.log('\n✅ OPTIMIZED: Batch update');
  await optimizedService.batchUpdateOrderStatus(orderIds, 'PENDING');
}

/**
 * Demo: Query Analysis and Suggestions
 */
async function demoQueryAnalysis() {
  console.log('\n🔍 Demo: Query Analysis\n');

  // Simulate a slow query
  const startTime = performance.now();
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate 1.2s query
  const executionTime = performance.now() - startTime;

  const { analyzeQueryPerformance } = await import('@/lib/utils/query-performance');
  
  const suggestions = analyzeQueryPerformance({
    query: 'orders.findMany',
    executionTime,
    rowCount: 5000
  });

  console.log('Query Performance Analysis:');
  console.log(`- Execution Time: ${executionTime.toFixed(2)}ms`);
  console.log(`- Row Count: 5000`);
  console.log('Optimization Suggestions:');
  suggestions.forEach((suggestion, index) => {
    console.log(`  ${index + 1}. ${suggestion}`);
  });
}

/**
 * Main demo function
 */
async function runDemo() {
  console.log('🚀 Database Query Optimization Demo');
  console.log('=====================================');

  try {
    await demoOrderQueries();
    await demoPagination();
    await demoIndexUsage();
    await demoAggregation();
    await demoBatchOperations();
    await demoQueryAnalysis();

    console.log('\n✅ Demo completed successfully!');
    console.log('\nKey Takeaways:');
    console.log('- Use SELECT with specific fields instead of SELECT *');
    console.log('- Use INCLUDE to avoid N+1 queries');
    console.log('- Implement cursor-based pagination for large datasets');
    console.log('- Add indexes on frequently queried fields');
    console.log('- Use batch operations instead of individual queries');
    console.log('- Monitor query performance and optimize slow queries');
  } catch (error) {
    console.error('Demo failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the demo if this script is executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };