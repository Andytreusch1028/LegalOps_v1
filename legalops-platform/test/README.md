# Property-Based Testing Infrastructure

This directory contains utilities and generators for property-based testing (PBT) using [fast-check](https://github.com/dubzzz/fast-check).

## What is Property-Based Testing?

Property-based testing is a testing approach where you define properties (invariants) that should hold true for all valid inputs, and the testing framework generates hundreds of random test cases to verify those properties.

Instead of writing:
```typescript
test('validates email', () => {
  expect(validateEmail('user@example.com')).toBe(true);
  expect(validateEmail('invalid')).toBe(false);
});
```

You write:
```typescript
test('validates all valid emails', () => {
  fc.assert(
    fc.property(emailArbitrary, (email) => {
      expect(validateEmail(email)).toBe(true);
    }),
    { numRuns: 100 }
  );
});
```

The framework generates 100 different valid emails and tests them all automatically.

## Directory Structure

```
test/
├── README.md                 # This file
└── utils/
    └── generators.ts         # Fast-check arbitraries for domain types
```

## Available Generators

### Identity Types
- `userIdArbitrary` - Generates valid UserId values (CUID format)
- `orderIdArbitrary` - Generates valid OrderId values (CUID format)
- `entityIdArbitrary` - Generates valid EntityId values (CUID format)
- `filingIdArbitrary` - Generates valid FilingId values (CUID format)
- `emailArbitrary` - Generates valid Email addresses

### Validation Types
- `zipCodeArbitrary` - Generates valid US ZIP codes (5 or 9 digit)
- `phoneArbitrary` - Generates valid US phone numbers
- `ssnArbitrary` - Generates valid SSN format (not real SSNs)
- `einArbitrary` - Generates valid EIN format (not real EINs)
- `stateCodeArbitrary` - Generates valid US state codes
- `documentNumberArbitrary` - Generates valid Florida document numbers

### Address Types
- `streetAddressArbitrary` - Generates valid street addresses
- `cityArbitrary` - Generates valid city names (Florida cities)
- `addressArbitrary` - Generates complete US addresses

### Business Types
- `businessNameArbitrary` - Generates valid business names
- `dbaNameArbitrary` - Generates valid DBA (fictitious) names
- `passwordArbitrary` - Generates valid passwords meeting security requirements
- `urlArbitrary` - Generates valid HTTP/HTTPS URLs
- `dateStringArbitrary` - Generates valid ISO 8601 date strings

### Domain Types
- `customerDataArbitrary` - Generates customer data for risk assessment
- `orderDataArbitrary` - Generates order data for testing

### Edge Case Generators
- `boundaryValueArbitrary` - Generates boundary values (empty strings, max values, etc.)
- `invalidInputArbitrary` - Generates invalid inputs for negative testing

## Usage Examples

### Basic Property Test

```typescript
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { emailArbitrary } from '@test/utils/generators';
import { validateEmail } from '@/lib/validation';

describe('Email Validation', () => {
  it('should accept all valid emails', () => {
    fc.assert(
      fc.property(emailArbitrary, (email) => {
        expect(validateEmail(email)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
```

### Testing with Multiple Inputs

```typescript
import fc from 'fast-check';
import { userIdArbitrary, orderIdArbitrary } from '@test/utils/generators';

it('should create orders for any valid user and order ID', () => {
  fc.assert(
    fc.property(
      userIdArbitrary,
      orderIdArbitrary,
      async (userId, orderId) => {
        const result = await createOrder(userId, orderId);
        expect(result.success).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Testing Invariants

```typescript
import fc from 'fast-check';
import { customerDataArbitrary, orderDataArbitrary } from '@test/utils/generators';

it('should always return risk scores between 0 and 100', () => {
  fc.assert(
    fc.property(
      customerDataArbitrary,
      orderDataArbitrary,
      async (customer, order) => {
        const result = await assessRisk(customer, order);
        
        // Invariant: risk score must be in valid range
        expect(result.riskScore).toBeGreaterThanOrEqual(0);
        expect(result.riskScore).toBeLessThanOrEqual(100);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Testing Round-Trip Properties

```typescript
import fc from 'fast-check';
import { businessNameArbitrary } from '@test/utils/generators';

it('should preserve data through serialization round-trip', () => {
  fc.assert(
    fc.property(businessNameArbitrary, (name) => {
      const serialized = serialize(name);
      const deserialized = deserialize(serialized);
      
      // Round-trip property: deserialize(serialize(x)) === x
      expect(deserialized).toBe(name);
    }),
    { numRuns: 100 }
  );
});
```

### Testing Error Handling

```typescript
import fc from 'fast-check';
import { invalidInputArbitrary } from '@test/utils/generators';

it('should handle all invalid inputs gracefully', () => {
  fc.assert(
    fc.property(invalidInputArbitrary, (invalidInput) => {
      // Should not throw, should return error result
      expect(() => {
        const result = validateInput(invalidInput);
        expect(result.success).toBe(false);
      }).not.toThrow();
    }),
    { numRuns: 100 }
  );
});
```

## Configuration

Property-based tests are configured in `vitest.config.ts`:

- **Test Timeout**: 30 seconds (property tests run many iterations)
- **Number of Runs**: 100 iterations per property (configurable per test)
- **Aliases**: `@test` alias points to the test directory

## Best Practices

### 1. Tag Your Property Tests

Always include a comment linking the test to the design document:

```typescript
/**
 * Feature: code-quality-improvements, Property 9: Validation Boundary Cases
 * 
 * Property: For any validation function, inputs at boundary values should be
 * correctly classified as valid or invalid according to the validation rules.
 * 
 * Validates: Requirements 4.2
 */
describe('Property 9: Validation Boundary Cases', () => {
  // ... tests
});
```

### 2. Use Appropriate Number of Runs

- **Fast tests**: 100 runs (default)
- **Slow tests**: 50 runs
- **Very slow tests**: 20 runs
- **Critical properties**: 1000+ runs

```typescript
fc.assert(
  fc.property(/* ... */),
  { numRuns: 1000 } // More thorough testing
);
```

### 3. Filter Invalid Inputs

When generating inputs, filter out invalid cases:

```typescript
const validZipCodeArbitrary = fc.string()
  .filter(s => /^\d{5}(-\d{4})?$/.test(s));
```

### 4. Test Both Positive and Negative Cases

```typescript
// Positive: valid inputs should pass
fc.assert(fc.property(validInputArbitrary, (input) => {
  expect(validate(input)).toBe(true);
}));

// Negative: invalid inputs should fail
fc.assert(fc.property(invalidInputArbitrary, (input) => {
  expect(validate(input)).toBe(false);
}));
```

### 5. Test Invariants, Not Implementation

Focus on properties that should always hold true:

✅ Good:
```typescript
// Property: sorting should preserve all elements
fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
  const sorted = sort(arr);
  expect(sorted.length).toBe(arr.length);
  expect(new Set(sorted)).toEqual(new Set(arr));
}));
```

❌ Bad:
```typescript
// Testing implementation details
fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
  const sorted = sort(arr);
  expect(sorted).toEqual(arr.sort()); // Assumes specific algorithm
}));
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run only property tests
npm test -- validation.test.ts
```

## Debugging Failed Property Tests

When a property test fails, fast-check will show you the counterexample:

```
Property failed after 42 tests
{ seed: 1234567890, path: "42", endOnFailure: true }
Counterexample: ["invalid@"]
```

To reproduce the failure:

```typescript
fc.assert(
  fc.property(emailArbitrary, (email) => {
    expect(validateEmail(email)).toBe(true);
  }),
  { 
    seed: 1234567890,  // Use the seed from the failure
    path: "42"         // Use the path from the failure
  }
);
```

## Adding New Generators

When adding new generators to `generators.ts`:

1. **Document the generator** with JSDoc comments
2. **Use appropriate constraints** (min/max length, valid ranges)
3. **Filter invalid values** using `.filter()`
4. **Export the generator** for use in tests
5. **Add usage examples** to this README

Example:

```typescript
/**
 * Generates valid credit card numbers (Luhn algorithm compliant).
 * Note: These are test numbers, not real credit cards.
 */
export const creditCardArbitrary = fc.integer({ min: 1000000000000000, max: 9999999999999999 })
  .map(n => n.toString())
  .filter(isValidLuhn);
```

## Resources

- [fast-check Documentation](https://github.com/dubzzz/fast-check/tree/main/documentation)
- [Property-Based Testing Guide](https://github.com/dubzzz/fast-check/blob/main/documentation/1-Guides/PropertyBasedTesting.md)
- [Vitest Documentation](https://vitest.dev/)
- [Design Document](../.kiro/specs/code-quality-improvements/design.md)

