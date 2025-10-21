'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SuccessCard } from '@/components/legalops/cards/SuccessCard';
import { formatCurrency } from '@/components/legalops/utils';

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Order not found</p>
      </div>
    );
  }

  const steps = [
    {
      title: 'Review Filing Information',
      description: "We'll review your filing information for accuracy and completeness",
      eta: 'Within 24 hours',
    },
    {
      title: 'Submit to State',
      description: 'Our team will submit your documents to the Florida Department of State',
      eta: '1-2 business days',
    },
    {
      title: 'Email Updates',
      description: "You'll receive email updates as your filing progresses",
      eta: 'Throughout process',
    },
    {
      title: 'Filing Confirmation',
      description: "Once approved, you'll receive your filing confirmation",
      eta: '5-7 business days',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] px-6 py-12 md:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto">
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
        <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_20px_rgba(0,0,0,0.05)] p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Subtotal</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Tax</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between py-3 text-lg">
              <span className="font-bold text-slate-900">Total Paid</span>
              <span className="font-bold text-sky-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_20px_rgba(0,0,0,0.05)] p-6 text-center">
          <p className="text-slate-600 mb-2">Have questions?</p>
          <p className="text-sm text-slate-600">
            Contact our support team at <strong className="text-slate-900">support@legalops.com</strong> or call{' '}
            <strong className="text-slate-900">1-800-LEGAL-OPS</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

