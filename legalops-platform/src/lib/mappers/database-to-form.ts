/**
 * Database to Form Mapper
 * 
 * Transforms database records back into form data structures.
 * Used for editing existing entities and round-trip testing.
 */

import {
  LLCFormationFormData,
  CorporationFormationFormData,
  AnnualReportFormData,
  AddressFormData,
} from '@/types/forms';

import {
  AddressType,
  AgentType,
  RoleType,
} from '@/types/entities';

// Simplified database types for mapping
/**
 * Simplified database address type for mapping.
 * Represents address data as stored in the database.
 */
export interface DatabaseAddress {
  street: string;
  street2?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country?: string | null;
  addressType: AddressType;
}

/**
 * Simplified database registered agent type for mapping.
 * Represents registered agent data as stored in the database.
 */
export interface DatabaseRegisteredAgent {
  agentType: AgentType;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
}

/**
 * Simplified database manager/officer type for mapping.
 * Represents manager or officer data as stored in the database.
 */
export interface DatabaseManagerOfficer {
  firstName: string;
  lastName: string;
  title?: string | null;
  roleType: RoleType;
  email?: string | null;
  phone?: string | null;
  address: string;
}

/**
 * Simplified database business entity type for mapping.
 * Represents business entity data with related records.
 */
export interface DatabaseBusinessEntity {
  legalName: string;
  dbaName?: string | null;
  purpose?: string | null;
  addresses?: DatabaseAddress[];
  registeredAgent?: DatabaseRegisteredAgent;
  managersOfficers?: DatabaseManagerOfficer[];
}

/**
 * Simplified database filing type for mapping.
 * Represents filing data as stored in the database.
 */
export interface DatabaseFiling {
  filingData: Record<string, unknown>;
}

// ============================================================================
// ADDRESS MAPPING
// ============================================================================

/**
 * Maps database address record to form address data.
 * Converts database schema format to user-friendly form structure.
 * 
 * @param address - Address record from database
 * @returns Form-compatible address data
 * 
 * @example
 * ```typescript
 * const formAddress = mapDatabaseAddressToForm(dbAddress);
 * // Use in form initialization
 * ```
 */
export function mapDatabaseAddressToForm(address: DatabaseAddress): AddressFormData {
  return {
    street: address.street,
    street2: address.street2 ?? undefined,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    country: address.country ?? undefined,
  };
}

// ============================================================================
// LLC FORMATION MAPPING
// ============================================================================

/**
 * Maps database records back to LLC formation form data.
 * Enables editing existing LLCs and validates round-trip data consistency.
 * 
 * Business Logic:
 * - Reconstructs form structure from normalized database records
 * - Determines mailing address option based on presence of separate mailing address
 * - Identifies LegalOps registered agent service vs custom agent
 * - Maps managers with their roles and contact information
 * - Extracts filing-specific data from JSON storage
 * 
 * @param businessEntity - Business entity record with related data
 * @param filing - Filing record containing form data
 * @returns Complete LLC formation form data
 * @throws Error if required data (principal address, registered agent) is missing
 * 
 * @example
 * ```typescript
 * const formData = mapDatabaseToLLCFormation(entity, filing);
 * // Use to pre-populate edit form
 * ```
 */
