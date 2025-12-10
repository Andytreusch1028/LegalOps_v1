/**
 * LegalOps v1 - Create Approval Notice Helper
 * 
 * Helper function for staff to create approval notices when making substantive changes
 */

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

/**
 * Represents a single change made to a filing by staff.
 * Used for tracking and customer approval workflows.
 */
interface Change {
  /** The field that was changed (e.g., 'firstName', 'address.street') */
  field: string;
  /** The original value before the change */
  oldValue: string;
  /** The new value after the change */
  newValue: string;
  /** Classification of the change impact */
  changeType: 'SUBSTANTIVE' | 'MINOR';
  /** Explanation for why the change was made */
  reason: string;
  /** ID or name of the staff member who made the change */
  changedBy: string;
  /** ISO timestamp of when the change was made */
  changedAt: string;
}

/**
 * Parameters for creating an approval notice.
 */
interface CreateApprovalNoticeParams {
  /** ID of the filing being modified */
  filingId: string;
  /** ID of the user who owns the filing */
  userId: string;
  /** Array of changes made to the filing */
  changes: Change[];
  /** Overall explanation for all changes */
  overallReason: string;
}

/**
 * Creates an approval notice for a filing with staff changes.
 * 
 * Business Logic:
 * - Validates that all changes are properly documented
 * - Determines if changes are substantive or minor
 * - For minor changes only: checks user's auto-approve preference
 * - For substantive changes: requires explicit customer approval
 * - Creates appropriate notices for customer notification
 * - Updates filing status based on change type and user preferences
 * 
 * @param params - Parameters for creating the approval notice
 * @returns Result object with approval status and filing details
 * @throws Error if changes are not properly documented
 * 
 * @example
 * ```typescript
 * const result = await createApprovalNotice({
 *   filingId: 'filing_123',
 *   userId: 'user_456',
 *   changes: [{
 *     field: 'firstName',
 *     oldValue: 'John',
 *     newValue: 'Jon',
 *     changeType: 'MINOR',
 *     reason: 'Corrected spelling per customer request',
 *     changedBy: 'staff_789',
 *     changedAt: new Date().toISOString()
 *   }],
 *   overallReason: 'Correcting customer information'
 * });
 * 
 * if (result.requiresApproval) {
 *   // Customer must approve before filing
 * }
 * ```
 */
export async function createApprovalNotice({
  filingId,
  userId,
  changes,
  overallReason
}: CreateApprovalNoticeParams) {
  try {
    // CRITICAL VALIDATION: Must have at least one change logged
    if (!changes || changes.length === 0) {
      throw new Error('CRITICAL ERROR: Cannot create approval notice without logging specific changes. This is required for legal compliance and customer transparency.');
    }

    // CRITICAL VALIDATION: All changes must have required fields
    for (const change of changes) {
      if (!change.field || !change.oldValue || !change.newValue || !change.reason || !change.changedBy) {
        throw new Error(`CRITICAL ERROR: Change is missing required fields. All changes must include: field, oldValue, newValue, reason, and changedBy. Got: ${JSON.stringify(change)}`);
      }
    }

    // Check if any changes are substantive
    const hasSubstantiveChanges = changes.some(c => c.changeType === 'SUBSTANTIVE');

    // Get user's auto-approve preference
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        autoApproveMinorChanges: true,
        firstName: true,
        lastName: true,
      }
    });

    if (!hasSubstantiveChanges) {
      // Only minor changes

      // Check if user has auto-approve enabled
      if (user?.autoApproveMinorChanges) {
        // User pre-approved minor changes - proceed directly to READY_TO_FILE
        await prisma.filing.update({
          where: { id: filingId },
          data: {
            filingStatus: 'READY_TO_FILE',
            staffChanges: changes as Record<string, unknown>,
            staffChangeReason: overallReason,
            requiresApproval: false,
          }
        });

        // Create a notice informing customer that changes were made and auto-approved
        const filing = await prisma.filing.findUnique({
          where: { id: filingId },
          include: {
            businessEntity: {
              select: {
                legalName: true,
              }
            }
          }
        });

        await prisma.notice.create({
          data: {
            userId: userId,
            type: 'GENERAL_ALERT',
            priority: 'SUCCESS',
            title: `✓ Minor Corrections Made - Filing Proceeding`,
            message: `Our team made ${changes.length} minor correction${changes.length > 1 ? 's' : ''} to your ${filing?.businessEntity.legalName} filing and proceeded with submission (per your Fast-Track setting). You can review the changes in the filing details.`,
            filingId: filingId,
            actionUrl: `/dashboard/filings/${filingId}`,
            actionLabel: 'View Changes',
          }
        });

        return {
          success: true,
          requiresApproval: false,
          autoApproved: true,
          message: 'Filing updated with minor changes only. Auto-approved by customer preference. Ready to file.'
        };
      } else {
        // User wants to review all changes - move to READY_TO_FILE without approval requirement
        await prisma.filing.update({
          where: { id: filingId },
          data: {
            filingStatus: 'READY_TO_FILE',
            staffChanges: changes as Record<string, unknown>,
            staffChangeReason: overallReason,
            requiresApproval: false,
          }
        });

        return {
          success: true,
          requiresApproval: false,
          autoApproved: false,
          message: 'Filing updated with minor changes only. Ready to file.'
        };
      }
    }

    // Has substantive changes - require customer approval
    const filing = await prisma.filing.update({
      where: { id: filingId },
      data: {
        filingStatus: 'PENDING_CUSTOMER_APPROVAL',
          staffChanges: changes as Record<string, unknown>,
          staffChangeReason: overallReason,
          requiresApproval: false,
      },
      include: {
        businessEntity: {
          select: {
            legalName: true,
            documentNumber: true,
          }
        }
      }
    });

    // Create approval notice for customer
    await prisma.notice.create({
      data: {
        userId: userId,
        type: 'APPROVAL_REQUIRED',
        priority: 'URGENT',
        title: 'ACTION REQUIRED: Approve Changes to Filing',
        message: 'We made corrections to your filing. Please review and approve before we can submit to the state.',
        filingId: filingId,
        actionUrl: `/dashboard/filings/${filingId}/approve`,
        actionLabel: 'Review & Approve',
      }
    });

    return {
      success: true,
      requiresApproval: true,
      message: 'Filing updated. Customer approval required.',
      filing
    };
  } catch (error) {
    console.error('Error creating approval notice:', error);
    throw error;
  }
}

