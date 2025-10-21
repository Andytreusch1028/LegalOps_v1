# LegalOps Platform - System Integration Map

**Visual guide showing how all components connect together**

---

## 🗺️ Complete System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER JOURNEY                          │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION & LOGIN
   ┌──────────────┐
   │   Register   │ → /api/auth/register
   │   Login      │ → /api/auth/[...nextauth]
   │   Verify     │ → /api/auth/verify-email
   └──────────────┘
          ↓
2. CUSTOMER DASHBOARD
   ┌──────────────────────────────────────┐
   │  /customer/dashboard                 │
   │  - View businesses                   │ → /api/businesses
   │  - View filings                      │ → /api/filings
   │  - Important notices (⚠️ badge)      │ → /api/notices
   └──────────────────────────────────────┘
          ↓
3. ORDER NEW SERVICE
   ┌──────────────────────────────────────┐
   │  Service Selection                   │
   │  (LLC, Annual Report, DBA, etc.)     │
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  Business Name Check (if new LLC)    │ → /api/check-name
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  Fill Out Form                       │
   │  - Business details                  │
   │  - Registered agent                  │
   │  - Principal address                 │
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  Address Validation                  │ → /api/validate-address
   │  [AddressValidationModal]            │ → USPS API
   │  - Accept disclaimer                 │ → disclaimer-logging.ts
   └──────────────────────────────────────┘
          ↓
4. CHECKOUT FLOW ⭐ NEW
   ┌──────────────────────────────────────┐
   │  Step 1: Service Refusal Disclaimer  │
   │  [ServiceRefusalDisclaimer]          │
   │  - Must accept to proceed            │
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  Step 2: Payment Information         │
   │  - Card details                      │
   │  - Billing address                   │
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  Step 3: Place Order                 │
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  AI RISK ASSESSMENT                  │ → /api/orders/create-with-risk-check
   │  (Runs BEFORE payment)               │ → ai-risk-scoring.ts
   │  - Rule-based checks                 │
   │  - GPT-4 analysis                    │
   │  - Risk score 0-100                  │
   └──────────────────────────────────────┘
          ↓
   ┌─────┴─────┬──────────────┬──────────┐
   │           │              │          │
   ↓           ↓              ↓          ↓
CRITICAL    HIGH          MEDIUM      LOW
(76-100)   (51-75)       (26-50)    (0-25)
   │           │              │          │
   ↓           ↓              └──────────┘
DECLINE    VERIFY              │
   │           │                ↓
   │           │           APPROVE
   │           │                │
   ↓           ↓                ↓
┌─────────┐ ┌─────────┐  ┌──────────┐
│ Order   │ │ Order   │  │ Process  │
│Declined │ │Pending  │  │ Payment  │
│         │ │Verify   │  │          │
│NO CHARGE│ │NO CHARGE│  │ Stripe   │
└─────────┘ └─────────┘  └──────────┘
   │           │                │
   ↓           ↓                ↓
[OrderDeclined] [OrderDeclined] SUCCESS
Message         Message
fraud_risk      verification
                required

5. POST-ORDER
   ┌──────────────────────────────────────┐
   │  Order Confirmation                  │
   │  - Order number                      │
   │  - Receipt                           │
   │  - Next steps                        │
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  Filing Created (PENDING_REVIEW)     │ → Database: Filing
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  Staff Reviews Filing                │ → /staff/filings
   └──────────────────────────────────────┘
          ↓
   ┌─────┴─────┐
   │           │
   ↓           ↓
APPROVE    NEEDS CHANGES
   │           │
   │           ↓
   │      ┌──────────────────────────────┐
   │      │ Create Notice for Customer   │ → /api/notices
   │      │ - Email sent                 │
   │      │ - Badge on dashboard         │
   │      └──────────────────────────────┘
   │           │
   │           ↓
   │      ┌──────────────────────────────┐
   │      │ Customer Approves/Rejects    │ → /customer/dashboard
   │      │ [ImportantNotices]           │
   │      └──────────────────────────────┘
   │           │
   │           ↓ (if approved)
   └───────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  Submit to State (Sunbiz)            │ → /api/filing/submit
   │  (Future: Sunbiz API)                │
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  Filing Complete                     │
   │  - Document returned from state      │
   │  - Available in dashboard            │
   └──────────────────────────────────────┘
