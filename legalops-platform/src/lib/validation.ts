/**
 * LegalOps Validation Utilities
 * 
 * Standardized validation patterns for common field types.
 * These validators are used across all forms in the application.
 * 
 * @module validation
 */

import { z } from 'zod';

/**
 * U.S. ZIP Code Validation
 * Accepts both 5-digit (12345) and 9-digit (12345-6789) formats
 */
export const zipCodeSchema = z.string()
  .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789')
  .transform(val => val.trim());

export const validateZipCode = (value: string): boolean => {
  return /^\d{5}(-\d{4})?$/.test(value.trim());
};

export const formatZipCode = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 5) {
    return cleaned;
  }
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}`;
};

/**
 * U.S. Phone Number Validation
 * Accepts format: (###) ###-####
 * Also accepts 10 digits without formatting
 */
export const phoneSchema = z.string()
  .regex(/^(\(\d{3}\)\s?\d{3}-\d{4}|\d{10})$/, 'Phone number must be in format (###) ###-#### or 10 digits')
  .transform(val => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return val.trim();
  });

export const validatePhone = (value: string): boolean => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length === 10;
};

export const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 3) return `(${cleaned}`;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
};

/**
 * Social Security Number (SSN) Validation
 * Format: XXX-XX-XXXX
 */
export const ssnSchema = z.string()
  .regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format XXX-XX-XXXX')
  .transform(val => val.trim());

export const validateSSN = (value: string): boolean => {
  return /^\d{3}-\d{2}-\d{4}$/.test(value.trim());
};

export const formatSSN = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
};

/**
 * Employer Identification Number (EIN) Validation
 * Format: XX-XXXXXXX
 */
export const einSchema = z.string()
  .regex(/^\d{2}-\d{7}$/, 'EIN must be in format XX-XXXXXXX')
  .transform(val => val.trim());

export const validateEIN = (value: string): boolean => {
  return /^\d{2}-\d{7}$/.test(value.trim());
};

export const formatEIN = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return cleaned;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 9)}`;
};

/**
 * Email Validation
 * RFC 5322 compliant email validation
 */
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .transform(val => val.trim().toLowerCase());

export const validateEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
};

/**
 * URL Validation
 * Validates HTTP/HTTPS URLs
 */
export const urlSchema = z.string()
  .url('Please enter a valid URL (must start with http:// or https://)')
  .transform(val => val.trim());

export const validateURL = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Florida Document Number Validation
 * Format: L followed by 14 digits (e.g., L19000012345)
 * Or P followed by 14 digits for partnerships
 */
export const documentNumberSchema = z.string()
  .regex(/^[LP]\d{14}$/, 'Document number must be L or P followed by 14 digits')
  .transform(val => val.trim().toUpperCase());

export const validateDocumentNumber = (value: string): boolean => {
  return /^[LP]\d{14}$/i.test(value.trim());
};

export const formatDocumentNumber = (value: string): string => {
  const cleaned = value.replace(/[^LP0-9]/gi, '').toUpperCase();
  return cleaned.slice(0, 15);
};

/**
 * Date Validation
 * ISO 8601 format (YYYY-MM-DD)
 */
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD')
  .refine(val => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Please enter a valid date');

export const validateDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Numeric Range Validation
 */
export const createNumericRangeSchema = (min?: number, max?: number, fieldName: string = 'Value') => {
  let schema = z.number();
  
  if (min !== undefined) {
    schema = schema.min(min, `${fieldName} must be at least ${min}`);
  }
  
  if (max !== undefined) {
    schema = schema.max(max, `${fieldName} must be at most ${max}`);
  }
  
  return schema;
};

/**
 * Required String Validation
 */
export const requiredStringSchema = (fieldName: string = 'This field') => {
  return z.string()
    .min(1, `${fieldName} is required`)
    .transform(val => val.trim());
};

/**
 * Optional String Validation
 */
export const optionalStringSchema = z.string()
  .optional()
  .transform(val => val?.trim() || undefined);

/**
 * Password Validation
 * Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
 */
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const validatePassword = (value: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (value.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(value)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(value)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(value)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Confirm Password Validation
 */
export const createConfirmPasswordSchema = (passwordField: string = 'password') => {
  return z.string()
    .min(1, 'Please confirm your password');
};

/**
 * Business Name Validation
 * Must not be empty and should not contain certain special characters
 */
export const businessNameSchema = z.string()
  .min(1, 'Business name is required')
  .max(200, 'Business name must be less than 200 characters')
  .regex(/^[a-zA-Z0-9\s\-.,&'()]+$/, 'Business name contains invalid characters')
  .transform(val => val.trim());

export const validateBusinessName = (value: string): boolean => {
  return value.trim().length > 0 && 
         value.length <= 200 && 
         /^[a-zA-Z0-9\s\-.,&'()]+$/.test(value);
};

/**
 * Street Address Validation
 */
export const streetAddressSchema = z.string()
  .min(1, 'Street address is required')
  .max(100, 'Street address must be less than 100 characters')
  .transform(val => val.trim());

/**
 * City Validation
 */
export const citySchema = z.string()
  .min(1, 'City is required')
  .max(50, 'City must be less than 50 characters')
  .regex(/^[a-zA-Z\s\-.']+$/, 'City contains invalid characters')
  .transform(val => val.trim());

/**
 * State Validation (US States)
 */
export const stateSchema = z.string()
  .length(2, 'State must be a 2-letter code')
  .regex(/^[A-Z]{2}$/, 'State must be a valid 2-letter code')
  .transform(val => val.trim().toUpperCase());

/**
 * Validation Error Formatter
 * Converts Zod errors to user-friendly messages
 */
export const formatValidationErrors = (errors: z.ZodError): Record<string, string> => {
  const formatted: Record<string, string> = {};
  
  errors.errors.forEach(error => {
    const path = error.path.join('.');
    formatted[path] = error.message;
  });
  
  return formatted;
};

/**
 * Form Data Validator
 * Generic function to validate form data against a schema
 */
export const validateFormData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: formatValidationErrors(result.error)
  };
};

