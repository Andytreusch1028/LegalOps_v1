# Production Risk Scoring Integration Guide

## Overview

This guide explains how to integrate AI risk scoring into your production checkout flow to **prevent fraudulent orders BEFORE payment is processed**.

---

## 🎯 Key Requirements Met

✅ **Risk assessment runs BEFORE payment processing**  
✅ **Declined orders are rejected immediately (no charge)**  
✅ **Customer is notified immediately with clear messaging**  
✅ **Service refusal disclaimer shown at checkout start**  
✅ **Complete audit trail for all decisions**

---

## 📋 Implementation Flow

### **Complete Checkout Process:**

```
1. Customer starts checkout
   ↓
2. SERVICE REFUSAL DISCLAIMER shown (must accept)
   ↓
3. Customer fills out payment information
   ↓
4. Customer clicks "Place Order"
   ↓
5. AI RISK ASSESSMENT runs (2-5 seconds)
   ↓
6. Decision made:
   
   ❌ CRITICAL RISK (76-100):
      → Order DECLINED immediately
      → NO payment processed
      → Customer sees "Order Declined" page
      → Support contact information provided
   
   ⚠️ HIGH RISK (51-75):
      → Order created in PENDING status
      → NO payment processed yet
      → Customer sees "Verification Required" page
      → Admin notified for manual review
      → Customer can complete after verification
   
   ✅ LOW/MEDIUM RISK (0-50):
      → Order created
      → Proceed to payment processing
      → Normal checkout flow continues
```

---

## 🔧 Files Created

### **1. Components**

#### **ServiceRefusalDisclaimer.tsx**
- Shows legal disclaimer at checkout start
- Requires customer acceptance before proceeding
- Protects business legally

**Location:** `src/components/ServiceRefusalDisclaimer.tsx`

**Usage:**
```typescript
<ServiceRefusalDisclaimer 
  onAccept={() => setStep('checkout')}
  required={true}
/>
```

#### **OrderDeclinedMessage.tsx**
- Professional order rejection page
- Multiple rejection reasons supported
- Support contact information
- FAQ section for fraud-related declines

**Location:** `src/components/OrderDeclinedMessage.tsx`

**Usage:**
```typescript
<OrderDeclinedMessage
  reason="fraud_risk" // or "verification_required"
  orderNumber="LO-123456"
  onContactSupport={() => openSupportForm()}
/>
```

### **2. API Endpoint**

#### **create-with-risk-check/route.ts**
- Creates orders with risk assessment BEFORE payment
- Three possible outcomes: DECLINE, VERIFY, or APPROVE
- Complete logging and audit trail

**Location:** `src/app/api/orders/create-with-risk-check/route.ts`

**Request:**
```json
{
  "userId": "user_123",
  "orderData": {
    "subtotal": 299.00,
    "tax": 20.93,
    "total": 319.93,
    "services": ["LLC_FORMATION"],
    "paymentMethod": "credit_card",
    "isRushOrder": false,
    "billingAddress": {
      "street": "123 Main St",
      "city": "Miami",
      "state": "FL",
      "zip": "33101"
    }
  }
}
```

**Response (DECLINED):**
```json
{
  "success": false,
  "declined": true,
  "reason": "fraud_risk",
  "message": "We are unable to process your order at this time...",
  "riskScore": 85,
  "requiresVerification": true
}
```

**Response (VERIFICATION REQUIRED):**
```json
{
  "success": true,
  "requiresVerification": true,
  "orderId": "order_123",
  "orderNumber": "LO-ABC123",
  "message": "Your order requires additional verification...",
  "riskScore": 65
}
```

**Response (APPROVED):**
```json
{
  "success": true,
  "orderId": "order_123",
  "orderNumber": "LO-ABC123",
  "proceedWithPayment": true,
  "riskScore": 15,
  "riskLevel": "LOW",
  "message": "Order created successfully. Proceeding to payment."
}
```

### **3. Example Checkout Page**

**Location:** `src/app/checkout-example/page.tsx`

**URL:** `http://localhost:3001/checkout-example`

**Features:**
- Complete checkout flow demonstration
- Service refusal disclaimer
- Risk assessment integration
- Declined/verification/success pages
- Ready to adapt for production

---

## 🚀 How to Integrate into Your Checkout

### **Step 1: Add Disclaimer to Checkout Start**

```typescript
// In your checkout page
import ServiceRefusalDisclaimer from '@/components/ServiceRefusalDisclaimer';

export default function CheckoutPage() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  if (!disclaimerAccepted) {
    return (
      <ServiceRefusalDisclaimer 
        onAccept={() => setDisclaimerAccepted(true)}
        required={true}
      />
    );
  }

  // ... rest of checkout form
}
```

### **Step 2: Replace Order Creation API Call**

**BEFORE (Old way - no risk check):**
```typescript
const response = await fetch('/api/orders/create', {
  method: 'POST',
  body: JSON.stringify({ userId, orderData })
});
```

