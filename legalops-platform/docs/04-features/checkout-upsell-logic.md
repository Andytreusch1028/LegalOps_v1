# Checkout Upsell Logic & Rules

## Overview

The checkout upsell system intelligently recommends related services to customers who order **individual services** (not packages). This increases average order value while providing genuine value to customers.

**Key Principle:** Only show upsells for individual service orders. Package orders already include bundled services and should NOT show upsells.

---

## Upsell Rules by Service Type

### 1. LLC Formation (Individual Service)

**Primary Upsells:**
1. **Registered Agent Service** - $125/year
   - **Why:** Required by Florida law, customer must have one
   - **Benefit:** "Let us handle legal correspondence for you"
   - **Urgency:** "Required by law - don't risk missing important legal documents"
   
2. **Operating Agreement** - $99
   - **Why:** Protects LLC members, required by many banks
   - **Benefit:** "Protect your personal assets and define ownership"
   - **Social Proof:** "90% of our customers add this"

3. **EIN Application** - $49
   - **Why:** Needed to open business bank account, hire employees
   - **Benefit:** "Get your federal tax ID to open a business bank account"
   - **Convenience:** "We handle the IRS paperwork for you"

**Bundle Offer:**
- "Add all 3 for $249 (save $24)" → Essentially upgrade to Standard package pricing

---

### 2. Corporation Formation (Individual Service)

**Primary Upsells:**
1. **Registered Agent Service** - $125/year
   - Same messaging as LLC

2. **Corporate Bylaws** - $99
   - **Why:** Required for corporate governance
   - **Benefit:** "Establish rules for running your corporation"
   - **Compliance:** "Required by most banks and investors"

3. **EIN Application** - $49
   - Same messaging as LLC

**Bundle Offer:**
- "Add all 3 for $249 (save $24)"

---

### 3. Annual Report (LLC or Corp)

**Primary Upsells:**
1. **Certificate of Status** - $30
   - **Why:** Proves good standing after filing
   - **Benefit:** "Get proof your business is in good standing"
   - **Use Case:** "Required by banks, lenders, and vendors"

2. **Registered Agent Service** (if not already subscribed) - $125/year
   - **Why:** Ensure they don't miss next year's deadline
   - **Benefit:** "Never miss a filing deadline again"

---

### 4. Fictitious Name (DBA) Registration

**Primary Upsells:**
1. **Certificate of Status** - $30
   - **Why:** Proves DBA is registered
   - **Benefit:** "Get official proof of your DBA registration"

2. **Business License Research** - $49 (if we offer this)
   - **Why:** DBAs often need local business licenses
   - **Benefit:** "Find out what licenses you need to operate legally"

---

### 5. Amendment Services

**Primary Upsells:**
1. **Certificate of Status** - $30
   - **Why:** Proves amendment was filed
   - **Benefit:** "Get updated certificate showing your changes"

---

### 6. Dissolution Services

**No Upsells**
- Customer is closing business, upsells would be inappropriate

---

## Upsell Display Rules

### When to Show Upsells

✅ **SHOW upsells when:**
- Customer ordered an **individual service** (not a package)
- Customer is on the **checkout page** (before payment)
- Order status is **PENDING** (not yet paid)

❌ **DO NOT show upsells when:**
- Customer ordered a **package** (Basic, Standard, Premium)
- Order is already **PAID**
- Customer is on **order confirmation page** (after payment)
- Service type is **DISSOLUTION** or **REINSTATEMENT**

---

### How to Display Upsells

**Location:** Between order summary and payment form on checkout page

**Layout:**
```
┌─────────────────────────────────────┐
│  Order Summary                      │
│  - LLC Formation: $225              │
│  - State Fee: $125                  │
│  Total: $225                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🎯 Recommended Add-Ons             │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ✓ Registered Agent Service    │ │
│  │   $125/year                    │ │
│  │   Required by law              │ │
│  │   [Add to Order]               │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ✓ Operating Agreement         │ │
│  │   $99                          │ │
│  │   90% of customers add this    │ │
│  │   [Add to Order]               │ │
│  └───────────────────────────────┘ │
│                                     │
│  💰 Bundle: Add all 3 for $249     │
│     (Save $24)                     │
│     [Add Bundle]                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Payment Information                │
│  [Stripe Payment Form]              │
└─────────────────────────────────────┘
```

---

## Upsell Data Structure

```typescript
interface UpsellItem {
  id: string;
  serviceSlug: string;
  name: string;
  price: number;
  description: string;
  benefit: string;
  urgency?: string;
  socialProof?: string;
  icon: string;
  category: 'essential' | 'recommended' | 'optional';
}

interface UpsellBundle {
  id: string;
  name: string;
  items: string[]; // Array of service slugs
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  description: string;
}

interface UpsellConfig {
  serviceType: string; // e.g., 'LLC_FORMATION'
  upsells: UpsellItem[];
  bundles?: UpsellBundle[];
}
```

---

## Implementation Notes

1. **Dynamic Pricing:** Fetch real-time pricing from Service table
2. **Availability Check:** Verify services are active before showing
3. **Already Purchased:** Don't show upsells for services already in order
4. **Order Updates:** When customer adds upsell, update order totals in real-time
5. **Analytics:** Track upsell acceptance rate, revenue per upsell type

---

## Success Metrics

**Target Metrics:**
- **Upsell Acceptance Rate:** 30-40% (industry standard)
- **Average Order Value Increase:** $75-150
- **Most Popular Upsell:** Registered Agent Service (60%+ acceptance)
- **Bundle Acceptance:** 15-20%

**A/B Testing Ideas:**
- Test different messaging (urgency vs. benefit)
- Test bundle pricing ($249 vs. $239)
- Test upsell order (RA first vs. Operating Agreement first)
- Test visual design (cards vs. list)

---

## Future Enhancements

1. **AI-Powered Recommendations:** Use customer data to personalize upsells
2. **Time-Limited Offers:** "Add within 5 minutes for 10% off"
3. **Conditional Upsells:** Based on business type, industry, location
4. **Post-Purchase Upsells:** Email campaigns for customers who didn't add upsells
5. **Subscription Upsells:** Annual RA service with auto-renewal discount

