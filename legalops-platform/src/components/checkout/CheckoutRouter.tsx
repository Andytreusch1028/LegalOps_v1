/**
 * LegalOps v1 - Conditional Checkout Router
 * 
 * Routes customers to appropriate checkout flow based on service requirements:
 * - Services requiring account: Force account creation
 * - Services allowing guest checkout: Offer choice
 * 
 * CRITICAL: All flows require Terms of Service acceptance with UPL disclaimers
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { requiresAccount, allowsGuestCheckout, getAccountRequiredReason, getDashboardFeatures, getAccountBenefits } from '@/config/service-data-requirements';
import UPLDisclaimer from '@/components/UPLDisclaimer';

interface CheckoutRouterProps {
  serviceType: string;
  serviceName: string;
  servicePrice: number;
  onProceed?: (accountRequired: boolean) => void; // Optional - component handles routing by default
}

export default function CheckoutRouter({ serviceType, serviceName, servicePrice, onProceed }: CheckoutRouterProps) {
  const router = useRouter();
  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'account' | 'guest' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accountRequired = requiresAccount(serviceType);
  const guestAllowed = allowsGuestCheckout(serviceType);
  const accountReason = getAccountRequiredReason(serviceType);
  const dashboardFeatures = getDashboardFeatures(serviceType);
  const accountBenefits = getAccountBenefits(serviceType);

  const handleProceed = () => {
    // Validate TOS acceptance
    if (!tosAccepted || !privacyAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    // For guest-allowed services, validate option selection
    if (guestAllowed && !selectedOption) {
      setError('Please select whether to create an account or continue as guest.');
      return;
    }

    // Clear error
    setError(null);

    // Route to appropriate checkout page
    const params = new URLSearchParams({
      service: serviceType,
      name: serviceName,
      price: servicePrice.toString(),
    });

    if (accountRequired || selectedOption === 'account') {
      // Route to account creation page
      router.push(`/checkout/create-account?${params.toString()}`);
    } else {
      // Route to guest checkout page
      router.push(`/checkout/guest?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {serviceName}
          </h1>
          <p className="text-2xl font-semibold text-sky-600">
            ${servicePrice.toFixed(2)}
          </p>
        </div>

        {/* UPL Disclaimer - CRITICAL */}
        <UPLDisclaimer variant="service" className="mb-8" />

        {/* Account Requirement Notice (if required) */}
        {accountRequired && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🔐</div>
              <div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">
                  Account Required
                </h2>
                <p className="text-blue-800 mb-3">
                  {accountReason}
                </p>
                {dashboardFeatures && dashboardFeatures.length > 0 && (
                  <>
                    <p className="font-semibold text-blue-900 mb-2">
                      Your dashboard will include:
                    </p>
                    <ul className="list-disc ml-5 space-y-1 text-sm text-blue-800">
                      {dashboardFeatures.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Guest Checkout Option (if allowed) */}
        {guestAllowed && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              How would you like to proceed?
            </h2>

            <div className="space-y-4">
              {/* Create Account Option */}
              <button
                onClick={() => setSelectedOption('account')}
                className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                  selectedOption === 'account'
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 hover:border-sky-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === 'account'
                        ? 'border-sky-500 bg-sky-500'
                        : 'border-slate-300'
                    }`}>
                      {selectedOption === 'account' && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Create an Account (Recommended)
                    </h3>
                    {accountBenefits && accountBenefits.length > 0 && (
                      <ul className="list-disc ml-5 space-y-1 text-sm text-slate-700">
                        {accountBenefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </button>

              {/* Guest Checkout Option */}
              <button
                onClick={() => setSelectedOption('guest')}
                className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                  selectedOption === 'guest'
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 hover:border-sky-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === 'guest'
                        ? 'border-sky-500 bg-sky-500'
                        : 'border-slate-300'
                    }`}>
                      {selectedOption === 'guest' && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Continue as Guest
                    </h3>
                    <p className="text-sm text-slate-700">
                      Complete your purchase without creating an account. Documents will be delivered via email.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Terms of Service Acceptance - CRITICAL */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Legal Agreements
          </h2>

          <div className="space-y-4">
            {/* Terms of Service */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={tosAccepted}
                onChange={(e) => setTosAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700 leading-relaxed">
                I have read and agree to the{' '}
                <Link 
                  href="/legal/terms-of-service" 
                  target="_blank"
                  className="text-sky-600 underline hover:text-sky-700 font-semibold"
                >
                  Terms of Service
                </Link>
                , including the acknowledgment that LegalOps is not a law firm, does not provide 
                legal advice, and that use of our services does not create an attorney-client relationship.
              </span>
            </label>

            {/* Privacy Policy */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700 leading-relaxed">
                I have read and agree to the{' '}
                <Link 
                  href="/legal/privacy-policy" 
                  target="_blank"
                  className="text-sky-600 underline hover:text-sky-700 font-semibold"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-300 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Proceed Button */}
          <button
            onClick={handleProceed}
            disabled={!tosAccepted || !privacyAccepted || (guestAllowed && !selectedOption)}
            className="w-full mt-6 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            style={{ padding: '12px 24px' }}
          >
            {accountRequired || selectedOption === 'account' 
              ? 'Create Account & Continue' 
              : 'Continue to Checkout'}
          </button>
        </div>

        {/* Bottom Disclaimer */}
        <div className="text-center text-sm text-slate-600">
          <p>
            🔒 Your information is secure and encrypted. We never share your data with third parties 
            without your consent.
          </p>
        </div>
      </div>
    </div>
  );
}

