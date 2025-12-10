/**
 * Branded types for type-safe IDs and values.
 * These types prevent accidental mixing of different ID types at compile time.
 */

/**
 * Branded type for User IDs.
 * Prevents accidentally using an OrderId where a UserId is expected.
 */
export type UserId = string & { readonly __brand: 'UserId' };

/**
 * Branded type for Order IDs.
 * Prevents accidentally using a UserId where an OrderId is expected.
 */
export type OrderId = string & { readonly __brand: 'OrderId' };

/**
 * Branded type for Email addresses.
 * Ensures email validation has been performed before use.
 */
export type Email = string & { readonly __brand: 'Email' };

/**
 * Branded type for Entity IDs (business entities like LLCs, Corporations).
 */
export type EntityId = string & { readonly __brand: 'EntityId' };

/**
 * Branded type for Filing IDs.
 */
export type FilingId = string & { readonly __brand: 'FilingId' };

/**
 * Type guard to validate and brand a string as a UserId.
 * Checks for valid CUID format (25 lowercase alphanumeric characters).
 * 
 * @param value - The string to validate
 * @returns True if the value is a valid UserId
 */
export function isUserId(value: string): value is UserId {
  // CUID format: 25 characters, lowercase alphanumeric starting with 'c'
  return /^c[a-z0-9]{24}$/.test(value);
}

/**
 * Type guard to validate and brand a string as an OrderId.
 * Checks for valid CUID format (25 lowercase alphanumeric characters).
 * 
 * @param value - The string to validate
 * @returns True if the value is a valid OrderId
 */
export function isOrderId(value: string): value is OrderId {
  // CUID format: 25 characters, lowercase alphanumeric starting with 'c'
  return /^c[a-z0-9]{24}$/.test(value);
}

/**
 * Type guard to validate and brand a string as an Email.
 * Performs basic email format validation.
 * 
 * @param value - The string to validate
 * @returns True if the value is a valid Email
 */
export function isEmail(value: string): value is Email {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) && value.length <= 254; // RFC 5321 max length
}

/**
 * Type guard to validate and brand a string as an EntityId.
 * Checks for valid CUID format (25 lowercase alphanumeric characters).
 * 
 * @param value - The string to validate
 * @returns True if the value is a valid EntityId
 */
export function isEntityId(value: string): value is EntityId {
  // CUID format: 25 characters, lowercase alphanumeric starting with 'c'
  return /^c[a-z0-9]{24}$/.test(value);
}

/**
 * Type guard to validate and brand a string as a FilingId.
 * Checks for valid CUID format (25 lowercase alphanumeric characters).
 * 
 * @param value - The string to validate
 * @returns True if the value is a valid FilingId
 */
export function isFilingId(value: string): value is FilingId {
  // CUID format: 25 characters, lowercase alphanumeric starting with 'c'
  return /^c[a-z0-9]{24}$/.test(value);
}

/**
 * Safely casts a string to UserId after validation.
 * Throws an error if the value is not a valid UserId.
 * 
 * @param value - The string to cast
 * @returns The value as a UserId
 * @throws Error if the value is not a valid UserId
 */
export function toUserId(value: string): UserId {
  if (!isUserId(value)) {
    throw new Error(`Invalid UserId format: ${value}`);
  }
  return value;
}

/**
 * Safely casts a string to OrderId after validation.
 * Throws an error if the value is not a valid OrderId.
 * 
 * @param value - The string to cast
 * @returns The value as an OrderId
 * @throws Error if the value is not a valid OrderId
 */
export function toOrderId(value: string): OrderId {
  if (!isOrderId(value)) {
    throw new Error(`Invalid OrderId format: ${value}`);
  }
  return value;
}

/**
 * Safely casts a string to Email after validation.
 * Throws an error if the value is not a valid Email.
 * 
 * @param value - The string to cast
 * @returns The value as an Email
 * @throws Error if the value is not a valid Email
 */
export function toEmail(value: string): Email {
  if (!isEmail(value)) {
    throw new Error(`Invalid Email format: ${value}`);
  }
  return value;
}

/**
 * Safely casts a string to EntityId after validation.
 * Throws an error if the value is not a valid EntityId.
 * 
 * @param value - The string to cast
 * @returns The value as an EntityId
 * @throws Error if the value is not a valid EntityId
 */
export function toEntityId(value: string): EntityId {
  if (!isEntityId(value)) {
    throw new Error(`Invalid EntityId format: ${value}`);
  }
  return value;
}

/**
 * Safely casts a string to FilingId after validation.
 * Throws an error if the value is not a valid FilingId.
 * 
 * @param value - The string to cast
 * @returns The value as a FilingId
 * @throws Error if the value is not a valid FilingId
 */
export function toFilingId(value: string): FilingId {
  if (!isFilingId(value)) {
    throw new Error(`Invalid FilingId format: ${value}`);
  }
  return value;
}
