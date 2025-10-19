/**
 * AI Risk Scoring Service
 * 
 * Analyzes orders for fraud risk using AI pattern recognition
 * Combines rule-based checks with GPT-4 analysis
 */

import OpenAI from 'openai';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CustomerData {
  id?: string;
  name?: string;
  email: string;
  phone?: string;
  ipAddress?: string;
  userAgent?: string;
  accountAge?: number; // days since account created
  previousOrders?: number;
  previousChargebacks?: number;
}

export interface OrderData {
  amount: number;
  services: string[];
  isRushOrder: boolean;
  paymentMethod: 'credit_card' | 'debit_card' | 'prepaid_card' | 'bank_transfer' | 'paypal' | 'stripe';
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  points: number; // contribution to risk score
}

export interface RiskAssessment {
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: RiskFactor[];
  recommendation: 'APPROVE' | 'REVIEW' | 'VERIFY' | 'DECLINE';
  reasoning: string;
  requiresReview: boolean;
}

// ============================================================================
// AI RISK SCORING SERVICE
// ============================================================================

export class AIRiskScoringService {
  private openai: OpenAI;

  constructor() {
    // Only initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  /**
   * Assess risk for a new order
   */
  async assessRisk(
    customer: CustomerData,
    order: OrderData
  ): Promise<RiskAssessment> {
    
    // Step 1: Perform basic rule-based checks
    const basicRiskFactors = this.performBasicChecks(customer, order);
    const basicRiskScore = basicRiskFactors.reduce((sum, f) => sum + f.points, 0);

    // Step 2: If OpenAI is not configured, return basic assessment
    if (!this.openai || !process.env.OPENAI_API_KEY) {
      return this.createBasicAssessment(basicRiskScore, basicRiskFactors);
    }

    // Step 3: Use AI for advanced pattern recognition
    try {
      const aiAssessment = await this.performAIAnalysis(customer, order, basicRiskFactors);
      return aiAssessment;
    } catch (error) {
      console.error('AI risk assessment failed, falling back to basic assessment:', error);
      return this.createBasicAssessment(basicRiskScore, basicRiskFactors);
    }
  }

  /**
   * Perform basic rule-based fraud checks
   */
  private performBasicChecks(
    customer: CustomerData,
    order: OrderData
  ): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Check 1: Temporary email domains
    const tempEmailDomains = [
      'tempmail.com', 'guerrillamail.com', '10minutemail.com',
      'throwaway.email', 'mailinator.com', 'trashmail.com',
      'yopmail.com', 'maildrop.cc'
    ];
    const emailDomain = customer.email.split('@')[1]?.toLowerCase();
    if (emailDomain && tempEmailDomains.includes(emailDomain)) {
      factors.push({
        factor: 'temporary_email',
        severity: 'high',
        description: `Customer is using a temporary/disposable email address (${emailDomain})`,
        points: 25
      });
    }

    // Check 2: Prepaid card (higher fraud risk)
    if (order.paymentMethod === 'prepaid_card') {
      factors.push({
        factor: 'prepaid_card',
        severity: 'medium',
        description: 'Prepaid cards are commonly used in fraud',
        points: 15
      });
    }

    // Check 3: New customer + large order
    if ((!customer.accountAge || customer.accountAge < 1) && order.amount > 500) {
      factors.push({
        factor: 'new_customer_large_order',
        severity: 'high',
        description: `New customer (account age: ${customer.accountAge || 0} days) with large order ($${order.amount})`,
        points: 20
      });
    }

    // Check 4: Rush order (fraudsters want service before detection)
    if (order.isRushOrder) {
      factors.push({
        factor: 'rush_order',
        severity: 'low',
        description: 'Rush orders can indicate fraud (wants service before fraud is detected)',
        points: 10
      });
    }

    // Check 5: Previous chargebacks (CRITICAL)
    if (customer.previousChargebacks && customer.previousChargebacks > 0) {
      factors.push({
        factor: 'previous_chargebacks',
        severity: 'critical',
        description: `Customer has ${customer.previousChargebacks} previous chargeback(s)`,
        points: 40
      });
    }

    // Check 6: No phone number
    if (!customer.phone) {
      factors.push({
        factor: 'no_phone',
        severity: 'low',
        description: 'No phone number provided (harder to verify identity)',
        points: 5
      });
    }

    // Check 7: Very large order
    if (order.amount > 1000) {
      factors.push({
        factor: 'large_order',
        severity: 'medium',
        description: `Large order amount ($${order.amount})`,
        points: 10
      });
    }

    // Check 8: Multiple services (unusual pattern)
    if (order.services.length > 5) {
      factors.push({
        factor: 'multiple_services',
        severity: 'medium',
        description: `Ordering ${order.services.length} services at once (unusual pattern)`,
        points: 15
      });
    }

    return factors;
  }

