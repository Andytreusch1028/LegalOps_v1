# Formation Wizard Template

**Last Updated:** 2025-10-26  
**Template Source:** LLCFormationWizard.tsx  
**Use For:** Corporation, Nonprofit, and any future formation wizards

---

## Overview

This document serves as the master template for all business formation wizards in LegalOps. The LLCFormationWizard is the reference implementation that includes all required functionality, UX patterns, and integration points.

---

## Core Features Checklist

When creating a new formation wizard, implement ALL of these features:

### ✅ 1. Package Integration
- [ ] Accept `selectedPackage` prop from parent
- [ ] Conditional logic based on `package.includesRA` flag
- [ ] Pre-fill RA fields when package includes RA service
- [ ] Clear RA fields when package doesn't include RA
- [ ] Display package summary at top of form

### ✅ 2. Form Data Preservation
- [ ] Accept `initialFormData` prop to restore previous data
- [ ] Accept `onFormDataChange` callback prop
- [ ] Initialize form state with `initialFormData` if provided
- [ ] Call `onFormDataChange` on every form data change (via useEffect)
- [ ] Smart field handling when switching packages (preserve user data, adjust RA fields)

### ✅ 3. Package Change Functionality
- [ ] "Change Package" button at top of form with liquid glass styling
- [ ] Button padding: `padding: '12px 28px'` minimum
- [ ] Liquid glass effects: gradient overlay, dual shadows, hover scale
- [ ] Clicking button returns to package selector
- [ ] Form data preserved via `onFormDataChange` callback

### ✅ 4. Instant Upgrade Feature
- [ ] Fetch all packages on component mount
- [ ] For Basic package users: Show amber warning box on RA step
- [ ] Include "Upgrade to Standard Package" button in warning box
- [ ] Button styling: `padding: '14px 24px'`, emerald green background
- [ ] On upgrade: Call `onPackageChange` callback with Standard package
- [ ] On upgrade: Auto-fill RA fields with LegalOps info
- [ ] Preserve all other form data during upgrade

### ✅ 5. Conditional RA Step Messaging
- [ ] **Standard/Premium packages:** Green emerald box with success message
- [ ] **Basic package:** Amber warning box with upgrade prompt
- [ ] Generous spacing between paragraphs (20-24px margins)
- [ ] Increased line height (1.8) for readability
- [ ] Outer padding: 28px minimum
- [ ] NO "Change Package" reminder in Basic package box (confusing)
- [ ] Include "Change Package" reminder in Standard/Premium box

### ✅ 6. UI/UX Standards
- [ ] Button padding: `py-3 px-6` or `padding: '12px 28px'` minimum
- [ ] Label/badge padding: `py-1.5 px-3` or `padding: '6px 12px'` minimum
- [ ] Use inline `style={{ padding: 'Xpx Ypx' }}` to guarantee spacing
- [ ] Liquid glass design for primary buttons
- [ ] Generous spacing between form sections (mb-10, mb-6)
- [ ] Line height 1.8 for body text
- [ ] Paragraph margins: 20-24px between sections

---

## Required Props Interface

```typescript
interface FormationWizardProps {
  serviceId: string;
  service?: Service;
  selectedPackage?: Package | null;
  onSubmit?: (data: FormData) => void;
  onPackageChange?: (pkg: Package) => void;
  initialFormData?: Partial<FormData>;      // NEW: For data preservation
  onFormDataChange?: (data: FormData) => void; // NEW: For data preservation
}
```

---

## Parent Component Integration

The parent component (service detail page) must:

### State Management
```typescript
const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
const [showForm, setShowForm] = useState(false);
const [preservedFormData, setPreservedFormData] = useState<any>(null);
```

### Wizard Component Usage
```typescript
<FormationWizard
  serviceId={service.id}
  service={serviceData}
  selectedPackage={selectedPackage}
  onSubmit={handleFormSubmit}
  onPackageChange={setSelectedPackage}
  initialFormData={preservedFormData}
  onFormDataChange={setPreservedFormData}
/>
```

