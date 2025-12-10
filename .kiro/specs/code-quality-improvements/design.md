# Design Document: Code Quality Improvements

## Overview

This design outlines systematic improvements to the LegalOps platform codebase to enhance type safety, error handling, testing coverage, performance, security, and developer experience. The improvements are designed to be implemented incrementally without disrupting existing functionality.

The platform is a Next.js 15 application using:
- **TypeScript** for type safety
- **Prisma** for database access (PostgreSQL)
- **Zod** for runtime validation
- **NextAuth** for authentication
- **Stripe** for payments
- **OpenAI/Anthropic** for AI features

## Architecture

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                      │
├─────────────────────────────────────────────────────────────┤
│  Pages/Routes        │  API Routes (mixed concerns)          │
│  - Dashboard         │  - Direct DB access                   │
│  - Forms             │  - Business logic in routes           │
│  - Admin             │  - Inconsistent error handling        │
└─────────────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
┌──────────────────┐      ┌──────────────────────┐
│   Components     │      │   Lib/Utils          │
│   - Mixed        │      │   - Validation       │
│   - Some reuse   │      │   - Mappers          │
└──────────────────┘      │   - Services (some)  │
                          └──────────────────────┘
                                    │
                                    ▼
                          ┌──────────────────────┐
                          │   Prisma Client      │
                          │   (Direct access)    │
                          └──────────────────────┘
```

### Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                      │
├─────────────────────────────────────────────────────────────┤
│  Pages/Routes        │  API Routes (thin controllers)        │
│  - Use components    │  - Validation layer                   │
│  - Type-safe         │  - Call services                      │
│  - Error boundaries  │  - Structured responses               │
└─────────────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
┌──────────────────┐      ┌──────────────────────┐
│  UI Components   │      │   Service Layer      │
│  - Reusable      │      │   - Business logic   │
│  - Typed props   │      │   - Result types     │
│  - Validated     │      │   - DI pattern       │
└──────────────────┘      └──────────────────────┘
                                    │
                                    ▼
                          ┌──────────────────────┐
                          │  Repository Layer    │
                          │  - Data access       │
                          │  - Query builders    │
                          │  - Caching           │
                          └──────────────────────┘
                                    │
                                    ▼
                          ┌──────────────────────┐
                          │   Prisma Client      │
                          │   (Abstracted)       │
                          └──────────────────────┘
```

## Components and Interfaces

### 1. Type Safety Layer

#### Result Type Pattern

```typescript
// lib/types/result.ts
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Helper functions
export const ok = <T>(data: T): Result<T, never> => ({ 
  success: true, 
  data 
});

export const err = <E>(error: E): Result<never, E> => ({ 
  success: false, 
  error 
});
```

#### API Request/Response Types

```typescript
// lib/types/api.ts
export interface ApiRequest<T = unknown> {
  body: T;
  query: Record<string, string | string[]>;
  params: Record<string, string>;
  user?: AuthenticatedUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
    cursor?: string;
  };
}
```

### 2. Service Layer

#### Base Service Interface

```typescript
// lib/services/base.service.ts
export interface IService {
  readonly name: string;
}

export abstract class BaseService implements IService {
  abstract readonly name: string;
  
  protected constructor(
    protected readonly logger: ILogger,
    protected readonly repository: IRepository
  ) {}
  
  protected logError(error: unknown, context?: Record<string, unknown>): void {
    this.logger.error(`[${this.name}] Error`, { error, ...context });
  }
  
  protected createError(
    message: string,
    code: string,
    statusCode: number = 500
  ): AppError {
    return new AppError(message, code, statusCode);
  }
}
```

#### Example Service Implementation

