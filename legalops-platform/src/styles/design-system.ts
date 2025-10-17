/**
 * LegalOps v1 Design System
 * Based on Jony Ive's Design Philosophy
 * 
 * Core Principles:
 * 1. Minimalism & Simplicity - "Less, but better"
 * 2. Functionality First - Design serves purpose
 * 3. Intuitive & Understandable - No manual needed
 * 4. Unobtrusive - Neutral, integrated with environment
 * 5. Attention to Detail - Obsessive focus on every pixel
 */

export const designSystem = {
  // ============================================
  // COLOR PALETTE - Modern Minimalist
  // ============================================
  colors: {
    // Primary Colors
    primary: {
      50: '#F0FDFA',   // Lightest teal
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',  // Main teal
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',  // Darkest teal
    },
    
    // Neutral Colors
    neutral: {
      50: '#FAFAFA',   // Off-white
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#1F2937',  // Charcoal
    },
    
    // Success (Sage Green)
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#10B981',  // Main sage green
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    
    // Error (Muted Red)
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    
    // Warning (Amber)
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    
    // Info (Sky Blue)
    info: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8',
      500: '#0EA5E9',
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E',
    },
  },

  // ============================================
  // SPACING SYSTEM - Balanced (8px base)
  // ============================================
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },

  // ============================================
  // TYPOGRAPHY - Clean & Hierarchical
  // ============================================
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"SF Mono", "Fira Code", "Courier New", monospace',
    },
    
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // ============================================
  // BORDER RADIUS - Slightly Rounded (Professional)
  // ============================================
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // ============================================
  // SHADOWS - Subtle Depth
  // ============================================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },

  // ============================================
  // ANIMATIONS - Minimal & Subtle (Apple-like)
  // ============================================
  animations: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '400ms',
    },
    
    easing: {
      // Apple's signature easing
      default: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0.0, 1, 1)',
      out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
  },

  // ============================================
  // BREAKPOINTS - Responsive Design
  // ============================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ============================================
  // Z-INDEX LAYERS - Organized Stacking
  // ============================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

// ============================================
// COMPONENT STYLES - Reusable Patterns
// ============================================

export const componentStyles = {
  // Button Styles
  button: {
    base: `
      inline-flex items-center justify-center
      font-medium transition-all
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
    variants: {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500',
      outline: 'border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500',
      ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500',
      danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500',
    },
  },

  // Input Styles
  input: {
    base: `
      w-full px-4 py-2.5
      border border-neutral-300 rounded-md
      bg-white text-neutral-900
      placeholder:text-neutral-400
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
      transition-all duration-200
      disabled:bg-neutral-50 disabled:cursor-not-allowed
    `,
    error: 'border-error-500 focus:ring-error-500',
    success: 'border-success-500 focus:ring-success-500',
  },

  // Card Styles
  card: {
    base: 'bg-white rounded-lg shadow-md overflow-hidden',
    hover: 'transition-shadow duration-200 hover:shadow-lg',
  },
};

export type DesignSystem = typeof designSystem;
export type ComponentStyles = typeof componentStyles;

