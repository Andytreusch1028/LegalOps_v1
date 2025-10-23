# LegalOps Design Templates

## 📋 Overview

This document provides **copy-paste ready templates** for common page layouts and components used throughout the LegalOps platform. All templates follow the design patterns established in `/services` and `/services/[slug]` pages.

---

## 🎨 Core Design Principles

### Background Gradient
All pages use this consistent gradient background:
```tsx
style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}
```

### Spacing Rules
- **ALWAYS use inline styles** for spacing (padding, margin) - Tailwind classes often don't work
- Section spacing: `marginBottom: '96px'` between major sections
- Heading spacing: `marginBottom: '24px'` between section headings and content
- Card padding: `padding: '24px'` or `padding: '32px'` for larger cards

### Typography
- **Page titles**: `fontSize: '48px'`, `color: '#0f172a'`, `marginBottom: '16px'`
- **Section headings**: `fontSize: '32px'` or `text-3xl`, `color: '#0f172a'`
- **Card headings**: `fontSize: '18px'`, `lineHeight: '1.4'`
- **Body text**: `fontSize: '15px'` or `fontSize: '16px'`, `color: '#64748b'`
- **Small text**: `fontSize: '14px'` or `fontSize: '13px'`

---

## 📄 Page Layout Templates

### Template 1: Service Listing Page (Grid Layout)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileText, RefreshCw } from 'lucide-react';
import { ServiceCard } from '@/components/legalops/cards/ServiceCard';
import { LiquidGlassIcon, IconCategory } from '@/components/legalops/icons/LiquidGlassIcon';
import { cn } from '@/components/legalops/theme';

