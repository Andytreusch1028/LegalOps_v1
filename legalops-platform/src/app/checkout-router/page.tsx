/**
 * LegalOps v1 - Checkout Router Page
 * 
 * Displays the CheckoutRouter component to route customers to appropriate checkout flow
 * based on service requirements (account creation vs guest checkout)
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import CheckoutRouter from '@/components/checkout/CheckoutRouter';

function CheckoutRouterContent() {
  const searchParams = useSearchParams();
  const serviceType = searchParams.get('service') || '';
  const serviceName = searchParams.get('name') || '';
  const servicePrice = parseFloat(searchParams.get('price') || '0');

  if (!serviceType || !serviceName || !servicePrice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Service</h1>
          <p className="text-slate-600">Missing required service information.</p>
        </div>
      </div>
    );
  }

  return (
    <CheckoutRouter
      serviceType={serviceType}
      serviceName={serviceName}
      servicePrice={servicePrice}
    />
  );
}

export default function CheckoutRouterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    }>
      <CheckoutRouterContent />
    </Suspense>
  );
}

