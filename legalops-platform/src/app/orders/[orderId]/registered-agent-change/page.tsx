'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RegisteredAgentChangeForm from '@/components/forms/RegisteredAgentChangeForm';
import UPLDisclaimer from '@/components/UPLDisclaimer';

export default function RegisteredAgentChangePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [formData, setFormData] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [preFilledBusinessName, setPreFilledBusinessName] = useState<string>('');
  const [preFilledEntityType, setPreFilledEntityType] = useState<'LLC' | 'CORPORATION'>('LLC');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const order = await response.json();
          
          const changeItem = order.items?.find(
            (item: any) => item.serviceType === 'REGISTERED_AGENT_CHANGE'
          );

          if (changeItem?.formData) {
            setFormData(changeItem.formData);
            lastSavedDataRef.current = JSON.stringify(changeItem.formData);
          }

          if (order.businessName) {
            setPreFilledBusinessName(order.businessName);
          }

          if (order.entityType) {
            setPreFilledEntityType(order.entityType);
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

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const currentDataString = JSON.stringify(data);
      
      if (currentDataString === lastSavedDataRef.current) {
        return;
      }

      setSaveStatus('saving');

      try {
        const response = await fetch(`/api/orders/${orderId}/update-form-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceType: 'REGISTERED_AGENT_CHANGE',
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Change Registered Agent</h1>
          <p className="text-purple-100">
            Update your registered agent with the Florida Department of State
          </p>
        </div>

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

        <div className="rounded-lg border-2 border-white/20 bg-white/95 backdrop-blur-sm shadow-2xl" style={{ padding: '32px' }}>
          <RegisteredAgentChangeForm
            initialData={formData}
            onChange={handleFormChange}
            preFilledBusinessName={preFilledBusinessName}
            preFilledEntityType={preFilledEntityType}
          />

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
            
            <p className="text-xs text-gray-500 text-center mt-3">
              After saving, you'll be able to download the completed form for mailing
            </p>
          </div>
        </div>

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

