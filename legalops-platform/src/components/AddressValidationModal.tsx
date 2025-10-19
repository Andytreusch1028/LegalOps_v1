'use client';

import { useState } from 'react';
import { AddressInput, AddressValidationResult, AddressDisclaimerAcceptance } from '@/lib/services/usps-address-validation';

interface AddressValidationModalProps {
  /** The address that was entered by the user */
  enteredAddress: AddressInput;
  /** The validation result from USPS */
  validationResult: AddressValidationResult;
  /** Callback when user accepts the USPS-corrected address */
  onAcceptCorrection: (correctedAddress: AddressInput, disclaimerAcceptance?: AddressDisclaimerAcceptance) => void;
  /** Callback when user wants to edit the address */
  onEdit: () => void;
  /** Callback when user wants to proceed with their original address anyway */
  onProceedAnyway: (originalAddress: AddressInput, disclaimerAcceptance: AddressDisclaimerAcceptance) => void;
  /** Callback to close the modal */
  onClose: () => void;
  /** Optional customer ID for logging */
  customerId?: string;
}

export default function AddressValidationModal({
  enteredAddress,
  validationResult,
  onAcceptCorrection,
  onEdit,
  onProceedAnyway,
  onClose,
  customerId,
}: AddressValidationModalProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [acknowledgeRisk, setAcknowledgeRisk] = useState(false);
  const [confirmProceed, setConfirmProceed] = useState(false);

  // Store disclaimer text for logging
  const [disclaimer1Text, setDisclaimer1Text] = useState('');
  const [disclaimer2Text, setDisclaimer2Text] = useState('');

  // Determine the type of validation result
  const isFullyValidated = validationResult.validated && validationResult.standardized;
  const hasCorrections = validationResult.warnings && validationResult.warnings.length > 0;
  const needsSecondaryAddress = validationResult.warnings?.some(w =>
    w.includes('apartment') || w.includes('suite') || w.includes('box number')
  );
  const isUnverified = !validationResult.validated;
  const hasMinorCorrections = validationResult.validated && hasCorrections && !needsSecondaryAddress;

  // Determine if user needs to acknowledge risk before proceeding
  const requiresAcknowledgment = isUnverified || needsSecondaryAddress || hasMinorCorrections;

  /**
   * Create disclaimer acceptance record for legal audit trail
   */
  const createDisclaimerAcceptance = (addressUsed: AddressInput): AddressDisclaimerAcceptance => {
    const issueType: 'UNVERIFIED' | 'MISSING_SECONDARY' | 'CORRECTED_BY_USPS' =
      isUnverified ? 'UNVERIFIED' :
      needsSecondaryAddress ? 'MISSING_SECONDARY' :
      'CORRECTED_BY_USPS';

    return {
      timestamp: new Date().toISOString(),
      issueType,
      addressUsed,
      uspsValidatedAddress: validationResult.standardized,
      acknowledgedRisk: acknowledgeRisk,
      confirmedProceed: confirmProceed,
      disclaimer1Text,
      disclaimer2Text,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      customerId,
      context: `Address validation modal - User chose to ${addressUsed === correctedAddress ? 'accept USPS correction' : 'use original address'}`
    };
  };

  // Format address for display
  const formatAddress = (addr: AddressInput | any) => {
    const parts = [];
    if (addr.address2) parts.push(addr.address2);
    if (addr.address1) parts.push(addr.address1);
    const cityStateZip = [
      addr.city,
      addr.state,
      addr.zip5 ? (addr.zip4 ? `${addr.zip5}-${addr.zip4}` : addr.zip5) : ''
    ].filter(Boolean).join(', ');
    if (cityStateZip) parts.push(cityStateZip);
    return parts.join('\n');
  };

  const correctedAddress: AddressInput = validationResult.standardized ? {
    firmName: validationResult.standardized.firmName,
    address1: validationResult.standardized.address1,
    address2: validationResult.standardized.address2,
    city: validationResult.standardized.city,
    state: validationResult.standardized.state,
    zip5: validationResult.standardized.zip5,
    zip4: validationResult.standardized.zip4,
  } : enteredAddress;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-8 py-5 rounded-t-lg">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            {isFullyValidated && !hasCorrections ? (
              <>✓ Address Verified</>
            ) : needsSecondaryAddress ? (
              <>⚠️ Additional Information Needed</>
            ) : hasCorrections ? (
              <>📍 Address Corrected</>
            ) : (
              <>⚠️ Address Could Not Be Verified</>
            )}
          </h2>
        </div>

        <div className="p-8">
          {/* Fully validated with no corrections */}
          {isFullyValidated && !hasCorrections && (
            <div className="mb-8">
              <p className="text-gray-700 text-lg mb-6">
                Great! USPS has verified this address and it's ready to use.
              </p>
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <p className="font-semibold text-green-900 mb-3 text-lg">Verified Address:</p>
                <p className="text-gray-800 whitespace-pre-line text-base leading-relaxed">{formatAddress(correctedAddress)}</p>
              </div>
            </div>
          )}

          {/* Needs secondary address (apt/suite) */}
          {needsSecondaryAddress && (
            <div className="mb-8">
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
                <p className="font-semibold text-yellow-900 mb-3 text-lg">⚠️ Missing Information</p>
                <p className="text-gray-700 text-base leading-relaxed">
                  This address appears to be a multi-unit building. Please add an apartment, suite, or unit number to ensure accurate delivery.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-base font-semibold text-gray-700 mb-3">You Entered:</p>
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-5">
                    <p className="text-gray-800 whitespace-pre-line text-base leading-relaxed">{formatAddress(enteredAddress)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-700 mb-3">USPS Standardized:</p>
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-5">
                    <p className="text-gray-800 whitespace-pre-line text-base leading-relaxed">{formatAddress(correctedAddress)}</p>
                    <p className="text-sm text-gray-600 mt-3 italic font-medium">+ Apt/Suite # needed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Has corrections but not missing secondary */}
          {hasCorrections && !needsSecondaryAddress && (
            <div className="mb-8">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
                <p className="font-semibold text-blue-900 mb-3 text-lg">📍 USPS Corrected Your Address</p>
                <p className="text-gray-700 text-base leading-relaxed">
                  USPS has standardized your address to match their official records. This helps ensure accurate delivery.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-base font-semibold text-gray-700 mb-3">You Entered:</p>
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-5">
                    <p className="text-gray-800 whitespace-pre-line text-base leading-relaxed">{formatAddress(enteredAddress)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-700 mb-3">USPS Corrected To:</p>
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-5">
                    <p className="text-gray-800 whitespace-pre-line text-base leading-relaxed font-semibold">{formatAddress(correctedAddress)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Could not validate */}
          {!validationResult.validated && (
            <div className="mb-8">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
                <p className="font-semibold text-red-900 mb-3 text-lg">⚠️ Address Not Found</p>
                <p className="text-gray-700 text-base leading-relaxed">
                  USPS could not verify this address. It may not exist, or there may be a typo. Please review and correct the address, or proceed anyway if you're certain it's correct.
                </p>
              </div>

              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                <p className="font-semibold text-gray-700 mb-3 text-base">Address You Entered:</p>
                <p className="text-gray-800 whitespace-pre-line text-base leading-relaxed">{formatAddress(enteredAddress)}</p>
              </div>
            </div>
          )}

          {/* Show warnings if any */}
          {validationResult.warnings && validationResult.warnings.length > 0 && (
            <div className="mb-8">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-base text-blue-600 hover:text-blue-800 underline font-medium"
              >
                {showDetails ? '▼ Hide Details' : '▶ Show Details'}
              </button>

              {showDetails && (
                <div className="mt-4 bg-gray-50 border-2 border-gray-300 rounded-lg p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3">USPS Notes:</p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {validationResult.warnings.map((warning, idx) => (
                      <li key={idx} className="leading-relaxed">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Risk Acknowledgment Checkboxes (for unverified or problematic addresses) */}
          {requiresAcknowledgment && (
            <div className="mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-900 mb-4 text-lg flex items-center gap-2">
                ⚠️ Acknowledgment Required
              </h3>

              <div className="space-y-4">
                {/* First checkbox - Acknowledge risk */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acknowledgeRisk}
                    onChange={(e) => {
                      setAcknowledgeRisk(e.target.checked);
                      // Capture disclaimer text when checked
                      if (e.target.checked && !disclaimer1Text) {
                        const text = isUnverified
                          ? "I understand that USPS could not verify this address and it may not exist or may be incorrect. I acknowledge that using an unverified address may result in delivery failures, returned mail, delays in legal filings, or other issues that could affect my legal matters."
                          : needsSecondaryAddress
                          ? "I understand that this address appears to be a multi-unit building and may require an apartment, suite, or unit number for accurate delivery. I acknowledge that proceeding without this information may result in delivery failures or delays."
                          : "I understand that USPS has corrected my address to match their official records. I acknowledge that using my original address instead of the USPS-corrected version may result in delivery issues or delays.";
                        setDisclaimer1Text(text);
                      }
                    }}
                    className="mt-1 w-5 h-5 rounded border-2 border-yellow-600 text-yellow-600 focus:ring-2 focus:ring-yellow-500 cursor-pointer"
                  />
                  <span className="text-gray-800 text-base leading-relaxed group-hover:text-gray-900">
                    {isUnverified ? (
                      <>
                        I understand that <strong>USPS could not verify this address</strong> and it may not exist or may be incorrect.
                        I acknowledge that using an unverified address may result in <strong>delivery failures, returned mail, delays in legal filings,
                        or other issues</strong> that could affect my legal matters.
                      </>
                    ) : needsSecondaryAddress ? (
                      <>
                        I understand that this address appears to be a <strong>multi-unit building</strong> and may require an apartment,
                        suite, or unit number for accurate delivery. I acknowledge that proceeding without this information may result in
                        <strong> delivery failures or delays</strong>.
                      </>
                    ) : (
                      <>
                        I understand that <strong>USPS has corrected my address</strong> to match their official records.
                        I acknowledge that using my original address instead of the USPS-corrected version may result in
                        <strong> delivery issues or delays</strong>.
                      </>
                    )}
                  </span>
                </label>

                {/* Second checkbox - Confirm proceeding */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={confirmProceed}
                    onChange={(e) => {
                      setConfirmProceed(e.target.checked);
                      // Capture disclaimer text when checked
                      if (e.target.checked && !disclaimer2Text) {
                        setDisclaimer2Text(
                          "I confirm that I have reviewed the address information above and I accept full responsibility for any consequences resulting from using this address. I understand that LegalOps is not liable for any delivery failures, missed deadlines, returned documents, or other issues that may arise from using an unverified or non-standard address."
                        );
                      }
                    }}
                    className="mt-1 w-5 h-5 rounded border-2 border-yellow-600 text-yellow-600 focus:ring-2 focus:ring-yellow-500 cursor-pointer"
                  />
                  <span className="text-gray-800 text-base leading-relaxed group-hover:text-gray-900">
                    I confirm that I have reviewed the address information above and <strong>I accept full responsibility</strong> for any
                    consequences resulting from using this address. I understand that <strong>LegalOps is not liable</strong> for any delivery
                    failures, missed deadlines, returned documents, or other issues that may arise from using an unverified or non-standard address.
                  </span>
                </label>
              </div>

              {/* Warning if checkboxes not checked */}
              {(!acknowledgeRisk || !confirmProceed) && (
                <div className="mt-4 text-sm text-yellow-800 italic">
                  ⚠️ You must check both boxes above to proceed with this address.
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {/* Accept Correction (if address was validated) */}
            {validationResult.validated && (
              <button
                onClick={() => {
                  // If requires acknowledgment, pass disclaimer acceptance record
                  const disclaimerAcceptance = requiresAcknowledgment
                    ? createDisclaimerAcceptance(correctedAddress)
                    : undefined;
                  onAcceptCorrection(correctedAddress, disclaimerAcceptance);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg shadow-md hover:shadow-lg"
              >
                {needsSecondaryAddress
                  ? '✓ Use This Address & Add Apt/Suite Number'
                  : '✓ Use USPS Corrected Address'}
              </button>
            )}

            {/* Edit Address */}
            <button
              onClick={() => {
                setAcknowledgeRisk(false);
                setConfirmProceed(false);
                onEdit();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg shadow-md hover:shadow-lg"
            >
              ✏️ Edit Address
            </button>

            {/* Proceed Anyway (with warning if not validated) */}
            <button
              onClick={() => {
                // ALWAYS create and pass disclaimer acceptance record when proceeding anyway
                const disclaimerAcceptance = createDisclaimerAcceptance(enteredAddress);
                onProceedAnyway(enteredAddress, disclaimerAcceptance);
              }}
              disabled={requiresAcknowledgment && (!acknowledgeRisk || !confirmProceed)}
              className={`w-full font-semibold py-4 px-6 rounded-lg transition-colors text-lg shadow-md ${
                requiresAcknowledgment && (!acknowledgeRisk || !confirmProceed)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  : validationResult.validated
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:shadow-lg'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white hover:shadow-lg'
              }`}
            >
              {validationResult.validated
                ? 'Use My Original Address Instead'
                : '⚠️ Proceed With Unverified Address Anyway'}
            </button>

            {/* Cancel */}
            <button
              onClick={onClose}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

