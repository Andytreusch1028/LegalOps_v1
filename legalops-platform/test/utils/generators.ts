/**
 * Property-Based Testing Generators
 * 
 * This module provides fast-check arbitraries (generators) for common domain types
 * used throughout the LegalOps platform. These generators are used in property-based
 * tests to validate that functions work correctly across a wide range of inputs.
 * 
 * @module test/utils/generators
 */

import fc from 'fast-check';
import { 
  isUserId, 
  isOrderId, 
  isEmail, 
  isEntityId, 
  isFilingId,
  type UserId,
  type OrderId,
  type Email,
  type EntityId,
  type FilingId
} from '@/lib/types/branded';

/**
 * Generates valid CUID strings (25 characters, starting with 'c').
 * CUIDs are used for all database IDs in the platform.
 */
export const cuidArbitrary = fc.string({ minLength: 24, maxLength: 24 })
  .map(s => 'c' + s.toLowerCase().replace(/[^a-z0-9]/g, '0'));

/**
 * Generates valid UserId values.
 * UserId is a branded type representing user identifiers.
 */
export const userIdArbitrary: fc.Arbitrary<UserId> = cuidArbitrary
  .filter(isUserId);

/**
 * Generates valid OrderId values.
 * OrderId is a branded type representing order identifiers.
 */
export const orderIdArbitrary: fc.Arbitrary<OrderId> = cuidArbitrary
  .filter(isOrderId);

/**
 * Generates valid EntityId values.
 * EntityId is a branded type representing business entity identifiers.
 */
export const entityIdArbitrary: fc.Arbitrary<EntityId> = cuidArbitrary
  .filter(isEntityId);

/**
 * Generates valid FilingId values.
 * FilingId is a branded type representing filing identifiers.
 */
export const filingIdArbitrary: fc.Arbitrary<FilingId> = cuidArbitrary
  .filter(isFilingId);

/**
 * Generates valid email addresses that match our validation rules.
 * Email is a branded type representing validated email addresses.
 * 
 * Note: We use a custom generator instead of fc.emailAddress() because
 * fc.emailAddress() generates RFC-compliant emails that are more permissive
 * than our simple regex validation (e.g., emails with special characters).
 */
export const emailArbitrary: fc.Arbitrary<Email> = fc.tuple(
  // Local part: alphanumeric, dots, hyphens, underscores (no trailing dot or special chars)
  fc.stringMatching(/^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$/),
  // Domain: alphanumeric and hyphens (no trailing hyphen)
  fc.stringMatching(/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/),
  // TLD: 2-6 letters
  fc.stringMatching(/^[a-zA-Z]{2,6}$/)
).map(([local, domain, tld]) => `${local}@${domain}.${tld}` as Email)
  .filter(email => email.length <= 254 && isEmail(email));

/**
 * Generates valid US ZIP codes in both 5-digit and 9-digit formats.
 * Examples: "12345", "12345-6789"
 */
export const zipCodeArbitrary = fc.oneof(
  // 5-digit format
  fc.integer({ min: 10000, max: 99999 }).map(n => n.toString()),
  // 9-digit format
  fc.tuple(
    fc.integer({ min: 10000, max: 99999 }),
    fc.integer({ min: 1000, max: 9999 })
  ).map(([zip5, zip4]) => `${zip5}-${zip4}`)
);

/**
 * Generates valid US phone numbers in the format (###) ###-####.
 */
export const phoneArbitrary = fc.tuple(
  fc.integer({ min: 200, max: 999 }), // Area code (200-999)
  fc.integer({ min: 200, max: 999 }), // Exchange (200-999)
  fc.integer({ min: 0, max: 9999 })   // Line number (0000-9999)
).map(([area, exchange, line]) => 
  `(${area}) ${exchange}-${line.toString().padStart(4, '0')}`
);

/**
 * Generates valid Social Security Numbers in the format XXX-XX-XXXX.
 * Note: These are randomly generated and not real SSNs.
 */
export const ssnArbitrary = fc.tuple(
  fc.integer({ min: 100, max: 999 }),
  fc.integer({ min: 10, max: 99 }),
  fc.integer({ min: 1000, max: 9999 })
).map(([area, group, serial]) => `${area}-${group}-${serial}`);

/**
 * Generates valid Employer Identification Numbers in the format XX-XXXXXXX.
 * Note: These are randomly generated and not real EINs.
 */
export const einArbitrary = fc.tuple(
  fc.integer({ min: 10, max: 99 }),
  fc.integer({ min: 1000000, max: 9999999 })
).map(([prefix, suffix]) => `${prefix}-${suffix}`);