export function mapDatabaseToLLCFormation(
  businessEntity: DatabaseBusinessEntity,
  filing: DatabaseFiling
): LLCFormationFormData {
  const principalAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === AddressType.PRINCIPAL
  );

  if (!principalAddr) {
    throw new Error('Principal address is required');
  }

  const mailingAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === AddressType.MAILING
  );

  const agentAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === AddressType.REGISTERED_AGENT
  );

  // Determine mailing address option
  let mailingAddressOption: 'SAME_AS_PRINCIPAL' | 'SAME_AS_PERSONAL' | 'DIFFERENT' = 'SAME_AS_PRINCIPAL';
  let mailingAddress: AddressFormData | undefined;

  if (mailingAddr) {
    mailingAddressOption = 'DIFFERENT';
    mailingAddress = mapDatabaseAddressToForm(mailingAddr);
  }

  // Map registered agent
  const agent = businessEntity.registeredAgent;
  if (!agent) {
    throw new Error('Registered agent is required');
  }

  let registeredAgentOption: 'SELF' | 'EXISTING' | 'NEW' | 'LEGALOPS' = 'LEGALOPS';
  let newRegisteredAgent: LLCFormationFormData['newRegisteredAgent'];

  // Check if this is the LegalOps registered agent service
  const isLegalOpsService = agent.agentType === AgentType.LEGALOPS && 
    agent.companyName === 'LegalOps Registered Agent Services';

  if (isLegalOpsService) {
    registeredAgentOption = 'LEGALOPS';
  } else {
    registeredAgentOption = 'NEW';
    newRegisteredAgent = {
      agentType: agent.agentType,
      firstName: agent.firstName ?? undefined,
      lastName: agent.lastName ?? undefined,
      companyName: agent.companyName ?? undefined,
      email: agent.email ?? undefined,
      phone: agent.phone ?? undefined,
      address: agentAddr ? mapDatabaseAddressToForm(agentAddr) : {
        street: '',
        city: '',
        state: 'FL',
        zipCode: '',
      },
    };
  }

  // Map managers
  const managers = (businessEntity.managersOfficers || []).map((manager) => ({
    option: 'NEW' as const,
    firstName: manager.firstName,
    lastName: manager.lastName,
    title: manager.title || undefined,
    roleType: manager.roleType,
    email: manager.email || undefined,
    phone: manager.phone || undefined,
    address: manager.address,
  }));

  // Extract filing data
  const filingData = filing.filingData;

  return {
    businessName: businessEntity.legalName,
    effectiveDate: filingData.effectiveDate as string | undefined,
    duration: filingData.duration as 'PERPETUAL' | 'SPECIFIC_DATE' | undefined,
    dissolutionDate: filingData.dissolutionDate as string | undefined,
    purpose: businessEntity.purpose || undefined,
    principalAddress: mapDatabaseAddressToForm(principalAddr),
    mailingAddressOption,
    mailingAddress,
    registeredAgentOption,
    newRegisteredAgent,
    managementStructure: (filingData.managementStructure as 'MEMBER_MANAGED' | 'MANAGER_MANAGED') || 'MEMBER_MANAGED',
    managersOption: managers.length > 1 ? 'MULTIPLE' : 'SELF_ONLY',
    managers,
    expeditedProcessing: filingData.expeditedProcessing as boolean | undefined,
    certifiedCopy: filingData.certifiedCopy as boolean | undefined,
    correspondenceEmail: filingData.correspondenceEmail as string,
  };
}

// ============================================================================
// CORPORATION FORMATION MAPPING
// ============================================================================

/**
 * Maps database records back to corporation formation form data.
 * Enables editing existing corporations and validates round-trip data consistency.
 * 
 * Business Logic:
 * - Reconstructs form structure from normalized database records
 * - Determines mailing address option based on presence of separate mailing address
 * - Identifies LegalOps registered agent service vs custom agent
 * - Separates officers and directors based on role types
 * - Extracts stock information and incorporator details from filing data
 * 
 * @param businessEntity - Business entity record with related data
 * @param filing - Filing record containing form data
 * @returns Complete corporation formation form data
 * @throws Error if required data (principal address, registered agent) is missing
 * 
 * @example
 * ```typescript
 * const formData = mapDatabaseToCorporationFormation(entity, filing);
 * // Use to pre-populate edit form
 * ```
 */
