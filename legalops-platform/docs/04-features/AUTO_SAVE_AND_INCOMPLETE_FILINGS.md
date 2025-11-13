# Auto-Save Draft System & Incomplete Filings Dashboard

## 📋 Overview

This document describes the **Auto-Save Draft System** and **Incomplete Filings Dashboard** features that allow authenticated users to pause their DBA registration (or any other filing) and seamlessly resume later.

---

## 🎯 Problem Solved

**For Authenticated Users:**
- User starts DBA wizard while logged in
- User reaches Step 4 (newspaper publication requirement)
- User needs to pause for 1-15 days to publish newspaper ad
- **SOLUTION:** Auto-save system + dashboard section to resume

**Key Differences from Guest Magic Link:**
- ✅ Automatic (no user action required)
- ✅ Always visible in dashboard
- ✅ No email clutter
- ✅ Works across all devices (tied to account)
- ✅ Supports multiple incomplete filings

---

## 🔄 Complete User Flow

### **Phase 1: User Starts Filing**

1. User logs in to LegalOps
2. User starts DBA wizard
3. User fills out Steps 1-3
4. **Auto-save kicks in** (every 30 seconds)
5. User sees "Saved at 2:45 PM" indicator (bottom-right corner)

### **Phase 2: User Pauses at Step 4**

1. User reaches Step 4 (newspaper publication requirement)
2. User closes browser to publish newspaper ad
3. **Draft is already saved** (no action needed)

### **Phase 3: User Returns Days/Weeks Later**

1. User logs back in
2. User sees dashboard
3. **"Incomplete Filings" section appears** (prominent amber banner)
4. Shows: "DBA Registration - ABC Services" with progress bar
5. User clicks "Resume Filing" button
6. **Wizard loads with all data preserved** at Step 4
7. User completes Steps 4-5 and proceeds to checkout

---

## 🗄️ Database Schema

### **Enhanced FormDraft Model**

```prisma
model FormDraft {
  id          String   @id @default(cuid())
  userId      String   // Required - linked to user account
  user        User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  formType    String   // 'DBA_REGISTRATION', 'LLC_FORMATION', etc.
  formData    Json     // The actual form data
  currentStep Int      @default(1) // Current step in wizard
  totalSteps  Int      @default(5) // Total steps in wizard
  
  // Metadata for display
  displayName String?  // e.g., "ABC Services" for DBA
  
  // Reminder settings (for future email reminders)
  emailRemindersEnabled Boolean @default(false)
  lastReminderSent      DateTime?
  reminderCount         Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, formType])
  @@index([createdAt])
  @@index([updatedAt])
  @@index([emailRemindersEnabled])
  @@map("form_drafts")
}
```

**Key Fields:**
- `userId` - Links draft to user account
- `formType` - Type of filing (DBA, LLC, etc.)
- `formData` - JSON containing all form data
- `currentStep` - Which step user was on
- `totalSteps` - Total steps in wizard
- `displayName` - User-friendly name for display
- `emailRemindersEnabled` - For future reminder system
- `updatedAt` - Last auto-save timestamp

---

## 🔌 API Endpoints

### **1. POST `/api/form-drafts/save`**

**Purpose:** Save or update a form draft (called by auto-save)

**Request Body:**
```json
{
  "formType": "DBA_REGISTRATION",
  "formData": {
    "fictitiousName": "ABC Services",
    "correspondenceEmail": "user@example.com",
    // ... all form fields
  },
  "currentStep": 3,
  "totalSteps": 5,
  "displayName": "ABC Services",
  "emailRemindersEnabled": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Draft saved successfully",
  "draftId": "clxxx...",
  "updatedAt": "2024-11-04T03:15:42.000Z"
}
```

**Features:**
- Upserts (creates or updates) based on `userId` + `formType`
- Only one draft per user per form type
- Requires authentication

---

### **2. GET `/api/form-drafts/load?formType=DBA_REGISTRATION`**

**Purpose:** Load a saved draft for a specific form type

**Response:**
```json
{
  "success": true,
  "draft": {
    "id": "clxxx...",
    "formType": "DBA_REGISTRATION",
    "formData": { /* all form data */ },
    "currentStep": 3,
    "totalSteps": 5,
    "displayName": "ABC Services",
    "emailRemindersEnabled": false,
    "createdAt": "2024-11-01T10:30:00.000Z",
    "updatedAt": "2024-11-04T03:15:42.000Z"
  }
}
```

**Features:**
- Returns 404 if no draft found
- Requires authentication
- Only returns user's own drafts

---

### **3. GET `/api/form-drafts/list`**

**Purpose:** List all saved drafts for authenticated user (for dashboard)

**Response:**
```json
{
  "success": true,
  "drafts": [
    {
      "id": "clxxx...",
      "formType": "DBA_REGISTRATION",
      "displayName": "ABC Services",
      "currentStep": 3,
      "totalSteps": 5,
      "progress": 60,
      "emailRemindersEnabled": false,
      "createdAt": "2024-11-01T10:30:00.000Z",
      "updatedAt": "2024-11-04T03:15:42.000Z",
      "daysSinceUpdate": 3
    }
  ],
  "count": 1
}
```

**Features:**
- Returns all drafts for user
- Calculates progress percentage
- Calculates days since last update
- Ordered by most recent first

---

### **4. DELETE `/api/form-drafts/delete`**

**Purpose:** Delete a saved draft

**Request Body:**
```json
{
  "draftId": "clxxx..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Draft deleted successfully"
}
```

**Features:**
- Verifies ownership before deleting
- Returns 404 if draft not found
- Requires authentication

---

## 🎨 UI Components

### **1. Auto-Save Status Indicator**

