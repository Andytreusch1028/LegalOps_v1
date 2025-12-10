/**
 * Validation middleware for API routes.
 * Provides Zod-based request validation with structured error responses.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Result, AppError, err, ok } from '@/lib/types/result';

/**
 * Validates request body against a Zod schema.
 * Returns a Result type with either validated data or an AppError.
 * 
 * @template T - The expected type after validation
 * @param schema - Zod schema to validate against
 * @returns A function that validates the request and returns a Result
 * 
 * @example
 * ```typescript
 * const CreateOrderSchema = z.object({
 *   userId: z.string(),
 *   items: z.array(z.object({ serviceId: z.string() }))
 * });
 * 
 * export async function POST(req: NextRequest) {
 *   const validation = await validateRequest(CreateOrderSchema)(req);
 *   
 *   if (!validation.success) {
 *     return NextResponse.json(
 *       { success: false, error: validation.error },
 *       { status: validation.error.statusCode }
 *     );
 *   }
 *   
 *   // Use validation.data with full type safety
 *   const result = await orderService.createOrder(validation.data);
 * }
 * ```
 */
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest): Promise<Result<T, AppError>> => {
    try {
      // Parse request body
      const body = await req.json();
      
      // Validate against schema
      const result = schema.safeParse(body);
      
      if (!result.success) {
        return err(new AppError(
          'Validation failed',
          'VALIDATION_ERROR',
          400,
          { errors: formatZodErrors(result.error) }
        ));
      }
      
      return ok(result.data);
    } catch (error) {
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        return err(new AppError(
          'Invalid JSON in request body',
          'INVALID_JSON',
          400
        ));
      }
      
      // Handle other unexpected errors
      return err(new AppError(
        'Failed to parse request',
        'REQUEST_PARSE_ERROR',
        400
      ));
    }
  };
}

/**
 * Validates query parameters against a Zod schema.
 * 
 * @template T - The expected type after validation
 * @param schema - Zod schema to validate against
 * @param searchParams - URLSearchParams from the request
 * @returns A Result with either validated data or an AppError
 * 
 * @example
 * ```typescript
 * const QuerySchema = z.object({
 *   page: z.string().transform(Number).pipe(z.number().min(1)),
 *   limit: z.string().transform(Number).pipe(z.number().min(1).max(100))
 * });
 * 
 * export async function GET(req: NextRequest) {
 *   const validation = validateQueryParams(QuerySchema, req.nextUrl.searchParams);
 *   
 *   if (!validation.success) {
 *     return NextResponse.json(
 *       { success: false, error: validation.error },
 *       { status: validation.error.statusCode }
 *     );
 *   }
 *   
 *   const { page, limit } = validation.data;
 * }
 * ```
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): Result<T, AppError> {
  try {
    // Convert URLSearchParams to object
    const params: Record<string, string | string[]> = {};
    
    searchParams.forEach((value, key) => {
      const existing = params[key];
      if (existing) {
        // Handle multiple values for same key
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          params[key] = [existing, value];
        }
      } else {
        params[key] = value;
      }
    });
    
    // Validate against schema
    const result = schema.safeParse(params);
    
    if (!result.success) {
      return err(new AppError(
        'Invalid query parameters',
        'INVALID_QUERY_PARAMS',
        400,
        { errors: formatZodErrors(result.error) }
      ));
    }
    
    return ok(result.data);
  } catch (error) {
    return err(new AppError(
      'Failed to parse query parameters',
      'QUERY_PARSE_ERROR',
      400
    ));
  }
}

/**
 * Formats Zod validation errors into a user-friendly structure.
 * Maps field paths to arrays of error messages.
 * 
 * @param error - Zod validation error
 * @returns Object mapping field paths to error message arrays
 * 
 * @example
 * ```typescript
 * // Input: ZodError with issues for 'email' and 'items[0].quantity'
 * // Output: {
 * //   'email': ['Invalid email address'],
 * //   'items.0.quantity': ['Must be at least 1']
 * // }
 * ```
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  error.issues.forEach(issue => {
    // Convert path array to dot notation (e.g., ['items', 0, 'name'] -> 'items.0.name')
    const path = issue.path.join('.');
    
    if (!formatted[path]) {
      formatted[path] = [];
    }
    
    formatted[path].push(issue.message);
  });
  
  return formatted;
}

/**
 * Validates a single value against a Zod schema.
 * Useful for validating individual fields or parameters.
 * 
 * @template T - The expected type after validation
 * @param schema - Zod schema to validate against
 * @param value - Value to validate
 * @param fieldName - Name of the field for error messages
 * @returns A Result with either validated data or an AppError
 * 
 * @example
 * ```typescript
 * const emailResult = validateValue(
 *   z.string().email(),
 *   userInput,
 *   'email'
 * );
 * 
 * if (!emailResult.success) {
 *   console.error(emailResult.error.message);
 * }
 * ```
 */
export function validateValue<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  fieldName: string = 'value'
): Result<T, AppError> {
  const result = schema.safeParse(value);
  
  if (!result.success) {
    const errors = formatZodErrors(result.error);
    const firstError = Object.values(errors)[0]?.[0] || 'Validation failed';
    
    return err(new AppError(
      `Invalid ${fieldName}: ${firstError}`,
      'VALIDATION_ERROR',
      400,
      { field: fieldName, errors }
    ));
  }
  
  return ok(result.data);
}
