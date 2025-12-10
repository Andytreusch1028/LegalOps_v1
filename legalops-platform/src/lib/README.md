# LegalOps Platform - Service and Repository Architecture

This directory contains the core service and repository architecture for the LegalOps platform.

## Overview

The architecture follows these principles:

1. **Separation of Concerns**: Business logic in services, data access in repositories
2. **Dependency Injection**: Services receive dependencies through constructors
3. **Type Safety**: Result types for error handling without exceptions
4. **Logging**: Structured logging throughout the application
5. **Caching**: Optional caching layer for improved performance

## Directory Structure

```
lib/
├── interfaces/          # Interface definitions
│   ├── logger.interface.ts
│   ├── service.interface.ts
│   ├── repository.interface.ts
│   └── cache.interface.ts
├── services/           # Service implementations
│   ├── base.service.ts
│   └── order.service.example.ts
├── repositories/       # Repository implementations
│   ├── base.repository.ts
│   └── order.repository.example.ts
├── logging/           # Logging implementations
│   └── console-logger.ts
├── caching/           # Caching implementations
│   └── memory-cache.ts
└── types/             # Type definitions
    ├── result.ts
    └── api.ts
```

## Creating a New Service

### 1. Define the Service Interface

```typescript
// lib/services/user.service.ts
import { IService } from '../interfaces/service.interface';
import { Result, AppError } from '../types/result';

export interface IUserService extends IService {
  getUser(id: string): Promise<Result<User, AppError>>;
  createUser(data: CreateUserDTO): Promise<Result<User, AppError>>;
}
```

### 2. Implement the Service

```typescript
import { BaseService } from './base.service';
import { ILogger } from '../interfaces/logger.interface';
import { ok, err } from '../types/result';

export class UserService extends BaseService implements IUserService {
  readonly name = 'UserService';

  constructor(
    logger: ILogger,
    private readonly userRepository: IUserRepository
  ) {
    super(logger);
  }

  async getUser(id: string): Promise<Result<User, AppError>> {
    try {
      this.logDebug('Fetching user', { userId: id });

      const user = await this.userRepository.findById(id);

      if (!user) {
        return err(this.createError(
          'User not found',
          'USER_NOT_FOUND',
          404
        ));
      }

      return ok(user);
    } catch (error) {
      const appError = this.handleError(
        error,
        'Failed to fetch user',
        'USER_FETCH_FAILED'
      );
      return err(appError);
    }
  }

  async createUser(data: CreateUserDTO): Promise<Result<User, AppError>> {
    try {
      this.logInfo('Creating user', { email: data.email });

      // Validation
      if (!data.email) {
        return err(this.createError(
          'Email is required',
          'VALIDATION_ERROR',
          400
        ));
      }

      // Business logic
      const user = await this.userRepository.create(data);

      this.logInfo('User created', { userId: user.id });

      return ok(user);
    } catch (error) {
      const appError = this.handleError(
        error,
        'Failed to create user',
        'USER_CREATION_FAILED'
      );
      return err(appError);
    }
  }
}
```

## Creating a New Repository

### 1. Define the Repository Interface

```typescript
// lib/repositories/user.repository.ts
import { IBaseRepository } from '../interfaces/repository.interface';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByRole(role: string): Promise<User[]>;
}
```

### 2. Implement the Repository

```typescript
import { BaseRepository } from './base.repository';
import { PrismaClient } from '@/generated/prisma';
import { ILogger } from '../interfaces/logger.interface';
import { ICache } from '../interfaces/cache.interface';

export class UserRepository extends BaseRepository<User> implements IUserRepository {
  readonly name = 'UserRepository';
  protected cacheTTL = 300; // 5 minutes

  constructor(
    prisma: PrismaClient,
    logger: ILogger,
    cache?: ICache
  ) {
    super(prisma, logger, cache);
  }

  protected getModel() {
    return this.prisma.user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email } as any);
  }

  async findByRole(role: string): Promise<User[]> {
    return this.findMany({ role } as any);
  }
}
```

