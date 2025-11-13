# LegalOps Tooltip System - Visual Design Specifications
**Jony Ive-Inspired Design Tokens & CSS Implementation**

---

## Design Philosophy

> *"Simplicity is not the absence of clutter, that's a consequence of simplicity. Simplicity is somehow essentially describing the purpose and place of an object and product."* — Jony Ive

Every visual element in the LegalOps tooltip system serves a clear purpose:
- **Typography:** Ensures readability and hierarchy
- **Color:** Provides semantic meaning without distraction
- **Spacing:** Creates breathing room and visual calm
- **Motion:** Feels inevitable, not decorative
- **Shadow:** Suggests depth without heaviness

---

## Design Tokens

### Color Palette

```css
:root {
  /* ============================================ */
  /* TOOLTIP COLOR TOKENS */
  /* ============================================ */
  
  /* Base colors */
  --tooltip-bg-light: rgba(255, 255, 255, 0.98);
  --tooltip-bg-dark: rgba(31, 41, 55, 0.96);
  --tooltip-border: rgba(0, 0, 0, 0.08);
  --tooltip-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  
  /* Text colors */
  --tooltip-text-primary: #404040;      /* neutral-700 */
  --tooltip-text-secondary: #737373;    /* neutral-500 */
  --tooltip-text-muted: #A3A3A3;        /* neutral-400 */
  
  /* Variant accent colors */
  --tooltip-accent-info: #0ea5e9;       /* sky-500 */
  --tooltip-accent-success: #10b981;    /* emerald-500 */
  --tooltip-accent-warning: #f59e0b;    /* amber-500 */
  --tooltip-accent-legal: #8b5cf6;      /* violet-500 */
  
  /* Variant background colors (subtle tints) */
  --tooltip-bg-info: #f0f9ff;           /* sky-50 */
  --tooltip-bg-success: #f0fdf4;        /* emerald-50 */
  --tooltip-bg-warning: #fffbeb;        /* amber-50 */
  --tooltip-bg-legal: #f5f3ff;          /* violet-50 */
  
  /* Variant border colors */
  --tooltip-border-info: #e0f2fe;       /* sky-100 */
  --tooltip-border-success: #dcfce7;    /* emerald-100 */
  --tooltip-border-warning: #fef3c7;    /* amber-100 */
  --tooltip-border-legal: #ede9fe;      /* violet-100 */
}
```

### Typography Tokens

```css
:root {
  /* ============================================ */
  /* TOOLTIP TYPOGRAPHY TOKENS */
  /* ============================================ */
  
  /* Font families */
  --tooltip-font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  
  /* Font sizes */
  --tooltip-text-xs: 11px;      /* Disclaimer text */
  --tooltip-text-sm: 13px;      /* Default tooltip text */
  --tooltip-text-md: 14px;      /* Tooltip title */
  --tooltip-text-lg: 15px;      /* Large tooltips */
  
  /* Font weights */
  --tooltip-weight-normal: 500;  /* Medium weight for body */
  --tooltip-weight-semibold: 600; /* Semibold for titles */
  
  /* Line heights */
  --tooltip-leading-tight: 1.5;  /* Compact text */
  --tooltip-leading-normal: 1.6; /* Default (generous) */
  --tooltip-leading-relaxed: 1.7; /* Extra breathing room */
  
  /* Letter spacing */
  --tooltip-tracking-tight: -0.01em; /* Subtle tightening */
  --tooltip-tracking-normal: 0;
}
```

### Spacing Tokens

