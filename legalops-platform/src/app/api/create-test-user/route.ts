import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { UserRole } from '@/generated/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@legalops.com' }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Test user already exists',
        credentials: {
          email: 'admin@legalops.com',
          password: 'password123'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create test user with hashed password
    const user = await prisma.user.create({
      data: {
        email: 'admin@legalops.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: hashedPassword,
        userType: 'SITE_ADMIN',
        role: UserRole.ADMIN,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        userType: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully!',
      user: user,
      credentials: {
        email: 'admin@legalops.com',
        password: 'password123'
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
  }
}