```typescript
// lib/services/order.service.ts
export interface IOrderService extends IService {
  createOrder(data: CreateOrderDTO): Promise<Result<Order, AppError>>;
  getOrder(id: string, userId: string): Promise<Result<Order, AppError>>;
  updateOrder(id: string, data: UpdateOrderDTO): Promise<Result<Order, AppError>>;
}

export class OrderService extends BaseService implements IOrderService {
  readonly name = 'OrderService';
  
  constructor(
    logger: ILogger,
    private readonly orderRepository: IOrderRepository,
    private readonly riskService: IRiskService,
    private readonly paymentService: IPaymentService
  ) {
    super(logger, orderRepository);
  }
  
  async createOrder(data: CreateOrderDTO): Promise<Result<Order, AppError>> {
    try {
      // Validate input
      const validation = CreateOrderSchema.safeParse(data);
      if (!validation.success) {
        return err(new AppError(
          'Invalid order data',
          'VALIDATION_ERROR',
          400,
          { errors: validation.error.flatten() }
        ));
      }
      
      // Business logic
      const riskResult = await this.riskService.assessRisk(data);
      if (!riskResult.success) {
        return err(riskResult.error);
      }
      
      if (riskResult.data.requiresReview) {
        // Handle high-risk order
        return err(new AppError(
          'Order requires manual review',
          'RISK_REVIEW_REQUIRED',
          403,
          { riskScore: riskResult.data.riskScore }
        ));
      }
      
      // Create order
      const order = await this.orderRepository.create(validation.data);
      
      return ok(order);
    } catch (error) {
      this.logError(error, { data });
      return err(new AppError(
        'Failed to create order',
        'ORDER_CREATION_FAILED',
        500
      ));
    }
  }
}
```

### 3. Repository Layer

#### Base Repository Interface

```typescript
// lib/repositories/base.repository.ts
export interface IRepository {
  readonly name: string;
}

export interface IBaseRepository<T> extends IRepository {
  findById(id: string): Promise<T | null>;
  findMany(filter: Filter<T>): Promise<T[]>;
  create(data: CreateData<T>): Promise<T>;
  update(id: string, data: UpdateData<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  abstract readonly name: string;
  abstract readonly model: PrismaModel<T>;
  
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly cache?: ICache
  ) {}
  
  async findById(id: string): Promise<T | null> {
    // Check cache first
    if (this.cache) {
      const cached = await this.cache.get<T>(`${this.name}:${id}`);
      if (cached) return cached;
    }
    
    const result = await this.model.findUnique({ where: { id } });
    
    // Cache result
    if (result && this.cache) {
      await this.cache.set(`${this.name}:${id}`, result, 300); // 5 min TTL
    }
    
    return result;
  }
  
  // ... other methods
}
```

### 4. Validation Layer

#### Request Validation Middleware

```typescript
// lib/middleware/validation.ts
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest): Promise<Result<T, AppError>> => {
    try {
      const body = await req.json();
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
      return err(new AppError(
        'Invalid request body',
        'INVALID_JSON',
        400
      ));
    }
  };
}

// Usage in API route
export async function POST(req: NextRequest) {
  const validation = await validateRequest(CreateOrderSchema)(req);
  
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: validation.error },
      { status: validation.error.statusCode }
    );
  }
  
  const result = await orderService.createOrder(validation.data);
  
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error.statusCode }
    );
  }
  
  return NextResponse.json({ success: true, data: result.data });
}
```

### 5. Error Handling System

#### Centralized Error Handler

```typescript
// lib/errors/handler.ts
export class ErrorHandler {
  constructor(
    private readonly logger: ILogger,
    private readonly alertService: IAlertService
  ) {}
  
  async handle(error: unknown, context?: Record<string, unknown>): Promise<ApiResponse> {
    // Type guard for AppError
    if (error instanceof AppError) {
      this.logger.error(error.message, {
        code: error.code,
        statusCode: error.statusCode,
        context: error.context,
        ...context
      });
      
      // Alert staff for critical errors
      if (error.statusCode >= 500) {
        await this.alertService.notifyStaff({
          severity: 'high',
          message: error.message,
          context: { ...error.context, ...context }
        });
      }
      
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.context
        }
      };
    }
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: formatZodErrors(error)
        }
      };
    }
    
    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(error);
    }
    
    // Unknown error - log and alert
    this.logger.error('Unhandled error', { error, ...context });
    await this.alertService.notifyStaff({
      severity: 'critical',
      message: 'Unhandled error occurred',
      context: { error: String(error), ...context }
    });
    
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    };
  }
  
  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): ApiResponse {
    switch (error.code) {
      case 'P2002':
        return {
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'A record with this value already exists',
            details: { field: error.meta?.target }
          }
        };
      case 'P2025':
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Record not found'
          }
        };
      default:
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database operation failed'
          }
        };
    }
  }
}
```

### 6. Retry Logic with Exponential Backoff

