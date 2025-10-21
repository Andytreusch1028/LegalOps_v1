# LegalOps UI Component Library Guide

## Overview

The LegalOps UI Component Library is a modular, reusable component system built with React, TypeScript, and Tailwind CSS. It provides a consistent design language across the entire checkout flow and customer-facing pages.

## Design Philosophy

- **Minimalism**: Clean, uncluttered interfaces with generous whitespace
- **Consistency**: Unified color palette, typography, and spacing system
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels and keyboard navigation
- **Responsiveness**: Mobile-first design that scales beautifully across all devices
- **Performance**: Optimized components with loading states and smooth transitions

## Installation

All components are located in `/src/components/legalops/` and can be imported individually or as a group:

```tsx
// Import individual components
import { ServiceCard } from '@/components/legalops/cards/ServiceCard';
import { TextInput } from '@/components/legalops/forms/TextInput';

// Import all from a category
import { ServiceCard, OrderSummaryCard, SuccessCard } from '@/components/legalops/cards';

// Import utilities
import { cn, formatCurrency } from '@/components/legalops';
```

---

## Design Tokens

### Colors

```tsx
import { colors } from '@/components/legalops/theme';

colors.primary      // #0ea5e9 (Sky Blue)
colors.success      // #10b981 (Green)
colors.warning      // #f59e0b (Amber)
colors.info         // #8b5cf6 (Purple)
colors.textDark     // #0f172a (Slate 900)
colors.textMuted    // #64748b (Slate 500)
colors.border       // #e2e8f0 (Slate 200)
colors.background   // #f9fafb (Slate 50)
```

### Typography

```tsx
import { typography } from '@/components/legalops/theme';

typography.h1       // text-3xl font-semibold text-slate-900
typography.h2       // text-xl font-semibold text-slate-800
typography.h3       // text-lg font-semibold text-slate-800
typography.body     // text-slate-500 text-base
typography.label    // text-[13px] font-medium text-slate-600
typography.small    // text-sm text-slate-500
```

### Spacing

```tsx
import { spacing } from '@/components/legalops/theme';

spacing.xs          // 8px
spacing.sm          // 12px
spacing.md          // 16px
spacing.lg          // 24px
spacing.xl          // 32px
spacing['2xl']      // 48px
```

---

## Card Components

### ServiceCard

Displays a service offering with pricing, description, and call-to-action.

**Props:**
- `title` (string, required): Service name
- `description` (string, required): Short description
- `price` (number, required): Total price
- `icon` (ReactNode, optional): Custom icon
- `accentColor` ('sky' | 'green' | 'amber' | 'purple', optional): Left border color
- `badge` (string, optional): Badge text (e.g., "Popular")
- `onClick` (function, optional): Click handler
- `loading` (boolean, optional): Show skeleton loader

**Example:**
```tsx
<ServiceCard
  title="LLC Formation"
  description="Professional LLC formation service for Florida businesses"
  price={299.00}
  icon={<Building2 className="w-6 h-6" />}
  accentColor="sky"
  badge="Popular"
  onClick={() => router.push('/services/llc-formation')}
/>
```

### OrderSummaryCard

Displays order line items, subtotal, tax, and total with optional risk assessment.

**Props:**
- `items` (OrderLineItem[], required): Array of line items
- `subtotal` (number, required): Subtotal amount
- `tax` (number, required): Tax amount
- `total` (number, required): Total amount
- `showRiskBadge` (boolean, optional): Show fraud risk assessment
- `riskLevel` ('low' | 'medium' | 'high', optional): Risk level
- `loading` (boolean, optional): Show skeleton loader

**Example:**
```tsx
<OrderSummaryCard
  items={[
    {
      label: 'LLC Formation Service',
      value: 299.00,
      description: 'Professional filing service',
    },
  ]}
  subtotal={299.00}
  tax={20.93}
  total={319.93}
  showRiskBadge={true}
  riskLevel="low"
/>
```

### SuccessCard

Displays order confirmation with success message, steps, and action buttons.

**Props:**
- `title` (string, required): Main heading
- `subtitle` (string, optional): Subheading
- `orderNumber` (string, optional): Order number to display
- `message` (string, optional): Additional message
- `steps` (SuccessStep[], optional): Array of next steps
- `primaryAction` (object, optional): Primary button config
- `secondaryAction` (object, optional): Secondary button config

