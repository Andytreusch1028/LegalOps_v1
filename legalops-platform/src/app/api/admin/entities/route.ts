/**
 * Admin API - Business Entities
 * GET /api/admin/entities - List all business entities with filters
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
    const entityType = searchParams.get('entityType');
    const status = searchParams.get('status');
    const state = searchParams.get('state');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { legalName: { contains: search, mode: 'insensitive' } },
        { dbaName: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search } },
        { feiNumber: { contains: search } },
      ];
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (status) {
      where.status = status;
    }

    if (state) {
      where.stateOfFormation = state;
    }

    // Get entities with counts
    const [entities, total] = await Promise.all([
      prisma.businessEntity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              userId: true,
            },
          },
          filings: {
            select: {
              id: true,
              filingType: true,
              filingStatus: true,
            },
          },
          addresses: true,
          registeredAgent: true,
        },
      }),
      prisma.businessEntity.count({ where }),
    ]);

    // Transform data to include counts
    const entitiesWithCounts = entities.map(entity => ({
      id: entity.id,
      legalName: entity.legalName,
      dbaName: entity.dbaName,
      entityType: entity.entityType,
      status: entity.status,
      documentNumber: entity.documentNumber,
      feiNumber: entity.feiNumber,
      stateOfFormation: entity.stateOfFormation,
      filingDate: entity.filingDate,
      createdAt: entity.createdAt,
      client: entity.client,
      filingCount: entity.filings.length,
      addressCount: entity.addresses.length,
      hasRegisteredAgent: !!entity.registeredAgent,
    }));

    return NextResponse.json({
      success: true,
      data: {
        entities: entitiesWithCounts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    );
  }
}

