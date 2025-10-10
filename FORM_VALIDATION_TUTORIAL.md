# Form Validation Tutorial for VBA Developers

## Overview for VBA Background
Think of form validation like VBA's input validation, but much more powerful. Instead of `If IsNumeric(txtAge.Value)`, you get automatic validation with TypeScript types, custom error messages, and real-time feedback. It's like having a super-smart data validation system built into every form.

---

## Why Form Validation is Critical for Legal Operations

### Business Impact:
- **Legal Compliance:** Prevent invalid LLC formations that could be rejected by the state
- **Data Quality:** Ensure customer information is accurate for legal documents
- **User Experience:** Guide users to provide correct information the first time
- **Cost Savings:** Avoid reprocessing fees from state rejections

### Legal Requirements:
- **Accurate Entity Names:** Must meet Florida naming requirements
- **Valid Addresses:** Required for registered agent services
- **Proper Data Types:** SSN, EIN, phone numbers in correct formats
- **Required Fields:** All mandatory information for state filings

---

## Step 1: Install Form Validation Tools (5 minutes)

### Install React Hook Form + Zod
```bash
npm install react-hook-form zod @hookform/resolvers
npm install @types/react-hook-form --save-dev
```

### Why These Tools?
- **React Hook Form:** Handles form state and submission (like VBA form controls)
- **Zod:** Defines validation rules with TypeScript types (like VBA data validation)
- **@hookform/resolvers:** Connects the two together

---

## Step 2: Basic Form Validation Setup (20 minutes)

### Create Validation Schema (lib/validations.ts)
```typescript
import { z } from 'zod';

// VBA Connection: Like defining data types and validation rules
export const userRegistrationSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be in format (123) 456-7890'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
});

export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;
```

### Basic Form Component
```typescript
// components/UserRegistrationForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userRegistrationSchema, UserRegistrationData } from '../lib/validations';

export default function UserRegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserRegistrationData>({
    resolver: zodResolver(userRegistrationSchema),
  });

  const onSubmit = async (data: UserRegistrationData) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Registration successful!');
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">First Name</label>
        <input
          {...register('firstName')}
          className={`w-full border rounded px-3 py-2 ${
            errors.firstName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          {...register('email')}
          className={`w-full border rounded px-3 py-2 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

---

## Step 3: Legal-Specific Validations (45 minutes)

### Florida LLC Formation Validation
```typescript
// lib/validations/llc.ts
import { z } from 'zod';

export const floridaLLCSchema = z.object({
  // Entity Name Validation (Florida-specific rules)
  entityName: z.string()
    .min(1, 'Entity name is required')
    .max(120, 'Entity name cannot exceed 120 characters')
    .refine(
      (name) => name.toLowerCase().includes('llc') || name.toLowerCase().includes('limited liability company'),
      'Entity name must include "LLC" or "Limited Liability Company"'
    )
    .refine(
      (name) => !['corporation', 'corp', 'inc', 'incorporated'].some(word => 
        name.toLowerCase().includes(word)
      ),
      'LLC name cannot contain corporation terms'
    ),

  // Principal Address (Required by Florida)
  principalAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.literal('FL', { errorMap: () => ({ message: 'Must be Florida address' }) }),
    zipCode: z.string()
      .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789'),
  }),

  // Registered Agent Information
  registeredAgent: z.object({
    name: z.string().min(1, 'Registered agent name is required'),
    address: z.object({
      street: z.string().min(1, 'RA street address is required'),
      city: z.string().min(1, 'RA city is required'),
      state: z.literal('FL', { errorMap: () => ({ message: 'RA must have Florida address' }) }),
      zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    }),
  }),

  // Organizer Information
  organizer: z.object({
    name: z.string().min(1, 'Organizer name is required'),
    address: z.object({
      street: z.string().min(1, 'Organizer street address is required'),
      city: z.string().min(1, 'Organizer city is required'),
      state: z.string().min(2, 'State is required').max(2, 'Use 2-letter state code'),
      zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    }),
  }),

  // Business Purpose
  businessPurpose: z.string()
    .min(10, 'Business purpose must be at least 10 characters')
    .max(500, 'Business purpose cannot exceed 500 characters'),

  // Management Structure
  managementStructure: z.enum(['member-managed', 'manager-managed'], {
    errorMap: () => ({ message: 'Please select management structure' }),
  }),

  // EIN (if applicable)
  ein: z.string()
    .optional()
    .refine(
      (ein) => !ein || /^\d{2}-\d{7}$/.test(ein),
      'EIN must be in format 12-3456789'
    ),
});

