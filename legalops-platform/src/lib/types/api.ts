/**
 * API request structure with typed body, query parameters, and user context.
 * 
 * @template T - The type of the request body
 */
export interface ApiRequest<T = unknown> {
  /** Parsed request body */
  body: T;
  /** Query string parameters */
  query: Record<string, string | string[]>;
  /** URL path parameters */
  params: Record<string, string>;
  /** Authenticated user information (if authenticated) */
  user?: AuthenticatedUser;
}

/**
 * Authenticated user information attached to requests.
 */
export interface AuthenticatedUser {
  /** User ID */
  id: string;
  /** User email address */
  email: string;
  /** User role for authorization */
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
}

/**
 * Structured API response format for consistent client handling.
 * 
 * @template T - The type of the response data
 */
export interface ApiResponse<T = unknown> {
  /** Indicates if the request was successful */
  success: boolean;
  /** Response data (present on success) */
  data?: T;
  /** Error information (present on failure) */
  error?: ApiError;
  /** Additional metadata about the response */
  meta?: ApiResponseMeta;
}

/**
 * Structured error information in API responses.
 */
export interface ApiError {
  /** Machine-readable error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Field-level validation errors or additional details */
  details?: Record<string, string[] | unknown>;
}

/**
 * Metadata included in API responses.
 */
export interface ApiResponseMeta {
  /** ISO timestamp of when the response was generated */
  timestamp: string;
  /** Unique request ID for tracing */
  requestId: string;
}

/**
 * Paginated API response with pagination metadata.
 * 
 * @template T - The type of items in the paginated list
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** Pagination information */
  pagination: PaginationMeta;
}

/**
 * Pagination metadata for list responses.
 */
export interface PaginationMeta {
  /** Total number of items across all pages */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether there are more pages available */
  hasMore: boolean;
  /** Cursor for cursor-based pagination (optional) */
  cursor?: string;
}

/**
 * Helper function to create a successful API response.
 * 
 * @template T - The type of the response data
 * @param data - The response data
 * @param meta - Optional metadata
 * @returns A structured success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: Partial<ApiResponseMeta>
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: meta?.requestId || generateRequestId(),
      ...meta
    }
  };
}

/**
 * Helper function to create an error API response.
 * 
 * @param code - Machine-readable error code
 * @param message - Human-readable error message
 * @param details - Optional additional error details
 * @param meta - Optional metadata
 * @returns A structured error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, string[] | unknown>,
  meta?: Partial<ApiResponseMeta>
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: meta?.requestId || generateRequestId(),
      ...meta
    }
  };
}

/**
 * Helper function to create a paginated response.
 * 
 * @template T - The type of items in the list
 * @param data - The list of items
 * @param pagination - Pagination metadata
 * @param meta - Optional metadata
 * @returns A structured paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  meta?: Partial<ApiResponseMeta>
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: meta?.requestId || generateRequestId(),
      ...meta
    }
  };
}

/**
 * Generates a unique request ID for tracing.
 * 
 * @returns A unique request ID string
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
