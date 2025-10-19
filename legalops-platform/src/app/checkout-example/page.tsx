'use client';

import { useState } from 'react';
import ServiceRefusalDisclaimer from '@/components/ServiceRefusalDisclaimer';
import OrderDeclinedMessage from '@/components/OrderDeclinedMessage';

export default function CheckoutExamplePage() {
  const [step, setStep] = useState<'disclaimer' | 'checkout' | 'processing' | 'declined' | 'verification' | 'success'>('disclaimer');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  // Example order data
  const orderData = {
    subtotal: 299.00,
    tax: 20.93,
    total: 319.93,
    services: ['LLC_FORMATION'],
    paymentMethod: 'credit_card',
    isRushOrder: false,
    billingAddress: {
      street: '123 Main St',
      city: 'Miami',
      state: 'FL',
      zip: '33101'
    }
  };

  const handleDisclaimerAccept = () => {
    setDisclaimerAccepted(true);
    setStep('checkout');
  };

  const handlePlaceOrder = async () => {
    setStep('processing');

    try {
      // Call the risk-checking order creation API
      const response = await fetch('/api/orders/create-with-risk-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-id', // TODO: Get from session
          orderData
        })
      });

      const result = await response.json();
      setOrderResult(result);

      if (!response.ok || result.declined) {
        // Order was DECLINED due to fraud risk
        setStep('declined');
      } else if (result.requiresVerification) {
        // Order requires VERIFICATION
        setStep('verification');
      } else if (result.proceedWithPayment) {
        // Order APPROVED - proceed to payment
        // In production, this would redirect to Stripe checkout
        console.log('✅ Proceeding to payment for order:', result.orderNumber);
        
        // Simulate payment processing
        setTimeout(() => {
          setStep('success');
        }, 2000);
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('An error occurred. Please try again.');
      setStep('checkout');
    }
  };

  // ========================================================================
  // STEP 1: Service Refusal Disclaimer
  // ========================================================================
  if (step === 'disclaimer') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Checkout - Step 1 of 3
          </h1>

          <ServiceRefusalDisclaimer 
            onAccept={handleDisclaimerAccept}
            required={true}
          />

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>LLC Formation</span>
                <span>${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${orderData.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // STEP 2: Checkout Form
  // ========================================================================
  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Checkout - Step 2 of 3
          </h1>

          {/* Disclaimer Accepted Indicator */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 text-sm font-medium">
              Service agreement accepted
            </span>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span>LLC Formation</span>
                <span>${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${orderData.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${orderData.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Form (Simplified) */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Payment Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="4111 1111 1111 1111"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔒</div>
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Fraud Prevention Notice</p>
                <p>
                  Your order will be reviewed by our automated fraud prevention system 
                  before payment is processed. This protects both you and our business. 
                  If additional verification is needed, we'll contact you immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg"
          >
            Review Order & Proceed to Payment
          </button>

          <p className="text-xs text-gray-600 text-center mt-4">
            By clicking above, you agree that your order will be reviewed for fraud prevention 
            and may be declined at our discretion.
          </p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // STEP 3: Processing (Risk Assessment Running)
  // ========================================================================
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4 animate-pulse">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reviewing Your Order
          </h2>
          <p className="text-gray-600 mb-6">
            Our fraud prevention system is analyzing your order. This will only take a moment...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // ORDER DECLINED
  // ========================================================================
  if (step === 'declined') {
    return (
      <OrderDeclinedMessage
        reason="fraud_risk"
        orderNumber={orderResult?.orderNumber}
        onContactSupport={() => {
          alert('Opening support contact form...');
        }}
      />
    );
  }

  // ========================================================================
  // VERIFICATION REQUIRED
  // ========================================================================
  if (step === 'verification') {
    return (
      <OrderDeclinedMessage
        reason="verification_required"
        orderNumber={orderResult?.orderNumber}
        onContactSupport={() => {
          alert('Opening support contact form...');
        }}
      />
    );
  }

  // ========================================================================
  // SUCCESS
  // ========================================================================
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Order Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your order has been approved and payment has been processed.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="text-sm text-green-800">
              <p className="font-semibold mb-2">Order Number: {orderResult?.orderNumber}</p>
              <p>Risk Score: {orderResult?.riskScore}/100 ({orderResult?.riskLevel})</p>
            </div>
          </div>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return null;
}

