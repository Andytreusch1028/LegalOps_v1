# Form Design Standards - LegalOps Platform

## 🎯 Purpose
This document ensures ALL forms in the LegalOps platform follow consistent design guidelines. These standards are based on:
- `DESIGN_BRIEF_FOR_CHATGPT.md`
- `DESIGN_BRIEF_TECHNICAL_DETAILS.md`
- `docs/legalops-ui-guide.md`

## ✅ Mandatory Requirements for ALL Forms

### 1. **Multi-Step Wizard Pattern** (for complex forms)
- ✅ Break forms with 10+ fields into 3-5 steps
- ✅ Use `FormWizard` component from `/src/components/forms/FormWizard.tsx`
- ✅ Show progress indicator at top
- ✅ Display step numbers and names
- ✅ Include "Back" and "Continue" buttons

**Example:**
```tsx
import { FormWizard } from '@/components/forms/FormWizard';

const steps = [
  { id: 1, name: 'Basic Info', description: 'Your details' },
  { id: 2, name: 'Address', description: 'Location info' },
  { id: 3, name: 'Review', description: 'Confirm & submit' },
];

<FormWizard
  steps={steps}
  currentStep={currentStep}
  onNext={handleNext}
  onBack={handleBack}
  onSubmit={handleSubmit}
>
  {/* Step content */}
</FormWizard>
```

### 2. **Input Field Styling**
All inputs MUST follow this pattern:

```tsx
<input
  className="w-full border rounded-lg bg-white text-gray-900 
             placeholder-gray-400 focus:outline-none focus:ring-2 
             focus:ring-sky-500 focus:border-sky-500 text-base 
             transition-all border-gray-300 px-4 py-4"
/>
```

**Key Requirements:**
- ✅ Padding: `px-4 py-4` (16px all around)
- ✅ Border: `border-gray-300` (visible, not too light)
- ✅ Focus ring: `focus:ring-2 focus:ring-sky-500`
- ✅ Rounded corners: `rounded-lg` (8px)
- ✅ Transitions: `transition-all`

**Use the standardized component:**
```tsx
import { FormInput } from '@/components/forms/FormWizard';

<FormInput
  label="Business Name"
  name="businessName"
  placeholder="e.g., Acme LLC"
  required
  error={errors.businessName}
  tooltip="Enter your desired LLC name"
/>
```

### 3. **Color Palette** (MANDATORY)
- ✅ Primary: Sky Blue `#0ea5e9`
- ✅ Success: Green `#10b981`
- ✅ Warning: Amber `#f59e0b`
- ✅ Error: Red `#ef4444`
- ✅ Text Dark: `#0f172a`
- ✅ Text Muted: `#64748b`
- ✅ Border: `#e2e8f0`

**Never use other colors without approval.**

### 4. **Spacing System** (MANDATORY)
- ✅ xs: 8px (`gap-2`, `p-2`)
- ✅ sm: 12px (`gap-3`, `p-3`)
- ✅ md: 16px (`gap-4`, `p-4`)
- ✅ lg: 24px (`gap-6`, `p-6`)
- ✅ xl: 32px (`gap-8`, `p-8`)
- ✅ 2xl: 48px (`gap-12`, `p-12`)

**Use these values consistently. No arbitrary spacing.**

### 5. **Typography Hierarchy**
- ✅ H1: `text-3xl font-semibold` (36px)
- ✅ H2: `text-2xl font-light` (24px)
- ✅ H3: `text-lg font-semibold` (18px)
- ✅ Body: `text-base` (16px)
- ✅ Small: `text-sm` (14px)
- ✅ Label: `text-sm font-medium` (14px)

### 6. **Section Headers**
Every form section MUST have:

```tsx
<FormSection
  title="Business Information"
  description="Tell us about your business"
>
  {/* Fields */}
</FormSection>
```

**Pattern:**
```tsx
<div>
  <h2 className="text-2xl font-light text-gray-900 mb-2">Section Title</h2>
  <p className="text-sm text-slate-600">Optional description</p>
</div>
```

### 7. **Validation & Error Messages**
- ✅ Inline validation on each step
- ✅ Red border on invalid fields: `border-red-500`
- ✅ Error message below field with icon
- ✅ Clear errors when user corrects input

**Pattern:**
```tsx
{error && (
  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
    <span>⚠️</span>
    {error}
  </p>
)}
```