```typescript
// lib/utils/retry.ts
export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let attempt = 0;
  let delay = options.initialDelay;
  
  while (attempt < options.maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      
      // Check if error is retryable
      if (options.retryableErrors && error instanceof AppError) {
        if (!options.retryableErrors.includes(error.code)) {
          throw error;
        }
      }
      
      // Last attempt - throw error
      if (attempt >= options.maxAttempts) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff
      delay = Math.min(delay * options.backoffMultiplier, options.maxDelay);
    }
  }
  
  throw new Error('Retry logic failed unexpectedly');
}

// Usage
const result = await withRetry(
  () => externalApiService.call(),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT']
  }
);
```

## Data Models

### Enhanced Type Definitions

```typescript
// lib/types/domain.ts

// Branded types for type safety
export type UserId = string & { readonly __brand: 'UserId' };
export type OrderId = string & { readonly __brand: 'OrderId' };
export type Email = string & { readonly __brand: 'Email' };

// Type guards
export function isUserId(value: string): value is UserId {
  return /^[a-z0-9]{25}$/.test(value); // cuid format
}

export function isEmail(value: string): value is Email {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Domain models with validation
export interface CreateOrderDTO {
  userId: UserId;
  items: OrderItemDTO[];
  billingAddress: AddressDTO;
  paymentMethod: PaymentMethod;
}

export const CreateOrderSchema = z.object({
  userId: z.string().refine(isUserId, 'Invalid user ID'),
  items: z.array(OrderItemSchema).min(1, 'At least one item required'),
  billingAddress: AddressSchema,
  paymentMethod: z.enum(['credit_card', 'debit_card', 'bank_transfer'])
});
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Request Validation
*For any* API route that accepts a request body, validation using Zod schemas should occur before any business logic executes, and invalid requests should return 400 status codes with structured error details.
**Validates: Requirements 1.2**

### Property 2: Error Response Structure
*For any* API route that encounters an error, the response should follow the ApiResponse structure with success: false, an error object containing code and message, and appropriate HTTP status code.
**Validates: Requirements 2.1**

### Property 3: Database Error Context
*For any* database operation that fails, the error should be wrapped in an AppError with business context including the operation type and relevant entity IDs before being propagated to the caller.
**Validates: Requirements 2.2**

### Property 4: Validation Error Messages
*For any* validation failure, the system should return field-level error messages in a structured format mapping field paths to human-readable error descriptions.
**Validates: Requirements 2.3**

### Property 5: Retry Behavior
*For any* external API call that fails with a retryable error, the system should retry with exponential backoff up to the configured maximum attempts before failing.
**Validates: Requirements 2.4**

### Property 6: Critical Error Alerts
*For any* error with status code >= 500, the system should call the alert service to notify staff with error details and context.
**Validates: Requirements 2.5**

### Property 7: Service Result Types
*For any* service method that performs an operation, the return type should be Result<T, AppError> indicating either success with data or failure with a typed error.
**Validates: Requirements 3.5**

### Property 8: Risk Assessment Bounds
*For any* risk assessment calculation, the risk score should be between 0 and 100 inclusive, and the risk level should correctly correspond to the score ranges (LOW: 0-25, MEDIUM: 26-50, HIGH: 51-75, CRITICAL: 76-100).
**Validates: Requirements 4.1**

### Property 9: Validation Boundary Cases
*For any* validation function, inputs at boundary values (empty strings, zero, maximum lengths, edge dates) should be correctly classified as valid or invalid according to the validation rules.
**Validates: Requirements 4.2**

### Property 10: Form Mapping Round Trip
*For any* valid form data, mapping to database format and then back to form format should produce equivalent data (preserving all fields and values).
**Validates: Requirements 4.3**

### Property 11: Payment State Transitions
*For any* payment processing operation, state transitions should follow valid paths (PENDING → PAID → COMPLETED or PENDING → FAILED), and invalid transitions should be rejected.
**Validates: Requirements 4.4**

### Property 12: Pagination Consistency
*For any* paginated query, fetching all pages and concatenating results should produce the same set of items as fetching without pagination (order-preserved).
**Validates: Requirements 5.3**

### Property 13: Cache Consistency
*For any* cached data, the cached value should match the database value at the time of caching, and cache misses should fetch from the database.
**Validates: Requirements 5.5**

### Property 14: Input Sanitization
*For any* user input containing HTML or script tags, the sanitized output should have all potentially dangerous tags and attributes removed while preserving safe content.
**Validates: Requirements 6.1**

### Property 15: File Upload Validation
*For any* file upload, files with disallowed extensions or MIME types should be rejected before processing, and only whitelisted file types should be accepted.
**Validates: Requirements 6.3**

### Property 16: Token Randomness
*For any* authentication token generated, the token should use cryptographically secure random values (crypto.randomBytes) and have sufficient entropy (minimum 32 bytes).
**Validates: Requirements 6.4**

### Property 17: Log Redaction
*For any* log entry, sensitive patterns (email addresses, phone numbers, SSNs, credit card numbers, passwords) should be redacted or masked before output.
**Validates: Requirements 6.5**

### Property 18: Table Sorting Correctness
*For any* data table with sorting enabled, sorting by a column should produce results in the correct order (ascending or descending) according to the column's data type.
**Validates: Requirements 9.4**

## Error Handling

### Error Hierarchy

```
Error (JavaScript base)
  └── AppError (application errors)
        ├── ValidationError (400)
        ├── AuthenticationError (401)
        ├── AuthorizationError (403)
        ├── NotFoundError (404)
        ├── ConflictError (409)
        └── InternalError (500)