**AFTER (New way - with risk check):**
```typescript
const response = await fetch('/api/orders/create-with-risk-check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, orderData })
});

const result = await response.json();

if (result.declined) {
  // Show declined page - NO payment processed
  router.push('/order-declined?reason=fraud_risk');
  
} else if (result.requiresVerification) {
  // Show verification required page - NO payment processed yet
  router.push(`/order-verification?orderNumber=${result.orderNumber}`);
  
} else if (result.proceedWithPayment) {
  // Proceed to Stripe payment
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
  await stripe.redirectToCheckout({
    sessionId: result.stripeSessionId
  });
}
```

### **Step 3: Create Declined/Verification Pages**

```typescript
// src/app/order-declined/page.tsx
import OrderDeclinedMessage from '@/components/OrderDeclinedMessage';

export default function OrderDeclinedPage({ searchParams }) {
  return (
    <OrderDeclinedMessage
      reason={searchParams.reason || 'general'}
      orderNumber={searchParams.orderNumber}
      onContactSupport={() => router.push('/support')}
    />
  );
}
```

---

## 📧 Customer Notifications

### **Email Templates Needed**

#### **1. Order Declined Email**
```
Subject: Order Review Required - LegalOps

Dear [Customer Name],

We were unable to process your recent order due to our fraud prevention 
policies. This is a standard security measure to protect both you and our 
business.

Order Number: [Order Number]
Amount: $[Amount]

IMPORTANT: No charges have been made to your payment method.

If you believe this is an error, please contact our support team:
- Email: support@legalops.com
- Phone: 1-800-555-0123

We apologize for any inconvenience.

Best regards,
LegalOps Team
```

#### **2. Verification Required Email**
```
Subject: Verification Required for Order [Order Number]

Dear [Customer Name],

Your order requires additional verification before we can proceed. This is 
a standard security measure for certain transactions.

Order Number: [Order Number]
Amount: $[Amount]

NEXT STEPS:
Please reply to this email with:
1. Photo of government-issued ID
2. Proof of business ownership (if applicable)
3. Confirmation of billing address

Once verified, we'll process your order within 1-2 business days.

Questions? Contact us at support@legalops.com or 1-800-555-0123.

Best regards,
LegalOps Team
```

---

## ⚖️ Legal Disclaimer Text

### **Service Refusal Disclaimer (shown at checkout)**

The disclaimer component includes:

✅ Right to refuse service statement  
✅ Reasons for potential refusal  
✅ No-charge guarantee for declined orders  
✅ Verification requirements explanation  
✅ Customer acknowledgment checkbox

**Key Legal Points:**
- "LegalOps reserves the right to refuse service at our sole discretion"
- "No charges will be processed for declined orders"
- "We may request additional verification"
- Customer must check box to proceed

---

## 🧪 Testing the Integration

### **Test the Complete Flow:**

1. **Visit:** `http://localhost:3001/checkout-example`

2. **Test Low Risk Order:**
   - Accept disclaimer
   - Use normal email (gmail.com)
   - Use credit card
   - No rush order
   - **Expected:** Order approved, proceeds to payment

3. **Test High Risk Order:**
   - Modify code to use `test@tempmail.com`
   - Use prepaid card
   - Enable rush order
   - **Expected:** Order declined or verification required

---

## 📊 Admin Dashboard Integration

High-risk orders that require verification will appear in:

**URL:** `/admin/risk-management`

**Features:**
- View all orders requiring review
- See risk factors and AI reasoning
- Approve/decline/verify orders
- Add review notes

---

## 🔒 Security Best Practices

### **DO:**
✅ Run risk assessment BEFORE payment processing  
✅ Log all declined attempts for audit trail  
✅ Show professional, non-accusatory decline messages  
✅ Provide clear path to support for legitimate customers  
✅ Monitor false positive rate and adjust thresholds  

### **DON'T:**
❌ Process payment before risk assessment  
❌ Tell customer their specific risk score  
❌ Explain exact fraud detection methods  
❌ Auto-decline without logging  
❌ Ignore verification requests  

---

## 📈 Monitoring & Optimization

### **Key Metrics to Track:**

1. **Decline Rate** - % of orders declined
2. **Verification Rate** - % requiring verification
3. **False Positive Rate** - Legitimate customers declined
4. **Fraud Caught** - Actual fraudulent orders prevented
5. **Customer Support Tickets** - Declined order inquiries

### **Recommended Thresholds:**

- **Decline Rate:** < 2% (if higher, thresholds may be too strict)
- **Verification Rate:** 5-10% (acceptable for fraud prevention)
- **False Positive Rate:** < 1% (minimize legitimate customer friction)

---

## 🎯 Next Steps

1. ✅ Test the example checkout flow
2. ✅ Customize disclaimer text for your business
3. ✅ Create email templates for declined/verification
4. ✅ Integrate into your existing checkout page
5. ✅ Set up admin notifications for high-risk orders
6. ✅ Train support team on verification process
7. ✅ Monitor metrics and adjust thresholds

---

## 📞 Support Integration

### **When Customer Contacts Support:**

1. Look up order in Risk Management Dashboard
2. Review risk factors and AI reasoning
3. Request verification if appropriate:
   - Government ID
   - Business documentation
   - Billing address confirmation
4. Manually approve in dashboard
5. Process payment manually or send payment link

---

**Questions?** See `RISK_SCORING_IMPLEMENTATION_GUIDE.md` for technical details.

