/**
 * Property-based tests for AI Risk Scoring Service.
 * 
 * Feature: code-quality-improvements, Property 8: Risk Assessment Bounds
 * Validates: Requirements 4.1
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { AIRiskScoringService, CustomerData, OrderData } from './ai-risk-scoring';
import { createLogger } from '../logging/console-logger';
import { isOk } from '../types/result';

describe('AI Risk Scoring Service', () => {
  let riskService: AIRiskScoringService;

  beforeEach(() => {
    riskService = new AIRiskScoringService(createLogger('test'));
  });

  /**
   * Property 8: Risk Assessment Bounds
   * 
   * For any risk assessment calculation, the risk score should be between 0 and 100 
   * inclusive, and the risk level should correctly correspond to the score ranges:
   * - LOW: 0-25
   * - MEDIUM: 26-50
   * - HIGH: 51-75
   * - CRITICAL: 76-100
   */
  describe('Property 8: Risk Assessment Bounds', () => {
    // Arbitrary for generating valid customer data
    const customerDataArbitrary = fc.record({
      id: fc.option(fc.uuid()),
      name: fc.option(fc.constantFrom('John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams')),
      email: fc.emailAddress(),
      phone: fc.option(fc.constantFrom('+1234567890', '+9876543210', '+1555123456')),
      ipAddress: fc.option(fc.ipV4()),
      userAgent: fc.option(fc.constant('Mozilla/5.0')),
      accountAge: fc.option(fc.integer({ min: 0, max: 3650 })),
      previousOrders: fc.option(fc.integer({ min: 0, max: 100 })),
      previousChargebacks: fc.option(fc.integer({ min: 0, max: 10 }))
    });

    // Arbitrary for generating valid order data
    const orderDataArbitrary = fc.record({
      amount: fc.integer({ min: 10, max: 100000 }), // Amount in cents, will be divided by 100
      services: fc.array(
        fc.constantFrom('LLC Formation', 'Annual Report', 'DBA Filing', 'Registered Agent', 'Amendment'),
        { minLength: 1, maxLength: 5 }
      ),
      isRushOrder: fc.boolean(),
      paymentMethod: fc.constantFrom(
        'credit_card',
        'debit_card',
        'prepaid_card',
        'bank_transfer',
        'paypal',
        'stripe'
      ),
      billingAddress: fc.option(fc.record({
        street: fc.constant('123 Main St'),
        city: fc.constantFrom('Miami', 'Tampa', 'Orlando', 'Jacksonville'),
        state: fc.constantFrom('FL', 'CA', 'NY', 'TX'),
        zip: fc.constantFrom('33101', '33602', '32801', '32202')
      }))
    });

    it('should always return risk scores between 0 and 100 inclusive', async () => {
      await fc.assert(
        fc.asyncProperty(
          customerDataArbitrary,
          orderDataArbitrary,
          async (customer, order) => {
            const result = await riskService.assessRisk(customer, order);
            
            // If validation passes, check the risk score bounds
            if (result.success) {
              const assessment = result.data;
              
              // Risk score must be between 0 and 100 inclusive
              expect(assessment.riskScore).toBeGreaterThanOrEqual(0);
              expect(assessment.riskScore).toBeLessThanOrEqual(100);
            } else {
              // If validation fails, that's also acceptable - just verify it's a validation error
              expect(result.error.code).toMatch(/INVALID_(CUSTOMER|ORDER)_DATA/);
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout

    it('should map risk scores to correct risk levels', async () => {
      await fc.assert(
        fc.asyncProperty(
          customerDataArbitrary,
          orderDataArbitrary,
          async (customer, order) => {
            const result = await riskService.assessRisk(customer, order);
            
            // Only check mapping for successful assessments
            if (result.success) {
              const assessment = result.data;
              const score = assessment.riskScore;
              const level = assessment.riskLevel;
              
              // Verify correct mapping based on score ranges
              if (score >= 0 && score <= 25) {
                expect(level).toBe('LOW');
              } else if (score >= 26 && score <= 50) {
                expect(level).toBe('MEDIUM');
              } else if (score >= 51 && score <= 75) {
                expect(level).toBe('HIGH');
              } else if (score >= 76 && score <= 100) {
                expect(level).toBe('CRITICAL');
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout

    it('should set requiresReview flag correctly based on risk score', async () => {
      await fc.assert(
        fc.asyncProperty(
          customerDataArbitrary,
          orderDataArbitrary,
          async (customer, order) => {
            const result = await riskService.assessRisk(customer, order);
            
            // Only check requiresReview for successful assessments
            if (result.success) {
              const assessment = result.data;
              
              // requiresReview should be true for scores >= 51
              if (assessment.riskScore >= 51) {
                expect(assessment.requiresReview).toBe(true);
              } else {
                expect(assessment.requiresReview).toBe(false);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout

    it('should return consistent risk levels for boundary scores', async () => {
      // Test boundary values explicitly
      const boundaryTests = [
        { score: 0, expectedLevel: 'LOW' },
        { score: 25, expectedLevel: 'LOW' },
        { score: 26, expectedLevel: 'MEDIUM' },
        { score: 50, expectedLevel: 'MEDIUM' },
        { score: 51, expectedLevel: 'HIGH' },
        { score: 75, expectedLevel: 'HIGH' },
        { score: 76, expectedLevel: 'CRITICAL' },
        { score: 100, expectedLevel: 'CRITICAL' }
      ];

      await fc.assert(
        fc.asyncProperty(
          customerDataArbitrary,
          orderDataArbitrary,
          async (customer, order) => {
            const result = await riskService.assessRisk(customer, order);
            
            // Only check boundary mapping for successful assessments
            if (result.success) {
              const assessment = result.data;
              const score = assessment.riskScore;
              
              // Find the expected level for this score
              const boundary = boundaryTests.find(b => b.score === score);
              if (boundary) {
                expect(assessment.riskLevel).toBe(boundary.expectedLevel);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout

    it('should handle high-risk factors without exceeding score bounds', async () => {
      // Create a customer with multiple high-risk factors
      const highRiskCustomer: CustomerData = {
        email: 'test@tempmail.com', // Temporary email domain
        accountAge: 0, // New account
        previousChargebacks: 5, // Multiple chargebacks
        previousOrders: 0
      };

      const highRiskOrder: OrderData = {
        amount: 2000, // Large order
        services: ['service1', 'service2', 'service3', 'service4', 'service5', 'service6'], // Many services
        isRushOrder: true, // Rush order
        paymentMethod: 'prepaid_card' // Prepaid card
      };

      const result = await riskService.assessRisk(highRiskCustomer, highRiskOrder);
      
      expect(isOk(result)).toBe(true);
      
      if (result.success) {
        const assessment = result.data;
        
        // Even with all risk factors, score should not exceed 100
        expect(assessment.riskScore).toBeLessThanOrEqual(100);
        expect(assessment.riskScore).toBeGreaterThanOrEqual(0);
        
        // Should be high or critical risk
        expect(['HIGH', 'CRITICAL']).toContain(assessment.riskLevel);
      }
    });

    it('should handle low-risk scenarios with minimum score of 0', async () => {
      // Create a customer with no risk factors
      const lowRiskCustomer: CustomerData = {
        email: 'trusted@gmail.com',
        phone: '+1234567890',
        accountAge: 365, // 1 year old account
        previousOrders: 10,
        previousChargebacks: 0
      };

      const lowRiskOrder: OrderData = {
        amount: 100,
        services: ['standard-service'],
        isRushOrder: false,
        paymentMethod: 'credit_card',
        billingAddress: {
          street: '123 Main St',
          city: 'Miami',
          state: 'FL',
          zip: '33101'
        }
      };

      const result = await riskService.assessRisk(lowRiskCustomer, lowRiskOrder);
      
      expect(isOk(result)).toBe(true);
      
      if (result.success) {
        const assessment = result.data;
        
        // Score should be at minimum 0
        expect(assessment.riskScore).toBeGreaterThanOrEqual(0);
        
        // Should be low risk
        expect(assessment.riskLevel).toBe('LOW');
      }
    });

    it('should validate input data and return error for invalid customer data', async () => {
      const invalidCustomer = {
        email: 'not-an-email', // Invalid email
        accountAge: -5 // Negative account age
      } as CustomerData;

      const validOrder: OrderData = {
        amount: 100,
        services: ['service1'],
        isRushOrder: false,
        paymentMethod: 'credit_card'
      };

      const result = await riskService.assessRisk(invalidCustomer, validOrder);
      
      // Should return an error result
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_CUSTOMER_DATA');
        expect(result.error.statusCode).toBe(400);
      }
    });

    it('should validate input data and return error for invalid order data', async () => {
      const validCustomer: CustomerData = {
        email: 'test@example.com'
      };

      const invalidOrder = {
        amount: -100, // Negative amount
        services: [], // Empty services array
        isRushOrder: false,
        paymentMethod: 'credit_card'
      } as OrderData;

      const result = await riskService.assessRisk(validCustomer, invalidOrder);
      
      // Should return an error result
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_ORDER_DATA');
        expect(result.error.statusCode).toBe(400);
      }
    });
  });
});
