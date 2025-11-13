/**
 * Business Form Validation Schemas
 * 
 * Validation for business import and management forms
 */

import { z } from 'zod';
import {
  businessNameSchema,
  documentNumberSchema,
  requiredStringSchema,
} from '@/lib/validation';

/**
 * Business Import Form Schema
 */
export const businessImportSchema = z.object({
  documentNumber: documentNumberSchema,
});

/**
 * Business Search Form Schema
 */
export const businessSearchSchema = z.object({
  query: requiredStringSchema('Search query')
    .min(2, 'Search query must be at least 2 characters'),
});

/**
 * Business Update Form Schema
 */
export const businessUpdateSchema = z.object({
  name: businessNameSchema.optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

/**
 * Type exports
 */
export type BusinessImportData = z.infer<typeof businessImportSchema>;
export type BusinessSearchData = z.infer<typeof businessSearchSchema>;
export type BusinessUpdateData = z.infer<typeof businessUpdateSchema>;

