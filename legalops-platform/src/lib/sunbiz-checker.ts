/**
 * Florida Sunbiz Business Name Availability Checker
 * 
 * Implements Florida's official name distinguishability rules from:
 * https://dos.fl.gov/sunbiz/about-us/faqs/
 * 
 * Names are NOT distinguishable (considered the same) if they only differ by:
 * 1. Suffixes (LLC, Inc., Corp., Co., Ltd., etc.)
 * 2. Articles (the, a, an)
 * 3. "and" vs "&"
 * 4. Singular vs plural vs possessive
 * 5. Punctuation and symbols
 */

/**
 * Normalize a business name according to Florida's distinguishability rules
 */
export function normalizeBusinessName(name: string): string {
  let normalized = name.toLowerCase().trim();

  // Remove all punctuation and symbols (rule 5)
  normalized = normalized.replace(/[^\w\s]/g, ' ');

  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, ' ');

  // Remove articles (rule 2): the, a, an
  normalized = normalized.replace(/\b(the|a|an)\b/g, '');

  // Replace "and" with "&" for consistency (rule 3)
  normalized = normalized.replace(/\band\b/g, '&');

  // Remove common business suffixes (rule 1)
  const suffixes = [
    'llc',
    'l l c',
    'limited liability company',
    'limited liability co',
    'inc',
    'incorporated',
    'corp',
    'corporation',
    'co',
    'company',
    'ltd',
    'limited',
    'lp',
    'limited partnership',
    'llp',
    'limited liability partnership',
    'lllp',
    'limited liability limited partnership',
    'gp',
    'general partnership',
    'pa',
    'professional association',
    'pllc',
    'professional limited liability company',
    'pl',
    'professional limited',
  ];

  // Remove suffixes from the end
  for (const suffix of suffixes) {
    const regex = new RegExp(`\\b${suffix}\\b\\s*$`, 'gi');
    normalized = normalized.replace(regex, '');
  }

  // Handle singular/plural/possessive (rule 4)
  // This is complex, so we'll do basic normalization
  // Remove trailing 's or s'
  normalized = normalized.replace(/('s|s')$/g, '');
  
  // Clean up extra spaces again
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Check if two business names are distinguishable according to Florida law
 */
export function areNamesDistinguishable(name1: string, name2: string): boolean {
  const normalized1 = normalizeBusinessName(name1);
  const normalized2 = normalizeBusinessName(name2);
  
  return normalized1 !== normalized2;
}

/**
 * Entity status from Sunbiz
 */
export type EntityStatus = 'ACTIVE' | 'ACT' | 'INACTIVE/UA' | 'INACT/UA' | 'INACTIVE' | 'INACT';

/**
 * Sunbiz search result
 */
export interface SunbizEntity {
  name: string;
  documentNumber: string;
  status: EntityStatus;
  filingDate?: string;
  entityType?: string;
}

/**
 * Name availability result
 */
export interface NameAvailabilityResult {
  available: boolean;
  searchedName: string;
  normalizedName: string;
  conflicts: SunbizEntity[];
  message: string;
  suggestions?: string[];
}

/**
 * Check if an entity status makes the name unavailable
 * 
 * According to Florida law:
 * - ACTIVE or ACT: Name is NOT available
 * - INACTIVE/UA or INACT/UA: Name is NOT available (held for 1 year or 120 days)
 * - INACTIVE or INACT: Name IS available
 */
export function isNameAvailableByStatus(status: EntityStatus): boolean {
  const unavailableStatuses: EntityStatus[] = ['ACTIVE', 'ACT', 'INACTIVE/UA', 'INACT/UA'];
  return !unavailableStatuses.includes(status);
}

/**
 * Search local Florida entity database for existing entities with similar names
 *
 * This searches our local database of Florida entities downloaded from Sunbiz.org
 * Searches across: Corporations, LLCs, LPs, DBAs, and General Partnerships
 */
