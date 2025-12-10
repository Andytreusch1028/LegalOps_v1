/**
 * Order Service Tests
 * 
 * Property-based tests for order service operations.
 * 
 * Feature: code-quality-improvements, Property 11: Payment State Transitions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { OrderService, IOrderService, CreateOrderDTO, UpdateOrderDTO } from './order.service';
import { ILogger } from '../interfaces/logger.interface';
import { PaymentStatus, OrderStatus, PrismaClient } from '@/generated/prisma';
import { AppError } from '../types/result';

// Mock logger
const mockLogger: ILogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn()
};

// Mock Prisma client
const createMockPrisma = () => {
  const mockOrders = new Map<string, any>();
  let orderCounter = 0;

  return {
    order: {
      create: vi.fn(async ({ data, include }: any) => {
        const id = `order_${++orderCounter}`;
        const order = {
          id,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          orderItems: data.orderItems?.create || []
        };
        mockOrders.set(id, order);
        return order;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return mockOrders.get(where.id) || null;
      }),
      findMany: vi.fn(async ({ where }: any) => {
        return Array.from(mockOrders.values()).filter(order => 
          !where || !where.userId || order.userId === where.userId
        );
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const order = mockOrders.get(where.id);
        if (!order) {
          const error: any = new Error('Record not found');
          error.code = 'P2025';
          throw error;
        }
        const updated = { ...order, ...data, updatedAt: new Date() };
        mockOrders.set(where.id, updated);
        return updated;
      })
    },
    $transaction: vi.fn(async (callback: any) => {
      return await callback({
        order: {
          create: vi.fn(async ({ data }: any) => {
            const id = `order_${++orderCounter}`;
            const order = {
              id,
              ...data,
              createdAt: new Date(),
              updatedAt: new Date(),
              orderItems: data.orderItems?.create?.map((item: any, idx: number) => ({
                id: `item_${id}_${idx}`,
                orderId: id,
                ...item,
                createdAt: new Date()
              })) || []
            };
            mockOrders.set(id, order);
            return order;
          })
        }
      });
    }),
    _mockOrders: mockOrders,
    _reset: () => {
      mockOrders.clear();
      orderCounter = 0;
    }
  } as any;
};

describe('OrderService', () => {
  let orderService: IOrderService;
  let mockPrisma: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = createMockPrisma();
    orderService = new OrderService(mockLogger, mockPrisma);
  });

  describe('Property 11: Payment State Transitions', () => {
    /**
     * Feature: code-quality-improvements, Property 11: Payment State Transitions
     * Validates: Requirements 4.4
     * 
     * For any payment processing operation, state transitions should follow valid paths:
     * - PENDING → PAID → REFUNDED (valid)
     * - PENDING → FAILED → PENDING (valid, retry)
     * - PAID → PENDING (invalid)
     * - REFUNDED → * (invalid, terminal state)
     * 
     * Invalid transitions should be rejected with appropriate error.
     */
    it('should only allow valid payment status transitions', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid transition sequences
          fc.constantFrom(
            // Valid transitions
            { from: PaymentStatus.PENDING, to: PaymentStatus.PAID, shouldSucceed: true },
            { from: PaymentStatus.PENDING, to: PaymentStatus.FAILED, shouldSucceed: true },
            { from: PaymentStatus.PAID, to: PaymentStatus.REFUNDED, shouldSucceed: true },
            { from: PaymentStatus.FAILED, to: PaymentStatus.PENDING, shouldSucceed: true },
            // Invalid transitions
            { from: PaymentStatus.PAID, to: PaymentStatus.PENDING, shouldSucceed: false },
            { from: PaymentStatus.PAID, to: PaymentStatus.FAILED, shouldSucceed: false },
            { from: PaymentStatus.REFUNDED, to: PaymentStatus.PENDING, shouldSucceed: false },
            { from: PaymentStatus.REFUNDED, to: PaymentStatus.PAID, shouldSucceed: false },
            { from: PaymentStatus.REFUNDED, to: PaymentStatus.FAILED, shouldSucceed: false }
          ),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 1000 }),
          async (transition, userId, total) => {
            // Reset mock state
            mockPrisma._reset();

            // Create an order with initial payment status
            const createData: CreateOrderDTO = {
              userId,
              orderNumber: `ORD-${Date.now()}`,
              subtotal: total,
              tax: total * 0.1,
              total: total * 1.1,
              items: [{
                serviceType: 'LLC_FORMATION',
                description: 'Test Service',
                quantity: 1,
                unitPrice: total,
                totalPrice: total
              }]
            };

            const createResult = await orderService.createOrder(createData);
            expect(createResult.success).toBe(true);

            if (!createResult.success) return;

            const orderId = createResult.data.id;

            // Set the order to the "from" status (only if different from initial PENDING)
            if (transition.from !== PaymentStatus.PENDING) {
              // First move to a valid intermediate state if needed
              if (transition.from === PaymentStatus.PAID) {
                const toPaidResult = await orderService.updateOrder(orderId, {
                  paymentStatus: PaymentStatus.PAID
                });
                expect(toPaidResult.success).toBe(true);
              } else if (transition.from === PaymentStatus.FAILED) {
                const toFailedResult = await orderService.updateOrder(orderId, {
                  paymentStatus: PaymentStatus.FAILED
                });
                expect(toFailedResult.success).toBe(true);
              } else if (transition.from === PaymentStatus.REFUNDED) {
                // Move to PAID first, then REFUNDED
                const toPaidResult = await orderService.updateOrder(orderId, {
                  paymentStatus: PaymentStatus.PAID
                });
                expect(toPaidResult.success).toBe(true);
                const toRefundedResult = await orderService.updateOrder(orderId, {
                  paymentStatus: PaymentStatus.REFUNDED
                });
                expect(toRefundedResult.success).toBe(true);
              }
            }

            // Attempt to transition to the "to" status
            const transitionResult = await orderService.updateOrder(orderId, {
              paymentStatus: transition.to
            });

            if (transition.shouldSucceed) {
              // Valid transition should succeed
              expect(transitionResult.success).toBe(true);
              if (transitionResult.success) {
                expect(transitionResult.data.paymentStatus).toBe(transition.to);
              }
            } else {
              // Invalid transition should fail
              expect(transitionResult.success).toBe(false);
              if (!transitionResult.success) {
                expect(transitionResult.error.code).toBe('INVALID_STATE_TRANSITION');
                expect(transitionResult.error.statusCode).toBe(400);
                expect(transitionResult.error.message).toContain('Invalid payment status transition');
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain payment status consistency across multiple operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 1000 }),
          fc.array(
            fc.constantFrom(
              PaymentStatus.PENDING,
              PaymentStatus.PAID,
              PaymentStatus.FAILED,
              PaymentStatus.REFUNDED
            ),
            { minLength: 2, maxLength: 5 }
          ),
          async (userId, total, statusSequence) => {
            // Reset mock state
            mockPrisma._reset();

            // Create an order
            const createData: CreateOrderDTO = {
              userId,
              orderNumber: `ORD-${Date.now()}`,
              subtotal: total,
              tax: total * 0.1,
              total: total * 1.1,
              items: [{
                serviceType: 'LLC_FORMATION',
                description: 'Test Service',
                quantity: 1,
                unitPrice: total,
                totalPrice: total
              }]
            };

            const createResult = await orderService.createOrder(createData);
            expect(createResult.success).toBe(true);

            if (!createResult.success) return;

            const orderId = createResult.data.id;
            let currentStatus = PaymentStatus.PENDING;

            // Try to apply each status in sequence
            for (const newStatus of statusSequence) {
              const result = await orderService.updateOrder(orderId, {
                paymentStatus: newStatus
              });

              // Check if the transition is valid
              const isValidTransition = isValidPaymentTransition(currentStatus, newStatus);

              if (isValidTransition) {
                // Should succeed
                expect(result.success).toBe(true);
                if (result.success) {
                  expect(result.data.paymentStatus).toBe(newStatus);
                  currentStatus = newStatus;
                }
              } else {
                // Should fail
                expect(result.success).toBe(false);
                if (!result.success) {
                  expect(result.error.code).toBe('INVALID_STATE_TRANSITION');
                }
                // Current status should remain unchanged
              }

              // Verify current status by fetching the order
              const fetchResult = await orderService.getOrder(orderId, userId);
              expect(fetchResult.success).toBe(true);
              if (fetchResult.success) {
                expect(fetchResult.data.paymentStatus).toBe(currentStatus);
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject direct transitions to terminal states from invalid states', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 1000 }),
          fc.constantFrom(
            PaymentStatus.PENDING,
            PaymentStatus.FAILED
          ),
          async (userId, total, initialStatus) => {
            // Reset mock state
            mockPrisma._reset();

            // Create an order
            const createData: CreateOrderDTO = {
              userId,
              orderNumber: `ORD-${Date.now()}`,
              subtotal: total,
              tax: total * 0.1,
              total: total * 1.1,
              items: [{
                serviceType: 'LLC_FORMATION',
                description: 'Test Service',
                quantity: 1,
                unitPrice: total,
                totalPrice: total
              }]
            };

            const createResult = await orderService.createOrder(createData);
            expect(createResult.success).toBe(true);

            if (!createResult.success) return;

            const orderId = createResult.data.id;

            // Set initial status
            await orderService.updateOrder(orderId, {
              paymentStatus: initialStatus
            });

            // Try to transition directly to REFUNDED (should fail)
            const result = await orderService.updateOrder(orderId, {
              paymentStatus: PaymentStatus.REFUNDED
            });

            // Should fail because REFUNDED can only be reached from PAID
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error.code).toBe('INVALID_STATE_TRANSITION');
              expect(result.error.statusCode).toBe(400);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should prevent any transitions from REFUNDED status', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 1000 }),
          fc.constantFrom(
            PaymentStatus.PENDING,
            PaymentStatus.PAID,
            PaymentStatus.FAILED
          ),
          async (userId, total, targetStatus) => {
            // Reset mock state
            mockPrisma._reset();

            // Create an order and move it to REFUNDED state
            const createData: CreateOrderDTO = {
              userId,
              orderNumber: `ORD-${Date.now()}`,
              subtotal: total,
              tax: total * 0.1,
              total: total * 1.1,
              items: [{
                serviceType: 'LLC_FORMATION',
                description: 'Test Service',
                quantity: 1,
                unitPrice: total,
                totalPrice: total
              }]
            };

            const createResult = await orderService.createOrder(createData);
            expect(createResult.success).toBe(true);

            if (!createResult.success) return;

            const orderId = createResult.data.id;

            // Move to PAID first
            await orderService.updateOrder(orderId, {
              paymentStatus: PaymentStatus.PAID
            });

            // Then to REFUNDED
            const refundResult = await orderService.updateOrder(orderId, {
              paymentStatus: PaymentStatus.REFUNDED
            });
            expect(refundResult.success).toBe(true);

            // Try to transition from REFUNDED to any other status (should fail)
            const result = await orderService.updateOrder(orderId, {
              paymentStatus: targetStatus
            });

            // Should fail because REFUNDED is a terminal state
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error.code).toBe('INVALID_STATE_TRANSITION');
              expect(result.error.statusCode).toBe(400);
            }

            // Verify status remains REFUNDED
            const fetchResult = await orderService.getOrder(orderId, userId);
            expect(fetchResult.success).toBe(true);
            if (fetchResult.success) {
              expect(fetchResult.data.paymentStatus).toBe(PaymentStatus.REFUNDED);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Order Creation', () => {
    it('should create orders with valid data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 10000 }),
          fc.array(
            fc.record({
              serviceType: fc.constantFrom('LLC_FORMATION', 'CORP_FORMATION', 'ANNUAL_REPORT'),
              description: fc.string({ minLength: 1, maxLength: 100 }),
              quantity: fc.integer({ min: 1, max: 10 }),
              unitPrice: fc.integer({ min: 1, max: 1000 })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (userId, subtotal, items) => {
            mockPrisma._reset();

            const itemsWithTotal = items.map(item => ({
              ...item,
              totalPrice: item.unitPrice * item.quantity
            }));

            const total = itemsWithTotal.reduce((sum, item) => sum + item.totalPrice, 0);

            const createData: CreateOrderDTO = {
              userId,
              orderNumber: `ORD-${Date.now()}-${Math.random()}`,
              subtotal,
              tax: subtotal * 0.1,
              total,
              items: itemsWithTotal
            };

            const result = await orderService.createOrder(createData);

            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.userId).toBe(userId);
              expect(result.data.orderStatus).toBe(OrderStatus.PENDING);
              expect(result.data.paymentStatus).toBe(PaymentStatus.PENDING);
              expect(result.data.orderItems).toHaveLength(items.length);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

/**
 * Helper function to check if a payment status transition is valid.
 * This mirrors the logic in OrderService.
 */
function isValidPaymentTransition(
  currentStatus: PaymentStatus,
  newStatus: PaymentStatus
): boolean {
  const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    [PaymentStatus.PENDING]: [PaymentStatus.PAID, PaymentStatus.FAILED],
    [PaymentStatus.PAID]: [PaymentStatus.REFUNDED],
    [PaymentStatus.FAILED]: [PaymentStatus.PENDING],
    [PaymentStatus.REFUNDED]: []
  };

  const allowedTransitions = validTransitions[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}
