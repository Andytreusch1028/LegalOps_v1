# Critical Gaps - Files Checklist
## What to Create vs What to Modify

**Date:** 2025-10-23  
**Purpose:** Complete checklist of all files that need to be created or modified  
**Timeline:** Month 2-3 (8 weeks)

---

## 📁 PART 1: TIERED PRICING PACKAGES

### **NEW FILES TO CREATE** ✨

#### **Database & Seeding:**
- [ ] `prisma/seed-packages.ts` - Package seeding script

#### **API Routes:**
- [ ] `src/app/api/packages/route.ts` - GET all packages
- [ ] `src/app/api/packages/[id]/route.ts` - GET single package

#### **Components:**
- [ ] `src/components/legalops/checkout/PackageSelector.tsx` - 3-tier pricing cards
- [ ] `src/components/legalops/checkout/PackageComparisonTable.tsx` - Feature comparison table
- [ ] `src/components/legalops/checkout/UpsellScreen.tsx` - RA service upsell for Basic package

#### **Types:**
- [ ] `src/types/package.ts` - Package TypeScript interfaces

---

### **EXISTING FILES TO MODIFY** ✏️

#### **Database Schema:**
- [ ] `prisma/schema.prisma`
  - **Add:** Package model
  - **Modify:** Order model (add packageId field)
  - **Run:** `npx prisma migrate dev --name add_packages`

#### **Service Pages:**
- [ ] `src/app/services/[slug]/page.tsx`
  - **Add:** Import PackageSelector component
  - **Add:** State for packages and selectedPackageId
  - **Add:** useEffect to fetch packages
  - **Add:** PackageSelector component before LLCFormationWizard
  - **Modify:** Pass selectedPackageId to form
  - **Modify:** Update pricing calculation

#### **Checkout Flow:**
- [ ] `src/app/checkout/[orderId]/page.tsx`
  - **Add:** Fetch package details from order
  - **Add:** Display package name and features in order summary
  - **Modify:** Pricing calculation to include package price
  - **Add:** Package breakdown section

- [ ] `src/components/LLCFormationWizard.tsx`
  - **Add:** Accept packageId prop
  - **Modify:** Pass packageId when creating order
  - **Add:** Show selected package in form header

#### **Order Creation:**
- [ ] `src/app/api/orders/route.ts` (or wherever orders are created)
  - **Modify:** Accept packageId in request body
  - **Modify:** Save packageId to Order record
  - **Add:** Validation for packageId

#### **Order Summary Component:**
- [ ] `src/components/legalops/cards/OrderSummaryCard.tsx`
  - **Add:** Display package name
  - **Add:** Show package features
  - **Modify:** Pricing breakdown to show package price separately

---

## 📁 PART 2: ONBOARDING CHECKLIST

### **NEW FILES TO CREATE** ✨

#### **Database & Seeding:**
- [ ] `prisma/seed-checklists.ts` - Checklist templates seeding script

#### **API Routes:**
- [ ] `src/app/api/onboarding-checklist/route.ts` - GET/POST checklist
- [ ] `src/app/api/onboarding-checklist/[id]/route.ts` - GET/PATCH single checklist
- [ ] `src/app/api/onboarding-checklist/[id]/complete-item/route.ts` - Mark item complete

#### **Components:**
- [ ] `src/components/legalops/dashboard/OnboardingChecklist.tsx` - Main checklist component
- [ ] `src/components/legalops/dashboard/ChecklistItem.tsx` - Individual checklist item
- [ ] `src/components/legalops/dashboard/ChecklistProgressBar.tsx` - Progress indicator
- [ ] `src/components/legalops/dashboard/ChecklistEducationalContent.tsx` - Educational modal

#### **Types:**
- [ ] `src/types/onboarding.ts` - Checklist TypeScript interfaces

#### **Content:**
- [ ] `src/data/checklist-templates.ts` - LLC and Corporation checklist templates

---

### **EXISTING FILES TO MODIFY** ✏️

#### **Database Schema:**
- [ ] `prisma/schema.prisma`
  - **Add:** OnboardingChecklist model
  - **Run:** `npx prisma migrate dev --name add_onboarding_checklist`

#### **Customer Dashboard:**
- [ ] `src/app/dashboard/customer/page.tsx`
  - **Add:** Import OnboardingChecklist component
  - **Add:** Fetch checklist data for user's businesses
  - **Add:** OnboardingChecklist component at top of page (above business cards)
  - **Add:** Collapsible/expandable checklist section

#### **Order Completion:**
- [ ] `src/app/api/orders/[orderId]/complete/route.ts` (or wherever orders are marked complete)
  - **Add:** Auto-create OnboardingChecklist when formation order completes
  - **Add:** Auto-check "Formation Filed" item
  - **Add:** Send email notification about checklist

---

## 📊 DETAILED FILE MODIFICATIONS

### **1. prisma/schema.prisma**

**Changes needed:**