```css
:root {
  /* ============================================ */
  /* TOOLTIP SPACING TOKENS */
  /* ============================================ */
  
  /* Padding (internal spacing) */
  --tooltip-padding-sm: 6px 10px;    /* Small tooltips */
  --tooltip-padding-md: 8px 12px;    /* Default tooltips */
  --tooltip-padding-lg: 12px 16px;   /* Large tooltips */
  
  /* Gap (between elements) */
  --tooltip-gap-xs: 4px;   /* Icon to text */
  --tooltip-gap-sm: 8px;   /* Section spacing */
  --tooltip-gap-md: 12px;  /* Large section spacing */
  
  /* Offset (distance from trigger) */
  --tooltip-offset: 8px;   /* Distance from trigger element */
  
  /* Max width */
  --tooltip-max-width-sm: 200px;
  --tooltip-max-width-md: 280px;
  --tooltip-max-width-lg: 360px;
}
```

### Border & Shadow Tokens

```css
:root {
  /* ============================================ */
  /* TOOLTIP BORDER & SHADOW TOKENS */
  /* ============================================ */
  
  /* Border radius */
  --tooltip-radius: 10px;
  --tooltip-radius-sm: 8px;
  --tooltip-radius-lg: 12px;
  
  /* Border width */
  --tooltip-border-width: 1px;
  
  /* Shadows */
  --tooltip-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --tooltip-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
  --tooltip-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.16);
  
  /* Backdrop blur (liquid glass effect) */
  --tooltip-blur: 12px;
}
```

### Animation Tokens

```css
:root {
  /* ============================================ */
  /* TOOLTIP ANIMATION TOKENS */
  /* ============================================ */
  
  /* Durations */
  --tooltip-duration-fast: 100ms;
  --tooltip-duration-normal: 150ms;
  --tooltip-duration-slow: 200ms;
  
  /* Easing curves */
  --tooltip-easing-default: cubic-bezier(0.4, 0.0, 0.2, 1);
  --tooltip-easing-in: cubic-bezier(0.4, 0.0, 1, 1);
  --tooltip-easing-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  
  /* Transform values */
  --tooltip-translate-y: 4px;  /* Subtle vertical movement */
  --tooltip-scale: 0.98;       /* Subtle scale (if needed) */
}
```

---

## Component Styles

### Base Tooltip Container

```css
.tooltip-container {
  /* Layout */
  position: relative;
  display: inline-block;
  max-width: var(--tooltip-max-width-md);
  
  /* Background & Border */
  background: var(--tooltip-bg-light);
  border: var(--tooltip-border-width) solid var(--tooltip-border);
  border-radius: var(--tooltip-radius);
  
  /* Spacing */
  padding: var(--tooltip-padding-md);
  
  /* Shadow & Blur */
  box-shadow: var(--tooltip-shadow-md);
  backdrop-filter: blur(var(--tooltip-blur));
  -webkit-backdrop-filter: blur(var(--tooltip-blur));
  
  /* Typography */
  font-family: var(--tooltip-font-family);
  font-size: var(--tooltip-text-sm);
  font-weight: var(--tooltip-weight-normal);
  line-height: var(--tooltip-leading-normal);
  letter-spacing: var(--tooltip-tracking-tight);
  color: var(--tooltip-text-primary);
  
  /* Z-index */
  z-index: 9999;
  
  /* Prevent text selection */
  user-select: none;
  -webkit-user-select: none;
}
```

### Tooltip Arrow

```css
.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  
  /* Arrow size */
  --arrow-size: 6px;
}

/* Arrow pointing down (tooltip above element) */
.tooltip-arrow[data-side="top"] {
  bottom: calc(var(--arrow-size) * -1);
  border-width: var(--arrow-size) var(--arrow-size) 0 var(--arrow-size);
  border-color: var(--tooltip-bg-light) transparent transparent transparent;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.06));
}

/* Arrow pointing up (tooltip below element) */
.tooltip-arrow[data-side="bottom"] {
  top: calc(var(--arrow-size) * -1);
  border-width: 0 var(--arrow-size) var(--arrow-size) var(--arrow-size);
  border-color: transparent transparent var(--tooltip-bg-light) transparent;
  filter: drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.06));
}

/* Arrow pointing right (tooltip left of element) */
.tooltip-arrow[data-side="left"] {
  right: calc(var(--arrow-size) * -1);
  border-width: var(--arrow-size) 0 var(--arrow-size) var(--arrow-size);
  border-color: transparent transparent transparent var(--tooltip-bg-light);
  filter: drop-shadow(2px 0 2px rgba(0, 0, 0, 0.06));
}

/* Arrow pointing left (tooltip right of element) */
.tooltip-arrow[data-side="right"] {
  left: calc(var(--arrow-size) * -1);
  border-width: var(--arrow-size) var(--arrow-size) var(--arrow-size) 0;
  border-color: transparent var(--tooltip-bg-light) transparent transparent;
  filter: drop-shadow(-2px 0 2px rgba(0, 0, 0, 0.06));
}
```

