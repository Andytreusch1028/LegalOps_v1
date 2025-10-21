/**
 * LegalOps Design System Theme Tokens
 * 
 * Centralized design tokens for the LegalOps checkout flow
 * Based on the dashboard design system and GPT-5 component kit
 */

export const colors = {
  primary: '#0ea5e9',      // sky-500
  success: '#10b981',      // emerald-500
  warning: '#f59e0b',      // amber-500
  info: '#8b5cf6',         // violet-500
  textDark: '#0f172a',     // slate-900
  textMuted: '#64748b',    // slate-500
  border: '#e2e8f0',       // slate-200
  background: '#f9fafb',   // slate-50
} as const;

export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

export const radius = {
  button: '8px',
  card: '12px',
  input: '8px',
} as const;

export const shadows = {
  subtle: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
  hover: '0 10px 30px rgba(0, 0, 0, 0.1)',
  focus: '0 0 0 3px rgba(14, 165, 233, 0.1)',
} as const;

export const typography = {
  h1: 'text-3xl font-semibold text-slate-900',
  h2: 'text-xl font-semibold text-slate-800',
  h3: 'text-lg font-semibold text-slate-800',
  body: 'text-slate-500 text-base',
  label: 'text-[13px] font-medium text-slate-600',
  small: 'text-sm text-slate-500',
} as const;

export const accents = {
  sky: 'border-l-sky-500 bg-sky-50 text-sky-700',
  green: 'border-l-emerald-500 bg-emerald-50 text-emerald-700',
  amber: 'border-l-amber-500 bg-amber-50 text-amber-700',
  purple: 'border-l-violet-500 bg-violet-50 text-violet-700',
} as const;

export const status = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-sky-100 text-sky-700 border-sky-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
} as const;

/**
 * Utility function to combine class names
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Card base classes
 */
export const cardBase = 'bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_20px_rgba(0,0,0,0.05)] transition-all duration-200 ease-in-out';

/**
 * Card with hover effect
 */
export const cardHover = 'hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]';

/**
 * Input base classes
 */
export const inputBase = 'w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all';

/**
 * Button base classes
 */
export const buttonBase = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';

export const buttonVariants = {
  primary: 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-500',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-500',
} as const;

/**
 * Badge base classes
 */
export const badgeBase = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border';

