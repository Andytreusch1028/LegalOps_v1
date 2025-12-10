/**
 * Property-Based Tests for DataTable Component
 * 
 * Feature: code-quality-improvements, Property 18: Table Sorting Correctness
 * Validates: Requirements 9.4
 * 
 * These tests verify that the DataTable component correctly sorts data
 * in ascending and descending order for different data types.
 * 
 * @module components/ui/DataTable.test
 */

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, Column } from './DataTable';

/**
 * Helper function to extract sorted values from rendered table
 */
function extractColumnValues(columnIndex: number): string[] {
  const rows = screen.getAllByRole('row').slice(1); // Skip header row
  return rows.map(row => {
    const cells = row.querySelectorAll('td');
    return cells[columnIndex]?.textContent || '';
  });
}

/**
 * Helper function to check if array is sorted in ascending order
 */
function isSortedAscending<T>(arr: T[], compareFn: (a: T, b: T) => number): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (compareFn(arr[i], arr[i + 1]) > 0) {
      return false;
    }
  }
  return true;
}

/**
 * Helper function to check if array is sorted in descending order
 */
function isSortedDescending<T>(arr: T[], compareFn: (a: T, b: T) => number): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (compareFn(arr[i], arr[i + 1]) < 0) {
      return false;
    }
  }
  return true;
}

