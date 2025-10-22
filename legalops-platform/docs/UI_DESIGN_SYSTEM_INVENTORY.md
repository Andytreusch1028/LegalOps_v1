# LegalOps v1 - UI/UX Design System Inventory

**Purpose:** Complete catalog of all icons, graphics, symbols, colors, and visual elements needed for consistent design across the application

**Last Updated:** 2025-10-19

---

## 📋 Table of Contents

1. [Emojis & Unicode Symbols](#emojis--unicode-symbols)
2. [SVG Icons (Heroicons/Lucide)](#svg-icons-heroiconslu cide)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [Spacing & Sizing](#spacing--sizing)
6. [Component Patterns](#component-patterns)
7. [Animation & Transitions](#animation--transitions)
8. [Design Tokens](#design-tokens)
9. [Icon Library Recommendations](#icon-library-recommendations)

---

## 🎨 Emojis & Unicode Symbols

### **Currently Used in Application:**

#### **Legal & Business Icons**
| Emoji | Usage | Component/Page | Size |
|-------|-------|----------------|------|
| ⚖️ | Legal/Justice | ServiceRefusalDisclaimer | 3xl (48px) |
| 📄 | Document/Filing | ImportantNotices (ATTENTION priority) | 18px |
| 📋 | General notice | ImportantNotices (default) | 18px |
| 🏠 | Home/Return | OrderDeclinedMessage buttons | inline |
| 🏢 | Business entity | (Planned for business cards) | - |

#### **Status & Alerts**
| Emoji | Usage | Component/Page | Size |
|-------|-------|----------------|------|
| ✅ | Success/Approved | OrderDeclinedMessage, checkout | 6xl (96px) |
| ✓ | Checkmark (text) | ImportantNotices, validation | inline |
| ⚠️ | Warning/Attention | ImportantNotices (URGENT), OrderDeclinedMessage | 6xl (96px) |
| 🔔 | Notifications | ImportantNotices header | 16px |
| 🔒 | Security/Locked | OrderDeclinedMessage (fraud_risk) | 6xl (96px) |
| 🔍 | Search/Review | OrderDeclinedMessage (verification), test pages | 6xl (96px) |

#### **Actions & Communication**
| Emoji | Usage | Component/Page | Size |
|-------|-------|----------------|------|
| 📧 | Email/Contact | OrderDeclinedMessage buttons | inline |
| 💳 | Payment | OrderDeclinedMessage (payment_issue) | 6xl (96px) |
| ✏️ | Edit | AddressValidationModal | inline |
| 🤖 | AI/Automation | Test risk scoring page | inline |

#### **Progress & Loading**
| Emoji | Usage | Component/Page | Size |
|-------|-------|----------------|------|
| 🔍 | Checking/Processing | Checkout processing step | 6xl (96px) |
| ⏳ | Loading (alternative) | (Not currently used) | - |

---

## 🎯 SVG Icons (Heroicons/Lucide)

### **Currently Implemented:**

#### **Checkmark/Success Icons**
```tsx
// Heroicons - Circle with checkmark
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
</svg>
```
**Usage:** ServiceRefusalDisclaimer (agreement accepted), checkout confirmation  
**Sizes:** w-5 h-5 (20px), w-6 h-6 (24px)  
**Colors:** text-green-600, text-green-700

#### **Arrow Icons**
```tsx
// Right arrow (chevron)
<svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
</svg>
```
**Usage:** ImportantNotices action buttons, navigation  
**Sizes:** 12px (small buttons)  
**Colors:** currentColor (inherits from parent)

#### **Lucide Icons (from legalops components)**
```tsx
import { 
  Building2,      // Business/LLC icon
  ChevronRight,   // Navigation arrow
  ChevronLeft,    // Back navigation
  Check,          // Checkmark
  Shield,         // Security/trust
  Clock,          // Time/deadline
  CircleAlert,    // Error/warning
  LucideIcon      // Type definition
} from 'lucide-react';
```

**Standard Sizes:**
- Small: `w-4 h-4` (16px)
- Medium: `w-6 h-6` (24px)
- Large: `w-8 h-8` (32px)

---

## 🎨 Color Palette

### **Primary Colors**

```css
/* Sky Blue (Primary Brand Color) */
--sky-50:  #f0f9ff
--sky-100: #e0f2fe
--sky-200: #bae6fd
--sky-300: #7dd3fc
--sky-400: #38bdf8
--sky-500: #0ea5e9  /* PRIMARY */
--sky-600: #0284c7
--sky-700: #0369a1
--sky-800: #075985
--sky-900: #0c4a6e
```

### **Status Colors**

#### **Success (Green)**
```css
--green-50:  #f0fdf4
--green-100: #dcfce7
--green-200: #bbf7d0
--green-300: #86efac
--green-400: #4ade80
--green-500: #22c55e
--green-600: #16a34a  /* Success actions */
--green-700: #15803d
--green-800: #166534
--green-900: #14532d
```

#### **Warning (Yellow/Amber)**
```css
--yellow-50:  #fefce8
--yellow-100: #fef3c7
--yellow-200: #fde68a
--yellow-300: #fcd34d
--yellow-400: #fbbf24  /* Warning badges */
--yellow-500: #f59e0b
--yellow-600: #d97706
--yellow-700: #b45309
--yellow-800: #92400e
--yellow-900: #78350f
```

#### **Error (Red)**
```css
--red-50:  #fef2f2
--red-100: #fee2e2
--red-200: #fecaca
--red-300: #fca5a5
--red-400: #f87171
--red-500: #ef4444
--red-600: #dc2626
--red-700: #b91c1c
--red-800: #991b1b
--red-900: #7f1d1d
```

#### **Info (Blue)**
```css
--blue-50:  #eff6ff
--blue-100: #dbeafe
--blue-200: #bfdbfe
--blue-300: #93c5fd
--blue-400: #60a5fa
--blue-500: #3b82f6
--blue-600: #2563eb  /* Info messages */
--blue-700: #1d4ed8
--blue-800: #1e40af
--blue-900: #1e3a8a
```

### **Neutral Colors (Gray)**
```css
--gray-50:  #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827
```

### **Slate (Alternative Neutral)**
```css
--slate-50:  #f8fafc
--slate-100: #f1f5f9
--slate-200: #e2e8f0
--slate-300: #cbd5e1
--slate-400: #94a3b8
--slate-500: #64748b
--slate-600: #475569
--slate-700: #334155
--slate-800: #1e293b
--slate-900: #0f172a
```

---

## 📐 Typography

### **Font Families**
```css
--font-geist-sans: 'Geist', system-ui, sans-serif;
--font-geist-mono: 'Geist Mono', monospace;
```

### **Font Sizes**
```css
text-xs:   0.75rem  (12px)
text-sm:   0.875rem (14px)
text-base: 1rem     (16px)
text-lg:   1.125rem (18px)
text-xl:   1.25rem  (20px)
text-2xl:  1.5rem   (24px)
text-3xl:  1.875rem (30px)
text-4xl:  2.25rem  (36px)
text-5xl:  3rem     (48px)
text-6xl:  3.75rem  (60px)
```

### **Font Weights**
```css
font-normal:   400
font-medium:   500
font-semibold: 600
font-bold:     700
```

### **Line Heights**
```css
leading-none:    1
leading-tight:   1.25
leading-snug:    1.375
leading-normal:  1.5
leading-relaxed: 1.625
leading-loose:   2
```

---

## 📏 Spacing & Sizing

### **Spacing Scale (Tailwind)**
```css
0:   0px
1:   0.25rem  (4px)
2:   0.5rem   (8px)
3:   0.75rem  (12px)
4:   1rem     (16px)
5:   1.25rem  (20px)
6:   1.5rem   (24px)  /* PRIMARY SPACING UNIT */
8:   2rem     (32px)
10:  2.5rem   (40px)
12:  3rem     (48px)
16:  4rem     (64px)
20:  5rem     (80px)
24:  6rem     (96px)
```

**LegalOps Standard:** 24px (gap-6, p-6, mb-6) for major spacing

### **Border Radius**
```css
rounded-none: 0px
rounded-sm:   0.125rem (2px)
rounded:      0.25rem  (4px)
rounded-md:   0.375rem (6px)
rounded-lg:   0.5rem   (8px)   /* STANDARD */
rounded-xl:   0.75rem  (12px)
rounded-2xl:  1rem     (16px)
rounded-full: 9999px
```

**LegalOps Standard:** `rounded-lg` (8px) for cards and buttons

### **Border Widths**
```css
border:   1px
border-2: 2px  /* STANDARD for important borders */
border-4: 4px  /* Accent borders (left side of cards) */
```

### **Shadow Levels**
```css
shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:     0 1px 3px 0 rgb(0 0 0 / 0.1)
shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1)
shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1)  /* Cards */
shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1)
```

---

## 🧩 Component Patterns

### **Card Pattern**
```tsx
<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
  {/* Content */}
</div>
```
**Standard:** white background, rounded-lg, shadow-lg, p-6 padding

### **Alert/Notice Pattern**
```tsx
// Success
<div className="bg-green-50 border border-green-200 rounded-lg p-4">
  
// Warning
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">

// Error
<div className="bg-red-50 border border-red-200 rounded-lg p-4">

// Info
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
```

### **Button Patterns**
```tsx
// Primary
<button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">

// Secondary
<button className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">

// Success
<button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">

// Danger
<button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
```

### **Input Pattern**
```tsx
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
```

### **Badge Pattern**
```tsx
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
  Badge Text
</span>
```

---

## ⚡ Animation & Transitions

### **Standard Transitions**
```css
transition-all duration-200  /* Quick interactions */
transition-all duration-300  /* Standard */
transition-colors            /* Color changes only */
```

### **Hover States**
```css
hover:bg-blue-700     /* Buttons */
hover:shadow-lg       /* Cards */
hover:underline       /* Links */
hover:bg-gray-50      /* Subtle backgrounds */
```

### **Loading Spinner**
```tsx
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
```

### **Pulse Animation**
```tsx
<div className="animate-pulse">Loading...</div>
```

---

## 🎯 Design Tokens

### **Consistent Measurements**

| Element | Size | Usage |
|---------|------|-------|
| Icon (small) | 16px (w-4 h-4) | Inline icons, form labels |
| Icon (medium) | 24px (w-6 h-6) | Buttons, cards |
| Icon (large) | 32px (w-8 h-8) | Headers, emphasis |
| Emoji (small) | 18px | Inline notices |
| Emoji (medium) | 48px (text-3xl) | Section headers |
| Emoji (large) | 96px (text-6xl) | Full-page messages |
| Card padding | 24px (p-6) | Standard card interior |
| Card gap | 24px (gap-6) | Between cards |
| Button padding | 12px 24px (py-3 px-6) | Standard buttons |
| Input height | 40px (py-2) | Form inputs |
| Border radius | 8px (rounded-lg) | Cards, buttons, inputs |
| Accent border | 4px (border-l-4) | Left side of cards |

---

## 📚 Icon Library Recommendations

### **Current Libraries in Use:**

1. **Heroicons** (SVG inline)
   - Checkmarks, arrows
   - MIT License
   - https://heroicons.com

2. **Lucide React** (npm package)
   - Business icons, UI elements
   - ISC License
   - https://lucide.dev
   - `npm install lucide-react`

3. **Unicode Emojis**
   - Quick visual indicators
   - No dependencies
   - Universal support

### **Recommended Additions:**

1. **React Icons** (comprehensive)
   - 50,000+ icons from multiple libraries
   - `npm install react-icons`
   - Includes: FontAwesome, Material Design, Bootstrap Icons

2. **Phosphor Icons** (modern alternative)
   - Clean, consistent design
   - `npm install @phosphor-icons/react`

---

## 🎨 Component-Specific Icon Needs

### **Dashboard**
- 🏠 Home
- 📊 Analytics/Stats
- 📁 Documents
- ⚙️ Settings
- 👤 Profile
- 🔔 Notifications

### **Business Management**
- 🏢 Business entity
- 📝 Edit business
- 🗑️ Delete business
- ➕ Add business
- 🔍 Search business

### **Filing Management**
- 📄 Document/Filing
- ✅ Approved
- ⏳ Pending
- ❌ Rejected
- 📤 Submit
- 📥 Download

### **Payment/Orders**
- 💳 Payment
- 🛒 Cart
- 💰 Money/Price
- 🧾 Receipt
- ✅ Payment success
- ❌ Payment failed

### **User Actions**
- ✏️ Edit
- 👁️ View
- 🗑️ Delete
- ➕ Add/Create
- 💾 Save
- ❌ Cancel

---

---

## 🔍 Current Usage Analysis

### **Components Analyzed:**
- ✅ ServiceRefusalDisclaimer.tsx
- ✅ OrderDeclinedMessage.tsx
- ✅ ImportantNotices.tsx
- ✅ AddressValidationModal.tsx
- ✅ admin/risk-management/page.tsx
- ✅ checkout-example/page.tsx
- ✅ test-risk-scoring/page.tsx
- ✅ LegalOps component library (cards, forms, layout)

### **Consistency Issues Found:**

1. **Mixed Icon Approaches**
   - Some components use emojis (⚠️, ✅)
   - Some use Heroicons SVG (inline)
   - Some use Lucide React (imported)
   - **Recommendation:** Standardize on Lucide React for all icons, keep emojis only for large visual elements

2. **Inconsistent Sizing**
   - Emojis range from inline to text-6xl
   - SVG icons use w-5 h-5, w-6 h-6, 12px, 16px, 18px
   - **Recommendation:** Use only w-4, w-6, w-8 (16px, 24px, 32px)

3. **Color Variations**
   - Blue: sky-500, blue-600, blue-700
   - Green: green-50 through green-900
   - **Recommendation:** Document primary shades for each use case

---

## 🎨 Recommended Design System Structure

### **Icon Component Wrapper**

```tsx
// src/components/legalops/icons/Icon.tsx
import { LucideIcon } from 'lucide-react';
import { cn } from '../theme';

interface IconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Icon({ icon: IconComponent, size = 'md', variant = 'default', className }: IconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const variantClasses = {
    default: 'text-slate-600',
    primary: 'text-sky-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  };

  return (
    <IconComponent
      className={cn(sizeClasses[size], variantClasses[variant], className)}
    />
  );
}
```

### **Status Badge Component**

```tsx
// src/components/legalops/badges/StatusBadge.tsx
import { cn } from '../theme';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const statusStyles = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium border',
      statusStyles[status],
      sizeStyles[size]
    )}>
      {label}
    </span>
  );
}
```

---

## 📊 Risk Level Visual Standards

### **Risk Score Badges**

| Risk Level | Score Range | Background | Text | Border | Icon |
|------------|-------------|------------|------|--------|------|
| LOW | 0-25 | bg-green-100 | text-green-800 | border-green-500 | ✅ |
| MEDIUM | 26-50 | bg-yellow-100 | text-yellow-800 | border-yellow-500 | ⚠️ |
| HIGH | 51-75 | bg-orange-100 | text-orange-800 | border-orange-500 | 🔶 |
| CRITICAL | 76-100 | bg-red-100 | text-red-800 | border-red-500 | 🔴 |

### **Priority Level Visual Standards**

| Priority | Background | Border | Icon | Icon Background |
|----------|------------|--------|------|-----------------|
| URGENT | #fef3c7 | #f59e0b | ⚠️ | #fbbf24 |
| ATTENTION | #dbeafe | #3b82f6 | 📄 | #60a5fa |
| SUCCESS | #d1fae5 | #10b981 | ✅ | #34d399 |
| DEFAULT | #f3f4f6 | #9ca3af | 📋 | #d1d5db |

---

## 🎯 Icon Usage Guidelines

### **When to Use Emojis vs SVG Icons**

**Use Emojis For:**
- ✅ Large visual elements (text-6xl) on full-page messages
- ✅ Quick visual indicators in notices/alerts
- ✅ Decorative elements that don't need to match brand colors
- ✅ Universal concepts (✅ success, ⚠️ warning, 🔒 security)

**Use SVG Icons (Lucide) For:**
- ✅ Navigation elements
- ✅ Buttons and interactive elements
- ✅ Icons that need to match brand colors
- ✅ Icons that need hover states
- ✅ Icons in forms and inputs
- ✅ Dashboard and data visualization

### **Icon Sizing Standards**

| Context | Size | Tailwind Class | Pixels |
|---------|------|----------------|--------|
| Inline text | sm | w-4 h-4 | 16px |
| Form labels | sm | w-4 h-4 | 16px |
| Buttons | md | w-6 h-6 | 24px |
| Card headers | md | w-6 h-6 | 24px |
| Page headers | lg | w-8 h-8 | 32px |
| Empty states | xl | w-16 h-16 | 64px |
| Full-page messages | emoji | text-6xl | 96px |

---

## 🎨 Color Usage Guidelines

### **Primary Actions**
- **Background:** bg-sky-500 or bg-blue-600
- **Hover:** hover:bg-sky-600 or hover:bg-blue-700
- **Text:** text-white
- **Border:** border-sky-500 (if outlined)

### **Success States**
- **Background:** bg-green-50 (light) or bg-green-600 (solid)
- **Border:** border-green-200 (light) or border-green-500 (emphasis)
- **Text:** text-green-800 (on light) or text-white (on solid)
- **Icon:** text-green-600

### **Warning States**
- **Background:** bg-yellow-50 (light) or bg-yellow-600 (solid)
- **Border:** border-yellow-200 (light) or border-yellow-500 (emphasis)
- **Text:** text-yellow-800 (on light) or text-white (on solid)
- **Icon:** text-yellow-600

### **Error States**
- **Background:** bg-red-50 (light) or bg-red-600 (solid)
- **Border:** border-red-200 (light) or border-red-500 (emphasis)
- **Text:** text-red-800 (on light) or text-white (on solid)
- **Icon:** text-red-600

### **Info/Neutral States**
- **Background:** bg-blue-50 (light) or bg-gray-100 (neutral)
- **Border:** border-blue-200 (light) or border-gray-300 (neutral)
- **Text:** text-blue-800 (on light) or text-gray-800 (on neutral)
- **Icon:** text-blue-600 or text-gray-600

---

## 📐 Layout Grid System

### **Container Widths**
```css
max-w-sm:   24rem  (384px)  /* Small modals */
max-w-md:   28rem  (448px)  /* Medium modals */
max-w-lg:   32rem  (512px)  /* Large modals */
max-w-xl:   36rem  (576px)  /* Extra large modals */
max-w-2xl:  42rem  (672px)  /* Forms */
max-w-4xl:  56rem  (896px)  /* Standard page width */
max-w-6xl:  72rem  (1152px) /* Wide dashboards */
max-w-7xl:  80rem  (1280px) /* Full width */
```

**LegalOps Standard:** `max-w-4xl mx-auto` for main content areas

### **Grid Patterns**
```tsx
// 2-column form
<div className="grid grid-cols-2 gap-6">

// 3-column cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Responsive sidebar layout
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <aside className="lg:col-span-1">Sidebar</aside>
  <main className="lg:col-span-3">Content</main>
</div>
```

---

## 🎭 Modal/Dialog Patterns

### **Standard Modal Structure**
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="bg-blue-600 text-white px-8 py-5 rounded-t-lg">
      <h2 className="text-2xl font-semibold">Modal Title</h2>
    </div>

    {/* Body */}
    <div className="p-8">
      {/* Content */}
    </div>

    {/* Footer */}
    <div className="px-8 py-6 bg-gray-50 rounded-b-lg flex justify-end gap-4">
      <button className="px-6 py-3 bg-gray-200 rounded-lg">Cancel</button>
      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">Confirm</button>
    </div>
  </div>
</div>
```

### **Modal Sizes**
- **Small:** max-w-md (forms, confirmations)
- **Medium:** max-w-2xl (detailed forms)
- **Large:** max-w-4xl (address validation, complex content)
- **Full:** max-w-6xl (data tables, dashboards)

---

## 🎨 Form Design Patterns

### **Input States**

**Default:**
```tsx
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
```

**Error:**
```tsx
<input className="w-full px-4 py-2 border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-red-500" />
<p className="mt-1 text-sm text-red-600">Error message here</p>
```

**Success:**
```tsx
<input className="w-full px-4 py-2 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-green-500" />
<p className="mt-1 text-sm text-green-600 flex items-center gap-1">
  <svg className="w-4 h-4">...</svg> Verified
</p>
```

**Disabled:**
```tsx
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" disabled />
```

### **Checkbox/Radio Patterns**
```tsx
// Checkbox
<input type="checkbox" className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />

// Radio
<input type="radio" className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500" />
```

---

## 📱 Responsive Design Breakpoints

```css
/* Tailwind default breakpoints */
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

### **Mobile-First Patterns**
```tsx
// Stack on mobile, side-by-side on desktop
<div className="flex flex-col md:flex-row gap-6">

// 1 column mobile, 2 columns tablet, 3 columns desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Hide on mobile, show on desktop
<div className="hidden lg:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="block lg:hidden">Mobile only</div>
```

---

## 🎯 Accessibility Standards

### **Color Contrast Requirements**
- **Normal text:** 4.5:1 minimum
- **Large text (18px+):** 3:1 minimum
- **Interactive elements:** 3:1 minimum

### **Focus States**
```tsx
// All interactive elements must have visible focus
focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
focus:outline-none
```

### **Icon Accessibility**
```tsx
// Always include aria-label for icon-only buttons
<button aria-label="Close modal">
  <X className="w-6 h-6" />
</button>

// Use aria-hidden for decorative icons
<span aria-hidden="true">🎉</span>
```

---

## 🚀 Next Steps & Recommendations

### **Immediate Actions:**

1. **Standardize Icon Library**
   - ✅ Install Lucide React (already installed)
   - ⏳ Create Icon wrapper component
   - ⏳ Replace inline SVGs with Lucide components
   - ⏳ Document icon usage in component library

2. **Create Design Token File**
   - ⏳ Create `src/styles/design-tokens.css`
   - ⏳ Define CSS custom properties for colors
   - ⏳ Define spacing variables
   - ⏳ Import in global styles

3. **Build Component Library**
   - ✅ ServiceCard, OrderSummaryCard (done)
   - ✅ TextInput, TextArea, Select (done)
   - ⏳ StatusBadge component
   - ⏳ Icon component wrapper
   - ⏳ Alert/Notice component
   - ⏳ Modal component wrapper

4. **Create Icon Showcase Page**
   - ⏳ Build `/design-system/icons` page
   - ⏳ Display all available icons
   - ⏳ Show usage examples
   - ⏳ Provide copy-paste code

5. **Documentation**
   - ✅ This inventory document (done)
   - ⏳ Component usage guide
   - ⏳ Color palette guide
   - ⏳ Accessibility checklist

### **Future Enhancements:**

1. **Design System Package**
   - Create separate npm package for LegalOps components
   - Version control for design system
   - Storybook for component documentation

2. **Figma Integration**
   - Create Figma design file
   - Match Tailwind tokens to Figma variables
   - Design-to-code workflow

3. **Dark Mode Support**
   - Define dark mode color palette
   - Add dark: variants to components
   - User preference detection

4. **Animation Library**
   - Framer Motion integration
   - Page transitions
   - Micro-interactions

---

## 📚 Resources

### **Documentation:**
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [Heroicons](https://heroicons.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### **Tools:**
- [Tailwind Color Generator](https://uicolors.app/create)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Palette Generator](https://coolors.co)

### **Internal Docs:**
- `docs/02-design-system/legalops-ui-guide.md`
- `docs/02-design-system/FORM_QUICK_REFERENCE.md`
- `docs/DESIGN_BRIEF_FOR_CHATGPT.md`
- `docs/DESIGN_BRIEF_TECHNICAL_DETAILS.md`

---

**Document Version:** 1.0
**Last Updated:** 2025-10-19
**Maintained By:** LegalOps Development Team

