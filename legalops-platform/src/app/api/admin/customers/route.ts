/**
 * Admin API - Customers
 * GET /api/admin/customers - List all customers with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const userType = searchParams.get('userType');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (userType) {
      where.userType = userType;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get customers with counts
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          clients: {
            include: {
              businessEntities: true,
            },
          },
          orders: {
            select: {
              id: true,
            },
          },
          formDrafts: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Transform data to include counts
    const customersWithCounts = customers.map(customer => ({
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      userType: customer.userType,
      role: customer.role,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      entityCount: customer.clients.reduce((sum, c) => sum + c.businessEntities.length, 0),
      orderCount: customer.orders.length,
      draftCount: customer.formDrafts.length,
    }));

    return NextResponse.json({
      success: true,
      data: {
        customers: customersWithCounts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

