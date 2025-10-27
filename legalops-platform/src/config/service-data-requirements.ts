/**
 * Service Data Requirements Configuration
 * 
 * Defines which services require additional customer data after payment
 * and what information needs to be collected for each service.
 */

export interface ServiceDataRequirement {
  serviceType: string;
  requiresAdditionalData: boolean;
  dataCollectionFormType?: string;
  estimatedTimeToComplete?: string;
  fieldsNeeded?: string[];
  canPreFill?: boolean;
  preFilledMessage?: string;
}

/**
 * Configuration for each service type
 */
export const SERVICE_DATA_REQUIREMENTS: Record<string, ServiceDataRequirement> = {
  // ============================================================================
  // SERVICES REQUIRING ADDITIONAL DATA
  // ============================================================================
  
  OPERATING_AGREEMENT: {
    serviceType: 'OPERATING_AGREEMENT',
    requiresAdditionalData: true,
    dataCollectionFormType: 'OPERATING_AGREEMENT',
    estimatedTimeToComplete: '5 minutes',
    fieldsNeeded: [
      'Member names and addresses',
      'Ownership percentages',
      'Management structure (member-managed or manager-managed)',
      'Capital contributions',
      'Profit/loss distribution',
      'Voting rights',
    ],
    canPreFill: true,
    preFilledMessage: 'We\'ll pre-fill member information from your LLC formation',
  },

  EIN_APPLICATION: {
    serviceType: 'EIN_APPLICATION',
    requiresAdditionalData: true,
    dataCollectionFormType: 'EIN_APPLICATION',
    estimatedTimeToComplete: '3 minutes',
    fieldsNeeded: [
      'Responsible party name and SSN/ITIN',
      'Business start date',
      'Number of employees expected in next 12 months',
      'Tax classification (LLC, Corporation, Partnership, etc.)',
      'Reason for applying (started new business, hired employees, etc.)',
    ],
    canPreFill: true,
    preFilledMessage: 'We\'ll pre-fill business information from your formation',
  },

  CORPORATE_BYLAWS: {
    serviceType: 'CORPORATE_BYLAWS',
    requiresAdditionalData: true,
    dataCollectionFormType: 'CORPORATE_BYLAWS',
    estimatedTimeToComplete: '5 minutes',
    fieldsNeeded: [
      'Director names and addresses',
      'Officer titles and names',
      'Number of authorized shares',
      'Par value per share',
      'Meeting requirements (annual, special)',
      'Quorum requirements',
      'Fiscal year end date',
    ],
    canPreFill: true,
    preFilledMessage: 'We\'ll pre-fill director information from your corporation formation',
  },

  ANNUAL_REPORT: {
    serviceType: 'ANNUAL_REPORT',
    requiresAdditionalData: true,
    dataCollectionFormType: 'ANNUAL_REPORT',
    estimatedTimeToComplete: '3 minutes',
    fieldsNeeded: [
      'Principal office address (may have changed)',
      'Mailing address (may have changed)',
      'Officer/Director names (may have changed)',
      'Registered agent information (may have changed)',
      'Member/Manager information for LLCs (may have changed)',
    ],
    canPreFill: true,
    preFilledMessage: 'We\'ll pre-fill from your last filing - just review and update any changes',
  },

  CERTIFICATE_OF_STATUS: {
    serviceType: 'CERTIFICATE_OF_STATUS',
    requiresAdditionalData: true,
    dataCollectionFormType: 'CERTIFICATE_OF_STATUS',
    estimatedTimeToComplete: '1 minute',
    fieldsNeeded: [
      'Purpose of certificate (bank, loan, contract, etc.)',
      'Recipient name/institution',
      'Number of certified copies needed',
    ],
    canPreFill: false,
  },

  // ============================================================================
  // SERVICES NOT REQUIRING ADDITIONAL DATA
  // ============================================================================

  LLC_FORMATION: {
    serviceType: 'LLC_FORMATION',
    requiresAdditionalData: false,
  },

  CORP_FORMATION: {
    serviceType: 'CORP_FORMATION',
    requiresAdditionalData: false,
  },

  REGISTERED_AGENT: {
    serviceType: 'REGISTERED_AGENT',
    requiresAdditionalData: false,
    canPreFill: true,
    preFilledMessage: 'No additional information needed - we have everything from your formation',
  },

  AMENDMENT: {
    serviceType: 'AMENDMENT',
    requiresAdditionalData: true,
    dataCollectionFormType: 'AMENDMENT',
    estimatedTimeToComplete: '3 minutes',
    fieldsNeeded: [
      'Type of amendment (name change, address change, etc.)',
      'New information to be filed',
      'Effective date',
    ],
    canPreFill: true,
    preFilledMessage: 'We\'ll show your current information for reference',
  },

  DISSOLUTION: {
    serviceType: 'DISSOLUTION',
    requiresAdditionalData: true,
    dataCollectionFormType: 'DISSOLUTION',
    estimatedTimeToComplete: '2 minutes',
    fieldsNeeded: [
      'Reason for dissolution',
      'Effective date of dissolution',
      'Confirmation that all debts/obligations are settled',
    ],
    canPreFill: false,
  },

  NAME_RESERVATION: {
    serviceType: 'NAME_RESERVATION',
    requiresAdditionalData: false,
  },

  EXPEDITED_PROCESSING: {
    serviceType: 'EXPEDITED_PROCESSING',
    requiresAdditionalData: false,
  },
};

/**
 * Helper function to get data requirements for a service type
 */
export function getServiceDataRequirements(serviceType: string): ServiceDataRequirement | null {
  return SERVICE_DATA_REQUIREMENTS[serviceType] || null;
}

/**
 * Helper function to check if a service requires additional data
 */
export function requiresAdditionalData(serviceType: string): boolean {
  const requirements = getServiceDataRequirements(serviceType);
  return requirements?.requiresAdditionalData || false;
}

/**
 * Helper function to get estimated time to complete data collection
 */
export function getEstimatedTime(serviceType: string): string {
  const requirements = getServiceDataRequirements(serviceType);
  return requirements?.estimatedTimeToComplete || 'a few minutes';
}

/**
 * Helper function to get fields needed for a service
 */
export function getFieldsNeeded(serviceType: string): string[] {
  const requirements = getServiceDataRequirements(serviceType);
  return requirements?.fieldsNeeded || [];
}

/**
 * Helper function to check if service data can be pre-filled
 */
export function canPreFillData(serviceType: string): boolean {
  const requirements = getServiceDataRequirements(serviceType);
  return requirements?.canPreFill || false;
}

/**
 * Helper function to get pre-filled message
 */
export function getPreFilledMessage(serviceType: string): string | undefined {
  const requirements = getServiceDataRequirements(serviceType);
  return requirements?.preFilledMessage;
}

