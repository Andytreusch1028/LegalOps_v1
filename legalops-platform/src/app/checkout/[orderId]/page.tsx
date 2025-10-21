'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import StripePaymentForm from '@/components/StripePaymentForm';
import { ProgressSteps } from '@/components/legalops/checkout/ProgressSteps';
import { OrderSummaryCard } from '@/components/legalops/cards/OrderSummaryCard';
import { cn, cardBase } from '@/components/legalops/theme';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const orderId = (params?.orderId as string) || '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!orderId) {
      setError('Order ID not found');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);

          // Create payment intent
          const paymentResponse = await fetch('/api/stripe/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              amount: data.total,
              description: `Order ${data.orderNumber}`,
            }),
          });

          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json();
            setClientSecret(paymentData.clientSecret);
          } else {
            setError('Failed to initialize payment');
          }
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [session, orderId, router]);

  const handlePaymentSuccess = () => {
    router.push(`/order-confirmation/${orderId}`);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error || 'Order not found'}</p>
      </div>
    );
  }

  const checkoutSteps = [
    { id: 'review', label: 'Review Order', description: 'Verify details' },
    { id: 'payment', label: 'Payment', description: 'Secure checkout' },
    { id: 'confirmation', label: 'Confirmation', description: 'Order complete' },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] px-6 py-12 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Checkout</h1>
          <p className="text-slate-500">Order #{order.orderNumber}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <ProgressSteps steps={checkoutSteps} currentStep={2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Agreement & Fraud Protection */}
            <div className={cn(cardBase, 'p-6')}>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Service Agreement & Fraud Protection</h2>

              {/* Right to Refuse Service */}
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sky-900 mb-2">Right to Refuse Service</h3>
                    <p className="text-sm text-sky-900">
                      LegalOps reserves the right to refuse service to any customer at any time for any reason. If your order is declined, you will not be charged. We use advanced fraud detection to protect our business and customers.
                    </p>
                  </div>
                </div>
              </div>

              {/* No Guarantee */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">No Guarantee</h3>
                    <p className="text-sm text-amber-900">
                      While we strive for accuracy, we cannot guarantee the acceptance of your filing by the Florida Department of State. If your filing is rejected, we will work with you to resolve the issue at no additional cost.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fraud Detection */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-2">Fraud Detection</h3>
                    <p className="text-sm text-emerald-900">
                      We use industry-standard fraud detection tools to verify all orders. This may include IP verification, address validation, and payment method verification. These checks help protect against fraudulent transactions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className="border-t border-slate-200 pt-4">
                <label className="flex items-start gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-5 h-5 text-sky-600 rounded mt-1 flex-shrink-0"
                  />
                  <span className="text-sm text-slate-700">
                    I understand and accept the service agreement, fraud protection policies, and terms above
                  </span>
                </label>
                {!acceptedTerms && (
                  <p className="text-xs text-red-600 ml-8">
                    You must accept the terms to proceed with payment
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className={cn(cardBase, 'p-6')}>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Payment Method</h2>

              {clientSecret && stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentForm
                    orderId={orderId}
                    amount={order.total}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 text-slate-600">
                    <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <span>Initializing payment...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <OrderSummaryCard
                items={[
                  {
                    label: 'LLC Formation Service',
                    value: order.subtotal,
                    description: 'Professional filing service',
                  },
                ]}
                subtotal={order.subtotal}
                tax={order.tax}
                total={order.total}
                showRiskBadge={false}
              />

              {/* Money-Back Guarantee */}
              <div className={cn(cardBase, 'p-4 mt-6')}>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Money-Back Guarantee</p>
                    <p className="text-xs text-slate-600">
                      If we can't complete your filing, we'll refund your service fee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

