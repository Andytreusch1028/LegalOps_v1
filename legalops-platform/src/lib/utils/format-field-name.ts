/**
 * LegalOps v1 - Field Name Formatting Utility
 * 
 * Converts coding-style field names to human-readable format for user-facing pages.
 * 
 * IMPORTANT: Never use coding formatting (camelCase, snake_case, etc.) on user-facing pages.
 * Always convert to human-readable text with proper spacing and capitalization.
 * 
 * Examples:
 * - "registeredAgent.firstName" → "Registered Agent First Name"
 * - "principalAddress.street" → "Principal Address Street"
 * - "ANNUAL_REPORT" → "Annual Report"
 * - "businessName" → "Business Name"
 * - "fein" → "FEIN"
 */

/**
 * Convert coding-style field names to human-readable format
 */
export function formatFieldName(field: string): string {
  // Replace underscores with spaces
  let formatted = field.replace(/_/g, ' ');
  
  // Handle dot notation (e.g., "registeredAgent.firstName" → "registeredAgent firstName")
  formatted = formatted.replace(/\./g, ' ');
  
  // Split camelCase (e.g., "firstName" → "first Name")
  formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Capitalize each word
  formatted = formatted
    .split(' ')
    .map(word => {
      // Handle special acronyms
      const upperWord = word.toUpperCase();
      if (['FEIN', 'EIN', 'LLC', 'INC', 'CORP', 'PA', 'LLP', 'PLLC'].includes(upperWord)) {
        return upperWord;
      }
      
      // Normal capitalization
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  return formatted;
}

/**
 * Format enum values to human-readable format
 * Examples:
 * - "ANNUAL_REPORT" → "Annual Report"
 * - "PENDING_CUSTOMER_APPROVAL" → "Pending Customer Approval"
 */
export function formatEnumValue(value: string): string {
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format change type for display
 * Examples:
 * - "SUBSTANTIVE" → "Requires Approval"
 * - "MINOR" → "Minor Change"
 */
export function formatChangeType(changeType: 'SUBSTANTIVE' | 'MINOR'): string {
  return changeType === 'SUBSTANTIVE' ? 'Requires Approval' : 'Minor Change';
}

