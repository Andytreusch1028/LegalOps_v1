/**
 * LegalOps v1 - Database to Sunbiz Form Mapper
 * 
 * Transforms our database records into Sunbiz-specific form formats.
 * This is the bridge between our data model and government forms.
 */

import {
  BusinessEntityWithRelations,
  FilingWithRelations,
  Address,
  RegisteredAgent,
  ManagerOfficer,
} from '@/types/entities';

// ============================================================================
// SUNBIZ LLC FORMATION DATA
// ============================================================================

export interface SunbizLLCFormationData {
  // Business Name
  businessName: string;
  
  // Principal Address
  principalAddress: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
  };
  
  // Mailing Address
  mailingAddress: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
  };
  
  // Registered Agent
  registeredAgent: {
    name: string; // Full name or company name
    address: {
      street: string;
      street2?: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  
  // Managers/Members
  managers: Array<{
    name: string;
    address: string; // Formatted address string
    type: 'MGR' | 'MBR'; // Manager or Member
  }>;
  
  // Correspondence Email
  correspondenceEmail: string;
  
  // Optional Fields
  effectiveDate?: string;
  purpose?: string;
}

/**
 * Map our database records to Sunbiz LLC Formation format
 */
export function mapDatabaseToSunbizLLC(
  businessEntity: BusinessEntityWithRelations,
  filing: FilingWithRelations
): SunbizLLCFormationData {
  // Get addresses
  const principalAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === 'PRINCIPAL'
  );

  if (!principalAddr) {
    throw new Error('Principal address is required for LLC formation');
  }

  const mailingAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === 'MAILING'
  ) || principalAddr; // Default to principal if no mailing address

  // Get registered agent
  const agent = businessEntity.registeredAgent;
  if (!agent) {
    throw new Error('Registered agent is required for LLC formation');
  }

  const agentAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === 'REGISTERED_AGENT'
  );
  if (!agentAddr) {
    throw new Error('Registered agent address is required');
  }

  // Format agent name
  const agentName = agent.agentType === 'COMPANY'
    ? agent.companyName!
    : `${agent.firstName} ${agent.lastName}`;

  // Get managers
  const managers = (businessEntity.managersOfficers || []).map((manager) => ({
    name: `${manager.firstName} ${manager.lastName}`,
    address: manager.address,
    type: manager.roleType === 'MANAGER' ? 'MGR' as const : 'MBR' as const,
  }));

  // Get correspondence email from filing data
  const correspondenceEmail = filing.filingData.correspondenceEmail as string;

  return {
    businessName: businessEntity.legalName,
    principalAddress: {
      street: principalAddr.street,
      street2: principalAddr.street2,
      city: principalAddr.city,
      state: principalAddr.state,
      zip: principalAddr.zipCode,
    },
    mailingAddress: {
      street: mailingAddr.street,
      street2: mailingAddr.street2,
      city: mailingAddr.city,
      state: mailingAddr.state,
      zip: mailingAddr.zipCode,
    },
    registeredAgent: {
      name: agentName,
      address: {
        street: agentAddr.street,
        street2: agentAddr.street2,
        city: agentAddr.city,
        state: agentAddr.state,
        zip: agentAddr.zipCode,
      },
    },
    managers,
    correspondenceEmail,
    effectiveDate: filing.filingData.effectiveDate as string | undefined,
    purpose: filing.filingData.purpose as string | undefined,
  };
}

// ============================================================================
// SUNBIZ CORPORATION FORMATION DATA
// ============================================================================

export interface SunbizCorporationFormationData {
  // Business Name
  businessName: string;
  
  // Corporation Type
  corporationType: 'FOR_PROFIT' | 'NONPROFIT';
  
