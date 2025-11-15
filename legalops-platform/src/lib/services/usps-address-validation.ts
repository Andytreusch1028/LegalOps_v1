/**
 * LegalOps v1 - USPS Address Validation Service
 *
 * Validates and standardizes addresses using the USPS Addresses API (v3.0).
 * Ensures addresses match USPS standards for government document filing.
 *
 * API Documentation: https://developer.usps.com/
 * API Endpoint: https://api.usps.com/addresses/v3/address
 */

// Types
export interface AddressInput {
  firmName?: string;
  address1?: string; // Secondary address (apt, suite, etc.)
  address2: string;  // Primary street address (REQUIRED)
  city?: string;
  state?: string;
  zip5?: string;
  zip4?: string;
}

export interface AddressValidationResult {
  success: boolean;
  validated: boolean;
  original: AddressInput;
  standardized?: StandardizedAddress;
  suggestions?: StandardizedAddress[];
  error?: string;
  warnings?: string[];
  metadata?: USPSMetadata;
}

export interface StandardizedAddress {
  firmName?: string;
  address1?: string;
  address2: string;
  city: string;
  state: string;
  zip5: string;
  zip4?: string;
  urbanization?: string;
  deliveryPoint?: string;
  carrierRoute?: string;
}

export interface USPSMetadata {
  dpvConfirmation?: 'Y' | 'D' | 'S' | 'N'; // Delivery Point Validation
  dpvCMRA?: 'Y' | 'N'; // Commercial Mail Receiving Agency
  dpvFootnotes?: string;
  business?: 'Y' | 'N';
  centralDeliveryPoint?: 'Y' | 'N';
  vacant?: 'Y' | 'N';
  footnotes?: string;
  returnText?: string;
}

/**
 * Address Validation Disclaimer Acceptance Record
 * CRITICAL: Must be preserved in customer data file for legal protection
 */
export interface AddressDisclaimerAcceptance {
  /** Timestamp when disclaimer was accepted (ISO 8601 format) */
  timestamp: string;
  /** Type of address issue that required disclaimer */
  issueType: 'UNVERIFIED' | 'MISSING_SECONDARY' | 'CORRECTED_BY_USPS';
  /** The address the user chose to use */
  addressUsed: AddressInput;
  /** The USPS-validated address (if available) */
  uspsValidatedAddress?: StandardizedAddress;
  /** Whether user acknowledged the risks */
  acknowledgedRisk: boolean;
  /** Whether user confirmed proceeding */
  confirmedProceed: boolean;
  /** Full text of disclaimer 1 that was accepted */
  disclaimer1Text: string;
  /** Full text of disclaimer 2 that was accepted */
  disclaimer2Text: string;
  /** IP address of user (if available) */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Customer ID who accepted the disclaimer */
  customerId?: string;
  /** Any additional context */
  context?: string;
}

/**
 * USPS Address Validation Service (v3.0 REST API)
 */
export class USPSAddressValidationService {
  private clientId: string;
  private clientSecret: string;
  private apiUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.USPS_CLIENT_ID || '';
    this.clientSecret = process.env.USPS_CLIENT_SECRET || '';
    this.apiUrl = 'https://apis.usps.com';

