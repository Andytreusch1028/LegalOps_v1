# ADR-003: Repository Pattern with Caching

## Status
Accepted

## Context
The LegalOps platform needs efficient data access with caching capabilities to improve performance and reduce database load. Direct Prisma usage throughout the application leads to:

- Repeated database queries for the same data
- Inconsistent query patterns
- Difficulty in implementing caching
- Poor query performance monitoring
- Tight coupling to Prisma ORM

## Decision
We will implement the Repository pattern with integrated caching support.

### Key Components

#### Base Repository
```typescript
abstract class BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly logger: ILogger,
    protected readonly cache?: ICache
  ) {}
  
  protected abstract getModel(): any;
  protected cacheTTL = 300; // 5 minutes default
}
```

#### Cache Interface
```typescript
interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

#### Memory Cache Implementation
```typescript
class MemoryCache implements ICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      return null;
    }
    return entry.value as T;
  }
}
```

## Consequences

### Positive
- **Performance**: Cached queries reduce database load
- **Consistency**: Standardized data access patterns
- **Monitoring**: Query performance tracking built-in
- **Flexibility**: Easy to switch between cache implementations
- **Cache Invalidation**: Automatic cache invalidation on updates
- **Type Safety**: Strongly typed repository methods

### Negative
- **Complexity**: Additional abstraction layer
- **Memory Usage**: In-memory cache consumes RAM
- **Cache Coherence**: Risk of stale data if not properly invalidated
- **Learning Curve**: Developers need to understand caching patterns

## Implementation Details

### Repository Implementation
```typescript
export class OrderRepository extends BaseRepository<Order> implements IOrderRepository {
  readonly name = 'OrderRepository';
  protected cacheTTL = 120; // 2 minutes for orders

  protected getModel() {
    return this.prisma.order;
  }

  async findById(id: string): Promise<Order | null> {
    // Check cache first
    if (this.cache) {
      const cacheKey = this.getCacheKey(id);
      const cached = await this.cache.get<Order>(cacheKey);
      if (cached) {
        this.logger.debug(`[${this.name}] Cache hit for ${cacheKey}`);
        return cached;
      }
    }

    // Fetch from database
    const order = await this.getModel().findUnique({ where: { id } });

    // Cache the result
    if (order && this.cache) {
      const cacheKey = this.getCacheKey(id);
      await this.cache.set(cacheKey, order, this.cacheTTL);
    }

    return order;
  }

  async update(id: string, data: any): Promise<Order> {
    const order = await this.getModel().update({ where: { id }, data });
    
    // Invalidate cache
    if (this.cache) {
      await this.cache.delete(this.getCacheKey(id));
    }
    
    return order;
  }
}
```

### Cache Key Strategy
```typescript
protected getCacheKey(id: string): string {
  return `${this.name}:${id}`;
}

// For complex queries
protected getQueryCacheKey(query: string, params: any): string {
  const paramHash = createHash('md5').update(JSON.stringify(params)).digest('hex');
  return `${this.name}:query:${query}:${paramHash}`;
}
```

### Cache Invalidation Patterns
```typescript
// Single entity invalidation
await this.cache.delete(this.getCacheKey(orderId));

// Pattern-based invalidation
await this.cache.deletePattern(`${this.name}:user:${userId}:*`);

// Full cache clear (use sparingly)
await this.cache.clear();
```

## Caching Strategy

### Cache TTL by Entity Type
- **Orders**: 2 minutes (frequently updated)
- **Users**: 10 minutes (moderately stable)
- **Business Entities**: 30 minutes (rarely updated)
- **Static Data**: 1 hour (configuration, etc.)

### Cache Invalidation Rules
1. **Update Operations**: Invalidate specific entity cache
2. **Delete Operations**: Invalidate specific entity cache
3. **Bulk Operations**: Invalidate related cache patterns
4. **External Updates**: Use cache versioning or TTL

### Cache Warming
```typescript
// Pre-populate cache for frequently accessed data
async warmCache(): Promise<void> {
  const recentOrders = await this.findRecent(100);
  for (const order of recentOrders) {
    const cacheKey = this.getCacheKey(order.id);
    await this.cache.set(cacheKey, order, this.cacheTTL);
  }
}
```

## Performance Monitoring

### Query Performance Logging
```typescript
const performanceLogger = createQueryPerformanceLogger(logger);

const result = await performanceLogger.measureQuery(
  'findOrdersByUser',
  () => this.prisma.order.findMany({ where: { userId } }),
  { userId }
);
```

### Cache Hit Rate Monitoring
```typescript
class CacheMetrics {
  private hits = 0;
  private misses = 0;
  
  recordHit(): void { this.hits++; }
  recordMiss(): void { this.misses++; }
  
  getHitRate(): number {
    return this.hits / (this.hits + this.misses);
  }
}
```

## Testing Strategy

### Repository Testing
```typescript
describe('OrderRepository', () => {
  let repository: OrderRepository;
  let mockCache: jest.Mocked<ICache>;

  beforeEach(() => {
    mockCache = createMockCache();
    repository = new OrderRepository(prisma, logger, mockCache);
  });

  it('should return cached value on cache hit', async () => {
    const mockOrder = createMockOrder();
    mockCache.get.mockResolvedValue(mockOrder);

    const result = await repository.findById('test-id');

    expect(result).toEqual(mockOrder);
    expect(mockCache.get).toHaveBeenCalledWith('OrderRepository:test-id');
  });

  it('should invalidate cache on update', async () => {
    await repository.update('test-id', { status: 'COMPLETED' });

    expect(mockCache.delete).toHaveBeenCalledWith('OrderRepository:test-id');
  });
});
```

### Cache Testing
```typescript
describe('MemoryCache', () => {
  let cache: MemoryCache;

  it('should expire entries after TTL', async () => {
    await cache.set('key', 'value', 100); // 100ms TTL
    
    expect(await cache.get('key')).toBe('value');
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(await cache.get('key')).toBeNull();
  });
});
```

## Production Considerations

### Redis Integration
```typescript
class RedisCache implements ICache {
  constructor(private redis: Redis) {}
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }
}
```

### Cache Configuration
```typescript
const cacheConfig = {
  development: () => new MemoryCache(),
  production: () => new RedisCache(createRedisClient()),
  test: () => new MemoryCache()
};
```

## Alternatives Considered

1. **Direct Prisma with Manual Caching**: Rejected due to inconsistency
2. **ORM-Level Caching**: Rejected due to lack of control
3. **HTTP-Level Caching**: Rejected as insufficient for data layer
4. **No Caching**: Rejected due to performance requirements

## Migration Path

1. **Phase 1**: Implement base repository and cache interfaces
2. **Phase 2**: Create memory cache implementation
3. **Phase 3**: Migrate existing data access to repositories
4. **Phase 4**: Add Redis cache for production
5. **Phase 5**: Implement cache warming and monitoring

## References
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Cache-Aside Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [Redis Caching Strategies](https://redis.io/docs/manual/patterns/)