# DBA Auto-Save System - Testing Guide

## 🎯 Overview

The DBA auto-save system is **fully implemented** and ready for testing. This guide will help you verify all auto-save functionality works correctly.

---

## ✅ What's Already Implemented

### **1. Auto-Save Logic** ✅
- **Location:** `src/components/FictitiousNameWizard.tsx` (lines 129-209)
- **Frequency:** Every 30 seconds
- **Trigger:** Automatic for authenticated users
- **Conditions:**
  - User must be logged in
  - Must be past Step 1 (has data to save)
  - Must have entered fictitious name (not empty)

### **2. Auto-Save Status Indicator** ✅
- **Location:** `src/components/FictitiousNameWizard.tsx` (lines 491-535)
- **Position:** Fixed bottom-right corner
- **States:**
  - **Idle:** Hidden (no indicator)
  - **Saving:** Blue background, pulsing save icon, "Saving..."
  - **Saved:** Green background, checkmark icon, "Saved at 2:45 PM"
  - **Error:** Red background, alert icon, "Save failed"

### **3. Auto-Load on Mount** ✅
- **Location:** `src/components/FictitiousNameWizard.tsx` (lines 105-163)
- **Trigger:** When authenticated user opens DBA wizard
- **Behavior:** Automatically loads saved draft and resumes at saved step

### **4. API Endpoints** ✅
- **Save:** `/api/form-drafts/save` (POST)
- **Load:** `/api/form-drafts/load?formType=DBA_REGISTRATION` (GET)
- **List:** `/api/form-drafts/list` (GET) - for dashboard
- **Delete:** `/api/form-drafts/delete` (DELETE)

### **5. Database Schema** ✅
- **Model:** `FormDraft` in `prisma/schema.prisma`
- **Fields:** userId, formType, formData, currentStep, totalSteps, displayName, emailRemindersEnabled, createdAt, updatedAt

---

## 🧪 Testing Checklist

### **Test 1: Auto-Save Functionality**

**Prerequisites:**
- User must be logged in
- Dev server running (`npm run dev`)

**Steps:**
1. Log in to LegalOps
2. Navigate to `/services/fictitious-name-registration`
3. Fill out Step 1:
   - Fictitious Name: "Test Auto Save DBA"
   - Email: your email
4. Click "Next" to go to Step 2
5. **Wait 30 seconds** (auto-save interval)
6. **Expected Result:** 
   - ✅ Auto-save indicator appears in bottom-right corner
   - ✅ Shows "Saving..." (blue background, pulsing icon)
   - ✅ Changes to "Saved at [time]" (green background, checkmark)
   - ✅ Disappears after 2 seconds

**Verification:**
- Open browser console (F12)
- Look for: `[Auto-save] Saving draft...` and `[Auto-save] Draft saved successfully`
- Check Prisma Studio: `npx prisma studio`
  - Navigate to `FormDraft` table
  - Verify record exists with your userId and formType = "DBA_REGISTRATION"

---

### **Test 2: Auto-Load on Return**

**Prerequisites:**
- Completed Test 1 (draft saved)

**Steps:**
1. Close the browser tab (or navigate away)
2. Open a new tab and log in again
3. Navigate to `/services/fictitious-name-registration`
4. **Expected Result:**
   - ✅ Form automatically loads with saved data
   - ✅ Wizard starts at Step 2 (where you left off)
   - ✅ All form fields are populated with saved data
   - ✅ Auto-save indicator shows "Saved at [time]" briefly

**Verification:**
- Check browser console for: `[Auto-save] Loaded saved draft`
- Verify all form fields match what you entered in Test 1

---

### **Test 3: Auto-Save Across Multiple Steps**

**Prerequisites:**
- User logged in
- Fresh start (delete existing draft in Prisma Studio if needed)

**Steps:**
1. Start DBA wizard
2. Fill out Step 1 and click "Next"
3. Fill out Step 2 (address, county) and click "Next"
4. Fill out Step 3 (owner info) and click "Next"
5. **Wait 30 seconds at each step**
6. **Expected Result:**
   - ✅ Auto-save indicator appears at each step
   - ✅ Draft updates with new data at each step
   - ✅ currentStep increments in database

**Verification:**
- Check Prisma Studio after each step
- Verify `formData` JSON contains all entered data
- Verify `currentStep` matches current wizard step

---

### **Test 4: Auto-Save Error Handling**

**Prerequisites:**
- User logged in
- Dev server running

**Steps:**
1. Start DBA wizard and fill out Step 1
2. Click "Next" to Step 2
3. **Stop the dev server** (Ctrl+C in terminal)
4. **Wait 30 seconds** for auto-save to trigger
5. **Expected Result:**
   - ✅ Auto-save indicator shows "Saving..."
   - ✅ Changes to "Save failed" (red background, alert icon)
   - ✅ Error logged in browser console

**Verification:**
- Check browser console for error message
- Restart dev server
- Wait 30 seconds - auto-save should succeed again

---

### **Test 5: Dashboard Integration**

**Prerequisites:**
- Completed Test 1 (draft saved)

**Steps:**
1. Navigate to `/dashboard/customer`
2. **Expected Result:**
   - ✅ "Incomplete Filings" section appears
   - ✅ Shows "DBA Registration - Test Auto Save DBA"
   - ✅ Shows progress (e.g., "Step 2 of 5")
   - ✅ Shows progress bar (e.g., 40%)
   - ✅ Shows "Resume Filing" button

