# DBA (Fictitious Name) Sunbiz Compliance Implementation

**Status:** ✅ Implemented  
**Date:** 2025-11-16  
**Risk Level:** 🟡 Low-Medium (35/100)

---

## Overview

This document describes the implementation of Florida Sunbiz compliance requirements for DBA (Fictitious Name) registrations in the LegalOps platform.

The implementation adds critical missing fields, validation rules, and workflow steps to ensure full compliance with Florida Department of State Division of Corporations requirements.

---

## Florida Sunbiz DBA Requirements

### Filing Rules

1. **Electronic Filing Only** - All DBA registrations are filed electronically with Sunbiz
2. **Advertisement Certification** - Proof of publication is NOT submitted; certification checkbox ONLY
3. **Mandatory Certification** - Certification checkbox is required before filing
4. **Entity Suffix Restrictions** - Name cannot include entity suffixes (LLC, Inc., Corp., etc.) unless registrant is such entity
5. **Multiple Owners Allowed** - Both individual and business entity owners supported
6. **Expiration Date** - Registration expires December 31, 5 years after filing
7. **Electronic Signature** - Required for all filings

### Required Fields

- DBA name (fictitious name)
- Business address (principal address)
- County of registration
- Owner information (name, address)
- Advertisement certification
- Newspaper name and publication date
- Electronic signature
- Correspondence email

---

## Database Schema Changes

### FictitiousName Model (Extended)

**New Fields Added:**

```prisma
// Customer linkage
userId               String?   // Link to customer
orderId              String?   // Link to order

// Federal tax ID
fein                 String?   // Federal Employer ID

// Correspondence
correspondenceEmail  String?   // Customer email

// Advertisement certification
advertisementCertified Boolean  @default(false)
newspaperName          String?
publicationDate        String?

// Electronic signature
signatureName        String?
signatureDate        DateTime?
signatureIp          String?

// Structured addresses (JSON for backwards compatibility)
principalAddressJson Json?
mailingAddressJson   Json?

// Owner data (JSON for backwards compatibility)
ownersData           Json?

// Relationships
user                 User?     @relation(fields: [userId], references: [id])
order                Order?    @relation(fields: [orderId], references: [id])
owners               FictitiousNameOwner[]
```

### FictitiousNameOwner Model (New)

**Purpose:** Store detailed owner information for each DBA registration

```prisma
model FictitiousNameOwner {
  id                    String   @id @default(cuid())
  fictitiousNameId      String
  ownerType             String   // INDIVIDUAL or BUSINESS_ENTITY
  
  // Individual owner fields
  firstName             String?
  middleName            String?
  lastName              String?
  
  // Business entity owner fields
  entityName            String?
  floridaDocumentNumber String?
  fein                  String?
  
  // Address (all owners)
  street                String
  street2               String?
  city                  String
  state                 String   @default("FL")
  zipCode               String
  
  fictitiousName        FictitiousName @relation(fields: [fictitiousNameId], references: [id], onDelete: Cascade)
}
```

---

## Validation Rules

### Entity Suffix Validation

**Rule:** Individual owners CANNOT use entity suffixes. Business entity owners CAN use suffixes ONLY if they match the entity type.

**Implementation:** `src/lib/validators/dba-name-validator.ts`

**Prohibited Suffixes:**
- LLC, L.L.C., Limited Liability Company
- Inc., Incorporated
- Corp., Corporation
- Co., Company
- Ltd., Limited
- LP, Limited Partnership
- LLP, Limited Liability Partnership
- PA, Professional Association
- PLLC, Professional Limited Liability Company

**Examples:**

✅ **Valid:**
- Individual owner: "Sunshine Cleaning Services" (no suffix)
- LLC owner: "Sunshine Cleaning Services LLC" (suffix matches entity type)

❌ **Invalid:**
- Individual owner: "Sunshine Cleaning Services LLC" (individual cannot use LLC suffix)
- LLC owner: "Sunshine Cleaning Services Inc." (suffix doesn't match entity type)

### Expiration Date Calculation

**Rule:** Registration expires December 31, 5 years after filing

**Implementation:** `src/lib/services/dba-service.ts`

```typescript
export function calculateDBAExpiration(filingDate: Date): Date {
  const year = filingDate.getFullYear();
  return new Date(year + 5, 11, 31, 23, 59, 59); // December 31, year + 5
}
```

**Example:**
- Filing Date: March 15, 2024
- Expiration Date: December 31, 2029

---

## Workflow Changes

### Step 1: Fictitious Name + Email

**Added:** Entity suffix validation

- Validates DBA name against owner type
- Shows error if individual uses entity suffix
- Shows error if business entity suffix doesn't match

### Step 5: Review & Submit

**Added:** Electronic signature capture

- Signature name input field (required)
- Signature date/time display
- Certification language
- Validation before submission

---

## API Endpoints

### POST /api/dba/submit

**Purpose:** Create FictitiousName record after payment

**Authentication:** Required (user must be logged in)

**Request Body:**
```json
{
  "orderId": "string",
  "formData": { /* FictitiousNameFormData */ }
}
```

**Response:**
```json
{
  "success": true,
  "fictitiousNameId": "string",
  "documentNumber": "string",
  "expirationDate": "ISO date string"
}
```

**Called By:**
- Stripe webhook on `payment_intent.succeeded`
- Manual submission after order payment

---

## Files Modified

1. `prisma/schema.prisma` - Extended FictitiousName model, added FictitiousNameOwner model
2. `src/lib/validation.ts` - Added DBA name validation schema
3. `src/components/FictitiousNameWizard.tsx` - Added signature capture, entity suffix validation
4. `src/types/forms.ts` - Added signatureName field
5. `src/app/api/stripe/webhook/route.ts` - Added DBA record creation on payment

## New Files Created

1. `src/lib/validators/dba-name-validator.ts` - Entity suffix validation logic
2. `src/lib/services/dba-service.ts` - DBA business logic (expiration, serialization, record creation)
3. `src/app/api/dba/submit/route.ts` - DBA submission endpoint
4. `docs/04-features/DBA_SUNBIZ_COMPLIANCE_IMPLEMENTATION.md` - This documentation

---

## Testing Checklist

- [ ] Run Prisma migration
- [ ] Test entity suffix validation (individual owner)
- [ ] Test entity suffix validation (business entity owner)
- [ ] Test signature capture
- [ ] Test complete DBA workflow (all 5 steps)
- [ ] Test payment and record creation
- [ ] Verify FictitiousName record created in database
- [ ] Verify FictitiousNameOwner records created
- [ ] Verify expiration date calculated correctly
- [ ] Verify signature IP captured

---

## Migration Instructions

See main README for step-by-step migration instructions.