/**
 * Generates valid US state codes (2-letter abbreviations).
 */
export const stateCodeArbitrary = fc.constantFrom(
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
);

/**
 * Generates valid street addresses.
 */
export const streetAddressArbitrary = fc.tuple(
  fc.integer({ min: 1, max: 99999 }),
  fc.constantFrom('Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington', 'Lake', 'Hill', 'Park'),
  fc.constantFrom('St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd', 'Way', 'Ct', 'Pl')
).map(([number, street, suffix]) => `${number} ${street} ${suffix}`);

/**
 * Generates valid city names.
 */
export const cityArbitrary = fc.constantFrom(
  'Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Tallahassee',
  'Fort Lauderdale', 'St. Petersburg', 'Hialeah', 'Port St. Lucie',
  'Cape Coral', 'Pembroke Pines', 'Hollywood', 'Miramar', 'Coral Springs',
  'Clearwater', 'Palm Bay', 'Lakeland', 'Pompano Beach', 'West Palm Beach'
);

/**
 * Generates complete US addresses.
 */
export const addressArbitrary = fc.record({
  street: streetAddressArbitrary,
  city: cityArbitrary,
  state: stateCodeArbitrary,
  zipCode: zipCodeArbitrary
});

/**
 * Generates valid Florida document numbers.
 * Format: L followed by 14 digits (e.g., L19000012345678)
 */
export const documentNumberArbitrary = fc.oneof(
  // LLC/Corporation format (L + 14 digits)
  fc.integer({ min: 10000000000000, max: 99999999999999 })
    .map(n => `L${n}`),
  // Partnership format (P + 14 digits)
  fc.integer({ min: 10000000000000, max: 99999999999999 })
    .map(n => `P${n}`)
);

/**
 * Generates valid ISO 8601 date strings (YYYY-MM-DD).
 */
export const dateStringArbitrary = fc.date({
  min: new Date('1900-01-01'),
  max: new Date('2100-12-31')
}).map(date => {
  // Handle invalid dates gracefully
  if (isNaN(date.getTime())) {
    return '2024-01-01';
  }
  return date.toISOString().split('T')[0];
});

/**
 * Generates valid business names.
 * Business names can contain letters, numbers, spaces, and certain special characters.
 */
