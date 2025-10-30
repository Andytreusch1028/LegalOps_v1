'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react';
import DocumentWizard, { WizardStep } from '@/components/DocumentWizard';
import OperatingAgreementForm from '@/components/forms/OperatingAgreementForm';
import EINApplicationForm from '@/components/forms/EINApplicationForm';
import UPLDisclaimer from '@/components/UPLDisclaimer';

interface OrderItem {
  id: string;
  serviceType: string;
  description: string;
  requiresAdditionalData: boolean;
  additionalDataCollected: boolean;
  additionalData: any;
  dataCollectionFormType: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  total: number;
  orderItems: OrderItem[];
}

export default function CompleteDocumentsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Unwrap params
  useEffect(() => {
    params.then((p) => setOrderId(p.orderId));
  }, [params]);

  // Fetch order data
  useEffect(() => {
    if (status === 'loading' || !orderId) return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
          throw new Error('Order not found');
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [session, status, orderId, router]);

  // Get items that need data collection
  const itemsNeedingData = order?.orderItems.filter(
    (item) => item.requiresAdditionalData && !item.additionalDataCollected
  ) || [];

  const totalItems = itemsNeedingData.length;
  const completedItems = order?.orderItems.filter(
    (item) => item.requiresAdditionalData && item.additionalDataCollected
  ).length || 0;

  // Create wizard steps from items needing data
  const wizardSteps: WizardStep[] = itemsNeedingData.map((item) => {
    let component = null;

    switch (item.dataCollectionFormType) {
      case 'OPERATING_AGREEMENT':
        component = (
          <>
            <UPLDisclaimer variant="document" className="mb-6" />
            <OperatingAgreementForm
              initialData={item.additionalData || formData[item.id]}
              onChange={(data) => handleFormDataChange(item.id, data)}
              preFilledBusinessName={order?.orderItems.find(i => i.serviceType === 'LLC_FORMATION')?.description}
            />
          </>
        );
        break;
      case 'EIN_APPLICATION':
        component = (
          <>
            <UPLDisclaimer variant="form" className="mb-6" />
            <EINApplicationForm
              initialData={item.additionalData || formData[item.id]}
              onChange={(data) => handleFormDataChange(item.id, data)}
              preFilledBusinessName={order?.orderItems.find(i => i.serviceType === 'LLC_FORMATION')?.description}
              preFilledEntityType="LLC"
            />
          </>
        );
        break;
      default:
        component = (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Form for {item.dataCollectionFormType} coming soon...</p>
          </div>
        );
    }

    return {
      id: item.id,
      title: item.description,
      description: `Provide details for your ${item.description}`,
      component,
      estimatedTime: '3-5 minutes',
    };
  });

  // Handle form data changes
  const handleFormDataChange = useCallback((itemId: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [itemId]: data,
    }));
  }, []);

  // Handle save
  const handleSave = async (stepId: string, data: any) => {
    if (!orderId) return;

    const response = await fetch(`/api/orders/${orderId}/save-document-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderItemId: stepId,
        formData: data,
        markAsComplete: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save');
    }
  };

  // Handle completion
  const handleComplete = async () => {
    if (!orderId) return;

    // Mark current step as complete
    const currentItem = itemsNeedingData[currentStep];
    if (currentItem) {
      await fetch(`/api/orders/${orderId}/save-document-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItemId: currentItem.id,
          formData: formData[currentItem.id],
          markAsComplete: true,
        }),
      });
    }

    // Redirect to dashboard
    router.push('/dashboard?documents=complete');
  };

  // Loading state
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-900 text-xl">Loading...</div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load order'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check if payment is complete
  if (order.paymentStatus !== 'PAID') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Required</h1>
          <p className="text-gray-600 mb-6">Please complete payment before providing document details.</p>
          <button
            onClick={() => router.push(`/checkout/${orderId}`)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
          >
            Complete Payment
          </button>
        </div>
      </div>
    );
  }

  // All documents complete
  if (itemsNeedingData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All Documents Complete!</h1>
          <p className="text-gray-600 mb-6">
            {completedItems > 0
              ? 'Thank you! We have all the information we need to prepare your documents.'
              : 'No additional information needed for your order.'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Your Documents</h1>
          <p className="text-xl text-gray-700 mb-2">Order #{order.orderNumber}</p>
          <p className="text-gray-600">
            Just a few quick details to finish preparing your documents
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div
            className="rounded-xl bg-white"
            style={{
              padding: '24px',
              border: '2px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="text-gray-900 font-semibold">
                  Progress: {completedItems} of {totalItems + completedItems} documents
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 text-sm">
                  {itemsNeedingData.length * 3} minutes remaining
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(completedItems / (totalItems + completedItems)) * 100}%`,
                  background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Document Wizard */}
        <div>
          <DocumentWizard
            steps={wizardSteps}
            currentStepIndex={currentStep}
            onStepChange={setCurrentStep}
            onSave={handleSave}
            onComplete={handleComplete}
            formData={formData}
            onFormDataChange={handleFormDataChange}
            autoSaveEnabled={true}
          />
        </div>

        {/* Auto-save Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Your progress is automatically saved as you type. You can safely close this page and return anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

