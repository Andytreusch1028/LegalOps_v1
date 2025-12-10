/**
 * Order Service
 * 
 * Handles all order-related business logic including creation, retrieval,
 * updates, and payment processing with proper error handling and validation.
 */

import { BaseService } from './base.service';
import { ILogger } from '../interfaces/logger.interface';
import { Result, ok, err, AppError } from '../types/result';
import { Order, OrderStatus, PaymentStatus, Prisma } from '@/generated/prisma';
import { PrismaClient } from '@/generated/prisma';

/**
 * Order creation data transfer object.
 */
export interface CreateOrderDTO {
  userId?: string; // Optional for guest checkout
  isGuestOrder?: boolean;
  guestEmail?: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestPhone?: string;
  orderNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  packageId?: string;
  items: Array<{
    serviceType: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  ipAddress?: string;
  userAgent?: string;
  isRushOrder?: boolean;
}

/**
 * Order update data transfer object.
 */
export interface UpdateOrderDTO {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  stripePaymentId?: string;
  stripePaymentIntentId?: string;
  riskScore?: number;
  riskLevel?: string;
  requiresReview?: boolean;
  reviewedAt?: Date;
  reviewedBy?: string;
  paidAt?: Date;
  completedAt?: Date;
}

/**
 * Order service interface.
 * Defines all operations for managing orders.
 */
export interface IOrderService {
  /**
   * Create a new order.
   */
  createOrder(data: CreateOrderDTO): Promise<Result<Order, AppError>>;

  /**
   * Get an order by ID.
   */
  getOrder(id: string, userId?: string): Promise<Result<Order, AppError>>;

  /**
   * Get all orders for a user.
   */
  getUserOrders(userId: string): Promise<Result<Order[], AppError>>;

  /**
   * Update an order.
   */
  updateOrder(id: string, data: UpdateOrderDTO): Promise<Result<Order, AppError>>;

  /**
   * Process payment for an order.
   */
  processPayment(orderId: string, paymentIntentId: string): Promise<Result<Order, AppError>>;

  /**
   * Mark order as completed.
   */
  completeOrder(orderId: string): Promise<Result<Order, AppError>>;

  /**
   * Cancel an order.
   */
  cancelOrder(orderId: string, reason?: string): Promise<Result<Order, AppError>>;
}

/**
 * Order service implementation.
 * Handles order lifecycle with dependency injection.
 */
export class OrderService extends BaseService implements IOrderService {
  readonly name = 'OrderService';

  /**
   * Creates a new OrderService with injected dependencies.
   * 
   * @param logger - Logger instance
   * @param prisma - Prisma client instance
   * @param riskService - Risk assessment service (optional)
   * @param paymentService - Payment processing service (optional)
   */
  constructor(
    logger: ILogger,
    private readonly prisma: PrismaClient,
    private readonly riskService?: IRiskService,
    private readonly paymentService?: IPaymentService
  ) {
    super(logger);
  }

  /**
   * Create a new order.
   * 
   * @param data - Order creation data
   * @returns Result with created order or error
   */
  async createOrder(data: CreateOrderDTO): Promise<Result<Order, AppError>> {
    try {
      this.logInfo('Creating new order', { 
        userId: data.userId, 
        isGuestOrder: data.isGuestOrder,
        orderNumber: data.orderNumber 
      });

      // Validate input
      if (!data.isGuestOrder && !data.userId) {
        return err(this.createError(
          'User ID is required for non-guest orders',
          'VALIDATION_ERROR',
          400
        ));
      }

      if (data.isGuestOrder && !data.guestEmail) {
        return err(this.createError(
          'Guest email is required for guest orders',
          'VALIDATION_ERROR',
          400
        ));
      }

      if (!data.items || data.items.length === 0) {
        return err(this.createError(
          'At least one item is required',
          'VALIDATION_ERROR',
          400
        ));
      }

      if (data.total <= 0) {
        return err(this.createError(
          'Order total must be greater than zero',
          'VALIDATION_ERROR',
          400
        ));
      }

      // Perform risk assessment if service is available
      let riskScore: number | undefined;
      let riskLevel: string | undefined;
      let requiresReview = false;

      if (this.riskService) {
        const riskResult = await this.riskService.assessOrderRisk({
          userId: data.userId,
          email: data.guestEmail || '',
          total: data.total,
          ipAddress: data.ipAddress,
          isRushOrder: data.isRushOrder || false
        });

        if (riskResult.success) {
          riskScore = riskResult.data.riskScore;
          riskLevel = riskResult.data.riskLevel;
          requiresReview = riskResult.data.requiresReview;

          if (requiresReview) {
            this.logWarn('Order requires manual review', {
              orderNumber: data.orderNumber,
              riskScore,
              riskLevel
            });
          }
        } else {
          // Log risk assessment failure but don't block order creation
          this.logWarn('Risk assessment failed, proceeding without risk data', {
            orderNumber: data.orderNumber,
            error: riskResult.error.message
          });
        }
      }

      // Create order with items in a transaction
      const order = await this.prisma.$transaction(async (tx) => {
        // Create the order
        const newOrder = await tx.order.create({
          data: {
            userId: data.userId,
            isGuestOrder: data.isGuestOrder || false,
            guestEmail: data.guestEmail,
            guestFirstName: data.guestFirstName,
            guestLastName: data.guestLastName,
            guestPhone: data.guestPhone,
            orderNumber: data.orderNumber,
            orderStatus: OrderStatus.PENDING,
            subtotal: data.subtotal,
            tax: data.tax,
            total: data.total,
            paymentStatus: PaymentStatus.PENDING,
            packageId: data.packageId,
            riskScore,
            riskLevel,
            requiresReview,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            isRushOrder: data.isRushOrder || false,
            orderItems: {
              create: data.items.map(item => ({
                serviceType: item.serviceType as any,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
              }))
            }
          },
          include: {
            orderItems: true
          }
        });

        return newOrder;
      });

      this.logInfo('Order created successfully', { 
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total
      });

      return ok(order);
    } catch (error) {
      const appError = this.handleError(
        error,
        'Failed to create order',
        'ORDER_CREATION_FAILED',
        500,
        { orderNumber: data.orderNumber }
      );
      return err(appError);
    }
  }