```

---

## 🔧 Staff/Admin Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                      STAFF DASHBOARD                             │
└─────────────────────────────────────────────────────────────────┘

1. FILING REVIEW
   ┌──────────────────────────────────────┐
   │  /staff/filings                      │
   │  - View pending filings              │ → /api/staff/filings
   │  - Review customer data              │
   │  - Approve or request changes        │ → /api/filing/approve
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  If changes needed:                  │
   │  - Create notice                     │ → /api/notices
   │  - Email customer                    │
   │  - Wait for customer approval        │
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  If approved:                        │
   │  - Submit to state                   │ → /api/filing/submit
   └──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN DASHBOARD                             │
└─────────────────────────────────────────────────────────────────┘

2. RISK MANAGEMENT
   ┌──────────────────────────────────────┐
   │  /admin/risk-management              │
   │  - View high-risk orders             │ → /api/risk/high-risk-orders
   │  - Filter by risk level              │
   │  - View risk factors                 │
   │  - See AI reasoning                  │
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  Review Order                        │
   │  - Customer details                  │
   │  - Order details                     │
   │  - Risk analysis                     │
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  Make Decision:                      │
   │  - APPROVE (process order)           │
   │  - DECLINE (cancel order)            │
   │  - VERIFY (request ID)               │
   │  - MONITOR (watch for patterns)      │
   └──────────────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │  Update saved to database            │ → /api/risk/high-risk-orders
   │  - Review decision                   │
   │  - Review notes                      │
   │  - Timestamp                         │
   └──────────────────────────────────────┘
```

---

## 📦 Component Connections

### **Customer-Facing Components:**

```
ServiceRefusalDisclaimer.tsx
    ↓ (onAccept callback)
Checkout Form
    ↓ (form submission)
/api/orders/create-with-risk-check
    ↓ (calls)
ai-risk-scoring.ts
    ↓ (returns result)
Three possible outcomes:
    ├─→ OrderDeclinedMessage (reason: fraud_risk)
    ├─→ OrderDeclinedMessage (reason: verification_required)
    └─→ Proceed to payment (Stripe)
```

```
Address Input Field
    ↓ (onBlur or button click)
/api/validate-address
    ↓ (calls)
usps-address-validation.ts
    ↓ (returns result)
AddressValidationModal
    ↓ (user accepts)
disclaimer-logging.ts (logs acceptance)
```

```
Customer Dashboard
    ↓ (loads)
/api/notices
    ↓ (returns notices)
ImportantNotices component
    ↓ (shows badge)
NoticesBadge component
    ↓ (user clicks approve/reject)
/api/notices/[id]
    ↓ (updates database)
Filing status updated
```

---

## 🗄️ Database Relationships

```
User
 ├─→ businesses (one-to-many)
 ├─→ orders (one-to-many)
 ├─→ filings (one-to-many)
 └─→ notices (one-to-many)

Business
 ├─→ user (many-to-one)
 └─→ filings (one-to-many)

Order
 ├─→ user (many-to-one)
 └─→ riskAssessment (one-to-one) ⭐ NEW

Filing
 ├─→ business (many-to-one)
 ├─→ user (many-to-one)
 └─→ notices (one-to-many)

RiskAssessment ⭐ NEW
 └─→ order (one-to-one)

Notice
 ├─→ user (many-to-one)
 └─→ filing (many-to-one, optional)
```

---

## 🔌 API Endpoint Map