## Dependency Injection Pattern

### Setting Up Dependencies

```typescript
// lib/di/container.ts
import { prisma } from '../db';
import { createLogger } from '../logging/console-logger';
import { createCache } from '../caching/memory-cache';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';

// Create shared instances
const logger = createLogger();
const cache = createCache();

// Create repositories
const userRepository = new UserRepository(prisma, logger, cache);

// Create services
export const userService = new UserService(logger, userRepository);
```

### Using in API Routes

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/di/container';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await userService.getUser(params.id);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error.statusCode }
    );
  }

  return NextResponse.json({
    success: true,
    data: result.data
  });
}
```

## Result Type Pattern

The `Result<T, E>` type provides type-safe error handling:

```typescript
// Success case
const result = await userService.getUser(id);
if (result.success) {
  console.log(result.data); // Type: User
}

// Error case
if (!result.success) {
  console.error(result.error); // Type: AppError
  console.log(result.error.code);
  console.log(result.error.statusCode);
}
```

## Logging

All services have access to structured logging:

```typescript
// In a service method
this.logInfo('User created', { userId: user.id });
this.logWarn('Unusual activity detected', { userId, action });
this.logError(error, { context: 'user creation' });
this.logDebug('Processing step 1', { data });
```

## Caching

Repositories automatically cache `findById` results:

```typescript
// First call - fetches from database and caches
const user1 = await userRepository.findById(id);

// Second call - returns from cache
const user2 = await userRepository.findById(id);

// After update - cache is invalidated
await userRepository.update(id, { name: 'New Name' });

// Next call - fetches from database again
const user3 = await userRepository.findById(id);
```

## Error Handling

Services provide consistent error handling:

```typescript
// Create typed errors
const error = this.createError(
  'User not found',
  'USER_NOT_FOUND',
  404,
  { userId: id }
);

// Handle and log errors
const appError = this.handleError(
  error,
  'Failed to fetch user',
  'USER_FETCH_FAILED',
  500,
  { userId: id }
);
```

## Best Practices

1. **Always use Result types** for service methods that can fail
2. **Log important operations** using the provided logging methods
3. **Validate input** at the service layer before calling repositories
4. **Use dependency injection** to make services testable
5. **Keep repositories simple** - complex queries should be in the repository, business logic in services
6. **Cache strategically** - use appropriate TTLs for different entity types
7. **Handle errors gracefully** - provide meaningful error messages and codes

## Testing

### Testing Services

```typescript
import { describe, it, expect, vi } from 'vitest';
import { UserService } from './user.service';
import { createLogger } from '../logging/console-logger';

describe('UserService', () => {
  it('should get user by id', async () => {
    const mockRepository = {
      findById: vi.fn().mockResolvedValue({ id: '1', email: 'test@example.com' })
    };

    const service = new UserService(
      createLogger('UserService'),
      mockRepository as any
    );

    const result = await service.getUser('1');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('1');
    }
  });
});
```

### Testing Repositories

```typescript
import { describe, it, expect } from 'vitest';
import { UserRepository } from './user.repository';
import { prisma } from '../db';
import { createLogger } from '../logging/console-logger';

describe('UserRepository', () => {
  it('should find user by email', async () => {
    const repository = new UserRepository(
      prisma,
      createLogger('UserRepository')
    );

    const user = await repository.findByEmail('test@example.com');

    expect(user).toBeDefined();
  });
});
```

## Migration Guide

To migrate existing code to use this architecture:

1. **Identify business logic** in API routes and move to services
2. **Create repository classes** for data access
3. **Update API routes** to use services instead of direct Prisma calls
4. **Add error handling** using Result types
5. **Add logging** to track operations
6. **Add caching** where appropriate

See `order.service.example.ts` and `order.repository.example.ts` for complete examples.
