/**
 * Service Data Requirements Configuration
 *
 * Defines which services require additional customer data after payment
 * and what information needs to be collected for each service.
 *
 * Also defines account requirements for each service type.
 */

export interface ServiceDataRequirement {
  serviceType: string;
  requiresAdditionalData: boolean;
  dataCollectionFormType?: string;
  estimatedTimeToComplete?: string;
  fieldsNeeded?: string[];
  canPreFill?: boolean;
  preFilledMessage?: string;

  // Account requirement configuration
  requiresAccount: boolean;
  accountRequiredReason?: string;
  dashboardFeatures?: string[];
  guestCheckoutAllowed?: boolean;
  deliveryMethod?: 'dashboard' | 'email' | 'both';
  encourageAccount?: boolean;
  accountBenefits?: string[];
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
    requiresAccount: false,
    guestCheckoutAllowed: true,
    deliveryMethod: 'email',
    encourageAccount: true,
    accountBenefits: ['Track all documents', 'Get deadline reminders', 'Save 10% on future services'],
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
    requiresAccount: false,
    guestCheckoutAllowed: true,
    deliveryMethod: 'email',
    encourageAccount: true,
    accountBenefits: ['Track all documents', 'Get deadline reminders', 'Save 10% on future services'],
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
    requiresAccount: false,
    guestCheckoutAllowed: true,
    deliveryMethod: 'email',
    encourageAccount: true,
    accountBenefits: ['Track all documents', 'Get deadline reminders', 'Save 10% on future services'],
  },

  ANNUAL_REPORT: {
    serviceType: 'ANNUAL_REPORT',
    requiresAdditionalData: true,
    dataCollectionFormType: undefined, // Uses dedicated /orders/[orderId]/annual-report page, not complete-documents wizard
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
    requiresAccount: true,
    accountRequiredReason: 'Requires access to previous filings and compliance tracking',
    dashboardFeatures: ['Compliance tracking', 'Filing history', 'Deadline reminders', 'Pre-filled forms'],
    deliveryMethod: 'dashboard',
    guestCheckoutAllowed: false,
  },

  LLC_ANNUAL_REPORT: {
    serviceType: 'LLC_ANNUAL_REPORT',
    requiresAdditionalData: true,
    dataCollectionFormType: undefined, // Uses dedicated /orders/[orderId]/annual-report page, not complete-documents wizard
    estimatedTimeToComplete: '3 minutes',
    fieldsNeeded: [
      'Principal office address (may have changed)',
      'Mailing address (may have changed)',
      'Manager/Member names (may have changed)',
      'Registered agent information (may have changed)',
    ],
    canPreFill: true,
    preFilledMessage: 'We\'ll pre-fill from your LLC record - just review and update any changes',
    requiresAccount: true,
    accountRequiredReason: 'Requires access to your LLC information and compliance tracking',
    dashboardFeatures: ['Compliance tracking', 'Filing history', 'Deadline reminders', 'Pre-filled forms'],
    deliveryMethod: 'dashboard',
    guestCheckoutAllowed: false,
  },

  CORP_ANNUAL_REPORT: {
    serviceType: 'CORP_ANNUAL_REPORT',
    requiresAdditionalData: true,
    dataCollectionFormType: undefined, // Uses dedicated /orders/[orderId]/annual-report page, not complete-documents wizard
    estimatedTimeToComplete: '3 minutes',
    fieldsNeeded: [
      'Principal office address (may have changed)',
      'Mailing address (may have changed)',
      'Officer/Director names (may have changed)',
      'Registered agent information (may have changed)',
    ],
    canPreFill: true,
    preFilledMessage: 'We\'ll pre-fill from your corporation record - just review and update any changes',
    requiresAccount: true,
    accountRequiredReason: 'Requires access to your corporation information and compliance tracking',
    dashboardFeatures: ['Compliance tracking', 'Filing history', 'Deadline reminders', 'Pre-filled forms'],
    deliveryMethod: 'dashboard',
    guestCheckoutAllowed: false,
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
    requiresAccount: false,
    guestCheckoutAllowed: true,
    deliveryMethod: 'email',
    encourageAccount: true,
    accountBenefits: ['Track all documents', 'Get deadline reminders', 'Save 10% on future services'],
  },

  // ============================================================================
  // SERVICES NOT REQUIRING ADDITIONAL DATA
  // ============================================================================

  LLC_FORMATION: {
    serviceType: 'LLC_FORMATION',
    requiresAdditionalData: false,
    requiresAccount: true,
    accountRequiredReason: 'Ongoing registered agent service and document delivery',
    dashboardFeatures: ['Document delivery', 'Registered agent communication', 'Compliance tracking', 'Annual report reminders'],
    deliveryMethod: 'dashboard',
    guestCheckoutAllowed: false,
  },

  CORP_FORMATION: {
    serviceType: 'CORP_FORMATION',
    requiresAdditionalData: false,
    requiresAccount: true,
    accountRequiredReason: 'Ongoing registered agent service and document delivery',
    dashboardFeatures: ['Document delivery', 'Registered agent communication', 'Compliance tracking', 'Annual report reminders'],
    deliveryMethod: 'dashboard',
    guestCheckoutAllowed: false,
  },

  REGISTERED_AGENT: {
    serviceType: 'REGISTERED_AGENT',
    requiresAdditionalData: false,
    canPreFill: true,
    preFilledMessage: 'No additional information needed - we have everything from your formation',
    requiresAccount: true,
    accountRequiredReason: 'Must receive legal documents and communicate with registered agent',
    dashboardFeatures: ['Registered agent communication', 'Legal document receipt', 'Service of process notifications'],
    deliveryMethod: 'dashboard',
    guestCheckoutAllowed: false,
  },

  AMENDMENT: {
    serviceType: 'AMENDMENT',
    requiresAdditionalData: true,
    dataCollectionFormType: 'ENTITY_INFORMATION_UPDATE', // Deprecated - redirects to new form
    estimatedTimeToComplete: '3 minutes',
    fieldsNeeded: [
      'Type of amendment (name change, address change, etc.)',
      'New information to be filed',
      'Effective date',
    ],
    canPreFill: true,
    preFilledMessage: 'We\'ll show your current information for reference',
    requiresAccount: false,
    guestCheckoutAllowed: true,
    deliveryMethod: 'email',
    encourageAccount: true,
    accountBenefits: ['Track all documents', 'Get deadline reminders', 'Save 10% on future services'],
  },

  ENTITY_INFORMATION_UPDATE: {
    serviceType: 'ENTITY_INFORMATION_UPDATE',
    requiresAdditionalData: true,
    dataCollectionFormType: undefined, // Uses dedicated /orders/[orderId]/entity-information-update page
    estimatedTimeToComplete: '2 minutes',
    fieldsNeeded: [
      'Email address (optional)',
      'Federal Employer ID Number (optional)',
      'Principal office address (optional)',
      'Mailing address (optional)',
    ],
    canPreFill: true,
    preFilledMessage: 'Select which information you want to update - this service is FREE',
    requiresAccount: false,
    guestCheckoutAllowed: true,
    deliveryMethod: 'email',
    encourageAccount: true,
    accountBenefits: ['Track all updates', 'Get deadline reminders', 'Save 10% on future services'],
  },

  OFFICER_ADDRESS_UPDATE: {
    serviceType: 'OFFICER_ADDRESS_UPDATE',
    requiresAdditionalData: true,
    dataCollectionFormType: undefined, // Uses dedicated /orders/[orderId]/officer-address-update page
    estimatedTimeToComplete: '1 minute',
    fieldsNeeded: [
      'Officer/Director/Manager name',
      'Title/Position',
      'New address',
    ],
    canPreFill: true,
    preFilledMessage: 'Update the address for a specific officer, director, or manager - this service is FREE',
    requiresAccount: false,
    guestCheckoutAllowed: true,
    deliveryMethod: 'email',
    encourageAccount: true,
    accountBenefits: ['Track all updates', 'Get deadline reminders', 'Save 10% on future services'],
  },

  REGISTERED_AGENT_CHANGE: {
    serviceType: 'REGISTERED_AGENT_CHANGE',
    requiresAdditionalData: true,
    dataCollectionFormType: undefined, // Uses dedicated /orders/[orderId]/registered-agent-change page
    estimatedTimeToComplete: '3 minutes',
    fieldsNeeded: [
      'Current registered agent information',
      'New registered agent name and Florida address',
      'Agent type (individual or commercial)',
      'Effective date (optional)',
    ],
    canPreFill: true,
    preFilledMessage: 'Change your registered agent - requires mailing with $25 filing fee',
    requiresAccount: false,
    guestCheckoutAllowed: true,
    deliveryMethod: 'email',
    encourageAccount: true,
    accountBenefits: ['Track all updates', 'Get deadline reminders', 'Save 10% on future services'],
  },

  BUSINESS_AMENDMENT: {
    serviceType: 'BUSINESS_AMENDMENT',
    requiresAdditionalData: true,
    dataCollectionFormType: undefined, // Uses dedicated /orders/[orderId]/business-amendment page
    estimatedTimeToComplete: '3 minutes',
    fieldsNeeded: [
      'Type of amendment (name, purpose, management, stock)',
      'New information to be filed',
      'Effective date (optional)',
      'Reason for amendment',
    ],
    canPreFill: true,
    preFilledMessage: 'Amend your business structure - requires mailing with $25 filing fee',
    requiresAccount: false,
    guestCheckoutAllowed: true,
    deliveryMethod: 'email',
    encourageAccount: true,
    accountBenefits: ['Track all updates', 'Get deadline reminders', 'Save 10% on future services'],
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
    requiresAccount: false,
    guestCheckoutAllowed: true,
    deliveryMethod: 'email',
    encourageAccount: true,
    accountBenefits: ['Track all documents', 'Get deadline reminders', 'Save 10% on future services'],
  },

  NAME_RESERVATION: {
    serviceType: 'NAME_RESERVATION',
    requiresAdditionalData: false,
    requiresAccount: false,
    guestCheckoutAllowed: true,
    deliveryMethod: 'email',
    encourageAccount: true,
    accountBenefits: ['Track all documents', 'Get deadline reminders', 'Save 10% on future services'],
  },

  EXPEDITED_PROCESSING: {
    serviceType: 'EXPEDITED_PROCESSING',
    requiresAdditionalData: false,
    requiresAccount: false,
    guestCheckoutAllowed: true,
    deliveryMethod: 'both',
    encourageAccount: false,
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

/**
 * Helper function to check if a service requires an account
 */
export function requiresAccount(serviceType: string): boolean {
  const requirements = getServiceDataRequirements(serviceType);
  return requirements?.requiresAccount || false;
}

/**
 * Helper function to check if guest checkout is allowed
 */
export function allowsGuestCheckout(serviceType: string): boolean {
  const requirements = getServiceDataRequirements(serviceType);
  return requirements?.guestCheckoutAllowed || false;
}

/**
 * Helper function to get account required reason
 */
export function getAccountRequiredReason(serviceType: string): string | undefined {
  const requirements = getServiceDataRequirements(serviceType);
  return requirements?.accountRequiredReason;
}

/**
 * Helper function to get dashboard features
 */
export function getDashboardFeatures(serviceType: string): string[] {
  const requirements = getServiceDataRequirements(serviceType);
  return requirements?.dashboardFeatures || [];
}

/**
 * Helper function to get account benefits
 */
export function getAccountBenefits(serviceType: string): string[] {
  const requirements = getServiceDataRequirements(serviceType);
  return requirements?.accountBenefits || [];
}

/**
 * Helper function to check if account creation should be encouraged
 */
export function shouldEncourageAccount(serviceType: string): boolean {
  const requirements = getServiceDataRequirements(serviceType);
  return requirements?.encourageAccount || false;
}

/**
 * Helper function to get delivery method
 */
export function getDeliveryMethod(serviceType: string): 'dashboard' | 'email' | 'both' | undefined {
  const requirements = getServiceDataRequirements(serviceType);
  return requirements?.deliveryMethod;
}

