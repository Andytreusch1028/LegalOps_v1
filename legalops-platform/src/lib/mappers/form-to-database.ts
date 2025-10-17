/**
 * LegalOps v1 - Form to Database Mapper
 * 
 * Transforms user form data into database records.
 * Handles data normalization and relationship creation.
 */

import {
  Client,
  BusinessEntity,
  Address,
  RegisteredAgent,
  ManagerOfficer,
  Filing,
} from '@/types/entities';

import {
  LLCFormationFormData,
  CorporationFormationFormData,
  AnnualReportFormData,
  AddressFormData,
} from '@/types/forms';

import {
  EntityType,
  EntityStatus,
  FilingType,
  FilingStatus,
  AddressType,
  AgentType,
  RoleType,
} from '@/types/entities';

// ============================================================================
// ADDRESS MAPPING
// ============================================================================

export function mapAddressFormToDatabase(
  addressData: AddressFormData,
  addressType: AddressType,
  ownerId: string,
  ownerType: 'client' | 'businessEntity' | 'registeredAgent'
): Omit<Address, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    street: addressData.street,
    street2: addressData.street2,
    city: addressData.city,
    state: addressData.state,
    zipCode: addressData.zipCode,
    country: addressData.country || 'USA',
    addressType,
    clientId: ownerType === 'client' ? ownerId : undefined,
    businessEntityId: ownerType === 'businessEntity' ? ownerId : undefined,
    registeredAgentId: ownerType === 'registeredAgent' ? ownerId : undefined,
  };
}

// ============================================================================
// LLC FORMATION MAPPING
// ============================================================================

export interface LLCFormationDatabaseRecords {
  businessEntity: Omit<BusinessEntity, 'id' | 'createdAt' | 'updatedAt'>;
  addresses: Array<Omit<Address, 'id' | 'createdAt' | 'updatedAt'>>;
  registeredAgent: Omit<RegisteredAgent, 'id' | 'createdAt' | 'updatedAt'>;
  managers: Array<Omit<ManagerOfficer, 'id' | 'createdAt' | 'updatedAt'>>;
  filing: Omit<Filing, 'id' | 'createdAt' | 'updatedAt'>;
}

