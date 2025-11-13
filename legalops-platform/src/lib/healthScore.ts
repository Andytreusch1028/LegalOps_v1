/**
 * LegalOps v1 - Business Health Score Engine
 * 
 * Calculates a 0-100 health score for business entities based on:
 * - Compliance status (40 points): Annual reports, registered agent, etc.
 * - Document completeness (30 points): EIN, operating agreement, etc.
 * - Payment status (30 points): Outstanding invoices, payment method, etc.
 */

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export interface HealthScoreBreakdown {
  totalScore: number;
  compliance: {
    score: number;
    maxScore: 40;
    factors: HealthFactor[];
  };
  documents: {
    score: number;
    maxScore: 30;
    factors: HealthFactor[];
  };
  payments: {
    score: number;
    maxScore: 30;
    factors: HealthFactor[];
  };
  recommendations: string[];
}

export interface HealthFactor {
  name: string;
  impact: number; // Points deducted
  status: 'good' | 'warning' | 'critical';
  description: string;
}

/**
 * Calculate health score for a business entity
 */
export async function calculateHealthScore(businessId: string): Promise<HealthScoreBreakdown> {
  // Fetch business with all related data
  const business = await prisma.businessEntity.findUnique({
    where: { id: businessId },
    include: {
      registeredAgent: true,
      filings: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      client: {
        include: {
          user: true
        }
      }
    }
  });

  if (!business) {
    throw new Error('Business not found');
  }

  // Initialize scores
  let complianceScore = 40;
  let documentsScore = 30;
  let paymentsScore = 30;

  const complianceFactors: HealthFactor[] = [];
  const documentFactors: HealthFactor[] = [];
  const paymentFactors: HealthFactor[] = [];
  const recommendations: string[] = [];

  // ============================================================================
  // COMPLIANCE CHECKS (40 points)
  // ============================================================================

  // Check annual report status with Florida-specific compliance rules
  const annualReportStatus = checkAnnualReportStatus(business);

  // REVOKED - Entity administratively dissolved (-30 points - CRITICAL)
  if (annualReportStatus.isRevoked) {
    complianceScore -= 30;

    if (annualReportStatus.canBeReinstated) {
      complianceFactors.push({
        name: 'Administratively Dissolved',
        impact: 30,
        status: 'critical',
        description: `Entity revoked on ${annualReportStatus.revocationDate?.toLocaleDateString()}. Can be reinstated within ${10 - (annualReportStatus.yearsRevoked || 0)} years. Reinstatement fee: $${annualReportStatus.reinstatementFee.toFixed(2)}`
      });
      recommendations.push(`⚠️ URGENT: Reinstate ${business.legalName} immediately. Reinstatement fee: $${annualReportStatus.reinstatementFee.toFixed(2)}. Entity can be reinstated up to ${10 - (annualReportStatus.yearsRevoked || 0)} more years.`);
    } else {
      complianceFactors.push({
        name: 'Administratively Dissolved (Cannot Reinstate)',
        impact: 30,
        status: 'critical',
        description: `Entity revoked more than 10 years ago. Must form new entity.`
      });
      recommendations.push(`❌ CRITICAL: ${business.legalName} cannot be reinstated (revoked >10 years). You must form a new entity.`);
    }
  }
  // PENDING REVOCATION - Between 3rd and 4th Friday of September (-25 points - CRITICAL)
  else if (annualReportStatus.isPendingRevocation) {
    complianceScore -= 25;
    complianceFactors.push({
      name: 'Imminent Revocation Risk',
      impact: 25,
      status: 'critical',
      description: `Entity will be administratively dissolved in ${annualReportStatus.daysUntilRevocation} days if annual report not filed. Late fee: $${annualReportStatus.lateFee}`
    });
    recommendations.push(`🚨 URGENT: File annual report for ${business.legalName} within ${annualReportStatus.daysUntilRevocation} days to avoid administrative dissolution. Late fee: $${annualReportStatus.lateFee}`);
  }
  // LATE - After May 1 but before revocation deadline (-20 points)
  else if (annualReportStatus.isLate) {
    complianceScore -= 20;
    complianceFactors.push({
      name: 'Annual Report Late',
      impact: 20,
      status: 'critical',
      description: `Annual report overdue. Late fee: $${annualReportStatus.lateFee}. Must file by 3rd Friday of September to avoid revocation.`
    });
    recommendations.push(`File annual report for ${business.legalName} immediately. Late fee: $${annualReportStatus.lateFee}. Deadline to avoid revocation: 3rd Friday of September.`);
  }
  // OVERDUE - After May 1 (same as LATE, kept for backward compatibility)
  else if (annualReportStatus.isOverdue && !annualReportStatus.isLate) {
    complianceScore -= 20;
    complianceFactors.push({
      name: 'Annual Report Overdue',
      impact: 20,
      status: 'critical',
      description: `Annual report was due on ${annualReportStatus.dueDate?.toLocaleDateString()}`
    });
    recommendations.push(`File your annual report immediately to avoid $400 late fee and potential dissolution`);
  }
  // DUE SOON - Within 60 days of May 1 (-5 points - WARNING)
  else if (annualReportStatus.isDueSoon) {
    complianceScore -= 5;
    complianceFactors.push({
      name: 'Annual Report Due Soon',
      impact: 5,
      status: 'warning',
      description: `Annual report due in ${annualReportStatus.daysUntilDue} days (by ${annualReportStatus.dueDate?.toLocaleDateString()})`
    });
    recommendations.push(`File your annual report for ${business.legalName} before ${annualReportStatus.dueDate?.toLocaleDateString()} to avoid $400 late fee`);
  }
  // REINSTATED - Recently reinstated (+2 points recovery)
  else if (annualReportStatus.complianceStatus === 'REINSTATED') {
    complianceScore += 2; // Bonus for getting back in compliance
    complianceFactors.push({
      name: 'Recently Reinstated',
      impact: 0,
      status: 'good',
      description: 'Entity was recently reinstated and is now in good standing'
    });
  }

  // Check registered agent status (-10 points if missing)
  if (!business.registeredAgent) {
    complianceScore -= 10;
    complianceFactors.push({
      name: 'No Registered Agent',
      impact: 10,
      status: 'critical',
      description: 'Florida law requires all businesses to have a registered agent'
    });
    recommendations.push(`Add a registered agent for ${business.legalName} - required by Florida law`);
  }

  // Check if business is inactive/dissolved (-10 points)
  if (business.status === 'INACTIVE' || business.status === 'DISSOLVED') {
    complianceScore -= 10;
    complianceFactors.push({
      name: 'Business Inactive',
      impact: 10,
      status: 'critical',
      description: `Business status is ${business.status}`
    });
    recommendations.push(`Reactivate ${business.legalName} or file dissolution paperwork`);
  }

  // ============================================================================
  // DOCUMENT COMPLETENESS CHECKS (30 points)
  // ============================================================================

  // Check for EIN/FEI number (-10 points if missing)
  if (!business.feiNumber) {
    documentsScore -= 10;
    documentFactors.push({
      name: 'Missing EIN',
      impact: 10,
      status: 'warning',
      description: 'Federal Employer Identification Number not on file'
    });
    recommendations.push(`Apply for an EIN for ${business.legalName} - needed for taxes, hiring, and banking`);
  }

  // Check for operating agreement (for LLCs) or bylaws (for Corps)
  // Note: We don't have a documents table yet, so we'll skip this for now
  // When documents are implemented, add this check:
  // if (business.entityType === 'LLC' && !hasOperatingAgreement) {
  //   documentsScore -= 10;
  // }

  // Check if business purpose is defined (-5 points if missing)
  if (!business.purpose || business.purpose.trim().length === 0) {
    documentsScore -= 5;
    documentFactors.push({
      name: 'Missing Business Purpose',
      impact: 5,
      status: 'warning',
      description: 'Business purpose not documented (optional but recommended)'
    });
    recommendations.push(`Consider adding a business purpose for ${business.legalName} (optional - 80% of customers use "Any legitimate business purpose")`);
  }

  // Check if DBA is registered (if applicable)
  // This is informational, not a deduction
  if (business.dbaName) {
    documentFactors.push({
      name: 'DBA Registered',
      impact: 0,
      status: 'good',
      description: `Doing business as "${business.dbaName}"`
    });
  }

  // ============================================================================
  // PAYMENT STATUS CHECKS (30 points)
  // ============================================================================

  // Check for overdue invoices
  // Note: We'll need to query the Order table for unpaid invoices
  const overdueInvoices = await prisma.order.findMany({
    where: {
      userId: business.client.userId,
      orderStatus: 'PENDING',
      createdAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Older than 30 days
      }
    }
  });

  if (overdueInvoices.length > 0) {
    paymentsScore -= 20;
    paymentFactors.push({
      name: 'Overdue Invoices',
      impact: 20,
      status: 'critical',
      description: `${overdueInvoices.length} invoice(s) overdue by more than 30 days`
    });
    recommendations.push(`Pay ${overdueInvoices.length} overdue invoice(s) to maintain good standing`);
  }

  // Check for payment method on file
  // Note: We'll need Stripe integration to check this
  // For now, we'll skip this check
  // if (!hasPaymentMethod) {
  //   paymentsScore -= 10;
  // }

  // ============================================================================
  // CALCULATE TOTAL SCORE
  // ============================================================================

  const totalScore = Math.max(0, Math.min(100, complianceScore + documentsScore + paymentsScore));

  return {
    totalScore,
    compliance: {
      score: complianceScore,
      maxScore: 40,
      factors: complianceFactors
    },
    documents: {
      score: documentsScore,
      maxScore: 30,
      factors: documentFactors
    },
    payments: {
      score: paymentsScore,
      maxScore: 30,
      factors: paymentFactors
    },
    recommendations
  };
}

