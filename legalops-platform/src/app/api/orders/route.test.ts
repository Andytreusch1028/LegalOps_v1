/**
 * Integration tests for /api/orders routes
 * Tests the refactored API routes using new patterns
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}));

// Mock the service factory
vi.mock('@/lib/services/service-factory', () => ({
  ServiceFactory: {
    getErrorHandler: vi.fn(),
    getOrderService: vi.fn()
  }
}));

describe('/api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/orders', () => {
    it('should return 401 when not authenticated', async () => {
      const { getServerSession } = await import('next-auth');
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('UNAUTHORIZED');
    });

    it('should return structured response on success', async () => {
      const { getServerSession } = await import('next-auth');
      const { ServiceFactory } = await import('@/lib/services/service-factory');

      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' }
      } as any);

      // Mock order service
      const mockOrderService = {
        getUserOrders: vi.fn().mockResolvedValue({
          success: true,
          data: [
            {
              id: 'order-1',
              orderNumber: 'ORD-123',
              subtotal: 100,
              tax: 10,
              total: 110,
              orderItems: []
            }
          ]
        })
      };

      vi.mocked(ServiceFactory.getOrderService).mockReturnValue(mockOrderService as any);
      vi.mocked(ServiceFactory.getErrorHandler).mockReturnValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.orders).toHaveLength(1);
      expect(data.meta).toBeDefined();
      expect(data.meta.timestamp).toBeDefined();
    });

    it('should handle service errors with structured response', async () => {
      const { getServerSession } = await import('next-auth');
      const { ServiceFactory } = await import('@/lib/services/service-factory');
      const { AppError } = await import('@/lib/types/result');

      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' }
      } as any);

      // Mock order service with error
      const mockOrderService = {
        getUserOrders: vi.fn().mockResolvedValue({
          success: false,
          error: new AppError('Database error', 'DATABASE_ERROR', 500)
        })
      };

      const mockErrorHandler = {
        handle: vi.fn().mockResolvedValue({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database error'
          }
        })
      };

      vi.mocked(ServiceFactory.getOrderService).mockReturnValue(mockOrderService as any);
      vi.mocked(ServiceFactory.getErrorHandler).mockReturnValue(mockErrorHandler as any);

      const request = new NextRequest('http://localhost:3000/api/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('DATABASE_ERROR');
      expect(mockErrorHandler.handle).toHaveBeenCalled();
    });
  });

  describe('POST /api/orders', () => {
    it('should return 401 when not authenticated', async () => {
      const { getServerSession } = await import('next-auth');
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' })
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('UNAUTHORIZED');
    });

    it('should use error handler for unexpected errors', async () => {
      const { getServerSession } = await import('next-auth');
      const { ServiceFactory } = await import('@/lib/services/service-factory');

      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' }
      } as any);

      const mockErrorHandler = {
        handle: vi.fn().mockResolvedValue({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred'
          }
        })
      };

      vi.mocked(ServiceFactory.getErrorHandler).mockReturnValue(mockErrorHandler as any);
      vi.mocked(ServiceFactory.getOrderService).mockReturnValue({} as any);

      // Trigger an error by providing invalid JSON
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(mockErrorHandler.handle).toHaveBeenCalled();
    });
  });
});
