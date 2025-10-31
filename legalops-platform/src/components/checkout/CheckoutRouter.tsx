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
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #e8f0f7 0%, #f5f8fb 100%)', padding: '48px 24px' }}>
      <div className="flex items-center justify-center">
        <div className="max-w-2xl mx-auto w-full">

          {/* Header */}
          <div className="text-center" style={{ marginBottom: '32px' }}>
            <h1 className="font-bold text-slate-900" style={{ fontSize: '32px', marginBottom: '8px' }}>
              {serviceName}
            </h1>
            <p className="text-slate-600" style={{ fontSize: '16px' }}>
              Complete your purchase
            </p>
          </div>

          {/* UPL Disclaimer - CRITICAL */}
          <div style={{ marginBottom: '24px' }}>
            <UPLDisclaimer variant="service" />
          </div>

        {/* Account Requirement Notice (if required) */}
        {accountRequired && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg" style={{ padding: '24px', marginBottom: '24px' }}>
            <div className="flex items-start gap-3">
              <div className="text-3xl">🔐</div>
              <div>
                <h2 className="font-bold text-blue-900" style={{ fontSize: '18px', marginBottom: '8px' }}>
                  Account Required
                </h2>
                <p className="text-blue-800 text-sm" style={{ marginBottom: '12px' }}>
                  {accountReason}
                </p>
                {dashboardFeatures && dashboardFeatures.length > 0 && (
                  <>
                    <p className="font-semibold text-blue-900 text-sm" style={{ marginBottom: '8px' }}>
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
          <div className="bg-white rounded-lg" style={{
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h2 className="font-bold text-slate-900" style={{ fontSize: '18px', marginBottom: '20px' }}>
              How would you like to proceed?
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Create Account Option */}
              <button
                onClick={() => setSelectedOption('account')}
                className={`w-full text-left rounded-lg border transition-all ${
                  selectedOption === 'account'
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                style={{ padding: '20px' }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0" style={{ marginTop: '2px' }}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === 'account'
                        ? 'border-sky-500 bg-sky-500'
                        : 'border-slate-300'
                    }`}>
                      {selectedOption === 'account' && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900" style={{ fontSize: '16px', marginBottom: '6px' }}>
                      Create an Account (Recommended)
                    </h3>
                    {accountBenefits && accountBenefits.length > 0 && (
                      <ul className="list-disc ml-5 space-y-1 text-sm text-slate-600">
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
                className={`w-full text-left rounded-lg border transition-all ${
                  selectedOption === 'guest'
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                style={{ padding: '20px' }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0" style={{ marginTop: '2px' }}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === 'guest'
                        ? 'border-sky-500 bg-sky-500'
                        : 'border-slate-300'
                    }`}>
                      {selectedOption === 'guest' && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900" style={{ fontSize: '16px', marginBottom: '6px' }}>
                      Continue as Guest
                    </h3>
                    <p className="text-sm text-slate-600">
                      Complete your purchase without creating an account. Documents will be delivered via email.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Terms of Service Acceptance - CRITICAL */}
        <div className="bg-white rounded-lg" style={{
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <h2 className="font-bold text-slate-900" style={{ fontSize: '18px', marginBottom: '20px' }}>
            Legal Agreements
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Terms of Service */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tosAccepted}
                onChange={(e) => setTosAccepted(e.target.checked)}
                className="w-5 h-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                style={{ marginTop: '2px' }}
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
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="w-5 h-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                style={{ marginTop: '2px' }}
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
            <div className="bg-red-50 border border-red-300 rounded-lg" style={{ marginTop: '16px', padding: '16px' }}>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Proceed Button */}
          <button
            onClick={handleProceed}
            disabled={!tosAccepted || !privacyAccepted || (guestAllowed && !selectedOption)}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            style={{ marginTop: '24px', padding: '14px 24px', fontSize: '16px' }}
          >
            {accountRequired || selectedOption === 'account'
              ? 'Create Account & Continue'
              : 'Continue to Checkout'}
          </button>
        </div>

        {/* Bottom Disclaimer */}
        <div className="text-center text-sm text-slate-500" style={{ marginTop: '24px' }}>
          <p>
            🔒 Your information is secure and encrypted. We never share your data with third parties
            without your consent.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

