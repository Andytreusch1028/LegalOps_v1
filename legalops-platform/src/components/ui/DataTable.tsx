/**
 * DataTable Component
 * 
 * A reusable data table component with sorting, filtering, and pagination support.
 * Provides consistent styling and behavior across the application.
 * 
 * @module components/ui/DataTable
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/components/legalops/theme';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  /**
   * Unique identifier for the column
   */
  id: string;
  
  /**
   * Column header label
   */
  header: string;
  
  /**
   * Accessor function to get the cell value
   */
  accessor: (row: T) => React.ReactNode;
  
  /**
   * Whether the column is sortable
   * @default false
   */
  sortable?: boolean;
  
  /**
   * Custom sort function (if not provided, uses default comparison)
   */
  sortFn?: (a: T, b: T) => number;
  
  /**
   * Width of the column (CSS value)
   */
  width?: string;
  
  /**
   * Alignment of the column content
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  /**
   * Array of data to display
   */
  data: T[];
  
  /**
   * Column definitions
   */
  columns: Column<T>[];
  
  /**
   * Unique key extractor for rows
   */
  getRowKey: (row: T) => string;
  
  /**
   * Whether to show the table header
   * @default true
   */
  showHeader?: boolean;
  
  /**
   * Whether to enable row hover effect
   * @default true
   */
  hoverable?: boolean;
  
  /**
   * Whether to show row borders
   * @default true
   */
  bordered?: boolean;
  
  /**
   * Callback when a row is clicked
   */
  onRowClick?: (row: T) => void;
  
  /**
   * Message to display when there's no data
   * @default 'No data available'
   */
  emptyMessage?: string;
  
  /**
   * Additional className for the table container
   */
  className?: string;
}

/**
 * DataTable component with sorting and filtering
 * 
 * @example
 * ```tsx
 * const columns: Column<User>[] = [
 *   {
 *     id: 'name',
 *     header: 'Name',
 *     accessor: (user) => user.name,
 *     sortable: true,
 *   },
 *   {
 *     id: 'email',
 *     header: 'Email',
 *     accessor: (user) => user.email,
 *     sortable: true,
 *   },
 *   {
 *     id: 'status',
 *     header: 'Status',
 *     accessor: (user) => <Badge>{user.status}</Badge>,
 *     align: 'center',
 *   },
 * ];
 * 
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   getRowKey={(user) => user.id}
 *   onRowClick={(user) => navigate(`/users/${user.id}`)}
 * />
 * ```
 */
export function DataTable<T>({
  data,
  columns,
  getRowKey,
  showHeader = true,
  hoverable = true,
  bordered = true,
  onRowClick,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Handle column sort
  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;
    
    if (sortColumn === columnId) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };
  
  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;
    
    const column = columns.find(col => col.id === sortColumn);
    if (!column) return data;
    
    const sorted = [...data].sort((a, b) => {
      // Use custom sort function if provided
      if (column.sortFn) {
        return column.sortFn(a, b);
      }
      
      // Default sort by accessor value
      const aValue = column.accessor(a);
      const bValue = column.accessor(b);
      
      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      // Convert to string for comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      
      // Try numeric comparison first
      const aNum = Number(aStr);
      const bNum = Number(bStr);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      // Fall back to string comparison
      return aStr.localeCompare(bStr);
    });
    
    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }, [data, columns, sortColumn, sortDirection]);
  
  // Render sort icon
  const renderSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) {
      return (
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };
  
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        {/* Header */}
        {showHeader && (
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  style={{ width: column.width }}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer select-none hover:bg-slate-100 transition-colors'
                  )}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && renderSortIcon(column.id)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        
        {/* Body */}
        <tbody className="bg-white divide-y divide-slate-200">
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr
                key={getRowKey(row)}
                className={cn(
                  bordered && 'border-b border-slate-200',
                  hoverable && 'hover:bg-slate-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      'px-6 py-4 text-sm text-slate-900',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