### Change Package Button
```typescript
<button
  onClick={() => {
    // Form data is already preserved via onFormDataChange callback
    setShowForm(false);
  }}
  className="relative overflow-hidden bg-white text-sky-700 hover:bg-sky-50 font-semibold rounded-lg transition-all duration-200 hover:scale-105"
  style={{
    fontSize: '14px',
    padding: '12px 28px',
    border: '2px solid #0ea5e9',
    boxShadow: '0 2px 8px rgba(14, 165, 233, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
  }}
>
  {/* Glass highlight effect */}
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)',
      transform: 'translateY(-30%)',
    }}
  />
  <span className="relative">Change Package</span>
</button>
```

---

## Form State Initialization Pattern

```typescript
const [formData, setFormData] = useState<FormData>(() => {
  // If we have initial form data, use it and adjust RA fields based on current package
  if (initialFormData) {
    return {
      ...initialFormData,
      // Adjust RA fields based on current package
      registeredAgentName: includesRA ? 'LegalOps Platform LLC' : (initialFormData.registeredAgentName || ''),
      registeredAgentAddress: includesRA ? '123 Business Blvd' : (initialFormData.registeredAgentAddress || ''),
      registeredAgentCity: includesRA ? 'Miami' : (initialFormData.registeredAgentCity || ''),
      registeredAgentState: 'FL',
      registeredAgentZip: includesRA ? '33101' : (initialFormData.registeredAgentZip || ''),
      // Preserve other fields...
    } as FormData;
  }
  
  // Default empty form with conditional RA pre-fill
  return {
    // Business fields start empty
    businessName: '',
    // ... other fields
    
    // RA fields pre-filled only if package includes RA
    registeredAgentName: includesRA ? 'LegalOps Platform LLC' : '',
    registeredAgentAddress: includesRA ? '123 Business Blvd' : '',
    registeredAgentCity: includesRA ? 'Miami' : '',
    registeredAgentState: 'FL',
    registeredAgentZip: includesRA ? '33101' : '',
  };
});
```

---

## useEffect Hooks Required

### 1. Fetch Packages
```typescript
useEffect(() => {
  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };
  fetchPackages();
}, []);
```

### 2. Notify Parent of Form Data Changes
```typescript
useEffect(() => {
  if (onFormDataChange) {
    onFormDataChange(formData);
  }
}, [formData, onFormDataChange]);
```

---

## Instant Upgrade Handler

```typescript
const handleUpgradeToStandard = () => {
  const standardPackage = packages.find(pkg => pkg.slug === 'standard');
  if (standardPackage && onPackageChange) {
    onPackageChange(standardPackage);
    // Pre-fill RA info after upgrade
    setFormData(prev => ({
      ...prev,
      registeredAgentName: 'LegalOps Platform LLC',
      registeredAgentAddress: '123 Business Blvd',
      registeredAgentCity: 'Miami',
      registeredAgentState: 'FL',
      registeredAgentZip: '33101',
    }));
  }
};
```

---

## Registered Agent Step - Conditional Messaging

### For Standard/Premium Packages (Green Box)
```typescript
{includesRA ? (
  <div
    className="mb-10 bg-emerald-50 rounded-xl flex items-start gap-5"
    style={{
      border: '1px solid #a7f3d0',
      borderLeft: '4px solid #10b981',
      padding: '28px',
    }}
  >
    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
      <Info className="w-6 h-6 text-emerald-600" />
    </div>
    <div className="flex-1 text-slate-700" style={{ fontSize: '16px', lineHeight: '1.8', paddingTop: '4px' }}>
      <p style={{ marginBottom: '20px' }}>
        A registered agent is a person or business authorized to receive legal documents on behalf of your [LLC/Corporation].
      </p>
      <p className="font-medium text-emerald-700">
        ✓ Your package includes FREE registered agent service for the first year! Our address is pre-filled below, but you can change it if you prefer to use your own.
      </p>
      {selectedPackage && (
        <p className="text-sm text-slate-600" style={{ marginTop: '20px' }}>
          Want to change packages? Use the <strong>"Change Package"</strong> button at the top of this form.
        </p>
      )}
    </div>
  </div>
) : (
  // Basic package - see next section
)}
```