### Tooltip Variants

```css
/* Info variant (default) */
.tooltip-variant-info {
  background: var(--tooltip-bg-light);
  border-color: var(--tooltip-border-info);
}

.tooltip-variant-info .tooltip-icon {
  color: var(--tooltip-accent-info);
}

/* Success variant */
.tooltip-variant-success {
  background: var(--tooltip-bg-success);
  border-color: var(--tooltip-border-success);
}

.tooltip-variant-success .tooltip-icon {
  color: var(--tooltip-accent-success);
}

/* Warning variant */
.tooltip-variant-warning {
  background: var(--tooltip-bg-warning);
  border-color: var(--tooltip-border-warning);
}

.tooltip-variant-warning .tooltip-icon {
  color: var(--tooltip-accent-warning);
}

/* Legal variant */
.tooltip-variant-legal {
  background: var(--tooltip-bg-legal);
  border-color: var(--tooltip-border-legal);
}

.tooltip-variant-legal .tooltip-icon {
  color: var(--tooltip-accent-legal);
}
```

### Tooltip Content Elements

```css
/* Content wrapper */
.tooltip-content {
  display: flex;
  align-items: flex-start;
  gap: var(--tooltip-gap-xs);
}

/* Icon */
.tooltip-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px; /* Optical alignment with text */
}

/* Text */
.tooltip-text {
  flex: 1;
  font-size: var(--tooltip-text-sm);
  line-height: var(--tooltip-leading-normal);
  color: var(--tooltip-text-primary);
}

/* Title (for expandable tooltips) */
.tooltip-title {
  font-size: var(--tooltip-text-md);
  font-weight: var(--tooltip-weight-semibold);
  line-height: var(--tooltip-leading-tight);
  color: var(--tooltip-text-primary);
  margin-bottom: 4px;
}

/* Disclaimer */
.tooltip-disclaimer {
  margin-top: var(--tooltip-gap-sm);
  padding-top: var(--tooltip-gap-sm);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: var(--tooltip-text-xs);
  line-height: var(--tooltip-leading-tight);
  color: var(--tooltip-text-muted);
  opacity: 0.8;
}

/* Learn more link */
.tooltip-link {
  display: inline-block;
  margin-top: var(--tooltip-gap-xs);
  font-size: var(--tooltip-text-xs);
  font-weight: var(--tooltip-weight-semibold);
  color: var(--tooltip-accent-info);
  text-decoration: none;
  transition: opacity var(--tooltip-duration-fast) var(--tooltip-easing-default);
}

.tooltip-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* Feedback widget */
.tooltip-feedback {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--tooltip-gap-sm);
  padding-top: var(--tooltip-gap-sm);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.tooltip-feedback-text {
  font-size: var(--tooltip-text-xs);
  color: var(--tooltip-text-muted);
}

.tooltip-feedback-buttons {
  display: flex;
  gap: 4px;
}

.tooltip-feedback-button {
  padding: 4px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color var(--tooltip-duration-fast) var(--tooltip-easing-default);
}

.tooltip-feedback-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
```

### Animations

