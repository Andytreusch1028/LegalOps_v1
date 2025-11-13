/**
 * Authentication Form Validation Schemas
 * 
 * Validation for signup, signin, and password reset forms
 */

import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  requiredStringSchema,
  optionalStringSchema,
} from '@/lib/validation';

/**
 * Sign Up Form Schema
 */
export const signUpSchema = z.object({
  firstName: requiredStringSchema('First name'),
  lastName: optionalStringSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  phone: phoneSchema.optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Sign In Form Schema
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Password Reset Request Schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Password Reset Confirm Schema
 */
export const passwordResetConfirmSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Change Password Schema (for logged-in users)
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

/**
 * Update Profile Schema
 */
export const updateProfileSchema = z.object({
  firstName: requiredStringSchema('First name'),
  lastName: optionalStringSchema,
  phone: phoneSchema.optional(),
});

/**
 * Type exports
 */
export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmData = z.infer<typeof passwordResetConfirmSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

