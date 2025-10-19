'use client';

interface OrderDeclinedMessageProps {
  reason?: 'fraud_risk' | 'verification_required' | 'payment_issue' | 'general';
  orderNumber?: string;
  onContactSupport?: () => void;
}

export default function OrderDeclinedMessage({ 
  reason = 'general',
  orderNumber,
  onContactSupport 
}: OrderDeclinedMessageProps) {
  
  const messages = {
    fraud_risk: {
      title: 'Order Verification Required',
      icon: '🔒',
      message: 'We were unable to process your order at this time due to our fraud prevention policies.',
      details: 'For your security and ours, we need to verify some information before proceeding with your order.',
      action: 'Please contact our support team to complete the verification process.'
    },
    verification_required: {
      title: 'Additional Verification Needed',
      icon: '🔍',
      message: 'Your order requires additional verification before we can proceed.',
      details: 'This is a standard security measure to protect both you and our business.',
      action: 'Our support team will contact you shortly with verification instructions, or you may contact us directly.'
    },
    payment_issue: {
      title: 'Payment Authorization Failed',
      icon: '💳',
      message: 'We were unable to authorize your payment method.',
      details: 'This may be due to insufficient funds, card restrictions, or bank security measures.',
      action: 'Please verify your payment information and try again, or contact your bank for assistance.'
    },
    general: {
      title: 'Order Cannot Be Processed',
      icon: '⚠️',
      message: 'We are unable to process your order at this time.',
      details: 'We reserve the right to refuse service at our discretion for business protection purposes.',
      action: 'If you believe this is an error, please contact our support team for assistance.'
    }
  };

  const content = messages[reason];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Main Message Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{content.icon}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {content.title}
            </h1>
            {orderNumber && (
              <p className="text-gray-600">
                Order #{orderNumber}
              </p>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-900 font-semibold mb-3">
              {content.message}
            </p>
            <p className="text-red-800 text-sm mb-3">
              {content.details}
            </p>
            <p className="text-red-800 text-sm">
              {content.action}
            </p>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              ✓ Important Information
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>No charges have been made</strong> to your payment method</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Any payment authorization has been voided</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Your account remains in good standing</span>
              </li>
              {reason === 'verification_required' && (
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>You may resubmit your order after verification is complete</span>
                </li>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onContactSupport}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              📧 Contact Support
            </button>
            <a
              href="/"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-center"
            >
              🏠 Return to Home
            </a>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Need Help?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 mb-1">Email Support</div>
              <a href="mailto:support@legalops.com" className="text-blue-600 hover:underline font-medium">
                support@legalops.com
              </a>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Phone Support</div>
              <a href="tel:1-800-555-0123" className="text-blue-600 hover:underline font-medium">
                1-800-555-0123
              </a>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Business Hours</div>
              <div className="text-gray-900 font-medium">
                Mon-Fri: 9am-6pm EST
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Response Time</div>
              <div className="text-gray-900 font-medium">
                Within 24 hours
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        {reason === 'fraud_risk' && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Common Questions
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-semibold text-gray-900 mb-1">
                  Why was my order flagged?
                </div>
                <div className="text-gray-700">
                  Our automated fraud prevention system reviews all orders to protect both 
                  customers and our business. Various factors may trigger additional review, 
                  including payment method, order details, or account information.
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">
                  What verification might be required?
                </div>
                <div className="text-gray-700">
                  We may request government-issued ID, proof of business ownership, or 
                  verification of payment method. This is standard practice for legal services.
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">
                  How long does verification take?
                </div>
                <div className="text-gray-700">
                  Most verifications are completed within 1-2 business days. Our support 
                  team will work with you to expedite the process.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

