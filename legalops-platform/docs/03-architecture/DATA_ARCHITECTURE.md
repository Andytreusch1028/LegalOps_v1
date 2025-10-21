# LegalOps v1 - Data Architecture & Design

## 🎯 Design Philosophy

This database schema is designed with three core principles:

1. **Zero Duplication**: Client data is entered once and reused across all filings
2. **Smart Relationships**: Entities are properly normalized and linked
3. **Flexible Filing**: Support for all filing types with a unified structure

---

## 📊 Database Schema Overview

### Core Entity Relationships

```
User (Login Account)
  └── Client (Business Owner/Customer)
       ├── BusinessEntity (LLC, Corp, etc.)
       │    ├── RegisteredAgent
       │    ├── ManagersOfficers
       │    ├── Addresses
       │    └── Filings (LLC Formation, Annual Report, etc.)
       └── Addresses (Personal, Mailing)
```

---

## 🔑 Key Design Decisions

### 1. **User vs Client Separation**

**Why separate?**
- One **User** (login account) can manage multiple **Clients** (business owners)
- Example: An accountant (User) managing 50 business clients (Clients)
- Example: A business owner (User) with 3 different businesses (Clients)

```typescript
// User = Login credentials
User {
  email: "john@example.com"
  password: "hashed"
}

// Client = Actual business owner
Client {
  userId: "user_123"
  firstName: "John"
  lastName: "Doe"
  clientType: "RETURNING"
}
```

### 2. **Reusable Address System**

**Problem**: Addresses appear everywhere (client, business, agent)

**Solution**: One `Address` table that can belong to multiple entities

```typescript
Address {
  id: "addr_123"
  street: "123 Main St"
  city: "Miami"
  state: "FL"
  zipCode: "33101"
  addressType: "PRINCIPAL"
  
  // Can belong to:
  clientId: "client_123"        // OR
  businessEntityId: "biz_456"   // OR
  registeredAgentId: "agent_789"
}
```

**Benefits**:
- ✅ Enter address once, use everywhere
- ✅ Update in one place, reflects everywhere
- ✅ No duplicate data

### 3. **Flexible Filing System**

**Problem**: Different filing types have different fields

**Solution**: Generic `Filing` table with JSON `filingData` field

```typescript
Filing {
  id: "filing_123"
  businessEntityId: "biz_456"
  filingType: "LLC_FORMATION"
  filingStatus: "SUBMITTED"
  
  // All form-specific data stored as JSON
  filingData: {
    businessName: "Test LLC",
    effectiveDate: "2024-01-01",
    managementStructure: "MEMBER_MANAGED",
    // ... any other LLC-specific fields
  }
}
```

**Benefits**:
- ✅ Support any filing type without schema changes
- ✅ Easy to add new filing types
- ✅ Flexible for state-specific requirements

---

## 🔄 Data Flow: New vs Returning Clients

### Scenario 1: **First-Time Client** (LLC Formation)

```
Step 1: Create User Account
  └── User created with email/password

Step 2: Create Client Profile
  └── Client created with personal info
  └── Personal Address created

Step 3: Create Business Entity
  └── BusinessEntity created (LLC)
  └── Principal Address created
  └── Mailing Address created (or reuse personal)

Step 4: Add Registered Agent
  └── RegisteredAgent created
  └── Agent Address created

Step 5: Add Managers
  └── ManagerOfficer records created

Step 6: Create Filing
  └── Filing created with type "LLC_FORMATION"
  └── All data stored in filingData JSON
```

**Total Data Entry**: Full information required

---

### Scenario 2: **Returning Client** (Annual Report for existing LLC)

```
Step 1: Login
  └── User already exists ✅

Step 2: Select Existing Business
  └── Client already exists ✅
  └── BusinessEntity already exists ✅
  └── Addresses already exist ✅
  └── RegisteredAgent already exists ✅
  └── Managers already exist ✅

Step 3: Create New Filing
  └── Filing created with type "ANNUAL_REPORT"
  └── Auto-populate from existing BusinessEntity data
  └── Only ask for changes/updates
```

**Total Data Entry**: Only new/changed information! 🎉

---

### Scenario 3: **Returning Client** (New LLC Formation)

```
Step 1: Login
  └── User already exists ✅
  └── Client already exists ✅
  └── Personal Address already exists ✅

Step 2: Create New Business Entity
  └── New BusinessEntity created
  └── Reuse Client's personal address as mailing? ✅
  └── New principal address (if different)

Step 3: Reuse or Create Registered Agent
  └── Use same RA as previous business? ✅
  └── Or create new RA

Step 4: Create Filing
  └── Filing created with type "LLC_FORMATION"
```

**Total Data Entry**: Minimal! Reuse most data from previous filings.

---

## 🎨 Smart Form Design Strategy

### Form Intelligence Levels

