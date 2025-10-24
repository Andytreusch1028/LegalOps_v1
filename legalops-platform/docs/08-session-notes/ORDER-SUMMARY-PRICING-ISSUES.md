# Order Summary & Pricing Issues - Found 2025-10-24

## 🚨 **CRITICAL ISSUES FOUND**

### **Issue #1: Missing State Filing Fee in Order Summary**

**Current Behavior:**
- Order summary only shows "LLC Formation Service - $100.00"
- State filing fee ($125) is NOT displayed as a line item
- Total shows $225.00 (which is correct: $100 service + $125 state fee)
- **BUT** the breakdown doesn't show where the $225 comes from

**Expected Behavior:**
- Should show itemized breakdown:
  - LegalOps Service Fee: $100.00
  - Florida State Filing Fee: $125.00
  - Subtotal: $225.00
  - Tax: $0.00 (professional services exempt in FL)
  - **Total: $225.00**

---

### **Issue #2: Tax Calculation**

**Current Status:** ✅ **CORRECT** - Tax shows $0.00

**Confirmation:**
According to Florida sales tax law (verified via Gruber CPA firm article):
- **Professional services are EXEMPT from Florida sales tax**
- This includes: legal services, accounting, tax preparation, medical, architectural, engineering
- LegalOps filing services fall under "professional services" category
- **Therefore: $0.00 tax is CORRECT** ✅

**Source:** https://grubercpa.com/2024/03/18/what-services-are-subject-to-sales-tax-in-florida/

---

## 📋 **WHAT NEEDS TO BE FIXED**

### **1. Update Order Creation Logic**

**File:** `legalops-platform/src/app/api/orders/route.ts`

**Current Code (Lines 124-153):**
```typescript
// Fetch service to get pricing
const service = await prisma.service.findUnique({
  where: { id: serviceId },
});

// Calculate total with rush fee if applicable
let orderTotal = service.totalPrice;
if (orderData.rushProcessing && service.rushFeeAvailable) {
  orderTotal += service.rushFee || 0;
}

// Create order with new schema
const order = await prisma.order.create({
  data: {
    userId: user.id,
    orderNumber,
    orderStatus: "PENDING",
    subtotal: service.serviceFee,  // ❌ WRONG - only shows service fee
    tax: 0,
    total: orderTotal,
    paymentStatus: "PENDING",
  },
});
```

**Problem:**
- `subtotal` is set to `service.serviceFee` ($100)
- But `total` is set to `service.totalPrice` ($225)
- The $125 state fee is "hidden" in the total but not shown in the breakdown

**Solution:**
- `subtotal` should be `service.totalPrice` (service fee + state fee + registered agent fee)
- Need to store line item details somewhere so checkout page can display them

---

### **2. Update Checkout Page to Show Itemized Breakdown**

**File:** `legalops-platform/src/app/checkout/[orderId]/page.tsx`

**Current Code (Lines 238-244):**
```typescript
<OrderSummaryCard
  items={[
    {
      label: 'LLC Formation Service',
      value: order.subtotal,  // ❌ Only shows $100
      description: 'Professional filing service',
    },
  ]}
  subtotal={order.subtotal}
  tax={order.tax}
  total={order.total}
  showRiskBadge={false}
/>
```

**Problem:**
- Hard-coded to show only one line item
- Doesn't break down service fee vs state fee vs registered agent fee

**Solution:**
Need to either:
1. **Option A:** Store line items in database (add `OrderLineItem` model)
2. **Option B:** Fetch the Service record and calculate line items dynamically
3. **Option C:** Store line items as JSON in Order model

---

## 🏗️ **RECOMMENDED SOLUTION**

### **Option B: Fetch Service Data Dynamically** (Quickest fix)

**Why:**
- No database schema changes needed
- Service pricing is already stored in `Service` table
- Just need to fetch it and display it properly

**Implementation:**

