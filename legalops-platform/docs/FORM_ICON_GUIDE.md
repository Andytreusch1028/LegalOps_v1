# Form Icon Guide - Liquid Glass Design System

## 📋 Overview

This guide shows you exactly which Liquid Glass icons to use for all form elements, trust signals, and form-related UI components in the LegalOps platform.

**Last Updated:** 2025-10-22  
**Design System:** Liquid Glass (Apple-inspired)

---

## 🎨 Quick Reference

### **Trust Signals (FormWizard)**

Use these icons in the trust signals section of multi-step forms:

```tsx
import { Shield, Check, Clock } from 'lucide-react';
import { LiquidGlassIcon } from '@/components/legalops/icons/LiquidGlassIcon';

// Security Signal
<LiquidGlassIcon icon={Shield} category="info" size="lg" />
<p>100% Secure</p>
<p>Bank-level encryption</p>

// Accuracy Signal
<LiquidGlassIcon icon={Check} category="success" size="lg" />
<p>Accuracy Guaranteed</p>
<p>We'll fix any errors</p>

// Time Signal
<LiquidGlassIcon icon={Clock} category="warning" size="lg" />
<p>Estimated Time: 5-10 Minutes</p>
```

---

## 🏗️ Form Section Headers

### **Business Information**
```tsx
<LiquidGlassIcon icon={Building2} category="business" size="md" />
<h3>Business Information</h3>
```

### **Address Information**
```tsx
<LiquidGlassIcon icon={MapPin} category="documents" size="md" />
<h3>Business Address</h3>
```

### **Registered Agent**
```tsx
<LiquidGlassIcon icon={UserCheck} category="documents" size="md" />
<h3>Registered Agent</h3>
```

### **Managers/Owners**
```tsx
<LiquidGlassIcon icon={Users} category="user" size="md" />
<h3>Managers & Owners</h3>
```

### **Payment Information**
```tsx
<LiquidGlassIcon icon={CreditCard} category="payment" size="md" />
<h3>Payment Information</h3>
```

### **Review & Submit**
```tsx
<LiquidGlassIcon icon={FileCheck} category="success" size="md" />
<h3>Review Your Information</h3>
```

---

## ✅ Form Validation Icons

### **Success State**
```tsx
<LiquidGlassIcon icon={CheckCircle} category="success" size="sm" />
<span>Field validated successfully</span>
```

### **Error State**
```tsx
<LiquidGlassIcon icon={XCircle} category="error" size="sm" />
<span>Please correct this field</span>
```

### **Warning State**
```tsx
<LiquidGlassIcon icon={AlertTriangle} category="warning" size="sm" />
<span>Please review this information</span>
```

### **Info/Help**
```tsx
<LiquidGlassIcon icon={Info} category="info" size="sm" />
<span>Additional information available</span>
```

---

## 📝 Form Field Types

### **Text Input**
```tsx
<LiquidGlassIcon icon={Type} category="documents" size="sm" />
<label>Business Name</label>
```

### **Email Input**
```tsx
<LiquidGlassIcon icon={Mail} category="user" size="sm" />
<label>Email Address</label>
```

### **Phone Input**
```tsx
<LiquidGlassIcon icon={Phone} category="user" size="sm" />
<label>Phone Number</label>
```

### **Date Input**
```tsx
<LiquidGlassIcon icon={Calendar} category="analytics" size="sm" />
<label>Formation Date</label>
```

### **File Upload**
```tsx
<LiquidGlassIcon icon={Upload} category="documents" size="md" />
<label>Upload Document</label>
```

### **Dropdown/Select**
```tsx
<LiquidGlassIcon icon={ChevronDown} category="info" size="sm" />
<label>Select State</label>
```

---

## 🎯 Action Buttons

### **Submit/Continue**
```tsx
<button>
  <LiquidGlassIcon icon={ArrowRight} category="success" size="sm" />
  <span>Continue</span>
</button>
```

### **Back/Previous**
```tsx
<button>
  <LiquidGlassIcon icon={ArrowLeft} category="info" size="sm" />
  <span>Back</span>
</button>
```

### **Save Draft**
```tsx
<button>
  <LiquidGlassIcon icon={Save} category="documents" size="sm" />
  <span>Save Draft</span>
</button>
```

### **Cancel**
```tsx
<button>
  <LiquidGlassIcon icon={X} category="error" size="sm" />
  <span>Cancel</span>
</button>
```

---

## 🔐 Security & Trust Elements

### **SSL/Encryption**
```tsx
<LiquidGlassIcon icon={Lock} category="success" size="md" />
<p>Secure Connection</p>
```

### **Privacy**
```tsx
<LiquidGlassIcon icon={ShieldCheck} category="info" size="md" />
<p>Your data is private</p>
```

