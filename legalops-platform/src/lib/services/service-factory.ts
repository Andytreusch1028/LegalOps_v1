/**
 * Service Factory
 * 
 * Creates and manages service instances with proper dependency injection.
 */

import { PrismaClient } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ConsoleLogger } from '../logging/console-logger';
import { ILogger } from '../interfaces/logger.interface';
import { OrderService } from './order.service';
import { ErrorHandler, IAlertService } from '../errors/handler';

/**
 * Simple alert service implementation that logs to console.
 * In production, this would send alerts to staff via email/Slack/etc.
 */
class ConsoleAlertService implements IAlertService {
  async notifyStaff(alert: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    context?: Record<string, unknown>;
  }): Promise<void> {
    console.error(`[ALERT - ${alert.severity.toUpperCase()}] ${alert.message}`, alert.context);
    
    // In production, this would:
    // - Send email to staff
    // - Post to Slack channel
    // - Create incident in monitoring system
    // - etc.
  }
}

/**
 * Service factory for creating service instances.
 */
export class ServiceFactory {
  private static logger: ILogger;
  private static alertService: IAlertService;
  private static errorHandler: ErrorHandler;
  private static orderService: OrderService;

  /**
   * Get logger instance.
   */
  static getLogger(): ILogger {
    if (!this.logger) {
      this.logger = new ConsoleLogger();
    }
    return this.logger;
  }

  /**
   * Get alert service instance.
   */
  static getAlertService(): IAlertService {
    if (!this.alertService) {
      this.alertService = new ConsoleAlertService();
    }
    return this.alertService;
  }

  /**
   * Get error handler instance.
   */
  static getErrorHandler(): ErrorHandler {
    if (!this.errorHandler) {
      this.errorHandler = new ErrorHandler(
        this.getLogger(),
        this.getAlertService()
      );
    }
    return this.errorHandler;
  }

  /**
   * Get order service instance.
   */
  static getOrderService(): OrderService {
    if (!this.orderService) {
      this.orderService = new OrderService(
        this.getLogger(),
        prisma
      );
    }
    return this.orderService;
  }
}
