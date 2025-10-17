# LegalOps v1 - Smart Forms Implementation Guide

## 🎯 Overview

This guide explains how to implement the **Smart Forms System** that:
- ✅ Captures client data once and reuses it everywhere
- ✅ Auto-populates forms for returning clients
- ✅ Minimizes data entry and eliminates duplication
- ✅ Maps our data to government forms (Sunbiz, IRS, etc.)

---

## 📋 What We've Built So Far

### 1. **Database Schema** ✅
- **File**: `prisma/schema-v2.prisma`
- **Purpose**: Normalized database structure that eliminates data duplication
- **Key Features**:
  - Separate User (login) and Client (business owner) entities
  - Reusable Address system (one address, many uses)
  - Flexible Filing system (supports all filing types)
  - Proper relationships between all entities

### 2. **TypeScript Type Definitions** ✅
- **File**: `src/types/entities.ts`
- **Purpose**: Type-safe interfaces for all database entities
- **Key Features**:
  - Enums for all status types
  - Interfaces matching Prisma schema
  - Extended interfaces with relationships

### 3. **Form Data Types** ✅
- **File**: `src/types/forms.ts`
- **Purpose**: Define structure of data collected from user forms
- **Key Features**:
  - LLC Formation form data
  - Corporation Formation form data
  - Annual Report form data
  - EIN Application form data
  - Amendment and Dissolution forms

### 4. **Form-to-Database Mappers** ✅
- **File**: `src/lib/mappers/form-to-database.ts`
- **Purpose**: Transform user form data into database records
- **Key Features**:
  - `mapLLCFormationToDatabase()` - Creates all necessary DB records
  - `mapCorporationFormationToDatabase()` - Corporation-specific mapping
  - `mapAnnualReportToDatabase()` - Annual report mapping
  - Address mapping helpers

### 5. **Database-to-Sunbiz Mappers** ✅
- **File**: `src/lib/mappers/database-to-sunbiz.ts`
- **Purpose**: Transform our database data into Sunbiz form formats
- **Key Features**:
  - `mapDatabaseToSunbizLLC()` - LLC formation format
  - `mapDatabaseToSunbizCorporation()` - Corporation formation format
  - `mapDatabaseToSunbizAnnualReport()` - Annual report format

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SMART FORM (React)                         │
│  - Detects new vs returning client                             │
│  - Auto-populates known data                                   │
│  - Only asks for new/changed information                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FORM DATA (TypeScript)                        │
│  Type: LLCFormationFormData                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              FORM-TO-DATABASE MAPPER                            │
│  Function: mapLLCFormationToDatabase()                         │
│  Creates: BusinessEntity, Addresses, Agent, Managers, Filing   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                        │
│  - Stores normalized data                                      │
│  - Maintains relationships                                     │
│  - Enables data reuse                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE-TO-SUNBIZ MAPPER                          │
│  Function: mapDatabaseToSunbizLLC()                            │
│  Creates: SunbizLLCFormationData                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI FILING AGENT                              │
│  - Navigates to Sunbiz website                                 │
│  - Fills out government form                                   │
│  - Submits filing                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Next Steps: Building the Smart Forms

### Step 1: Set Up Prisma with New Schema

```bash
# 1. Backup current schema
cp prisma/schema.prisma prisma/schema-old.prisma

# 2. Replace with new schema
cp prisma/schema-v2.prisma prisma/schema.prisma

# 3. Generate Prisma Client
npx prisma generate

# 4. Create migration
npx prisma migrate dev --name initial_smart_forms_schema

# 5. Push to database
npx prisma db push
```

### Step 2: Create API Routes

Create the following API routes:

