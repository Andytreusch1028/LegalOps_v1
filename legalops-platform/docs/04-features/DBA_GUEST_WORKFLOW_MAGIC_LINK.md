# DBA Guest Workflow with Magic Link Resume

## 📋 Overview

This document describes the **Guest DBA Workflow with Magic Link Resume** feature that solves the critical UX problem of guests needing to pause their DBA registration to publish a newspaper advertisement.

---

## 🎯 Problem Statement

**The Challenge:**
Florida law requires DBA applicants to publish their fictitious name in a newspaper BEFORE filing with the state. This creates a timing problem:

1. Guest starts DBA wizard
2. Guest reaches Step 4 (newspaper publication requirement)
3. Guest needs to pause and publish ad (takes 1-15 days)
4. **PROBLEM:** How does guest return to complete their order without creating an account?

**The Solution:**
Implement a "magic link" system that allows guests to:
- Save their DBA form data at Step 4
- Receive a secure email link
- Return days/weeks later to complete their registration
- All without creating an account

---

## 🔄 Complete User Flow

### **Phase 1: Initial Registration (Steps 1-3)**

1. Guest visits `/services/fictitious-name-registration`
2. Guest fills out DBA wizard:
   - **Step 1:** Fictitious Name + Email
   - **Step 2:** Business Location (county, address, FEIN)
   - **Step 3:** Owner Information
3. Guest proceeds to Step 4

### **Phase 2: Newspaper Publication Pause (Step 4)**

1. Guest reaches Step 4: "Newspaper Publication Required"
2. Guest sees:
   - Legal requirement explanation
   - Simple 3-step process
   - UPL disclaimer
   - **"Save & Email Me a Link to Return" button**
3. Guest clicks "Save & Get Link" button
4. System:
   - Validates email (from Step 1)
   - Saves form data to database
   - Generates secure token
   - Sends magic link email
5. Guest receives email with:
   - Saved fictitious name
   - Instructions for newspaper publication
   - Magic link button (expires in 7 days)
6. Guest closes browser and publishes newspaper ad

### **Phase 3: Return & Complete (Days/Weeks Later)**

1. Guest clicks magic link in email
2. System:
   - Validates token
   - Checks expiration
   - Loads saved form data
   - Redirects to DBA wizard at Step 4
3. Guest sees all their data preserved
4. Guest checks "I certify I have published..." checkbox
5. Guest proceeds to Step 5 (Review)
6. Guest submits and proceeds to checkout
7. Guest completes payment

---

## 🗄️ Database Schema

### **DBADraft Model**

```prisma
model DBADraft {
  id          String   @id @default(cuid())
  email       String   // Guest email address
  formData    String   // JSON string of form data
  token       String   @unique // Magic link token
  expiresAt   DateTime // Link expiration (7 days)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([token])
  @@index([email])
  @@index([expiresAt])
  @@map("dba_drafts")
}
```

**Fields:**
- `id` - Unique identifier
- `email` - Guest's email address (from Step 1)
- `formData` - JSON string containing all form data
- `token` - Secure random token for magic link
- `expiresAt` - Link expiration date (7 days from creation)
- `createdAt` - When draft was saved
- `updatedAt` - Last update timestamp

---

## 🔌 API Endpoints

### **1. POST `/api/dba/save-draft`**

**Purpose:** Save DBA form data and send magic link email

**Request Body:**
```json
{
  "formData": {
    "fictitiousName": "ABC Services",
    "correspondenceEmail": "user@example.com",
    "principalCounty": "Miami-Dade",
    // ... all other form fields
  },
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Draft saved successfully. Check your email for the link to resume.",
  "draftId": "clxxx..."
}
```

**Response (Error):**
```json
{
  "error": "Invalid email address"
}
```

**Process:**
1. Validate email format
2. Generate secure token (`dba_${timestamp}_${random}`)
3. Set expiration (7 days from now)
4. Save to database
5. Send email with magic link
6. Return success response

---

### **2. GET `/api/dba/get-draft/[token]`**

**Purpose:** Retrieve saved DBA form data using magic link token

**URL:** `/api/dba/get-draft/dba_1730689241_abc123xyz`

**Response (Success):**
```json
{
  "success": true,
  "formData": {
    "fictitiousName": "ABC Services",
    // ... all form fields
  },
  "email": "user@example.com",
  "createdAt": "2024-11-04T02:20:41.000Z",
  "expiresAt": "2024-11-11T02:20:41.000Z"
}
```

**Response (Not Found):**
```json
{
  "error": "Draft not found. The link may be invalid or expired."
}
```

**Response (Expired):**
```json
{
  "error": "This link has expired. Please start a new DBA registration."
}
```

**Process:**
1. Find draft by token
2. Check if exists
3. Check if expired
4. Parse JSON form data
5. Return data

---

## 📧 Email Template

**Subject:** `Complete Your DBA Registration - [Fictitious Name]`

