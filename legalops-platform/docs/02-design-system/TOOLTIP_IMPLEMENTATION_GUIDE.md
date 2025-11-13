# LegalOps Tooltip System - Implementation Guide
**React Component Specifications & Code Examples**

---

## Table of Contents
1. [Component Architecture](#component-architecture)
2. [Base Tooltip Component](#base-tooltip-component)
3. [Tooltip Variants](#tooltip-variants)
4. [Usage Examples](#usage-examples)
5. [Accessibility Implementation](#accessibility-implementation)
6. [Testing Checklist](#testing-checklist)

---

## Component Architecture

### File Structure
```
src/components/ui/
├── Tooltip/
│   ├── Tooltip.tsx              # Base component
│   ├── TooltipContent.tsx       # Content wrapper
│   ├── TooltipTrigger.tsx       # Trigger wrapper
│   ├── TooltipProvider.tsx      # Context provider
│   ├── TooltipArrow.tsx         # Arrow element
│   ├── tooltip.styles.ts        # Styled components
│   └── index.ts                 # Exports
```

### Dependencies
```json
{
  "@radix-ui/react-tooltip": "^1.0.7",
  "framer-motion": "^10.16.4",
  "lucide-react": "^0.294.0"
}
```

---

## Base Tooltip Component

### Tooltip.tsx

```tsx
'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type TooltipVariant = 'info' | 'success' | 'warning' | 'legal';
export type TooltipSize = 'sm' | 'md' | 'lg';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  variant?: TooltipVariant;
  size?: TooltipSize;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  disclaimer?: string | React.ReactNode;
  expandable?: {
    title: string;
    content: React.ReactNode;
    learnMoreUrl?: string;
  };
  feedback?: {
    enabled: boolean;
    onSubmit?: (response: string) => void;
  };
  icon?: boolean;
  className?: string;
}

// ============================================
// VARIANT STYLES
// ============================================

const variantStyles = {
  info: {
    bg: 'bg-white',
    border: 'border-slate-200',
    text: 'text-slate-700',
    accent: 'text-sky-500',
    icon: Info,
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    accent: 'text-emerald-500',
    icon: CheckCircle,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    accent: 'text-amber-500',
    icon: AlertCircle,
  },
  legal: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-900',
    accent: 'text-violet-500',
    icon: HelpCircle,
  },
};

const sizeStyles = {
  sm: {
    maxWidth: 'max-w-[200px]',
    padding: 'px-2.5 py-1.5',
    fontSize: 'text-xs',
  },
  md: {
    maxWidth: 'max-w-[280px]',
    padding: 'px-3 py-2',
    fontSize: 'text-[13px]',
  },
  lg: {
    maxWidth: 'max-w-[360px]',
    padding: 'px-4 py-3',
    fontSize: 'text-sm',
  },
};

// ============================================
// ANIMATION VARIANTS
// ============================================

const tooltipAnimation = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: {
    duration: 0.15,
    ease: [0.4, 0.0, 0.2, 1], // LegalOps easing curve
  },
};

// ============================================
// TOOLTIP COMPONENT
// ============================================

export function Tooltip({
  content,
  children,
  variant = 'info',
  size = 'md',
  side = 'top',
  align = 'center',
  delayDuration = 400,
  disclaimer,
  expandable,
  feedback,
  icon = true,
  className,
}: TooltipProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);

  const styles = variantStyles[variant];
  const sizing = sizeStyles[size];
  const IconComponent = styles.icon;

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>

        <AnimatePresence>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              side={side}
              align={align}
              sideOffset={8}
              asChild
            >
              <motion.div
                {...tooltipAnimation}
                className={cn(
                  // Base styles
                  'z-50 overflow-hidden rounded-[10px]',
                  'border backdrop-blur-[12px]',
                  'shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
                  
                  // Variant styles
                  styles.bg,
                  styles.border,
                  styles.text,
                  
                  // Size styles
                  sizing.maxWidth,
                  sizing.padding,
                  sizing.fontSize,
                  
                  // Typography
                  'font-medium leading-[1.6] tracking-[-0.01em]',
                  
                  className
                )}
              >
                {/* Content wrapper */}
                <div className="flex items-start gap-2">
                  {/* Icon */}
                  {icon && (
                    <IconComponent
                      size={16}
                      strokeWidth={2}
                      className={cn('flex-shrink-0 mt-0.5', styles.accent)}
                    />
                  )}

                  {/* Text content */}
                  <div className="flex-1">
                    {content}

                    {/* Expandable content */}
                    {expandable && (
                      <div className="mt-2">
                        {!isExpanded ? (
                          <button
                            onClick={() => setIsExpanded(true)}
                            className={cn(
                              'text-xs font-semibold',
                              styles.accent,
                              'hover:underline focus:outline-none'
                            )}
                          >
                            Learn more →
                          </button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 pt-2 border-t border-current/10"
                          >
                            <div className="font-semibold mb-1">
                              {expandable.title}
                            </div>
                            <div className="text-xs opacity-90">
                              {expandable.content}
                            </div>
                            {expandable.learnMoreUrl && (
                              <a
                                href={expandable.learnMoreUrl}
                                className={cn(
                                  'inline-block mt-2 text-xs font-semibold',
                                  styles.accent,
                                  'hover:underline'
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Read full guide →
                              </a>
                            )}
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Disclaimer */}
                    {disclaimer && (
                      <div className="mt-2 pt-2 border-t border-current/10">
                        <div className="text-[11px] leading-[1.5] opacity-70">
                          {disclaimer}
                        </div>
                      </div>
                    )}

                    {/* Feedback widget */}
                    {feedback?.enabled && !feedbackSubmitted && (
                      <div className="mt-2 pt-2 border-t border-current/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] opacity-70">
                            Was this helpful?
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                feedback.onSubmit?.('yes');
                                setFeedbackSubmitted(true);
                              }}
                              className="p-1 hover:bg-black/5 rounded transition-colors"
                              aria-label="Yes, this was helpful"
                            >
                              👍
                            </button>
                            <button
                              onClick={() => {
                                feedback.onSubmit?.('no');
                                setFeedbackSubmitted(true);
                              }}
                              className="p-1 hover:bg-black/5 rounded transition-colors"
                              aria-label="No, this was not helpful"
                            >
                              👎
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {feedbackSubmitted && (
                      <div className="mt-2 pt-2 border-t border-current/10">
                        <div className="text-[11px] opacity-70">
                          Thank you for your feedback!
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <TooltipPrimitive.Arrow
                  className={cn('fill-current', styles.bg)}
                  width={12}
                  height={6}
                />
              </motion.div>
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </AnimatePresence>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

// ============================================
// HELP ICON TRIGGER (Convenience Component)
// ============================================

export function TooltipHelpIcon({
  content,
  variant = 'info',
  ...props
}: Omit<TooltipProps, 'children'>) {
  const styles = variantStyles[variant];
  
  return (
    <Tooltip content={content} variant={variant} {...props}>
      <button
        className={cn(
          'inline-flex items-center justify-center',
          'w-4 h-4 rounded-full',
          'transition-colors',
          styles.accent,
          'hover:bg-current/10',
          'focus:outline-none focus:ring-2 focus:ring-current/20'
        )}
        aria-label="Help"
      >
        <HelpCircle size={14} strokeWidth={2} />
      </button>
    </Tooltip>
  );
}
```

---

## Usage Examples

### Example 1: Simple Info Tooltip

```tsx
import { Tooltip } from '@/components/ui/Tooltip';

export function RegisteredAgentField() {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        Registered Agent Name
        <Tooltip content="Your Registered Agent receives legal documents on behalf of your LLC.">
          <button className="text-slate-400 hover:text-slate-600">
            <Info size={16} />
          </button>
        </Tooltip>
      </label>
      <input
        type="text"
        className="input"
        placeholder="Enter name"
      />
    </div>
  );
}
```

### Example 2: Legal Tooltip with Disclaimer

```tsx
<Tooltip
  content="An Operating Agreement outlines your LLC's ownership structure, management rules, and member responsibilities."
  variant="legal"
  disclaimer="This information is for general educational purposes only and not legal advice. Consult an attorney for specific guidance."
>
  <span className="underline decoration-dotted cursor-help">
    Operating Agreement
  </span>
</Tooltip>
```

### Example 3: Expandable Tooltip

```tsx
<Tooltip
  content="Choose how your LLC will be taxed by the IRS."
  variant="info"
  expandable={{
    title: "Tax Classification Options",
    content: (
      <ul className="space-y-1 list-disc list-inside">
        <li>Single-Member: Reported on personal tax return</li>
        <li>Multi-Member: Partnership taxation</li>
        <li>S-Corp: Pass-through with payroll requirements</li>
        <li>C-Corp: Separate corporate tax return</li>
      </ul>
    ),
    learnMoreUrl: "/help/tax-classifications"
  }}
  disclaimer="This is educational information only. Consult a tax professional for advice."
>
  <TooltipHelpIcon />
</Tooltip>
```

### Example 4: Tooltip with Feedback

```tsx
<Tooltip
  content="Your principal address is your LLC's main business location. This will be public record."
  variant="info"
  feedback={{
    enabled: true,
    onSubmit: (response) => {
      // Track feedback
      analytics.track('tooltip_feedback', {
        field: 'principal_address',
        helpful: response === 'yes'
      });
    }
  }}
>
  <TooltipHelpIcon />
</Tooltip>
```

---

## Accessibility Implementation

### ARIA Attributes

```tsx
// Tooltip trigger
<button
  aria-label="Help: What is a Registered Agent?"
  aria-describedby="tooltip-registered-agent"
>
  <HelpCircle size={16} />
</button>

// Tooltip content
<div
  id="tooltip-registered-agent"
  role="tooltip"
  aria-live="polite"
>
  Your Registered Agent receives legal documents...
</div>
```

### Keyboard Navigation

```tsx
// ESC key to dismiss
React.useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, []);

// Focus management
<TooltipPrimitive.Trigger
  onFocus={() => setOpen(true)}
  onBlur={() => setOpen(false)}
>
  {children}
</TooltipPrimitive.Trigger>
```

### Screen Reader Support

```tsx
// Announce tooltip content
<div
  role="tooltip"
  aria-live="polite"
  aria-atomic="true"
>
  {content}
</div>

// Skip redundant announcements
<button aria-label="Help" aria-describedby="tooltip-id">
  <HelpCircle aria-hidden="true" />
</button>
```

---

## Testing Checklist

### Functional Testing
- [ ] Tooltip appears on hover (desktop)
- [ ] Tooltip appears on focus (keyboard)
- [ ] Tooltip appears on tap (mobile)
- [ ] Tooltip dismisses on mouse-out
- [ ] Tooltip dismisses on blur
- [ ] Tooltip dismisses on ESC key
- [ ] Tooltip dismisses on scroll (mobile)
- [ ] Expandable content toggles correctly
- [ ] Feedback widget submits responses
- [ ] "Learn more" links open correctly

### Visual Testing
- [ ] Tooltip positioned correctly (all sides)
- [ ] Tooltip doesn't overflow viewport
- [ ] Arrow points to trigger element
- [ ] Animation is smooth (150ms fade)
- [ ] Typography is readable (13px, 1.6 line-height)
- [ ] Colors match variant styles
- [ ] Backdrop blur effect works
- [ ] Shadow is subtle and appropriate

### Accessibility Testing
- [ ] WCAG 2.1 AA contrast ratio (4.5:1)
- [ ] Keyboard navigable (Tab, ESC)
- [ ] Screen reader announces content
- [ ] Focus visible on trigger
- [ ] ARIA labels present
- [ ] Touch target size ≥44px
- [ ] Works with high contrast mode
- [ ] Works with reduced motion

### Content Testing
- [ ] No UPL violations (legal advice)
- [ ] Disclaimers present on legal content
- [ ] Plain language (no jargon)
- [ ] Tone is friendly and professional
- [ ] Character count within limits
- [ ] Grammar and spelling correct

### Performance Testing
- [ ] No layout shift on tooltip open
- [ ] Smooth animation (60fps)
- [ ] No memory leaks
- [ ] Works with 10+ tooltips on page
- [ ] Fast initial render (<100ms)

---

## Analytics Tracking

```typescript
// Track tooltip interactions
export function trackTooltipEvent(
  action: 'open' | 'close' | 'expand' | 'feedback',
  data: {
    field: string;
    variant: TooltipVariant;
    helpful?: boolean;
  }
) {
  analytics.track('tooltip_interaction', {
    action,
    ...data,
    timestamp: new Date().toISOString(),
  });
}

// Usage
<Tooltip
  content="..."
  onOpenChange={(open) => {
    trackTooltipEvent(open ? 'open' : 'close', {
      field: 'registered_agent',
      variant: 'info',
    });
  }}
  feedback={{
    enabled: true,
    onSubmit: (response) => {
      trackTooltipEvent('feedback', {
        field: 'registered_agent',
        variant: 'info',
        helpful: response === 'yes',
      });
    },
  }}
>
  <TooltipHelpIcon />
</Tooltip>
```

---

## Next Steps

1. **Install dependencies:** `npm install @radix-ui/react-tooltip framer-motion`
2. **Create component files** in `src/components/ui/Tooltip/`
3. **Add to design system** documentation
4. **Write unit tests** with Jest + React Testing Library
5. **Conduct usability testing** with 10+ users
6. **Iterate based on feedback**

---

**Questions or feedback?** Contact the design system team or open an issue in the LegalOps repository.