3. Click "Resume Filing" button
4. **Expected Result:**
   - ✅ Redirects to DBA wizard
   - ✅ Loads at saved step with all data preserved

**Verification:**
- Check that all form data is intact
- Verify you can continue from where you left off

---

### **Test 6: Multiple Auto-Saves**

**Prerequisites:**
- User logged in

**Steps:**
1. Start DBA wizard
2. Fill out Step 1 and click "Next"
3. **Wait 30 seconds** - first auto-save
4. Edit a field on Step 2
5. **Wait 30 seconds** - second auto-save
6. Edit another field
7. **Wait 30 seconds** - third auto-save
8. **Expected Result:**
   - ✅ Auto-save indicator appears each time
   - ✅ Timestamp updates each time
   - ✅ Only ONE record in database (upsert, not insert)

**Verification:**
- Check Prisma Studio - should only have 1 FormDraft record
- Verify `updatedAt` timestamp changes with each save

---

### **Test 7: Guest vs Authenticated Behavior**

**Test 7a: Guest User (No Auto-Save)**

**Steps:**
1. Log out (or use incognito window)
2. Navigate to `/services/fictitious-name-registration`
3. Fill out Step 1 and click "Next"
4. **Wait 30 seconds**
5. **Expected Result:**
   - ❌ NO auto-save indicator appears
   - ❌ NO auto-save happens (guest users don't get auto-save)

**Test 7b: Authenticated User (Auto-Save)**

**Steps:**
1. Log in
2. Navigate to `/services/fictitious-name-registration`
3. Fill out Step 1 and click "Next"
4. **Wait 30 seconds**
5. **Expected Result:**
   - ✅ Auto-save indicator appears
   - ✅ Draft saved to database

---

### **Test 8: Delete Draft**

**Prerequisites:**
- Draft saved in database

**Steps:**
1. Navigate to `/dashboard/customer`
2. Find "Incomplete Filings" section
3. Click delete button (🗑️) next to DBA draft
4. **Expected Result:**
   - ✅ Draft removed from dashboard
   - ✅ Record deleted from database

**Verification:**
- Check Prisma Studio - FormDraft record should be deleted
- Refresh dashboard - "Incomplete Filings" section should disappear

---

## 🐛 Common Issues & Solutions

### **Issue 1: Auto-Save Indicator Never Appears**

**Possible Causes:**
- User not logged in
- Still on Step 1 with no data
- Auto-save interval hasn't elapsed (wait 30 seconds)

**Solution:**
- Verify user is logged in (check `session?.user?.id`)
- Move to Step 2 or later
- Wait full 30 seconds

---

### **Issue 2: "Save Failed" Error**

**Possible Causes:**
- Dev server not running
- Database connection issue
- API endpoint error

**Solution:**
- Check dev server is running
- Check browser console for error details
- Check terminal for API errors
- Verify database is accessible

---

### **Issue 3: Draft Not Loading on Return**

**Possible Causes:**
- Draft not saved to database
- User logged in with different account
- FormType mismatch

**Solution:**
- Check Prisma Studio for FormDraft record
- Verify userId matches logged-in user
- Verify formType = "DBA_REGISTRATION"

---

### **Issue 4: Multiple Drafts in Database**

**Expected Behavior:** Only ONE draft per user per formType (upsert)

**If Multiple Exist:**
- Check database schema has `@@unique([userId, formType])` constraint
- Run migration: `npx prisma migrate dev`

---

## 📊 Success Criteria

**Auto-Save System is Working If:**

- ✅ Auto-save indicator appears every 30 seconds for authenticated users
- ✅ Draft saves to database successfully
- ✅ Draft loads automatically when user returns
- ✅ Dashboard shows incomplete filings
- ✅ Resume button works from dashboard
- ✅ Only one draft per user per form type
- ✅ Guest users don't see auto-save (correct behavior)
- ✅ Error handling works (shows "Save failed" when server down)

---

## 🎯 Next Steps After Testing

1. **If All Tests Pass:**
   - ✅ Auto-save system is production-ready
   - Move on to testing other DBA features (checkout, payment, etc.)

2. **If Tests Fail:**
   - Document which tests failed
   - Check browser console and terminal for errors
   - Review API endpoint logs
   - Check database schema and migrations

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Test 1: Auto-Save Functionality          [ ] Pass  [ ] Fail
Test 2: Auto-Load on Return              [ ] Pass  [ ] Fail
Test 3: Auto-Save Across Multiple Steps  [ ] Pass  [ ] Fail
Test 4: Auto-Save Error Handling         [ ] Pass  [ ] Fail
Test 5: Dashboard Integration            [ ] Pass  [ ] Fail
Test 6: Multiple Auto-Saves              [ ] Pass  [ ] Fail
Test 7: Guest vs Authenticated Behavior  [ ] Pass  [ ] Fail
Test 8: Delete Draft                     [ ] Pass  [ ] Fail

Notes:
_____________________________________________
_____________________________________________
_____________________________________________
```

---

**Status:** ✅ Auto-save system is fully implemented and ready for testing!  
**Last Updated:** 2025-11-05

