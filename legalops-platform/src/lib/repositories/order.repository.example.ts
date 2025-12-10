/**
 * Example Order Repository Implementation
 * 
 * This is an example showing how to extend BaseRepository.
 * This file is for reference and should be adapted for actual use.
 */

import { PrismaClient } from '@/generated/prisma';
import { BaseRepository } from './base.repository';
import { ILogger } from '../interfaces/logger.interface';
import { ICache } from '../interfaces/cache.interface';

/**
 * Order entity type (simplified example).
 * In practice, this would come from Prisma generated types.
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
 * Order-specific repository interface.
 * Extends the base repository with order-specific methods.
 */
export interface IOrderRepository {
  findByUserId(userId: string): Promise<Order[]>;
  findByStatus(status: string): Promise<Order[]>;
  updateStatus(orderId: string, status: string): Promise<Order>;
}

/**
 * Order repository implementation.
 * Demonstrates how to extend BaseRepository with custom methods.
 */
export class OrderRepository extends BaseRepository<Order> implements IOrderRepository {
  readonly name = 'OrderRepository';

  /**
   * Override cache TTL for orders (2 minutes).
   */
  protected cacheTTL = 120;

  constructor(
    prisma: PrismaClient,
    logger: ILogger,
    cache?: ICache
  ) {
    super(prisma, logger, cache);
  }

  /**
   * Get the Prisma model delegate for Order.
   */
  protected getModel() {
    return this.prisma.order;
  }

  /**
   * Find all orders for a specific user.
   * 
   * @param userId - The user ID
   * @returns Array of orders
   */
  async findByUserId(userId: string): Promise<Order[]> {
    return this.findMany({
      userId,
      orderBy: {
        field: 'createdAt' as keyof Order,
        direction: 'desc'
      }
    } as any);
  }

  /**
   * Find all orders with a specific status.
   * 
   * @param status - The order status
   * @returns Array of orders
   */
  async findByStatus(status: string): Promise<Order[]> {
    return this.findMany({
      status,
      orderBy: {
        field: 'createdAt' as keyof Order,
        direction: 'desc'
      }
    } as any);
  }

  /**
   * Update the status of an order.
   * 
   * @param orderId - The order ID
   * @param status - The new status
   * @returns The updated order
   */
  async updateStatus(orderId: string, status: string): Promise<Order> {
    return this.update(orderId, { status } as any);
  }
}
