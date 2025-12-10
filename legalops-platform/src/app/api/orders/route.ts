import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ServiceFactory } from "@/lib/services/service-factory";
import { createSuccessResponse, createErrorResponse } from "@/lib/types/api";
import { AppError } from "@/lib/types/result";

/**
 * GET /api/orders - Get all orders for the current user
 */
export async function GET(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();
  const orderService = ServiceFactory.getOrderService();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const response = createErrorResponse(
        'UNAUTHORIZED',
        'Authentication required',
        undefined
      );
      return NextResponse.json(response, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    if (!userId) {
      const response = createErrorResponse(
        'USER_NOT_FOUND',
        'User not found',
        undefined
      );
      return NextResponse.json(response, { status: 404 });
    }

    // Use OrderService to get user orders
    const result = await orderService.getUserOrders(userId);

    if (!result.success) {
      const response = await errorHandler.handle(result.error, {
        userId,
        endpoint: '/api/orders'
      });
      return NextResponse.json(response, { status: result.error.statusCode });
    }

    // Convert Decimal fields to numbers for JSON serialization
    const ordersResponse = result.data.map(order => ({
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      total: Number(order.total),
      orderItems: order.orderItems?.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      }))
    }));

    const response = createSuccessResponse({ orders: ordersResponse });
    return NextResponse.json(response);
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: '/api/orders',
      method: 'GET'
    });
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/orders - Create a new order
 * Supports both old and new order creation patterns
 */