### For Basic Package (Amber Warning Box)
```typescript
<div
  className="mb-10 bg-amber-50 rounded-xl flex items-start gap-5"
  style={{
    border: '1px solid #fde68a',
    borderLeft: '4px solid #f59e0b',
    padding: '28px',
  }}
>
  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
    <Info className="w-6 h-6 text-amber-600" />
  </div>
  <div className="flex-1 text-slate-700" style={{ fontSize: '16px', lineHeight: '1.8', paddingTop: '4px' }}>
    <p style={{ marginBottom: '20px' }}>
      <strong>Florida law requires</strong> every [LLC/Corporation] to have a registered agent - a person or business authorized to receive legal documents on behalf of your [LLC/Corporation].
    </p>
    
    <p className="text-amber-800" style={{ marginBottom: '24px' }}>
      ⚠️ Your Basic package does not include registered agent service. You must provide your own registered agent information below.
    </p>
    
    <div className="bg-emerald-50 rounded-lg" style={{ border: '1px solid #a7f3d0', padding: '20px' }}>
      <p className="font-medium text-emerald-700" style={{ marginBottom: '16px' }}>
        💡 <strong>Want us to handle this?</strong> Upgrade to Standard package for FREE registered agent service (first year) + Operating Agreement - only $149!
      </p>
      <button
        type="button"
        onClick={handleUpgradeToStandard}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        style={{ fontSize: '16px', padding: '14px 24px' }}
      >
        <span>✓</span>
        <span>Upgrade to Standard Package - $149</span>
      </button>
    </div>
  </div>
</div>
```

---

## Key Differences for Corporation Wizard

When creating the Corporation formation wizard, adjust these items:

1. **Form Fields:** Corporations have different requirements (directors vs managers, stock info, etc.)
2. **Step Names:** Adjust step names to match corporation requirements
3. **Messaging:** Replace "LLC" with "Corporation" in all user-facing text
4. **Validation Rules:** Corporation-specific validation (e.g., stock shares, par value)
5. **Service ID:** Use corporation service ID instead of LLC service ID

**Everything else stays the same!**

---

## Testing Checklist

Before deploying a new formation wizard, test:

- [ ] Package selector → Form flow
- [ ] Form data preservation when clicking "Change Package"
- [ ] Instant upgrade from Basic to Standard on RA step
- [ ] RA fields auto-fill for Standard/Premium packages
- [ ] RA fields empty for Basic package
- [ ] Switching from Standard to Basic preserves custom RA info
- [ ] All button padding looks correct (not cramped)
- [ ] Liquid glass effects render properly
- [ ] Spacing between sections is generous and readable
- [ ] Form submission with each package type
- [ ] Validation errors display correctly

---

## File References

- **Template Source:** `legalops-platform/src/components/LLCFormationWizard.tsx`
- **Parent Integration:** `legalops-platform/src/app/services/[slug]/page.tsx`
- **Package Selector:** `legalops-platform/src/components/PackageSelector.tsx`
- **Upsell Modal:** `legalops-platform/src/components/CheckoutUpsell.tsx`

---

## Notes

- This template was finalized on 2025-10-26 after extensive UX refinement
- All spacing, padding, and messaging has been optimized for user experience
- Form data preservation is critical for good UX - don't skip it!
- The instant upgrade feature significantly reduces friction for Basic package users
- Liquid glass styling is part of the LegalOps design system - maintain consistency

---

**When building Corporation wizard:** Copy LLCFormationWizard.tsx, rename to CorporationFormationWizard.tsx, adjust form fields and validation, keep ALL other functionality identical.

