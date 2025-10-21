# Form Design Quick Reference Card

## 🎨 Colors (Copy & Paste)
```tsx
Primary:    #0ea5e9  // Sky Blue
Success:    #10b981  // Green
Warning:    #f59e0b  // Amber
Error:      #ef4444  // Red
Text Dark:  #0f172a  // Slate 900
Text Muted: #64748b  // Slate 500
Border:     #e2e8f0  // Slate 200
```

## 📏 Spacing (Copy & Paste)
```tsx
xs:  8px   // gap-2, p-2, mb-2
sm:  12px  // gap-3, p-3, mb-3
md:  16px  // gap-4, p-4, mb-4
lg:  24px  // gap-6, p-6, mb-6
xl:  32px  // gap-8, p-8, mb-8
2xl: 48px  // gap-12, p-12, mb-12
```

## 📝 Input Template (Copy & Paste)
```tsx
import { FormInput } from '@/components/forms';

<FormInput
  label="Field Name"
  name="fieldName"
  placeholder="e.g., Example"
  required
  error={errors.fieldName}
  tooltip="Optional help text"
/>
```

## 📋 TextArea Template (Copy & Paste)
```tsx
import { FormTextArea } from '@/components/forms';

<FormTextArea
  label="Field Name"
  name="fieldName"
  placeholder="Enter details..."
  rows={4}
  required
  error={errors.fieldName}
/>
```

## 🧙 Wizard Template (Copy & Paste)
```tsx
import { FormWizard, FormSection } from '@/components/forms';

const steps = [
  { id: 1, name: 'Step 1', description: 'Description' },
  { id: 2, name: 'Step 2', description: 'Description' },
  { id: 3, name: 'Review', description: 'Confirm' },
];

<FormWizard
  steps={steps}
  currentStep={currentStep}
  onNext={handleNext}
  onBack={handleBack}
  onSubmit={handleSubmit}
  loading={loading}
  error={error}
>
  {currentStep === 1 && (
    <FormSection title="Section Title" description="Optional description">
      {/* Fields */}
    </FormSection>
  )}
</FormWizard>
```

## 🔘 Button Templates (Copy & Paste)

**Primary Button:**
```tsx
<button className="bg-sky-600 text-white rounded-lg font-semibold 
                   hover:bg-sky-700 transition-all duration-200 px-6 py-4">
  Button Text
</button>
```

**Secondary Button:**
```tsx
<button className="border border-slate-300 text-slate-700 rounded-lg 
                   font-medium hover:bg-slate-50 transition-all duration-200 px-6 py-4">
  Button Text
</button>
```

**Success Button:**
```tsx
<button className="bg-emerald-600 text-white rounded-lg font-semibold 
                   hover:bg-emerald-700 transition-all duration-200 px-6 py-4">
  Submit
</button>
```

## 📑 Section Header (Copy & Paste)
```tsx
import { FormSection } from '@/components/forms';

<FormSection 
  title="Section Title" 
  description="Optional description text"
>
  {/* Content */}
</FormSection>
```

## ⚠️ Error Message (Copy & Paste)
```tsx
{error && (
  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
    <span>⚠️</span>
    {error}
  </p>
)}
```

## 💡 Tooltip (Copy & Paste)
```tsx
<div className="group relative">
  <span className="w-4 h-4 text-slate-400 cursor-help">ⓘ</span>
  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block 
                  w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
    Tooltip text here
  </div>
</div>
```

## 🛡️ Trust Signals (Copy & Paste)
```tsx
import { Shield, Check, Clock } from 'lucide-react';

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 p-6 
                bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-100">
  <div className="flex items-center gap-3">
    <Shield className="w-5 h-5 text-sky-600 flex-shrink-0" />
    <div>
      <p className="text-sm font-semibold text-slate-900">100% Secure</p>
      <p className="text-xs text-slate-600">Bank-level encryption</p>
    </div>
  </div>
  <div className="flex items-center gap-3">
    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
    <div>
      <p className="text-sm font-semibold text-slate-900">Accuracy Guaranteed</p>
      <p className="text-xs text-slate-600">We'll fix any errors</p>
    </div>
  </div>
  <div className="flex items-center gap-3">
    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
    <div>
      <p className="text-sm font-semibold text-slate-900">5-10 Minutes</p>
      <p className="text-xs text-slate-600">Average completion time</p>
    </div>
  </div>
</div>
```

## 📱 Responsive Grid (Copy & Paste)
```tsx
{/* Single column on mobile, 2 on desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Content */}
</div>
```

## ✅ Validation Pattern (Copy & Paste)
```tsx
const validateStep = (step: number): boolean => {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!formData.fieldName.trim()) {
      errors.fieldName = 'Field is required';
    }
  }

  setFieldErrors(errors);
  return Object.keys(errors).length === 0;
};
```

## 🎯 Complete Form Example
```tsx
'use client';

import { useState } from 'react';
import { FormWizard, FormSection, FormInput } from '@/components/forms';

export default function MyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 1, name: 'Info', description: 'Your details' },
    { id: 2, name: 'Review', description: 'Confirm' },
  ];

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <FormWizard
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={() => setCurrentStep(prev => prev - 1)}
      onSubmit={() => console.log('Submit', formData)}
    >
      {currentStep === 1 && (
        <FormSection title="Your Information">
          <FormInput
            label="Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />
        </FormSection>
      )}
    </FormWizard>
  );
}
```

## 📚 Full Documentation
- **Standards:** `docs/FORM_DESIGN_STANDARDS.md`
- **Components:** `src/components/forms/FormWizard.tsx`
- **Design Brief:** `DESIGN_BRIEF_FOR_CHATGPT.md`

