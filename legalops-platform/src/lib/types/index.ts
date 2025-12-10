/**
 * Type safety foundation exports.
 * Provides Result types, AppError, API types, and branded types for type-safe development.
 */

// Result types and error handling
export {
  type Result,
  AppError,
  ok,
  err,
  isOk,
  isErr
} from './result';

// API request/response types
export {
  type ApiRequest,
  type ApiResponse,
  type ApiError,
  type ApiResponseMeta,
  type PaginatedResponse,
  type PaginationMeta,
  type AuthenticatedUser,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse
} from './api';

// Branded types for type safety
export {
  type UserId,
  type OrderId,
  type Email,
  type EntityId,
  type FilingId,
  isUserId,
  isOrderId,
  isEmail,
  isEntityId,
  isFilingId,
  toUserId,
  toOrderId,
  toEmail,
  toEntityId,
  toFilingId
} from './branded';