#### Level 1: **New Client Form** (Full Data Entry)
```
┌─────────────────────────────────────┐
│ New LLC Formation                   │
├─────────────────────────────────────┤
│ Your Information:                   │
│ ☐ First Name: [________]            │
│ ☐ Last Name:  [________]            │
│ ☐ Email:      [________]            │
│ ☐ Phone:      [________]            │
│                                     │
│ Business Information:               │
│ ☐ Business Name: [________]         │
│ ☐ Principal Address: [________]     │
│ ☐ Mailing Address:                  │
│   ☑ Same as principal               │
│   ☐ Different: [________]           │
│                                     │
│ Registered Agent:                   │
│ ☐ Agent Name: [________]            │
│ ☐ Agent Address: [________]         │
│                                     │
│ Managers:                           │
│ ☐ Manager 1: [________]             │
│ ☐ + Add Another Manager             │
└─────────────────────────────────────┘
```

#### Level 2: **Returning Client Form** (Smart Auto-Fill)
```
┌─────────────────────────────────────┐
│ New LLC Formation                   │
├─────────────────────────────────────┤
│ Welcome back, John Doe! ✅          │
│                                     │
│ Your Information: ✅ (Auto-filled)  │
│ ✓ John Doe                          │
│ ✓ john@example.com                  │
│ ✓ (305) 555-1234                    │
│                                     │
│ Business Information:               │
│ ☐ Business Name: [________]         │
│ ☐ Principal Address: [________]     │
│                                     │
│ Mailing Address:                    │
│ ☑ Use my personal address ✅        │
│   (123 Main St, Miami, FL 33101)    │
│ ☐ Use different address             │
│                                     │
│ Registered Agent:                   │
│ ☑ Use same agent as "ABC LLC" ✅    │
│   (John Doe, 123 Main St...)        │
│ ☐ Use different agent               │
│                                     │
│ Managers:                           │
│ ☑ Use myself as manager ✅          │
│ ☐ Add different managers            │
└─────────────────────────────────────┘
```

#### Level 3: **Annual Report Form** (Minimal Updates)
```
┌─────────────────────────────────────┐
│ Annual Report - ABC LLC             │
├─────────────────────────────────────┤
│ Current Information: ✅             │
│                                     │
│ Business Name: ABC LLC              │
│ Principal Address:                  │
│   123 Business Blvd                 │
│   Miami, FL 33101                   │
│                                     │
│ Registered Agent:                   │
│   John Doe                          │
│   123 Main St, Miami, FL 33101      │
│                                     │
│ Managers:                           │
│   John Doe (Manager)                │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Has anything changed?               │
│ ☐ Yes, update information           │
│ ☑ No, everything is current ✅      │
│                                     │
│ [Submit Annual Report] →            │
└─────────────────────────────────────┘
```

---

## 🗺️ Form-to-Database Mapping

### Example: LLC Formation Form → Database

```typescript
// User fills out form:
const formData = {
  // Personal Info
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "(305) 555-1234",
  
  // Business Info
  businessName: "ABC LLC",
  principalAddress: {
    street: "123 Business Blvd",
    city: "Miami",
    state: "FL",
    zip: "33101"
  },
  
  // Registered Agent
  agentName: "John Doe",
  agentAddress: {
    street: "123 Main St",
    city: "Miami",
    state: "FL",
    zip: "33101"
  },
  
  // Managers
  managers: [
    { name: "John Doe", title: "Manager" }
  ]
}

// System creates database records:
1. Client record (if new)
2. BusinessEntity record
3. Address records (principal, mailing, agent)
4. RegisteredAgent record
5. ManagerOfficer records
6. Filing record with filingData JSON
```

---

## 📋 Filing Type Configurations

### Supported Filing Types

| Filing Type | Required Data | Reusable Data |
|------------|---------------|---------------|
| **LLC Formation** | Business name, purpose | Client info, addresses |
| **Corp Formation** | Business name, stock info | Client info, addresses |
| **Annual Report** | Confirmation of current data | Everything! |
| **Amendment** | What's changing | Everything else |
| **Dissolution** | Reason, effective date | All entity data |
| **RA Change** | New agent info | All other data |
| **EIN Application** | Tax classification | All entity data |

---

## 🔐 Data Security & Privacy

### Sensitive Data Handling

```typescript
// Encrypted fields
User {
  passwordHash: bcrypt(password)  // Never store plain text
}

// PII (Personally Identifiable Information)
Client {
  firstName: "John"     // Encrypted at rest
  lastName: "Doe"       // Encrypted at rest
  email: "john@..."     // Encrypted at rest
  phone: "(305)..."     // Encrypted at rest
}

// Audit trail
AuditLog {
  userId: "user_123"
  action: "VIEW_CLIENT_DATA"
  timestamp: "2024-01-15T10:30:00Z"
  ipAddress: "192.168.1.1"
}
```

---

## 🚀 Next Steps

1. **Implement Prisma Models** ✅ (Done - see `schema-v2.prisma`)
2. **Create TypeScript Interfaces** (Next)
3. **Build Smart Forms** (Next)
4. **Create Form Mappers** (Next)
5. **Build Admin UI** (Next)

---

## 📚 Related Documentation

- [Database Schema](../prisma/schema-v2.prisma)
- [API Documentation](./API_DOCUMENTATION.md)
- [Form Validation](./FORM_VALIDATION_TUTORIAL.md)

