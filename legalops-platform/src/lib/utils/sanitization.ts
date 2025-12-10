/**
 * Input sanitization utilities for security.
 * Protects against XSS, injection attacks, and data corruption.
 */

/**
 * Sanitizes HTML content by removing potentially dangerous tags and attributes.
 * Uses a whitelist approach to only allow safe HTML elements.
 * 
 * @param input - HTML string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized HTML string
 * 
 * @example
 * ```typescript
 * const userInput = '<p>Hello</p><script>alert("xss")</script>';
 * const safe = sanitizeHtml(userInput);
 * // Result: '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(
  input: string,
  options: SanitizeHtmlOptions = {}
): string {
  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    allowedAttributes = { a: ['href', 'title'] },
    allowedProtocols = ['http', 'https', 'mailto']
  } = options;
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove style tags
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object and embed tags
  sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  
  // Filter tags - only allow whitelisted tags
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    const tag = tagName.toLowerCase();
    
    // Check if tag is allowed
    if (!allowedTags.includes(tag)) {
      return '';
    }
    
    // For allowed tags, filter attributes
    if (match.includes('=')) {
      const allowedAttrs = allowedAttributes[tag] || [];
      
      // Remove disallowed attributes
      let filteredTag = match.replace(/\s+([a-z][a-z0-9-]*)\s*=\s*["']([^"']*)["']/gi, (attrMatch, attrName, attrValue) => {
        if (!allowedAttrs.includes(attrName.toLowerCase())) {
          return '';
        }
        
        // For href attributes, validate protocol
        if (attrName.toLowerCase() === 'href') {
          const protocol = attrValue.split(':')[0].toLowerCase();
          if (!allowedProtocols.includes(protocol) && !attrValue.startsWith('/') && !attrValue.startsWith('#')) {
            return '';
          }
        }
        
        return attrMatch;
      });
      
      return filteredTag;
    }
    
    return match;
  });
  
  return sanitized.trim();
}

/**
 * Options for HTML sanitization.
 */
export interface SanitizeHtmlOptions {
  /** Allowed HTML tags (default: basic formatting tags) */
  allowedTags?: string[];
  /** Allowed attributes per tag (default: href and title for links) */
  allowedAttributes?: Record<string, string[]>;
  /** Allowed URL protocols (default: http, https, mailto) */
  allowedProtocols?: string[];
}

/**
 * Sanitizes input for logging by redacting sensitive information.
 * Removes PII, credentials, and other sensitive data.
 * 
 * @param data - Data to sanitize
 * @returns Sanitized data safe for logging
 * 
 * @example
 * ```typescript
 * const userData = {
 *   email: 'user@example.com',
 *   password: 'secret123',
 *   ssn: '123-45-6789'
 * };
 * 
 * const safe = sanitizeForLog(userData);
 * // Result: {
 * //   email: '[REDACTED]',
 * //   password: '[REDACTED]',
 * //   ssn: '[REDACTED]'
 * // }
 * ```
 */
export function sanitizeForLog(data: unknown): unknown {
  // Sensitive field patterns
  const sensitiveFields = /\b(password|token|secret|apikey|api_key|ssn|social_security|credit_card|creditcard|cvv|pin)\b/i;
  
  // Sensitive value patterns
  const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
  const creditCardPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  
  if (typeof data === 'string') {
    // Redact sensitive patterns in strings
    let sanitized = data;
    sanitized = sanitized.replace(ssnPattern, '[SSN-REDACTED]');
    sanitized = sanitized.replace(creditCardPattern, '[CARD-REDACTED]');
    sanitized = sanitized.replace(emailPattern, '[EMAIL-REDACTED]');
    sanitized = sanitized.replace(phonePattern, '[PHONE-REDACTED]');
    return sanitized;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLog(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Redact sensitive fields entirely
      if (sensitiveFields.test(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeForLog(value);
      }
    }
    
    return sanitized;
  }
  
  return data;
}

/**
 * Sanitizes user input by trimming whitespace and removing control characters.
 * Useful for text inputs, names, addresses, etc.
 * 
 * @param input - String to sanitize
 * @returns Sanitized string
 * 
 * @example
 * ```typescript
 * const userInput = '  John Doe\n\r\t  ';
 * const clean = sanitizeInput(userInput);
 * // Result: 'John Doe'
 * ```
 */
export function sanitizeInput(input: string): string {
  // Remove control characters (except newlines and tabs for multiline inputs)
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Normalize whitespace (replace multiple spaces with single space)
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized;
}

/**
 * Sanitizes filename by removing path traversal attempts and dangerous characters.
 * 
 * @param filename - Filename to sanitize
 * @returns Safe filename
 * 
 * @example
 * ```typescript
 * const malicious = '../../../etc/passwd';
 * const safe = sanitizeFilename(malicious);
 * // Result: 'passwd'
 * ```
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  let sanitized = filename.replace(/^.*[\\\/]/, '');
  
  // Remove dangerous characters first (including null bytes)
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1F]/g, '');
  
  // Remove path traversal attempts (after removing dangerous chars to prevent creation of new .. patterns)
  sanitized = sanitized.replace(/\.\./g, '');
  
  // Remove any remaining path separators that might have been created
  sanitized = sanitized.replace(/[\\\/]/g, '');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop() || '';
    const name = sanitized.substring(0, 255 - ext.length - 1);
    sanitized = `${name}.${ext}`;
  }
  
  return sanitized || 'unnamed';
}

/**
 * Validates and sanitizes file upload.
 * Checks file type, size, and name.
 * 
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result with sanitized filename
 * 
 * @example
 * ```typescript
 * const result = validateFileUpload(file, {
 *   allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
 *   maxSize: 5 * 1024 * 1024 // 5MB
 * });
 * 
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateFileUpload(
  file: File,
  options: FileUploadOptions = {}
): FileUploadValidation {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
    maxSize = 10 * 1024 * 1024, // 10MB default
    minSize = 0
  } = options;
  
  const errors: string[] = [];
  
  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Validate file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
  }
  
  // Validate file size
  if (file.size > maxSize) {
    errors.push(`File size ${file.size} bytes exceeds maximum ${maxSize} bytes`);
  }
  
  if (file.size < minSize) {
    errors.push(`File size ${file.size} bytes is below minimum ${minSize} bytes`);
  }
  
  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.name);
  
  return {
    valid: errors.length === 0,
    errors,
    sanitizedFilename
  };
}

/**
 * Options for file upload validation.
 */
export interface FileUploadOptions {
  /** Allowed MIME types */
  allowedTypes?: string[];
  /** Allowed file extensions (with dot, e.g., '.pdf') */
  allowedExtensions?: string[];
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Minimum file size in bytes */
  minSize?: number;
}

/**
 * Result of file upload validation.
 */
export interface FileUploadValidation {
  /** Whether the file is valid */
  valid: boolean;
  /** Validation error messages */
  errors: string[];
  /** Sanitized filename safe for storage */
  sanitizedFilename: string;
}

/**
 * Strips HTML tags from a string, leaving only text content.
 * 
 * @param html - HTML string
 * @returns Plain text without HTML tags
 * 
 * @example
 * ```typescript
 * const html = '<p>Hello <strong>World</strong></p>';
 * const text = stripHtmlTags(html);
 * // Result: 'Hello World'
 * ```
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Escapes HTML special characters to prevent XSS.
 * 
 * @param text - Text to escape
 * @returns HTML-escaped text
 * 
 * @example
 * ```typescript
 * const userInput = '<script>alert("xss")</script>';
 * const safe = escapeHtml(userInput);
 * // Result: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, char => map[char]);
}
