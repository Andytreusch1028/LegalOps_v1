/**
 * Security utilities module.
 * Provides functions for input sanitization, token generation, and security validation.
 */

// Export sanitization utilities
export {
  sanitizeHtml,
  sanitizeForLog,
  sanitizeInput,
  sanitizeFilename,
  validateFileUpload,
  stripHtmlTags,
  escapeHtml,
  type SanitizeHtmlOptions,
  type FileUploadOptions,
  type FileUploadValidation
} from '../utils/sanitization';

// Export token generation utilities
export {
  generateSecureToken,
  generateSessionId,
  generateApiKey,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateCsrfToken,
  generateOTP,
  validateTokenEntropy,
  hashToken,
  verifyToken
} from './tokens';