#### **POST /api/filings/llc** - Create LLC Formation
```typescript
// app/api/filings/llc/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mapLLCFormationToDatabase } from '@/lib/mappers/form-to-database';
import { LLCFormationFormData } from '@/types/forms';

export async function POST(request: NextRequest) {
  const formData: LLCFormationFormData = await request.json();
  
  // Get current user/client
  const userId = 'user_123'; // From session
  const clientId = 'client_123'; // From session or create new
  
  // Generate IDs
  const businessEntityId = generateId();
  const registeredAgentId = generateId();
  
  // Map form data to database records
  const dbRecords = mapLLCFormationToDatabase(
    formData,
    clientId,
    businessEntityId,
    registeredAgentId
  );
  
  // Create all records in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create business entity
    const businessEntity = await tx.businessEntity.create({
      data: { id: businessEntityId, ...dbRecords.businessEntity },
    });
    
    // Create addresses
    for (const address of dbRecords.addresses) {
      await tx.address.create({ data: address });
    }
    
    // Create registered agent
    const agent = await tx.registeredAgent.create({
      data: { id: registeredAgentId, ...dbRecords.registeredAgent },
    });
    
    // Create managers
    for (const manager of dbRecords.managers) {
      await tx.managerOfficer.create({ data: manager });
    }
    
    // Create filing
    const filing = await tx.filing.create({
      data: dbRecords.filing,
    });
    
    return { businessEntity, agent, filing };
  });
  
  return NextResponse.json(result);
}
```

#### **GET /api/clients/:clientId/entities** - Get Client's Entities
```typescript
// app/api/clients/[clientId]/entities/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const entities = await prisma.businessEntity.findMany({
    where: { clientId: params.clientId },
    include: {
      addresses: true,
      registeredAgent: true,
      managersOfficers: true,
      filings: true,
    },
  });
  
  return NextResponse.json(entities);
}
```

#### **GET /api/clients/:clientId/prefill** - Get Prefill Data
```typescript
// app/api/clients/[clientId]/prefill/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const client = await prisma.client.findUnique({
    where: { id: params.clientId },
    include: {
      addresses: true,
      businessEntities: {
        include: {
          registeredAgent: true,
          managersOfficers: true,
        },
      },
    },
  });
  
  // Return data that can be used to prefill forms
  return NextResponse.json({
    personalInfo: {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
    },
    personalAddress: client.addresses.find(a => a.addressType === 'PERSONAL'),
    previousAgents: client.businessEntities.map(e => e.registeredAgent),
    previousManagers: client.businessEntities.flatMap(e => e.managersOfficers),
  });
}
```

### Step 3: Create Smart Form Components

#### **LLC Formation Form Component**
```typescript
// app/components/forms/LLCFormationForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { LLCFormationFormData } from '@/types/forms';

export function LLCFormationForm({ clientId }: { clientId: string }) {
  const [formData, setFormData] = useState<LLCFormationFormData>({
    // ... initial state
  });
  
  const [prefillData, setPrefillData] = useState(null);
  
  // Load prefill data for returning clients
  useEffect(() => {
    async function loadPrefillData() {
      const response = await fetch(`/api/clients/${clientId}/prefill`);
      const data = await response.json();
      setPrefillData(data);
      
      // Auto-populate form with known data
      setFormData(prev => ({
        ...prev,
        // Use client's personal info
        correspondenceEmail: data.personalInfo.email,
        // Offer to reuse previous agent
        registeredAgentOption: data.previousAgents.length > 0 ? 'EXISTING' : 'NEW',
      }));
    }
    
    loadPrefillData();
  }, [clientId]);
  
  return (
    <form>
      {/* Business Name */}
      <input
        type="text"
        value={formData.businessName}
        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
        placeholder="Business Name"
      />
      
      {/* Mailing Address Options */}
      <div>
        <label>
          <input
            type="radio"
            checked={formData.mailingAddressOption === 'SAME_AS_PERSONAL'}
            onChange={() => setFormData({ ...formData, mailingAddressOption: 'SAME_AS_PERSONAL' })}
          />
          Use my personal address ({prefillData?.personalAddress?.street})
        </label>
        
        <label>
          <input
            type="radio"
            checked={formData.mailingAddressOption === 'SAME_AS_PRINCIPAL'}
            onChange={() => setFormData({ ...formData, mailingAddressOption: 'SAME_AS_PRINCIPAL' })}
          />
          Same as principal address
        </label>
        
        <label>
          <input
            type="radio"
            checked={formData.mailingAddressOption === 'DIFFERENT'}
            onChange={() => setFormData({ ...formData, mailingAddressOption: 'DIFFERENT' })}
          />
          Use different address
        </label>
      </div>
      
      {/* Registered Agent Options */}
      {prefillData?.previousAgents?.length > 0 && (
        <div>
          <label>
            <input
              type="radio"
              checked={formData.registeredAgentOption === 'EXISTING'}
              onChange={() => setFormData({ ...formData, registeredAgentOption: 'EXISTING' })}
            />
            Use same agent as previous business
          </label>
          
          <select
            value={formData.existingAgentId}
            onChange={(e) => setFormData({ ...formData, existingAgentId: e.target.value })}
          >
            {prefillData.previousAgents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.firstName} {agent.lastName} - {agent.address}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Submit */}
      <button type="submit">Submit LLC Formation</button>
    </form>
  );
}
```

