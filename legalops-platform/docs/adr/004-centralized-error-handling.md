# ADR-004: Centralized Error Handling Strategy

## Status
Accepted

## Context
The LegalOps platform needs consistent error handling across all layers to provide:

- Uniform error responses to clients
- Proper error logging and monitoring
- Security through error sanitization
- Debugging support with contextual information
- Integration with alerting systems for critical errors

Without centralized error handling, we risk inconsistent error formats, information leakage, and poor debugging experience.

## Decision
We will implement a centralized error handling system with structured error types, automatic logging, and alert integration.

### Key Components

#### AppError Class
```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly context?: Record<string, any>,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

#### ErrorHandler Service
```typescript
export class ErrorHandler {
  constructor(
    private readonly logger: ILogger,
    private readonly alertService: IAlertService
  ) {}

  async handleError(error: unknown, context?: ErrorContext): Promise<AppError> {
    const appError = this.normalizeError(error);
    await this.logError(appError, context);
    await this.sendAlertsIfNeeded(appError, context);
    return appError;
  }
}
```

#### Error Response Format
```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}
```

## Consequences

### Positive
- **Consistency**: All errors follow the same format
- **Security**: Sensitive information is sanitized
- **Monitoring**: Automatic error logging and alerting
- **Debugging**: Rich context for troubleshooting
- **User Experience**: User-friendly error messages
- **Compliance**: Audit trail for error tracking

### Negative
- **Complexity**: Additional abstraction layer
- **Performance**: Slight overhead for error processing
- **Learning Curve**: Developers need to use structured errors

## Implementation Details

### Error Categories
```typescript
// Business Logic Errors
export const BusinessErrors = {
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS'
} as const;

// Validation Errors
export const ValidationErrors = {
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  INVALID_PHONE_FORMAT: 'INVALID_PHONE_FORMAT'
} as const;

