# Phase 7: Accessibility & Performance Guide

## 🎯 Overview

This document outlines accessibility and performance standards for Phase 7 (Smart + Safe Experience Overhaul).

---

## ♿ Accessibility Standards (WCAG 2.1 AA)

### Color Contrast Requirements

All text must meet WCAG 2.1 AA contrast ratios:
- **Normal text (< 18px):** Minimum 4.5:1 contrast ratio
- **Large text (≥ 18px or 14px bold):** Minimum 3:1 contrast ratio
- **UI components:** Minimum 3:1 contrast ratio

#### Liquid Glass Design System Compliance

✅ **Approved Color Combinations:**
```css
/* Text on White Background */
--text-dark: #0f172a (slate-900)    /* 16.1:1 ratio ✅ */
--text-medium: #475569 (slate-600)  /* 7.5:1 ratio ✅ */
--text-muted: #64748b (slate-500)   /* 5.8:1 ratio ✅ */

/* Primary Actions */
--sky-500: #0ea5e9 on white         /* 3.2:1 ratio ✅ */
--sky-600: #0284c7 on white         /* 4.7:1 ratio ✅ */

/* Success States */
--emerald-500: #10b981 on white     /* 3.1:1 ratio ✅ */
--emerald-600: #059669 on white     /* 4.5:1 ratio ✅ */
```

❌ **Avoid:**
```css
/* Insufficient Contrast */
--slate-400: #94a3b8 on white       /* 2.9:1 ratio ❌ */
--sky-300: #7dd3fc on white         /* 1.8:1 ratio ❌ */
```

---

### Keyboard Navigation

All interactive elements must be keyboard accessible:

#### Required Keyboard Support

| Element | Keys | Behavior |
|---------|------|----------|
| Buttons | `Enter`, `Space` | Activate |
| Links | `Enter` | Navigate |
| Forms | `Tab`, `Shift+Tab` | Navigate fields |
| Modals | `Esc` | Close |
| Dropdowns | `↑`, `↓`, `Enter` | Navigate & select |
| Wizard | `Tab`, `Enter` | Navigate steps |

#### Implementation Example

```tsx
// ✅ Good: Keyboard accessible button
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  className="liquid-glass-button"
>
  Submit
</button>

// ✅ Good: Focus visible
<input
  className="border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
/>
```

---

### Skip Links

Add skip links to bypass navigation:

```tsx
// Add to layout.tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-500 focus:text-white focus:rounded-lg"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

---

### ARIA Labels

Provide descriptive labels for screen readers:

```tsx
// ✅ Good: Descriptive ARIA labels
<button
  aria-label="Close dialog"
  onClick={onClose}
>
  <X size={20} />
</button>

<input
  type="text"
  aria-label="Business name"
  aria-describedby="business-name-help"
/>
<p id="business-name-help" className="text-sm text-slate-500">
  Enter your business legal name
</p>

// ✅ Good: Loading states
<button disabled={loading} aria-busy={loading}>
  {loading ? 'Saving...' : 'Save'}
</button>
```

---

### Form Validation

Provide clear, accessible error messages:

```tsx
// ✅ Good: Accessible form validation
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    Email Address
    <span className="text-red-500" aria-label="required">*</span>
  </label>
  <input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
    className={error ? 'border-red-500' : 'border-slate-300'}
  />
  {error && (
    <p id="email-error" className="text-sm text-red-600" role="alert">
      {error}
    </p>
  )}
</div>
```

---

## ⚡ Performance Optimization

### AI Call Optimization

Optimize AI calls for mobile performance (< 5s response):

#### 1. Request Debouncing

```tsx
import { useCallback } from 'react';
import { debounce } from 'lodash';

// Debounce AI calls to reduce API requests
const debouncedAssess = useCallback(
  debounce(async (data) => {
    const response = await fetch('/api/risk/assess', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }, 500),
  []
);
```

#### 2. Caching

```tsx
// Cache risk assessments to avoid duplicate calls
const riskCache = new Map<string, RiskAssessment>();

async function assessRisk(orderId: string) {
  if (riskCache.has(orderId)) {
    return riskCache.get(orderId);
  }
  
  const assessment = await fetch(`/api/risk/assess?orderId=${orderId}`);
  riskCache.set(orderId, assessment);
  return assessment;
}
```

#### 3. Progressive Loading

```tsx
// Show UI immediately, load AI results in background
function CheckoutPage() {
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load risk assessment in background
    assessRisk(orderId).then(setRiskAssessment).finally(() => setLoading(false));
  }, [orderId]);
  
  return (
    <>
      {/* Show form immediately */}
      <CheckoutForm />
      
      {/* Show risk badge when ready */}
      {loading ? (
        <div className="animate-pulse bg-slate-200 h-12 rounded-lg" />
      ) : (
        <SecurityConfidenceBadge {...riskAssessment} />
      )}
    </>
  );
}
```

---

### Image Optimization

Use Next.js Image component for automatic optimization:

```tsx
import Image from 'next/image';

// ✅ Good: Optimized images
<Image
  src="/logo.png"
  alt="LegalOps Logo"
  width={200}
  height={50}
  priority // For above-the-fold images
/>

<Image
  src="/service-icon.png"
  alt="LLC Formation"
  width={100}
  height={100}
  loading="lazy" // For below-the-fold images
/>
```

---

### Code Splitting

Lazy load heavy components:

```tsx
import dynamic from 'next/dynamic';

// Lazy load Wizard component
const Wizard = dynamic(() => import('@/components/phase7/Wizard'), {
  loading: () => <div>Loading wizard...</div>,
  ssr: false, // Disable SSR if not needed
});
```

---

### Bundle Size Monitoring

Monitor bundle size to keep pages fast:

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

**Target Metrics:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Total Blocking Time (TBT): < 200ms
- Cumulative Layout Shift (CLS): < 0.1

---

## 🧪 Testing

### Accessibility Testing

```bash
# Install axe-core
npm install --save-dev @axe-core/react

# Run accessibility tests
npm run test:a11y
```

### Performance Testing

```bash
# Run Lighthouse
npx lighthouse http://localhost:3003 --view

# Target scores:
# Performance: ≥ 90
# Accessibility: ≥ 95
# Best Practices: ≥ 90
# SEO: ≥ 90
```

---

## ✅ Checklist

### Before Deploying Phase 7

- [ ] All text meets WCAG 2.1 AA contrast ratios
- [ ] All interactive elements are keyboard accessible
- [ ] Skip links are present on all pages
- [ ] All images have descriptive alt text
- [ ] All forms have proper ARIA labels and error messages
- [ ] AI calls are debounced and cached
- [ ] Images are optimized with Next.js Image component
- [ ] Heavy components are lazy loaded
- [ ] Lighthouse Performance score ≥ 90
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] Mobile AI response time < 5s

---

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Accessibility](https://react.dev/learn/accessibility)

