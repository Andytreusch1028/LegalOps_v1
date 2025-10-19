'use client';

import { useState } from 'react';

interface ServiceRefusalDisclaimerProps {
  onAccept: () => void;
  required?: boolean;
}

export default function ServiceRefusalDisclaimer({ 
  onAccept, 
  required = true 
}: ServiceRefusalDisclaimerProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    onAccept();
  };

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">⚖️</div>
        <div>
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            Service Agreement & Right to Refuse Service
          </h3>
          <div className="text-sm text-blue-800 space-y-3">
            <p>
              <strong>Please read carefully before proceeding:</strong>
            </p>
            
            <p>
              LegalOps reserves the right to refuse service to any customer at our sole 
              discretion. We may decline to process your order for any reason, including 
              but not limited to:
            </p>
            
            <ul className="list-disc ml-6 space-y-1">
              <li>Verification of identity or payment information</li>
              <li>Compliance with fraud prevention policies</li>
              <li>Inability to verify business information</li>
              <li>Suspicious or unusual order patterns</li>
              <li>Previous payment disputes or chargebacks</li>
              <li>Any other reason deemed necessary for business protection</li>
            </ul>

            <p>
              <strong>Important:</strong> If your order is declined, you will be notified 
              immediately and any payment authorization will be voided. No charges will be 
              processed for declined orders.
            </p>

            <p>
              In some cases, we may request additional verification (such as government-issued 
              ID or business documentation) before processing your order. Failure to provide 
              requested verification may result in order cancellation.
            </p>

            <p className="font-semibold">
              By proceeding with your order, you acknowledge and agree to these terms.
            </p>
          </div>
        </div>
      </div>

      {required && !accepted && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => {
                if (e.target.checked) {
                  handleAccept();
                }
              }}
              className="mt-1 w-5 h-5 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-blue-900 font-medium">
              I have read and agree to the Service Agreement and acknowledge that 
              LegalOps reserves the right to refuse service at its discretion.
            </span>
          </label>
        </div>
      )}

      {accepted && (
        <div className="mt-4 pt-4 border-t border-blue-200 flex items-center gap-2 text-green-700">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Agreement accepted</span>
        </div>
      )}
    </div>
  );
}