1. **Update `/api/orders/[orderId]` endpoint** to include service details:
```typescript
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    orderItems: {
      include: {
        service: true  // Include full service details
      }
    }
  }
});
```

2. **Update checkout page** to build line items from service data:
```typescript
const items = [
  {
    label: 'LegalOps Service Fee',
    value: service.serviceFee,
    description: 'Professional filing service',
  },
  {
    label: 'Florida State Filing Fee',
    value: service.stateFee,
    description: 'Paid to Florida Division of Corporations',
  },
];

if (service.registeredAgentFee > 0) {
  items.push({
    label: 'Registered Agent Service',
    value: service.registeredAgentFee,
    description: 'First year free with formation',
  });
}
```

---

## 📊 **CORRECT PRICING BREAKDOWN**

### **LLC Formation Service**

| Item | Amount | Notes |
|------|--------|-------|
| LegalOps Service Fee | $100.00 | Our professional filing service |
| Florida State Filing Fee | $125.00 | Paid to FL Division of Corporations |
| Registered Agent Fee | $0.00 | First year FREE with formation |
| **Subtotal** | **$225.00** | |
| Tax | $0.00 | Professional services exempt in FL |
| **Total** | **$225.00** | |

---

## 🎯 **NEXT STEPS**

1. ✅ **Confirm tax exemption** - DONE (professional services exempt in FL)
2. ⏳ **Fix order creation** - Update subtotal calculation
3. ⏳ **Fix checkout display** - Show itemized breakdown
4. ⏳ **Test end-to-end** - Create new order and verify display

---

## 📚 **REFERENCE: Florida State Filing Fees**

From `docs/04-features/services/SERVICE-CATALOG-IMPLEMENTATION.md`:

### **Formation Fees:**
- LLC Formation: $125
- Corporation Formation: $70
- Fictitious Name: $50

### **Annual Report Fees:**
- LLC Annual Report: $138.75
- Corp Annual Report: $150

### **Other Fees:**
- Amendments: $25
- Reinstatements: $600
- Certificates of Status: $5
- Name Reservations: $35

---

## ✅ **SALES TAX CONFIRMATION**

**Florida Sales Tax on Professional Services: EXEMPT**

**Exempt Services Include:**
- Legal advice and services ✅
- Accounting services ✅
- Tax preparation ✅
- Medical and dental care ✅
- Architectural design ✅
- Engineering services ✅
- Financial advising ✅
- Consulting services ✅

**Taxable Services (NOT applicable to LegalOps):**
- Non-residential cleaning services
- Labor on real property (construction/installation)
- Commercial pest control
- Protection services (security guards, alarms)
- Commercial amusements (theme parks, theaters)

**Source:** Gruber and Associates, P.A. (Florida CPA firm)
**URL:** https://grubercpa.com/2024/03/18/what-services-are-subject-to-sales-tax-in-florida/

---

## 🔍 **DATABASE SCHEMA REFERENCE**

### **Service Model** (from `prisma/schema.prisma`)

```prisma
model Service {
  // Pricing
  serviceFee        Decimal  @db.Decimal(10, 2) // LegalOps service fee
  stateFee          Decimal  @db.Decimal(10, 2) // Florida state filing fee
  registeredAgentFee Decimal @db.Decimal(10, 2) @default(0) // Registered agent fee
  totalPrice        Decimal  @db.Decimal(10, 2) // serviceFee + stateFee + registeredAgentFee
  rushFeeAvailable  Boolean  @default(false)
  rushFee           Decimal  @db.Decimal(10, 2) @default(0)
}
```

### **Order Model**

```prisma
model Order {
  // Pricing
  subtotal        Decimal  @db.Decimal(10, 2)
  tax             Decimal  @db.Decimal(10, 2)
  total           Decimal  @db.Decimal(10, 2)
}
```

**Current Problem:**
- `subtotal` stores only `service.serviceFee` ($100)
- `total` stores `service.totalPrice` ($225)
- Missing: breakdown of what makes up the $225

---

**End of Document**

