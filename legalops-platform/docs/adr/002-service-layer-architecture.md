# ADR-002: Service Layer Architecture

## Status
Accepted

## Context
The LegalOps platform requires a well-structured service layer to handle business logic, data access, and external integrations. Without proper architecture, we risk:

- Tight coupling between components
- Inconsistent error handling and logging
- Difficulty in testing and mocking
- Poor separation of concerns
- Inconsistent dependency injection

## Decision
We will implement a layered service architecture with dependency injection and consistent patterns.

### Architecture Layers
1. **API Layer**: Next.js route handlers
2. **Service Layer**: Business logic and orchestration
3. **Repository Layer**: Data access abstraction
4. **Infrastructure Layer**: External services and utilities

### Key Components

#### BaseService Abstract Class
```typescript
abstract class BaseService {
  protected readonly logger: ILogger;
  abstract readonly name: string;
  
  constructor(logger: ILogger) {
    this.logger = logger;
  }
}
```

#### Service Interfaces
```typescript
interface IOrderService {
  createOrder(data: CreateOrderData): Promise<Result<Order>>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Result<Order>>;
}
```

#### ServiceFactory for Dependency Injection
```typescript
class ServiceFactory {
  static getOrderService(): IOrderService {
    return new OrderService(
      this.getLogger(),
      this.getOrderRepository(),
      this.getRiskService()
    );
  }
}
```

## Consequences

### Positive
- **Separation of Concerns**: Clear boundaries between layers
- **Testability**: Easy to mock dependencies and test in isolation
- **Consistency**: All services follow the same patterns
- **Maintainability**: Changes are localized to specific layers
- **Dependency Injection**: Loose coupling between components
- **Logging**: Consistent logging across all services

### Negative
- **Complexity**: More abstraction layers to understand
- **Boilerplate**: More interfaces and factory methods
- **Learning Curve**: Developers need to understand the architecture

## Implementation Details

### Service Structure
```typescript
export class OrderService extends BaseService implements IOrderService {
  readonly name = 'OrderService';

  constructor(
    logger: ILogger,
    private readonly orderRepository: IOrderRepository,
    private readonly riskService?: IRiskService
  ) {
    super(logger);
  }

  async createOrder(data: CreateOrderData): Promise<Result<Order>> {
    this.logger.debug(`[${this.name}] Creating order`);
    
    // Business logic here
    const result = await this.orderRepository.create(data);
    
    if (!result.success) {
      this.logger.error(`[${this.name}] Failed to create order`, result.error);
      return result;
    }
    
    this.logger.info(`[${this.name}] Order created successfully`, { orderId: result.data.id });
    return result;
  }
}
```

### Repository Pattern
```typescript
export class OrderRepository extends BaseRepository<Order> implements IOrderRepository {
  readonly name = 'OrderRepository';
  
  constructor(prisma: PrismaClient, logger: ILogger, cache?: ICache) {
    super(prisma, logger, cache);
  }
  
  async findByUserId(userId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
```

## Patterns Used

1. **Dependency Injection**: Services receive dependencies through constructor
2. **Interface Segregation**: Small, focused interfaces for each service
3. **Factory Pattern**: ServiceFactory manages object creation
4. **Repository Pattern**: Data access abstraction
5. **Template Method**: BaseService provides common functionality

## Testing Strategy

### Unit Testing
```typescript
describe('OrderService', () => {
  let service: OrderService;
  let mockRepository: jest.Mocked<IOrderRepository>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    mockLogger = createMockLogger();
    service = new OrderService(mockLogger, mockRepository);
  });

  it('should create order successfully', async () => {
    mockRepository.create.mockResolvedValue(success(mockOrder));
    
    const result = await service.createOrder(mockData);
    
    expect(result.success).toBe(true);
    expect(mockRepository.create).toHaveBeenCalledWith(mockData);
  });
});
```

## Migration Strategy

1. **Phase 1**: Create base classes and interfaces
2. **Phase 2**: Refactor existing services one by one
3. **Phase 3**: Update API routes to use new services
4. **Phase 4**: Remove old service implementations

## Alternatives Considered

1. **Direct Database Access**: Rejected due to tight coupling
2. **Monolithic Service**: Rejected due to poor separation of concerns
3. **Functional Programming**: Rejected due to team familiarity with OOP

## References
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Dependency Injection Principles](https://martinfowler.com/articles/injection.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)