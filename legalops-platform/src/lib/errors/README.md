# Centralized Error Handling System

This directory contains the centralized error handling infrastructure for the LegalOps platform.

## Overview

The error handling system provides:
- **Consistent error responses** across all API routes
- **Structured error logging** with context
- **Type-safe error handling** using Result types
- **Automatic staff alerts** for critical errors
- **Prisma error mapping** to user-friendly messages
- **Zod validation error formatting**

## Components

### ErrorHandler Class

The main `ErrorHandler` class (`handler.ts`) processes all errors and converts them to structured API responses.

**Features:**
- Type guards for different error types (AppError, ZodError, Prisma errors)
- Automatic logging with context
- Staff alerts for critical errors (5xx status codes)
- User-friendly error message mapping

### Usage in API Routes

```typescript
import { ServiceFactory } from '@/lib/services/service-factory';
import { createSuccessResponse } from '@/lib/types/api';

export async function GET() {
  const errorHandler = ServiceFactory.getErrorHandler();

  try {
    // Your API logic here
    const data = await someOperation();
    
    const response = createSuccessResponse(data);
    return NextResponse.json(response);
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: '/api/your-endpoint',
      method: 'GET'
    });
    return NextResponse.json(response, { status: 500 });
  }
}
```

### Error Wrapper Middleware

For simpler error handling, use the error wrapper middleware:

```typescript
import { withErrorHandler } from '@/lib/middleware/error-wrapper';

const handler = withErrorHandler(async (request) => {
  // Your API logic here
  const data = await someOperation();
  return NextResponse.json(createSuccessResponse(data));
}, '/api/your-endpoint');

export { handler as GET };
```

## Error Types

### AppError

Custom application errors with structured information:

```typescript
import { AppError } from '@/lib/types/result';

throw new AppError(
  'User not found',           // message
  'USER_NOT_FOUND',          // code
  404,                       // statusCode
  { userId: 'abc123' }       // context
);
```

### Result Type

Type-safe error handling without exceptions:

```typescript
import { Result, ok, err } from '@/lib/types/result';

async function getUser(id: string): Promise<Result<User, AppError>> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return err(new AppError('User not found', 'USER_NOT_FOUND', 404));
    }
    return ok(user);
  } catch (error) {
    return err(new AppError('Database error', 'DATABASE_ERROR', 500));
  }
}
```

## Alert System

The alert system notifies staff of critical errors through multiple channels:

### Configuration

Set environment variables to configure alerts:

```env
# Alert configuration
ALERT_EMAIL_ENABLED=true
ALERT_STAFF_EMAILS=admin@company.com,dev@company.com
ALERT_SLACK_ENABLED=true
ALERT_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
ALERT_MIN_SEVERITY=medium
```

### Alert Levels

- **low**: Minor issues, logged only
- **medium**: Warnings that may need attention
- **high**: Errors requiring immediate attention (5xx status codes)
- **critical**: System failures requiring urgent response

## Error Response Format

All API errors follow this consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Password too short"]
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_1705312200000_abc123"
  }
}
```

## Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_ENTRY` | 409 | Unique constraint violation |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected system error |

## Testing

The error handling system includes comprehensive tests:

```bash
# Run error handling tests
npm test src/lib/errors/

# Run specific property tests
npm test -- --grep "Property 6: Critical Error Alerts"
```

## Migration Guide

To migrate existing API routes to use centralized error handling:

1. **Import the error handler:**
   ```typescript
   import { ServiceFactory } from '@/lib/services/service-factory';
   ```

2. **Replace manual error handling:**
   ```typescript
   // Before
   } catch (error) {
     console.error('Error:', error);
     return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
   }

   // After
   } catch (error) {
     const response = await errorHandler.handle(error, {
       endpoint: '/api/your-endpoint',
       method: 'GET'
     });
     return NextResponse.json(response, { status: 500 });
   }
   ```

3. **Use structured success responses:**
   ```typescript
   import { createSuccessResponse } from '@/lib/types/api';
   
   const response = createSuccessResponse(data);
   return NextResponse.json(response);
   ```

## Best Practices

1. **Always provide context** when handling errors
2. **Use specific error codes** for different failure scenarios
3. **Include relevant data** in error context for debugging
4. **Test error paths** with property-based tests
5. **Monitor alert frequency** to identify systemic issues
6. **Use Result types** for operations that can fail predictably

## Monitoring

The error handling system provides several monitoring capabilities:

- **Structured logging** with searchable context
- **Error rate tracking** by endpoint and error type
- **Alert notifications** for critical issues
- **Request tracing** with unique request IDs

Monitor these metrics to maintain system health and identify issues early.