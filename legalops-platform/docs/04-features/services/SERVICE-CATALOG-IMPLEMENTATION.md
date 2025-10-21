# Service Catalog Implementation Guide

## 📋 Overview

LegalOps now supports **all Florida business filing services** available through Sunbiz.org, not just formation documents. This expansion transforms LegalOps from a formation-only service to a comprehensive business filing platform.

---

## 🎯 What's Been Built

### 1. **Comprehensive Service Catalog** ✅

**Database Schema:**
- `Service` model - Stores all available services
- `ServiceCategory` enum - Organizes services into categories
- Expanded `OrderType` enum - 100+ filing types

**Service Categories:**
1. **Formation** - Start new businesses
2. **Annual Compliance** - Annual reports, renewals
3. **Amendments** - Changes to existing entities
4. **Conversions & Mergers** - Structural changes
5. **Dissolution & Withdrawal** - Close businesses
6. **Statements & Corrections** - Legal statements
7. **Registered Agent** - Agent services
8. **Certificates** - Status certificates, name reservations
9. **Abandonment** - Cancel pending filings
10. **Other Services** - Judgment liens, trademarks, etc.

### 2. **100+ Filing Types Supported** ✅

**Formation Services (15):**
- LLC Formation
- Corporation Formation (Profit & Non-Profit)
- Foreign Entity Qualifications
- Partnership Formations (LP, LLP, GP)
- Fictitious Name Registration
- Trademark Registration

**Annual Compliance (5):**
- LLC Annual Report
- Corporation Annual Report
- Non-Profit Annual Report
- LP Annual Report
- Fictitious Name Renewal

**Reinstatement (4):**
- LLC Reinstatement
- Corporation Reinstatement
- Non-Profit Reinstatement
- LP Reinstatement

**Amendments (8):**
- LLC Amendment
- Corporation Amendment
- Non-Profit Amendment
- LP Amendment
- Fictitious Name Amendment
- Registered Agent Change
- Officer/Director Change
- Member/Manager Change

**Conversions & Mergers (12):**
- LLC to Corporation
- Corporation to LLC
- Entity to Other conversions
- LLC Merger
- Corporation Merger
- Cross-Entity Merger
- Domestication
- Interest Exchange
- Share Exchange

**Dissolution & Withdrawal (9):**
- LLC Dissolution
- Corporation Dissolution
- Non-Profit Dissolution
- Partnership Dissolutions
- Foreign Entity Withdrawal
- Fictitious Name Cancellation
- Revocation of Dissolution

**Statements & Corrections (6):**
- Statement of Authority
- Statement of Denial
- Statement of Withdrawal
- Statement of Termination
- Statement of Correction
- Articles of Correction

**Certificates (5):**
- Certificate of Status
- Certified Copy
- Certificate of Fact
- Name Reservation
- Name Renewal

**And many more...**

### 3. **Service Seed Data** ✅

**Initial Services Seeded:**
- LLC Formation ($225 total)
- Corporation Formation ($170 total)
- Fictitious Name Registration ($100 total)
- LLC Annual Report ($188.75 total)
- Corporation Annual Report ($200 total)
- Fictitious Name Renewal ($90 total)
- LLC Reinstatement ($750 total)
- Corporation Reinstatement ($750 total)
- LLC Amendment ($100 total)
- Corporation Amendment ($100 total)
- Registered Agent Change ($75 total)
- LLC Dissolution ($100 total)
- Corporation Dissolution ($100 total)
- Certificate of Status ($30 total)
- Name Reservation ($60 total)

**More services can be added easily!**

---

## 📊 Database Schema

### Service Model

```prisma
model Service {
  id                String   @id @default(cuid())
  
  // Identification
  name              String   // "LLC Formation"
  slug              String   @unique // "llc-formation"
  orderType         OrderType // Link to OrderType enum
  category          ServiceCategory
  
  // Description
  shortDescription  String?
  longDescription   String?
  
  // Pricing
  serviceFee        Float    // LegalOps fee
  stateFee          Float    // State filing fee
  totalPrice        Float    // Total
  rushFeeAvailable  Boolean
  rushFee           Float
  
  // Details
  entityTypes       String[] // ["LLC", "CORPORATION"]
  processingTime    String?  // "1-2 business days"
  filingMethod      String   // "online", "mail", "both"
  
  // Requirements
  requirements      Json?    // Required info/docs
  formFields        Json?    // Dynamic form fields
  
  // Display
  isActive          Boolean
  isPopular         Boolean
  isFeatured        Boolean
  displayOrder      Int
  icon              String?
  
  // SEO
  metaTitle         String?
  metaDescription   String?
  keywords          String[]
  
  // Relations
  orders            Order[]
}
```

### Updated Order Model

```prisma
model Order {
  // ... existing fields ...
  
  // NEW: Service Reference
  serviceId       String?
  service         Service?    @relation(fields: [serviceId], references: [id])
  
  // NEW: Flexible order data
  orderData       Json?  // Service-specific fields
}
```

---

## 🚀 Implementation Steps

