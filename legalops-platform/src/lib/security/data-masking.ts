import { Result } from '../types/result';

/**
 * Masking strategies for different types of sensitive data
 */
export enum MaskingStrategy {
  FULL = 'full',           // Replace entire value with asterisks
  PARTIAL = 'partial',     // Show first/last characters, mask middle
  EMAIL = 'email',         // Mask email username, keep domain
  PHONE = 'phone',         // Mask middle digits of phone number
  CREDIT_CARD = 'credit_card', // Show last 4 digits only
  SSN = 'ssn',            // Show last 4 digits only
  CUSTOM = 'custom'        // Use custom masking function
}

/**
 * Configuration for masking operations
 */
export interface MaskingConfig {
  strategy: MaskingStrategy;
  maskChar: string;
  preserveLength: boolean;
  showFirst?: number;
  showLast?: number;
  customMaskFn?: (value: string) => string;
}

/**
 * Default masking configurations for different data types
 */
export const DEFAULT_MASKING_CONFIGS: Record<string, MaskingConfig> = {
  email: {
    strategy: MaskingStrategy.EMAIL,
    maskChar: '*',
    preserveLength: false
  },
  phone: {
    strategy: MaskingStrategy.PHONE,
    maskChar: '*',
    preserveLength: false
  },
  ssn: {
    strategy: MaskingStrategy.SSN,
    maskChar: '*',
    preserveLength: false
  },
  creditCard: {
    strategy: MaskingStrategy.CREDIT_CARD,
    maskChar: '*',
    preserveLength: false
  },
  password: {
    strategy: MaskingStrategy.FULL,
    maskChar: '*',
    preserveLength: false
  },
  name: {
    strategy: MaskingStrategy.PARTIAL,
    maskChar: '*',
    preserveLength: true,
    showFirst: 1,
    showLast: 1
  },
  address: {
    strategy: MaskingStrategy.PARTIAL,
    maskChar: '*',
    preserveLength: false,
    showFirst: 3,
    showLast: 0
  },
  default: {
    strategy: MaskingStrategy.PARTIAL,
    maskChar: '*',
    preserveLength: true,
    showFirst: 2,
    showLast: 2
  }
};

/**
 * PII (Personally Identifiable Information) field patterns
 */
export const PII_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  ssn: /^\d{3}-?\d{2}-?\d{4}$/,
  creditCard: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
};

/**
 * Common PII field names to automatically detect
 */
export const PII_FIELD_NAMES = [
  'email', 'password', 'ssn', 'social_security_number', 'tax_id',
  'phone', 'phone_number', 'mobile', 'telephone',
  'credit_card', 'creditcard', 'card_number', 'cc_number',
  'first_name', 'last_name', 'full_name', 'name',
  'address', 'street_address', 'home_address',
  'date_of_birth', 'dob', 'birth_date',
  'drivers_license', 'license_number', 'passport',
  'bank_account', 'account_number', 'routing_number'
];

/**
 * Data masking service for PII protection in logs
 */
export class DataMasker {
  private customConfigs: Map<string, MaskingConfig>;
  private autoDetectPII: boolean;

  constructor(autoDetectPII: boolean = true) {
    this.customConfigs = new Map();
    this.autoDetectPII = autoDetectPII;
  }

  /**
   * Adds a custom masking configuration for a specific field
   */
  addCustomConfig(fieldName: string, config: MaskingConfig): void {
    this.customConfigs.set(fieldName.toLowerCase(), config);
  }

