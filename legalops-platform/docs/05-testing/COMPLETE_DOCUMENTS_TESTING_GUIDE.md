# Complete Documents Flow - Testing Guide

**Created:** October 27, 2025  
**Feature:** Post-Payment Data Collection  
**Status:** Ready for Testing

---

## Overview

This guide walks through testing the complete end-to-end flow:
1. Create order with individual services
2. Add upsells (Operating Agreement, EIN Application)
3. Complete payment
4. Complete document forms
5. Verify data saved to database

---

## Prerequisites

- ✅ Dev server running at http://localhost:3000
- ✅ Database migrations applied
- ✅ Test user account created
- ✅ Stripe test mode configured

---

## Test Scenario 1: Operating Agreement Form

### Step 1: Create Test Order
1. Go to http://localhost:3000/test-upsells
2. Click "Create Test Order & View Upsells"
3. You should be redirected to checkout page

### Step 2: Add Operating Agreement Upsell
1. Scroll to "Operating Agreement" card
2. Notice blue info box: "Quick details needed after payment (5 minutes)"
3. Click "Add to Order" button
4. Verify:
   - Button changes to "✕ Remove from Order" (red)
   - Order summary updates to include Operating Agreement ($99)
   - Total updates correctly

### Step 3: Complete Payment (Simulated)
1. Scroll to payment section
2. For testing, we'll need to manually update the order status in database
3. **Option A:** Use Prisma Studio
   - Open Prisma Studio: `npx prisma studio`
   - Find your order
   - Change `paymentStatus` to `PAID`
   - Change `paidAt` to current timestamp
4. **Option B:** Use test payment flow (if implemented)

### Step 4: Navigate to Complete Documents
1. Go to: `http://localhost:3000/orders/[YOUR_ORDER_ID]/complete-documents`
2. Replace `[YOUR_ORDER_ID]` with actual order ID from URL

### Step 5: Test Operating Agreement Form
1. **Verify Page Load:**
   - Page title: "Complete Your Documents"
   - Order number displayed
   - Progress bar shows "0 of 1 documents"
   - Estimated time: "3 minutes remaining"

2. **Verify Wizard UI:**
   - Step indicator shows "1" in purple circle
   - Step label: "Operating Agreement"
   - Form loads correctly

3. **Test Form Fields:**
   - **Pre-fill Notice:** Blue box shows business name (if available)
   - **Members Section:**
     - Default: 1 member with 100% ownership
     - Click "Add Another Member" - verify new member added
     - Fill in member details:
       - Name: "John Doe"
       - Address: "123 Main St, Miami, FL 33101"
       - Ownership: 50%
     - Add second member:
       - Name: "Jane Smith"
       - Address: "456 Oak Ave, Tampa, FL 33602"
       - Ownership: 50%
     - **Verify ownership validation:**
       - Total should show "100.00% ✓" in green box
       - Try changing to 60% + 50% = 110% - should show red warning

4. **Test Management Structure:**
   - Select "Member-Managed" - verify selected
   - Select "Manager-Managed" - verify manager name field appears
   - Enter manager name: "John Doe"

5. **Test Additional Settings:**
   - Fiscal Year End: "12/31"
   - Voting Rights: "Proportional to Ownership"
   - Profit Distribution: "Proportional to Ownership Percentage"
   - Change to "Custom Distribution" - verify textarea appears

6. **Test Auto-Save:**
   - Fill in some fields
   - Click "Save Progress" button
   - Verify "Saved successfully" message appears
   - Check database (Prisma Studio) - verify `additionalData` field updated

7. **Test Navigation:**
   - "Previous" button should be disabled (first step)
   - Click "Next" button
   - If only one document, should complete and redirect to dashboard

---

## Test Scenario 2: EIN Application Form

### Step 1: Create Order with EIN Upsell
1. Go to http://localhost:3000/test-upsells
2. Create new test order
3. Add "EIN Application" upsell ($49)
4. Mark order as PAID (using Prisma Studio)

### Step 2: Navigate to Complete Documents
1. Go to complete-documents page for this order

### Step 3: Test EIN Application Form
1. **Verify Pre-fill Notice:**
   - Blue box shows business name
   - Shows entity type (LLC)

2. **Test Responsible Party Section:**
   - Full Legal Name: "John Doe"
   - SSN/ITIN: "123-45-6789" (test data)
   - Title: "Owner"
   - Verify privacy notice at bottom (yellow box)

3. **Test Business Timeline:**
   - Business Start Date: Select date
   - Number of Employees: Enter "2"
   - Verify "First Date Wages Paid" field appears
   - Enter wage date

4. **Test Tax Classification:**
   - Verify all 6 options display:
     - LLC - Single Member
     - LLC - Multi-Member
     - LLC - Taxed as Corporation
     - Corporation
     - Partnership
     - Sole Proprietorship
   - Select "LLC - Multi-Member (Partnership)"
   - Verify selection highlights in purple

5. **Test Reason for Applying:**
   - Select "Started new business"
   - Change to "Other" - verify textarea appears
   - Enter custom reason

