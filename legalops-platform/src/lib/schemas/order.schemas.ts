/**
 * Zod validation schemas for Order API endpoints.
 */

import { z } from 'zod';

/**
 * Schema for creating a new order.
 */
export const CreateOrderSchema = z.object({
  userId: z.string().optional(),
  isGuestOrder: z.boolean().optional(),
  guestEmail: z.string().email().optional(),
  guestFirstName: z.string().min(1).optional(),
  guestLastName: z.string().min(1).optional(),
  guestPhone: z.string().optional(),
  serviceId: z.string().optional(),
  orderType: z.string().optional(),
  orderData: z.record(z.unknown()).optional(),
  packageId: z.string().optional(),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  items: z.array(z.object({
    serviceType: z.string(),
    description: z.string(),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0),
    additionalData: z.record(z.unknown()).optional()
  })).optional(),
  // Legacy fields for backward compatibility
  businessName: z.string().optional(),
  entityType: z.string().optional(),
  state: z.string().optional()
}).refine(
  (data) => {
    // For guest orders, require guest email
    if (data.isGuestOrder && !data.guestEmail) {
      return false;
    }
    // For non-guest orders, require userId
    if (!data.isGuestOrder && !data.userId) {
      return false;
    }
    return true;
  },
  {
    message: 'Guest orders require guestEmail, non-guest orders require userId'
  }
);

/**
 * Schema for updating an order.
 */
export const UpdateOrderSchema = z.object({
  orderStatus: z.enum(['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  paymentMethod: z.string().optional(),
  stripePaymentId: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
  riskScore: z.number().min(0).max(100).optional(),
  riskLevel: z.string().optional(),
  requiresReview: z.boolean().optional(),
  reviewedAt: z.string().datetime().optional(),
  reviewedBy: z.string().optional(),
  paidAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional()
});

/**
 * Schema for query parameters when fetching orders.
 */
export const GetOrdersQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional()
});

/**
 * Schema for order ID parameter.
 */
export const OrderIdSchema = z.object({
  orderId: z.string().min(1)
});