**Example:**
```tsx
<SuccessCard
  title="Order Confirmed!"
  subtitle="Thank you for your order"
  orderNumber="ORD-12345"
  message="A confirmation email has been sent to your email address"
  steps={[
    {
      title: 'Review Filing Information',
      description: "We'll review your filing information",
      eta: 'Within 24 hours',
    },
  ]}
  primaryAction={{
    label: 'Go to Dashboard',
    onClick: () => router.push('/dashboard'),
  }}
  secondaryAction={{
    label: 'Order Another Service',
    onClick: () => router.push('/services'),
  }}
/>
```

---

## Form Components

### TextInput

Styled text input with label, error handling, and tooltip support.

**Props:**
- `label` (string, optional): Field label
- `error` (string, optional): Error message
- `tooltip` (string, optional): Tooltip text
- `required` (boolean, optional): Show required indicator
- All standard HTML input props

**Example:**
```tsx
<TextInput
  label="Business Name"
  name="businessName"
  placeholder="e.g., Acme LLC"
  required
  tooltip="Enter your desired LLC name"
  error={errors.businessName?.message}
/>
```

### TextArea

Styled textarea with label and error handling.

**Example:**
```tsx
<TextArea
  label="Business Purpose"
  name="purpose"
  placeholder="Describe your business activities"
  rows={4}
  error={errors.purpose?.message}
/>
```

### Select

Styled select dropdown with options.

**Props:**
- `options` (SelectOption[], required): Array of {value, label} objects
- `placeholder` (string, optional): Placeholder text

**Example:**
```tsx
<Select
  label="State"
  name="state"
  options={[
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
  ]}
  placeholder="Select a state"
  required
/>
```

### FormSection

Container for grouping related form fields.

**Example:**
```tsx
<FormSection
  title="Business Information"
  description="Enter your LLC details"
>
  <TextInput label="Business Name" name="businessName" required />
  <TextInput label="EIN" name="ein" />
</FormSection>
```

---

## Checkout Components

### ProgressSteps

Displays multi-step progress indicator.

**Props:**
- `steps` (Step[], required): Array of step objects
- `currentStep` (number, required): Current step index (1-based)

**Example:**
```tsx
<ProgressSteps
  steps={[
    { id: 'review', label: 'Review Order', description: 'Verify details' },
    { id: 'payment', label: 'Payment', description: 'Secure checkout' },
    { id: 'confirmation', label: 'Confirmation', description: 'Order complete' },
  ]}
  currentStep={2}
/>
```

### ManagerCard

Displays manager/member information with optional remove action.

**Example:**
```tsx
<ManagerCard
  manager={{
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    address: {
      street: '123 Main St',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
    },
  }}
  onRemove={(id) => handleRemove(id)}
  showRemove={true}
/>
```

---

## Layout Components

### EmptyState

Displays empty state with icon, message, and optional action.

**Example:**
```tsx
<EmptyState
  icon={Building2}
  title="No services found"
  description="Try selecting a different category"
  action={{
    label: 'View All Services',
    onClick: () => setCategory('all'),
  }}
/>
```

---

## Utility Functions

### cn()

Combines class names, filtering out falsy values.

```tsx
import { cn } from '@/components/legalops/utils';

<div className={cn('base-class', isActive && 'active-class', 'another-class')} />
```

### formatCurrency()

Formats numbers as USD currency.

```tsx
import { formatCurrency } from '@/components/legalops/utils';

formatCurrency(299.00)  // "$299.00"
```

### formatDate()

Formats dates in a readable format.

```tsx
import { formatDate } from '@/components/legalops/utils';

formatDate(new Date())  // "Oct 20, 2025"
```

---

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Provide loading states** for async operations
3. **Include error handling** for all form inputs
4. **Use semantic HTML** and proper ARIA labels
5. **Test on mobile devices** to ensure responsiveness
6. **Follow the spacing system** for consistent layouts
7. **Use the cn() utility** for conditional classes

---

## Page Layout Pattern

All customer-facing pages should follow this structure:

```tsx
<div className="min-h-screen bg-[#f9fafb] px-6 py-12 md:px-12 lg:px-24">
  <div className="max-w-6xl mx-auto">
    {/* Page content */}
  </div>
</div>
```

---

## Support

For questions or issues with the component library, contact the development team or refer to the component source code in `/src/components/legalops/`.

