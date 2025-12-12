/**
 * Tests for /api/packages route with centralized error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock the prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    package: {
      findMany: vi.fn()
    }
  }
}));

// Mock the service factory
vi.mock('@/lib/services/service-factory', () => ({
  ServiceFactory: {
    getErrorHandler: vi.fn()
  }
}));

describe('/api/packages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return packages with centralized error handling on success', async () => {
      const mockPackages = [
        {
          id: '1',
          name: 'Basic Package',
          price: 99.99,
          isActive: true,
          displayOrder: 1
        }
      ];

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.package.findMany).mockResolvedValue(mockPackages as any);

      const { ServiceFactory } = await import('@/lib/services/service-factory');
      vi.mocked(ServiceFactory.getErrorHandler).mockReturnValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/packages');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([
        {
          id: '1',
          name: 'Basic Package',
          price: 99.99,
          isActive: true,
          displayOrder: 1
        }
      ]);
      expect(data.meta).toBeDefined();
      expect(data.meta.timestamp).toBeDefined();
      expect(data.meta.requestId).toBeDefined();
    });

    it('should handle errors using centralized error handler', async () => {
      const mockError = new Error('Database connection failed');
      
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.package.findMany).mockRejectedValue(mockError);

      const mockErrorHandler = {
        handle: vi.fn().mockResolvedValue({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database operation failed'
          }
        })
      };

      const { ServiceFactory } = await import('@/lib/services/service-factory');
      vi.mocked(ServiceFactory.getErrorHandler).mockReturnValue(mockErrorHandler as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('DATABASE_ERROR');
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(mockError, {
        endpoint: '/api/packages',
        method: 'GET'
      });
    });
  });
});