  // Principal Address
  principalAddress: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
  };
  
  // Mailing Address
  mailingAddress: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
  };
  
  // Registered Agent
  registeredAgent: {
    name: string;
    address: {
      street: string;
      street2?: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  
  // Officers
  officers: Array<{
    name: string;
    title: string; // President, Secretary, Treasurer, etc.
    address: string;
  }>;
  
  // Directors
  directors: Array<{
    name: string;
    address: string;
  }>;
  
  // Stock Information (For-Profit only)
  authorizedShares?: number;
  parValue?: number;
  
  // Correspondence Email
  correspondenceEmail: string;
  
  // Optional Fields
  effectiveDate?: string;
  purpose?: string;
}

/**
 * Map our database records to Sunbiz Corporation Formation format
 */
export function mapDatabaseToSunbizCorporation(
  businessEntity: BusinessEntityWithRelations,
  filing: FilingWithRelations
): SunbizCorporationFormationData {
  // Get addresses
  const principalAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === 'PRINCIPAL'
  );

  if (!principalAddr) {
    throw new Error('Principal address is required for Corporation formation');
  }

  const mailingAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === 'MAILING'
  ) || principalAddr;

  // Get registered agent
  const agent = businessEntity.registeredAgent;
  if (!agent) {
    throw new Error('Registered agent is required for Corporation formation');
  }

  const agentAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === 'REGISTERED_AGENT'
  );
  if (!agentAddr) {
    throw new Error('Registered agent address is required');
  }

  const agentName = agent.agentType === 'COMPANY'
    ? agent.companyName!
    : `${agent.firstName} ${agent.lastName}`;

  // Separate officers and directors
  const officers = (businessEntity.managersOfficers || [])
    .filter((person) => 
      ['PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'TREASURER'].includes(person.roleType)
    )
    .map((officer) => ({
      name: `${officer.firstName} ${officer.lastName}`,
      title: formatOfficerTitle(officer.roleType),
      address: officer.address,
    }));

  const directors = (businessEntity.managersOfficers || [])
    .filter((person) => person.roleType === 'DIRECTOR')
    .map((director) => ({
      name: `${director.firstName} ${director.lastName}`,
      address: director.address,
    }));

  const correspondenceEmail = filing.filingData.correspondenceEmail as string;
  const corporationType = filing.filingData.corporationType as 'FOR_PROFIT' | 'NONPROFIT';

  return {
    businessName: businessEntity.legalName,
    corporationType,
    principalAddress: {
      street: principalAddr.street,
      street2: principalAddr.street2,
      city: principalAddr.city,
      state: principalAddr.state,
      zip: principalAddr.zipCode,
    },
    mailingAddress: {
      street: mailingAddr.street,
      street2: mailingAddr.street2,
      city: mailingAddr.city,
      state: mailingAddr.state,
      zip: mailingAddr.zipCode,
    },
    registeredAgent: {
      name: agentName,
      address: {
        street: agentAddr.street,
        street2: agentAddr.street2,
        city: agentAddr.city,
        state: agentAddr.state,
        zip: agentAddr.zipCode,
      },
    },
    officers,
    directors,
    authorizedShares: filing.filingData.authorizedShares as number | undefined,
    parValue: filing.filingData.parValue as number | undefined,
    correspondenceEmail,
    effectiveDate: filing.filingData.effectiveDate as string | undefined,
    purpose: filing.filingData.purpose as string | undefined,
  };
}

// ============================================================================
// SUNBIZ ANNUAL REPORT DATA
// ============================================================================

export interface SunbizAnnualReportData {
  // Document Number (from existing entity)
  documentNumber: string;
  
  // Current Information
  businessName: string;
  principalAddress: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
  };
  mailingAddress: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
  };
  registeredAgent: {
    name: string;
    address: {
      street: string;
      street2?: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  
  // Officers/Managers
  officersManagers: Array<{
    name: string;
    title: string;
    address: string;
  }>;
  
  // Confirmation
  confirmInformationCurrent: boolean;
  
  // Correspondence Email
  correspondenceEmail: string;
}

/**
 * Map our database records to Sunbiz Annual Report format
 */
export function mapDatabaseToSunbizAnnualReport(
  businessEntity: BusinessEntityWithRelations,
  filing: FilingWithRelations
): SunbizAnnualReportData {
  if (!businessEntity.documentNumber) {
    throw new Error('Document number is required for annual report filing');
  }

  const principalAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === 'PRINCIPAL'
  );

  if (!principalAddr) {
    throw new Error('Principal address is required');
  }

  const mailingAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === 'MAILING'
  ) || principalAddr;

  const agent = businessEntity.registeredAgent;
  if (!agent) {
    throw new Error('Registered agent is required');
  }

  const agentAddr = businessEntity.addresses?.find(
    (addr) => addr.addressType === 'REGISTERED_AGENT'
  );
  if (!agentAddr) {
    throw new Error('Registered agent address is required');
  }

  const agentName = agent.agentType === 'COMPANY'
    ? agent.companyName!
    : `${agent.firstName} ${agent.lastName}`;

  const officersManagers = (businessEntity.managersOfficers || []).map((person) => ({
    name: `${person.firstName} ${person.lastName}`,
    title: person.title || formatOfficerTitle(person.roleType),
    address: person.address,
  }));

  return {
    documentNumber: businessEntity.documentNumber,
    businessName: businessEntity.legalName,
    principalAddress: {
      street: principalAddr.street,
      street2: principalAddr.street2,
      city: principalAddr.city,
      state: principalAddr.state,
      zip: principalAddr.zipCode,
    },
    mailingAddress: {
      street: mailingAddr.street,
      street2: mailingAddr.street2,
      city: mailingAddr.city,
      state: mailingAddr.state,
      zip: mailingAddr.zipCode,
    },
    registeredAgent: {
      name: agentName,
      address: {
        street: agentAddr.street,
        street2: agentAddr.street2,
        city: agentAddr.city,
        state: agentAddr.state,
        zip: agentAddr.zipCode,
      },
    },
    officersManagers,
    confirmInformationCurrent: filing.filingData.confirmCurrentInformation as boolean,
    correspondenceEmail: filing.filingData.correspondenceEmail as string,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatOfficerTitle(roleType: string): string {
  const titleMap: Record<string, string> = {
    PRESIDENT: 'President',
    VICE_PRESIDENT: 'Vice President',
    SECRETARY: 'Secretary',
    TREASURER: 'Treasurer',
    DIRECTOR: 'Director',
    MANAGER: 'Manager',
    MEMBER: 'Member',
  };
  return titleMap[roleType] || roleType;
}

