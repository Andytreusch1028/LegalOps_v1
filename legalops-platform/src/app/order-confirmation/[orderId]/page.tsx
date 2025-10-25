'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SuccessCard } from '@/components/legalops/cards/SuccessCard';
import { formatCurrency } from '@/components/legalops/utils';

interface OrderItem {
  id: string;
  serviceType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  paidAt: string;
  isRushOrder: boolean;
  orderItems?: OrderItem[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [session, orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full animate-spin mx-auto"
            style={{
              border: '4px solid #e2e8f0',
              borderTopColor: '#0ea5e9',
              marginBottom: '24px',
            }}
          />
          <p className="text-slate-600 font-medium" style={{ fontSize: '18px' }}>
            Loading confirmation...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold" style={{ fontSize: '18px' }}>Order not found</p>
        </div>
      </div>
    );
  }

  // Calculate rush processing timeline
  const getRushTimingInfo = () => {
    if (!order.isRushOrder) {
      return null;
    }

    // Rush order - check if before noon EST
    const orderDate = new Date(order.createdAt);

    // Convert to EST (UTC-5 or UTC-4 depending on DST)
    const estOffset = -5; // Standard time offset
    const orderHourEST = orderDate.getUTCHours() + estOffset;

    // Check if it's a weekday (Monday = 1, Friday = 5)
    const dayOfWeek = orderDate.getUTCDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    if (isWeekday && orderHourEST < 12) {
      // Before noon on weekday - same day filing
      return {
        reviewEta: 'Within 4 hours',
        reviewDescription: "🚀 RUSH PROCESSING: We'll review your filing information for accuracy and completeness on a priority basis",
        submitDescription: '🚀 RUSH PROCESSING: Your documents will be submitted to the Florida Department of State TODAY (same-day filing)',
        submitEta: 'Same day (before 5pm EST)',
      };
    } else if (isWeekday) {
      // After noon on weekday - next business day
      return {
        reviewEta: 'Within 4 hours',
        reviewDescription: "🚀 RUSH PROCESSING: We'll review your filing information for accuracy and completeness on a priority basis",
        submitDescription: '🚀 RUSH PROCESSING: Your documents will be submitted to the Florida Department of State by noon tomorrow',
        submitEta: 'Next business day (before noon EST)',
      };
    } else {
      // Weekend order - next business day
      return {
        reviewEta: 'Next business day morning',
        reviewDescription: "🚀 RUSH PROCESSING: We'll review your filing information for accuracy and completeness first thing on the next business day",
        submitDescription: '🚀 RUSH PROCESSING: Your documents will be submitted to the Florida Department of State on the next business day',
        submitEta: 'Next business day (before noon EST)',
      };
    }
  };

  const rushInfo = getRushTimingInfo();

  const steps = [
    {
      title: 'Review Filing Information',
      description: rushInfo?.reviewDescription || "We'll review your filing information for accuracy and completeness",
      eta: rushInfo?.reviewEta || 'Within 24 hours',
      isRush: !!rushInfo,
    },
    {
      title: 'Submit to State',
      description: rushInfo?.submitDescription || 'Our team will submit your documents to the Florida Department of State',
      eta: rushInfo?.submitEta || '1-2 business days',
      isRush: !!rushInfo,
    },
    {
      title: 'Email Updates',
      description: "You'll receive email updates as your filing progresses",
      eta: 'Throughout process',
      isRush: false,
    },
    {
      title: 'Filing Confirmation',
      description: "Once approved, you'll receive your filing confirmation",
      eta: '5-7 business days',
      isRush: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 flex items-center justify-center" style={{ padding: '48px 24px' }}>
      <div className="w-full" style={{ maxWidth: '900px' }}>
        <SuccessCard
          title="Order Confirmed!"
          subtitle="Thank you for your order"
          orderNumber={order.orderNumber}
          message={`A confirmation email has been sent to ${session?.user?.email}`}
          steps={steps}
          primaryAction={{
            label: 'Go to Dashboard',
            onClick: () => router.push('/dashboard/customer'),
          }}
          secondaryAction={{
            label: 'Order Another Service',
            onClick: () => router.push('/services'),
          }}
        />

        {/* Order Summary */}
        <div
          className="bg-white rounded-xl"
          style={{
            marginTop: '32px',
            padding: '32px',
            border: '3px solid #0ea5e9',
            boxShadow: '0 6px 20px rgba(14, 165, 233, 0.2)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
          }}
        >
          <h3 className="text-slate-900 font-bold" style={{ fontSize: '24px', marginBottom: '24px' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Line Items */}
            {order.orderItems && order.orderItems.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between" style={{ padding: '12px 0' }}>
                    <span className="text-slate-600" style={{ fontSize: '16px' }}>{item.description}</span>
                    <span className="text-slate-900 font-semibold" style={{ fontSize: '16px' }}>{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between" style={{ padding: '12px 0', borderTop: '2px solid #e2e8f0' }}>
              <span className="text-slate-600" style={{ fontSize: '16px' }}>Subtotal</span>
              <span className="text-slate-900 font-semibold" style={{ fontSize: '16px' }}>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between" style={{ padding: '12px 0', borderBottom: '2px solid #e2e8f0' }}>
              <span className="text-slate-600" style={{ fontSize: '16px' }}>Tax</span>
              <span className="text-slate-900 font-semibold" style={{ fontSize: '16px' }}>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between" style={{ padding: '16px 0' }}>
              <span className="text-slate-900 font-bold" style={{ fontSize: '20px' }}>Total Paid</span>
              <span className="text-sky-600 font-bold" style={{ fontSize: '24px' }}>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Support */}
        <div
          className="bg-white rounded-xl text-center"
          style={{
            marginTop: '32px',
            padding: '32px',
            border: '3px solid #10b981',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.2)',
            background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
          }}
        >
          <p className="text-slate-700 font-semibold" style={{ fontSize: '18px', marginBottom: '12px' }}>Have questions?</p>
          <p className="text-slate-600" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            Contact our support team at <strong className="text-slate-900">support@legalops.com</strong> or call{' '}
            <strong className="text-slate-900">1-800-LEGAL-OPS</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

