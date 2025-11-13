# 🔍 Sunbiz Verification System — Month 2-3 Implementation Plan

**Status**: 📋 Planned for Month 2-3  
**Priority**: 🔴 HIGH (Prevents duplicate filings & ensures data accuracy)  
**Estimated Time**: 2-3 weeks  
**Dependencies**: Puppeteer/Playwright, Cron job scheduler

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Business Problem](#business-problem)
3. [Technical Solution](#technical-solution)
4. [Implementation Phases](#implementation-phases)
5. [API Design](#api-design)
6. [Database Schema](#database-schema)
7. [Pre-Checkout Verification Flow](#pre-checkout-verification-flow)
8. [Daily Sync Cron Job](#daily-sync-cron-job)
9. [Customer Notifications](#customer-notifications)
10. [Testing Strategy](#testing-strategy)

---

## 1. Overview

The Sunbiz Verification System automatically scrapes the official Florida Division of Corporations website (Sunbiz.org) to:

1. **Verify business status** before checkout (prevent duplicate filings)
2. **Sync business data daily** (keep our database accurate)
3. **Alert customers** when status changes (dissolved, annual report filed, etc.)

---

## 2. Business Problem

### **Problem 1: Duplicate Filings**
- Customer orders annual report filing
- Customer already filed it directly with Sunbiz
- We process the order and file again → **Wasted money, angry customer**

### **Problem 2: Outdated Data**
- Customer filed business in 2023 using LegalOps
- Customer filed annual report directly with Sunbiz in 2024
- Our database shows "Annual Report Overdue" → **Incorrect health score, wrong recommendations**

### **Problem 3: Missed Opportunities**
- Customer's business gets administratively dissolved
- We don't know about it until customer logs in
- Lost opportunity to proactively offer reinstatement service → **Lost revenue**

---

## 3. Technical Solution

### **Core Technology Stack**

```typescript
// Web Scraping
- Puppeteer or Playwright (headless browser automation)
- Cheerio (HTML parsing)

// Scheduling
- node-cron (cron job scheduler)
- Vercel Cron Jobs (production)

// Data Storage
- Prisma + PostgreSQL (existing)
- New tables: SunbizVerification, BusinessStatusHistory

// Notifications
- Resend (email notifications)
- Existing notification system
```

### **Sunbiz URL Structure**

```
Direct Document Number Lookup:
https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResultDetail?inquirytype=DocumentNumber&aggregateId=domp-L23000123456

Returns:
- Current Status (Active, Dissolved, etc.)
- Filing Date
- Last Annual Report Date
- Registered Agent
- Officers/Managers
- Principal Address
```

---

## 4. Implementation Phases

### **Phase 1: Core Scraper Service** (Week 1)
- [ ] Install Puppeteer/Playwright
- [ ] Create `/lib/sunbizScraper.ts` service
- [ ] Implement document number lookup
- [ ] Parse HTML response into structured data
- [ ] Handle errors (business not found, Sunbiz down, etc.)
- [ ] Add rate limiting (don't overwhelm Sunbiz servers)

### **Phase 2: Pre-Checkout Verification** (Week 1-2)
- [ ] Add verification step before checkout
- [ ] Show modal: "Verifying with Sunbiz..."
- [ ] If already filed: Show warning, offer refund/alternative
- [ ] If not filed: Proceed to checkout
- [ ] Log all verifications for audit trail

### **Phase 3: Daily Sync Cron Job** (Week 2)
- [ ] Create `/app/api/cron/sync-sunbiz/route.ts`
- [ ] Fetch all active businesses from database
- [ ] Scrape Sunbiz for each business (with delays)
- [ ] Update database with latest status
- [ ] Track changes in BusinessStatusHistory table
- [ ] Send notifications for status changes

### **Phase 4: Customer Notifications** (Week 2-3)
- [ ] Email template: "Your business status changed"
- [ ] Email template: "Annual report filed (not by us)"
- [ ] Email template: "Business administratively dissolved"
- [ ] Dashboard notification center
- [ ] SMS notifications (optional, future)

### **Phase 5: Testing & Monitoring** (Week 3)
- [ ] Unit tests for scraper
- [ ] Integration tests for verification flow
- [ ] Load testing (handle 1000+ businesses)
- [ ] Error monitoring (Sentry integration)
- [ ] Success metrics dashboard

---

## 5. API Design

### **`/lib/sunbizScraper.ts`**

```typescript
export interface SunbizBusinessData {
  documentNumber: string;
  legalName: string;
  status: 'ACTIVE' | 'DISSOLVED' | 'INACTIVE' | 'MERGED';
  filingDate: Date;
  lastAnnualReportDate: Date | null;
  registeredAgent: {
    name: string;
    address: string;
  };
  principalAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  officers: Array<{
    name: string;
    title: string;
  }>;
  scrapedAt: Date;
}

export async function verifySunbizStatus(
  documentNumber: string
): Promise<SunbizBusinessData> {
  // 1. Launch headless browser
  // 2. Navigate to Sunbiz search page
  // 3. Enter document number
  // 4. Parse results
  // 5. Return structured data
}

export async function checkIfAlreadyFiled(
  documentNumber: string,
  serviceType: 'ANNUAL_REPORT' | 'AMENDMENT' | 'DISSOLUTION'
): Promise<{
  alreadyFiled: boolean;
  filedDate: Date | null;
  message: string;
}> {
  // Check if service was already filed with Sunbiz
}
```

### **`/app/api/verify-sunbiz/route.ts`**

```typescript
// POST /api/verify-sunbiz
// Body: { documentNumber: string, serviceType: string }
// Returns: { alreadyFiled: boolean, data: SunbizBusinessData }

export async function POST(request: Request) {
  const { documentNumber, serviceType } = await request.json();
  
  // Verify with Sunbiz
  const data = await verifySunbizStatus(documentNumber);
  
  // Check if service already filed
  const check = await checkIfAlreadyFiled(documentNumber, serviceType);
  
  // Log verification
  await prisma.sunbizVerification.create({
    data: {
      documentNumber,
      serviceType,
      alreadyFiled: check.alreadyFiled,
      sunbizData: data,
      verifiedAt: new Date()
    }
  });
  
  return NextResponse.json({
    success: true,
    alreadyFiled: check.alreadyFiled,
    data
  });
}
```

---

## 6. Database Schema

### **New Tables**

```prisma
model SunbizVerification {
  id              String   @id @default(cuid())
  documentNumber  String
  serviceType     ServiceType
  alreadyFiled    Boolean
  sunbizData      Json     // Full Sunbiz response
  verifiedAt      DateTime @default(now())
  businessId      String?
  business        BusinessEntity? @relation(fields: [businessId], references: [id])
  
  @@index([documentNumber])
  @@index([verifiedAt])
}

model BusinessStatusHistory {
  id              String   @id @default(cuid())
  businessId      String
  business        BusinessEntity @relation(fields: [businessId], references: [id])
  oldStatus       String
  newStatus       String
  changedAt       DateTime @default(now())
  source          String   // 'SUNBIZ_SYNC' | 'MANUAL_UPDATE' | 'CUSTOMER_FILING'
  notificationSent Boolean @default(false)
  
  @@index([businessId])
  @@index([changedAt])
}
```

### **Update BusinessEntity Model**

```prisma
model BusinessEntity {
  // ... existing fields ...
  
  lastSunbizSync       DateTime?
  sunbizVerifications  SunbizVerification[]
  statusHistory        BusinessStatusHistory[]
}
```

---

## 7. Pre-Checkout Verification Flow

### **User Experience**

```
1. Customer clicks "Proceed to Checkout" for Annual Report filing
   ↓
2. Modal appears: "🔍 Verifying with Sunbiz..."
   ↓
3a. IF ALREADY FILED:
    ✅ "Good news! Your annual report was already filed on [date]."
    "Would you like to:"
    - [View Sunbiz Record] (opens Sunbiz in new tab)
    - [File Different Service] (returns to dashboard)
    
3b. IF NOT FILED:
    ✅ "Verified! Your annual report has not been filed yet."
    "Proceeding to checkout..."
    ↓
    Navigate to checkout page
```

### **Implementation**

```typescript
// In checkout flow (before creating order)
const verifyBeforeCheckout = async (businessId: string, serviceType: ServiceType) => {
  setVerifying(true);
  
  try {
    const response = await fetch('/api/verify-sunbiz', {
      method: 'POST',
      body: JSON.stringify({
        documentNumber: business.documentNumber,
        serviceType
      })
    });
    
    const { alreadyFiled, data } = await response.json();
    
    if (alreadyFiled) {
      // Show "Already Filed" modal
      setShowAlreadyFiledModal(true);
      return false; // Don't proceed to checkout
    }
    
    // Proceed to checkout
    return true;
  } catch (error) {
    // If verification fails, show warning but allow checkout
    console.error('Sunbiz verification failed:', error);
    return confirm('Unable to verify with Sunbiz. Proceed anyway?');
  } finally {
    setVerifying(false);
  }
};
```

---

## 8. Daily Sync Cron Job

### **Vercel Cron Configuration**

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/sync-sunbiz",
    "schedule": "0 2 * * *"  // Run at 2 AM daily
  }]
}
```

### **Implementation**

```typescript
// /app/api/cron/sync-sunbiz/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Fetch all active businesses
  const businesses = await prisma.businessEntity.findMany({
    where: {
      status: { in: ['ACTIVE', 'PENDING'] }
    }
  });
  
  let updated = 0;
  let errors = 0;
  
  for (const business of businesses) {
    try {
      // Scrape Sunbiz
      const sunbizData = await verifySunbizStatus(business.documentNumber);
      
      // Check if status changed
      if (sunbizData.status !== business.status) {
        // Log status change
        await prisma.businessStatusHistory.create({
          data: {
            businessId: business.id,
            oldStatus: business.status,
            newStatus: sunbizData.status,
            source: 'SUNBIZ_SYNC'
          }
        });
        
        // Update business
        await prisma.businessEntity.update({
          where: { id: business.id },
          data: {
            status: sunbizData.status,
            lastSunbizSync: new Date()
          }
        });
        
        // Send notification
        await sendStatusChangeNotification(business, sunbizData);
        
        updated++;
      }
      
      // Rate limiting: wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Failed to sync ${business.documentNumber}:`, error);
      errors++;
    }
  }
  
  return NextResponse.json({
    success: true,
    totalBusinesses: businesses.length,
    updated,
    errors
  });
}
```

---

## 9. Customer Notifications

### **Email Templates**

**Template 1: Business Status Changed**
```
Subject: Important: Your business status has changed

Hi [Customer Name],

We noticed that the status of [Business Name] has changed on the Florida Division of Corporations website.

Old Status: Active
New Status: Administratively Dissolved

What this means:
Your business entity has been administratively dissolved by the State of Florida, likely due to failure to file annual reports.

What you should do:
1. Verify the status on Sunbiz.org
2. Consider reinstating your business (we can help!)

[Reinstate Business Now] [View on Sunbiz]

Questions? Reply to this email or call us at (XXX) XXX-XXXX.

Best regards,
LegalOps Team
```

---

## 10. Testing Strategy

### **Unit Tests**

```typescript
describe('Sunbiz Scraper', () => {
  it('should fetch business data by document number', async () => {
    const data = await verifySunbizStatus('L23000123456');
    expect(data.documentNumber).toBe('L23000123456');
    expect(data.status).toBeDefined();
  });
  
  it('should detect already-filed annual report', async () => {
    const result = await checkIfAlreadyFiled('L23000123456', 'ANNUAL_REPORT');
    expect(result.alreadyFiled).toBe(true);
  });
});
```

### **Integration Tests**

```typescript
describe('Pre-Checkout Verification', () => {
  it('should block checkout if service already filed', async () => {
    // Mock Sunbiz response showing annual report filed
    // Attempt checkout
    // Verify modal shown
    // Verify order NOT created
  });
});
```

---

## 📊 Success Metrics

- **Duplicate Filing Prevention**: 0 duplicate filings per month
- **Data Accuracy**: 95%+ match between our DB and Sunbiz
- **Customer Satisfaction**: Reduced complaints about incorrect status
- **Revenue Impact**: Proactive reinstatement offers generate $X/month

---

## 🚀 Next Steps

1. **Week 1**: Build core scraper service
2. **Week 2**: Implement pre-checkout verification
3. **Week 3**: Deploy daily sync cron job
4. **Week 4**: Monitor, test, and refine

---

**Last Updated**: 2025-11-08  
**Owner**: Development Team  
**Status**: 📋 Planned for Month 2-3