/**
 * Formats field names for user-friendly display.
 * Converts technical field names to readable labels.
 * 
 * @param field - Technical field name (e.g., 'user.first_name')
 * @returns Formatted field name (e.g., 'User → First Name')
 * 
 * @example
 * ```typescript
 * formatFieldName('address.street_line_1'); // 'Address → Street Line 1'
 * formatFieldName('firstName'); // 'Firstname'
 * ```
 */
export function formatFieldName(field: string): string {
  return field
    .split('.')
    .map(part => part.replace(/_/g, ' '))
    .join(' → ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Determines if a change is substantive or minor.
 * 
 * Substantive changes affect legal or identifying information and require customer approval.
 * Minor changes are formatting or non-critical corrections.
 * 
 * Business Logic:
 * - Checks if field is in the substantive fields list
 * - Compares normalized values to detect formatting-only changes
 * - Returns false if only formatting differs (e.g., 'John Smith' vs 'john smith')
 * 
 * @param field - The field name being changed
 * @param oldValue - The original value
 * @param newValue - The new value
 * @returns True if the change is substantive, false if minor
 * 
 * @example
 * ```typescript
 * isSubstantiveChange('firstName', 'John', 'Jon'); // true (content changed)
 * isSubstantiveChange('firstName', 'John', 'JOHN'); // false (formatting only)
 * isSubstantiveChange('notes', 'Old note', 'New note'); // false (not substantive field)
 * ```
 */
export function isSubstantiveChange(field: string, oldValue: string, newValue: string): boolean {
  // Fields that are always substantive
  const substantiveFields = [
    'firstName',
    'lastName',
    'legalName',
    'entityName',
    'documentNumber',
    'ein',
    'fei',
    'effectiveDate',
    'filingDate',
    'street',
    'city',
    'state',
    'zipCode',
    'title',
    'position',
  ];

  // Check if field contains any substantive keywords
  const fieldLower = field.toLowerCase();
  const isSubstantiveField = substantiveFields.some(sf => fieldLower.includes(sf.toLowerCase()));

  if (isSubstantiveField) {
    // Check if it's just a minor formatting change
    const oldNormalized = oldValue.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newNormalized = newValue.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // If normalized values are the same, it's just formatting
    if (oldNormalized === newNormalized) {
      return false;
    }
    
    return true;
  }

  return false;
}

