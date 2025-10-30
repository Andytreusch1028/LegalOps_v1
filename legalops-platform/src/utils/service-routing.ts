/**
 * Service Routing Utilities
 * 
 * Maps service types to their dedicated form pages and provides
 * helper functions for routing users to the correct forms.
 */

/**
 * Map of service types to their dedicated form page paths
 */
export const SERVICE_FORM_ROUTES: Record<string, string> = {
  // Formation Services
  LLC_FORMATION: '/services/llc-formation',
  CORP_FORMATION: '/services/corporation-formation',
  
  // Annual Compliance
  ANNUAL_REPORT: '/orders/[orderId]/annual-report',
  
  // Registered Agent
  REGISTERED_AGENT: null, // No form needed - included in packages
  
  // Tax Services
  EIN_APPLICATION: '/orders/[orderId]/ein-application',
  
  // Documents
  OPERATING_AGREEMENT: '/orders/[orderId]/operating-agreement',
  CORPORATE_BYLAWS: '/orders/[orderId]/corporate-bylaws',
  CERTIFICATE_OF_STATUS: '/orders/[orderId]/certificate-of-status',
  
  // Updates & Amendments (NEW)
  ENTITY_INFORMATION_UPDATE: '/orders/[orderId]/entity-information-update',
  OFFICER_ADDRESS_UPDATE: '/orders/[orderId]/officer-address-update',
  REGISTERED_AGENT_CHANGE: '/orders/[orderId]/registered-agent-change',
  BUSINESS_AMENDMENT: '/orders/[orderId]/business-amendment',
  
  // Deprecated - redirects to new forms
  AMENDMENT: '/orders/[orderId]/amendment', // Now uses ENTITY_INFORMATION_UPDATE form
  
  // Other Services
  DISSOLUTION: '/orders/[orderId]/dissolution',
  NAME_RESERVATION: '/orders/[orderId]/name-reservation',
  
  // Add-ons
  EXPEDITED_PROCESSING: null, // No form needed - just a fee
};

/**
 * Get the form route for a service type
 * @param serviceType - The service type enum value
 * @param orderId - The order ID (required for order-specific routes)
 * @returns The route path or null if no form is needed
 */
export function getServiceFormRoute(serviceType: string, orderId?: string): string | null {
  const route = SERVICE_FORM_ROUTES[serviceType];
  
  if (!route) {
    return null;
  }
  
  // Replace [orderId] placeholder with actual orderId
  if (orderId && route.includes('[orderId]')) {
    return route.replace('[orderId]', orderId);
  }
  
  return route;
}

/**
 * Check if a service type requires a dedicated form
 * @param serviceType - The service type enum value
 * @returns True if the service has a dedicated form
 */
export function requiresDedicatedForm(serviceType: string): boolean {
  return SERVICE_FORM_ROUTES[serviceType] !== null;
}

/**
 * Get user-friendly service type name
 * @param serviceType - The service type enum value
 * @returns Human-readable service name
 */
export function getServiceTypeName(serviceType: string): string {
  const names: Record<string, string> = {
    LLC_FORMATION: 'LLC Formation',
    CORP_FORMATION: 'Corporation Formation',
    ANNUAL_REPORT: 'Annual Report',
    REGISTERED_AGENT: 'Registered Agent Service',
    EIN_APPLICATION: 'EIN Application',
    OPERATING_AGREEMENT: 'Operating Agreement',
    CORPORATE_BYLAWS: 'Corporate Bylaws',
    CERTIFICATE_OF_STATUS: 'Certificate of Status',
    ENTITY_INFORMATION_UPDATE: 'Entity Information Update',
    OFFICER_ADDRESS_UPDATE: 'Officer Address Update',
    REGISTERED_AGENT_CHANGE: 'Registered Agent Change',
    BUSINESS_AMENDMENT: 'Business Amendment',
    AMENDMENT: 'Amendment',
    DISSOLUTION: 'Dissolution',
    NAME_RESERVATION: 'Name Reservation',
    EXPEDITED_PROCESSING: 'Expedited Processing',
  };
  
  return names[serviceType] || serviceType.replace(/_/g, ' ');
}

/**
 * Get service category for grouping
 * @param serviceType - The service type enum value
 * @returns Service category
 */
export function getServiceCategory(serviceType: string): string {
  const categories: Record<string, string> = {
    LLC_FORMATION: 'FORMATION',
    CORP_FORMATION: 'FORMATION',
    ANNUAL_REPORT: 'ANNUAL_COMPLIANCE',
    REGISTERED_AGENT: 'REGISTERED_AGENT',
    EIN_APPLICATION: 'TAX_SERVICES',
    OPERATING_AGREEMENT: 'DOCUMENTS',
    CORPORATE_BYLAWS: 'DOCUMENTS',
    CERTIFICATE_OF_STATUS: 'CERTIFICATES',
    ENTITY_INFORMATION_UPDATE: 'AMENDMENTS',
    OFFICER_ADDRESS_UPDATE: 'AMENDMENTS',
    REGISTERED_AGENT_CHANGE: 'AMENDMENTS',
    BUSINESS_AMENDMENT: 'AMENDMENTS',
    AMENDMENT: 'AMENDMENTS',
    DISSOLUTION: 'DISSOLUTION',
    NAME_RESERVATION: 'NAME_SERVICES',
    EXPEDITED_PROCESSING: 'ADD_ONS',
  };
  
  return categories[serviceType] || 'OTHER';
}

/**
 * Check if service is free (no filing fee)
 * @param serviceType - The service type enum value
 * @returns True if the service is free
 */
export function isFreeService(serviceType: string): boolean {
  const freeServices = [
    'ENTITY_INFORMATION_UPDATE',
    'OFFICER_ADDRESS_UPDATE',
  ];
  
  return freeServices.includes(serviceType);
}

/**
 * Check if service requires mailing
 * @param serviceType - The service type enum value
 * @returns True if the service requires mailing
 */
export function requiresMailing(serviceType: string): boolean {
  const mailingServices = [
    'REGISTERED_AGENT_CHANGE',
    'BUSINESS_AMENDMENT',
  ];
  
  return mailingServices.includes(serviceType);
}

/**
 * Get filing fee for a service type
 * @param serviceType - The service type enum value
 * @returns Filing fee amount or 0 if free
 */
export function getFilingFee(serviceType: string): number {
  const fees: Record<string, number> = {
    LLC_FORMATION: 125,
    CORP_FORMATION: 70,
    ANNUAL_REPORT: 138.75,
    REGISTERED_AGENT: 0, // Included in package
    EIN_APPLICATION: 0, // Federal service, no state fee
    OPERATING_AGREEMENT: 0, // Document preparation only
    CORPORATE_BYLAWS: 0, // Document preparation only
    CERTIFICATE_OF_STATUS: 5,
    ENTITY_INFORMATION_UPDATE: 0, // FREE
    OFFICER_ADDRESS_UPDATE: 0, // FREE
    REGISTERED_AGENT_CHANGE: 25,
    BUSINESS_AMENDMENT: 25,
    AMENDMENT: 0, // Deprecated
    DISSOLUTION: 25,
    NAME_RESERVATION: 35,
    EXPEDITED_PROCESSING: 0, // Variable based on service
  };
  
  return fees[serviceType] || 0;
}

