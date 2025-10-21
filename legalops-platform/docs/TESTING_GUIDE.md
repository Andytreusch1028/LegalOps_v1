# End-to-End Testing Guide

## Overview
This guide walks through testing the complete checkout flow from service selection to order confirmation.

---

## Prerequisites

### 1. Environment Setup
- [ ] Stripe test keys configured in `.env`
- [ ] SendGrid API key configured in `.env`
- [ ] Database seeded with services
- [ ] Dev server running (`npm run dev`)

### 2. Test Account
- [ ] Create a test user account at http://localhost:3000/auth/signup
- [ ] Use email: `test@example.com`
- [ ] Use password: `TestPassword123!`

### 3. Stripe Test Cards
Use these test card numbers in Stripe Elements:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 2500 0000 3155`

Any future expiry date and any 3-digit CVC

---

## Test Scenario 1: LLC Formation Order (Success Path)

### Step 1: Browse Services
1. Go to http://localhost:3000/services
2. Verify you see:
   - ✅ "Florida Business Services" header
   - ✅ Filter buttons (LLC FORMATION, ANNUAL REPORT, DISSOLUTION)
   - ✅ Service cards with pricing
   - ✅ Cards have hover effects (lift up slightly)

### Step 2: Select LLC Formation
1. Click "LLC FORMATION" filter button
2. Verify only LLC formation services show
3. Click on "LLC Formation" service card
4. Should navigate to service detail page

### Step 3: Fill LLC Formation Form
1. Fill in business details:
   - Business Name: `Test LLC ${Date.now()}`
   - Business Purpose: `General business purposes`
   - Registered Agent: Select from dropdown
   - Principal Address: Enter valid Florida address
   - Member/Manager: Add at least one member

2. Verify:
   - ✅ Form validation works
   - ✅ Address validation modal appears
   - ✅ All required fields are marked

### Step 4: Proceed to Checkout
1. Click "Proceed to Checkout" button
2. Should navigate to checkout page with order ID in URL

### Step 5: Review Order Summary
1. Verify order summary shows:
   - ✅ Service name
   - ✅ Subtotal
   - ✅ Tax
   - ✅ Total amount

### Step 6: Accept Service Agreement
1. Read the three disclaimers:
   - Right to Refuse Service
   - No Guarantee
   - Fraud Detection
2. Check the acceptance checkbox
3. Verify error message disappears

### Step 7: Enter Payment Information
1. In Stripe Elements form, enter:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - Cardholder Name: Test User

2. Verify:
   - ✅ Form accepts input
   - ✅ No validation errors

### Step 8: Submit Payment
1. Click "Pay $XX.XX" button
2. Wait for processing (should take 2-3 seconds)
3. Should redirect to confirmation page

### Step 9: Verify Confirmation Page
1. Verify you see:
   - ✅ "Order Confirmed!" message
   - ✅ Order number
   - ✅ Order details (service, amount, date)
   - ✅ Next steps information
   - ✅ "View Order" button

### Step 10: Check Dashboard
1. Go to http://localhost:3000/dashboard/orders
2. Verify:
   - ✅ New order appears in list
   - ✅ Order status shows "PAID"
   - ✅ Order amount is correct

### Step 11: Verify Email (Optional)
1. Check test email inbox
2. Verify:
   - ✅ Confirmation email received
   - ✅ Email contains order number
   - ✅ Email contains service details
   - ✅ Email contains next steps

---

## Test Scenario 2: Annual Report Order

Repeat Test Scenario 1 but:
1. Click "ANNUAL REPORT" filter
2. Select annual report service
3. Fill in business details for annual report
4. Complete checkout with same payment method

---

## Test Scenario 3: Payment Decline

### Steps 1-6: Same as Scenario 1

### Step 7: Enter Declined Card
1. In Stripe Elements form, enter:
   - Card: `4000 0000 0000 0002` (decline card)
   - Expiry: Any future date
   - CVC: Any 3 digits

### Step 8: Submit Payment
1. Click "Pay $XX.XX" button
2. Should show error message
3. Should NOT redirect to confirmation page
4. Should stay on checkout page

### Step 9: Verify No Order Created
1. Go to dashboard
2. Verify order count hasn't increased

---

## Test Scenario 4: Dissolution Filing

Repeat Test Scenario 1 but:
1. Click "DISSOLUTION" filter
2. Select dissolution service
3. Complete checkout

---

## Checklist: All Tests Passed ✅

- [ ] LLC formation order completes successfully
- [ ] Annual report order completes successfully
- [ ] Dissolution order completes successfully
- [ ] Payment success redirects to confirmation
- [ ] Payment decline shows error and stays on checkout
- [ ] Order appears in dashboard after payment
- [ ] Confirmation email is sent (if SendGrid configured)
- [ ] Order summary displays correct amounts
- [ ] Service agreement disclaimers show
- [ ] Fraud protection disclaimers show
- [ ] Hover effects work on service cards
- [ ] Mobile responsive design works

---

## Troubleshooting

### Issue: "Initializing payment..." stays forever
- Check browser console for errors
- Verify Stripe keys in `.env`
- Check network tab for failed requests

### Issue: Payment form doesn't appear
- Verify `@stripe/react-stripe-js` is installed
- Check browser console for errors
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set

### Issue: Order doesn't appear in dashboard
- Check database for order record
- Verify webhook is processing correctly
- Check server logs for errors

### Issue: Email not received
- Verify SendGrid API key is correct
- Check SendGrid dashboard for bounces
- Verify `FROM_EMAIL` is configured

---

## Performance Notes

- Service page should load in < 1 second
- Checkout page should load in < 2 seconds
- Payment processing should complete in 2-5 seconds
- Confirmation page should load immediately

---

## Next Steps After Testing

1. Fix any bugs found
2. Optimize performance if needed
3. Add simple fraud detection
4. Polish UI/UX
5. Deploy to staging environment