export async function searchSunbiz(businessName: string): Promise<SunbizEntity[]> {
  // Import prisma dynamically to avoid issues in client-side code
  const { PrismaClient } = await import('../generated/prisma');
  const prisma = new PrismaClient();

  try {
    // Normalize the search name
    const normalizedSearch = normalizeBusinessName(businessName);

    const results: SunbizEntity[] = [];

    // Search 1: Corporate entities (Corporations, LLCs, LPs, PLLCs, PAs, etc.)
    try {
      const corporateEntities = await prisma.floridaEntity.findMany({
        where: {
          normalizedName: {
            contains: normalizedSearch,
          },
        },
        take: 30, // Limit to 30 results
        orderBy: {
          lastUpdated: 'desc',
        },
      });

      results.push(...corporateEntities.map(entity => ({
        name: entity.name,
        documentNumber: entity.documentNumber,
        status: entity.status as EntityStatus,
        filingDate: entity.filingDate?.toISOString(),
        entityType: entity.entityType || undefined,
      })));
    } catch (error) {
      console.error('Error searching corporate entities:', error);
    }

    // Search 2: Fictitious Names (DBAs)
    try {
      const fictitiousNames = await prisma.fictitiousName.findMany({
        where: {
          normalizedName: {
            contains: normalizedSearch,
          },
        },
        take: 10, // Limit to 10 results
        orderBy: {
          lastUpdated: 'desc',
        },
      });

      results.push(...fictitiousNames.map(entity => ({
        name: entity.fictitiousName,
        documentNumber: entity.documentNumber,
        status: entity.status as EntityStatus,
        filingDate: entity.filingDate?.toISOString(),
        entityType: 'DBA',
      })));
    } catch (error) {
      // Table might not exist yet if DBAs haven't been imported
      console.log('Fictitious names table not available (not imported yet)');
    }

    // Search 3: General Partnerships
    try {
      const partnerships = await prisma.generalPartnership.findMany({
        where: {
          normalizedName: {
            contains: normalizedSearch,
          },
        },
        take: 10, // Limit to 10 results
        orderBy: {
          lastUpdated: 'desc',
        },
      });

      results.push(...partnerships.map(entity => ({
        name: entity.name,
        documentNumber: entity.documentNumber,
        status: entity.status as EntityStatus,
        filingDate: entity.filingDate?.toISOString(),
        entityType: 'General Partnership',
      })));
    } catch (error) {
      // Table might not exist yet if GPs haven't been imported
      console.log('General partnerships table not available (not imported yet)');
    }

    // Sort all results by filing date (most recent first)
    results.sort((a, b) => {
      if (!a.filingDate) return 1;
      if (!b.filingDate) return -1;
      return new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime();
    });

    // Return top 50 results
    return results.slice(0, 50);

  } catch (error) {
    console.error('Error searching Florida entities:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Check business name availability
 */
export async function checkNameAvailability(
  businessName: string,
  entityType: string
): Promise<NameAvailabilityResult> {
  const normalizedName = normalizeBusinessName(businessName);
  
  // Search Sunbiz for existing entities
  const sunbizResults = await searchSunbiz(businessName);
  
  // Filter for conflicts (names that are not distinguishable)
  const conflicts = sunbizResults.filter(entity => {
    // Check if names are distinguishable
    if (areNamesDistinguishable(businessName, entity.name)) {
      return false;
    }
    
    // Check if the status makes it unavailable
    return !isNameAvailableByStatus(entity.status);
  });
  
  const available = conflicts.length === 0;
  
  // Generate suggestions if name is not available
  const suggestions = available ? undefined : generateNameSuggestions(businessName, entityType);
  
  return {
    available,
    searchedName: businessName,
    normalizedName,
    conflicts,
    message: available
      ? `"${businessName}" appears to be available!`
      : `"${businessName}" is not available. ${conflicts.length} similar ${conflicts.length === 1 ? 'entity' : 'entities'} found.`,
    suggestions,
  };
}

/**
 * Generate alternative name suggestions
 */
export function generateNameSuggestions(businessName: string, entityType: string): string[] {
  const suggestions: string[] = [];
  const baseName = normalizeBusinessName(businessName);
  
  // Add location-based suggestions
  suggestions.push(`${baseName} Florida`);
  suggestions.push(`${baseName} FL`);
  suggestions.push(`${baseName} Group`);
  suggestions.push(`${baseName} Solutions`);
  suggestions.push(`${baseName} Services`);
  suggestions.push(`${baseName} Enterprises`);
  
  // Add year
  const currentYear = new Date().getFullYear();
  suggestions.push(`${baseName} ${currentYear}`);
  
  // Add entity-specific suggestions
  if (entityType === 'LLC') {
    suggestions.push(`${baseName} Ventures`);
    suggestions.push(`${baseName} Holdings`);
  } else if (entityType === 'CORPORATION') {
    suggestions.push(`${baseName} Corporation`);
    suggestions.push(`${baseName} International`);
  }
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
}

/**
 * Validate business name format
 */
export function validateBusinessNameFormat(name: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check minimum length
  if (name.trim().length < 3) {
    errors.push('Business name must be at least 3 characters long');
  }
  
  // Check maximum length
  if (name.length > 100) {
    errors.push('Business name must be less than 100 characters');
  }
  
  // Check for prohibited characters
  const prohibitedChars = /[<>{}[\]\\\/]/;
  if (prohibitedChars.test(name)) {
    errors.push('Business name contains prohibited characters');
  }
  
  // Check if name is only numbers
  if (/^\d+$/.test(name.trim())) {
    errors.push('Business name cannot consist only of numbers');
  }
  
  // Check for profanity or prohibited words (basic check)
  const prohibitedWords = ['fbi', 'cia', 'treasury', 'federal reserve', 'united states'];
  const lowerName = name.toLowerCase();
  for (const word of prohibitedWords) {
    if (lowerName.includes(word)) {
      errors.push(`Business name cannot contain "${word}"`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

