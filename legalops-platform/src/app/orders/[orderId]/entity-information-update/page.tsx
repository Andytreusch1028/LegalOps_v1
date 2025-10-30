'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EntityInformationUpdateForm from '@/components/forms/EntityInformationUpdateForm';
import UPLDisclaimer from '@/components/UPLDisclaimer';

export default function EntityInformationUpdatePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [formData, setFormData] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [preFilledBusinessName, setPreFilledBusinessName] = useState<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Fetch order data and pre-fill business name
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const order = await response.json();
          
          // Find the entity information update item
          const updateItem = order.items?.find(
            (item: any) => item.serviceType === 'ENTITY_INFORMATION_UPDATE'
          );

          if (updateItem?.formData) {
            setFormData(updateItem.formData);
            lastSavedDataRef.current = JSON.stringify(updateItem.formData);
          }

          // Pre-fill business name from order
          if (order.businessName) {
            setPreFilledBusinessName(order.businessName);
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // Auto-save with debounce
  const handleFormChange = useCallback((data: any) => {
    setFormData(data);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      const currentDataString = JSON.stringify(data);
      
      // Only save if data has changed
      if (currentDataString === lastSavedDataRef.current) {
        return;
      }

      setSaveStatus('saving');

      try {
        const response = await fetch(`/api/orders/${orderId}/update-form-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceType: 'ENTITY_INFORMATION_UPDATE',
            formData: data,
          }),
        });

        if (response.ok) {
          setSaveStatus('saved');
          lastSavedDataRef.current = currentDataString;
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          setSaveStatus('error');
        }
      } catch (error) {
        console.error('Error saving form data:', error);
        setSaveStatus('error');
      }
    }, 1000);
  }, [orderId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Update Entity Information</h1>
          <p className="text-purple-100">
            Update your email, FEIN, or addresses with the Florida Department of State
          </p>
        </div>

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div className="mb-6 text-center">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                saveStatus === 'saving'
                  ? 'bg-blue-100 text-blue-800'
                  : saveStatus === 'saved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {saveStatus === 'saving' && '💾 Saving...'}
              {saveStatus === 'saved' && '✅ Saved'}
              {saveStatus === 'error' && '❌ Error saving'}
            </span>
          </div>
        )}

        {/* UPL Disclaimer */}
        <div style={{ marginBottom: '24px' }}>
          <UPLDisclaimer variant="form" />
        </div>

        {/* Form */}
        <div className="rounded-lg border-2 border-white/20 bg-white/95 backdrop-blur-sm shadow-2xl" style={{ padding: '32px' }}>
          <EntityInformationUpdateForm
            initialData={formData}
            onChange={handleFormChange}
            preFilledBusinessName={preFilledBusinessName}
          />

          {/* Submit Button */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '2px solid #e5e7eb' }}>
            <button
              onClick={() => router.push(`/orders/${orderId}`)}
              className="w-full text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Save and Continue
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push(`/orders/${orderId}`)}
            className="text-white hover:text-purple-100 underline"
          >
            ← Back to Order
          </button>
        </div>
      </div>
    </div>
  );
}

