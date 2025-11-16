/**
 * DBA (Fictitious Name) Validation Utilities
 * 
 * Implements Florida Sunbiz rules for DBA name registration:
 * - Individual owners CANNOT use entity suffixes (LLC, Inc., Corp., etc.)
 * - Business entity owners CAN use suffixes ONLY if they match the entity type
 * 
 * @module dba-name-validator
 */

/**
 * Entity suffixes that are prohibited for individual DBA owners
 * and restricted for business entity owners
 */
const ENTITY_SUFFIXES = [
  // LLC variations
  { suffix: 'llc', fullName: 'Limited Liability Company', entityType: 'LLC' },
  { suffix: 'l.l.c.', fullName: 'Limited Liability Company', entityType: 'LLC' },
  { suffix: 'l.l.c', fullName: 'Limited Liability Company', entityType: 'LLC' },
  { suffix: 'limited liability company', fullName: 'Limited Liability Company', entityType: 'LLC' },
  { suffix: 'limited liability co', fullName: 'Limited Liability Company', entityType: 'LLC' },
  
  // Corporation variations
  { suffix: 'inc', fullName: 'Incorporated', entityType: 'CORPORATION' },
  { suffix: 'inc.', fullName: 'Incorporated', entityType: 'CORPORATION' },
  { suffix: 'incorporated', fullName: 'Incorporated', entityType: 'CORPORATION' },
  { suffix: 'corp', fullName: 'Corporation', entityType: 'CORPORATION' },
  { suffix: 'corp.', fullName: 'Corporation', entityType: 'CORPORATION' },
  { suffix: 'corporation', fullName: 'Corporation', entityType: 'CORPORATION' },
  
  // Company variations
  { suffix: 'co', fullName: 'Company', entityType: 'COMPANY' },
  { suffix: 'co.', fullName: 'Company', entityType: 'COMPANY' },
  { suffix: 'company', fullName: 'Company', entityType: 'COMPANY' },
  
  // Limited variations
  { suffix: 'ltd', fullName: 'Limited', entityType: 'LIMITED' },
  { suffix: 'ltd.', fullName: 'Limited', entityType: 'LIMITED' },
  { suffix: 'limited', fullName: 'Limited', entityType: 'LIMITED' },
  
  // Partnership variations
  { suffix: 'lp', fullName: 'Limited Partnership', entityType: 'LIMITED_PARTNERSHIP' },
  { suffix: 'limited partnership', fullName: 'Limited Partnership', entityType: 'LIMITED_PARTNERSHIP' },
  { suffix: 'llp', fullName: 'Limited Liability Partnership', entityType: 'LIMITED_LIABILITY_PARTNERSHIP' },
  { suffix: 'limited liability partnership', fullName: 'Limited Liability Partnership', entityType: 'LIMITED_LIABILITY_PARTNERSHIP' },
  { suffix: 'lllp', fullName: 'Limited Liability Limited Partnership', entityType: 'LIMITED_LIABILITY_LIMITED_PARTNERSHIP' },
  { suffix: 'gp', fullName: 'General Partnership', entityType: 'GENERAL_PARTNERSHIP' },
  { suffix: 'general partnership', fullName: 'General Partnership', entityType: 'GENERAL_PARTNERSHIP' },
  
  // Professional variations
  { suffix: 'pa', fullName: 'Professional Association', entityType: 'PROFESSIONAL_ASSOCIATION' },
  { suffix: 'p.a.', fullName: 'Professional Association', entityType: 'PROFESSIONAL_ASSOCIATION' },
  { suffix: 'professional association', fullName: 'Professional Association', entityType: 'PROFESSIONAL_ASSOCIATION' },
  { suffix: 'pllc', fullName: 'Professional Limited Liability Company', entityType: 'PROFESSIONAL_LLC' },
  { suffix: 'p.l.l.c.', fullName: 'Professional Limited Liability Company', entityType: 'PROFESSIONAL_LLC' },
  { suffix: 'professional limited liability company', fullName: 'Professional Limited Liability Company', entityType: 'PROFESSIONAL_LLC' },
  { suffix: 'pl', fullName: 'Professional Limited', entityType: 'PROFESSIONAL_LIMITED' },
  { suffix: 'p.l.', fullName: 'Professional Limited', entityType: 'PROFESSIONAL_LIMITED' },
  { suffix: 'professional limited', fullName: 'Professional Limited', entityType: 'PROFESSIONAL_LIMITED' },
];

