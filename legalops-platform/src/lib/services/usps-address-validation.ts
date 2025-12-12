/**
 * LegalOps v1 - USPS Address Validation Service
 *
 * Validates and standardizes addresses using the USPS Addresses API (v3.0).
 * Ensures addresses match USPS standards for government document filing.
 *
 * API Documentation: https://developer.usps.com/
 * API Endpoint: https://api.usps.com/addresses/v3/address
 */

import { BaseService } from './base.service';
import { ILogger } from '../interfaces/logger.interface';
import { Result, success, failure } from '../types/result';
import { AppError } from '../errors/app-error';

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
}

export interface DisclaimerAcceptance {
  /** Timestamp when disclaimer was accepted */
  acceptedAt: Date;
  /** Type of address issue that triggered disclaimer */
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
 * USPS Address Validation Service interface.
 */
export interface IUSPSAddressValidationService {
  validateAddress(address: AddressInput): Promise<Result<AddressValidationResult>>;
  validateMultipleAddresses(addresses: AddressInput[]): Promise<Result<AddressValidationResult[]>>;
  logDisclaimerAcceptance(acceptance: DisclaimerAcceptance): Promise<Result<void>>;
}

/**
 * USPS Address Validation Service (v3.0 REST API)
 * Extends BaseService for consistent error handling and logging.
 */
export class USPSAddressValidationService extends BaseService implements IUSPSAddressValidationService {
  readonly name = 'USPSAddressValidationService';

  private clientId: string;
  private clientSecret: string;
  private apiUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(logger: ILogger) {
    super(logger);
    
    this.clientId = process.env.USPS_CLIENT_ID || '';
    this.clientSecret = process.env.USPS_CLIENT_SECRET || '';
    this.apiUrl = 'https://apis.usps.com';

    if (!this.clientId || !this.clientSecret) {
      this.logger.warn(`[${this.name}] USPS API credentials not configured. Address validation will not work.`);
      this.logger.warn(`[${this.name}] Please set USPS_CLIENT_ID and USPS_CLIENT_SECRET environment variables.`);
    }
  }

  /**
   * Get OAuth 2.0 access token
   */
  private async getAccessToken(): Promise<Result<string>> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return success(this.accessToken);
    }

    try {
      this.logger.debug(`[${this.name}] Requesting new USPS access token`);

      // USPS OAuth 2.0 Client Credentials flow
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
        this.logger.error(`[${this.name}] Failed to get access token`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });

        return failure(
          new AppError(
            'USPS_AUTH_FAILED',
            `Failed to authenticate with USPS API: ${response.status} ${response.statusText}`,
            { errorText }
          )
        );
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

      if (!this.accessToken) {
        return failure(
          new AppError(
            'USPS_AUTH_FAILED',
            'No access token received from USPS API'
          )
        );
      }