    if (!this.clientId || !this.clientSecret) {
      console.warn('USPS API credentials not configured. Address validation will not work.');
      console.warn('Please set USPS_CLIENT_ID and USPS_CLIENT_SECRET environment variables.');
    }
  }

  /**
   * Get OAuth 2.0 access token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // USPS OAuth 2.0 Client Credentials flow
      // Per USPS documentation: pass Consumer Key and Secret as client_id and client_secret
      const response = await fetch(`${this.apiUrl}/oauth2/v3/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

      if (!this.accessToken) {
        throw new Error('No access token received from USPS API');
      }

      return this.accessToken;
    } catch (error) {
      console.error('Error getting USPS access token:', error);
      throw new Error('Failed to authenticate with USPS API');
    }
  }

  /**
   * Validate a single address using USPS v3 API
   */
  async validateAddress(address: AddressInput): Promise<AddressValidationResult> {
    try {
      // Validate input
      if (!address.address2) {
        return {
          success: false,
          validated: false,
          original: address,
          error: 'Street address (address2) is required'
        };
      }

      if (!this.clientId || !this.clientSecret) {
        return {
          success: false,
          validated: false,
          original: address,
          error: 'USPS API not configured. Please set USPS_CLIENT_ID and USPS_CLIENT_SECRET environment variables.'
        };
      }

      // Get access token
      const token = await this.getAccessToken();

      // Build query parameters (USPS Address API uses GET with query params)
      const params = new URLSearchParams();
      params.append('streetAddress', address.address2);
      if (address.address1) params.append('secondaryAddress', address.address1);
      if (address.city) params.append('city', address.city);
      if (address.state) params.append('state', address.state);
      if (address.zip5) params.append('ZIPCode', address.zip5);
      if (address.zip4) params.append('ZIPPlus4', address.zip4);
      if (address.firmName) params.append('firm', address.firmName);

      // Call USPS API (GET request)
      const response = await fetch(`${this.apiUrl}/addresses/v3/address?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('USPS API Error:', errorText);
        return {
          success: false,
          validated: false,
          original: address,
          error: `USPS API request failed: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();

      // Parse response
      const result = this.parseAPIResponse(data, address);

      return result;

    } catch (error) {
      console.error('USPS Address Validation Error:', error);
      return {
        success: false,
        validated: false,
        original: address,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Validate multiple addresses (one at a time for v3 API)
   */
  async validateAddresses(addresses: AddressInput[]): Promise<AddressValidationResult[]> {
    if (addresses.length === 0) {
      return [];
    }

    // v3 API doesn't support batch requests, so validate one at a time
    const results: AddressValidationResult[] = [];

    for (const address of addresses) {
      const result = await this.validateAddress(address);
      results.push(result);
    }

    return results;
  }

  /**
   * Parse USPS v3 API response
   */
  private parseAPIResponse(data: any, original: AddressInput): AddressValidationResult {
    try {
      // Check for error in response
      if (data.error || data.errors) {
        return {
          success: false,
          validated: false,
          original,
          error: data.error?.message || data.errors?.[0]?.message || 'Address validation failed'
        };
      }

      // USPS v3 API response structure has nested objects
      const addressData = data.address || {};
      const additionalInfo = data.additionalInfo || {};
      const corrections = data.corrections || [];
      const matches = data.matches || [];

      // Extract standardized address from response
      const standardized: StandardizedAddress = {
        firmName: data.firm || original.firmName,
        address1: addressData.secondaryAddress || original.address1,
        address2: addressData.streetAddress || original.address2,
        city: addressData.city || original.city,
        state: addressData.state || original.state,
        zip5: addressData.ZIPCode || original.zip5,
        zip4: addressData.ZIPPlus4 || original.zip4,
        urbanization: addressData.urbanization,
        deliveryPoint: additionalInfo.deliveryPoint,
        carrierRoute: additionalInfo.carrierRoute
      };

      // Extract metadata
      const metadata: USPSMetadata = {
        dpvConfirmation: additionalInfo.DPVConfirmation as any,
        dpvCMRA: additionalInfo.DPVCMRA as any,
        dpvFootnotes: undefined,
        business: additionalInfo.business as any,
        centralDeliveryPoint: additionalInfo.centralDeliveryPoint as any,
        vacant: additionalInfo.vacant as any,
        footnotes: undefined,
        returnText: corrections.map((c: any) => c.text).join(' ')
      };

      // Determine validation status based on DPV confirmation and match codes
      // Y = fully validated, D = primary validated (missing secondary), S = primary validated (secondary not confirmed)
      const dpv = additionalInfo.DPVConfirmation;
      const validated = dpv === 'Y';
      const partiallyValidated = dpv === 'D' || dpv === 'S';

      // Collect warnings and corrections
      const warnings: string[] = [];

      // Add correction messages
      corrections.forEach((correction: any) => {
        if (correction.text) {
          warnings.push(correction.text);
        }
      });

      // Add DPV-based warnings
      if (dpv === 'D') {
        warnings.push('Address confirmed for primary number only. Secondary number (apt/suite) may be missing.');
      } else if (dpv === 'S') {
        warnings.push('Address confirmed for primary number only. Secondary number not confirmed.');
      } else if (dpv === 'N') {
        warnings.push('Address could not be confirmed by USPS.');
      }

      // Add other warnings
      if (additionalInfo.vacant === 'Y') {
        warnings.push('This address appears to be vacant.');
      }

      return {
        success: true,
        validated: validated || partiallyValidated,
        original,
        standardized,
        metadata,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      console.error('Error parsing USPS response:', error);
      return {
        success: false,
        validated: false,
        original,
        error: 'Failed to parse USPS response'
      };
    }
  }
}

// Export singleton instance
export const uspsAddressValidation = new USPSAddressValidationService();

