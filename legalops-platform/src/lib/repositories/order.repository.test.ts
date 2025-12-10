/**
 * Property-based tests for Order Repository.
 * 
 * Feature: code-quality-improvements, Property 13: Cache Consistency
 * Validates: Requirements 5.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { PrismaClient } from '@/generated/prisma';
import { OrderRepository, IOrderRepository } from './order.repository';
import { createLogger } from '../logging/console-logger';
import { MemoryCache } from '../caching/memory-cache';
import { ICache } from '../interfaces/cache.interface';
import { OrderStatus, PaymentStatus } from '@/types/entities';

describe('Order Repository', () => {
  let prisma: PrismaClient;
  let cache: ICache;
  let repository: IOrderRepository;
  let repositoryWithoutCache: IOrderRepository;

  beforeEach(() => {
    prisma = new PrismaClient();
    cache = new MemoryCache();
    repository = new OrderRepository(prisma, createLogger('test'), cache);
    repositoryWithoutCache = new OrderRepository(prisma, createLogger('test'));
  });

  afterEach(async () => {
    // Clean up: delete all test order items first (foreign key constraint)
    const testOrders = await prisma.order.findMany({
      where: {
        orderNumber: {
          startsWith: 'TEST-'
        }
      },
      select: { id: true }
    });

    const orderIds = testOrders.map(o => o.id);

    if (orderIds.length > 0) {
      await prisma.orderItem.deleteMany({
        where: {
          orderId: {
            in: orderIds
          }
        }
      });

      // Then delete test orders
      await prisma.order.deleteMany({
        where: {
          id: {
            in: orderIds
          }
        }
      });
    }

    // Clear cache
    await cache.clear();

    // Disconnect Prisma
    await prisma.$disconnect();
  });

  /**
   * Property 13: Cache Consistency
   * 
   * For any cached data, the cached value should match the database value at the 
   * time of caching, and cache misses should fetch from the database.
   */
  describe('Property 13: Cache Consistency', () => {
    // Arbitrary for generating valid order data
    // Note: We use guest orders to avoid foreign key constraints with users table
    const orderDataArbitrary = fc.record({
      isGuestOrder: fc.constant(true), // Always guest orders to avoid FK constraints
      guestEmail: fc.emailAddress(),
      guestFirstName: fc.constantFrom('John', 'Jane', 'Bob', 'Alice'),
      guestLastName: fc.constantFrom('Doe', 'Smith', 'Johnson', 'Williams'),
      orderNumber: fc.string({ minLength: 8, maxLength: 12 }).map(s => `TEST-${Date.now()}-${s}`),
      orderStatus: fc.constantFrom<OrderStatus>(
        'PENDING',
        'PAID',
        'PROCESSING',
        'COMPLETED',
        'CANCELLED'
      ),
      subtotal: fc.integer({ min: 100, max: 100000 }).map(n => n / 100),
      tax: fc.integer({ min: 0, max: 10000 }).map(n => n / 100),
      total: fc.integer({ min: 100, max: 110000 }).map(n => n / 100),
      paymentStatus: fc.constantFrom<PaymentStatus>(
        'PENDING',
        'PAID',
        'FAILED',
        'REFUNDED'
      ),
      paymentMethod: fc.option(fc.constantFrom('credit_card', 'debit_card', 'bank_transfer')),
      riskScore: fc.option(fc.integer({ min: 0, max: 100 })),
      requiresReview: fc.boolean()
    });

    it('should return cached value that matches database value at time of caching', async () => {
      await fc.assert(
        fc.asyncProperty(orderDataArbitrary, async (orderData) => {
          // Create order in database
          const createdOrder = await prisma.order.create({
            data: {
              userId: orderData.userId,
              isGuestOrder: orderData.isGuestOrder,
              guestEmail: orderData.guestEmail,
              guestFirstName: orderData.guestFirstName,
              guestLastName: orderData.guestLastName,
              orderNumber: orderData.orderNumber,
              orderStatus: orderData.orderStatus,
              subtotal: orderData.subtotal,
              tax: orderData.tax,
              total: orderData.total,
              paymentStatus: orderData.paymentStatus,
              paymentMethod: orderData.paymentMethod,
              riskScore: orderData.riskScore,
              requiresReview: orderData.requiresReview
            }
          });

          // First fetch - should cache the value
          const firstFetch = await repository.findById(createdOrder.id);
          expect(firstFetch).not.toBeNull();

          // Second fetch - should return cached value
          const secondFetch = await repository.findById(createdOrder.id);
          expect(secondFetch).not.toBeNull();

          // Cached value should match the database value
          expect(firstFetch).toEqual(secondFetch);
          expect(firstFetch?.id).toBe(createdOrder.id);
          expect(firstFetch?.orderNumber).toBe(createdOrder.orderNumber);
          expect(firstFetch?.orderStatus).toBe(createdOrder.orderStatus);
          expect(firstFetch?.paymentStatus).toBe(createdOrder.paymentStatus);
        }),
        { numRuns: 50 } // Reduced runs for database operations
      );
    }, 60000); // 60 second timeout for database operations

    it('should fetch from database on cache miss', async () => {
      await fc.assert(
        fc.asyncProperty(orderDataArbitrary, async (orderData) => {
          // Create order in database
          const createdOrder = await prisma.order.create({
            data: {
              userId: orderData.userId,
              isGuestOrder: orderData.isGuestOrder,
              guestEmail: orderData.guestEmail,
              guestFirstName: orderData.guestFirstName,
              guestLastName: orderData.guestLastName,
              orderNumber: orderData.orderNumber,
              orderStatus: orderData.orderStatus,
              subtotal: orderData.subtotal,
              tax: orderData.tax,
              total: orderData.total,
              paymentStatus: orderData.paymentStatus,
              paymentMethod: orderData.paymentMethod,
              riskScore: orderData.riskScore,
              requiresReview: orderData.requiresReview
            }
          });

          // Clear cache to simulate cache miss
          await cache.clear();

          // Fetch should go to database
          const fetchedOrder = await repository.findById(createdOrder.id);
          expect(fetchedOrder).not.toBeNull();

          // Should match database value
          expect(fetchedOrder?.id).toBe(createdOrder.id);
          expect(fetchedOrder?.orderNumber).toBe(createdOrder.orderNumber);
          expect(fetchedOrder?.orderStatus).toBe(createdOrder.orderStatus);
        }),
        { numRuns: 50 }
      );
    }, 60000);

    it('should invalidate cache on update', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDataArbitrary,
          fc.constantFrom<OrderStatus>('PAID', 'PROCESSING', 'COMPLETED'),
          async (orderData, newStatus) => {
            // Create order in database
            const createdOrder = await prisma.order.create({
              data: {
                userId: orderData.userId,
                isGuestOrder: orderData.isGuestOrder,
                guestEmail: orderData.guestEmail,
                guestFirstName: orderData.guestFirstName,
                guestLastName: orderData.guestLastName,
                orderNumber: orderData.orderNumber,
                orderStatus: 'PENDING',
                subtotal: orderData.subtotal,
                tax: orderData.tax,
                total: orderData.total,
                paymentStatus: orderData.paymentStatus,
                paymentMethod: orderData.paymentMethod,
                riskScore: orderData.riskScore,
                requiresReview: orderData.requiresReview
              }
            });

            // First fetch - caches the value
            const firstFetch = await repository.findById(createdOrder.id);
            expect(firstFetch?.orderStatus).toBe('PENDING');

            // Update the order
            await repository.updateStatus(createdOrder.id, newStatus);

            // Second fetch - should get updated value from database, not stale cache
            const secondFetch = await repository.findById(createdOrder.id);
            expect(secondFetch?.orderStatus).toBe(newStatus);
          }
        ),
        { numRuns: 30 }
      );
    }, 60000);

    it('should maintain cache consistency for findByOrderNumber', async () => {
      await fc.assert(
        fc.asyncProperty(orderDataArbitrary, async (orderData) => {
          // Create order in database
          const createdOrder = await prisma.order.create({
            data: {
              userId: orderData.userId,
              isGuestOrder: orderData.isGuestOrder,
              guestEmail: orderData.guestEmail,
              guestFirstName: orderData.guestFirstName,
              guestLastName: orderData.guestLastName,
              orderNumber: orderData.orderNumber,
              orderStatus: orderData.orderStatus,
              subtotal: orderData.subtotal,
              tax: orderData.tax,
              total: orderData.total,
              paymentStatus: orderData.paymentStatus,
              paymentMethod: orderData.paymentMethod,
              riskScore: orderData.riskScore,
              requiresReview: orderData.requiresReview
            }
          });

          // First fetch by order number - should cache
          const firstFetch = await repository.findByOrderNumber(
            createdOrder.orderNumber
          );
          expect(firstFetch).not.toBeNull();

          // Second fetch - should return cached value
          const secondFetch = await repository.findByOrderNumber(
            createdOrder.orderNumber
          );
          expect(secondFetch).not.toBeNull();

          // Values should match
          expect(firstFetch).toEqual(secondFetch);
          expect(firstFetch?.id).toBe(createdOrder.id);
        }),
        { numRuns: 50 }
      );
    }, 60000);

    it('should invalidate all cache entries on update', async () => {
      await fc.assert(
        fc.asyncProperty(orderDataArbitrary, async (orderData) => {
          // Create order in database
          const createdOrder = await prisma.order.create({
            data: {
              userId: orderData.userId,
              isGuestOrder: orderData.isGuestOrder,
              guestEmail: orderData.guestEmail,
              guestFirstName: orderData.guestFirstName,
              guestLastName: orderData.guestLastName,
              orderNumber: orderData.orderNumber,
              orderStatus: 'PENDING',
              subtotal: orderData.subtotal,
              tax: orderData.tax,
              total: orderData.total,
              paymentStatus: 'PENDING',
              paymentMethod: orderData.paymentMethod,
              riskScore: orderData.riskScore,
              requiresReview: orderData.requiresReview
            }
          });

          // Cache by ID
          await repository.findById(createdOrder.id);

          // Cache by order number
          await repository.findByOrderNumber(createdOrder.orderNumber);

          // Cache with relations
          await repository.findByIdWithRelations(createdOrder.id);

          // Update payment status
          await repository.updatePaymentStatus(createdOrder.id, 'PAID', new Date());

          // All fetches should return updated value
          const byId = await repository.findById(createdOrder.id);
          const byOrderNumber = await repository.findByOrderNumber(
            createdOrder.orderNumber
          );
          const withRelations = await repository.findByIdWithRelations(
            createdOrder.id
          );

          expect(byId?.paymentStatus).toBe('PAID');
          expect(byOrderNumber?.paymentStatus).toBe('PAID');
          expect(withRelations?.paymentStatus).toBe('PAID');
        }),
        { numRuns: 30 }
      );
    }, 60000);

    it('should work correctly without cache', async () => {
      await fc.assert(
        fc.asyncProperty(orderDataArbitrary, async (orderData) => {
          // Create order in database
          const createdOrder = await prisma.order.create({
            data: {
              userId: orderData.userId,
              isGuestOrder: orderData.isGuestOrder,
              guestEmail: orderData.guestEmail,
              guestFirstName: orderData.guestFirstName,
              guestLastName: orderData.guestLastName,
              orderNumber: orderData.orderNumber,
              orderStatus: orderData.orderStatus,
              subtotal: orderData.subtotal,
              tax: orderData.tax,
              total: orderData.total,
              paymentStatus: orderData.paymentStatus,
              paymentMethod: orderData.paymentMethod,
              riskScore: orderData.riskScore,
              requiresReview: orderData.requiresReview
            }
          });

          // Repository without cache should still work
          const fetchedOrder = await repositoryWithoutCache.findById(
            createdOrder.id
          );
          expect(fetchedOrder).not.toBeNull();
          expect(fetchedOrder?.id).toBe(createdOrder.id);
          expect(fetchedOrder?.orderNumber).toBe(createdOrder.orderNumber);
        }),
        { numRuns: 50 }
      );
    }, 60000);

    it('should respect cache TTL', async () => {
      // Create a test order
      const testOrder = await prisma.order.create({
        data: {
          orderNumber: 'TEST-TTL-001',
          orderStatus: 'PENDING',
          subtotal: 100,
          tax: 10,
          total: 110,
          paymentStatus: 'PENDING',
          isGuestOrder: true
        }
      });

      // Fetch to cache
      const firstFetch = await repository.findById(testOrder.id);
      expect(firstFetch).not.toBeNull();

      // Manually set a very short TTL in cache (1 second)
      await cache.set(`OrderRepository:${testOrder.id}`, testOrder, 1);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Update order in database directly (bypassing repository)
      await prisma.order.update({
        where: { id: testOrder.id },
        data: { orderStatus: 'PAID' }
      });

      // Fetch again - should get fresh data from database since cache expired
      const secondFetch = await repository.findById(testOrder.id);
      expect(secondFetch?.orderStatus).toBe('PAID');
    }, 10000);
  });

  describe('Order Repository Methods', () => {
    it('should find orders by user ID', async () => {
      // Create a test user first
      const testUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
          userType: 'CUSTOMER',
          role: 'INDIVIDUAL_CUSTOMER'
        }
      });

      // Create multiple orders for the user
      await prisma.order.createMany({
        data: [
          {
            userId: testUser.id,
            orderNumber: 'TEST-USER-001',
            orderStatus: 'PENDING',
            subtotal: 100,
            tax: 10,
            total: 110,
            paymentStatus: 'PENDING'
          },
          {
            userId: testUser.id,
            orderNumber: 'TEST-USER-002',
            orderStatus: 'PAID',
            subtotal: 200,
            tax: 20,
            total: 220,
            paymentStatus: 'PAID'
          }
        ]
      });

      const orders = await repository.findByUserId(testUser.id);
      expect(orders.length).toBeGreaterThanOrEqual(2);
      expect(orders.every(o => o.userId === testUser.id)).toBe(true);

      // Clean up test user
      await prisma.user.delete({ where: { id: testUser.id } });
    });

    it('should find orders by status', async () => {
      // Create orders with different statuses
      await prisma.order.createMany({
        data: [
          {
            orderNumber: 'TEST-STATUS-001',
            orderStatus: 'COMPLETED',
            subtotal: 100,
            tax: 10,
            total: 110,
            paymentStatus: 'PAID',
            isGuestOrder: true
          },
          {
            orderNumber: 'TEST-STATUS-002',
            orderStatus: 'COMPLETED',
            subtotal: 200,
            tax: 20,
            total: 220,
            paymentStatus: 'PAID',
            isGuestOrder: true
          }
        ]
      });

      const orders = await repository.findByStatus('COMPLETED');
      expect(orders.length).toBeGreaterThanOrEqual(2);
      expect(orders.every(o => o.orderStatus === 'COMPLETED')).toBe(true);
    });

    it('should find orders requiring review', async () => {
      // Create an order requiring review
      await prisma.order.create({
        data: {
          orderNumber: 'TEST-REVIEW-001',
          orderStatus: 'PENDING',
          subtotal: 100,
          tax: 10,
          total: 110,
          paymentStatus: 'PENDING',
          requiresReview: true,
          riskScore: 75,
          isGuestOrder: true
        }
      });

      const orders = await repository.findRequiringReview();
      expect(orders.length).toBeGreaterThanOrEqual(1);
      expect(orders.every(o => o.requiresReview === true)).toBe(true);
      expect(orders.every(o => o.reviewedAt === null)).toBe(true);
    });

    it('should count orders by user ID', async () => {
      // Create a test user first
      const testUser = await prisma.user.create({
        data: {
          email: `test-count-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
          userType: 'CUSTOMER',
          role: 'INDIVIDUAL_CUSTOMER'
        }
      });

      // Create orders for the user
      await prisma.order.createMany({
        data: [
          {
            userId: testUser.id,
            orderNumber: 'TEST-COUNT-001',
            orderStatus: 'PENDING',
            subtotal: 100,
            tax: 10,
            total: 110,
            paymentStatus: 'PENDING'
          },
          {
            userId: testUser.id,
            orderNumber: 'TEST-COUNT-002',
            orderStatus: 'PAID',
            subtotal: 200,
            tax: 20,
            total: 220,
            paymentStatus: 'PAID'
          }
        ]
      });

      const count = await repository.countByUserId(testUser.id);
      expect(count).toBeGreaterThanOrEqual(2);

      // Clean up test user
      await prisma.user.delete({ where: { id: testUser.id } });
    });
  });
});
