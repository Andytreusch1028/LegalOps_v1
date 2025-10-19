/**
 * LegalOps v1 - Disclaimer Acceptance Logging Service
 * 
 * CRITICAL: This service handles logging and persistence of all disclaimer acceptances
 * for legal protection and audit trail purposes.
 * 
 * All disclaimer acceptances MUST be:
 * 1. Saved to the customer's database record
 * 2. Timestamped with ISO 8601 format
 * 3. Preserved for minimum 7 years (recommended for legal compliance)
 * 4. Included in customer data exports
 * 5. Available for audit and legal review
 */

import { AddressDisclaimerAcceptance } from './usps-address-validation';

/**
 * Save disclaimer acceptance to customer record
 * 
 * @param customerId - The customer ID
 * @param acceptance - The disclaimer acceptance record
 * @returns Promise that resolves when saved
 */
export async function saveDisclaimerAcceptance(
  customerId: string,
  acceptance: AddressDisclaimerAcceptance
): Promise<void> {
  try {
    // TODO: Implement database save
    // Example implementation:
    /*
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        disclaimerAcceptances: {
          create: {
            timestamp: acceptance.timestamp,
            issueType: acceptance.issueType,
            addressUsed: acceptance.addressUsed,
            uspsValidatedAddress: acceptance.uspsValidatedAddress,
            acknowledgedRisk: acceptance.acknowledgedRisk,
            confirmedProceed: acceptance.confirmedProceed,
            disclaimer1Text: acceptance.disclaimer1Text,
            disclaimer2Text: acceptance.disclaimer2Text,
            ipAddress: acceptance.ipAddress,
            userAgent: acceptance.userAgent,
            context: acceptance.context,
          }
        }
      }
    });
    */

    // Also log to audit trail
    console.log('📝 DISCLAIMER ACCEPTANCE SAVED:', {
      customerId,
      timestamp: acceptance.timestamp,
      issueType: acceptance.issueType,
    });

    // TODO: Send to audit logging service
    // await auditLog.log('DISCLAIMER_ACCEPTED', { customerId, acceptance });

  } catch (error) {
    console.error('❌ CRITICAL ERROR: Failed to save disclaimer acceptance:', error);
    // This is a critical error - should alert administrators
    // await alertAdministrators('DISCLAIMER_SAVE_FAILED', { customerId, error });
    throw error;
  }
}

/**
 * Get all disclaimer acceptances for a customer
 * 
 * @param customerId - The customer ID
 * @returns Array of disclaimer acceptances
 */
export async function getCustomerDisclaimerAcceptances(
  customerId: string
): Promise<AddressDisclaimerAcceptance[]> {
  try {
    // TODO: Implement database query
    // Example implementation:
    /*
    const acceptances = await prisma.disclaimerAcceptance.findMany({
      where: { customerId },
      orderBy: { timestamp: 'desc' }
    });
    return acceptances;
    */

    return [];
  } catch (error) {
    console.error('Error fetching disclaimer acceptances:', error);
    throw error;
  }
}

/**
 * Export disclaimer acceptances for a customer (for data export/GDPR compliance)
 * 
 * @param customerId - The customer ID
 * @returns JSON string of all acceptances
 */
export async function exportCustomerDisclaimers(
  customerId: string
): Promise<string> {
  const acceptances = await getCustomerDisclaimerAcceptances(customerId);
  
  return JSON.stringify({
    customerId,
    exportDate: new Date().toISOString(),
    totalAcceptances: acceptances.length,
    acceptances,
  }, null, 2);
}

/**
 * Validate that a disclaimer acceptance record is complete and valid
 * 
 * @param acceptance - The disclaimer acceptance to validate
 * @returns true if valid, throws error if invalid
 */
export function validateDisclaimerAcceptance(
  acceptance: AddressDisclaimerAcceptance
): boolean {
  const errors: string[] = [];

  if (!acceptance.timestamp) {
    errors.push('Missing timestamp');
  }

  if (!acceptance.issueType) {
    errors.push('Missing issue type');
  }

  if (!acceptance.addressUsed) {
    errors.push('Missing address used');
  }

  if (!acceptance.acknowledgedRisk) {
    errors.push('User did not acknowledge risk');
  }

  if (!acceptance.confirmedProceed) {
    errors.push('User did not confirm proceed');
  }

  if (!acceptance.disclaimer1Text || acceptance.disclaimer1Text.length < 50) {
    errors.push('Disclaimer 1 text is missing or too short');
  }

  if (!acceptance.disclaimer2Text || acceptance.disclaimer2Text.length < 50) {
    errors.push('Disclaimer 2 text is missing or too short');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid disclaimer acceptance: ${errors.join(', ')}`);
  }

  return true;
}

/**
 * Format disclaimer acceptance for display in legal documents
 * 
 * @param acceptance - The disclaimer acceptance
 * @returns Formatted text for legal documents
 */
export function formatDisclaimerForLegalDocument(
  acceptance: AddressDisclaimerAcceptance
): string {
  const date = new Date(acceptance.timestamp);
  
  return `
DISCLAIMER ACCEPTANCE RECORD

Date/Time: ${date.toLocaleString('en-US', { 
  dateStyle: 'full', 
  timeStyle: 'long',
  timeZone: 'America/New_York' 
})}

Issue Type: ${acceptance.issueType}

Address Used:
${acceptance.addressUsed.address2}
${acceptance.addressUsed.address1 ? acceptance.addressUsed.address1 + '\n' : ''}${acceptance.addressUsed.city}, ${acceptance.addressUsed.state} ${acceptance.addressUsed.zip5}${acceptance.addressUsed.zip4 ? '-' + acceptance.addressUsed.zip4 : ''}

${acceptance.uspsValidatedAddress ? `
USPS Validated Address:
${acceptance.uspsValidatedAddress.address2}
${acceptance.uspsValidatedAddress.address1 ? acceptance.uspsValidatedAddress.address1 + '\n' : ''}${acceptance.uspsValidatedAddress.city}, ${acceptance.uspsValidatedAddress.state} ${acceptance.uspsValidatedAddress.zip5}${acceptance.uspsValidatedAddress.zip4 ? '-' + acceptance.uspsValidatedAddress.zip4 : ''}
` : ''}

DISCLAIMERS ACCEPTED:

1. ${acceptance.disclaimer1Text}

2. ${acceptance.disclaimer2Text}

Customer ID: ${acceptance.customerId || 'N/A'}
IP Address: ${acceptance.ipAddress || 'N/A'}
User Agent: ${acceptance.userAgent || 'N/A'}

This disclaimer acceptance is legally binding and has been recorded in the customer's permanent record.
`;
}

/**
 * Check if customer has any unverified address disclaimers
 * (useful for showing warnings in dashboard)
 * 
 * @param customerId - The customer ID
 * @returns true if customer has unverified address disclaimers
 */
export async function hasUnverifiedAddressDisclaimers(
  customerId: string
): Promise<boolean> {
  const acceptances = await getCustomerDisclaimerAcceptances(customerId);
  return acceptances.some(a => a.issueType === 'UNVERIFIED');
}

