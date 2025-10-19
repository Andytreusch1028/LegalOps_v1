/**
 * LegalOps v1 - Create Approval Notice Helper
 * 
 * Helper function for staff to create approval notices when making substantive changes
 */

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

interface Change {
  field: string;
  oldValue: string;
  newValue: string;
  changeType: 'SUBSTANTIVE' | 'MINOR';
  reason: string;
  changedBy: string;
  changedAt: string;
}

interface CreateApprovalNoticeParams {
  filingId: string;
  userId: string;
  changes: Change[];
  overallReason: string;
}

/**
 * Creates an approval notice for a filing with staff changes
 * Updates the filing status to PENDING_CUSTOMER_APPROVAL
 * Creates a notice for the customer to review and approve
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
            staffChanges: changes,
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
            staffChanges: changes,
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
        staffChanges: changes,
        staffChangeReason: overallReason,
        requiresApproval: true,
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
 * Helper to format field names for display
 */
export function formatFieldName(field: string): string {
  return field
    .split('.')
    .map(part => part.replace(/_/g, ' '))
    .join(' → ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Helper to determine if a change is substantive
 * This is a simple heuristic - you may want to customize this
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