### **Public (No Auth Required):**
- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/check-name` (business name availability)

### **Customer (Auth Required):**
- `GET /api/user/info`
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `GET /api/businesses`
- `POST /api/businesses`
- `GET /api/businesses/[id]`
- `GET /api/filings`
- `POST /api/filings/annual-report`
- `GET /api/orders`
- `POST /api/orders/create-with-risk-check` ⭐ NEW
- `GET /api/notices`
- `POST /api/notices/[id]` (approve/reject)
- `POST /api/validate-address`

### **Staff (Staff Role Required):**
- `GET /api/staff/filings` (pending filings)
- `POST /api/filing/approve`
- `POST /api/filing/submit`
- `POST /api/internal/alert-staff-error`

### **Admin (Admin Role Required):**
- `GET /api/risk/high-risk-orders`
- `POST /api/risk/high-risk-orders` (update review)
- `POST /api/risk/assess`

---

## 🎯 What's Connected vs What's Not

### ✅ **FULLY CONNECTED:**

1. **Customer Dashboard → Notices**
   - Dashboard loads notices
   - Badge shows count
   - Customer can approve/reject
   - Database updates

2. **Filing Submission → Staff Review**
   - Customer submits filing
   - Appears in staff dashboard
   - Staff approves/rejects
   - Creates notices if needed

3. **Address Input → USPS Validation**
   - Address triggers validation
   - Modal shows results
   - Disclaimer logged
   - Address updated

4. **Risk Assessment → Admin Dashboard**
   - High-risk orders logged
   - Admin can review
   - Decisions saved
   - Audit trail complete

### ⚠️ **BUILT BUT NOT CONNECTED:**

1. **Checkout → Risk Scoring**
   - ✅ Components built
   - ✅ API ready
   - ❌ Not integrated into actual checkout
   - **Fix:** Replace order creation in checkout with `/api/orders/create-with-risk-check`

2. **Order Decline → Email Notifications**
   - ✅ Email templates documented
   - ❌ No email service integrated
   - **Fix:** Add SendGrid/AWS SES integration

3. **Verification Required → Staff Workflow**
   - ✅ Orders marked for verification
   - ❌ No staff verification queue
   - **Fix:** Add verification tab to staff dashboard

### 🔴 **PLANNED BUT NOT BUILT:**

1. **Filing Approval → Sunbiz Submission**
   - ✅ Approval system works
   - ❌ Sunbiz API not integrated
   - **Fix:** Implement Sunbiz API (Month 2-3)

2. **Additional AI Features**
   - Document review
   - Natural language search
   - Predictive analytics
   - **Timeline:** Month 3-6

---

## 🚀 Quick Reference: Where Is Everything?

### **Components:**
- `src/components/ServiceRefusalDisclaimer.tsx`
- `src/components/OrderDeclinedMessage.tsx`
- `src/components/AddressValidationModal.tsx`
- `src/components/ImportantNotices.tsx`
- `src/components/NoticesBadge.tsx`

### **Pages:**
- `src/app/customer/dashboard/page.tsx`
- `src/app/staff/filings/page.tsx`
- `src/app/admin/risk-management/page.tsx`
- `src/app/checkout-example/page.tsx` (demo)
- `src/app/test-risk-scoring/page.tsx` (test)

### **API Routes:**
- `src/app/api/orders/create-with-risk-check/route.ts` ⭐
- `src/app/api/risk/assess/route.ts`
- `src/app/api/risk/high-risk-orders/route.ts`
- `src/app/api/notices/route.ts`
- `src/app/api/validate-address/route.ts`

### **Services:**
- `src/lib/services/ai-risk-scoring.ts` ⭐
- `src/lib/services/usps-address-validation.ts`
- `src/lib/services/disclaimer-logging.ts`

### **Database:**
- `prisma/schema.prisma` (complete schema)

### **Documentation:**
- `docs/MASTER_SYSTEM_INVENTORY.md` ⭐ (this file's companion)
- `docs/PRODUCTION_RISK_SCORING_INTEGRATION.md`
- `docs/RISK_SCORING_IMPLEMENTATION_GUIDE.md`
- `docs/AI_FEATURES_ROADMAP.md`

---

**Use this map to understand how everything connects!** 🗺️

