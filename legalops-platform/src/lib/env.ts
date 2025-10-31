/**
 * Environment Variable Validation & Graceful Fallbacks
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Validates required environment variables and provides graceful fallbacks
 * for optional features like AI risk scoring.
 */

interface EnvConfig {
  // Required
  DATABASE_URL: string;
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  
  // Optional - AI Features
  OPENAI_API_KEY?: string;
  
  // Optional - File Storage
  BLOB_STORAGE_URL?: string;
  BLOB_READ_WRITE_TOKEN?: string;
  
  // Optional - Email
  SENDGRID_API_KEY?: string;
  SENDGRID_FROM_EMAIL?: string;
  
  // Optional - Integrations
  USPS_USER_ID?: string;
  SUNBIZ_API_KEY?: string;
}

/**
 * Validates that all required environment variables are present
 * Throws an error if any required variables are missing
 */
export function validateEnv(): EnvConfig {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
  
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    BLOB_STORAGE_URL: process.env.BLOB_STORAGE_URL,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
    USPS_USER_ID: process.env.USPS_USER_ID,
    SUNBIZ_API_KEY: process.env.SUNBIZ_API_KEY,
  };
}

/**
 * Feature flags based on environment variables
 */
export const features = {
  /** AI-powered risk scoring (requires OPENAI_API_KEY) */
  get aiRiskScoring(): boolean {
    return !!process.env.OPENAI_API_KEY;
  },
  
  /** Document OCR and summarization (requires OPENAI_API_KEY) */
  get aiDocumentProcessing(): boolean {
    return !!process.env.OPENAI_API_KEY;
  },
  
  /** File upload via RA Mail (requires BLOB_STORAGE_URL) */
  get documentUpload(): boolean {
    return !!process.env.BLOB_STORAGE_URL && !!process.env.BLOB_READ_WRITE_TOKEN;
  },
  
  /** Email notifications (requires SENDGRID_API_KEY) */
  get emailNotifications(): boolean {
    return !!process.env.SENDGRID_API_KEY && !!process.env.SENDGRID_FROM_EMAIL;
  },
  
  /** USPS address validation (requires USPS_USER_ID) */
  get addressValidation(): boolean {
    return !!process.env.USPS_USER_ID;
  },
  
  /** Sunbiz integration (requires SUNBIZ_API_KEY) */
  get sunbizIntegration(): boolean {
    return !!process.env.SUNBIZ_API_KEY;
  },
};

/**
 * Get environment variable with fallback
 */
export function getEnv(key: keyof EnvConfig, fallback?: string): string {
  return process.env[key] || fallback || '';
}

/**
 * Check if running in production
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if running in test
 */
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Log environment status (for debugging)
 */
export function logEnvStatus() {
  if (isDevelopment) {
    console.log('🔧 Environment Status:');
    console.log('  AI Risk Scoring:', features.aiRiskScoring ? '✅' : '❌ (using rules-based)');
    console.log('  AI Document Processing:', features.aiDocumentProcessing ? '✅' : '❌');
    console.log('  Document Upload:', features.documentUpload ? '✅' : '❌');
    console.log('  Email Notifications:', features.emailNotifications ? '✅' : '❌');
    console.log('  Address Validation:', features.addressValidation ? '✅' : '❌');
    console.log('  Sunbiz Integration:', features.sunbizIntegration ? '✅' : '❌');
  }
}

// Validate environment on module load (server-side only)
if (typeof window === 'undefined') {
  try {
    validateEnv();
    logEnvStatus();
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    if (isProduction) {
      throw error; // Fail fast in production
    }
  }
}

