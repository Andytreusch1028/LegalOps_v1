# Manual Testing Steps - Complete Checkout Flow

## Quick Start

1. Open http://localhost:3000 in your browser
2. Sign in with test account (or create new one)
3. Follow the steps below

---

## Step-by-Step Test: LLC Formation Order

### Phase 1: Browse Services (2 minutes)

**URL:** http://localhost:3000/services

**What to verify:**
1. ✅ Page loads without errors
2. ✅ See "Florida Business Services" header
3. ✅ See filter buttons: LLC FORMATION, ANNUAL REPORT, DISSOLUTION
4. ✅ See 15 service cards displayed
5. ✅ Cards have proper spacing (not cramped)
6. ✅ Hover over a card - it should lift up slightly
7. ✅ See pricing on each card

**Expected:** Clean, professional service listing with proper spacing

---

### Phase 2: Select Service (1 minute)

**Action:** Click "LLC FORMATION" filter button

**What to verify:**
1. ✅ Page filters to show only LLC services
2. ✅ See "LLC Formation" card
3. ✅ See "LLC Amendment" card
4. ✅ See "LLC Reinstatement" card
5. ✅ See "LLC Dissolution" card

**Action:** Click on "LLC Formation" card

**What to verify:**
1. ✅ Navigate to service detail page
2. ✅ URL changes to `/services/llc-formation`
3. ✅ See service name, icon, and description
4. ✅ See pricing breakdown (service fee + state fee)
5. ✅ See processing time

**Expected:** Service detail page loads with all information

---

### Phase 3: Fill LLC Formation Form (5 minutes)

**What to verify:**
1. ✅ Form loads with all fields visible
2. ✅ See sections for:
   - Business Information
   - Registered Agent
   - Principal Address
   - Members/Managers

**Fill in the form:**

**Business Information:**
- Business Name: `Test LLC ${Date.now()}` (e.g., `Test LLC 1729446800`)
- Business Purpose: `General business purposes`

**Registered Agent:**
- Click dropdown and select an agent
- Or enter new agent details

**Principal Address:**
- Enter a Florida address
- Click "Validate Address" button
- Address validation modal should appear
- Select the validated address

**Members/Managers:**
- Click "Add Member"
- Fill in member details:
  - Name: `John Doe`
  - Email: `john@example.com`
  - Address: (auto-filled or enter)

**What to verify:**
1. ✅ All fields accept input
2. ✅ Address validation works
3. ✅ Form shows no errors
4. ✅ "Proceed to Checkout" button is enabled

**Action:** Click "Proceed to Checkout"

**Expected:** Navigate to checkout page with order ID in URL

---

### Phase 4: Review Order Summary (2 minutes)

**URL:** http://localhost:3000/checkout/[orderId]

**What to verify:**
1. ✅ Page loads successfully
2. ✅ See "Checkout" header
3. ✅ See order number (e.g., "Order #ORD-001")
4. ✅ See order summary on right side:
   - Subtotal: $75.00
   - Tax: $5.25 (or calculated amount)
   - Total: $80.25 (or calculated amount)

**Expected:** Order summary displays correct amounts

---

### Phase 5: Accept Service Agreement (2 minutes)

**What to verify:**
1. ✅ See "Service Agreement & Fraud Protection" section
2. ✅ See three colored boxes:
   - Blue: "Right to Refuse Service"
   - Amber: "No Guarantee"
   - Green: "Fraud Detection"
3. ✅ See checkbox: "I understand and accept..."
4. ✅ See error message: "You must accept the terms to proceed"

**Action:** Check the acceptance checkbox

**What to verify:**
1. ✅ Error message disappears
2. ✅ Checkbox is checked
3. ✅ Payment form becomes enabled

**Expected:** Terms acceptance works correctly

---

### Phase 6: Enter Payment Information (2 minutes)

**What to verify:**
1. ✅ See "Payment Method" section
2. ✅ See Stripe Elements form with fields:
   - Card number
   - Expiry date
   - CVC
   - Cardholder name

**Fill in payment details:**
- Card Number: `4242 4242 4242 4242` (test success card)
- Expiry: `12/25` (any future date)
- CVC: `123` (any 3 digits)
- Cardholder Name: `Test User`

**What to verify:**
1. ✅ Form accepts input
2. ✅ No validation errors
3. ✅ "Pay $XX.XX" button is visible and enabled

**Expected:** Payment form loads and accepts input

---

### Phase 7: Submit Payment (3 minutes)

**Action:** Click "Pay $XX.XX" button

**What to verify:**
1. ✅ Button shows loading state (e.g., "Processing...")
2. ✅ Wait 2-5 seconds for processing
3. ✅ No errors in browser console
4. ✅ Page redirects to confirmation page

**Expected:** Payment processes successfully and redirects

---

### Phase 8: Verify Confirmation Page (2 minutes)

**URL:** http://localhost:3000/order-confirmation/[orderId]

**What to verify:**
1. ✅ See "Order Confirmed! 🎉" message
2. ✅ See order number
3. ✅ See order details:
   - Service name
   - Amount paid
   - Date
4. ✅ See "What's Next?" section with steps
5. ✅ See "View Order" button

**Action:** Click "View Order" button

**Expected:** Navigate to order details page

---

### Phase 9: Check Dashboard (2 minutes)

**URL:** http://localhost:3000/dashboard/orders

**What to verify:**
1. ✅ See list of orders
2. ✅ New order appears in list
3. ✅ Order status shows "PAID"
4. ✅ Order amount is correct
5. ✅ Order date is today

**Action:** Click on the order

**What to verify:**
1. ✅ Order detail page loads
2. ✅ See all order information
3. ✅ See order status timeline

**Expected:** Order appears in dashboard with correct status

---

### Phase 10: Verify Email (Optional - 2 minutes)

**Check your email inbox:**

**What to verify:**
1. ✅ Confirmation email received
2. ✅ Email subject: "Order Confirmed - [ORDER_NUMBER]"
3. ✅ Email contains:
   - Order number
   - Service name
   - Amount paid
   - Next steps
4. ✅ Email formatting looks professional
5. ✅ "View Order" link works

**Expected:** Professional confirmation email received

---

## Test Completion Checklist

- [ ] Services page loads and displays correctly
- [ ] Service filtering works
- [ ] Service detail page loads
- [ ] LLC formation form works
- [ ] Address validation works
- [ ] Checkout page displays order summary
- [ ] Service agreement disclaimers show
- [ ] Payment form loads
- [ ] Payment processes successfully
- [ ] Confirmation page displays
- [ ] Order appears in dashboard
- [ ] Confirmation email received (if SendGrid configured)

**Total Time:** ~20-25 minutes

---

## If Something Goes Wrong

### Payment form doesn't appear
- Check browser console (F12)
- Look for errors about Stripe
- Verify `.env` has `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Payment fails
- Try the test card again: `4242 4242 4242 4242`
- Check browser console for errors
- Verify Stripe keys are correct

### Order doesn't appear in dashboard
- Refresh the page
- Check browser console for errors
- Verify you're logged in

### Email not received
- Check spam folder
- Verify SendGrid API key is correct
- Check SendGrid dashboard for bounces

---

## Next Test: Payment Decline

After successful payment test, try:
- Card: `4000 0000 0000 0002` (decline card)
- Should show error and NOT redirect
- Order should NOT be created

---

**Happy Testing! 🚀**