**Location:** Fixed bottom-right corner of wizard (for authenticated users only)

**States:**

1. **Idle:** Hidden (no indicator)
2. **Saving:** Blue background, pulsing save icon, "Saving..."
3. **Saved:** Green background, checkmark icon, "Saved at 2:45 PM"
4. **Error:** Red background, alert icon, "Save failed"

**Design:**
```
┌─────────────────────────────┐
│ ✓ Saved at 2:45 PM          │
└─────────────────────────────┘
```

**Features:**
- Only shows for authenticated users
- Only shows after Step 1 (when there's data to save)
- Auto-hides after 2 seconds when saved
- Floating above content (z-index: 1000)
- Smooth transitions

---

### **2. Incomplete Filings Dashboard Section**

**Location:** Customer dashboard, between "Important Notices" and "My Businesses"

**Design:**
- Amber gradient background (attention-grabbing but not alarming)
- Prominent header with alert icon
- List of incomplete filings with:
  - Form type icon (📝 for DBA, 🏢 for LLC, etc.)
  - Display name (e.g., "ABC Services")
  - Progress indicator (Step 3 of 5)
  - Last updated timestamp
  - Progress bar (visual percentage)
  - "Resume Filing" button (amber)
  - Delete button (red outline)

**Conditional Display:**
- Only shows if user has incomplete filings
- Hidden if no drafts exist (no empty state)

**Example:**
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  Incomplete Filings                                  │
│     You have 1 incomplete filing waiting to be completed│
├─────────────────────────────────────────────────────────┤
│ 📝  DBA Registration - ABC Services                     │
│     Step 3 of 5 • 3 days ago                            │
│     [████████████░░░░░░░░] 60%                          │
│                                    [Resume Filing] [🗑️]  │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Auto-Save Logic

### **Trigger:** Every 30 seconds

### **Conditions:**
- User must be authenticated
- Must be past Step 1 (has data to save)
- Must have entered fictitious name (not empty)

### **Process:**
1. Check if user is logged in
2. Check if on Step 1 with no data → skip
3. Set status to "saving"
4. Call `/api/form-drafts/save` with current form data
5. If successful:
   - Set status to "saved"
   - Update last saved timestamp
   - Reset to "idle" after 2 seconds
6. If error:
   - Set status to "error"
   - Log error to console

### **Implementation:**
```typescript
useEffect(() => {
  if (!session?.user?.id) return;

  const autoSaveInterval = setInterval(() => {
    autoSaveDraft();
  }, 30000); // 30 seconds

  return () => clearInterval(autoSaveInterval);
}, [formData, currentStep, session?.user?.id]);
```

---

## 🔄 Resume Logic

### **On Mount:**
1. Check if user is authenticated
2. If yes, call `/api/form-drafts/load?formType=DBA_REGISTRATION`
3. If draft exists:
   - Load form data into state
   - Set current step to saved step
   - Update last saved timestamp
4. User continues from where they left off

### **Implementation:**
```typescript
useEffect(() => {
  if (session?.user?.id && !initialData) {
    loadSavedDraft();
  }
}, [session?.user?.id]);
```

---

## 🎯 Supported Form Types

Currently configured:
- ✅ `DBA_REGISTRATION` - Fictitious Name Registration
- ⏳ `LLC_FORMATION` - LLC Formation (future)
- ⏳ `ANNUAL_REPORT` - Annual Report (future)
- ⏳ `CORPORATION_FORMATION` - Corporation Formation (future)

**To add new form type:**
1. Add to `FORM_TYPE_CONFIG` in `IncompleteFilings.tsx`
2. Add auto-save logic to wizard component
3. Add load logic to wizard component

---

## 📊 User Experience Benefits

### **For Users:**
1. ✅ **Peace of Mind** - Never lose progress
2. ✅ **Flexibility** - Pause and resume anytime
3. ✅ **Visibility** - Always see incomplete filings
4. ✅ **Control** - Delete drafts if no longer needed
5. ✅ **Seamless** - No extra steps required

### **For LegalOps:**
1. ✅ **Higher Completion Rates** - Users more likely to finish
2. ✅ **Better UX** - Professional and trustworthy
3. ✅ **Reduced Support** - Fewer "I lost my data" tickets
4. ✅ **Data Insights** - Track where users pause
5. ✅ **Future Revenue** - Email reminders can bring users back

---

## 🚀 Future Enhancements (Phase 2)

### **Email Reminder System:**
- Opt-in checkbox at Step 4
- Send reminders at 3, 7, 14 days
- "Complete your DBA registration" emails
- Unsubscribe link in each email

### **Calendar Integration:**
- "Add to Calendar" button
- Download .ics file
- User sets own reminder date

### **Analytics:**
- Track draft save/resume rates
- Identify common pause points
- Measure completion rates
- A/B test reminder timing

### **Admin Dashboard:**
- View all incomplete filings
- Send manual reminders
- Identify stuck users
- Conversion funnel analysis

---

## ✅ Summary

**What Was Built:**

1. ✅ Enhanced FormDraft database model
2. ✅ 4 API endpoints (save, load, list, delete)
3. ✅ Auto-save system (every 30 seconds)
4. ✅ Auto-save status indicator (bottom-right)
5. ✅ Incomplete Filings dashboard section
6. ✅ Resume functionality
7. ✅ Delete draft functionality

**Result:**

Authenticated users now have a **seamless, automatic draft system** that:
- Saves progress every 30 seconds
- Shows incomplete filings prominently in dashboard
- Allows one-click resume
- Works across all devices
- Requires zero user effort

**This creates a professional, trustworthy experience that maximizes completion rates while minimizing user friction!** 🎉