### **Verified**
```tsx
<LiquidGlassIcon icon={BadgeCheck} category="success" size="md" />
<p>Verified Information</p>
```

---

## 📊 Progress Indicators

### **Step Completed**
```tsx
<LiquidGlassIcon icon={CheckCircle} category="success" size="md" />
```

### **Current Step**
```tsx
<LiquidGlassIcon icon={Circle} category="business" size="md" />
```

### **Future Step**
```tsx
<LiquidGlassIcon icon={Circle} category="info" size="md" />
// Use disabled prop
<LiquidGlassIcon icon={Circle} category="info" size="md" disabled />
```

---

## 🎨 Category Color Mapping for Forms

| Form Element | Category | Gradient Color | Use Case |
|-------------|----------|----------------|----------|
| Business Info | `business` | Sky Blue | LLC formation, business details |
| Documents | `documents` | Emerald Green | File uploads, document fields |
| Payment | `payment` | Violet Purple | Payment forms, billing |
| User Info | `user` | Amber Orange | Contact info, account details |
| Analytics | `analytics` | Indigo Blue | Dates, statistics, reports |
| AI Features | `ai` | Fuchsia Pink | AI suggestions, smart fields |
| Estate Planning | `estate` | Slate Gray | Wills, trusts (future) |
| Success | `success` | Emerald Green | Validation, completion |
| Warning | `warning` | Amber Yellow | Alerts, cautions |
| Error | `error` | Rose Red | Errors, required fields |
| Info | `info` | Sky Blue | Help, information |

---

## 💡 Complete Form Example

```tsx
import { 
  Building2, 
  MapPin, 
  UserCheck, 
  Users, 
  CreditCard,
  FileCheck,
  Shield,
  Check,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { LiquidGlassIcon } from '@/components/legalops/icons/LiquidGlassIcon';
import { FormWizard, FormInput, FormSection } from '@/components/forms';

export default function MyForm() {
  return (
    <FormWizard
      steps={STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      onSubmit={handleSubmit}
      showTrustSignals={true}
    >
      {/* Step 1: Business Information */}
      {currentStep === 1 && (
        <FormSection
          title="Business Information"
          description="Tell us about your business"
          icon={<LiquidGlassIcon icon={Building2} category="business" size="md" />}
        >
          <FormInput
            label="Business Name"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
            error={errors.businessName}
            successIcon={<LiquidGlassIcon icon={CheckCircle} category="success" size="sm" />}
            errorIcon={<LiquidGlassIcon icon={XCircle} category="error" size="sm" />}
          />
        </FormSection>
      )}
      
      {/* Step 2: Address */}
      {currentStep === 2 && (
        <FormSection
          title="Business Address"
          description="Where is your business located?"
          icon={<LiquidGlassIcon icon={MapPin} category="documents" size="md" />}
        >
          {/* Address fields */}
        </FormSection>
      )}
      
      {/* More steps... */}
    </FormWizard>
  );
}
```

---

## 🚀 Implementation Checklist

When creating a new form:

- [ ] Import `LiquidGlassIcon` from `@/components/legalops/icons/LiquidGlassIcon`
- [ ] Import required Lucide icons
- [ ] Use `FormWizard` component for multi-step forms
- [ ] Add trust signals with proper category colors
- [ ] Use section icons with appropriate categories
- [ ] Add validation icons (success/error/warning)
- [ ] Use consistent sizing (sm for inline, md for headers, lg for trust signals)
- [ ] Test on mobile and desktop
- [ ] Verify color contrast for accessibility

---

## 📚 Related Documentation

- **Liquid Glass Design Proposal:** `docs/LIQUID_GLASS_DESIGN_PROPOSAL.md`
- **Icon Library Reference:** `docs/ICON_LIBRARY_REFERENCE.md`
- **Form Design Standards:** `docs/02-design-system/FORM_DESIGN_STANDARDS.md`
- **UI Design System Inventory:** `docs/UI_DESIGN_SYSTEM_INVENTORY.md`

---

## ❓ Questions?

**Which category should I use?**
- Business-related → `business`
- Documents/files → `documents`
- Money/payment → `payment`
- User/contact → `user`
- Success states → `success`
- Errors → `error`
- Warnings → `warning`
- General info → `info`

**Which size should I use?**
- Inline with text → `sm` (24px)
- Section headers → `md` (32px)
- Trust signals → `lg` (48px)
- Hero elements → `xl` (64px)

**Can I use custom colors?**
- No! Always use the predefined categories
- This ensures visual consistency across the app
- If you need a new category, discuss with the team first

---

**Last Updated:** 2025-10-22  
**Maintained By:** LegalOps Design Team