```

### Error Logging Strategy

1. **Development**: Full stack traces, verbose context
2. **Production**: Sanitized messages, error IDs for tracking
3. **Critical Errors**: Immediate staff alerts via internal system
4. **User-Facing**: Friendly messages without technical details

## Testing Strategy

### Unit Testing

**Framework**: Vitest (fast, TypeScript-native)

**Coverage Goals**:
- Validation functions: 100%
- Service methods: 90%
- Utility functions: 95%
- API routes: 80%

**Test Organization**:
```
src/
  lib/
    services/
      order.service.ts
      order.service.test.ts  ← Co-located tests
```

### Property-Based Testing

**Framework**: fast-check (TypeScript property testing library)

**Configuration**: Minimum 100 iterations per property test

**Test Tagging**: Each property test must include a comment:
```typescript
/**
 * Feature: code-quality-improvements, Property 1: API Request Validation
 */
test('API routes validate requests before processing', () => {
  fc.assert(
    fc.property(
      fc.record({
        body: fc.anything(),
        route: fc.constantFrom('/api/orders', '/api/filings', '/api/users')
      }),
      async ({ body, route }) => {
        // Property test implementation
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test Examples**:

1. **Risk Score Bounds** (Property 8):
```typescript
fc.assert(
  fc.property(
    fc.record({
      customer: customerDataArbitrary,
      order: orderDataArbitrary
    }),
    async ({ customer, order }) => {
      const result = await riskService.assessRisk(customer, order);
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      
      // Verify level matches score
      if (result.riskScore <= 25) expect(result.riskLevel).toBe('LOW');
      else if (result.riskScore <= 50) expect(result.riskLevel).toBe('MEDIUM');
      else if (result.riskScore <= 75) expect(result.riskLevel).toBe('HIGH');
      else expect(result.riskLevel).toBe('CRITICAL');
    }
  ),
  { numRuns: 100 }
);
```

2. **Form Mapping Round Trip** (Property 10):
```typescript
fc.assert(
  fc.property(
    llcFormDataArbitrary,
    (formData) => {
      const dbData = mapLLCFormToDatabase(formData);
      const roundTrip = mapDatabaseToLLCForm(dbData);
      
      expect(roundTrip).toEqual(formData);
    }
  ),
  { numRuns: 100 }
);
```

3. **Input Sanitization** (Property 14):
```typescript
fc.assert(
  fc.property(
    fc.string().map(s => s + '<script>alert("xss")</script>'),
    (maliciousInput) => {
      const sanitized = sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('onerror=');
    }
  ),
  { numRuns: 100 }
);
```

### Integration Testing

**Framework**: Playwright (for E2E), Vitest (for API integration)

**Test Database**: Separate test database with seed data

**Key Scenarios**:
- Complete order flow (form → validation → payment → fulfillment)
- Error handling paths (validation failures, payment failures)
- Authentication and authorization flows

### Test Utilities

```typescript
// test/utils/generators.ts
import fc from 'fast-check';

export const userIdArbitrary = fc.string().filter(isUserId);
export const emailArbitrary = fc.emailAddress().map(e => e as Email);

export const addressArbitrary = fc.record({
  street: fc.string({ minLength: 1, maxLength: 100 }),
  city: fc.string({ minLength: 1, maxLength: 50 }),
  state: fc.constantFrom('FL', 'CA', 'NY', 'TX'),
  zipCode: fc.string().filter(validateZipCode)
});

export const customerDataArbitrary = fc.record({
  email: emailArbitrary,
  name: fc.string(),
  phone: fc.option(fc.string().filter(validatePhone)),
  accountAge: fc.integer({ min: 0, max: 3650 }),
  previousOrders: fc.integer({ min: 0, max: 100 }),
  previousChargebacks: fc.integer({ min: 0, max: 10 })
});
```

## Performance Optimization

### Database Query Optimization

1. **Select Only Needed Fields**:
```typescript
// Before
const user = await prisma.user.findUnique({ where: { id } });

// After
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, firstName: true, lastName: true }
});
```

2. **Avoid N+1 Queries**:
```typescript
// Before
const orders = await prisma.order.findMany();
for (const order of orders) {
  order.items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
}

// After
const orders = await prisma.order.findMany({
  include: { orderItems: true }
});
```

3. **Cursor-Based Pagination**:
```typescript
async function getOrdersPaginated(cursor?: string, limit: number = 20) {
  return await prisma.order.findMany({
    take: limit + 1, // Fetch one extra to check if there are more
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' }
  });
}
```

### Caching Strategy

**Cache Layer**: Redis (or in-memory for development)

**Cache Keys**: `{entity}:{id}` or `{entity}:{query-hash}`

**TTL Strategy**:
- User data: 5 minutes
- Order data: 2 minutes
- Static data (services, packages): 1 hour
- Risk assessments: No cache (always fresh)

**Cache Invalidation**:
- On update: Invalidate specific key
- On delete: Invalidate specific key
- On create: No invalidation needed

## Security Considerations

### Input Sanitization

```typescript
// lib/security/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

export function sanitizeForLog(data: unknown): unknown {
  const sensitive = /\b(password|token|secret|ssn|credit_?card)\b/i;
  
  if (typeof data === 'string') {
    return data.replace(sensitive, '[REDACTED]');
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sensitive.test(key) ? '[REDACTED]' : sanitizeForLog(value);
    }
    return sanitized;
  }
  
  return data;
}
```

### Authentication Token Generation

```typescript
// lib/security/tokens.ts
import crypto from 'crypto';

export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function generateSessionId(): string {
  return generateSecureToken(32);
}

export function generateApiKey(): string {
  return `legalops_${generateSecureToken(48)}`;
}
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Set up Result types and AppError
- Create base service and repository classes
- Implement error handler
- Add validation middleware

### Phase 2: Service Layer (Week 3-4)
- Refactor OrderService
- Refactor RiskService
- Refactor PaymentService
- Add dependency injection

### Phase 3: Testing Infrastructure (Week 5-6)
- Set up Vitest and fast-check
- Create test utilities and generators
- Write property tests for validation
- Write property tests for risk scoring

### Phase 4: Repository Layer (Week 7-8)
- Create repository interfaces
- Implement caching layer
- Optimize database queries
- Add pagination support

### Phase 5: Security Hardening (Week 9-10)
- Implement input sanitization
- Add log redaction
- Enhance token generation
- Security audit

### Phase 6: Documentation & DX (Week 11-12)
- Add JSDoc comments
- Set up pre-commit hooks
- Configure Prettier
- Create ADRs for key decisions

## Migration Strategy

1. **Incremental Adoption**: New features use new patterns, old code migrated gradually
2. **Backward Compatibility**: Maintain existing API contracts during migration
3. **Feature Flags**: Use flags to toggle between old and new implementations
4. **Monitoring**: Track error rates and performance during migration
5. **Rollback Plan**: Keep old code paths available for quick rollback if needed

## Success Metrics

- **Type Safety**: Zero `any` types in business logic (measured by TypeScript compiler)
- **Test Coverage**: 85%+ code coverage (measured by Vitest)
- **Error Handling**: 100% of API routes use structured error responses
- **Performance**: P95 API response time < 500ms
- **Security**: Zero high-severity vulnerabilities (measured by npm audit)
- **Developer Experience**: Build time < 5 minutes, test suite < 30 seconds
