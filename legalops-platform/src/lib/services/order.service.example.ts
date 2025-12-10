/**
 * Example Order Service Implementation
 * 
 * This is an example showing how to extend BaseService with dependency injection.
 * This file is for reference and should be adapted for actual use.
 */

import { BaseService } from './base.service';
import { ILogger } from '../interfaces/logger.interface';
import { Result, ok, err, AppError } from '../types/result';
import { IOrderRepository } from '../repositories/order.repository.example';

/**
 * Order creation data transfer object.
 */
interface CreateOrderDTO {
  userId: string;
  items: Array<{
    serviceId: string;
    quantity: number;
    price: number;
  }>;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

/**
 * Order entity (simplified).
 */
interface Order {
  id: string;
  userId: string;
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order service interface.
 */
export interface IOrderService {
  createOrder(data: CreateOrderDTO): Promise<Result<Order, AppError>>;
  getOrder(id: string, userId: string): Promise<Result<Order, AppError>>;
  getUserOrders(userId: string): Promise<Result<Order[], AppError>>;
}

/**
 * Order service implementation.
 * Demonstrates dependency injection pattern with BaseService.
 */
export class OrderService extends BaseService implements IOrderService {
  readonly name = 'OrderService';

  /**
   * Creates a new OrderService with injected dependencies.
   * 
   * @param logger - Logger instance
   * @param orderRepository - Order repository instance
   */
  constructor(
    logger: ILogger,
    private readonly orderRepository: IOrderRepository
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
      this.logInfo('Creating new order', { userId: data.userId });

      // Validate input
      if (!data.userId) {
        return err(this.createError(
          'User ID is required',
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

      // Calculate total
      const total = data.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Create order through repository
      const order = await this.orderRepository.create({
        userId: data.userId,
        status: 'PENDING',
        total
      } as any);

      this.logInfo('Order created successfully', { orderId: order.id });

      return ok(order);
    } catch (error) {
      const appError = this.handleError(
        error,
        'Failed to create order',
        'ORDER_CREATION_FAILED',
        500,
        { userId: data.userId }
      );
      return err(appError);
    }
  }

  /**
   * Get an order by ID.
   * 
   * @param id - Order ID
   * @param userId - User ID (for authorization)
   * @returns Result with order or error
   */
  async getOrder(id: string, userId: string): Promise<Result<Order, AppError>> {
    try {
      this.logDebug('Fetching order', { orderId: id, userId });

      const order = await this.orderRepository.findById(id);

      if (!order) {
        return err(this.createError(
          'Order not found',
          'ORDER_NOT_FOUND',
          404
        ));
      }

      // Check authorization
      if (order.userId !== userId) {
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

      const orders = await this.orderRepository.findByUserId(userId);

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
}