/**
 * Get the Nth occurrence of a weekday in a month
 * @param year - Year
 * @param month - Month (0-11)
 * @param dayOfWeek - Day of week (0=Sunday, 5=Friday)
 * @param occurrence - Which occurrence (3 = third, 4 = fourth)
 */
function getNthWeekdayOfMonth(year: number, month: number, dayOfWeek: number, occurrence: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay();

  // Calculate the first occurrence of the target day
  let firstOccurrence = 1 + ((dayOfWeek - firstDayOfWeek + 7) % 7);

  // Calculate the Nth occurrence
  const targetDate = firstOccurrence + (occurrence - 1) * 7;

  return new Date(year, month, targetDate);
}

/**
 * Check annual report status for a business with Florida-specific compliance rules
 */
function checkAnnualReportStatus(business: any): {
  isOverdue: boolean;
  isDueSoon: boolean;
  isLate: boolean;
  isPendingRevocation: boolean;
  isRevoked: boolean;
  canBeReinstated: boolean;
  yearsRevoked: number | null;
  daysUntilDue: number | null;
  daysUntilRevocation: number | null;
  dueDate: Date | null;
  revocationDate: Date | null;
  lateFee: number;
  reinstatementFee: number;
  complianceStatus: 'ACTIVE' | 'LATE' | 'PENDING_REVOCATION' | 'REVOKED' | 'REINSTATED';
} {
  // Florida annual reports are due between January 1 and May 1 each year
  // Late fee of $400 applies after May 1
  // Entity is revoked on 4th Friday of September if not filed by 3rd Friday of September

  if (!business.filingDate) {
    // If no filing date, we can't determine annual report status
    return {
      isOverdue: false,
      isDueSoon: false,
      isLate: false,
      isPendingRevocation: false,
      isRevoked: false,
      canBeReinstated: false,
      yearsRevoked: null,
      daysUntilDue: null,
      daysUntilRevocation: null,
      dueDate: null,
      revocationDate: null,
      lateFee: 0,
      reinstatementFee: 0,
      complianceStatus: 'ACTIVE'
    };
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const filingYear = new Date(business.filingDate).getFullYear();

  // Calculate key dates for current year
  const dueDate = new Date(currentYear, 4, 1); // May 1st
  const thirdFridayOfSeptember = getNthWeekdayOfMonth(currentYear, 8, 5, 3); // 3rd Friday of September
  const fourthFridayOfSeptember = getNthWeekdayOfMonth(currentYear, 8, 5, 4); // 4th Friday of September (revocation date)

  // Check if we have a recent annual report filing
  const hasRecentAnnualReport = business.filings?.some((filing: any) => {
    return (
      filing.filingType === 'ANNUAL_REPORT' &&
      new Date(filing.createdAt).getFullYear() === currentYear
    );
  });

  // Check if business was recently reinstated
  const wasReinstated = business.filings?.some((filing: any) => {
    return (
      filing.filingType === 'REINSTATEMENT' &&
      new Date(filing.createdAt).getFullYear() === currentYear
    );
  });

  if (hasRecentAnnualReport) {
    // Annual report filed for this year
    return {
      isOverdue: false,
      isDueSoon: false,
      isLate: false,
      isPendingRevocation: false,
      isRevoked: false,
      canBeReinstated: false,
      yearsRevoked: null,
      daysUntilDue: null,
      daysUntilRevocation: null,
      dueDate: null,
      revocationDate: null,
      lateFee: 0,
      reinstatementFee: 0,
      complianceStatus: wasReinstated ? 'REINSTATED' : 'ACTIVE'
    };
  }

  // Calculate days until key dates
  const daysUntilDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilRevocation = Math.ceil((thirdFridayOfSeptember.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

  // Determine compliance status
  let complianceStatus: 'ACTIVE' | 'LATE' | 'PENDING_REVOCATION' | 'REVOKED' | 'REINSTATED' = 'ACTIVE';
  let lateFee = 0;
  let reinstatementFee = 0;
  let isRevoked = false;
  let canBeReinstated = false;
  let yearsRevoked: number | null = null;

  // Check if entity is revoked (after 4th Friday of September)
  if (currentDate >= fourthFridayOfSeptember) {
    isRevoked = true;
    complianceStatus = 'REVOKED';

    // Calculate years revoked
    yearsRevoked = currentYear - filingYear;

    // Check if can be reinstated (within 10 years)
    canBeReinstated = yearsRevoked <= 10;

    // Calculate reinstatement fee based on entity type
    if (business.entityType === 'LLC') {
      reinstatementFee = 100 + (138.75 * yearsRevoked); // $100 base + $138.75 per year
    } else if (business.entityType === 'CORPORATION') {
      reinstatementFee = 600 + (150 * yearsRevoked); // $600 base + $150 per year
    } else if (business.entityType === 'NONPROFIT_CORPORATION') {
      reinstatementFee = 175 + (61.25 * yearsRevoked); // $175 base + $61.25 per year
    }
  }
  // Check if pending revocation (between 3rd and 4th Friday of September)
  else if (currentDate >= thirdFridayOfSeptember && currentDate < fourthFridayOfSeptember) {
    complianceStatus = 'PENDING_REVOCATION';
    lateFee = 400; // Late fee applies
  }
  // Check if late (after May 1 but before revocation deadline)
  else if (currentDate > dueDate) {
    complianceStatus = 'LATE';
    lateFee = 400; // $400 late fee for profit entities
  }

  return {
    isOverdue: daysUntilDue < 0,
    isDueSoon: daysUntilDue >= 0 && daysUntilDue <= 60, // Due within 60 days
    isLate: complianceStatus === 'LATE',
    isPendingRevocation: complianceStatus === 'PENDING_REVOCATION',
    isRevoked,
    canBeReinstated,
    yearsRevoked,
    daysUntilDue: daysUntilDue >= 0 ? daysUntilDue : null,
    daysUntilRevocation: daysUntilRevocation >= 0 ? daysUntilRevocation : null,
    dueDate: daysUntilDue >= 0 ? dueDate : null,
    revocationDate: isRevoked ? fourthFridayOfSeptember : null,
    lateFee,
    reinstatementFee,
    complianceStatus
  };
}

/**
 * Update health score for a business (saves to database)
 */
export async function updateHealthScore(businessId: string): Promise<number> {
  const breakdown = await calculateHealthScore(businessId);

  await prisma.businessEntity.update({
    where: { id: businessId },
    data: {
      healthScore: breakdown.totalScore,
      lastHealthCheck: new Date()
    }
  });

  return breakdown.totalScore;
}

/**
 * Update health scores for all businesses (background job)
 */
export async function updateAllHealthScores(): Promise<void> {
  const businesses = await prisma.businessEntity.findMany({
    select: { id: true }
  });

  for (const business of businesses) {
    try {
      await updateHealthScore(business.id);
    } catch (error) {
      console.error(`Failed to update health score for business ${business.id}:`, error);
    }
  }
}

