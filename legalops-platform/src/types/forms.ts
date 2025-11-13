/**
 * LegalOps v1 - Form Data Types
 * 
 * These types define the structure of data collected from user forms.
 * They are designed to be flexible and support both new and returning clients.
 */

import {
  EntityType,
  AgentType,
  RoleType,
  AddressType,
} from './entities';

// ============================================================================
// COMMON FORM TYPES
// ============================================================================

export interface AddressFormData {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface PersonFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

// ============================================================================
// CLIENT REGISTRATION FORMS
// ============================================================================

export interface ClientRegistrationFormData extends PersonFormData {
  // Personal Information
  email: string; // Required for registration
  password: string;
  confirmPassword: string;
  
  // Personal Address
  personalAddress: AddressFormData;
  
  // Preferences
  agreeToTerms: boolean;
  subscribeToNewsletter?: boolean;
}

// ============================================================================
// LLC FORMATION FORM
// ============================================================================

export interface LLCFormationFormData {
  // ===== BUSINESS INFORMATION =====
  businessName: string;
  effectiveDate?: string; // Optional - defaults to filing date
  duration?: 'PERPETUAL' | 'SPECIFIC_DATE';
  dissolutionDate?: string; // If duration is SPECIFIC_DATE
  
  // Business Purpose
  purpose?: string;
  
  // ===== ADDRESSES =====
  principalAddress: AddressFormData;
  
  // Mailing Address Options
  mailingAddressOption: 'SAME_AS_PRINCIPAL' | 'SAME_AS_PERSONAL' | 'DIFFERENT';
  mailingAddress?: AddressFormData; // Only if DIFFERENT
  
  // ===== REGISTERED AGENT =====
  registeredAgentOption: 'SELF' | 'EXISTING' | 'NEW' | 'LEGALOPS';
  
  // If SELF - use client's personal info
  // If EXISTING - select from previous agents
  existingAgentId?: string;
  
  // If NEW - provide new agent info
  newRegisteredAgent?: {
    agentType: AgentType;
    firstName?: string; // For INDIVIDUAL
    lastName?: string;  // For INDIVIDUAL
    companyName?: string; // For COMPANY
    email?: string;
    phone?: string;
    address: AddressFormData;
  };
  
  // ===== MANAGEMENT STRUCTURE =====
  managementStructure: 'MEMBER_MANAGED' | 'MANAGER_MANAGED';
  
  // ===== MANAGERS/MEMBERS =====
  managersOption: 'SELF_ONLY' | 'MULTIPLE';
  
  managers: Array<{
    option: 'SELF' | 'NEW';
    // If NEW:
    firstName?: string;
    lastName?: string;
    title?: string;
    roleType: RoleType;
    email?: string;
    phone?: string;
    address: string; // Can be formatted string or structured
  }>;
  
  // ===== ADDITIONAL OPTIONS =====
  expeditedProcessing?: boolean;
  certifiedCopy?: boolean;
  
  // ===== CORRESPONDENCE =====
  correspondenceEmail: string;
}

// ============================================================================
// CORPORATION FORMATION FORM
// ============================================================================

export interface CorporationFormationFormData {
  // ===== BUSINESS INFORMATION =====
  businessName: string;
  corporationType: 'FOR_PROFIT' | 'NONPROFIT';
  effectiveDate?: string;
  
  // Business Purpose
  purpose?: string;
  
  // ===== STOCK INFORMATION (For-Profit only) =====
  authorizedShares?: number;
  parValue?: number;
  stockClasses?: Array<{
    className: string;
    shares: number;
    parValue: number;
    votingRights: boolean;
  }>;
  
  // ===== ADDRESSES =====
  principalAddress: AddressFormData;
  mailingAddressOption: 'SAME_AS_PRINCIPAL' | 'SAME_AS_PERSONAL' | 'DIFFERENT';
  mailingAddress?: AddressFormData;
  
  // ===== REGISTERED AGENT =====
  registeredAgentOption: 'SELF' | 'EXISTING' | 'NEW' | 'LEGALOPS';
  existingAgentId?: string;
  newRegisteredAgent?: {
    agentType: AgentType;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    address: AddressFormData;
  };
  
  // ===== OFFICERS & DIRECTORS =====
  officers: Array<{
    option: 'SELF' | 'NEW';
    firstName?: string;
    lastName?: string;
    roleType: RoleType; // PRESIDENT, SECRETARY, TREASURER, etc.
    email?: string;
    phone?: string;
    address: string;
  }>;
  
  directors: Array<{
    option: 'SELF' | 'NEW';
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address: string;
  }>;
  
  // ===== INCORPORATOR =====
  incorporatorOption: 'SELF' | 'ATTORNEY' | 'OTHER';
  incorporator?: PersonFormData & { address: string };
  
  // ===== ADDITIONAL OPTIONS =====
  expeditedProcessing?: boolean;
  certifiedCopy?: boolean;
  
  // ===== CORRESPONDENCE =====
  correspondenceEmail: string;
}

// ============================================================================
// ANNUAL REPORT FORM
// ============================================================================

export interface AnnualReportFormData {
  // ===== ENTITY SELECTION =====
  businessEntityId: string; // Select from user's existing entities
  
  // ===== CONFIRMATION =====
  confirmCurrentInformation: boolean;
  
  // ===== UPDATES (if any) =====
  hasChanges: boolean;
  
  changes?: {
    principalAddress?: AddressFormData;
    mailingAddress?: AddressFormData;
    registeredAgent?: {
      firstName?: string;
      lastName?: string;
      companyName?: string;
      address?: AddressFormData;
    };
    officers?: Array<{
      action: 'ADD' | 'REMOVE' | 'UPDATE';
      id?: string; // For UPDATE/REMOVE
      firstName?: string;
      lastName?: string;
      roleType?: RoleType;
      address?: string;
    }>;
  };
  
