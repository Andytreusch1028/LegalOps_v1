/**
 * Error handling wrapper for API routes.
 * Provides a consistent way to wrap API route handlers with centralized error handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/lib/services/service-factory';
import { ApiResponse } from '@/lib/types/api';

/**
 * API route handler function type.
 */
export type ApiRouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with centralized error handling.
 * 
 * @param handler - The API route handler function
 * @param endpoint - The endpoint path for logging context
 * @returns Wrapped handler with error handling
 */
export function withErrorHandler(
  handler: ApiRouteHandler,
  endpoint: string
): ApiRouteHandler {
  return async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const errorHandler = ServiceFactory.getErrorHandler();
    
    try {
      return await handler(request, context);
    } catch (error) {
      const response = await errorHandler.handle(error, {
        endpoint,
        method: request.method,
        url: request.url
      });
      
      // Determine status code from error response
      let statusCode = 500;
      if (response.error?.code) {
        switch (response.error.code) {
          case 'VALIDATION_ERROR':
            statusCode = 400;
            break;
          case 'NOT_FOUND':
            statusCode = 404;
            break;
          case 'DUPLICATE_ENTRY':
            statusCode = 409;
            break;
          case 'UNAUTHORIZED':
            statusCode = 401;
            break;
          case 'FORBIDDEN':
            statusCode = 403;
            break;
          default:
            statusCode = 500;
        }
      }
      
      return NextResponse.json(response, { status: statusCode });
    }
  };
}

/**
 * Wraps a simple GET handler with error handling.
 * 
 * @param handler - The handler function that returns data
 * @param endpoint - The endpoint path for logging context
 * @returns Wrapped API route handler
 */
export function withErrorHandlerGet<T>(
  handler: (request: NextRequest) => Promise<T>,
  endpoint: string
): ApiRouteHandler {
  return withErrorHandler(async (request: NextRequest) => {
    const data = await handler(request);
    return NextResponse.json(data);
  }, endpoint);
}

/**
 * Wraps a simple POST handler with error handling.
 * 
 * @param handler - The handler function that returns data
 * @param endpoint - The endpoint path for logging context
 * @returns Wrapped API route handler
 */
export function withErrorHandlerPost<T>(
  handler: (request: NextRequest) => Promise<T>,
  endpoint: string
): ApiRouteHandler {
  return withErrorHandler(async (request: NextRequest) => {
    const data = await handler(request);
    return NextResponse.json(data, { status: 201 });
  }, endpoint);
}