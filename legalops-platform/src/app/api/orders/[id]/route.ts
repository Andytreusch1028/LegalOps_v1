import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orders/[id] - Get a specific order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get order
    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
      },
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
          where: 
            user.role === "SITE_ADMIN" || user.role === "EMPLOYEE"
              ? {} // Admins see all updates
              : { isPublic: true }, // Users see only public updates
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check authorization - users can only see their own orders
    if (
      user.role !== "SITE_ADMIN" &&
      user.role !== "EMPLOYEE" &&
      order.userId !== user.id
    ) {
      return NextResponse.json(
        { error: "Unauthorized to view this order" },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id] - Update an order (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only admins and employees can update orders
    if (user.role !== "SITE_ADMIN" && user.role !== "EMPLOYEE") {
      return NextResponse.json(
        { error: "Unauthorized to update orders" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, paymentStatus } = body;

    // Update order
    const order = await prisma.order.update({
      where: {
        id: params.id,
      },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
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

    // Create status update if status changed
    if (status) {
      await prisma.statusUpdate.create({
        data: {
          orderId: order.id,
          status,
          message: `Order status updated to ${status.replace(/_/g, ' ')}`,
          isPublic: true,
        },
      });
    }

    return NextResponse.json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