### Step 4: Integrate with AI Filing Agent

Update the AI agent to use our mapped data:

```typescript
// scripts/file-llc-formation.ts
import { prisma } from '@/lib/prisma';
import { mapDatabaseToSunbizLLC } from '@/lib/mappers/database-to-sunbiz';
import { SunbizFilingAgent } from '@/lib/sunbiz-agent';

async function fileLLCFormation(filingId: string) {
  // 1. Get filing from database with all relationships
  const filing = await prisma.filing.findUnique({
    where: { id: filingId },
    include: {
      businessEntity: {
        include: {
          addresses: true,
          registeredAgent: true,
          managersOfficers: true,
        },
      },
    },
  });
  
  // 2. Map to Sunbiz format
  const sunbizData = mapDatabaseToSunbizLLC(
    filing.businessEntity,
    filing
  );
  
  // 3. Use AI agent to file
  const agent = new SunbizFilingAgent();
  const result = await agent.fillLLCFormation(sunbizData);
  
  // 4. Update filing status
  await prisma.filing.update({
    where: { id: filingId },
    data: {
      filingStatus: result.success ? 'SUBMITTED' : 'DRAFT',
      confirmationNumber: result.confirmationNumber,
      submittedAt: new Date(),
    },
  });
  
  return result;
}
```

---

## 📊 Benefits Summary

### For New Clients:
- ✅ Fill out complete form once
- ✅ Data stored for future use
- ✅ Faster subsequent filings

### For Returning Clients:
- ✅ Most data auto-populated
- ✅ Only enter new/changed information
- ✅ Reuse addresses, agents, managers
- ✅ 80% less data entry

### For Your Business:
- ✅ Better data quality (less duplication)
- ✅ Easier to maintain and update
- ✅ Support multiple filing types easily
- ✅ Scale to thousands of clients

---

## 🎯 Next Implementation Tasks

1. **Set up new Prisma schema** (30 min)
2. **Create API routes** (2-3 hours)
3. **Build smart form components** (4-6 hours)
4. **Integrate with AI agent** (1-2 hours)
5. **Test with real data** (2-3 hours)

**Total Estimated Time**: 10-15 hours

---

## 📚 Related Files

- Database Schema: `prisma/schema-v2.prisma`
- Entity Types: `src/types/entities.ts`
- Form Types: `src/types/forms.ts`
- Form Mappers: `src/lib/mappers/form-to-database.ts`
- Sunbiz Mappers: `src/lib/mappers/database-to-sunbiz.ts`
- Architecture Doc: `docs/DATA_ARCHITECTURE.md`