/**
 * Extract entity suffix from a business name
 * Returns the suffix if found, null otherwise
 */
export function extractSuffix(name: string): { suffix: string; entityType: string } | null {
  const normalized = name.toLowerCase().trim();
  
  for (const { suffix, entityType } of ENTITY_SUFFIXES) {
    // Check if name ends with this suffix (word boundary)
    const regex = new RegExp(`\\b${suffix.replace(/\./g, '\\.')}\\s*$`, 'i');
    if (regex.test(normalized)) {
      return { suffix, entityType };
    }
  }
  
  return null;
}

/**
 * Check if a DBA name has a forbidden entity suffix
 * 
 * Rules:
 * - Individual owners: ALL entity suffixes are forbidden
 * - Business entity owners: Suffix must match the entity type
 */
export function hasForbiddenSuffix(
  dbaName: string,
  ownerType: 'INDIVIDUAL' | 'BUSINESS_ENTITY',
  businessEntityName?: string
): boolean {
  const extractedSuffix = extractSuffix(dbaName);
  
  // No suffix found - always valid
  if (!extractedSuffix) {
    return false;
  }
  
  // Individual owners cannot use ANY entity suffix
  if (ownerType === 'INDIVIDUAL') {
    return true;
  }
  
  // Business entity owners: check if suffix matches their entity type
  if (ownerType === 'BUSINESS_ENTITY' && businessEntityName) {
    const ownerSuffix = extractSuffix(businessEntityName);
    
    // If owner has no suffix, DBA cannot have suffix
    if (!ownerSuffix) {
      return true;
    }
    
    // Suffix must match owner's entity type
    return extractedSuffix.entityType !== ownerSuffix.entityType;
  }
  
  // Default: forbid suffix if we can't verify
  return true;
}

/**
 * Validate DBA name against Florida Sunbiz rules
 * 
 * @param dbaName - The fictitious name to validate
 * @param ownerType - Type of owner (INDIVIDUAL or BUSINESS_ENTITY)
 * @param businessEntityName - If business entity owner, their legal entity name
 * @returns Validation result with error message if invalid
 */
export function validateDBANameSuffixes(
  dbaName: string,
  ownerType: 'INDIVIDUAL' | 'BUSINESS_ENTITY',
  businessEntityName?: string
): { valid: boolean; error?: string } {
  const extractedSuffix = extractSuffix(dbaName);
  
  // No suffix - always valid
  if (!extractedSuffix) {
    return { valid: true };
  }
  
  // Individual owners cannot use entity suffixes
  if (ownerType === 'INDIVIDUAL') {
    return {
      valid: false,
      error: `Individual owners cannot use entity suffixes like "${extractedSuffix.suffix.toUpperCase()}". Remove the suffix or register as a business entity.`,
    };
  }
  
  // Business entity owners: suffix must match their entity type
  if (ownerType === 'BUSINESS_ENTITY') {
    if (!businessEntityName) {
      return {
        valid: false,
        error: 'Business entity name is required to validate DBA name suffix.',
      };
    }
    
    const ownerSuffix = extractSuffix(businessEntityName);
    
    if (!ownerSuffix) {
      return {
        valid: false,
        error: `Your business entity name "${businessEntityName}" does not have an entity suffix, so your DBA name cannot include "${extractedSuffix.suffix.toUpperCase()}".`,
      };
    }
    
    if (extractedSuffix.entityType !== ownerSuffix.entityType) {
      return {
        valid: false,
        error: `DBA name suffix "${extractedSuffix.suffix.toUpperCase()}" does not match your business entity type. Your entity is a ${ownerSuffix.entityType}, so you can only use ${ownerSuffix.suffix.toUpperCase()} suffix.`,
      };
    }
  }
  
  return { valid: true };
}

