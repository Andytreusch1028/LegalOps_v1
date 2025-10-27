'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TestUpsellsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test-upsells/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to create test order');
      }

      const data = await response.json();
      setOrderId(data.orderId);
      
      // Redirect to checkout page
      router.push(`/checkout/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Sign In Required</h1>
          <p className="text-slate-600 mb-6">You must be signed in to test upsells</p>
          <a
            href="/auth/signin?callbackUrl=/test-upsells"
            className="inline-block px-6 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50" style={{ padding: '64px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div
          className="rounded-xl bg-white"
          style={{
            border: '2px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            padding: '48px',
          }}
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Test Checkout Upsells</h1>
          
          <div className="mb-8">
            <p className="text-slate-600 mb-2">
              <strong>Signed in as:</strong> {session?.user?.email}
            </p>
            <p className="text-slate-600">
              Click the button below to create a test individual service order (LLC Formation) and see the upsells in action.
            </p>
          </div>

          {error && (
            <div
              className="rounded-lg bg-red-50 mb-6"
              style={{
                border: '2px solid #ef4444',
                padding: '16px',
              }}
            >
              <p className="text-red-800 font-semibold">Error: {error}</p>
            </div>
          )}

          {orderId && (
            <div
              className="rounded-lg bg-emerald-50 mb-6"
              style={{
                border: '2px solid #10b981',
                padding: '16px',
              }}
            >
              <p className="text-emerald-800 font-semibold">
                ✅ Test order created! Order ID: {orderId}
              </p>
              <p className="text-emerald-700 text-sm mt-2">
                Redirecting to checkout page...
              </p>
            </div>
          )}

          <button
            onClick={createTestOrder}
            disabled={loading}
            className="w-full rounded-xl font-bold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              border: '3px solid #0284c7',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
              padding: '16px 24px',
              fontSize: '18px',
            }}
          >
            {loading ? 'Creating Test Order...' : '🚀 Create Test Order & View Upsells'}
          </button>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <h2 className="font-semibold text-slate-900 mb-4">What You'll See:</h2>
            <ul className="space-y-2 text-slate-600">
              <li>✅ Individual LLC Formation order ($225)</li>
              <li>✅ 3 upsell recommendations (RA Service, Operating Agreement, EIN)</li>
              <li>✅ Bundle offer ($249 for all 3, save $24)</li>
              <li>✅ Real-time order total updates when adding upsells</li>
              <li>✅ Payment form with updated amount</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