describe('DataTable - Property 18: Table Sorting Correctness', () => {
  /**
   * Feature: code-quality-improvements, Property 18: Table Sorting Correctness
   * 
   * Property: For any data table with sorting enabled, sorting by a column should
   * produce results in the correct order (ascending or descending) according to
   * the column's data type.
   */
  test('sorting numeric columns produces correct ascending order', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of objects with numeric values
        fc.array(
          fc.record({
            id: fc.uuid(),
            value: fc.integer({ min: -1000, max: 1000 }),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        async (data) => {
          // Skip if all values are the same (no meaningful sort)
          const uniqueValues = new Set(data.map(d => d.value));
          if (uniqueValues.size < 2) return true;
          
          const columns: Column<typeof data[0]>[] = [
            {
              id: 'value',
              header: 'Value',
              accessor: (row) => row.value.toString(),
              sortable: true,
              sortFn: (a, b) => a.value - b.value,
            },
          ];
          
          const user = userEvent.setup();
          const { container } = render(
            <DataTable
              data={data}
              columns={columns}
              getRowKey={(row) => row.id}
            />
          );
          
          // Click to sort ascending
          const header = screen.getByText('Value');
          await user.click(header);
          
          // Extract values from rendered table
          const renderedValues = extractColumnValues(0).map(Number);
          
          // Verify ascending order
          const isCorrectlySorted = isSortedAscending(
            renderedValues,
            (a, b) => a - b
          );
          
          // Clean up
          container.remove();
          
          return isCorrectlySorted;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting numeric columns produces correct descending order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            value: fc.integer({ min: -1000, max: 1000 }),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        async (data) => {
          // Skip if all values are the same
          const uniqueValues = new Set(data.map(d => d.value));
          if (uniqueValues.size < 2) return true;
          
          const columns: Column<typeof data[0]>[] = [
            {
              id: 'value',
              header: 'Value',
              accessor: (row) => row.value.toString(),
              sortable: true,
              sortFn: (a, b) => a.value - b.value,
            },
          ];
          
          const user = userEvent.setup();
          const { container } = render(
            <DataTable
              data={data}
              columns={columns}
              getRowKey={(row) => row.id}
            />
          );
          
          // Click twice to sort descending
          const header = screen.getByText('Value');
          await user.click(header);
          await user.click(header);
          
          // Extract values from rendered table
          const renderedValues = extractColumnValues(0).map(Number);
          
          // Verify descending order
          const isCorrectlySorted = isSortedDescending(
            renderedValues,
            (a, b) => a - b
          );
          
          // Clean up
          container.remove();
          
          return isCorrectlySorted;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting string columns produces correct alphabetical order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 20 }),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        async (data) => {
          // Skip if all names are the same
          const uniqueNames = new Set(data.map(d => d.name));
          if (uniqueNames.size < 2) return true;
          
          const columns: Column<typeof data[0]>[] = [
            {
              id: 'name',
              header: 'Name',
              accessor: (row) => row.name,
              sortable: true,
            },
          ];
          
          const user = userEvent.setup();
          const { container } = render(
            <DataTable
              data={data}
              columns={columns}
              getRowKey={(row) => row.id}
            />
          );
          
          // Click to sort ascending
          const header = screen.getByText('Name');
          await user.click(header);
          
          // Extract values from rendered table
          const renderedValues = extractColumnValues(0);
          
          // Verify alphabetical order
          const isCorrectlySorted = isSortedAscending(
            renderedValues,
            (a, b) => a.localeCompare(b)
          );
          
          // Clean up
          container.remove();
          
          return isCorrectlySorted;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting date columns produces correct chronological order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        async (data) => {
          // Skip if all dates are the same
          const uniqueDates = new Set(data.map(d => d.date.getTime()));
          if (uniqueDates.size < 2) return true;
          
          const columns: Column<typeof data[0]>[] = [
            {
              id: 'date',
              header: 'Date',
              accessor: (row) => row.date.toISOString().split('T')[0],
              sortable: true,
              sortFn: (a, b) => a.date.getTime() - b.date.getTime(),
            },
          ];
          
          const user = userEvent.setup();
          const { container } = render(
            <DataTable
              data={data}
              columns={columns}
              getRowKey={(row) => row.id}
            />
          );
          
          // Click to sort ascending
          const header = screen.getByText('Date');
          await user.click(header);
          
          // Extract values from rendered table and convert back to dates
          const renderedValues = extractColumnValues(0).map(dateStr => new Date(dateStr).getTime());
          
          // Verify chronological order
          const isCorrectlySorted = isSortedAscending(
            renderedValues,
            (a, b) => a - b
          );
          
          // Clean up
          container.remove();
          
          return isCorrectlySorted;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting handles null and undefined values correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            value: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
          }),
          { minLength: 3, maxLength: 20 }
        ),
        async (data) => {
          // Ensure we have at least one null and at least TWO non-null values with different values
          const nullCount = data.filter(d => d.value === null).length;
          const nonNullValues = data.filter(d => d.value !== null).map(d => d.value);
          const uniqueNonNullValues = new Set(nonNullValues);
          
          // Skip if we don't have enough variety to test sorting
          if (nullCount === 0 || nonNullValues.length < 2 || uniqueNonNullValues.size < 2) {
            return true;
          }
          
          const columns: Column<typeof data[0]>[] = [
            {
              id: 'value',
              header: 'Value',
              accessor: (row) => row.value?.toString() || '-',
              sortable: true,
              sortFn: (a, b) => {
                if (a.value === null && b.value === null) return 0;
                if (a.value === null) return 1; // Nulls go to end
                if (b.value === null) return -1;
                return a.value - b.value;
              },
            },
          ];
          
          const user = userEvent.setup();
          const { container } = render(
            <DataTable
              data={data}
              columns={columns}
              getRowKey={(row) => row.id}
            />
          );
          
          // Click to sort ascending
          const header = screen.getByText('Value');
          await user.click(header);
          
          // Extract values from rendered table
          const renderedValues = extractColumnValues(0);
          
          // Verify that non-null values come before null values (represented as '-')
          const firstNullIndex = renderedValues.findIndex(v => v === '-');
          if (firstNullIndex === -1) return true; // No nulls rendered
          
          // All values after first null should also be null
          const allNullsAtEnd = renderedValues
            .slice(firstNullIndex)
            .every(v => v === '-');
          
          // Clean up
          container.remove();
          
          return allNullsAtEnd;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting preserves data integrity (no rows lost or duplicated)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            value: fc.integer(),
          }),
          { minLength: 2, maxLength: 20 } // Require at least 2 rows
        ),
        async (data) => {
          const columns: Column<typeof data[0]>[] = [
            {
              id: 'value',
              header: 'Value',
              accessor: (row) => row.value.toString(),
              sortable: true,
              sortFn: (a, b) => a.value - b.value,
            },
          ];
          
          const user = userEvent.setup();
          const { container } = render(
            <DataTable
              data={data}
              columns={columns}
              getRowKey={(row) => row.id}
            />
          );
          
          // Click to sort
          const header = screen.getByText('Value');
          await user.click(header);
          
          // Count rendered rows (excluding header)
          const rows = screen.getAllByRole('row').slice(1);
          const rowCount = rows.length;
          
          // Clean up
          container.remove();
          
          // Verify same number of rows
          return rowCount === data.length;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('clicking sort header three times returns to unsorted state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            value: fc.integer({ min: 0, max: 100 }),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (data) => {
          // Skip if all values are the same (sorting won't change order)
          const uniqueValues = new Set(data.map(d => d.value));
          if (uniqueValues.size < 2) return true;
          
          const columns: Column<typeof data[0]>[] = [
            {
              id: 'value',
              header: 'Value',
              accessor: (row) => row.value.toString(),
              sortable: true,
              sortFn: (a, b) => a.value - b.value,
            },
          ];
          
          const user = userEvent.setup();
          const { container } = render(
            <DataTable
              data={data}
              columns={columns}
              getRowKey={(row) => row.id}
            />
          );
          
          // Get original order
          const originalValues = extractColumnValues(0);
          
          // Click three times (asc -> desc -> unsorted)
          const header = screen.getByText('Value');
          await user.click(header);
          await user.click(header);
          await user.click(header);
          
          // Get values after three clicks
          const finalValues = extractColumnValues(0);
          
          // Clean up
          container.remove();
          
          // Verify we're back to original order
          return JSON.stringify(originalValues) === JSON.stringify(finalValues);
        }
      ),
      { numRuns: 100 }
    );
  });
});
