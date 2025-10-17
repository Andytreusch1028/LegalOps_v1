import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  checkNameAvailability, 
  validateBusinessNameFormat,
  normalizeBusinessName 
} from "@/lib/sunbiz-checker";

/**
 * POST /api/check-name
 * Check business name availability against Sunbiz
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { businessName, entityType } = body;

    // Validate input
    if (!businessName || typeof businessName !== 'string') {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    if (!entityType || typeof entityType !== 'string') {
      return NextResponse.json(
        { error: "Entity type is required" },
        { status: 400 }
      );
    }

    // Validate business name format
    const formatValidation = validateBusinessNameFormat(businessName);
    if (!formatValidation.valid) {
      return NextResponse.json(
        { 
          error: "Invalid business name format",
          details: formatValidation.errors 
        },
        { status: 400 }
      );
    }

    // Check name availability
    const result = await checkNameAvailability(businessName, entityType);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error checking name availability:", error);
    return NextResponse.json(
      { error: "Failed to check name availability" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/check-name/normalize?name=Business+Name
 * Normalize a business name to see how it will be compared
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: "Name parameter is required" },
        { status: 400 }
      );
    }

    const normalized = normalizeBusinessName(name);

    return NextResponse.json({
      success: true,
      data: {
        original: name,
        normalized,
      }
    });

  } catch (error) {
    console.error("Error normalizing name:", error);
    return NextResponse.json(
      { error: "Failed to normalize name" },
      { status: 500 }
    );
  }
}