```prisma
// 🆕 ADD THIS MODEL:
model Package {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  price           Decimal  @db.Decimal(10, 2)
  description     String?  @db.Text
  features        Json
  isActive        Boolean  @default(true)
  displayOrder    Int
  includesRA      Boolean  @default(false)
  raYears         Int      @default(0)
  includesEIN     Boolean  @default(false)
  includesAI      Boolean  @default(false)
  includesOperatingAgreement Boolean @default(false)
  includesComplianceCalendar Boolean @default(false)
  badge           String?
  highlightColor  String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  orders          Order[]
  @@map("packages")
}

// 🆕 ADD THIS MODEL:
model OnboardingChecklist {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  businessId      String
  business        BusinessEntity @relation(fields: [businessId], references: [id])
  checklistType   String
  items           Json
  completedItems  String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@unique([userId, businessId])
  @@map("onboarding_checklists")
}

// ✏️ MODIFY THIS MODEL (add packageId):
model Order {
  id              String   @id @default(cuid())
  // ... existing fields ...
  
  packageId       String?  // 🆕 ADD THIS
  package         Package? @relation(fields: [packageId], references: [id]) // 🆕 ADD THIS
  
  // ... rest of fields ...
}

// ✏️ MODIFY THIS MODEL (add onboarding relation):
model User {
  // ... existing fields ...
  
  onboardingChecklists OnboardingChecklist[] // 🆕 ADD THIS
  
  // ... rest of fields ...
}

// ✏️ MODIFY THIS MODEL (add onboarding relation):
model BusinessEntity {
  // ... existing fields ...
  
  onboardingChecklist OnboardingChecklist? // 🆕 ADD THIS
  
  // ... rest of fields ...
}
```

---

### **2. src/app/services/[slug]/page.tsx**

**Changes needed:**

```typescript
// 🆕 ADD IMPORTS:
import { PackageSelector } from '@/components/legalops/checkout/PackageSelector';

// 🆕 ADD STATE:
const [packages, setPackages] = useState<Package[]>([]);
const [selectedPackageId, setSelectedPackageId] = useState<string>('');

// 🆕 ADD FETCH PACKAGES:
useEffect(() => {
  const fetchPackages = async () => {
    const response = await fetch('/api/packages');
    const data = await response.json();
    setPackages(data);
    // Auto-select Standard package
    const standard = data.find((p: Package) => p.slug === 'standard');
    if (standard) setSelectedPackageId(standard.id);
  };
  fetchPackages();
}, []);

// 🆕 ADD IN JSX (before LLCFormationWizard):
<PackageSelector
  packages={packages}
  selectedPackageId={selectedPackageId}
  onSelectPackage={setSelectedPackageId}
/>

// ✏️ MODIFY LLCFormationWizard:
<LLCFormationWizard
  service={service}
  packageId={selectedPackageId} // 🆕 ADD THIS PROP
/>
```

---

### **3. src/app/dashboard/customer/page.tsx**

**Changes needed:**

```typescript
// 🆕 ADD IMPORTS:
import { OnboardingChecklist } from '@/components/legalops/dashboard/OnboardingChecklist';

// 🆕 ADD STATE:
const [checklists, setChecklists] = useState<OnboardingChecklist[]>([]);

// 🆕 ADD FETCH CHECKLISTS:
useEffect(() => {
  const fetchChecklists = async () => {
    const response = await fetch('/api/onboarding-checklist');
    const data = await response.json();
    setChecklists(data);
  };
  fetchChecklists();
}, []);

// 🆕 ADD IN JSX (at top of dashboard, before business cards):
{checklists.length > 0 && (
  <div className="mb-8">
    {checklists.map((checklist) => (
      <OnboardingChecklist
        key={checklist.id}
        checklist={checklist}
        onUpdate={fetchChecklists}
      />
    ))}
  </div>
)}
```

---

## 🎯 IMPLEMENTATION ORDER

### **Week 1 (Month 2, Week 2): Tiered Pricing - Database**
1. ✅ Modify `prisma/schema.prisma` (add Package model, modify Order)
2. ✅ Run migration: `npx prisma migrate dev --name add_packages`
3. ✅ Create `prisma/seed-packages.ts`
4. ✅ Run seed: `npx tsx prisma/seed-packages.ts`
5. ✅ Create `src/types/package.ts`

### **Week 2 (Month 2, Week 3): Tiered Pricing - UI**
6. ✅ Create `src/app/api/packages/route.ts`
7. ✅ Create `src/components/legalops/checkout/PackageSelector.tsx`
8. ✅ Modify `src/app/services/[slug]/page.tsx`
9. ✅ Modify `src/components/LLCFormationWizard.tsx`
10. ✅ Modify `src/app/checkout/[orderId]/page.tsx`
11. ✅ Test complete flow

### **Week 3 (Month 3, Week 2): Onboarding Checklist - Database**
12. ✅ Modify `prisma/schema.prisma` (add OnboardingChecklist model)
13. ✅ Run migration: `npx prisma migrate dev --name add_onboarding_checklist`
14. ✅ Create `src/data/checklist-templates.ts`
15. ✅ Create `src/types/onboarding.ts`

### **Week 4 (Month 3, Week 2): Onboarding Checklist - UI**
16. ✅ Create `src/app/api/onboarding-checklist/route.ts`
17. ✅ Create `src/components/legalops/dashboard/OnboardingChecklist.tsx`
18. ✅ Create `src/components/legalops/dashboard/ChecklistItem.tsx`
19. ✅ Modify `src/app/dashboard/customer/page.tsx`
20. ✅ Test complete flow

---

## ✅ TESTING CHECKLIST

### **Tiered Pricing:**
- [ ] All 3 packages display correctly
- [ ] Package selection works
- [ ] Pricing calculates correctly
- [ ] Order includes packageId
- [ ] Checkout shows package details
- [ ] Mobile responsive

### **Onboarding Checklist:**
- [ ] Checklist displays on dashboard
- [ ] Items can be checked/unchecked
- [ ] Progress bar updates
- [ ] Educational content displays
- [ ] Service links work
- [ ] Mobile responsive

---

**Total Files:**
- **New Files:** 18
- **Modified Files:** 10
- **Total:** 28 files

**Estimated Time:**
- Tiered Pricing: 2 weeks (Month 2, Week 2-3)
- Onboarding Checklist: 1 week (Month 3, Week 2)
- **Total:** 3 weeks

---

**Bottom Line:** This checklist ensures you don't miss any files when implementing the 2 critical gaps! 🚀

