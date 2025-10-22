import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/components/legalops/theme';

/**
 * LiquidGlassIcon - Apple-inspired icon component with gradient and glass effect
 *
 * Inspired by Apple's Liquid Glass design language (iOS 26, macOS Tahoe 26)
 * Features:
 * - Multi-layer design (gradient + glass overlay + icon + highlight)
 * - Category-based color gradients
 * - Translucent glass effect
 * - Specular highlights
 * - Responsive sizing
 * - Interactive states (hover, active, disabled)
 */

export type IconCategory =
  | 'business'      // Sky Blue - Business & Entity Management
  | 'documents'     // Emerald Green - Documents & Filings
  | 'payment'       // Violet Purple - Payment & Orders
  | 'user'          // Amber Orange - User & Account
  | 'analytics'     // Indigo Blue - Dashboard & Analytics
  | 'ai'            // Fuchsia Pink - AI & Automation
  | 'estate'        // Slate Gray - Estate Planning
  | 'success'       // Emerald Green - Success status
  | 'warning'       // Amber Yellow - Warning status
  | 'error'         // Rose Red - Error status
  | 'info';         // Sky Blue - Info status

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LiquidGlassIconProps {
  /** Lucide icon component OR ReactNode for backwards compatibility */
  icon?: LucideIcon;
  children?: ReactNode;
  /** Category determines the gradient colors */
  category?: IconCategory;
  /** Legacy variant prop (maps to category) */
  variant?: 'primary' | 'success' | 'warning' | 'neutral';
  /** Size of the icon */
  size?: IconSize;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}

// Category color configurations
const categoryStyles: Record<IconCategory, { background: string; boxShadow: string }> = {
  business: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    boxShadow: '0 6px 16px -2px rgba(14, 165, 233, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  },
  documents: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    boxShadow: '0 6px 16px -2px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  },
  payment: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    boxShadow: '0 6px 16px -2px rgba(139, 92, 246, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  },
  user: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    boxShadow: '0 6px 16px -2px rgba(245, 158, 11, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  },
  analytics: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    boxShadow: '0 6px 16px -2px rgba(99, 102, 241, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  },
  ai: {
    background: 'linear-gradient(135deg, #d946ef 0%, #c026d3 100%)',
    boxShadow: '0 6px 16px -2px rgba(217, 70, 239, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  },
  estate: {
    background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    boxShadow: '0 6px 16px -2px rgba(100, 116, 139, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  },
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    boxShadow: '0 6px 16px -2px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  },
  warning: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    boxShadow: '0 6px 16px -2px rgba(245, 158, 11, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  },
  error: {
    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    boxShadow: '0 6px 16px -2px rgba(244, 63, 94, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  },
  info: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    boxShadow: '0 6px 16px -2px rgba(14, 165, 233, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  },
};

// Size configurations
const sizeStyles = {
  sm: { container: 'w-6 h-6', icon: 'w-3 h-3', radius: 'rounded-lg' },      // 24px
  md: { container: 'w-8 h-8', icon: 'w-4 h-4', radius: 'rounded-lg' },      // 32px
  lg: { container: 'w-12 h-12', icon: 'w-6 h-6', radius: 'rounded-xl' },    // 48px
  xl: { container: 'w-16 h-16', icon: 'w-8 h-8', radius: 'rounded-2xl' },   // 64px
};

export function LiquidGlassIcon({
  icon: Icon,
  children,
  category,
  variant,
  size = 'md',
  className,
  disabled = false,
  onClick,
}: LiquidGlassIconProps) {
  // Map legacy variant to category for backwards compatibility
  const resolvedCategory = category || (
    variant === 'primary' ? 'business' :
    variant === 'success' ? 'success' :
    variant === 'warning' ? 'warning' :
    variant === 'neutral' ? 'info' :
    'business'
  );

  const config = sizeStyles[size];
  const styles = categoryStyles[resolvedCategory];

  return (
    <div
      className={cn(
        'flex items-center justify-center flex-shrink-0 relative overflow-hidden',
        config.container,
        config.radius,

        // Interactive states
        !disabled && onClick && 'cursor-pointer',
        !disabled && onClick && 'hover:-translate-y-0.5 hover:shadow-lg',
        !disabled && onClick && 'active:translate-y-0 active:shadow-md',
        !disabled && onClick && 'transition-all duration-200',

        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed grayscale',

        className
      )}
      style={{
        background: styles.background,
        boxShadow: styles.boxShadow,
        border: '1px solid rgba(255, 255, 255, 0.4)'
      }}
      onClick={!disabled ? onClick : undefined}
    >
      {/* Glass highlight effect */}
      <div
        className={cn('absolute inset-0', config.radius)}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%)',
          transform: 'translateY(-20%)',
        }}
      />

      {/* Icon wrapper */}
      <div
        className={cn(
          'relative z-10',
          config.icon,
          'text-white'
        )}
        style={{
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))'
        }}
      >
        {Icon ? <Icon className={config.icon} /> : children}
      </div>
    </div>
  );
}

/**
 * Usage Examples:
 *
 * // Business entity icon
 * <LiquidGlassIcon icon={Building2} category="business" size="lg" />
 *
 * // Document upload icon
 * <LiquidGlassIcon icon={Upload} category="documents" size="md" />
 *
 * // Payment icon
 * <LiquidGlassIcon icon={CreditCard} category="payment" size="md" />
 *
 * // Success status
 * <LiquidGlassIcon icon={CheckCircle} category="success" size="sm" />
 *
 * // Interactive button
 * <LiquidGlassIcon
 *   icon={Settings}
 *   category="user"
 *   size="md"
 *   onClick={() => console.log('Settings clicked')}
 * />
 *
 * // Backwards compatible (children)
 * <LiquidGlassIcon variant="primary" size="md">
 *   <Building2 />
 * </LiquidGlassIcon>
 */