/**
 * LLC Formation Form Validation Schema
 * 
 * Comprehensive validation for LLC formation wizard
 * Uses standardized validation patterns from @/lib/validation
 */

import { z } from 'zod';
import {
  businessNameSchema,
  streetAddressSchema,
  citySchema,
  stateSchema,
  zipCodeSchema,
  emailSchema,
  phoneSchema,
  requiredStringSchema,
  optionalStringSchema,
} from '@/lib/validation';

/**
 * Manager Schema
 * Validates individual manager information
 */
export const managerSchema = z.object({
  id: z.string(),
  name: requiredStringSchema('Manager name'),
  email: emailSchema,
  phone: phoneSchema,
});

/**
 * LLC Formation Step 1: Business Information
 */
export const llcFormationStep1Schema = z.object({
  businessName: businessNameSchema,
  businessNameAlternative: optionalStringSchema,
  businessPurpose: optionalStringSchema,
});

/**
 * LLC Formation Step 2: Addresses
 */
export const llcFormationStep2Schema = z.object({
  // Business Address
  businessAddress: streetAddressSchema,
  businessCity: citySchema,
  businessState: stateSchema,
  businessZip: zipCodeSchema,
  
  // Mailing Address (conditional - validated separately if different from business)
  mailingAddress: z.string().optional(),
  mailingCity: z.string().optional(),
  mailingState: z.string().optional(),
  mailingZip: z.string().optional(),
});

/**
 * LLC Formation Step 2 with Mailing Address (when different from business)
 */
export const llcFormationStep2WithMailingSchema = z.object({
  // Business Address
  businessAddress: streetAddressSchema,
  businessCity: citySchema,
  businessState: stateSchema,
  businessZip: zipCodeSchema,
  
  // Mailing Address (required when different)
  mailingAddress: streetAddressSchema,
  mailingCity: citySchema,
  mailingState: stateSchema,
  mailingZip: zipCodeSchema,
});

/**
 * LLC Formation Step 3: Registered Agent
 */
export const llcFormationStep3Schema = z.object({
  registeredAgentName: requiredStringSchema('Registered agent name'),
  registeredAgentAddress: streetAddressSchema,
  registeredAgentCity: citySchema,
  registeredAgentState: stateSchema,
  registeredAgentZip: zipCodeSchema,
});

/**
 * LLC Formation Step 4: Managers
 */
export const llcFormationStep4Schema = z.object({
  managers: z.array(managerSchema)
    .min(1, 'At least one manager is required')
    .max(6, 'Maximum 6 managers allowed per Sunbiz requirements'),
});

/**
 * Complete LLC Formation Form Schema
 */
export const llcFormationCompleteSchema = z.object({
  // Step 1: Business Information
  businessName: businessNameSchema,
  businessNameAlternative: optionalStringSchema,
  businessPurpose: optionalStringSchema,
  
  // Step 2: Addresses
  businessAddress: streetAddressSchema,
  businessCity: citySchema,
  businessState: stateSchema,
  businessZip: zipCodeSchema,
  mailingAddress: z.string().optional(),
  mailingCity: z.string().optional(),
  mailingState: z.string().optional(),
  mailingZip: z.string().optional(),
  
  // Step 3: Registered Agent
  registeredAgentName: requiredStringSchema('Registered agent name'),
  registeredAgentAddress: streetAddressSchema,
  registeredAgentCity: citySchema,
  registeredAgentState: stateSchema,
  registeredAgentZip: zipCodeSchema,
  
  // Step 4: Managers
  managers: z.array(managerSchema)
    .min(1, 'At least one manager is required')
    .max(6, 'Maximum 6 managers allowed per Sunbiz requirements'),
  
  // Additional Options
  rushProcessing: z.boolean().optional(),
});

/**
 * Type exports for TypeScript
 */
export type Manager = z.infer<typeof managerSchema>;
export type LLCFormationStep1Data = z.infer<typeof llcFormationStep1Schema>;
export type LLCFormationStep2Data = z.infer<typeof llcFormationStep2Schema>;
export type LLCFormationStep3Data = z.infer<typeof llcFormationStep3Schema>;
export type LLCFormationStep4Data = z.infer<typeof llcFormationStep4Schema>;
export type LLCFormationCompleteData = z.infer<typeof llcFormationCompleteSchema>;

/**
 * Validation helper functions
 */

/**
 * Validate a specific step of the LLC formation wizard
 */
export function validateLLCFormationStep(
  step: number,
  data: any,
  sameAsBusinessAddress: boolean = true
): { success: boolean; errors: Record<string, string> } {
  let schema: z.ZodSchema;
  
  switch (step) {
    case 1:
      schema = llcFormationStep1Schema;
      break;
    case 2:
      schema = sameAsBusinessAddress 
        ? llcFormationStep2Schema 
        : llcFormationStep2WithMailingSchema;
      break;
    case 3:
      schema = llcFormationStep3Schema;
      break;
    case 4:
      schema = llcFormationStep4Schema;
      break;
    default:
      return { success: true, errors: {} };
  }
  
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, errors: {} };
  }
  
  const errors: Record<string, string> = {};
  result.error.issues.forEach((error: any) => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });

  return { success: false, errors };
}

/**
 * Validate the complete LLC formation form
 */
export function validateLLCFormationComplete(
  data: any
): { success: boolean; errors: Record<string, string>; data?: LLCFormationCompleteData } {
  const result = llcFormationCompleteSchema.safeParse(data);

  if (result.success) {
    return { success: true, errors: {}, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((error: any) => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });
  
  return { success: false, errors };
}