  // ===== CORRESPONDENCE =====
  correspondenceEmail: string;
}

// ============================================================================
// EIN APPLICATION FORM (IRS SS-4)
// ============================================================================

export interface EINApplicationFormData {
  // ===== ENTITY SELECTION =====
  businessEntityId: string; // Select from user's existing entities
  
  // ===== ENTITY INFORMATION =====
  // Most info pulled from BusinessEntity, but some additional fields needed:
  
  // Tax Classification
  taxClassification: 
    | 'SOLE_PROPRIETOR'
    | 'PARTNERSHIP'
    | 'LLC_SINGLE_MEMBER'
    | 'LLC_PARTNERSHIP'
    | 'LLC_C_CORP'
    | 'LLC_S_CORP'
    | 'CORPORATION'
    | 'S_CORPORATION'
    | 'NONPROFIT';
  
  // Reason for applying
  reasonForApplying:
    | 'STARTED_NEW_BUSINESS'
    | 'HIRED_EMPLOYEES'
    | 'BANKING_PURPOSE'
    | 'CHANGED_TYPE_OF_ORGANIZATION'
    | 'PURCHASED_GOING_BUSINESS'
    | 'CREATED_TRUST'
    | 'CREATED_PENSION_PLAN'
    | 'OTHER';
  
  otherReason?: string;
  
  // Business start date
  businessStartDate: string;
  
  // Accounting year end
  accountingYearEnd: string; // MM/DD format
  
  // Number of employees expected
  employeesExpected: {
    agricultural: number;
    household: number;
    other: number;
  };
  
  // Principal activity
  principalActivity: string;
  principalProduct: string;
  
  // Responsible party (usually the owner)
  responsibleParty: PersonFormData & {
    ssn: string; // Encrypted
    title: string;
  };
  
  // ===== CORRESPONDENCE =====
  correspondenceEmail: string;
}

// ============================================================================
// AMENDMENT FORM
// ============================================================================

export interface AmendmentFormData {
  // ===== ENTITY SELECTION =====
  businessEntityId: string;
  
  // ===== WHAT'S CHANGING =====
  amendmentType: 
    | 'NAME_CHANGE'
    | 'ADDRESS_CHANGE'
    | 'REGISTERED_AGENT_CHANGE'
    | 'PURPOSE_CHANGE'
    | 'MANAGEMENT_CHANGE'
    | 'STOCK_CHANGE'
    | 'OTHER';
  
  // ===== CHANGES =====
  changes: {
    newBusinessName?: string;
    newPrincipalAddress?: AddressFormData;
    newMailingAddress?: AddressFormData;
    newRegisteredAgent?: {
      firstName?: string;
      lastName?: string;
      companyName?: string;
      address?: AddressFormData;
    };
    newPurpose?: string;
    otherChanges?: string;
  };
  
  // ===== EFFECTIVE DATE =====
  effectiveDate?: string;
  
  // ===== CORRESPONDENCE =====
  correspondenceEmail: string;
}

// ============================================================================
// DISSOLUTION FORM
// ============================================================================

export interface DissolutionFormData {
  // ===== ENTITY SELECTION =====
  businessEntityId: string;

  // ===== DISSOLUTION DETAILS =====
  dissolutionReason: string;
  effectiveDate?: string;

  // ===== AUTHORIZATION =====
  authorizedBy: {
    name: string;
    title: string;
    date: string;
  };

  // ===== FINAL DETAILS =====
  allDebtsSettled: boolean;
  allAssetsDistributed: boolean;

  // ===== CORRESPONDENCE =====
  correspondenceEmail: string;
}

// ============================================================================
// FICTITIOUS NAME (DBA) REGISTRATION FORM
// ============================================================================

export interface FictitiousNameFormData {
  // ===== FICTITIOUS NAME =====
  fictitiousName: string; // The DBA name to register

  // ===== MAILING ADDRESS =====
  mailingAddress: AddressFormData;

  // ===== PRINCIPAL PLACE OF BUSINESS =====
  principalCounty: string; // Florida county where business operates

  // ===== FEDERAL EMPLOYER ID =====
  hasFEIN: boolean;
  fein?: string; // Optional - Federal Employer Identification Number

  // ===== OWNER INFORMATION =====
  ownerType: 'INDIVIDUAL' | 'BUSINESS_ENTITY';

  // For Individual Owners
  individualOwners?: Array<{
    firstName: string;
    lastName: string;
    middleName?: string;
    address: AddressFormData;
  }>;

  // For Business Entity Owners
  businessEntityOwners?: Array<{
    entityName: string;
    entityAddress: AddressFormData;
    floridaDocumentNumber?: string; // If registered with FL Division of Corporations
    fein?: string; // Federal Employer ID
    feinStatus?: 'HAS_FEIN' | 'APPLIED_FOR' | 'NOT_APPLICABLE';
  }>;

  // ===== NEWSPAPER ADVERTISEMENT =====
  newspaperAdvertised: boolean; // Certification that name was advertised
  newspaperName?: string; // Name of newspaper (optional)
  advertisementDate?: string; // Date of advertisement (optional)

  // ===== PAYMENT TIMING =====
  paymentTiming?: 'PAY_NOW' | 'PAY_AFTER_PUBLICATION'; // When customer wants to pay

  // ===== ADDITIONAL OPTIONS =====
  certificateOfStatus: boolean; // $10 additional fee
  certifiedCopy: boolean; // $30 additional fee

  // ===== CORRESPONDENCE =====
  correspondenceEmail: string;
}

// ============================================================================
// FORM VALIDATION HELPERS
// ============================================================================

export interface FormValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
}