6. **Test Business Activity:**
   - Principal Activity: "Consulting"
   - Specific Product/Service: "Business consulting and advisory services"

7. **Test Save & Complete:**
   - Click "Save Progress"
   - Verify data saved
   - Click "Complete" button
   - Verify redirect to dashboard

---

## Test Scenario 3: Multiple Documents (Operating Agreement + EIN)

### Step 1: Create Order with Both Upsells
1. Create test order
2. Add Operating Agreement ($99)
3. Add EIN Application ($49)
4. Total should be $148
5. Mark as PAID

### Step 2: Test Multi-Step Wizard
1. Navigate to complete-documents page
2. **Verify Progress:**
   - Progress bar: "0 of 2 documents"
   - Estimated time: "6 minutes remaining" (3 min × 2)

3. **Test Step Indicator:**
   - Step 1 circle: Purple with "1"
   - Step 2 circle: Gray with "2"
   - Connector line: Gray

4. **Complete Step 1 (Operating Agreement):**
   - Fill in all required fields
   - Click "Next"
   - Verify auto-save triggers
   - Verify navigation to Step 2

5. **Verify Step 2 UI:**
   - Step 1 circle: Green with checkmark ✓
   - Step 2 circle: Purple with "2"
   - Connector line: Green gradient
   - Progress bar: "1 of 2 documents" (50%)

6. **Complete Step 2 (EIN Application):**
   - Fill in all required fields
   - Click "Complete" button
   - Verify redirect to dashboard with success message

---

## Test Scenario 4: Save and Resume Later

### Step 1: Start Form
1. Create order with Operating Agreement
2. Mark as PAID
3. Navigate to complete-documents page

### Step 2: Partial Completion
1. Fill in first member only
2. Click "Save Progress"
3. Click "Save and finish later" link at bottom
4. Verify redirect to dashboard

### Step 3: Resume
1. Navigate back to complete-documents page
2. **Verify data persisted:**
   - First member name should be filled in
   - Ownership percentage should be saved
   - Other fields should be empty

3. Complete remaining fields
4. Click "Complete"

---

## Database Verification

### Check OrderItem Data
1. Open Prisma Studio: `npx prisma studio`
2. Navigate to `OrderItem` table
3. Find your test order items
4. **Verify fields:**
   - `requiresAdditionalData`: `true`
   - `additionalDataCollected`: `true` (after completion)
   - `additionalData`: JSON object with form data
   - `dataCollectionFormType`: "OPERATING_AGREEMENT" or "EIN_APPLICATION"

### Sample additionalData JSON (Operating Agreement):
```json
{
  "members": [
    {
      "name": "John Doe",
      "address": "123 Main St, Miami, FL 33101",
      "ownershipPercentage": 50,
      "capitalContribution": 10000
    },
    {
      "name": "Jane Smith",
      "address": "456 Oak Ave, Tampa, FL 33602",
      "ownershipPercentage": 50,
      "capitalContribution": 10000
    }
  ],
  "managementStructure": "MEMBER_MANAGED",
  "fiscalYearEnd": "12/31",
  "votingRights": "PROPORTIONAL",
  "profitDistribution": "PROPORTIONAL"
}
```

### Sample additionalData JSON (EIN Application):
```json
{
  "responsiblePartyName": "John Doe",
  "responsiblePartySSN": "***-**-6789",
  "responsiblePartyTitle": "Owner",
  "businessStartDate": "2025-01-01",
  "numberOfEmployees": 2,
  "taxClassification": "LLC_PARTNERSHIP",
  "reasonForApplying": "STARTED_NEW_BUSINESS",
  "principalActivity": "Consulting",
  "specificProductOrService": "Business consulting and advisory services"
}
```

---

## Expected Behaviors

### ✅ Success Criteria
- [ ] Forms load without errors
- [ ] Pre-filled data displays correctly
- [ ] All form fields are functional
- [ ] Validation works (ownership must equal 100%)
- [ ] Auto-save saves data to database
- [ ] Progress bar updates correctly
- [ ] Step indicator shows correct status
- [ ] Navigation between steps works
- [ ] "Save and finish later" preserves data
- [ ] Completion redirects to dashboard
- [ ] Data persists in database

### ❌ Known Issues to Watch For
- SSN field should mask input (not implemented yet)
- Pre-fill from LLC formation data (requires filing data)
- Email notifications (not implemented yet)
- Dashboard "Action Required" notice (not implemented yet)

---

## Next Steps After Testing

1. **If tests pass:**
   - Add Annual Report form
   - Add Certificate of Status form
   - Add Corporate Bylaws form
   - Implement email reminders
   - Add dashboard notices

2. **If tests fail:**
   - Document errors
   - Check browser console for errors
   - Check server logs
   - Verify database schema
   - Check API responses

---

## Quick Test Commands

```bash
# Start dev server
npm run dev

# Open Prisma Studio
npx prisma studio

# Check database
npx prisma db push

# View logs
# Check terminal running dev server
```

---

**Happy Testing!** 🚀

