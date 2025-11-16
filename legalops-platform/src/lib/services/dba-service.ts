/**
 * DBA (Fictitious Name) Service
 * 
 * Business logic for creating and managing Fictitious Name registrations
 * in compliance with Florida Sunbiz requirements.
 * 
 * @module dba-service
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { FictitiousNameFormData } from '@/types/forms';
import { normalizeBusinessName } from '@/lib/sunbiz-checker';

/**
 * Calculate DBA expiration date
 * 
 * Florida Sunbiz Rule: Registration expires December 31, 5 years after filing
 * 
 * @param filingDate - The date the DBA was filed
 * @returns Expiration date (December 31, year + 5)
 */
export function calculateDBAExpiration(filingDate: Date): Date {
  const year = filingDate.getFullYear();
  // December 31 of year + 5
  return new Date(year + 5, 11, 31, 23, 59, 59);
}

/**
 * Serialize owner data to JSON for database storage
 * 
 * @param formData - DBA form data containing owner information
 * @returns JSON-serializable owner data
 */
export function serializeOwners(formData: FictitiousNameFormData): Prisma.JsonValue {
  if (formData.ownerType === 'INDIVIDUAL') {
    return {
      ownerType: 'INDIVIDUAL',
      owners: formData.individualOwners || [],
    };
  } else {
    return {
      ownerType: 'BUSINESS_ENTITY',
      owners: formData.businessEntityOwners || [],
    };
  }
}

/**
 * Serialize address to JSON for database storage
 * 
 * @param address - Address object from form data
 * @returns JSON-serializable address
 */
export function serializeAddress(address: {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
}): Prisma.JsonValue {
  return {
    street: address.street,
    street2: address.street2 || null,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
  };
}

/**
 * Create FictitiousName record and associated owner records
 * 
 * @param formData - Complete DBA form data
 * @param userId - User ID (customer)
 * @param orderId - Order ID
 * @param signatureIp - IP address for signature audit trail
 * @returns Created FictitiousName record
 */
export async function createFictitiousNameRecord(
  formData: FictitiousNameFormData,
  userId: string,
  orderId: string,
  signatureIp?: string
) {
  const now = new Date();
  const expirationDate = calculateDBAExpiration(now);
  const normalizedName = normalizeBusinessName(formData.fictitiousName);

  // Generate temporary document number (will be replaced with real Sunbiz number after filing)
  const documentNumber = `TEMP-${Date.now()}`;

  // Create FictitiousName record with owner records in a transaction
  const fictitiousName = await prisma.fictitiousName.create({
    data: {
      documentNumber,
      fictitiousName: formData.fictitiousName,
      normalizedName,
      county: formData.principalCounty,
      status: 'PENDING', // Will be updated to ACTIVE after Sunbiz filing
      filingDate: now,
      expirationDate,
      
      // Legacy string fields (for backwards compatibility)
      principalAddress: `${formData.mailingAddress.street}, ${formData.mailingAddress.city}, ${formData.mailingAddress.state} ${formData.mailingAddress.zipCode}`,
      mailingAddress: `${formData.mailingAddress.street}, ${formData.mailingAddress.city}, ${formData.mailingAddress.state} ${formData.mailingAddress.zipCode}`,
      numberOfOwners: formData.ownerType === 'INDIVIDUAL' 
        ? (formData.individualOwners?.length || 0)
        : (formData.businessEntityOwners?.length || 0),
      
      // New fields
      userId,
      orderId,
      fein: formData.fein || null,
      correspondenceEmail: formData.correspondenceEmail,
      
      // Advertisement certification
      advertisementCertified: formData.newspaperAdvertised,
      newspaperName: formData.newspaperName || null,
      publicationDate: formData.advertisementDate || null,
      
      // Electronic signature
      signatureName: formData.signatureName || null,
      signatureDate: now,
      signatureIp: signatureIp || null,
      
      // Structured data (JSON)
      principalAddressJson: serializeAddress(formData.mailingAddress),
      mailingAddressJson: serializeAddress(formData.mailingAddress),
      ownersData: serializeOwners(formData),
      
      // Create owner records
      owners: {
        create: formData.ownerType === 'INDIVIDUAL'
          ? (formData.individualOwners || []).map(owner => ({
              ownerType: 'INDIVIDUAL',
              firstName: owner.firstName,
              middleName: owner.middleName || null,
              lastName: owner.lastName,
              street: owner.address.street,
              street2: owner.address.street2 || null,
              city: owner.address.city,
              state: owner.address.state,
              zipCode: owner.address.zipCode,
            }))
          : (formData.businessEntityOwners || []).map(owner => ({
              ownerType: 'BUSINESS_ENTITY',
              entityName: owner.entityName,
              floridaDocumentNumber: owner.floridaDocumentNumber || null,
              fein: owner.fein || null,
              street: owner.entityAddress.street,
              street2: owner.entityAddress.street2 || null,
              city: owner.entityAddress.city,
              state: owner.entityAddress.state,
              zipCode: owner.entityAddress.zipCode,
            })),
      },
    },
    include: {
      owners: true,
    },
  });

  return fictitiousName;
}

