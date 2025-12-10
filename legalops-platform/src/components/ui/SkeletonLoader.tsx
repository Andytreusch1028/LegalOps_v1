/**
 * SkeletonLoader Component
 * 
 * A reusable skeleton loader component for displaying loading states
 * with consistent styling and animations.
 * 
 * @module components/ui/SkeletonLoader
 */

import React from 'react';
import { cn } from '@/components/legalops/theme';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

export interface SkeletonLoaderProps {
  /**
   * Visual variant of the skeleton
   * @default 'rectangular'
   */
  variant?: SkeletonVariant;
  
  /**
   * Width of the skeleton (CSS value)
   * @default '100%'
   */
  width?: string | number;
  
  /**
   * Height of the skeleton (CSS value)
   * @default depends on variant
   */
  height?: string | number;
  
  /**
   * Additional className for custom styling
   */
  className?: string;
  
  /**
   * Number of skeleton items to render
   * @default 1
   */
  count?: number;
  
  /**
   * Whether to animate the skeleton
   * @default true
   */
  animate?: boolean;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-none',
  rounded: 'rounded-lg',
};

const defaultHeights: Record<SkeletonVariant, string> = {
  text: '1rem',
  circular: '3rem',
  rectangular: '3rem',
  rounded: '3rem',
};

/**
 * SkeletonLoader component for loading states
 * 
 * @example
 * ```tsx
 * // Text skeleton
 * <SkeletonLoader variant="text" width="80%" />
 * 
 * // Avatar skeleton
 * <SkeletonLoader variant="circular" width={48} height={48} />
 * 
 * // Card skeleton
 * <SkeletonLoader variant="rounded" height={200} />
 * 
 * // Multiple skeletons
 * <SkeletonLoader variant="text" count={3} />
 * ```
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rectangular',
  width = '100%',
  height,
  className,
  count = 1,
  animate = true,
}) => {
  const skeletonHeight = height || defaultHeights[variant];
  
  const skeletonClasses = cn(
    // Base styles
    'bg-slate-200',
    // Variant styles
    variantStyles[variant],
    // Animation
    animate && 'animate-pulse',
    // Custom className
    className
  );
  
  const skeletonStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof skeletonHeight === 'number' ? `${skeletonHeight}px` : skeletonHeight,
  };
  
  // Render multiple skeletons if count > 1
  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={skeletonClasses}
            style={skeletonStyle}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }
  
  return (
    <div
      className={skeletonClasses}
      style={skeletonStyle}
      aria-hidden="true"
    />
  );
};

/**
 * Pre-built skeleton patterns for common use cases
 */
export const SkeletonPatterns = {
  /**
   * Skeleton for a card with title and description
   */
  Card: () => (
    <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
      <SkeletonLoader variant="text" width="60%" height={24} />
      <SkeletonLoader variant="text" count={3} />
      <div className="flex gap-2 pt-2">
        <SkeletonLoader variant="rounded" width={80} height={32} />
        <SkeletonLoader variant="rounded" width={80} height={32} />
      </div>
    </div>
  ),
  
  /**
   * Skeleton for a list item with avatar
   */
  ListItem: () => (
    <div className="flex items-center gap-4 p-4">
      <SkeletonLoader variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <SkeletonLoader variant="text" width="40%" height={16} />
        <SkeletonLoader variant="text" width="60%" height={14} />
      </div>
    </div>
  ),
  
  /**
   * Skeleton for a table row
   */
  TableRow: ({ columns = 4 }: { columns?: number }) => (
    <div className="flex items-center gap-4 p-4 border-b border-slate-200">
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="flex-1">
          <SkeletonLoader variant="text" />
        </div>
      ))}
    </div>
  ),
  
  /**
   * Skeleton for a form field
   */
  FormField: () => (
    <div className="space-y-2">
      <SkeletonLoader variant="text" width="30%" height={14} />
      <SkeletonLoader variant="rounded" height={42} />
    </div>
  ),
  
  /**
   * Skeleton for a dashboard stat card
   */
  StatCard: () => (
    <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
      <SkeletonLoader variant="text" width="50%" height={14} />
      <SkeletonLoader variant="text" width="40%" height={32} />
      <SkeletonLoader variant="text" width="60%" height={12} />
    </div>
  ),
};