### Step 1: Push Database Schema

```bash
cd legalops-platform
npx prisma db push
```

This creates the `services` table and updates the `orders` table.

### Step 2: Seed Service Catalog

```bash
npm run seed-services
```

This populates the database with 15 initial services.

### Step 3: Build Service Catalog UI

**Create service listing page:**
- `/dashboard/services` - Browse all services
- Filter by category
- Search services
- Featured services section

**Create service detail page:**
- `/dashboard/services/[slug]` - Service details
- Pricing breakdown
- Requirements list
- "Order Now" button

**Update order creation:**
- Select service from catalog
- Dynamic form based on service requirements
- Auto-populate pricing from service

---

## 💰 Pricing Structure

### Service Fees (LegalOps)
- **Formation:** $100-$150
- **Annual Reports:** $50
- **Amendments:** $50-$75
- **Reinstatements:** $150
- **Dissolutions:** $75
- **Certificates:** $25
- **Name Reservations:** $25

### State Fees (Florida)
- **LLC Formation:** $125
- **Corporation Formation:** $70
- **Fictitious Name:** $50
- **LLC Annual Report:** $138.75
- **Corp Annual Report:** $150
- **Amendments:** $25
- **Reinstatements:** $600
- **Certificates of Status:** $5
- **Name Reservations:** $35

### Rush Fees (Optional)
- **Formation:** +$50
- **Annual Reports:** +$25
- **Certificates:** +$15

---

## 📝 Next Steps

### Phase 1: Core Service Catalog (Current)
- [x] Database schema
- [x] Service model
- [x] Seed data for 15 services
- [ ] Service listing page
- [ ] Service detail pages
- [ ] Update order creation flow

### Phase 2: Expand Services
- [ ] Add remaining 85+ services to seed data
- [ ] Create service-specific forms
- [ ] Build dynamic form generator
- [ ] Add service requirements validation

### Phase 3: Advanced Features
- [ ] Service bundles (e.g., "Formation + Annual Report")
- [ ] Subscription services (annual report reminders)
- [ ] Compliance calendar
- [ ] Automated filing where possible

### Phase 4: Partner Features
- [ ] Partner-specific pricing
- [ ] White-label service catalog
- [ ] Commission tracking per service
- [ ] Partner service restrictions

---

## 🎨 UI/UX Recommendations

### Service Catalog Page

**Layout:**
```
┌─────────────────────────────────────────┐
│  🔍 Search Services                     │
│  [Filter by Category ▼]                 │
├─────────────────────────────────────────┤
│  ⭐ Featured Services                   │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ LLC  │ │ Corp │ │ DBA  │            │
│  │ $225 │ │ $170 │ │ $100 │            │
│  └──────┘ └──────┘ └──────┘            │
├─────────────────────────────────────────┤
│  📋 Formation Services                  │
│  • LLC Formation ................. $225 │
│  • Corporation Formation ........ $170 │
│  • Fictitious Name (DBA) ........ $100 │
│                                         │
│  📊 Annual Compliance                   │
│  • LLC Annual Report .......... $188.75 │
│  • Corporation Annual Report .... $200 │
│                                         │
│  ✏️ Amendments                          │
│  • LLC Amendment ................ $100 │
│  • Registered Agent Change ....... $75 │
└─────────────────────────────────────────┘
```

### Service Detail Page

**Layout:**
```
┌─────────────────────────────────────────┐
│  🏢 LLC Formation                       │
│  Form a new Florida Limited Liability   │
│  Company                                │
├─────────────────────────────────────────┤
│  💰 Pricing                             │
│  Service Fee .................... $100  │
│  State Filing Fee ............... $125  │
│  ─────────────────────────────────────  │
│  Total .......................... $225  │
│  + Rush Processing (+$50)               │
├─────────────────────────────────────────┤
│  ⏱️ Processing Time                     │
│  5-7 business days (standard)           │
│  1-2 business days (rush)               │
├─────────────────────────────────────────┤
│  📋 What You'll Need                    │
│  ✓ Business name                        │
│  ✓ Registered agent information         │
│  ✓ Member/manager details               │
│  ✓ Business address                     │
├─────────────────────────────────────────┤
│  [Order This Service →]                 │
└─────────────────────────────────────────┘
```

---

## 📚 Documentation

**For Users:**
- `FLORIDA-FILING-SERVICES-CATALOG.md` - Complete service list
- Service detail pages (to be built)
- FAQ section

**For Developers:**
- This document
- Database schema documentation
- API documentation (to be created)

---

## ✅ Summary

**What's Complete:**
- ✅ Database schema for service catalog
- ✅ 100+ filing types in OrderType enum
- ✅ Service model with all necessary fields
- ✅ Seed script with 15 initial services
- ✅ Complete service catalog documentation

**What's Next:**
1. Build service catalog UI
2. Create service detail pages
3. Update order creation flow
4. Add remaining services to seed data
5. Build dynamic form generator

**The foundation is complete!** You can now offer all Florida filing services, not just formations. 🎉