export async function POST(request: NextRequest) {
  const errorHandler = ServiceFactory.getErrorHandler();
  const orderService = ServiceFactory.getOrderService();
  const { prisma } = await import("@/lib/prisma");
  let userId: string | undefined;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const response = createErrorResponse(
        'UNAUTHORIZED',
        'Authentication required',
        undefined
      );
      return NextResponse.json(response, { status: 401 });
    }

    // Get user ID from session
    userId = session.user.id;

    if (!userId) {
      const response = createErrorResponse(
        'USER_NOT_FOUND',
        'User not found',
        undefined
      );
      return NextResponse.json(response, { status: 404 });
    }

    const body = await request.json();
    const { serviceId, orderType, orderData, packageId, subtotal, tax, total } = body;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Map orderType to ServiceType enum
    const mapOrderTypeToServiceType = (orderType: string): string => {
      // Map specific order types to ServiceType enum values
      const mapping: Record<string, string> = {
        'LLC_ANNUAL_REPORT': 'ANNUAL_REPORT',
        'CORP_ANNUAL_REPORT': 'ANNUAL_REPORT',
        'NONPROFIT_ANNUAL_REPORT': 'ANNUAL_REPORT',
        'LP_ANNUAL_REPORT': 'ANNUAL_REPORT',
        'LLC_FORMATION': 'LLC_FORMATION',
        'CORP_FORMATION': 'CORP_FORMATION',
        'NONPROFIT_FORMATION': 'CORP_FORMATION',
        'REGISTERED_AGENT': 'REGISTERED_AGENT',
        'EIN_APPLICATION': 'EIN_APPLICATION',
        'OPERATING_AGREEMENT': 'OPERATING_AGREEMENT',
        'CORPORATE_BYLAWS': 'CORPORATE_BYLAWS',
        'CERTIFICATE_OF_STATUS': 'CERTIFICATE_OF_STATUS',
        'FICTITIOUS_NAME_REGISTRATION': 'FICTITIOUS_NAME_REGISTRATION',
        'DISSOLUTION': 'DISSOLUTION',
        'REINSTATEMENT': 'REINSTATEMENT',
        'NAME_RESERVATION': 'NAME_RESERVATION',
      };
      return mapping[orderType] || orderType;
    };

    const serviceType = mapOrderTypeToServiceType(orderType || 'LLC_FORMATION');

    // Handle new service-based orders (with serviceId)
    if (serviceId && orderData) {
      console.log('[API /api/orders] Creating order with serviceId:', serviceId);
      console.log('[API /api/orders] orderData:', orderData);

      // Fetch service to get pricing
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      console.log('[API /api/orders] Service found:', service?.name);

      if (!service) {
        const response = createErrorResponse(
          'SERVICE_NOT_FOUND',
          'Service not found',
          { serviceId }
        );
        return NextResponse.json(response, { status: 404 });
      }

      // Fetch package if packageId is provided
      let selectedPackage = null;
      if (packageId) {
        selectedPackage = await prisma.package.findUnique({
          where: { id: packageId },
        });
      }

      // Calculate total based on package or individual service
      let orderTotal = 0;
      let orderItems = [];

      if (selectedPackage) {
        // Package pricing
        orderTotal = Number(selectedPackage.price) + Number(service.stateFee);

        // Add package as line item
        orderItems.push({
          serviceType: orderType || "LLC_FORMATION",
          description: `${selectedPackage.name} Package`,
          quantity: 1,
          unitPrice: Number(selectedPackage.price),
          totalPrice: Number(selectedPackage.price),
        });

        // Add state fee
        orderItems.push({
          serviceType: orderType || "LLC_FORMATION",
          description: "Florida State Filing Fee",
          quantity: 1,
          unitPrice: Number(service.stateFee),
          totalPrice: Number(service.stateFee),
        });

        // Add rush fee if applicable
        if (orderData.rushProcessing && service.rushFeeAvailable && Number(service.rushFee) > 0) {
          orderTotal += Number(service.rushFee);
          orderItems.push({
            serviceType: "EXPEDITED_PROCESSING" as const,
            description: "Rush Processing Fee",
            quantity: 1,
            unitPrice: Number(service.rushFee),
            totalPrice: Number(service.rushFee),
          });
        }
      } else {
        // Individual service pricing
        orderTotal = Number(service.totalPrice);
        if (orderData.rushProcessing && service.rushFeeAvailable) {
          orderTotal += Number(service.rushFee) || 0;
        }

        // Build order items for individual service
        orderItems = [
          // LegalOps Service Fee (store form data here)
          {
            serviceType: serviceType,
            description: "LegalOps Service Fee",
            quantity: 1,
            unitPrice: Number(service.serviceFee),
            totalPrice: Number(service.serviceFee),
            additionalData: orderData, // Store the complete form data
          },
          // Florida State Filing Fee
          {
            serviceType: serviceType,
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
        ];
      }

      // Calculate RA renewal tracking
      const includesRA = selectedPackage?.includesRA || false;
      const raRenewalDate = includesRA ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null; // 1 year from now
      const raRenewalPrice = includesRA ? 125.00 : null; // $125/year renewal

      console.log('[API /api/orders] About to create order with:', {
        userId: user.id,
        packageId,
        orderNumber,
        orderTotal,
        includesRA,
        orderItemsCount: orderItems.length,
      });

      // Create order with new schema AND order items for proper breakdown
      const order = await prisma.order.create({
        data: {
          user: {
            connect: { id: user.id },
          },
          ...(packageId && {
            package: {
              connect: { id: packageId },
            },
          }),
          orderNumber,
          orderStatus: "PENDING",
          subtotal: orderTotal,
          tax: 0,
          total: orderTotal,
          paymentStatus: "PENDING",
          isRushOrder: orderData.rushProcessing || false,
          includesRegisteredAgent: includesRA,
          raRenewalDate: raRenewalDate,
          raAutoRenew: includesRA, // Default to true if RA is included
          raRenewalPrice: raRenewalPrice,
          raRenewalNotificationSent: false,
          orderData: orderData, // Save complete form data to Order table
          orderItems: {
            create: orderItems,
          },
        },
      });

      console.log('[API /api/orders] Order created successfully with ID:', order.id);

      // Convert Decimal fields to numbers for JSON serialization
      const orderResponse = {
        ...order,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        total: Number(order.total),
      };

      const response = createSuccessResponse(
        {
          message: "Order created successfully",
          order: orderResponse,
          orderId: order.id,
        }
      );
      return NextResponse.json(response, { status: 201 });
    }

    // Fallback for old pattern (if needed for backward compatibility)
    const { businessName, entityType, state } = body;
    if (!businessName || !entityType || !orderType || !state) {
      const response = createErrorResponse(
        'MISSING_REQUIRED_FIELDS',
        'Missing required fields: businessName, entityType, orderType, state',
        { provided: { businessName: !!businessName, entityType: !!entityType, orderType: !!orderType, state: !!state } }
      );
      return NextResponse.json(response, { status: 400 });
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

    const response = createSuccessResponse(
      {
        message: "Order created successfully",
        order,
        orderId: order.id,
      }
    );
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response = await errorHandler.handle(error, {
      endpoint: '/api/orders',
      method: 'POST',
      userId
    });
    return NextResponse.json(response, { status: 500 });
  }
}