export function mapDatabaseToCorporationFormation(
  businessEntity: DatabaseBusinessEntity,
  filing: DatabaseFiling
): CorporationFormationFormData {
  const principalAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === AddressType.PRINCIPAL
  );

  if (!principalAddr) {
    throw new Error('Principal address is required');
  }

  const mailingAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === AddressType.MAILING
  );

  const agentAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === AddressType.REGISTERED_AGENT
  );

  // Determine mailing address option
  let mailingAddressOption: 'SAME_AS_PRINCIPAL' | 'SAME_AS_PERSONAL' | 'DIFFERENT' = 'SAME_AS_PRINCIPAL';
  let mailingAddress: AddressFormData | undefined;

  if (mailingAddr) {
    mailingAddressOption = 'DIFFERENT';
    mailingAddress = mapDatabaseAddressToForm(mailingAddr);
  }

  // Map registered agent
  const agent = businessEntity.registeredAgent;
  if (!agent) {
    throw new Error('Registered agent is required');
  }

  let registeredAgentOption: 'SELF' | 'EXISTING' | 'NEW' | 'LEGALOPS' = 'LEGALOPS';
  let newRegisteredAgent: CorporationFormationFormData['newRegisteredAgent'];

  // Check if this is the LegalOps registered agent service
  const isLegalOpsService = agent.agentType === AgentType.LEGALOPS && 
    agent.companyName === 'LegalOps Registered Agent Services';

  if (isLegalOpsService) {
    registeredAgentOption = 'LEGALOPS';
  } else {
    registeredAgentOption = 'NEW';
    newRegisteredAgent = {
      agentType: agent.agentType,
      firstName: agent.firstName ?? undefined,
      lastName: agent.lastName ?? undefined,
      companyName: agent.companyName ?? undefined,
      email: agent.email ?? undefined,
      phone: agent.phone ?? undefined,
      address: agentAddr ? mapDatabaseAddressToForm(agentAddr) : {
        street: '',
        city: '',
        state: 'FL',
        zipCode: '',
      },
    };
  }

  // Separate officers and directors
  const officers = (businessEntity.managersOfficers || [])
    .filter((person) =>
      ['PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'TREASURER'].includes(person.roleType)
    )
    .map((officer) => ({
      option: 'NEW' as const,
      firstName: officer.firstName,
      lastName: officer.lastName,
      roleType: officer.roleType,
      email: officer.email || undefined,
      phone: officer.phone || undefined,
      address: officer.address,
    }));

  const directors = (businessEntity.managersOfficers || [])
    .filter((person) => person.roleType === RoleType.DIRECTOR)
    .map((director) => ({
      option: 'NEW' as const,
      firstName: director.firstName,
      lastName: director.lastName,
      email: director.email || undefined,
      phone: director.phone || undefined,
      address: director.address,
    }));

  // Extract filing data
  const filingData = filing.filingData;

  return {
    businessName: businessEntity.legalName,
    corporationType: (filingData.corporationType as 'FOR_PROFIT' | 'NONPROFIT') || 'FOR_PROFIT',
    effectiveDate: filingData.effectiveDate as string | undefined,
    purpose: businessEntity.purpose || undefined,
    authorizedShares: filingData.authorizedShares as number | undefined,
    parValue: filingData.parValue as number | undefined,
    stockClasses: filingData.stockClasses as CorporationFormationFormData['stockClasses'],
    principalAddress: mapDatabaseAddressToForm(principalAddr),
    mailingAddressOption,
    mailingAddress,
    registeredAgentOption,
    newRegisteredAgent,
    officers,
    directors,
    incorporatorOption: (filingData.incorporatorOption as 'SELF' | 'ATTORNEY' | 'OTHER') || 'SELF',
    incorporator: filingData.incorporator as CorporationFormationFormData['incorporator'],
    expeditedProcessing: filingData.expeditedProcessing as boolean | undefined,
    certifiedCopy: filingData.certifiedCopy as boolean | undefined,
    correspondenceEmail: filingData.correspondenceEmail as string,
  };
}

// ============================================================================
// ANNUAL REPORT MAPPING
// ============================================================================

/**
 * Maps database filing record back to annual report form data.
 * Enables editing draft annual reports and reviewing submitted reports.
 * 
 * @param businessEntityId - ID of the business entity
 * @param filing - Filing record containing annual report data
 * @returns Complete annual report form data
 * 
 * @example
 * ```typescript
 * const formData = mapDatabaseToAnnualReport(entityId, filing);
 * // Use to pre-populate edit form or display submitted report
 * ```
 */
export function mapDatabaseToAnnualReport(
  businessEntityId: string,
  filing: DatabaseFiling
): AnnualReportFormData {
  const filingData = filing.filingData;

  return {
    businessEntityId,
    confirmCurrentInformation: (filingData.confirmCurrentInformation as boolean) || false,
    hasChanges: (filingData.hasChanges as boolean) || false,
    changes: filingData.changes as AnnualReportFormData['changes'],
    correspondenceEmail: filingData.correspondenceEmail as string,
  };
}
