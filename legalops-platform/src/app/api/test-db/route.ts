import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check database connection
    await prisma.$connect();
    
    // Test 2: Count existing users
    const userCount = await prisma.user.count();
    
    // Test 3: Get all users (limit to 10 for safety)
    const users = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
    
    // Test 4: Count orders
    const orderCount = await prisma.order.count();
    
    // Test 5: Count documents
    // `document` model may not exist; guard with try/catch below
    let documentCount = 0;
    try {
      documentCount = await prisma.filingDocument.count();
    } catch (e) {
      // file/document model not present in schema
      documentCount = 0;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        connection: 'Connected to Neon PostgreSQL',
        statistics: {
          totalUsers: userCount,
          totalOrders: orderCount,
          totalDocuments: documentCount,
        },
        users: users,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: body.email || `test-${Date.now()}@example.com`,
        firstName: body.firstName || 'Test',
        lastName: body.lastName || 'User',
        passwordHash: body.password ? body.password : 'changeme',
        role: 'INDIVIDUAL_CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test user created successfully!',
      data: {
        user: user,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('User creation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create test user',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