  /**
   * Get an order by ID.
   * 
   * @param id - Order ID
   * @param userId - User ID (for authorization, optional for guest orders)
   * @returns Result with order or error
   */
  async getOrder(id: string, userId?: string): Promise<Result<Order, AppError>> {
    try {
      this.logDebug('Fetching order', { orderId: id, userId });

      const order = await this.prisma.order.findUnique({
        where: { id },
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

      if (!order) {
        return err(this.createError(
          'Order not found',
          'ORDER_NOT_FOUND',
          404
        ));
      }

      // Check authorization for non-guest orders
      if (userId && order.userId && order.userId !== userId) {
        return err(this.createError(
          'Not authorized to access this order',
          'UNAUTHORIZED',
          403
        ));
      }

      return ok(order);
    } catch (error) {
      const appError = this.handleError(
        error,
        'Failed to fetch order',
        'ORDER_FETCH_FAILED',
        500,
        { orderId: id, userId }
      );
      return err(appError);
    }
  }

  /**
   * Get all orders for a user.
   * 
   * @param userId - User ID
   * @returns Result with orders or error
   */
  async getUserOrders(userId: string): Promise<Result<Order[], AppError>> {
    try {
      this.logDebug('Fetching user orders', { userId });

      const orders = await this.prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return ok(orders);
    } catch (error) {
      const appError = this.handleError(
        error,
        'Failed to fetch user orders',
        'USER_ORDERS_FETCH_FAILED',
        500,
        { userId }
      );
      return err(appError);
    }
  }

  /**
   * Update an order.
   * 
   * @param id - Order ID
   * @param data - Update data
   * @returns Result with updated order or error
   */
  async updateOrder(id: string, data: UpdateOrderDTO): Promise<Result<Order, AppError>> {
    try {
      this.logInfo('Updating order', { orderId: id, updates: Object.keys(data) });

      // Validate state transitions
      if (data.orderStatus || data.paymentStatus) {
        const currentOrder = await this.prisma.order.findUnique({
          where: { id },
          select: { orderStatus: true, paymentStatus: true }
        });

        if (!currentOrder) {
          return err(this.createError(
            'Order not found',
            'ORDER_NOT_FOUND',
            404
          ));
        }

        // Validate payment state transitions
        if (data.paymentStatus) {
          const validTransition = this.isValidPaymentTransition(
            currentOrder.paymentStatus,
            data.paymentStatus
          );

          if (!validTransition) {
            return err(this.createError(
              `Invalid payment status transition from ${currentOrder.paymentStatus} to ${data.paymentStatus}`,
              'INVALID_STATE_TRANSITION',
              400,
              {
                currentStatus: currentOrder.paymentStatus,
                newStatus: data.paymentStatus
              }
            ));
          }
        }
      }

      const order = await this.prisma.order.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          orderItems: true
        }
      });

      this.logInfo('Order updated successfully', { orderId: id });

      return ok(order);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return err(this.createError(
            'Order not found',
            'ORDER_NOT_FOUND',
            404
          ));
        }
      }

