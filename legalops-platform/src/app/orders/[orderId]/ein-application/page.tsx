'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import EINApplicationForm from '@/components/forms/EINApplicationForm';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function EINApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState(true);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        const data = await response.json();
        setOrder(data);

        // Find EIN Application item and load existing data
        const einItem = data.orderItems.find(
          (item: any) => item.serviceType === 'EIN_APPLICATION'
        );

        if (einItem?.additionalData) {
          setFormData(einItem.additionalData);
          lastSavedDataRef.current = JSON.stringify(einItem.additionalData);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Auto-save functionality
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
        const einItem = order.orderItems.find(
          (item: any) => item.serviceType === 'EIN_APPLICATION'
        );

        if (!einItem) return;

        const response = await fetch(`/api/orders/${orderId}/items/${einItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            additionalData: formData,
            additionalDataCollected: false,
          }),
        });

        if (!response.ok) throw new Error('Failed to save');

        lastSavedDataRef.current = currentData;
        setSaveStatus('saved');

        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Error saving:', error);
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
      const einItem = order?.orderItems.find(
        (item: any) => item.serviceType === 'EIN_APPLICATION'
      );

      if (!einItem) return;

      // Ensure data is saved
      const response = await fetch(`/api/orders/${orderId}/items/${einItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additionalData: formData,
          additionalDataCollected: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      // Redirect to order page
      router.push(`/orders/${orderId}`);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Order not found</div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">EIN Application</h1>
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

          {/* EIN Application Form */}
          <EINApplicationForm
            initialData={formData}
            onChange={setFormData}
          />

          {/* Submit Button */}
          <div style={{ marginTop: '32px' }}>
            <button
              onClick={handleSubmit}
              className="w-full rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Submit EIN Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

