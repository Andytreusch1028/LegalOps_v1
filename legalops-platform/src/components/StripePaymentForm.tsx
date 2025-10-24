'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface StripePaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripePaymentForm({
  orderId,
  amount,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Convert amount to number if it's a string, and ensure it's valid
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const displayAmount = !isNaN(numericAmount) && numericAmount > 0 ? numericAmount : 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe is not loaded');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess();
      } else {
        setErrorMessage('Payment processing failed');
        onError('Payment processing failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full text-white rounded-xl font-bold transition-all duration-300 disabled:cursor-not-allowed"
        style={{
          background: isProcessing || !stripe || !elements
            ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          border: isProcessing || !stripe || !elements
            ? '2px solid #64748b'
            : '2px solid #2563eb',
          boxShadow: isProcessing || !stripe || !elements
            ? '0 4px 12px rgba(100, 116, 139, 0.2)'
            : '0 6px 20px rgba(37, 99, 235, 0.4)',
          padding: '16px 24px',
          fontSize: '18px',
          transform: isProcessing || !stripe || !elements ? 'none' : 'translateY(0)',
        }}
        onMouseEnter={(e) => {
          if (!isProcessing && stripe && elements) {
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isProcessing && stripe && elements) {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isProcessing ? 'Processing...' : `Pay $${displayAmount.toFixed(2)}`}
      </button>
    </form>
  );
}