### 8. **Trust Signals** (for checkout/payment forms)
Include trust signals at top of form:

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 p-6 
                bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl 
                border border-sky-100">
  <div className="flex items-center gap-3">
    <Shield className="w-5 h-5 text-sky-600" />
    <div>
      <p className="text-sm font-semibold">100% Secure</p>
      <p className="text-xs text-slate-600">Bank-level encryption</p>
    </div>
  </div>
  {/* More trust signals */}
</div>
```

### 9. **Button Styling**
- ✅ Primary: `bg-sky-600 hover:bg-sky-700`
- ✅ Secondary: `border border-slate-300 hover:bg-slate-50`
- ✅ Success: `bg-emerald-600 hover:bg-emerald-700`
- ✅ Padding: `px-6 py-4` (24px horizontal, 16px vertical)
- ✅ Rounded: `rounded-lg` (8px)
- ✅ Font: `font-semibold` or `font-medium`

### 10. **Tooltips for Complex Fields**
Add tooltips to fields that need explanation:

```tsx
<label className="flex items-center gap-2">
  Business Purpose <span className="text-red-500">*</span>
  <div className="group relative">
    <span className="w-4 h-4 text-slate-400 cursor-help">ⓘ</span>
    <div className="absolute left-0 bottom-full mb-2 hidden 
                    group-hover:block w-64 p-3 bg-slate-900 
                    text-white text-xs rounded-lg shadow-lg z-10">
      Describe the primary activities your business will engage in
    </div>
  </div>
</label>
```

### 11. **Responsive Design**
- ✅ Mobile-first approach
- ✅ Single column on mobile
- ✅ Two columns for related pairs (City/ZIP) on desktop: `md:grid-cols-2`
- ✅ Test on mobile devices

### 12. **Loading States**
- ✅ Disable submit button when loading
- ✅ Show "Processing..." text
- ✅ Add `disabled:opacity-50` class

```tsx
<button
  disabled={loading}
  className="... disabled:opacity-50"
>
  {loading ? 'Processing...' : 'Submit'}
</button>
```

## 📋 Checklist for New Forms

Before submitting any form for review, verify:

- [ ] Uses `FormWizard` component (if 10+ fields)
- [ ] All inputs use `FormInput` or `FormTextArea` components
- [ ] Follows color palette (sky blue primary)
- [ ] Uses spacing system (8px, 12px, 16px, 24px, 32px, 48px)
- [ ] Section headers use `FormSection` component
- [ ] Inline validation with error messages
- [ ] Trust signals included (if payment/checkout)
- [ ] Buttons follow styling guidelines
- [ ] Tooltips on complex fields
- [ ] Responsive (tested on mobile)
- [ ] Loading states implemented
- [ ] Progress indicator (if multi-step)

## 🚫 Common Mistakes to Avoid

1. ❌ Using arbitrary colors (stick to palette)
2. ❌ Using arbitrary spacing (use 8px system)
3. ❌ Light borders on inputs (use `border-gray-300`, not `border-gray-200`)
4. ❌ Insufficient input padding (must be `px-4 py-4`)
5. ❌ Missing error states
6. ❌ No validation feedback
7. ❌ Single-page forms with 20+ fields (use wizard)
8. ❌ Inconsistent button sizes
9. ❌ Missing tooltips on complex fields
10. ❌ Not testing on mobile

## 📚 Reference Components

### Pre-built Components to Use:
- `FormWizard` - Multi-step form wrapper
- `FormInput` - Standardized text input
- `FormTextArea` - Standardized textarea
- `FormSection` - Section header wrapper

### Import Path:
```tsx
import { 
  FormWizard, 
  FormInput, 
  FormTextArea, 
  FormSection 
} from '@/components/forms/FormWizard';
```

## 🔄 Updates to This Document

This is a living document. When design guidelines change:
1. Update this file
2. Update the 3 source documents
3. Update the reusable components
4. Notify the team

## 📞 Questions?

If you're unsure about any design decision:
1. Check `DESIGN_BRIEF_FOR_CHATGPT.md`
2. Check `DESIGN_BRIEF_TECHNICAL_DETAILS.md`
3. Check `docs/legalops-ui-guide.md`
4. Ask the design lead

## ✅ Enforcement

**All form PRs must:**
1. Pass design review
2. Follow this checklist
3. Use standardized components
4. Include screenshots (desktop + mobile)

**No exceptions without design lead approval.**