export const businessNameArbitrary = fc.string({
  minLength: 1,
  maxLength: 200
}).filter(s => /^[a-zA-Z0-9\s\-.,&'()]+$/.test(s) && s.trim().length > 0);

/**
 * Generates valid DBA (fictitious) names.
 * Similar to business names but with a 120 character limit.
 */
export const dbaNameArbitrary = fc.string({
  minLength: 1,
  maxLength: 120
}).filter(s => /^[a-zA-Z0-9\s\-.,&'()]+$/.test(s) && s.trim().length > 0);

/**
 * Generates valid passwords that meet security requirements.
 * Requirements: min 8 chars, uppercase, lowercase, number, special character
 */
export const passwordArbitrary = fc.tuple(
  fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),  // At least one uppercase
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),  // At least one lowercase
  fc.constantFrom(...'0123456789'.split('')),                   // At least one number
  fc.constantFrom(...'!@#$%^&*()_+-=[]{}|;:,.<>?'.split('')),  // At least one special char
  fc.string({ minLength: 4, maxLength: 20 })                   // Additional characters
).map(([upper, lower, digit, special, rest]) => 
  upper + lower + digit + special + rest
);

/**
 * Generates valid URLs (HTTP/HTTPS).
 */
export const urlArbitrary = fc.webUrl({ validSchemes: ['http', 'https'] });

/**
 * Generates customer data for risk assessment testing.
 */
export const customerDataArbitrary = fc.record({
  email: emailArbitrary,
  name: fc.string({ minLength: 1, maxLength: 100 }),
  phone: fc.option(phoneArbitrary),
  accountAge: fc.integer({ min: 0, max: 3650 }), // Days
  previousOrders: fc.integer({ min: 0, max: 100 }),
  previousChargebacks: fc.integer({ min: 0, max: 10 })
});

/**
 * Generates order data for testing.
 */
export const orderDataArbitrary = fc.record({
  orderId: orderIdArbitrary,
  userId: userIdArbitrary,
  totalAmount: fc.integer({ min: 1, max: 100000 }), // Cents
  items: fc.array(
    fc.record({
      name: fc.string({ minLength: 1, maxLength: 100 }),
      quantity: fc.integer({ min: 1, max: 10 }),
      price: fc.integer({ min: 1, max: 10000 }) // Cents
    }),
    { minLength: 1, maxLength: 10 }
  ),
  billingAddress: addressArbitrary
});

/**
 * Generates boundary value inputs for validation testing.
 * These are edge cases that often reveal bugs in validation logic.
 */
export const boundaryValueArbitrary = fc.constantFrom(
  // Empty/whitespace strings
  '',
  ' ',
  '  ',
  '\t',
  '\n',
  '   \t\n   ',
  
  // Zero and negative numbers
  0,
  -1,
  -999999,
  
  // Maximum values
  Number.MAX_SAFE_INTEGER,
  Number.MIN_SAFE_INTEGER,
  
  // Special dates
  '1900-01-01',
  '2100-12-31',
  '2000-02-29', // Leap year
  '2001-02-28', // Non-leap year
  
  // Edge case strings
  'a',
  'A',
  '0',
  '9',
  
  // Special characters
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '(',
  ')',
  
  // Very long strings (at common limits)
  'a'.repeat(100),
  'a'.repeat(200),
  'a'.repeat(254), // Email max
  'a'.repeat(255),
  'a'.repeat(1000)
);

/**
 * Generates invalid input variations for negative testing.
 * These inputs should be rejected by validation functions.
 */
export const invalidInputArbitrary = fc.oneof(
  // Invalid email formats
  fc.constantFrom(
    'notanemail',
    '@example.com',
    'user@',
    'user @example.com',
    'user@example',
    'a'.repeat(255) + '@example.com' // Too long
  ),
  
  // Invalid phone numbers
  fc.constantFrom(
    '123',
    '12345',
    '123456789',
    '12345678901',
    'abc-def-ghij',
    '(123) 456-789', // Too short
    '(123) 456-78901' // Too long
  ),
  
  // Invalid ZIP codes
  fc.constantFrom(
    '1234',
    '123456',
    'abcde',
    '12345-',
    '12345-123',
    '12345-12345'
  ),
  
  // Invalid dates
  fc.constantFrom(
    '2024-13-01', // Invalid month
    '2024-02-30', // Invalid day
    '2024-00-01', // Invalid month
    '2024-01-00', // Invalid day
    '24-01-01',   // Wrong format
    '2024/01/01', // Wrong separator
    'not-a-date'
  )
);



/**
 * Generates valid AddressFormData for testing.
 */
export const addressFormDataArbitrary = fc.record({
  street: streetAddressArbitrary,
  street2: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
  city: cityArbitrary,
  state: stateCodeArbitrary,
  zipCode: zipCodeArbitrary,
  country: fc.option(fc.constant('USA'))
});

/**
 * Generates valid manager data for LLC formation.
 */
export const managerArbitrary = fc.record({
  option: fc.constant('NEW' as const),
  firstName: fc.string({ minLength: 1, maxLength: 50 }),
  lastName: fc.string({ minLength: 1, maxLength: 50 }),
  title: fc.option(fc.constantFrom('Manager', 'Member', 'Managing Member')),
  roleType: fc.constantFrom('MANAGER', 'MEMBER', 'MANAGING_MEMBER'),
  email: fc.option(emailArbitrary),
  phone: fc.option(phoneArbitrary),
  address: streetAddressArbitrary
});

/**
 * Generates valid LLC formation form data.
 */
export const llcFormationFormDataArbitrary = fc.record({
  businessName: businessNameArbitrary,
  effectiveDate: fc.option(dateStringArbitrary),
  duration: fc.option(fc.constantFrom('PERPETUAL' as const, 'SPECIFIC_DATE' as const)),
  dissolutionDate: fc.option(dateStringArbitrary),
  purpose: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  principalAddress: addressFormDataArbitrary,
  mailingAddressOption: fc.constantFrom('SAME_AS_PRINCIPAL' as const, 'DIFFERENT' as const),
  mailingAddress: fc.option(addressFormDataArbitrary),
  registeredAgentOption: fc.constantFrom('LEGALOPS' as const, 'NEW' as const),
  newRegisteredAgent: fc.option(fc.record({
    agentType: fc.constantFrom('INDIVIDUAL', 'COMPANY', 'LEGALOPS'),
    firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    companyName: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
    email: fc.option(emailArbitrary),
    phone: fc.option(phoneArbitrary),
    address: addressFormDataArbitrary
  })),
  managementStructure: fc.constantFrom('MEMBER_MANAGED' as const, 'MANAGER_MANAGED' as const),
  managersOption: fc.constantFrom('SELF_ONLY' as const, 'MULTIPLE' as const),
  managers: fc.array(managerArbitrary, { minLength: 1, maxLength: 6 }),
  expeditedProcessing: fc.option(fc.boolean()),
  certifiedCopy: fc.option(fc.boolean()),
  correspondenceEmail: emailArbitrary
});

/**
 * Generates valid officer data for corporation formation.
 */
export const officerArbitrary = fc.record({
  option: fc.constant('NEW' as const),
  firstName: fc.string({ minLength: 1, maxLength: 50 }),
  lastName: fc.string({ minLength: 1, maxLength: 50 }),
  roleType: fc.constantFrom('PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'TREASURER'),
  email: fc.option(emailArbitrary),
  phone: fc.option(phoneArbitrary),
  address: streetAddressArbitrary
});

/**
 * Generates valid director data for corporation formation.
 */
export const directorArbitrary = fc.record({
  option: fc.constant('NEW' as const),
  firstName: fc.string({ minLength: 1, maxLength: 50 }),
  lastName: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.option(emailArbitrary),
  phone: fc.option(phoneArbitrary),
  address: streetAddressArbitrary
});

/**
 * Generates valid corporation formation form data.
 */
export const corporationFormationFormDataArbitrary = fc.record({
  businessName: businessNameArbitrary,
  corporationType: fc.constantFrom('FOR_PROFIT' as const, 'NONPROFIT' as const),
  effectiveDate: fc.option(dateStringArbitrary),
  purpose: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  authorizedShares: fc.option(fc.integer({ min: 1, max: 1000000 })),
  parValue: fc.option(fc.integer({ min: 0, max: 1000 })),
  stockClasses: fc.option(fc.array(fc.record({
    className: fc.string({ minLength: 1, maxLength: 50 }),
    shares: fc.integer({ min: 1, max: 1000000 }),
    parValue: fc.integer({ min: 0, max: 1000 }),
    votingRights: fc.boolean()
  }), { minLength: 1, maxLength: 5 })),
  principalAddress: addressFormDataArbitrary,
  mailingAddressOption: fc.constantFrom('SAME_AS_PRINCIPAL' as const, 'DIFFERENT' as const),
  mailingAddress: fc.option(addressFormDataArbitrary),
  registeredAgentOption: fc.constantFrom('LEGALOPS' as const, 'NEW' as const),
  newRegisteredAgent: fc.option(fc.record({
    agentType: fc.constantFrom('INDIVIDUAL', 'COMPANY', 'LEGALOPS'),
    firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    companyName: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
    email: fc.option(emailArbitrary),
    phone: fc.option(phoneArbitrary),
    address: addressFormDataArbitrary
  })),
  officers: fc.array(officerArbitrary, { minLength: 1, maxLength: 10 }),
  directors: fc.array(directorArbitrary, { minLength: 1, maxLength: 10 }),
  incorporatorOption: fc.constantFrom('SELF' as const, 'ATTORNEY' as const, 'OTHER' as const),
  incorporator: fc.option(fc.record({
    firstName: fc.string({ minLength: 1, maxLength: 50 }),
    lastName: fc.string({ minLength: 1, maxLength: 50 }),
    email: fc.option(emailArbitrary),
    phone: fc.option(phoneArbitrary),
    address: streetAddressArbitrary
  })),
  expeditedProcessing: fc.option(fc.boolean()),
  certifiedCopy: fc.option(fc.boolean()),
  correspondenceEmail: emailArbitrary
});

/**
 * Generates valid annual report form data.
 */
export const annualReportFormDataArbitrary = fc.record({
  businessEntityId: cuidArbitrary,
  confirmCurrentInformation: fc.boolean(),
  hasChanges: fc.boolean(),
  changes: fc.option(fc.record({
    principalAddress: fc.option(addressFormDataArbitrary),
    mailingAddress: fc.option(addressFormDataArbitrary),
    registeredAgent: fc.option(fc.record({
      firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
      lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
      companyName: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
      address: fc.option(addressFormDataArbitrary)
    })),
    officers: fc.option(fc.array(fc.record({
      action: fc.constantFrom('ADD' as const, 'REMOVE' as const, 'UPDATE' as const),
      id: fc.option(cuidArbitrary),
      firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
      lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
      roleType: fc.option(fc.constantFrom('PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'TREASURER', 'DIRECTOR')),
      address: fc.option(streetAddressArbitrary)
    }), { minLength: 0, maxLength: 10 }))
  })),
  correspondenceEmail: emailArbitrary
});
