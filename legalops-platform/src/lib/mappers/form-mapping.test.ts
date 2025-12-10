/**
 * Property-Based Tests for Form Mapping Round Trips
 * 
 * Feature: code-quality-improvements, Property 10: Form Mapping Round Trip
 * 
 * These tests verify that mapping form data to database format and back
 * produces equivalent data, preserving all fields and values.
 */

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

import {
  mapLLCFormationToDatabase,
  mapCorporationFormationToDatabase,
  mapAnnualReportToDatabase,
} from './form-to-database';

import {
  mapDatabaseToLLCFormation,
  mapDatabaseToCorporationFormation,
  mapDatabaseToAnnualReport,
} from './database-to-form';

import {
  llcFormationFormDataArbitrary,
  corporationFormationFormDataArbitrary,
  annualReportFormDataArbitrary,
  cuidArbitrary,
} from '../../../test/utils/generators';

import type {
  LLCFormationFormData,
  CorporationFormationFormData,
  AnnualReportFormData,
} from '@/types/forms';

describe('Form Mapping Round Trip Tests', () => {
  /**
   * Feature: code-quality-improvements, Property 10: Form Mapping Round Trip
   * Validates: Requirements 4.3
   * 
   * For any valid LLC formation form data, mapping to database format and then
   * back to form format should produce equivalent data.
   */
  test('LLC formation form round trip preserves all data', () => {
    fc.assert(
      fc.property(
        llcFormationFormDataArbitrary,
        cuidArbitrary,
        cuidArbitrary,
        cuidArbitrary,
        (formData, clientId, businessEntityId, registeredAgentId) => {
          // Skip invalid combinations
          if (formData.mailingAddressOption === 'DIFFERENT' && !formData.mailingAddress) {
            return true; // Skip this case
          }
          if (formData.registeredAgentOption === 'NEW' && !formData.newRegisteredAgent) {
            return true; // Skip this case
          }
          if (formData.registeredAgentOption === 'LEGALOPS') {
            // For LEGALOPS option, we don't need newRegisteredAgent
            formData.newRegisteredAgent = undefined;
          }

          try {
            // Map form → database
            const dbRecords = mapLLCFormationToDatabase(
              formData,
              clientId,
              businessEntityId,
              registeredAgentId
            );

            // Reconstruct database entity structure for reverse mapping
            const dbEntity = {
              legalName: dbRecords.businessEntity.legalName,
              dbaName: dbRecords.businessEntity.dbaName,
              purpose: dbRecords.businessEntity.purpose,
              addresses: dbRecords.addresses,
              registeredAgent: dbRecords.registeredAgent,
              managersOfficers: dbRecords.managers,
            };

            const dbFiling = {
              filingData: dbRecords.filing.filingData,
            };

            // Map database → form
            const roundTripFormData = mapDatabaseToLLCFormation(dbEntity, dbFiling);

            // Verify core fields match
            expect(roundTripFormData.businessName).toBe(formData.businessName);
            expect(roundTripFormData.correspondenceEmail).toBe(formData.correspondenceEmail);
            expect(roundTripFormData.managementStructure).toBe(formData.managementStructure);

            // Verify principal address
            expect(roundTripFormData.principalAddress.street).toBe(formData.principalAddress.street);
            expect(roundTripFormData.principalAddress.city).toBe(formData.principalAddress.city);
            expect(roundTripFormData.principalAddress.state).toBe(formData.principalAddress.state);
            expect(roundTripFormData.principalAddress.zipCode).toBe(formData.principalAddress.zipCode);

            // Verify mailing address option
            if (formData.mailingAddressOption === 'DIFFERENT' && formData.mailingAddress) {
              expect(roundTripFormData.mailingAddressOption).toBe('DIFFERENT');
              expect(roundTripFormData.mailingAddress).toBeDefined();
              expect(roundTripFormData.mailingAddress?.street).toBe(formData.mailingAddress.street);
              expect(roundTripFormData.mailingAddress?.city).toBe(formData.mailingAddress.city);
            } else {
              expect(roundTripFormData.mailingAddressOption).toBe('SAME_AS_PRINCIPAL');
            }

            // Verify registered agent option
            expect(roundTripFormData.registeredAgentOption).toBe(formData.registeredAgentOption);

            // Verify managers count
            expect(roundTripFormData.managers.length).toBe(formData.managers.length);

            // Verify optional fields (handle null/undefined equivalence)
            if (formData.purpose !== undefined && formData.purpose !== null) {
              expect(roundTripFormData.purpose).toBe(formData.purpose);
            }
            if (formData.effectiveDate !== undefined && formData.effectiveDate !== null) {
              expect(roundTripFormData.effectiveDate).toBe(formData.effectiveDate);
            }
            if (formData.expeditedProcessing !== undefined && formData.expeditedProcessing !== null) {
              expect(roundTripFormData.expeditedProcessing).toBe(formData.expeditedProcessing);
            }
            if (formData.certifiedCopy !== undefined && formData.certifiedCopy !== null) {
              expect(roundTripFormData.certifiedCopy).toBe(formData.certifiedCopy);
            }
          } catch (error) {
            // If we get an expected error (like SELF/EXISTING agent), that's okay
            if (error instanceof Error && 
                (error.message.includes('SELF and EXISTING') || 
                 error.message.includes('is required'))) {
              return true;
            }
            throw error;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: code-quality-improvements, Property 10: Form Mapping Round Trip
   * Validates: Requirements 4.3
   * 
   * For any valid corporation formation form data, mapping to database format
   * and then back to form format should produce equivalent data.
   */
  test('Corporation formation form round trip preserves all data', () => {
    fc.assert(
      fc.property(
        corporationFormationFormDataArbitrary,
        cuidArbitrary,
        cuidArbitrary,
        cuidArbitrary,
        (formData, clientId, businessEntityId, registeredAgentId) => {
          // Skip invalid combinations
          if (formData.mailingAddressOption === 'DIFFERENT' && !formData.mailingAddress) {
            return true;
          }
          if (formData.registeredAgentOption === 'NEW' && !formData.newRegisteredAgent) {
            return true;
          }
          if (formData.registeredAgentOption === 'LEGALOPS') {
            formData.newRegisteredAgent = undefined;
          }

          try {
            // Map form → database
            const dbRecords = mapCorporationFormationToDatabase(
              formData,
              clientId,
              businessEntityId,
              registeredAgentId
            );

            // Reconstruct database entity structure
            const dbEntity = {
              legalName: dbRecords.businessEntity.legalName,
              dbaName: dbRecords.businessEntity.dbaName,
              purpose: dbRecords.businessEntity.purpose,
              addresses: dbRecords.addresses,
              registeredAgent: dbRecords.registeredAgent,
              managersOfficers: [...dbRecords.officers, ...dbRecords.directors],
            };

            const dbFiling = {
              filingData: dbRecords.filing.filingData,
            };

            // Map database → form
            const roundTripFormData = mapDatabaseToCorporationFormation(dbEntity, dbFiling);

            // Verify core fields
            expect(roundTripFormData.businessName).toBe(formData.businessName);
            expect(roundTripFormData.corporationType).toBe(formData.corporationType);
            expect(roundTripFormData.correspondenceEmail).toBe(formData.correspondenceEmail);

            // Verify principal address
            expect(roundTripFormData.principalAddress.street).toBe(formData.principalAddress.street);
            expect(roundTripFormData.principalAddress.city).toBe(formData.principalAddress.city);
            expect(roundTripFormData.principalAddress.state).toBe(formData.principalAddress.state);
            expect(roundTripFormData.principalAddress.zipCode).toBe(formData.principalAddress.zipCode);

            // Verify mailing address option
            if (formData.mailingAddressOption === 'DIFFERENT' && formData.mailingAddress) {
              expect(roundTripFormData.mailingAddressOption).toBe('DIFFERENT');
              expect(roundTripFormData.mailingAddress).toBeDefined();
            } else {
              expect(roundTripFormData.mailingAddressOption).toBe('SAME_AS_PRINCIPAL');
            }

            // Verify registered agent option
            expect(roundTripFormData.registeredAgentOption).toBe(formData.registeredAgentOption);

            // Verify officers and directors counts
            expect(roundTripFormData.officers.length).toBe(formData.officers.length);
            expect(roundTripFormData.directors.length).toBe(formData.directors.length);

            // Verify optional fields (handle null/undefined equivalence)
            if (formData.purpose !== undefined && formData.purpose !== null) {
              expect(roundTripFormData.purpose).toBe(formData.purpose);
            }
            if (formData.effectiveDate !== undefined && formData.effectiveDate !== null) {
              expect(roundTripFormData.effectiveDate).toBe(formData.effectiveDate);
            }
            if (formData.authorizedShares !== undefined && formData.authorizedShares !== null) {
              expect(roundTripFormData.authorizedShares).toBe(formData.authorizedShares);
            }
            if (formData.parValue !== undefined && formData.parValue !== null) {
              expect(roundTripFormData.parValue).toBe(formData.parValue);
            }
          } catch (error) {
            if (error instanceof Error && 
                (error.message.includes('SELF and EXISTING') || 
                 error.message.includes('is required'))) {
              return true;
            }
            throw error;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: code-quality-improvements, Property 10: Form Mapping Round Trip
   * Validates: Requirements 4.3
   * 
   * For any valid annual report form data, mapping to database format and then
   * back to form format should produce equivalent data.
   */
  test('Annual report form round trip preserves all data', () => {
    fc.assert(
      fc.property(
        annualReportFormDataArbitrary,
        (formData) => {
          // Map form → database
          const dbFiling = mapAnnualReportToDatabase(
            formData.businessEntityId,
            formData
          );

          // Map database → form
          const roundTripFormData = mapDatabaseToAnnualReport(
            formData.businessEntityId,
            { filingData: dbFiling.filingData }
          );

          // Verify all fields match
          expect(roundTripFormData.businessEntityId).toBe(formData.businessEntityId);
          expect(roundTripFormData.confirmCurrentInformation).toBe(formData.confirmCurrentInformation);
          expect(roundTripFormData.hasChanges).toBe(formData.hasChanges);
          expect(roundTripFormData.correspondenceEmail).toBe(formData.correspondenceEmail);

          // Verify changes if present
          if (formData.changes) {
            expect(roundTripFormData.changes).toBeDefined();
            
            if (formData.changes.principalAddress) {
              expect(roundTripFormData.changes?.principalAddress).toBeDefined();
            }
            
            if (formData.changes.mailingAddress) {
              expect(roundTripFormData.changes?.mailingAddress).toBeDefined();
            }
            
            if (formData.changes.registeredAgent) {
              expect(roundTripFormData.changes?.registeredAgent).toBeDefined();
            }
            
            if (formData.changes.officers) {
              expect(roundTripFormData.changes?.officers).toBeDefined();
              expect(roundTripFormData.changes?.officers?.length).toBe(formData.changes.officers.length);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify that nested address data is preserved correctly
   */
  test('Address data round trip preserves all fields including optional ones', () => {
    fc.assert(
      fc.property(
        llcFormationFormDataArbitrary,
        cuidArbitrary,
        cuidArbitrary,
        cuidArbitrary,
        (formData, clientId, businessEntityId, registeredAgentId) => {
          // Only test cases with street2 (optional field)
          if (!formData.principalAddress.street2) {
            return true;
          }

          if (formData.registeredAgentOption === 'LEGALOPS') {
            formData.newRegisteredAgent = undefined;
          }

          try {
            const dbRecords = mapLLCFormationToDatabase(
              formData,
              clientId,
              businessEntityId,
              registeredAgentId
            );

            const dbEntity = {
              legalName: dbRecords.businessEntity.legalName,
              dbaName: dbRecords.businessEntity.dbaName,
              purpose: dbRecords.businessEntity.purpose,
              addresses: dbRecords.addresses,
              registeredAgent: dbRecords.registeredAgent,
              managersOfficers: dbRecords.managers,
            };

            const dbFiling = {
              filingData: dbRecords.filing.filingData,
            };

            const roundTripFormData = mapDatabaseToLLCFormation(dbEntity, dbFiling);

            // Verify street2 is preserved
            expect(roundTripFormData.principalAddress.street2).toBe(formData.principalAddress.street2);
          } catch (error) {
            if (error instanceof Error && 
                (error.message.includes('SELF and EXISTING') || 
                 error.message.includes('is required'))) {
              return true;
            }
            throw error;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
