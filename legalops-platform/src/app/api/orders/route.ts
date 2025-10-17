import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orders - Get all orders for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get orders based on user role
    let orders;
    if (user.role === "SITE_ADMIN" || user.role === "EMPLOYEE") {
      // Admins and employees can see all orders
      orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          documents: true,
          statusUpdates: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Regular users can only see their own orders
      orders = await prisma.order.findMany({
        where: {
          userId: user.id,
        },
        include: {
          documents: true,
          statusUpdates: {
            where: {
              isPublic: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders - Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { businessName, entityType, orderType, state } = body;

    // Validate required fields
    if (!businessName || !entityType || !orderType || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Calculate pricing based on entity type
    let basePrice = 299.00; // Default price

    if (entityType === 'NONPROFIT_CORPORATION') {
      basePrice = 399.00;
    } else if (entityType === 'PROFESSIONAL_LLC' || entityType === 'PROFESSIONAL_CORPORATION') {
      basePrice = 349.00;
    } else if (
      entityType === 'LIMITED_PARTNERSHIP' ||
      entityType === 'LIMITED_LIABILITY_PARTNERSHIP' ||
      entityType === 'LIMITED_LIABILITY_LIMITED_PARTNERSHIP' ||
      entityType === 'GENERAL_PARTNERSHIP'
    ) {
      basePrice = 279.00;
    } else if (entityType === 'SOLE_PROPRIETORSHIP') {
      basePrice = 149.00;
    }

    const totalAmount = basePrice;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber,
        type: orderType,
        status: "PENDING",
        businessName,
        entityType,
        state,
        basePrice,
        totalAmount,
        paymentStatus: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create initial status update
    await prisma.statusUpdate.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        message: "Order created and awaiting payment",
        isPublic: true,
      },
    });

    return NextResponse.json(
      { 
        message: "Order created successfully",
        order 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