export type FloridaLLCData = z.infer<typeof floridaLLCSchema>;
```

### Payment Information Validation
```typescript
// lib/validations/payment.ts
import { z } from 'zod';

export const paymentSchema = z.object({
  // Service Selection
  service: z.enum(['llc_formation', 'corporation_formation', 'registered_agent'], {
    errorMap: () => ({ message: 'Please select a service' }),
  }),

  // Billing Information
  billingInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string()
      .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be (123) 456-7890 format'),
    
    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(2, 'State is required').max(2, 'Use 2-letter state code'),
      zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    }),
  }),

  // Payment Method (validated on frontend, processed by Stripe)
  paymentMethod: z.object({
    type: z.literal('card'),
    // Note: Never validate actual card details on frontend
    // Stripe handles PCI compliance
  }),

  // Terms and Conditions
  agreeToTerms: z.boolean().refine(
    (agreed) => agreed === true,
    'You must agree to the terms and conditions'
  ),

  // UPL Compliance Acknowledgment
  uplAcknowledgment: z.boolean().refine(
    (acknowledged) => acknowledged === true,
    'You must acknowledge the legal disclaimers'
  ),
});

export type PaymentData = z.infer<typeof paymentSchema>;
```

---

## Step 4: Advanced Form Components (30 minutes)

### Reusable Form Input Component
```typescript
// components/FormInput.tsx
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  placeholder?: string;
  required?: boolean;
}

export default function FormInput({
  label,
  name,
  type = 'text',
  register,
  error,
  placeholder,
  required = false,
}: FormInputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:border-blue-500'
        }`}
      />
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error.message}
        </p>
      )}
    </div>
  );
}
```

### Address Input Component
```typescript
// components/AddressInput.tsx
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import FormInput from './FormInput';

interface AddressInputProps {
  prefix: string; // e.g., 'principalAddress', 'registeredAgent.address'
  register: UseFormRegister<any>;
  errors: FieldErrors;
  label: string;
  requireFloridaOnly?: boolean;
}

export default function AddressInput({
  prefix,
  register,
  errors,
  label,
  requireFloridaOnly = false,
}: AddressInputProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{label}</h3>
      
      <FormInput
        label="Street Address"
        name={`${prefix}.street`}
        register={register}
        error={errors[prefix]?.street}
        required
      />
      
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="City"
          name={`${prefix}.city`}
          register={register}
          error={errors[prefix]?.city}
          required
        />
        
        {requireFloridaOnly ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              value="FL"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
            <input type="hidden" {...register(`${prefix}.state`)} value="FL" />
          </div>
        ) : (
          <FormInput
            label="State"
            name={`${prefix}.state`}
            register={register}
            error={errors[prefix]?.state}
            placeholder="FL"
            required
          />
        )}
      </div>
      
      <FormInput
        label="ZIP Code"
        name={`${prefix}.zipCode`}
        register={register}
        error={errors[prefix]?.zipCode}
        placeholder="12345 or 12345-6789"
        required
      />
    </div>
  );
}
```

---

## Step 5: Server-Side Validation (20 minutes)

### API Route Validation
```typescript
// pages/api/submit-llc-formation.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { floridaLLCSchema } from '../../lib/validations/llc';
import * as Sentry from '@sentry/nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Server-side validation (critical for security)
    const validatedData = floridaLLCSchema.parse(req.body);
    
    // Additional business logic validation
    const nameAvailable = await checkEntityNameAvailability(validatedData.entityName);
    if (!nameAvailable) {
      return res.status(400).json({
        error: 'Entity name is not available',
        field: 'entityName',
      });
    }

    // Process the LLC formation
    const result = await processLLCFormation(validatedData);
    
    // Log successful submission for audit
    await auditLog.create({
      action: 'llc_formation_submitted',
      userId: req.user.id,
      details: {
        entityName: validatedData.entityName,
        submissionId: result.id,
      },
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Validation errors
      Sentry.captureException(error, {
        tags: { section: 'form_validation', form_type: 'llc_formation' },
        extra: { validation_errors: error.errors },
      });

      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    // Other errors
    Sentry.captureException(error);
    res.status(500).json({ error: 'LLC formation submission failed' });
  }
}
```

---

## Step 6: Real-Time Validation Features (25 minutes)