export function mapLLCFormationToDatabase(
  formData: LLCFormationFormData,
  clientId: string,
  businessEntityId: string, // Pre-generated ID
  registeredAgentId: string  // Pre-generated ID
): LLCFormationDatabaseRecords {
  // 1. Business Entity
  const businessEntity: Omit<BusinessEntity, 'id' | 'createdAt' | 'updatedAt'> = {
    clientId,
    legalName: formData.businessName,
    dbaName: undefined,
    entityType: EntityType.LLC,
    stateOfFormation: 'FL',
    documentNumber: undefined, // Will be filled after state approval
    filingDate: undefined,
    status: EntityStatus.PENDING,
    purpose: formData.purpose,
  };

  // 2. Addresses
  const addresses: Array<Omit<Address, 'id' | 'createdAt' | 'updatedAt'>> = [];

  // Principal Address
  addresses.push(
    mapAddressFormToDatabase(
      formData.principalAddress,
      AddressType.PRINCIPAL,
      businessEntityId,
      'businessEntity'
    )
  );

  // Mailing Address
  if (formData.mailingAddressOption === 'DIFFERENT' && formData.mailingAddress) {
    addresses.push(
      mapAddressFormToDatabase(
        formData.mailingAddress,
        AddressType.MAILING,
        businessEntityId,
        'businessEntity'
      )
    );
  }
  // Note: If SAME_AS_PRINCIPAL or SAME_AS_PERSONAL, we'll handle that in the service layer

  // 3. Registered Agent
  let registeredAgent: Omit<RegisteredAgent, 'id' | 'createdAt' | 'updatedAt'>;

  if (formData.registeredAgentOption === 'LEGALOPS') {
    registeredAgent = {
      businessEntityId,
      agentType: AgentType.LEGALOPS,
      firstName: undefined,
      lastName: undefined,
      companyName: 'LegalOps Registered Agent Services',
      email: '[email protected]',
      phone: '(800) 555-LEGAL',
      serviceStartDate: new Date(),
      serviceEndDate: undefined,
      isActive: true,
    };
  } else if (formData.registeredAgentOption === 'NEW' && formData.newRegisteredAgent) {
    const agent = formData.newRegisteredAgent;
    registeredAgent = {
      businessEntityId,
      agentType: agent.agentType,
      firstName: agent.firstName,
      lastName: agent.lastName,
      companyName: agent.companyName,
      email: agent.email,
      phone: agent.phone,
      serviceStartDate: new Date(),
      serviceEndDate: undefined,
      isActive: true,
    };

    // Add agent address
    addresses.push(
      mapAddressFormToDatabase(
        agent.address,
        AddressType.REGISTERED_AGENT,
        registeredAgentId,
        'registeredAgent'
      )
    );
  } else {
    // SELF or EXISTING - will be handled in service layer
    throw new Error('SELF and EXISTING agent options must be handled in service layer');
  }

  // 4. Managers
  const managers: Array<Omit<ManagerOfficer, 'id' | 'createdAt' | 'updatedAt'>> = [];

  for (const manager of formData.managers) {
    if (manager.option === 'NEW') {
      managers.push({
        businessEntityId,
        firstName: manager.firstName!,
        lastName: manager.lastName!,
        title: manager.title,
        roleType: manager.roleType,
        email: manager.email,
        phone: manager.phone,
        address: manager.address,
      });
    }
    // SELF option will be handled in service layer
  }

  // 5. Filing Record
  const filing: Omit<Filing, 'id' | 'createdAt' | 'updatedAt'> = {
    businessEntityId,
    filingType: FilingType.LLC_FORMATION,
    filingStatus: FilingStatus.DRAFT,
    filingData: {
      // Store all form data as JSON for reference
      businessName: formData.businessName,
      effectiveDate: formData.effectiveDate,
      duration: formData.duration,
      dissolutionDate: formData.dissolutionDate,
      purpose: formData.purpose,
      managementStructure: formData.managementStructure,
      expeditedProcessing: formData.expeditedProcessing,
      certifiedCopy: formData.certifiedCopy,
      correspondenceEmail: formData.correspondenceEmail,
    },
    confirmationNumber: undefined,
    trackingNumber: undefined,
    filedDate: undefined,
    approvedDate: undefined,
    submittedAt: undefined,
  };

  return {
    businessEntity,
    addresses,
    registeredAgent,
    managers,
    filing,
  };
}

// ============================================================================
// CORPORATION FORMATION MAPPING
// ============================================================================

export interface CorporationFormationDatabaseRecords {
  businessEntity: Omit<BusinessEntity, 'id' | 'createdAt' | 'updatedAt'>;
  addresses: Array<Omit<Address, 'id' | 'createdAt' | 'updatedAt'>>;
  registeredAgent: Omit<RegisteredAgent, 'id' | 'createdAt' | 'updatedAt'>;
  officers: Array<Omit<ManagerOfficer, 'id' | 'createdAt' | 'updatedAt'>>;
  directors: Array<Omit<ManagerOfficer, 'id' | 'createdAt' | 'updatedAt'>>;
  filing: Omit<Filing, 'id' | 'createdAt' | 'updatedAt'>;
}

