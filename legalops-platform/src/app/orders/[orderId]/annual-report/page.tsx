'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import AnnualReportForm, { validateAnnualReportForm } from '@/components/forms/AnnualReportForm';
import { Prisma } from '@/generated/prisma';

interface OrderItem {
  id: string;
  serviceType: string;
  description: string;
  additionalData: Prisma.JsonValue;
  additionalDataCollected: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  total: number;
  orderItems: OrderItem[];
}

export default function AnnualReportPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Unwrap params
  useEffect(() => {
    params.then((p) => setOrderId(p.orderId));
  }, [params]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch order data
  useEffect(() => {
    if (!orderId || status !== 'authenticated') return;

    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        const data = await response.json();
        setOrder(data);

        // Find the Annual Report item
        const annualReportItem = data.orderItems.find(
          (item: OrderItem) => item.serviceType === 'ANNUAL_REPORT'
        );

        console.log('[Annual Report Page] Order items:', data.orderItems);
        console.log('[Annual Report Page] Annual report item:', annualReportItem);
        console.log('[Annual Report Page] Additional data:', annualReportItem?.additionalData);

        if (annualReportItem?.additionalData) {
          console.log('[Annual Report Page] Loading saved form data');
          setFormData(annualReportItem.additionalData);
          lastSavedDataRef.current = JSON.stringify(annualReportItem.additionalData);
        } else {
          console.log('[Annual Report Page] No saved data found, using empty form');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, status]);

  // Auto-save with debounce
  useEffect(() => {
    if (!order || Object.keys(formData).length === 0) return;

    const currentData = JSON.stringify(formData);
    if (currentData === lastSavedDataRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const annualReportItem = order.orderItems.find(
          (item) => item.serviceType === 'ANNUAL_REPORT'
        );

        if (!annualReportItem) {
          console.log('[Auto-save] No annual report item found');
          return;
        }

        console.log('[Auto-save] Saving form data to order item:', annualReportItem.id);
        console.log('[Auto-save] Form data:', formData);

        const response = await fetch(`/api/orders/${orderId}/items/${annualReportItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            additionalData: formData,
            additionalDataCollected: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[Auto-save] Failed to save:', errorData);
          throw new Error('Failed to save');
        }

        const savedData = await response.json();
        console.log('[Auto-save] Successfully saved:', savedData);

        lastSavedDataRef.current = currentData;
        setSaveStatus('saved');

        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('[Auto-save] Error saving:', error);
        setSaveStatus('error');
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, order, orderId]);

  const handleSubmit = async () => {
    try {
      // Validate form before submission
      const validation = validateAnnualReportForm(formData);

      if (!validation.isValid) {
        // Show all validation errors
        const errorMessage = 'Please fix the following errors:\n\n' + validation.errors.join('\n');
        alert(errorMessage);
        return;
      }

      const annualReportItem = order?.orderItems.find(
        (item) => item.serviceType === 'ANNUAL_REPORT'
      );

      if (!annualReportItem) return;

      // Ensure data is saved
      const response = await fetch(`/api/orders/${orderId}/items/${annualReportItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additionalData: formData,
          additionalDataCollected: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      // Redirect to checkout page
      router.push(`/checkout/${orderId}`);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Order not found</p>
        </div>
      </div>
    );
  }

  const annualReportItem = order.orderItems.find(
    (item) => item.serviceType === 'ANNUAL_REPORT'
  );

  if (!annualReportItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">No Annual Report found in this order</p>
        </div>
      </div>
    );
  }

  // Determine entity type from order
  const hasLLC = order.orderItems.some((item) => item.serviceType === 'LLC_FORMATION');
  const hasCorp = order.orderItems.some((item) => item.serviceType === 'CORP_FORMATION');
  const entityType = hasLLC ? 'LLC' : hasCorp ? 'CORPORATION' : 'LLC';

  // Get business name from formation
  const businessName = order.orderItems.find(
    (item) => item.serviceType === 'LLC_FORMATION' || item.serviceType === 'CORP_FORMATION'
  )?.description;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="w-full max-w-4xl px-6 py-6">
            <button
              onClick={() => router.push(`/orders/${orderId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Order</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Florida Annual Report</h1>
                <p className="text-gray-600 mt-1">Order #{order.orderNumber}</p>
              </div>
              {saveStatus !== 'idle' && (
                <div className="flex items-center gap-2">
                  {saveStatus === 'saving' && (
                    <>
                      <Clock className="w-4 h-4 text-gray-400 animate-spin" />
                      <span className="text-sm text-gray-600">Saving...</span>
                    </>
                  )}
                  {saveStatus === 'saved' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">All changes saved</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600">Failed to save</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Content - Centered */}
      <div className="flex items-center justify-center py-8">
        <div className="w-full max-w-4xl mx-auto px-6">
          {/* Auto-save Notice */}
          <div
            className="rounded-lg border-2 border-blue-200 bg-blue-50 shadow-sm"
            style={{ padding: '20px 24px', marginBottom: '32px' }}
          >
            <p className="text-sm text-blue-800">
              <strong>Auto-save enabled:</strong> Your progress is automatically saved as you type. You can safely close this page and return anytime.
            </p>
          </div>

          {/* Form */}
          <AnnualReportForm
            initialData={formData}
            onChange={setFormData}
            preFilledBusinessName={businessName}
            preFilledEntityType={entityType}
          />

          {/* Submit Button */}
          <div style={{ marginTop: '32px' }} className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              style={{ padding: '12px 24px' }}
            >
              Submit Annual Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