```css
/* Fade in animation */
@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(var(--tooltip-translate-y));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade out animation */
@keyframes tooltipFadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(var(--tooltip-translate-y));
  }
}

/* Apply animations */
.tooltip-enter {
  animation: tooltipFadeIn var(--tooltip-duration-normal) var(--tooltip-easing-default);
}

.tooltip-exit {
  animation: tooltipFadeOut var(--tooltip-duration-fast) var(--tooltip-easing-default);
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .tooltip-enter,
  .tooltip-exit {
    animation: none;
    transition: opacity var(--tooltip-duration-fast);
  }
  
  @keyframes tooltipFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes tooltipFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
}
```

---

## Tailwind CSS Classes

### Base Tooltip

```tsx
<div className={cn(
  // Layout
  'relative inline-block max-w-[280px]',
  
  // Background & Border
  'bg-white/98 border border-slate-200/80',
  'rounded-[10px]',
  
  // Spacing
  'px-3 py-2',
  
  // Shadow & Blur
  'shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
  'backdrop-blur-[12px]',
  
  // Typography
  'font-medium text-[13px] leading-[1.6] tracking-[-0.01em]',
  'text-slate-700',
  
  // Z-index
  'z-[9999]',
  
  // User select
  'select-none'
)}>
  {content}
</div>
```

### Variant Classes

```tsx
const variantClasses = {
  info: 'bg-white/98 border-sky-100 text-slate-700',
  success: 'bg-emerald-50/98 border-emerald-100 text-emerald-900',
  warning: 'bg-amber-50/98 border-amber-100 text-amber-900',
  legal: 'bg-violet-50/98 border-violet-100 text-violet-900',
};
```

### Size Classes

```tsx
const sizeClasses = {
  sm: 'max-w-[200px] px-2.5 py-1.5 text-xs',
  md: 'max-w-[280px] px-3 py-2 text-[13px]',
  lg: 'max-w-[360px] px-4 py-3 text-sm',
};
```

---

## Accessibility Considerations

### Color Contrast

All tooltip text must meet **WCAG 2.1 AA** standards:

```css
/* Minimum contrast ratios */
--tooltip-contrast-normal: 4.5:1;  /* Normal text */
--tooltip-contrast-large: 3:1;     /* Large text (18px+) */

/* Verified combinations */
.tooltip-text-primary {
  color: #404040;  /* 10.4:1 on white */
}

.tooltip-text-secondary {
  color: #737373;  /* 4.6:1 on white */
}

.tooltip-text-muted {
  color: #A3A3A3;  /* 3.1:1 on white (large text only) */
}
```

### Focus States

```css
.tooltip-trigger:focus-visible {
  outline: 2px solid var(--tooltip-accent-info);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  .tooltip-container {
    border-width: 2px;
    border-color: currentColor;
  }
  
  .tooltip-text {
    font-weight: 600;
  }
}
```

---

## Responsive Behavior

### Mobile Adjustments

```css
@media (max-width: 640px) {
  .tooltip-container {
    max-width: calc(100vw - 32px); /* 16px margin on each side */
    font-size: 14px; /* Slightly larger on mobile */
  }
  
  .tooltip-icon {
    width: 18px;
    height: 18px;
  }
}
```

### Touch Targets

```css
.tooltip-trigger {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

## Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
  :root {
    --tooltip-bg-light: rgba(31, 41, 55, 0.96);
    --tooltip-border: rgba(255, 255, 255, 0.12);
    --tooltip-text-primary: #E5E5E5;
    --tooltip-text-secondary: #A3A3A3;
    --tooltip-text-muted: #737373;
  }
}
```

---

## Print Styles

```css
@media print {
  .tooltip-container {
    display: none !important;
  }
  
  .tooltip-trigger {
    /* Show trigger content normally */
    display: inline;
  }
}
```

---

## Browser Compatibility

**Supported browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Fallbacks:**
```css
/* Backdrop blur fallback */
@supports not (backdrop-filter: blur(12px)) {
  .tooltip-container {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: none;
  }
}
```

---

**Questions?** Refer to the [Tooltip Implementation Guide](./TOOLTIP_IMPLEMENTATION_GUIDE.md) for React component examples.