  /**
   * Masks a single string value
   */
  maskValue(value: string, config?: MaskingConfig): Result<string, Error> {
    try {
      if (!value || typeof value !== 'string') {
        return Result.success(value);
      }

      const maskingConfig = config || DEFAULT_MASKING_CONFIGS.default;

      switch (maskingConfig.strategy) {
        case MaskingStrategy.FULL:
          return Result.success(this.maskFull(value, maskingConfig));
        
        case MaskingStrategy.PARTIAL:
          return Result.success(this.maskPartial(value, maskingConfig));
        
        case MaskingStrategy.EMAIL:
          return Result.success(this.maskEmail(value, maskingConfig));
        
        case MaskingStrategy.PHONE:
          return Result.success(this.maskPhone(value, maskingConfig));
        
        case MaskingStrategy.CREDIT_CARD:
          return Result.success(this.maskCreditCard(value, maskingConfig));
        
        case MaskingStrategy.SSN:
          return Result.success(this.maskSSN(value, maskingConfig));
        
        case MaskingStrategy.CUSTOM:
          if (maskingConfig.customMaskFn) {
            return Result.success(maskingConfig.customMaskFn(value));
          }
          return Result.success(this.maskPartial(value, maskingConfig));
        
        default:
          return Result.success(this.maskPartial(value, maskingConfig));
      }
    } catch (error) {
      return Result.failure(new Error(`Masking failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Masks sensitive data in an object recursively
   */
  maskObject(obj: any, depth: number = 0, maxDepth: number = 10): Result<any, Error> {
    try {
      if (depth > maxDepth) {
        return Result.success('[Max depth reached]');
      }

      if (obj === null || obj === undefined) {
        return Result.success(obj);
      }

      if (typeof obj === 'string') {
        if (this.autoDetectPII) {
          const detectedType = this.detectPIIType(obj);
          if (detectedType) {
            const config = DEFAULT_MASKING_CONFIGS[detectedType];
            return this.maskValue(obj, config);
          }
        }
        return Result.success(obj);
      }

      if (typeof obj === 'number' || typeof obj === 'boolean') {
        return Result.success(obj);
      }

      if (Array.isArray(obj)) {
        const maskedArray = [];
        for (const item of obj) {
          const maskedResult = this.maskObject(item, depth + 1, maxDepth);
          if (maskedResult.isFailure()) {
            return maskedResult;
          }
          maskedArray.push(maskedResult.value);
        }
        return Result.success(maskedArray);
      }

      if (typeof obj === 'object') {
        const maskedObj: any = {};
        
        for (const [key, value] of Object.entries(obj)) {
          const lowerKey = key.toLowerCase();
          
          // Check if this field should be masked
          let config: MaskingConfig | undefined;
          
          // Check custom configurations first
          if (this.customConfigs.has(lowerKey)) {
            config = this.customConfigs.get(lowerKey);
          }
          // Check if field name indicates PII
          else if (this.isPIIField(lowerKey)) {
            config = this.getConfigForPIIField(lowerKey);
          }

          if (config && typeof value === 'string') {
            const maskedResult = this.maskValue(value, config);
            if (maskedResult.isFailure()) {
              return maskedResult;
            }
            maskedObj[key] = maskedResult.value;
          } else {
            const maskedResult = this.maskObject(value, depth + 1, maxDepth);
            if (maskedResult.isFailure()) {
              return maskedResult;
            }
            maskedObj[key] = maskedResult.value;
          }
        }
        
        return Result.success(maskedObj);
      }

      return Result.success(obj);
    } catch (error) {
      return Result.failure(new Error(`Object masking failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Masks sensitive data in log messages
   */
  maskLogMessage(message: string): Result<string, Error> {
    try {
      let maskedMessage = message;

      // Mask common patterns in log messages
      const patterns = [
        { pattern: /email[:\s=]+([^\s@]+@[^\s@]+\.[^\s@]+)/gi, replacement: 'email: [MASKED_EMAIL]' },
        { pattern: /password[:\s=]+([^\s]+)/gi, replacement: 'password: [MASKED_PASSWORD]' },
        { pattern: /token[:\s=]+([^\s]+)/gi, replacement: 'token: [MASKED_TOKEN]' },
        { pattern: /key[:\s=]+([^\s]+)/gi, replacement: 'key: [MASKED_KEY]' },
        { pattern: /ssn[:\s=]+(\d{3}-?\d{2}-?\d{4})/gi, replacement: 'ssn: [MASKED_SSN]' },
        { pattern: /phone[:\s=]+([\+]?[1-9][\d\s\-\(\)]{7,15})/gi, replacement: 'phone: [MASKED_PHONE]' },
        { pattern: /(\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4})/g, replacement: '[MASKED_CREDIT_CARD]' }
      ];

      for (const { pattern, replacement } of patterns) {
        maskedMessage = maskedMessage.replace(pattern, replacement);
      }

      return Result.success(maskedMessage);
    } catch (error) {
      return Result.failure(new Error(`Log message masking failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Full masking - replace entire value
   */
  private maskFull(value: string, config: MaskingConfig): string {
    if (config.preserveLength) {
      return config.maskChar.repeat(value.length);
    }
    return '[MASKED]';
  }

  /**
   * Partial masking - show first/last characters
   */
  private maskPartial(value: string, config: MaskingConfig): string {
    const showFirst = config.showFirst || 2;
    const showLast = config.showLast || 2;
    
    if (value.length <= showFirst + showLast) {
      return config.preserveLength ? config.maskChar.repeat(value.length) : '[MASKED]';
    }

    const first = value.substring(0, showFirst);
    const last = value.substring(value.length - showLast);
    const middleLength = config.preserveLength ? value.length - showFirst - showLast : 4;
    const middle = config.maskChar.repeat(middleLength);

    return `${first}${middle}${last}`;
  }

  /**
   * Email masking - mask username, keep domain
   */
  private maskEmail(value: string, config: MaskingConfig): string {
    const emailMatch = value.match(/^([^@]+)@(.+)$/);
    if (!emailMatch) {
      return this.maskPartial(value, config);
    }

    const [, username, domain] = emailMatch;
    const maskedUsername = username.length > 2 
      ? username[0] + config.maskChar.repeat(username.length - 2) + username[username.length - 1]
      : config.maskChar.repeat(username.length);

    return `${maskedUsername}@${domain}`;
  }

  /**
   * Phone number masking
   */
  private maskPhone(value: string, config: MaskingConfig): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 7) {
      return this.maskPartial(value, config);
    }

    // Show last 4 digits for phone numbers
    const masked = config.maskChar.repeat(digits.length - 4) + digits.slice(-4);
    return value.replace(/\d/g, (digit, index) => {
      const digitIndex = value.substring(0, index + 1).replace(/\D/g, '').length - 1;
      return masked[digitIndex] || digit;
    });
  }

  /**
   * Credit card masking - show last 4 digits
   */
  private maskCreditCard(value: string, config: MaskingConfig): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 13) {
      return this.maskPartial(value, config);
    }

    const masked = config.maskChar.repeat(digits.length - 4) + digits.slice(-4);
    return value.replace(/\d/g, (digit, index) => {
      const digitIndex = value.substring(0, index + 1).replace(/\D/g, '').length - 1;
      return masked[digitIndex] || digit;
    });
  }

  /**
   * SSN masking - show last 4 digits
   */
  private maskSSN(value: string, config: MaskingConfig): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 9) {
      return this.maskPartial(value, config);
    }

    return `${config.maskChar.repeat(3)}-${config.maskChar.repeat(2)}-${digits.slice(-4)}`;
  }

  /**
   * Detects PII type based on value pattern
   */
  private detectPIIType(value: string): string | null {
    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
      if (pattern.test(value)) {
        return type;
      }
    }
    return null;
  }

  /**
   * Checks if a field name indicates PII
   */
  private isPIIField(fieldName: string): boolean {
    return PII_FIELD_NAMES.some(piiField => 
      fieldName.includes(piiField) || piiField.includes(fieldName)
    );
  }

  /**
   * Gets appropriate masking config for PII field
   */
  private getConfigForPIIField(fieldName: string): MaskingConfig {
    if (fieldName.includes('email')) return DEFAULT_MASKING_CONFIGS.email;
    if (fieldName.includes('phone') || fieldName.includes('mobile')) return DEFAULT_MASKING_CONFIGS.phone;
    if (fieldName.includes('ssn') || fieldName.includes('social')) return DEFAULT_MASKING_CONFIGS.ssn;
    if (fieldName.includes('credit') || fieldName.includes('card')) return DEFAULT_MASKING_CONFIGS.creditCard;
    if (fieldName.includes('password') || fieldName.includes('token')) return DEFAULT_MASKING_CONFIGS.password;
    if (fieldName.includes('name')) return DEFAULT_MASKING_CONFIGS.name;
    if (fieldName.includes('address')) return DEFAULT_MASKING_CONFIGS.address;
    
    return DEFAULT_MASKING_CONFIGS.default;
  }
}

/**
 * Utility functions for data masking
 */
export class MaskingUtils {
  private static defaultMasker = new DataMasker(true);

  /**
   * Masks sensitive data in any value (string, object, array)
   */
  static maskSensitiveData(data: any): Result<any, Error> {
    return MaskingUtils.defaultMasker.maskObject(data);
  }

  /**
   * Masks sensitive data in log messages
   */
  static maskLogMessage(message: string): Result<string, Error> {
    return MaskingUtils.defaultMasker.maskLogMessage(message);
  }

  /**
   * Creates a custom masker with specific configurations
   */
  static createCustomMasker(configs: Record<string, MaskingConfig>): DataMasker {
    const masker = new DataMasker(true);
    
    for (const [fieldName, config] of Object.entries(configs)) {
      masker.addCustomConfig(fieldName, config);
    }
    
    return masker;
  }

  /**
   * Masks a specific field with a given strategy
   */
  static maskField(value: string, strategy: MaskingStrategy, options?: Partial<MaskingConfig>): Result<string, Error> {
    const config: MaskingConfig = {
      strategy,
      maskChar: '*',
      preserveLength: true,
      ...options
    };

    return MaskingUtils.defaultMasker.maskValue(value, config);
  }

  /**
   * Safely logs an object with PII masking
   */
  static safeLog(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void {
    const maskedMessageResult = MaskingUtils.maskLogMessage(message);
    const maskedMessage = maskedMessageResult.isSuccess() ? maskedMessageResult.value : message;

    if (data) {
      const maskedDataResult = MaskingUtils.maskSensitiveData(data);
      const maskedData = maskedDataResult.isSuccess() ? maskedDataResult.value : '[MASKING_ERROR]';
      
      console[level](maskedMessage, maskedData);
    } else {
      console[level](maskedMessage);
    }
  }
}