/**
 * Admin API - Customer Detail
 * GET /api/admin/customers/[id] - Get customer details
 * PATCH /api/admin/customers/[id] - Update customer
 * DELETE /api/admin/customers/[id] - Delete customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get customer details
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

    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        clients: {
          include: {
            businessEntities: {
              include: {
                filings: true,
              },
            },
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            orderItems: true,
            package: true,
          },
        },
        formDrafts: {
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { customer },
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PATCH - Update customer
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
      'email',
      'firstName',
      'lastName',
      'phone',
      'userType',
      'role',
      'isActive',
      'companyName',
      'department',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    const customer = await prisma.user.update({
      where: { id },
      data: updateData,
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
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer },
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE - Delete customer
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

    // Check if customer exists
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: true,
        clients: {
          include: {
            businessEntities: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer has orders or entities
    const hasOrders = customer.orders.length > 0;
    const hasEntities = customer.clients.some(c => c.businessEntities.length > 0);

    if (hasOrders || hasEntities) {
      // Soft delete - just deactivate the account
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: 'Customer account deactivated (has existing orders/entities)',
        data: { deactivated: true },
      });
    } else {
      // Hard delete - no orders or entities
      await prisma.user.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Customer deleted successfully',
        data: { deleted: true },
      });
    }

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}

