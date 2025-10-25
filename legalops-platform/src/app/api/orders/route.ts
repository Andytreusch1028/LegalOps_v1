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
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          // `documents` is represented by Filing/FilingDocument models; exclude if not present on Order
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

    // Convert Decimal fields to numbers for JSON serialization
    const ordersResponse = orders.map(order => ({
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      total: Number(order.total),
    }));

    return NextResponse.json({ orders: ordersResponse });
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
 * Supports both old and new order creation patterns
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
    const { serviceId, orderType, orderData, subtotal, tax, total } = body;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Handle new service-based orders (with serviceId)
    if (serviceId && orderData) {
      // Fetch service to get pricing
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      // Calculate total with rush fee if applicable
      let orderTotal = Number(service.totalPrice);
      if (orderData.rushProcessing && service.rushFeeAvailable) {
        orderTotal += Number(service.rushFee) || 0;
      }

      // Create order with new schema AND order items for proper breakdown
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          orderNumber,
          orderStatus: "PENDING",
          subtotal: orderTotal, // Use orderTotal (includes rush fee) not service.totalPrice
          tax: 0,
          total: orderTotal,
          paymentStatus: "PENDING",
          isRushOrder: orderData.rushProcessing || false,
          orderItems: {
            create: [
              // LegalOps Service Fee
              {
                serviceType: orderType || "LLC_FORMATION",
                description: "LegalOps Service Fee",
                quantity: 1,
                unitPrice: Number(service.serviceFee),
                totalPrice: Number(service.serviceFee),
              },
              // Florida State Filing Fee
              {
                serviceType: orderType || "LLC_FORMATION",
                description: "Florida State Filing Fee",
                quantity: 1,
                unitPrice: Number(service.stateFee),
                totalPrice: Number(service.stateFee),
              },
              // Registered Agent Fee (if applicable)
              ...(Number(service.registeredAgentFee) > 0 ? [{
                serviceType: "REGISTERED_AGENT" as const,
                description: "Registered Agent Service",
                quantity: 1,
                unitPrice: Number(service.registeredAgentFee),
                totalPrice: Number(service.registeredAgentFee),
              }] : []),
              // Rush Fee (if applicable)
              ...(orderData.rushProcessing && service.rushFeeAvailable && Number(service.rushFee) > 0 ? [{
                serviceType: "EXPEDITED_PROCESSING" as const,
                description: "Rush Processing Fee",
                quantity: 1,
                unitPrice: Number(service.rushFee),
                totalPrice: Number(service.rushFee),
              }] : []),
            ],
          },
        },
      });

      // Convert Decimal fields to numbers for JSON serialization
      const orderResponse = {
        ...order,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        total: Number(order.total),
      };

      return NextResponse.json(
        {
          message: "Order created successfully",
          order: orderResponse,
          orderId: order.id,
        },
        { status: 201 }
      );
    }

    // Fallback for old pattern (if needed for backward compatibility)
    const { businessName, entityType, state } = body;
    if (!businessName || !entityType || !orderType || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate pricing based on entity type
    let basePrice = 299.00;
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

    // Create order with old schema (for backward compatibility)
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber,
        orderStatus: "PENDING",
        subtotal: basePrice,
        tax: 0,
        total: basePrice,
        paymentStatus: "PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
        orderId: order.id,
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