// System Errors
export const SystemErrors = {
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
  EXTERNAL_SERVICE_UNAVAILABLE: 'EXTERNAL_SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;
```

### Error Mapping
```typescript
export class ErrorHandler {
  private mapPrismaError(error: PrismaClientKnownRequestError): AppError {
    switch (error.code) {
      case 'P2002':
        return new AppError(
          'DUPLICATE_RECORD',
          'A record with this information already exists',
          { constraint: error.meta?.target },
          409
        );
      case 'P2025':
        return new AppError(
          'RECORD_NOT_FOUND',
          'The requested record was not found',
          { model: error.meta?.modelName },
          404
        );
      default:
        return new AppError(
          'DATABASE_ERROR',
          'A database error occurred',
          { code: error.code },
          500
        );
    }
  }
}
```

### Service Integration
```typescript
export class OrderService extends BaseService {
  async createOrder(data: CreateOrderData): Promise<Result<Order>> {
    try {
      const order = await this.orderRepository.create(data);
      return success(order);
    } catch (error) {
      const appError = await ServiceFactory.getErrorHandler().handleError(
        error,
        { operation: 'createOrder', userId: data.userId }
      );
      return failure(appError);
    }
  }
}
```

### API Route Integration
```typescript
export async function POST(request: Request) {
  try {
    const result = await orderService.createOrder(data);
    
    if (!result.success) {
      return NextResponse.json(
        createErrorResponse(result.error),
        { status: result.error.statusCode }
      );
    }
    
    return NextResponse.json(createSuccessResponse(result.data));
  } catch (error) {
    const appError = await ServiceFactory.getErrorHandler().handleError(error);
    return NextResponse.json(
      createErrorResponse(appError),
      { status: appError.statusCode }
    );
  }
}
```

## Error Logging Strategy

### Log Levels
```typescript
const getLogLevel = (error: AppError): LogLevel => {
  if (error.statusCode >= 500) return 'error';
  if (error.statusCode >= 400) return 'warn';
  return 'info';
};
```

### Structured Logging
```typescript
await this.logger.error('Order creation failed', {
  error: {
    code: appError.code,
    message: appError.message,
    stack: appError.stack
  },
  context: {
    userId: context?.userId,
    operation: context?.operation,
    timestamp: new Date().toISOString()
  },
  request: {
    method: context?.method,
    url: context?.url,
    userAgent: context?.userAgent
  }
});
```

## Alert Integration

### Critical Error Alerts
```typescript
private async sendAlertsIfNeeded(error: AppError, context?: ErrorContext): Promise<void> {
  const isCritical = error.statusCode >= 500 || CRITICAL_ERROR_CODES.includes(error.code);
  
  if (isCritical) {
    await this.alertService.sendAlert({
      level: 'critical',
      title: `Critical Error: ${error.code}`,
      message: error.message,
      context: {
        error: error.code,
        operation: context?.operation,
        userId: context?.userId,
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

### Alert Channels
```typescript
interface AlertChannels {
  console: boolean;
  email: boolean;
  slack: boolean;
  webhook?: string;
}

const alertConfig: Record<string, AlertChannels> = {
  development: { console: true, email: false, slack: false },
  staging: { console: true, email: true, slack: false },
  production: { console: true, email: true, slack: true }
};
```

## Security Considerations

### Error Sanitization
```typescript
private sanitizeErrorForClient(error: AppError): ApiErrorResponse['error'] {
  // Never expose internal error details in production
  if (process.env.NODE_ENV === 'production' && error.statusCode >= 500) {
    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal error occurred. Please try again later.'
    };
  }

  return {
    code: error.code,
    message: error.message,
    details: this.sanitizeContext(error.context)
  };
}

private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
  if (!context) return undefined;
  
  const sanitized = { ...context };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.apiKey;
  delete sanitized.secret;
  
  return sanitized;
}
```

## Testing Strategy

### Error Handler Testing
```typescript
describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let mockLogger: jest.Mocked<ILogger>;
  let mockAlertService: jest.Mocked<IAlertService>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockAlertService = createMockAlertService();
    errorHandler = new ErrorHandler(mockLogger, mockAlertService);
  });

  it('should map Prisma unique constraint error correctly', async () => {
    const prismaError = new PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '4.0.0' }
    );

    const result = await errorHandler.handleError(prismaError);

    expect(result.code).toBe('DUPLICATE_RECORD');
    expect(result.statusCode).toBe(409);
  });

  it('should send alerts for critical errors', async () => {
    const criticalError = new AppError('DATABASE_CONNECTION_FAILED', 'DB down', {}, 500);

    await errorHandler.handleError(criticalError);

    expect(mockAlertService.sendAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'critical',
        title: 'Critical Error: DATABASE_CONNECTION_FAILED'
      })
    );
  });
});
```

### Integration Testing
```typescript
describe('API Error Handling', () => {
  it('should return structured error response', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({ invalid: 'data' })
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: expect.any(String),
        message: expect.any(String)
      },
      meta: {
        timestamp: expect.any(String)
      }
    });
  });
});
```

## Monitoring and Observability

### Error Metrics
```typescript
interface ErrorMetrics {
  totalErrors: number;
  errorsByCode: Record<string, number>;
  errorsByStatusCode: Record<number, number>;
  criticalErrors: number;
  errorRate: number;
}
```

### Health Checks
```typescript
export async function GET() {
  const metrics = await errorHandler.getMetrics();
  
  return NextResponse.json({
    status: metrics.criticalErrors === 0 ? 'healthy' : 'degraded',
    metrics
  });
}
```

## Alternatives Considered

1. **Global Exception Handler**: Rejected due to lack of context
2. **Try/Catch Everywhere**: Rejected due to inconsistency
3. **Error Middleware Only**: Rejected as insufficient for services
4. **Third-party Error Service**: Rejected due to vendor lock-in

## Migration Strategy

1. **Phase 1**: Implement ErrorHandler and AppError classes
2. **Phase 2**: Update service layer to use structured errors
3. **Phase 3**: Update API routes to use error handler
4. **Phase 4**: Add monitoring and alerting
5. **Phase 5**: Remove legacy error handling

## References
- [Error Handling Best Practices](https://nodejs.org/en/docs/guides/error-handling/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [Structured Logging](https://www.structlog.org/en/stable/)