export function mapCorporationFormationToDatabase(
  formData: CorporationFormationFormData,
  clientId: string,
  businessEntityId: string,
  registeredAgentId: string
): CorporationFormationDatabaseRecords {
  // Similar structure to LLC mapping
  const businessEntity: Omit<BusinessEntity, 'id' | 'createdAt' | 'updatedAt'> = {
    clientId,
    legalName: formData.businessName,
    dbaName: undefined,
    entityType: formData.corporationType === 'NONPROFIT' 
      ? EntityType.NONPROFIT_CORPORATION 
      : EntityType.CORPORATION,
    stateOfFormation: 'FL',
    documentNumber: undefined,
    filingDate: undefined,
    status: EntityStatus.PENDING,
    purpose: formData.purpose,
  };

  const addresses: Array<Omit<Address, 'id' | 'createdAt' | 'updatedAt'>> = [];
  
  addresses.push(
    mapAddressFormToDatabase(
      formData.principalAddress,
      AddressType.PRINCIPAL,
      businessEntityId,
      'businessEntity'
    )
  );

  if (formData.mailingAddressOption === 'DIFFERENT' && formData.mailingAddress) {
    addresses.push(
      mapAddressFormToDatabase(
        formData.mailingAddress,
        AddressType.MAILING,
        businessEntityId,
        'businessEntity'
      )
    );
  }

  // Registered Agent (similar to LLC)
  let registeredAgent: Omit<RegisteredAgent, 'id' | 'createdAt' | 'updatedAt'>;
  
  if (formData.registeredAgentOption === 'LEGALOPS') {
    registeredAgent = {
      businessEntityId,
      agentType: AgentType.LEGALOPS,
      firstName: undefined,
      lastName: undefined,
      companyName: 'LegalOps Registered Agent Services',
      email: '[email protected]',
      phone: '(800) 555-LEGAL',
      serviceStartDate: new Date(),
      serviceEndDate: undefined,
      isActive: true,
    };
  } else if (formData.registeredAgentOption === 'NEW' && formData.newRegisteredAgent) {
    const agent = formData.newRegisteredAgent;
    registeredAgent = {
      businessEntityId,
      agentType: agent.agentType,
      firstName: agent.firstName,
      lastName: agent.lastName,
      companyName: agent.companyName,
      email: agent.email,
      phone: agent.phone,
      serviceStartDate: new Date(),
      serviceEndDate: undefined,
      isActive: true,
    };

    addresses.push(
      mapAddressFormToDatabase(
        agent.address,
        AddressType.REGISTERED_AGENT,
        registeredAgentId,
        'registeredAgent'
      )
    );
  } else {
    throw new Error('SELF and EXISTING agent options must be handled in service layer');
  }

  // Officers
  const officers: Array<Omit<ManagerOfficer, 'id' | 'createdAt' | 'updatedAt'>> = [];
  for (const officer of formData.officers) {
    if (officer.option === 'NEW') {
      officers.push({
        businessEntityId,
        firstName: officer.firstName!,
        lastName: officer.lastName!,
        title: undefined,
        roleType: officer.roleType,
        email: officer.email,
        phone: officer.phone,
        address: officer.address,
      });
    }
  }

  // Directors
  const directors: Array<Omit<ManagerOfficer, 'id' | 'createdAt' | 'updatedAt'>> = [];
  for (const director of formData.directors) {
    if (director.option === 'NEW') {
      directors.push({
        businessEntityId,
        firstName: director.firstName!,
        lastName: director.lastName!,
        title: 'Director',
        roleType: RoleType.DIRECTOR,
        email: director.email,
        phone: director.phone,
        address: director.address,
      });
    }
  }

  const filing: Omit<Filing, 'id' | 'createdAt' | 'updatedAt'> = {
    businessEntityId,
    filingType: FilingType.CORP_FORMATION,
    filingStatus: FilingStatus.DRAFT,
    filingData: {
      businessName: formData.businessName,
      corporationType: formData.corporationType,
      effectiveDate: formData.effectiveDate,
      purpose: formData.purpose,
      authorizedShares: formData.authorizedShares,
      parValue: formData.parValue,
      stockClasses: formData.stockClasses,
      expeditedProcessing: formData.expeditedProcessing,
      certifiedCopy: formData.certifiedCopy,
      correspondenceEmail: formData.correspondenceEmail,
    },
    confirmationNumber: undefined,
    trackingNumber: undefined,
    filedDate: undefined,
    approvedDate: undefined,
    submittedAt: undefined,
  };

  return {
    businessEntity,
    addresses,
    registeredAgent,
    officers,
    directors,
    filing,
  };
}

// ============================================================================
// ANNUAL REPORT MAPPING
// ============================================================================

export function mapAnnualReportToDatabase(
  formData: AnnualReportFormData,
  businessEntityId: string
): Omit<Filing, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    businessEntityId,
    filingType: FilingType.ANNUAL_REPORT,
    filingStatus: FilingStatus.DRAFT,
    filingData: {
      confirmCurrentInformation: formData.confirmCurrentInformation,
      hasChanges: formData.hasChanges,
      changes: formData.changes,
      correspondenceEmail: formData.correspondenceEmail,
    },
    confirmationNumber: undefined,
    trackingNumber: undefined,
    filedDate: undefined,
    approvedDate: undefined,
    submittedAt: undefined,
  };
}