      const appError = this.handleError(
        error,
        'Failed to update order',
        'ORDER_UPDATE_FAILED',
        500,
        { orderId: id }
      );
      return err(appError);
    }
  }

  /**
   * Process payment for an order.
   * 
   * @param orderId - Order ID
   * @param paymentIntentId - Stripe payment intent ID
   * @returns Result with updated order or error
   */
  async processPayment(orderId: string, paymentIntentId: string): Promise<Result<Order, AppError>> {
    try {
      this.logInfo('Processing payment', { orderId, paymentIntentId });

      // Verify payment with payment service if available
      if (this.paymentService) {
        const paymentResult = await this.paymentService.verifyPayment(paymentIntentId);

        if (!paymentResult.success) {
          return err(this.createError(
            'Payment verification failed',
            'PAYMENT_VERIFICATION_FAILED',
            400,
            { paymentIntentId }
          ));
        }
      }

      // Update order with payment information
      const updateResult = await this.updateOrder(orderId, {
        paymentStatus: PaymentStatus.PAID,
        orderStatus: OrderStatus.PAID,
        stripePaymentIntentId: paymentIntentId,
        paidAt: new Date()
      });

      if (!updateResult.success) {
        return updateResult;
      }

      this.logInfo('Payment processed successfully', { orderId, paymentIntentId });

      return updateResult;
    } catch (error) {
      const appError = this.handleError(
        error,
        'Failed to process payment',
        'PAYMENT_PROCESSING_FAILED',
        500,
        { orderId, paymentIntentId }
      );
      return err(appError);
    }
  }

  /**
   * Mark order as completed.
   * 
   * @param orderId - Order ID
   * @returns Result with updated order or error
   */
  async completeOrder(orderId: string): Promise<Result<Order, AppError>> {
    try {
      this.logInfo('Completing order', { orderId });

      const updateResult = await this.updateOrder(orderId, {
        orderStatus: OrderStatus.COMPLETED,
        completedAt: new Date()
      });

      if (!updateResult.success) {
        return updateResult;
      }

      this.logInfo('Order completed successfully', { orderId });

      return updateResult;
    } catch (error) {
      const appError = this.handleError(
        error,
        'Failed to complete order',
        'ORDER_COMPLETION_FAILED',
        500,
        { orderId }
      );
      return err(appError);
    }
  }

  /**
   * Cancel an order.
   * 
   * @param orderId - Order ID
   * @param reason - Cancellation reason
   * @returns Result with updated order or error
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Result<Order, AppError>> {
    try {
      this.logInfo('Cancelling order', { orderId, reason });

      // Check if order can be cancelled
      const orderResult = await this.getOrder(orderId);
      if (!orderResult.success) {
        return orderResult;
      }

      const order = orderResult.data;

      // Cannot cancel completed orders
      if (order.orderStatus === OrderStatus.COMPLETED) {
        return err(this.createError(
          'Cannot cancel completed order',
          'INVALID_OPERATION',
          400,
          { orderId, currentStatus: order.orderStatus }
        ));
      }

      const updateResult = await this.updateOrder(orderId, {
        orderStatus: OrderStatus.CANCELLED
      });

      if (!updateResult.success) {
        return updateResult;
      }

      this.logInfo('Order cancelled successfully', { orderId, reason });

      return updateResult;
    } catch (error) {
      const appError = this.handleError(
        error,
        'Failed to cancel order',
        'ORDER_CANCELLATION_FAILED',
        500,
        { orderId }
      );
      return err(appError);
    }
  }

  /**
   * Validate payment status transitions.
   * 
   * @param currentStatus - Current payment status
   * @param newStatus - New payment status
   * @returns True if transition is valid
   */
  private isValidPaymentTransition(
    currentStatus: PaymentStatus,
    newStatus: PaymentStatus
  ): boolean {
    // Define valid state transitions
    const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [PaymentStatus.PAID, PaymentStatus.FAILED],
      [PaymentStatus.PAID]: [PaymentStatus.REFUNDED],
      [PaymentStatus.FAILED]: [PaymentStatus.PENDING], // Allow retry
      [PaymentStatus.REFUNDED]: [] // Terminal state
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }
}

/**
 * Risk service interface (placeholder).
 */
export interface IRiskService {
  assessOrderRisk(data: {
    userId?: string;
    email: string;
    total: number;
    ipAddress?: string;
    isRushOrder: boolean;
  }): Promise<Result<{
    riskScore: number;
    riskLevel: string;
    requiresReview: boolean;
  }, AppError>>;
}

/**
 * Payment service interface (placeholder).
 */
export interface IPaymentService {
  verifyPayment(paymentIntentId: string): Promise<Result<{
    verified: boolean;
    amount: number;
  }, AppError>>;
}