**Key Elements:**
- LegalOps branding
- Saved fictitious name highlighted
- 3-step instructions
- Large "Complete My DBA Registration" button
- Expiration warning (7 days)
- Security note (don't share link)

**Design:**
- Clean, professional layout
- Sky blue brand color (#0EA5E9)
- Generous padding and spacing
- Mobile-responsive
- Clear call-to-action

---

## 🎨 UI Components

### **Step 4: "Save & Get Link" Section**

**Location:** Between UPL disclaimer and certification checkbox

**Design:**
- Sky blue gradient background
- Mail icon
- Clear heading: "Need Time to Publish Your Ad?"
- Explanation text
- Large button: "Save & Email Me a Link to Return"
- Email address confirmation
- Expiration notice (7 days)

**States:**
1. **Default:** Blue button ready to click
2. **Loading:** "Sending Link..." with disabled state
3. **Success:** Green checkmark with confirmation message

**Conditional Display:**
- Only shows if `newspaperAdvertised === false`
- Hides after guest checks certification box

---

### **Resume Page: `/dba/resume/[token]`**

**Purpose:** Landing page for magic link clicks

**States:**

1. **Loading:**
   - Spinning loader icon
   - "Loading Your Registration"
   - "Loading your saved DBA registration..."

2. **Success:**
   - Green checkmark icon
   - "Welcome Back!"
   - "Success! Redirecting to your DBA registration..."
   - Auto-redirect after 1.5 seconds

3. **Error:**
   - Red X icon
   - "Oops! Something Went Wrong"
   - Error message
   - "Start New DBA Registration" button

4. **Expired:**
   - Amber clock icon
   - "Link Expired"
   - "This link has expired. Please start a new DBA registration."
   - "Start New DBA Registration" button

**Design:**
- Centered card layout
- Full-height gradient background
- Large icons (64px)
- Clean typography
- Professional and trustworthy

---

## 🔒 Security Considerations

### **Token Generation**
- Format: `dba_${timestamp}_${random}`
- Random component: 13 characters (36^13 combinations)
- Timestamp prevents collisions
- Unique constraint in database

### **Expiration**
- 7-day expiration window
- Checked on every retrieval
- Returns 410 Gone status if expired

### **Access Control**
- No authentication required (by design)
- Token acts as authentication
- Token is long and random (hard to guess)
- One-time use recommended (future enhancement)

### **Data Privacy**
- Form data stored as JSON string
- Email stored in lowercase
- No sensitive payment data stored
- Draft deleted after order completion (future enhancement)

---

## 🎯 UPL Compliance

### **Disclaimers Included:**

1. **Legal Information Only:**
   - "We provide filing services and legal information, not legal advice"
   - Prominent placement in Step 4

2. **No Recommendations:**
   - We don't recommend specific newspapers
   - We don't advise on legal requirements

3. **Attorney Referral:**
   - "For legal advice, please consult a licensed Florida attorney"

### **What We DON'T Do:**
- ❌ Recommend specific newspapers
- ❌ Provide legal advice
- ❌ Interpret legal requirements
- ❌ Make legal decisions for customers

### **What We DO:**
- ✅ Provide legal information (Florida Statutes)
- ✅ Explain filing requirements
- ✅ Offer filing services
- ✅ Save customer data for convenience

---

## 📊 Future Enhancements

### **Phase 2 (Optional):**
1. **One-Time Use Tokens:** Mark token as used after first access
2. **Draft Cleanup:** Delete drafts after order completion
3. **Reminder Emails:** Send reminder after 3 days if not completed
4. **Analytics:** Track draft save/resume rates
5. **Admin Dashboard:** View/manage saved drafts

### **Phase 3 (Optional):**
6. **SMS Magic Links:** Send link via SMS for faster access
7. **Multiple Drafts:** Allow guests to save multiple DBAs
8. **Draft Expiration Warnings:** Email 1 day before expiration
9. **Extended Expiration:** Allow guests to extend expiration
10. **Auto-Fill:** Pre-fill from previous DBA registrations

---

## ✅ Testing Checklist

### **Happy Path:**
- [ ] Fill out Steps 1-3 of DBA wizard
- [ ] Click "Save & Email Me a Link" at Step 4
- [ ] Receive email with magic link
- [ ] Click magic link
- [ ] Land on resume page
- [ ] See loading state
- [ ] Redirect to DBA wizard
- [ ] See all data preserved
- [ ] Start at Step 4
- [ ] Complete wizard and checkout

### **Error Cases:**
- [ ] Invalid token → Show error page
- [ ] Expired token → Show expired page
- [ ] Missing email in Step 1 → Show validation error
- [ ] Network error during save → Show error message
- [ ] Malformed form data → Handle gracefully

### **Edge Cases:**
- [ ] Click magic link twice → Still works
- [ ] Save draft multiple times → Latest version saved
- [ ] Close browser mid-wizard → Data preserved
- [ ] Return after 8 days → Link expired

---

## 📝 Implementation Files

### **Created Files:**
1. `/api/dba/save-draft/route.ts` - Save draft API
2. `/api/dba/get-draft/[token]/route.ts` - Retrieve draft API
3. `/dba/resume/[token]/page.tsx` - Magic link landing page

### **Modified Files:**
1. `prisma/schema.prisma` - Added DBADraft model
2. `src/components/FictitiousNameWizard.tsx` - Added save/resume logic

### **Database:**
1. Migration: `20251104022041_add_dba_draft_table`

---

## 🎉 Summary

This feature provides a **seamless guest experience** for DBA registrations that require newspaper publication. Guests can:

✅ Start their registration without an account
✅ Pause at the newspaper publication step
✅ Receive a secure magic link via email
✅ Return days/weeks later to complete
✅ All data preserved and ready to go

**Design Principles:**
- ✨ Simple and elegant (Jony Ive inspired)
- 🔒 Secure and private
- ⚖️ UPL compliant
- 📱 Mobile-friendly
- 🎨 On-brand (LegalOps liquid glass)

**Result:** A professional, trustworthy experience that removes friction from the DBA filing process while maintaining legal compliance.

