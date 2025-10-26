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

interface OrderItem {
  id: string;
  serviceType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Package {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  features: string[];
  includesRA: boolean;
  raYears: number;
  includesEIN: boolean;
  includesAI: boolean;
  includesOperatingAgreement: boolean;
  includesComplianceCalendar: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  orderItems?: OrderItem[];
  package?: Package | null;
  packageId?: string | null;
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
      router.push(`/auth/signin?callbackUrl=/checkout/${orderId}`);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full animate-spin mx-auto mb-6"
            style={{
              border: '4px solid #e2e8f0',
              borderTopColor: '#0ea5e9',
            }}
          />
          <p className="text-slate-600 font-medium" style={{ fontSize: '18px' }}>
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 flex items-center justify-center">
        <div
          className="rounded-xl bg-white text-center"
          style={{
            border: '2px solid #ef4444',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
            padding: '48px',
            maxWidth: '500px',
          }}
        >
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="font-bold text-red-900 mb-2" style={{ fontSize: '24px' }}>
            Order Not Found
          </h2>
          <p className="text-red-700" style={{ fontSize: '16px' }}>
            {error || 'The order you are looking for could not be found.'}
          </p>
        </div>
      </div>
    );
  }

  const checkoutSteps = [
    { id: 'review', label: 'Review Order', description: 'Verify details' },
    { id: 'payment', label: 'Payment', description: 'Secure checkout' },
    { id: 'confirmation', label: 'Confirmation', description: 'Order complete' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 flex items-center justify-center" style={{ padding: '48px 24px' }}>
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-bold text-slate-900 mb-3" style={{ fontSize: '40px', lineHeight: '1.2' }}>
            Secure Checkout
          </h1>
          <p className="text-slate-600" style={{ fontSize: '18px', lineHeight: '1.6' }}>
            Order #{order.orderNumber}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-16">
          <ProgressSteps steps={checkoutSteps} currentStep={2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '40px' }}>
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Agreement & Fraud Protection */}
            <div
              className="rounded-xl bg-white hover:shadow-lg transition-all duration-300"
              style={{
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #0ea5e9',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                padding: '32px',
                marginBottom: '48px',
              }}
            >
              <h2 className="font-semibold text-slate-900 mb-8" style={{ fontSize: '24px', lineHeight: '1.4' }}>
                Service Agreement & Fraud Protection
              </h2>

              {/* Right to Refuse Service */}
              <div
                className="rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 hover:shadow-lg transition-all duration-300"
                style={{
                  border: '2px solid #0ea5e9',
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.1)',
                  padding: '24px',
                  marginBottom: '32px',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                      border: '2px solid #0ea5e9',
                      boxShadow: '0 2px 8px rgba(14, 165, 233, 0.2)',
                    }}
                  >
                    <ShieldCheck className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sky-900 mb-2" style={{ fontSize: '18px' }}>
                      Right to Refuse Service
                    </h3>
                    <p className="text-sky-900" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                      LegalOps reserves the right to refuse service to any customer at any time for any reason. If your order is declined, you will not be charged. We use advanced fraud detection to protect our business and customers.
                    </p>
                  </div>
                </div>
              </div>

              {/* No Guarantee */}
              <div
                className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-all duration-300"
                style={{
                  border: '2px solid #f59e0b',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)',
                  padding: '24px',
                  marginBottom: '32px',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      border: '2px solid #f59e0b',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
                    }}
                  >
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2" style={{ fontSize: '18px' }}>
                      No Guarantee
                    </h3>
                    <p className="text-amber-900" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                      While we strive for accuracy, we cannot guarantee the acceptance of your filing by the Florida Department of State. If your filing is rejected, we will work with you to resolve the issue at no additional cost.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fraud Detection */}
              <div
                className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-lg transition-all duration-300"
                style={{
                  border: '2px solid #10b981',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
                  padding: '24px',
                  marginBottom: '32px',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                      border: '2px solid #10b981',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    <Lock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-2" style={{ fontSize: '18px' }}>
                      Fraud Detection
                    </h3>
                    <p className="text-emerald-900" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                      We use industry-standard fraud detection tools to verify all orders. This may include IP verification, address validation, and payment method verification. These checks help protect against fraudulent transactions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Acceptance */}
              <div
                className="pt-6 mt-6"
                style={{ borderTop: '2px solid #e2e8f0' }}
              >
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-6 h-6 text-sky-600 rounded-lg flex-shrink-0 cursor-pointer"
                    style={{
                      border: '2px solid #cbd5e1',
                      marginTop: '4px',
                      marginRight: '16px',
                    }}
                  />
                  <span className="text-slate-700 group-hover:text-slate-900 transition-colors" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    I understand and accept the service agreement, fraud protection policies, and terms above
                  </span>
                </label>
                {!acceptedTerms && (
                  <p className="text-red-600 ml-10 mt-2" style={{ fontSize: '14px' }}>
                    ⚠️ You must accept the terms to proceed with payment
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div
              className="rounded-xl bg-white hover:shadow-lg transition-all duration-300"
              style={{
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #10b981',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                padding: '32px',
                marginBottom: '48px',
              }}
            >
              <h2 className="font-semibold text-slate-900 mb-8" style={{ fontSize: '24px', lineHeight: '1.4' }}>
                Payment Method
              </h2>

              {!acceptedTerms ? (
                <div
                  className="text-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100"
                  style={{
                    border: '2px dashed #cbd5e1',
                    padding: '48px 24px',
                  }}
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{
                      background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                      border: '3px solid #94a3b8',
                      boxShadow: '0 4px 12px rgba(148, 163, 184, 0.3)',
                    }}
                  >
                    <Lock className="w-10 h-10 text-slate-600" />
                  </div>
                  <p className="text-slate-600 font-medium" style={{ fontSize: '16px' }}>
                    Please accept the terms above to proceed with payment
                  </p>
                </div>
              ) : clientSecret && stripePromise ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#0ea5e9',
                        colorBackground: '#ffffff',
                        colorText: '#1e293b',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '12px',
                      },
                      rules: {
                        '.Tab': {
                          border: '2px solid #cbd5e1',
                          borderRadius: '12px',
                          boxShadow: '0 3px 10px rgba(100, 116, 139, 0.15)',
                          padding: '14px 18px',
                          transition: 'all 0.3s ease',
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        },
                        '.Tab:hover': {
                          borderColor: '#0ea5e9',
                          boxShadow: '0 5px 15px rgba(14, 165, 233, 0.25)',
                          transform: 'translateY(-2px)',
                          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        },
                        '.Tab--selected': {
                          borderColor: '#0ea5e9',
                          borderWidth: '3px',
                          boxShadow: '0 6px 18px rgba(14, 165, 233, 0.35)',
                          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                        },
                        '.Tab--selected:hover': {
                          boxShadow: '0 8px 22px rgba(14, 165, 233, 0.4)',
                        },
                        '.TabIcon': {
                          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                          border: '2px solid #0ea5e9',
                          boxShadow: '0 3px 8px rgba(14, 165, 233, 0.25)',
                          borderRadius: '10px',
                          padding: '8px',
                          display: 'inline-flex !important',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '40px',
                          height: '40px',
                          marginRight: '12px',
                        },
                        '.TabIcon--selected': {
                          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                          borderColor: '#0369a1',
                          boxShadow: '0 4px 10px rgba(14, 165, 233, 0.35)',
                        },
                        '.TabIcon svg': {
                          display: 'block !important',
                          width: '24px',
                          height: '24px',
                        },
                        '.TabLabel': {
                          fontWeight: '600',
                          color: '#475569',
                        },
                        '.Tab--selected .TabLabel': {
                          color: '#0369a1',
                          fontWeight: '700',
                        },
                        '.Input': {
                          borderRadius: '10px',
                          border: '2px solid #e2e8f0',
                          padding: '14px',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
                          transition: 'all 0.2s ease',
                        },
                        '.Input:hover': {
                          borderColor: '#cbd5e1',
                          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08)',
                        },
                        '.Input:focus': {
                          borderColor: '#0ea5e9',
                          boxShadow: '0 0 0 4px rgba(14, 165, 233, 0.15)',
                        },
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    orderId={orderId}
                    amount={order.total}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              ) : (
                <div className="text-center" style={{ padding: '48px 24px' }}>
                  <div className="inline-flex items-center gap-3 text-slate-600">
                    <div
                      className="w-8 h-8 rounded-full animate-spin"
                      style={{
                        border: '3px solid #e2e8f0',
                        borderTopColor: '#0ea5e9',
                      }}
                    />
                    <span style={{ fontSize: '16px' }}>Initializing secure payment...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="rounded-xl bg-gradient-to-br from-red-50 to-rose-50"
                style={{
                  border: '2px solid #ef4444',
                  padding: '20px',
                  marginBottom: '48px',
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1" style={{ fontSize: '16px' }}>
                      Payment Error
                    </h3>
                    <p className="text-red-800" style={{ fontSize: '15px' }}>
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Package Information (if applicable) */}
              {order.package && (
                <div
                  className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50"
                  style={{
                    border: '2px solid #10b981',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                    padding: '28px',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="rounded-full"
                      style={{
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-900" style={{ fontSize: '20px', lineHeight: '1.2' }}>
                        {order.package.name} Package
                      </h3>
                      <p className="text-emerald-700" style={{ fontSize: '14px' }}>
                        ${order.package.price} value included
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-700 mb-4" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    {order.package.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-emerald-800 font-semibold" style={{ fontSize: '13px', marginBottom: '12px' }}>
                      What's Included:
                    </p>
                    {order.package.features.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold" style={{ fontSize: '16px', marginTop: '-2px' }}>✓</span>
                        <span className="text-slate-700" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary Card */}
              <div
                className="rounded-xl bg-gradient-to-br from-sky-50 to-blue-50"
                style={{
                  border: '2px solid #0ea5e9',
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.15)',
                  padding: '32px',
                }}
              >
                <h3 className="font-semibold text-slate-900 mb-8" style={{ fontSize: '24px', lineHeight: '1.4' }}>
                  Order Summary
                </h3>

                {/* Line Items */}
                <div className="space-y-4 mb-6" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  {order.orderItems?.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="text-slate-700 font-medium">{item.description}</span>
                          {item.description === 'LegalOps Service Fee' && (
                            <p className="text-sm text-slate-600 mt-1">Professional filing service</p>
                          )}
                          {item.description === 'Florida State Filing Fee' && (
                            <p className="text-sm text-slate-600 mt-1">Paid to Florida Division of Corporations</p>
                          )}
                          {item.description === 'Registered Agent Service' && (
                            <p className="text-sm text-slate-600 mt-1">First year included with formation</p>
                          )}
                        </div>
                        <span className="text-slate-900 font-semibold ml-4">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div
                  className="flex justify-between items-center py-3"
                  style={{ borderTop: '1px solid #cbd5e1' }}
                >
                  <span className="text-slate-600" style={{ fontSize: '15px' }}>Subtotal</span>
                  <span className="text-slate-900 font-medium" style={{ fontSize: '15px' }}>
                    ${order.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Tax */}
                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-600" style={{ fontSize: '15px' }}>Tax</span>
                  <span className="text-slate-900 font-medium" style={{ fontSize: '15px' }}>
                    ${order.tax.toFixed(2)}
                  </span>
                </div>

                {/* Total */}
                <div
                  className="flex justify-between items-center pt-4 mt-2"
                  style={{ borderTop: '2px solid #0ea5e9' }}
                >
                  <span className="text-slate-900 font-bold" style={{ fontSize: '20px' }}>Total</span>
                  <span className="text-sky-600 font-bold" style={{ fontSize: '28px' }}>
                    ${order.total.toFixed(2)}
                  </span>
                </div>

                {/* Security Badge */}
                <div
                  style={{
                    borderTop: '2px solid #cbd5e1',
                    marginTop: '12px',
                    paddingTop: '24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div
                      className="rounded-full"
                      style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                        border: '2px solid #64748b',
                        boxShadow: '0 2px 8px rgba(100, 116, 139, 0.2)',
                      }}
                    >
                      <Lock className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-slate-700" style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '4px', paddingLeft: '16px', flex: 1 }}>
                      Your payment information is encrypted and secure. We never store your full card details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Money-Back Guarantee */}
              <div
                className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-lg transition-all duration-300"
                style={{
                  border: '2px solid #10b981',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                  padding: '24px',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                      border: '2px solid #10b981',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900 mb-2" style={{ fontSize: '18px' }}>
                      Money-Back Guarantee
                    </p>
                    <p className="text-emerald-800" style={{ fontSize: '15px', lineHeight: '1.6' }}>
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

