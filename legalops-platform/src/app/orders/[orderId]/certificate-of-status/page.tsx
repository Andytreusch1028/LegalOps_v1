'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import CertificateOfStatusForm from '@/components/forms/CertificateOfStatusForm';
import { Prisma } from '@/generated/prisma';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Type for Order with orderItems relation
type OrderWithItems = {
  id: string;
  orderItems: Array<{
    id: string;
    serviceType: string;
    additionalData?: Prisma.JsonValue;
  }>;
};

export default function CertificateOfStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState(true);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        
        const data = await response.json();
        setOrder(data);

        const certItem = data.orderItems.find(
          (item: { serviceType: string }) => item.serviceType === 'CERTIFICATE_OF_STATUS'
        );

        if (certItem?.additionalData) {
          const additionalData = certItem.additionalData as Record<string, unknown>;
          setFormData(additionalData);
          lastSavedDataRef.current = JSON.stringify(additionalData);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, session, status, router]);

  useEffect(() => {
    if (!order || Object.keys(formData).length === 0) return;

    const currentData = JSON.stringify(formData);
    if (currentData === lastSavedDataRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const certItem = order.orderItems.find(
          (item: any) => item.serviceType === 'CERTIFICATE_OF_STATUS'
        );

        if (!certItem) return;

        const response = await fetch(`/api/orders/${orderId}/items/${certItem.id}`, {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const certItem = order.orderItems.find(
        (item: any) => item.serviceType === 'CERTIFICATE_OF_STATUS'
      );

      if (!certItem) return;

      const response = await fetch(`/api/orders/${orderId}/items/${certItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additionalData: formData,
          additionalDataCollected: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      router.push(`/orders/${orderId}/complete-documents`);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const businessName = order?.orderItems.find(
    (item: any) => item.serviceType === 'LLC_FORMATION' || item.serviceType === 'CORP_FORMATION'
  )?.description || 'Your Business';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="w-full max-w-4xl px-6 py-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Certificate of Status</h1>
              
              {saveStatus !== 'idle' && (
                <div className="text-sm">
                  {saveStatus === 'saving' && <span className="text-gray-600">Saving...</span>}
                  {saveStatus === 'saved' && <span className="text-green-600">✓ All changes saved</span>}
                  {saveStatus === 'error' && <span className="text-red-600">Failed to save</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-4xl px-6 py-8">
          <div
            className="rounded-lg border-2 border-blue-200 bg-blue-50"
            style={{ padding: '16px 20px', marginBottom: '32px' }}
          >
            <p className="text-blue-800 text-sm">
              <strong>Auto-save enabled:</strong> Your progress is automatically saved as you type.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <CertificateOfStatusForm
              initialData={formData}
              onChange={setFormData}
              preFilledBusinessName={businessName}
            />

            <div style={{ marginTop: '32px' }}>
              <button
                type="submit"
                className="w-full text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Request Certificate of Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

