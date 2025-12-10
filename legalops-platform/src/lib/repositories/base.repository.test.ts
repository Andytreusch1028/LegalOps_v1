import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseRepository } from './base.repository';
import { ILogger } from '../interfaces/logger.interface';
import { ICache } from '../interfaces/cache.interface';
import { PrismaClient } from '@/generated/prisma';

/**
 * Test entity type
 */
interface TestEntity {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Test implementation of BaseRepository
 */
class TestRepository extends BaseRepository<TestEntity> {
  readonly name = 'TestRepository';

  constructor(
    prisma: PrismaClient,
    logger: ILogger,
    cache?: ICache
  ) {
    super(prisma, logger, cache);
  }

  protected getModel() {
    return this.mockModel;
  }

  // Mock model for testing
  public mockModel: any;
}

describe('BaseRepository', () => {
  let mockPrisma: PrismaClient;
  let mockLogger: ILogger;
  let mockCache: ICache;
  let repository: TestRepository;
  let mockModel: any;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      deletePattern: vi.fn(),
      clear: vi.fn(),
      has: vi.fn()
    };

    mockModel = {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    };

    mockPrisma = {} as PrismaClient;

    repository = new TestRepository(mockPrisma, mockLogger, mockCache);
    repository.mockModel = mockModel;
  });

  describe('name property', () => {
    it('should have a name property', () => {
      expect(repository.name).toBe('TestRepository');
    });
  });

  describe('findById', () => {
    const testEntity: TestEntity = {
      id: '1',
      name: 'Test',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should return cached entity if available', async () => {
      vi.mocked(mockCache.get).mockResolvedValue(testEntity);

      const result = await repository.findById('1');

      expect(result).toEqual(testEntity);
      expect(mockCache.get).toHaveBeenCalledWith('TestRepository:1');
      expect(mockModel.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache if not in cache', async () => {
      vi.mocked(mockCache.get).mockResolvedValue(null);
      mockModel.findUnique.mockResolvedValue(testEntity);

      const result = await repository.findById('1');

      expect(result).toEqual(testEntity);
      expect(mockModel.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockCache.set).toHaveBeenCalledWith(
        'TestRepository:1',
        testEntity,
        300
      );
    });

    it('should work without cache', async () => {
      const repoWithoutCache = new TestRepository(mockPrisma, mockLogger);
      repoWithoutCache.mockModel = mockModel;
      mockModel.findUnique.mockResolvedValue(testEntity);

      const result = await repoWithoutCache.findById('1');

      expect(result).toEqual(testEntity);
      expect(mockModel.findUnique).toHaveBeenCalled();
    });

    it('should return null if entity not found', async () => {
      vi.mocked(mockCache.get).mockResolvedValue(null);
      mockModel.findUnique.mockResolvedValue(null);

      const result = await repository.findById('1');

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    const testEntities: TestEntity[] = [
      {
        id: '1',
        name: 'Test 1',
        email: 'test1@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Test 2',
        email: 'test2@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    it('should find entities without filter', async () => {
      mockModel.findMany.mockResolvedValue(testEntities);

      const result = await repository.findMany();

      expect(result).toEqual(testEntities);
      expect(mockModel.findMany).toHaveBeenCalledWith({});
    });

    it('should apply limit filter', async () => {
      mockModel.findMany.mockResolvedValue([testEntities[0]]);

      await repository.findMany({ limit: 1 });

      expect(mockModel.findMany).toHaveBeenCalledWith({ take: 1 });
    });

    it('should apply offset filter', async () => {
      mockModel.findMany.mockResolvedValue(testEntities);

      await repository.findMany({ offset: 10 });

      expect(mockModel.findMany).toHaveBeenCalledWith({ skip: 10 });
    });

    it('should apply orderBy filter', async () => {
      mockModel.findMany.mockResolvedValue(testEntities);

      await repository.findMany({
        orderBy: { field: 'name', direction: 'asc' }
      });

      expect(mockModel.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' }
      });
    });
  });

  describe('create', () => {
    const newEntity = {
      name: 'New Test',
      email: 'new@example.com'
    };

    const createdEntity: TestEntity = {
      id: '1',
      ...newEntity,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should create entity', async () => {
      mockModel.create.mockResolvedValue(createdEntity);

      const result = await repository.create(newEntity as any);

      expect(result).toEqual(createdEntity);
      expect(mockModel.create).toHaveBeenCalledWith({ data: newEntity });
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[TestRepository] Created entity with id: 1'
      );
    });
  });

  describe('update', () => {
    const updateData = { name: 'Updated Name' };
    const updatedEntity: TestEntity = {
      id: '1',
      name: 'Updated Name',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should update entity and invalidate cache', async () => {
      mockModel.update.mockResolvedValue(updatedEntity);

      const result = await repository.update('1', updateData);

      expect(result).toEqual(updatedEntity);
      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData
      });
      expect(mockCache.delete).toHaveBeenCalledWith('TestRepository:1');
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[TestRepository] Updated entity with id: 1'
      );
    });
  });

  describe('delete', () => {
    it('should delete entity and invalidate cache', async () => {
      mockModel.delete.mockResolvedValue({});

      await repository.delete('1');

      expect(mockModel.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockCache.delete).toHaveBeenCalledWith('TestRepository:1');
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[TestRepository] Deleted entity with id: 1'
      );
    });
  });

  describe('count', () => {
    it('should count entities', async () => {
      mockModel.count.mockResolvedValue(5);

      const result = await repository.count();

      expect(result).toBe(5);
      expect(mockModel.count).toHaveBeenCalledWith({});
    });
  });

  describe('exists', () => {
    it('should return true if entity exists in cache', async () => {
      vi.mocked(mockCache.has).mockResolvedValue(true);

      const result = await repository.exists('1');

      expect(result).toBe(true);
      expect(mockCache.has).toHaveBeenCalledWith('TestRepository:1');
      expect(mockModel.count).not.toHaveBeenCalled();
    });

    it('should check database if not in cache', async () => {
      vi.mocked(mockCache.has).mockResolvedValue(false);
      mockModel.count.mockResolvedValue(1);

      const result = await repository.exists('1');

      expect(result).toBe(true);
      expect(mockModel.count).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return false if entity does not exist', async () => {
      vi.mocked(mockCache.has).mockResolvedValue(false);
      mockModel.count.mockResolvedValue(0);

      const result = await repository.exists('1');

      expect(result).toBe(false);
    });
  });
});
