# DBA Implementation - Complete Testing Checklist

**Status:** Ready for comprehensive testing  
**Last Updated:** 2025-11-05

---

## 🎯 Testing Overview

This checklist covers all aspects of the DBA (Fictitious Name Registration) implementation, from form entry to payment completion.

---

## ✅ COMPLETED TESTS

### **1. Auto-Save System** ✅
- [x] Auto-save triggers every 30 seconds
- [x] Status indicator appears (blue "Saving...")
- [x] Status changes to green "Saved at [time]"
- [x] Indicator hides when idle (no white box)
- [x] Draft saves to database
- [x] Auto-load works on return

### **2. Calendar Reminder Download** ✅
- [x] Calendar button appears for authenticated users
- [x] Calendar button appears for guest users
- [x] .ics file downloads correctly
- [x] Calendar event has correct details
- [x] Button persists (doesn't disappear after 5 seconds)

---

## ⚠️ TESTS NEEDED

### **Test Group 1: Form Wizard - Basic Functionality** (30 minutes)

#### **Test 1.1: Step 1 - Fictitious Name & Email**
- [ ] Fictitious name field accepts input
- [ ] Email field accepts valid email
- [ ] Email field rejects invalid email format
- [ ] "Next" button disabled until both fields filled
- [ ] "Next" button enabled when fields valid
- [ ] Progress shows "Step 1 of 5 (20%)"
- [ ] Can't proceed without filling required fields

#### **Test 1.2: Step 2 - Business Location**
- [ ] Street address field accepts input
- [ ] City field accepts input
- [ ] State defaults to "FL"
- [ ] ZIP code field accepts 5-digit ZIP
- [ ] ZIP code rejects invalid formats
- [ ] County auto-fills based on IP geolocation
- [ ] County can be manually changed
- [ ] Blue info banner shows if county auto-filled
- [ ] "Back" button returns to Step 1 with data preserved
- [ ] "Next" button validates all required fields
- [ ] Progress shows "Step 2 of 5 (40%)"

#### **Test 1.3: Step 3 - Owner Information**
- [ ] Owner type selector shows "Individual" and "Business Entity"
- [ ] Individual owner fields appear by default
- [ ] First name, last name required
- [ ] Middle name optional
- [ ] Owner address fields required
- [ ] "Add Another Owner" button works
- [ ] Can remove additional owners
- [ ] Switching to "Business Entity" shows different fields
- [ ] Business entity name required
- [ ] Florida Document Number field appears
- [ ] "Back" button preserves data
- [ ] Progress shows "Step 3 of 5 (60%)"

#### **Test 1.4: Step 4 - Advertisement (Critical UPL Compliance)**
- [ ] "Have you already published?" defaults to NO
- [ ] Newspaper name field hidden when NO selected
- [ ] Publication date field hidden when NO selected
- [ ] Newspaper directory link appears
- [ ] Clicking link opens Florida Press Association in new tab
- [ ] Switching to YES shows newspaper name field
- [ ] Switching to YES shows publication date field
- [ ] Newspaper name required when YES selected
- [ ] Publication date required when YES selected
- [ ] Date picker works correctly
- [ ] Warning message about false certification appears
- [ ] Payment timing selector appears
- [ ] "Pay Now" option available
- [ ] "Pay After Publication" option available
- [ ] Conditional messaging changes based on selection
- [ ] Progress shows "Step 4 of 5 (80%)"

#### **Test 1.5: Step 5 - Review & Submit**
- [ ] All entered data displays correctly
- [ ] Fictitious name shows correctly
- [ ] Business address shows correctly
- [ ] County shows correctly
- [ ] Owner information shows correctly (all owners)
- [ ] Publication status shows correctly
- [ ] Payment timing shows correctly
- [ ] Order summary calculates correctly ($50 base)
- [ ] Certificate of Status checkbox works (+$10)
- [ ] Certified Copy checkbox works (+$30)
- [ ] Total updates when add-ons selected
- [ ] "Back" button works
- [ ] "Submit" button enabled
- [ ] Progress shows "Step 5 of 5 (100%)"

---

### **Test Group 2: Guest User Workflow** (45 minutes)

#### **Test 2.1: Save Draft as Guest**
- [ ] Log out (or use incognito window)
- [ ] Fill out Steps 1-3
- [ ] Click "Save & Get Link" button on Step 4
- [ ] Success message appears
- [ ] Calendar download button appears
- [ ] Calendar button works (downloads .ics file)
- [ ] Email sent notification appears (or warning if SendGrid not configured)
- [ ] Draft saved to DBADraft table (check Prisma Studio)
- [ ] Magic link token generated

#### **Test 2.2: Resume Draft via Magic Link (Guest)**
- [ ] Open email (if SendGrid configured)
- [ ] Click magic link in email
- [ ] OR manually navigate to `/dba/resume/[token]`
- [ ] Form loads with saved data
- [ ] Starts at Step 4 (publication step)
- [ ] All previous data preserved
- [ ] Can complete remaining steps
- [ ] Can proceed to checkout

#### **Test 2.3: Guest Checkout Flow**
- [ ] Complete all steps as guest
- [ ] Click "Submit" on Step 5
- [ ] Redirects to checkout page
- [ ] Order summary shows correct items
- [ ] Total matches expected amount
- [ ] Can enter payment information
- [ ] Payment processes successfully (test mode)
- [ ] Order confirmation appears
- [ ] Confirmation email sent (if SendGrid configured)

---

### **Test Group 3: Authenticated User Workflow** (45 minutes)

#### **Test 3.1: Save Draft as Authenticated User**
- [ ] Log in to account
- [ ] Fill out Steps 1-3
- [ ] Click "Save & Get Link" button on Step 4
- [ ] Success message appears
- [ ] Calendar download button appears
- [ ] Draft saved to FormDraft table (check Prisma Studio)
- [ ] Important Notice created in dashboard
- [ ] Email sent with magic link (if SendGrid configured)

#### **Test 3.2: Dashboard - Incomplete Filings**
- [ ] Navigate to `/dashboard/customer`
- [ ] "Important Notices" section appears
- [ ] Notice shows "DBA Registration Saved"
- [ ] Notice shows fictitious name
- [ ] "View Details" button works
- [ ] "Incomplete Filings" section appears
- [ ] Shows "DBA Registration - [Name]"
- [ ] Shows progress (e.g., "Step 4 of 5")
- [ ] Shows progress bar (80%)
- [ ] Shows "Last saved: [time]"
- [ ] "Resume Filing" button appears
- [ ] "Delete" button appears

#### **Test 3.3: Resume from Dashboard**
- [ ] Click "Resume Filing" button
- [ ] Redirects to DBA wizard
- [ ] Form loads with saved data
- [ ] Starts at saved step (Step 4)
- [ ] All previous data preserved
- [ ] Can complete remaining steps
- [ ] Auto-save continues to work

#### **Test 3.4: Delete Draft from Dashboard**
- [ ] Navigate to dashboard
- [ ] Click delete button (🗑️) on DBA draft
- [ ] Confirmation dialog appears
- [ ] Click "Confirm Delete"
- [ ] Draft removed from dashboard
- [ ] Record deleted from database (check Prisma Studio)
- [ ] "Incomplete Filings" section disappears if no other drafts

#### **Test 3.5: Authenticated Checkout Flow**
- [ ] Complete all steps as authenticated user
- [ ] Click "Submit" on Step 5
- [ ] Redirects to checkout page
- [ ] Order summary shows correct items
- [ ] User information pre-filled from account
- [ ] Can modify payment information
- [ ] Payment processes successfully (test mode)
- [ ] Order confirmation appears
- [ ] Order appears in dashboard order history
- [ ] Confirmation email sent (if SendGrid configured)

---

### **Test Group 4: Payment Timing Logic** (30 minutes)

#### **Test 4.1: "Pay Now" - Already Published**
- [ ] Select "YES" for already published
- [ ] Enter newspaper name and date
- [ ] Select "Pay Now" payment timing
- [ ] Conditional message shows: "You'll pay now and we'll file immediately"
- [ ] Proceed to checkout
- [ ] Payment processes
- [ ] Order status = "PENDING" (awaiting filing)
- [ ] Filing happens immediately (or queued for processing)

#### **Test 4.2: "Pay Now" - Not Yet Published**
- [ ] Select "NO" for already published
- [ ] Select "Pay Now" payment timing
- [ ] Conditional message shows: "You'll pay now, publish ad, then notify us"
- [ ] Proceed to checkout
- [ ] Payment processes
- [ ] Order status = "AWAITING_PUBLICATION"
- [ ] Reminder email sent to publish ad

#### **Test 4.3: "Pay After Publication" - Not Yet Published**
- [ ] Select "NO" for already published
- [ ] Select "Pay After Publication" payment timing
- [ ] Conditional message shows: "Publish ad first, then return to pay"
- [ ] Click "Save & Get Link"
- [ ] Draft saved (no payment yet)
- [ ] Email sent with magic link
- [ ] Calendar reminder downloaded
- [ ] Can return later to complete payment

#### **Test 4.4: Return to Pay After Publication**
- [ ] Resume saved draft (from Test 4.3)
- [ ] Change "Already published?" to YES
- [ ] Enter newspaper name and date
- [ ] Select "Pay Now" (or keep "Pay After Publication")
- [ ] Proceed to checkout
- [ ] Payment processes
- [ ] Order status = "PENDING"
- [ ] Filing happens immediately

---

### **Test Group 5: Edge Cases & Error Handling** (30 minutes)

#### **Test 5.1: Invalid Magic Link Token**
- [ ] Navigate to `/dba/resume/invalid-token-12345`
- [ ] Error message appears: "Invalid or expired link"
- [ ] Provides option to start new filing
- [ ] Doesn't crash the application

#### **Test 5.2: Expired Magic Link Token**
- [ ] Create draft with magic link
- [ ] Manually update token expiry in database (set to past date)
- [ ] Try to resume with expired token
- [ ] Error message appears: "Link has expired"
- [ ] Provides option to request new link

#### **Test 5.3: Form Validation Errors**
- [ ] Try to proceed without filling required fields
- [ ] Error messages appear for each missing field
- [ ] Error messages are clear and helpful
- [ ] Can't proceed until errors fixed
- [ ] Errors clear when fields filled correctly

#### **Test 5.4: Network Errors**
- [ ] Fill out form
- [ ] Disconnect internet
- [ ] Try to save draft
- [ ] Error message appears
- [ ] Auto-save shows "Save failed" indicator
- [ ] Reconnect internet
- [ ] Auto-save resumes successfully

#### **Test 5.5: Duplicate Fictitious Name**
- [ ] Enter fictitious name that already exists
- [ ] System checks for duplicates (if implemented)
- [ ] Warning message appears (if duplicate found)
- [ ] User can proceed anyway (with acknowledgment)

---

### **Test Group 6: Email Notifications** (15 minutes)

**Note:** Requires production SendGrid API key

#### **Test 6.1: Guest Draft Saved Email**
- [ ] Save draft as guest
- [ ] Email received at provided address
- [ ] Subject line clear and professional
- [ ] Magic link works when clicked
- [ ] Email includes calendar attachment (optional)
- [ ] Email includes instructions

#### **Test 6.2: Authenticated Draft Saved Email**
- [ ] Save draft as authenticated user
- [ ] Email received at account email
- [ ] Subject line clear and professional
- [ ] Magic link works when clicked
- [ ] Email includes dashboard link
- [ ] Email includes instructions

#### **Test 6.3: Order Confirmation Email**
- [ ] Complete payment
- [ ] Confirmation email received
- [ ] Includes order number
- [ ] Includes order summary
- [ ] Includes next steps
- [ ] Includes contact information

---

### **Test Group 7: Mobile Responsiveness** (20 minutes)

#### **Test 7.1: Mobile Form Experience**
- [ ] Open DBA wizard on mobile device (or Chrome DevTools mobile view)
- [ ] Form displays correctly on small screens
- [ ] All fields accessible and usable
- [ ] Buttons properly sized for touch
- [ ] Progress indicator visible
- [ ] Auto-save indicator doesn't overlap content
- [ ] Can complete entire form on mobile

#### **Test 7.2: Mobile Dashboard**
- [ ] Open dashboard on mobile
- [ ] Important Notices section displays correctly
- [ ] Incomplete Filings section displays correctly
- [ ] "Resume Filing" button works
- [ ] All content readable and accessible

---

### **Test Group 8: Browser Compatibility** (30 minutes)

#### **Test 8.1: Chrome**
- [ ] All features work in Chrome
- [ ] No console errors
- [ ] UI displays correctly

#### **Test 8.2: Firefox**
- [ ] All features work in Firefox
- [ ] No console errors
- [ ] UI displays correctly

#### **Test 8.3: Safari**
- [ ] All features work in Safari
- [ ] No console errors
- [ ] UI displays correctly

#### **Test 8.4: Edge**
- [ ] All features work in Edge
- [ ] No console errors
- [ ] UI displays correctly

---

### **Test Group 9: Performance & Load Testing** (Optional - 1 hour)

#### **Test 9.1: Large Form Data**
- [ ] Add 10+ individual owners
- [ ] Add 10+ business entity owners
- [ ] Form remains responsive
- [ ] Auto-save handles large data
- [ ] Review step displays all data correctly

#### **Test 9.2: Concurrent Users**
- [ ] Multiple users save drafts simultaneously
- [ ] No database conflicts
- [ ] Each user's data isolated correctly

---

## 📊 Testing Progress Summary

**Total Test Groups:** 9  
**Estimated Testing Time:** 4-5 hours

### **Completion Status:**

- [x] **Group 1:** Auto-Save System (COMPLETE)
- [x] **Group 2:** Calendar Reminder (COMPLETE)
- [ ] **Group 3:** Form Wizard Basic Functionality
- [ ] **Group 4:** Guest User Workflow
- [ ] **Group 5:** Authenticated User Workflow
- [ ] **Group 6:** Payment Timing Logic
- [ ] **Group 7:** Edge Cases & Error Handling
- [ ] **Group 8:** Email Notifications (requires SendGrid)
- [ ] **Group 9:** Mobile Responsiveness
- [ ] **Group 10:** Browser Compatibility
- [ ] **Group 11:** Performance & Load Testing (optional)

---

## 🎯 Recommended Testing Order

### **Phase 1: Core Functionality** (Day 1 - 2 hours)
1. Test Group 3: Form Wizard Basic Functionality
2. Test Group 7: Edge Cases & Error Handling

### **Phase 2: User Workflows** (Day 2 - 2 hours)
3. Test Group 4: Guest User Workflow
4. Test Group 5: Authenticated User Workflow

### **Phase 3: Payment & Business Logic** (Day 3 - 1 hour)
5. Test Group 6: Payment Timing Logic

### **Phase 4: Polish & Compatibility** (Day 4 - 1.5 hours)
6. Test Group 9: Mobile Responsiveness
7. Test Group 10: Browser Compatibility

### **Phase 5: Production Readiness** (Day 5 - 30 minutes)
8. Get SendGrid production API key
9. Test Group 8: Email Notifications
10. Final end-to-end test

---

## 🐛 Bug Tracking Template

When you find issues, document them like this:

```
**Bug #:** ___
**Test Group:** ___
**Severity:** [ ] Critical  [ ] High  [ ] Medium  [ ] Low
**Description:** ___________________________________________
**Steps to Reproduce:**
1. ___________
2. ___________
3. ___________
**Expected Result:** ___________
**Actual Result:** ___________
**Screenshots:** (attach if applicable)
**Status:** [ ] Open  [ ] In Progress  [ ] Fixed  [ ] Won't Fix
```

---

## ✅ Sign-Off Checklist

Before marking DBA implementation as "Production Ready":

- [ ] All critical tests pass
- [ ] All high-priority bugs fixed
- [ ] SendGrid production API key configured
- [ ] Email delivery tested and working
- [ ] Payment processing tested (test mode)
- [ ] Mobile experience verified
- [ ] At least 2 browsers tested
- [ ] Dashboard integration verified
- [ ] Auto-save system verified
- [ ] UPL compliance features verified
- [ ] Documentation complete
- [ ] Pre-production checklist reviewed

---

**Next Step:** Start with **Phase 1: Core Functionality** testing!

Would you like to begin testing now, or do you have questions about any of the test scenarios?

