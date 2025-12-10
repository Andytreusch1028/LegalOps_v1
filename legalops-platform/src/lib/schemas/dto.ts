/**
 * Data Transfer Object (DTO) validation schemas.
 * Defines Zod schemas for common API request/response structures.
 */

import { z } from 'zod';
import {
  emailSchema,
  phoneSchema,
  zipCodeSchema,
  streetAddressSchema,
  citySchema,
  stateSchema,
  requiredStringSchema
} from '@/lib/validation';

/**
 * Address DTO Schema
 */
export const AddressSchema = z.object({
  street: streetAddressSchema,
  city: citySchema,
  state: stateSchema,
  zipCode: zipCodeSchema,
  country: z.string().default('US')
});

export type AddressDTO = z.infer<typeof AddressSchema>;

/**
 * Contact Information Schema
 */
export const ContactInfoSchema = z.object({
  email: emailSchema,
  phone: phoneSchema.optional(),
  alternatePhone: phoneSchema.optional()
});

export type ContactInfoDTO = z.infer<typeof ContactInfoSchema>;

/**
 * Order Item Schema
 */
export const OrderItemSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  price: z.number().min(0, 'Price must be non-negative'),
  metadata: z.record(z.unknown()).optional()
});

export type OrderItemDTO = z.infer<typeof OrderItemSchema>;

/**
 * Create Order Schema
 */
export const CreateOrderSchema = z.object({
  userId: z.string().optional(), // Optional for guest orders
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema.optional(),
  contactInfo: ContactInfoSchema,
  metadata: z.record(z.unknown()).optional()
});

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;

/**
 * Update Order Schema
 */
export const UpdateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  billingAddress: AddressSchema.optional(),
  shippingAddress: AddressSchema.optional(),
  contactInfo: ContactInfoSchema.optional(),
  metadata: z.record(z.unknown()).optional()
});

export type UpdateOrderDTO = z.infer<typeof UpdateOrderSchema>;

/**
 * Add Order Items Schema
 */
export const AddOrderItemsSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required')
});

export type AddOrderItemsDTO = z.infer<typeof AddOrderItemsSchema>;

/**
 * Remove Order Items Schema
 */
export const RemoveOrderItemsSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  itemIds: z.array(z.string()).min(1, 'At least one item ID is required')
});

export type RemoveOrderItemsDTO = z.infer<typeof RemoveOrderItemsSchema>;

/**
 * Payment Intent Schema
 */
export const CreatePaymentIntentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3-letter code').default('USD'),
  paymentMethodId: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

export type CreatePaymentIntentDTO = z.infer<typeof CreatePaymentIntentSchema>;

/**
 * User Registration Schema
 */
export const UserRegistrationSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: requiredStringSchema('First name'),
  lastName: requiredStringSchema('Last name'),
  phone: phoneSchema.optional()
});

export type UserRegistrationDTO = z.infer<typeof UserRegistrationSchema>;

/**
 * User Login Schema
 */
export const UserLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export type UserLoginDTO = z.infer<typeof UserLoginSchema>;

/**
 * Update User Profile Schema
 */
export const UpdateUserProfileSchema = z.object({
  firstName: requiredStringSchema('First name').optional(),
  lastName: requiredStringSchema('Last name').optional(),
  phone: phoneSchema.optional(),
  address: AddressSchema.optional()
});

export type UpdateUserProfileDTO = z.infer<typeof UpdateUserProfileSchema>;

/**
 * Change Password Schema
 */
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export type ChangePasswordDTO = z.infer<typeof ChangePasswordSchema>;

/**
 * Pagination Query Schema
 */
export const PaginationQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1).pipe(z.number().min(1)),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20).pipe(z.number().min(1).max(100)),
  cursor: z.string().optional()
});

export type PaginationQueryDTO = z.infer<typeof PaginationQuerySchema>;

/**
 * Search Query Schema
 */
export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  filters: z.record(z.string()).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('asc')
}).merge(PaginationQuerySchema);

export type SearchQueryDTO = z.infer<typeof SearchQuerySchema>;

/**
 * ID Parameter Schema
 */
export const IdParamSchema = z.object({
  id: z.string().min(1, 'ID is required')
});

export type IdParamDTO = z.infer<typeof IdParamSchema>;

/**
 * Bulk Operation Schema
 */
export const BulkOperationSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
  operation: z.enum(['delete', 'update', 'archive', 'restore']),
  data: z.record(z.unknown()).optional()
});

export type BulkOperationDTO = z.infer<typeof BulkOperationSchema>;

/**
 * Feedback Schema
 */
export const FeedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'other']),
  subject: requiredStringSchema('Subject').max(200),
  message: requiredStringSchema('Message').max(2000),
  email: emailSchema.optional(),
  metadata: z.record(z.unknown()).optional()
});

export type FeedbackDTO = z.infer<typeof FeedbackSchema>;

/**
 * File Upload Metadata Schema
 */
export const FileUploadMetadataSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().min(0, 'Size must be non-negative'),
  category: z.enum(['document', 'image', 'signature', 'other']).optional(),
  metadata: z.record(z.unknown()).optional()
});

export type FileUploadMetadataDTO = z.infer<typeof FileUploadMetadataSchema>;
