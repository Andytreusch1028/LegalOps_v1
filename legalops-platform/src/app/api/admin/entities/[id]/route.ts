/**
 * Admin API - Business Entity Detail
 * GET /api/admin/entities/[id] - Get entity details
 * PATCH /api/admin/entities/[id] - Update entity
 * DELETE /api/admin/entities/[id] - Delete entity
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get entity details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const entity = await prisma.businessEntity.findUnique({
      where: { id },
      include: {
        client: true,
        addresses: true,
        registeredAgent: true,
        managersOfficers: true,
        filings: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!entity) {
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { entity },
    });

  } catch (error) {
    console.error('Error fetching entity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entity' },
      { status: 500 }
    );
  }
}

// PATCH - Update entity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate allowed fields
    const allowedFields = [
      'legalName',
      'dbaName',
      'entityType',
      'status',
      'documentNumber',
      'feiNumber',
      'stateOfFormation',
      'filingDate',
      'dissolutionDate',
      'purpose',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Convert date strings to Date objects
    if (updateData.filingDate) {
      updateData.filingDate = new Date(updateData.filingDate);
    }
    if (updateData.dissolutionDate) {
      updateData.dissolutionDate = new Date(updateData.dissolutionDate);
    }

    const entity = await prisma.businessEntity.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        addresses: true,
        registeredAgent: true,
        managersOfficers: true,
        filings: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Entity updated successfully',
      data: { entity },
    });

  } catch (error) {
    console.error('Error updating entity:', error);
    return NextResponse.json(
      { error: 'Failed to update entity' },
      { status: 500 }
    );
  }
}

// DELETE - Delete entity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if entity exists
    const entity = await prisma.businessEntity.findUnique({
      where: { id },
      include: {
        filings: true,
      },
    });

    if (!entity) {
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      );
    }

    // Check if entity has filings
    if (entity.filings.length > 0) {
      // Soft delete - mark as dissolved
      await prisma.businessEntity.update({
        where: { id },
        data: {
          status: 'DISSOLVED',
          dissolutionDate: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Entity marked as dissolved (has existing filings)',
        data: { dissolved: true },
      });
    } else {
      // Hard delete - no filings
      // First delete related records
      await prisma.$transaction([
        prisma.address.deleteMany({ where: { businessEntityId: id } }),
        prisma.registeredAgent.deleteMany({ where: { businessEntityId: id } }),
        prisma.managerOfficer.deleteMany({ where: { businessEntityId: id } }),
        prisma.businessEntity.delete({ where: { id } }),
      ]);

      return NextResponse.json({
        success: true,
        message: 'Entity deleted successfully',
        data: { deleted: true },
      });
    }

  } catch (error) {
    console.error('Error deleting entity:', error);
    return NextResponse.json(
      { error: 'Failed to delete entity' },
      { status: 500 }
    );
  }
}