export default function YourPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Services', icon: Grid3x3, category: 'estate' as IconCategory },
    { value: 'FORMATION', label: 'Formation', icon: Building2, category: 'business' as IconCategory },
    // Add more categories...
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}>
      {/* Header */}
      <div className="bg-white" style={{ borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <h1 className="font-semibold tracking-tight" style={{ fontSize: '48px', color: '#0f172a', marginBottom: '16px' }}>
            Your Page Title
          </h1>
          <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '768px', margin: '0 auto' }}>
            Your page description goes here
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        
        {/* Category Filter - Liquid Glass Style */}
        <div style={{ marginBottom: '64px' }}>
          <div className="flex flex-wrap gap-4">
            {categories.map(cat => {
              const colorSchemes: Record<string, { border: string; bg: string; shadow: string }> = {
                all: { border: 'border-slate-300', bg: 'bg-gradient-to-br from-slate-50 to-slate-100', shadow: 'shadow-slate-200/50' },
                FORMATION: { border: 'border-sky-300', bg: 'bg-gradient-to-br from-sky-50 to-sky-100', shadow: 'shadow-sky-200/50' },
              };

              const colors = colorSchemes[cat.value] || colorSchemes.all;

              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    'inline-flex items-center gap-3 rounded-xl font-medium transition-all duration-200 pl-4 pr-8 py-3',
                    selectedCategory === cat.value
                      ? `${colors.bg} shadow-lg border-2 ${colors.border} ${colors.shadow} scale-105`
                      : 'bg-white/60 border border-slate-200 hover:bg-white hover:shadow-md hover:scale-102'
                  )}
                >
                  <LiquidGlassIcon icon={cat.icon} category={cat.category} size="sm" />
                  <span className={cn(
                    'text-sm mr-4',
                    selectedCategory === cat.value ? 'text-slate-900 font-semibold' : 'text-slate-600'
                  )}>
                    {cat.label}
                  </span>
                  <span className="w-2"></span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Section */}
        <div style={{ marginBottom: '96px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 className="text-3xl font-semibold text-slate-900 mb-2">Featured Items</h2>
            <p className="text-slate-600">Your featured items description</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Your ServiceCard components here */}
          </div>
        </div>

        {/* Other Section */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 className="text-3xl font-semibold text-slate-900 mb-2">Other Items</h2>
            <p className="text-slate-600">Additional items description</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Your ServiceCard components here */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Template 2: Detail Page with Sidebar (2-Column Layout)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Check, Clock } from 'lucide-react';
import { formatCurrency } from '@/components/legalops/utils';

export default function DetailPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}>
      {/* Hero Header */}
      <div className="bg-white" style={{ borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4"></div>
            <div className="lg:col-span-8">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span className="text-5xl">🏢</span>
                <div style={{ textAlign: 'left' }}>
                  <h1 className="font-semibold tracking-tight" style={{ fontSize: '48px', color: '#0f172a', marginBottom: '8px' }}>
                    Your Service Name
                  </h1>
                  <p style={{ fontSize: '18px', color: '#64748b' }}>
                    Short description of your service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Section - Sidebar + Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px 64px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Info Cards */}
          <div className="lg:col-span-4">
            <div className="space-y-8 sticky top-6">
              
              {/* About Card */}
              <div
                className="bg-white rounded-xl"
                style={{
                  borderTop: '1px solid #e2e8f0',
                  borderRight: '1px solid #e2e8f0',
                  borderBottom: '1px solid #e2e8f0',
                  borderLeft: '4px solid #0ea5e9',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <h3 className="font-semibold text-slate-900 mb-3" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                  About This Service
                </h3>
                <p className="text-slate-600" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Your detailed description goes here
                </p>
              </div>

              {/* What's Included Card */}
              <div
                className="bg-white rounded-xl"
                style={{
                  borderTop: '1px solid #e2e8f0',
                  borderRight: '1px solid #e2e8f0',
                  borderBottom: '1px solid #e2e8f0',
                  borderLeft: '4px solid #10b981',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <h3 className="font-semibold text-slate-900 mb-4" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                  What's Included
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      Feature 1
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      Feature 2
                    </span>
                  </li>
                </ul>
              </div>

              {/* Pricing Card */}
              <div
                className="bg-white rounded-xl"
                style={{
                  borderTop: '1px solid #e2e8f0',
                  borderRight: '1px solid #e2e8f0',
                  borderBottom: '1px solid #e2e8f0',
                  borderLeft: '4px solid #8b5cf6',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
                  padding: '24px',
                }}
              >
                <h3 className="font-semibold text-slate-900 mb-4" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                  Pricing
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600" style={{ fontSize: '15px' }}>Service Fee</span>
                    <span className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>
                      $100.00
                    </span>
                  </div>
                  <div className="pt-3" style={{ borderTop: '2px solid #e2e8f0' }}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>Total</span>
                      <span className="font-bold text-sky-600" style={{ fontSize: '28px' }}>
                        $100.00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl" style={{
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ padding: '32px 32px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h2 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px', lineHeight: '1.2' }}>
                    Your Form Title
                  </h2>
                  <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.5' }}>
                    Form description goes here
                  </p>
                </div>
                {/* Your form component goes here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎴 Card Templates

### Info Card with Left Border Accent

```tsx
<div
  className="bg-white rounded-xl"
  style={{
    borderTop: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    borderLeft: '4px solid #0ea5e9', // Change color: #0ea5e9 (blue), #10b981 (green), #8b5cf6 (purple), #f59e0b (amber)
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    padding: '24px',
  }}
>
  <h3 className="font-semibold text-slate-900 mb-3" style={{ fontSize: '18px', lineHeight: '1.4' }}>
    Card Title
  </h3>
  <p className="text-slate-600" style={{ fontSize: '15px', lineHeight: '1.6' }}>
    Card content goes here
  </p>
</div>
```

### Guarantee/Success Badge

```tsx
<div
  className="bg-emerald-50 rounded-lg"
  style={{
    border: '1px solid #a7f3d0',
    padding: '16px',
  }}
>
  <div className="flex items-start gap-3">
    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="font-semibold text-emerald-900 mb-1" style={{ fontSize: '14px' }}>
        100% Satisfaction Guarantee
      </p>
      <p className="text-emerald-700" style={{ fontSize: '13px', lineHeight: '1.5' }}>
        Full refund if we can't complete your filing
      </p>
    </div>
  </div>
</div>
```

---

## 🎯 Quick Reference

### Color Palette
- **Primary Blue**: `#0ea5e9` (sky-500)
- **Success Green**: `#10b981` (emerald-500)
- **Warning Amber**: `#f59e0b` (amber-500)
- **Purple**: `#8b5cf6` (violet-500)
- **Text Dark**: `#0f172a` (slate-900)
- **Text Muted**: `#64748b` (slate-500)
- **Border**: `#e2e8f0` (slate-200)

### Border Accent Colors
- Blue (business): `#0ea5e9`
- Green (documents/success): `#10b981`
- Purple (payment/premium): `#8b5cf6`
- Amber (warning/user): `#f59e0b`

### Common Shadows
- **Subtle**: `boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'`
- **Card**: `boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)'`
- **Elevated**: `boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'`

---

## ⚠️ Important Reminders

1. **ALWAYS use inline styles for spacing** - Tailwind padding/margin classes often don't work
2. **Use `style={{ paddingTop: '32px' }}` instead of `pt-8`** when Tailwind fails
3. **Section spacing**: 96px between major sections, 24px between headings and content
4. **Card padding**: Use inline `padding: '24px'` or `padding: '32px'`
5. **Background gradient**: Always use the standard gradient on page wrapper
6. **Max width**: 1280px for listing pages, 1400px for detail pages with sidebars

---

**Last Updated**: 2025-01-XX