  /**
   * Use AI to analyze fraud patterns
   */
  private async performAIAnalysis(
    customer: CustomerData,
    order: OrderData,
    basicRiskFactors: RiskFactor[]
  ): Promise<RiskAssessment> {
    
    const prompt = `
You are a fraud detection expert for a legal services company.

CUSTOMER DATA:
${JSON.stringify(customer, null, 2)}

ORDER DATA:
${JSON.stringify(order, null, 2)}

BASIC RISK FACTORS DETECTED:
${JSON.stringify(basicRiskFactors, null, 2)}

FRAUD PATTERNS TO CHECK:

1. NEW CUSTOMER FRAUD:
   - New account + large order + rush request = high risk
   - Prepaid card + temporary email = high risk
   - VPN/proxy + foreign IP = medium risk

2. PAYMENT FRAUD:
   - Prepaid cards are higher risk than credit cards
   - Mismatched billing/shipping addresses = medium risk
   - Multiple failed payment attempts = high risk

3. BEHAVIORAL FRAUD:
   - Unusual order patterns (e.g., 10 LLCs at once)
   - Requesting rush on everything = possible fraud
   - Generic business names = possible fraud

4. CHARGEBACK RISK:
   - Previous chargebacks = critical risk
   - Aggressive communication = medium risk
   - Unrealistic expectations = medium risk

ANALYZE THIS TRANSACTION:

Calculate risk score (0-100):
- 0-25: Low risk (approve automatically)
- 26-50: Medium risk (standard processing)
- 51-75: High risk (manual review required)
- 76-100: Critical risk (verify identity or decline)

Provide:
- riskScore (0-100)
- riskLevel ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')
- additionalRiskFactors (array of any additional risk factors you found beyond the basic checks)
- recommendation ('APPROVE' | 'REVIEW' | 'VERIFY' | 'DECLINE')
- reasoning (explain the risk assessment in 2-3 sentences)

Return ONLY valid JSON with this exact structure:
{
  "riskScore": number,
  "riskLevel": string,
  "additionalRiskFactors": [
    {
      "factor": string,
      "severity": string,
      "description": string,
      "points": number
    }
  ],
  "recommendation": string,
  "reasoning": string
}
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a fraud detection and risk assessment expert. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3 // Lower temperature for more consistent results
    });

    const aiResult = JSON.parse(response.choices[0].message.content || '{}');
    
    // Combine basic and AI-detected risk factors
    const allRiskFactors = [
      ...basicRiskFactors,
      ...(aiResult.additionalRiskFactors || [])
    ];

    return {
      riskScore: aiResult.riskScore || 0,
      riskLevel: aiResult.riskLevel || 'LOW',
      riskFactors: allRiskFactors,
      recommendation: aiResult.recommendation || 'APPROVE',
      reasoning: aiResult.reasoning || 'No significant risk factors detected.',
      requiresReview: aiResult.riskScore >= 51
    };
  }

  /**
   * Create basic assessment without AI (fallback)
   */
  private createBasicAssessment(
    riskScore: number,
    riskFactors: RiskFactor[]
  ): RiskAssessment {
    
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let recommendation: 'APPROVE' | 'REVIEW' | 'VERIFY' | 'DECLINE';

    if (riskScore >= 76) {
      riskLevel = 'CRITICAL';
      recommendation = 'DECLINE';
    } else if (riskScore >= 51) {
      riskLevel = 'HIGH';
      recommendation = 'VERIFY';
    } else if (riskScore >= 26) {
      riskLevel = 'MEDIUM';
      recommendation = 'REVIEW';
    } else {
      riskLevel = 'LOW';
      recommendation = 'APPROVE';
    }

    const reasoning = riskFactors.length > 0
      ? `Detected ${riskFactors.length} risk factor(s): ${riskFactors.map(f => f.factor).join(', ')}`
      : 'No significant risk factors detected.';

    return {
      riskScore,
      riskLevel,
      riskFactors,
      recommendation,
      reasoning,
      requiresReview: riskScore >= 51
    };
  }
}

// Export singleton instance
export const aiRiskScoring = new AIRiskScoringService();