      this.logger.debug(`[${this.name}] Successfully obtained USPS access token`);
      return success(this.accessToken);

    } catch (error) {
      this.logger.error(`[${this.name}] Error getting USPS access token`, { error });
      
      return failure(
        new AppError(
          'USPS_AUTH_ERROR',
          'Failed to authenticate with USPS API',
          { originalError: error }
        )
      );
    }
  }

  /**
   * Validate a single address using USPS v3 API
   */
  async validateAddress(address: AddressInput): Promise<Result<AddressValidationResult>> {
    this.logger.debug(`[${this.name}] Validating address`, {
      city: address.city,
      state: address.state,
      zip: address.zip5
    });

    try {
      // Validate input
      if (!address.address2) {
        return success({
          success: false,
          validated: false,
          original: address,
          error: 'Street address (address2) is required'
        });
      }

      // Check if credentials are configured
      if (!this.clientId || !this.clientSecret) {
        this.logger.warn(`[${this.name}] USPS credentials not configured, returning unvalidated address`);
        
        return success({
          success: true,
          validated: false,
          original: address,
          warnings: ['USPS validation not available - credentials not configured']
        });
      }

      // Get access token
      const tokenResult = await this.getAccessToken();
      if (!tokenResult.success) {
        return failure(tokenResult.error);
      }

      // Prepare request body
      const requestBody = {
        streetAddress: address.address2,
        secondaryAddress: address.address1 || '',
        cityName: address.city || '',
        state: address.state || '',
        ZIPCode: address.zip5 || '',
        ZIPPlus4: address.zip4 || ''
      };

      // Make API request
      const response = await fetch(`${this.apiUrl}/addresses/v3/address`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenResult.data}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        this.logger.error(`[${this.name}] USPS API error`, {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });

        return success({
          success: false,
          validated: false,
          original: address,
          error: `USPS API error: ${response.status} ${response.statusText}`
        });
      }

      // Process successful response
      const result = this.processUSPSResponse(address, responseData);
      
      this.logger.debug(`[${this.name}] Address validation completed`, {
        validated: result.validated,
        hasStandardized: !!result.standardized
      });

      return success(result);

    } catch (error) {
      this.logger.error(`[${this.name}] Error validating address`, { error });
      
      return success({
        success: false,
        validated: false,
        original: address,
        error: 'Address validation service temporarily unavailable'
      });
    }
  }

  /**
   * Validate multiple addresses in batch
   */
  async validateMultipleAddresses(addresses: AddressInput[]): Promise<Result<AddressValidationResult[]>> {
    this.logger.debug(`[${this.name}] Validating ${addresses.length} addresses`);

    const results: AddressValidationResult[] = [];

    // Process addresses sequentially to avoid rate limiting
    for (const address of addresses) {
      const result = await this.validateAddress(address);
      if (result.success) {
        results.push(result.data);
      } else {
        // If individual validation fails, add error result
        results.push({
          success: false,
          validated: false,
          original: address,
          error: result.error.message
        });
      }
    }

    return success(results);
  }

  /**
   * Log disclaimer acceptance for audit trail
   */
  async logDisclaimerAcceptance(acceptance: DisclaimerAcceptance): Promise<Result<void>> {
    this.logger.info(`[${this.name}] Logging disclaimer acceptance`, {
      issueType: acceptance.issueType,
      customerId: acceptance.customerId,
      acknowledgedRisk: acceptance.acknowledgedRisk,
      confirmedProceed: acceptance.confirmedProceed
    });

    try {
      // In a real implementation, this would save to database
      // For now, we just log it
      this.logger.info(`[${this.name}] Disclaimer acceptance logged`, {
        acceptedAt: acceptance.acceptedAt,
        issueType: acceptance.issueType,
        addressUsed: acceptance.addressUsed,
        ipAddress: acceptance.ipAddress
      });

      return success(undefined);

    } catch (error) {
      this.logger.error(`[${this.name}] Error logging disclaimer acceptance`, { error });
      
      return failure(
        new AppError(
          'DISCLAIMER_LOG_FAILED',
          'Failed to log disclaimer acceptance',
          { originalError: error }
        )
      );
    }
  }

  /**
   * Process USPS API response into our standard format
   */
  private processUSPSResponse(original: AddressInput, responseData: any): AddressValidationResult {
    try {
      const address = responseData.address;
      
      if (!address) {
        return {
          success: false,
          validated: false,
          original,
          error: 'No address data in USPS response'
        };
      }

      // Check if address was validated
      const isValidated = address.deliveryPoint && address.deliveryPoint !== '';
      
      const standardized: StandardizedAddress = {
        firmName: address.firmName || original.firmName,
        address1: address.secondaryAddress || original.address1,
        address2: address.streetAddress || original.address2,
        city: address.cityName || original.city || '',
        state: address.state || original.state || '',
        zip5: address.ZIPCode || original.zip5 || '',
        zip4: address.ZIPPlus4 || original.zip4,
        deliveryPoint: address.deliveryPoint,
        carrierRoute: address.carrierRoute
      };

      const metadata: USPSMetadata = {
        dpvConfirmation: address.dpvConfirmation,
        dpvCMRA: address.dpvCMRA,
        dpvFootnotes: address.dpvFootnotes,
        business: address.business,
        centralDeliveryPoint: address.centralDeliveryPoint,
        vacant: address.vacant
      };

      const warnings: string[] = [];
      
      // Add warnings based on USPS response
      if (address.dpvConfirmation === 'N') {
        warnings.push('Address not found in USPS database');
      }
      if (address.dpvConfirmation === 'D') {
        warnings.push('Address missing secondary information (apt, suite, etc.)');
      }
      if (address.vacant === 'Y') {
        warnings.push('Address appears to be vacant');
      }

      return {
        success: true,
        validated: isValidated,
        original,
        standardized,
        metadata,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        success: false,
        validated: false,
        original,
        error: 'Error processing USPS response'
      };
    }
  }
}