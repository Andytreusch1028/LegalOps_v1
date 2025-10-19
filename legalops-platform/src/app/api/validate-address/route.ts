/**
 * LegalOps v1 - Address Validation API Endpoint
 * 
 * Validates addresses using USPS API before submission to government.
 * Ensures addresses are properly formatted and deliverable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uspsAddressValidation, AddressInput } from '@/lib/services/usps-address-validation';

/**
 * POST /api/validate-address
 * 
 * Validates a single address or multiple addresses
 * 
 * Request body:
 * {
 *   address: AddressInput | AddressInput[]
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   results: AddressValidationResult | AddressValidationResult[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Validate single or multiple addresses
    if (Array.isArray(address)) {
      // Multiple addresses
      const results = await uspsAddressValidation.validateAddresses(address);
      
      return NextResponse.json({
        success: true,
        results
      });
    } else {
      // Single address
      const result = await uspsAddressValidation.validateAddress(address);
      
      return NextResponse.json({
        success: true,
        result
      });
    }

  } catch (error) {
    console.error('Address validation API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to validate address',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/validate-address?street=...&city=...&state=...&zip=...
 * 
 * Validates an address using query parameters (for simple use cases)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    const address: AddressInput = {
      firmName: searchParams.get('firmName') || undefined,
      address1: searchParams.get('address1') || searchParams.get('secondary') || undefined,
      address2: searchParams.get('address2') || searchParams.get('street') || '',
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      zip5: searchParams.get('zip5') || searchParams.get('zip') || undefined,
      zip4: searchParams.get('zip4') || undefined,
    };

    if (!address.address2) {
      return NextResponse.json(
        { error: 'Street address is required' },
        { status: 400 }
      );
    }

    // Validate address
    const result = await uspsAddressValidation.validateAddress(address);
    
    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Address validation API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to validate address',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