### Entity Name Availability Check
```typescript
// hooks/useEntityNameCheck.ts
import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

export function useEntityNameCheck(entityName: string) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = debounce(async (name: string) => {
    if (!name || name.length < 3) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch('/api/check-entity-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();
      setIsAvailable(result.available);
      
      if (!result.available) {
        setError('This entity name is already taken');
      }
    } catch (error) {
      setError('Unable to check name availability');
    } finally {
      setIsChecking(false);
    }
  }, 500); // Wait 500ms after user stops typing

  useEffect(() => {
    checkAvailability(entityName);
  }, [entityName]);

  return { isChecking, isAvailable, error };
}
```

### Enhanced Entity Name Input
```typescript
// components/EntityNameInput.tsx
import { UseFormRegister, FieldError } from 'react-hook-form';
import { useEntityNameCheck } from '../hooks/useEntityNameCheck';

interface EntityNameInputProps {
  register: UseFormRegister<any>;
  error?: FieldError;
  value: string;
}

export default function EntityNameInput({ register, error, value }: EntityNameInputProps) {
  const { isChecking, isAvailable, error: availabilityError } = useEntityNameCheck(value);

  const getStatusIcon = () => {
    if (isChecking) return '⏳';
    if (isAvailable === true) return '✅';
    if (isAvailable === false) return '❌';
    return '';
  };

  const getStatusMessage = () => {
    if (isChecking) return 'Checking availability...';
    if (isAvailable === true) return 'Name is available!';
    if (availabilityError) return availabilityError;
    return '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Entity Name <span className="text-red-500">*</span>
      </label>
      
      <div className="relative">
        <input
          {...register('entityName')}
          placeholder="Enter your LLC name (must include 'LLC')"
          className={`w-full px-3 py-2 pr-10 border rounded-md ${
            error || availabilityError
              ? 'border-red-500' 
              : isAvailable === true
              ? 'border-green-500'
              : 'border-gray-300'
          }`}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-lg">{getStatusIcon()}</span>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
      
      {getStatusMessage() && (
        <p className={`text-sm ${
          isAvailable === true ? 'text-green-600' : 
          isAvailable === false ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {getStatusMessage()}
        </p>
      )}
    </div>
  );
}
```

---

## Step 7: Testing Form Validation (15 minutes)

### Validation Test Cases
```typescript
// __tests__/validation.test.ts
import { floridaLLCSchema } from '../lib/validations/llc';

describe('Florida LLC Validation', () => {
  test('valid LLC data passes validation', () => {
    const validData = {
      entityName: 'My Business LLC',
      principalAddress: {
        street: '123 Main St',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
      },
      // ... other required fields
    };

    expect(() => floridaLLCSchema.parse(validData)).not.toThrow();
  });

  test('entity name without LLC fails validation', () => {
    const invalidData = {
      entityName: 'My Business', // Missing LLC
      // ... other fields
    };

    expect(() => floridaLLCSchema.parse(invalidData)).toThrow();
  });

  test('non-Florida address fails validation', () => {
    const invalidData = {
      entityName: 'My Business LLC',
      principalAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY', // Should be FL
        zipCode: '10001',
      },
    };

    expect(() => floridaLLCSchema.parse(invalidData)).toThrow();
  });
});
```

---

## VBA Developer Benefits

### Compared to VBA Validation:
```vba
' VBA Validation (manual and error-prone)
If Len(txtEntityName.Value) = 0 Then
    MsgBox "Entity name is required"
    Exit Sub
End If

If InStr(LCase(txtEntityName.Value), "llc") = 0 Then
    MsgBox "Entity name must contain LLC"
    Exit Sub
End If
```

```typescript
// Zod Validation (automatic and type-safe)
const schema = z.object({
  entityName: z.string()
    .min(1, 'Entity name is required')
    .refine(name => name.toLowerCase().includes('llc'), 
            'Entity name must contain LLC')
});
```

### Advantages:
- **Type Safety:** Validation rules match TypeScript types
- **Reusable:** Same schema for frontend and backend
- **Comprehensive:** Complex validation rules in simple syntax
- **User-Friendly:** Real-time feedback with custom error messages
- **Secure:** Server-side validation prevents tampering

---

## Success Criteria

After implementing form validation, you should have:
- [ ] All forms validated with Zod schemas
- [ ] Real-time validation feedback for users
- [ ] Server-side validation for security
- [ ] Legal-specific validation rules (entity names, addresses)
- [ ] Reusable form components
- [ ] Entity name availability checking
- [ ] Comprehensive error handling

**Business Impact:** Prevent invalid legal form submissions, reduce state rejection fees, and ensure accurate customer data for all legal services.
