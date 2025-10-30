/**
 * LegalOps v1 - Checkout Router Test Page
 * 
 * Test page to demonstrate conditional checkout routing with UPL compliance
 */

'use client';

import { useState } from 'react';
import CheckoutRouter from '@/components/checkout/CheckoutRouter';

export default function TestCheckoutRouterPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Test services - mix of account-required and guest-allowed
  const testServices = [
    {
      type: 'LLC_FORMATION',
      name: 'LLC Formation',
      price: 225,
      description: 'Account REQUIRED - Ongoing RA service',
      color: 'blue',
    },
    {
      type: 'CORP_FORMATION',
      name: 'Corporation Formation',
      price: 170,
      description: 'Account REQUIRED - Ongoing RA service',
      color: 'blue',
    },
    {
      type: 'ANNUAL_REPORT',
      name: 'Annual Report Filing',
      price: 188.75,
      description: 'Account REQUIRED - Compliance tracking',
      color: 'blue',
    },
    {
      type: 'REGISTERED_AGENT',
      name: 'Registered Agent Service',
      price: 99,
      description: 'Account REQUIRED - Document delivery',
      color: 'blue',
    },
    {
      type: 'OPERATING_AGREEMENT',
      name: 'Operating Agreement',
      price: 149,
      description: 'Guest checkout ALLOWED - One-time document',
      color: 'green',
    },
    {
      type: 'CORPORATE_BYLAWS',
      name: 'Corporate Bylaws',
      price: 149,
      description: 'Guest checkout ALLOWED - One-time document',
      color: 'green',
    },
    {
      type: 'CERTIFICATE_OF_STATUS',
      name: 'Certificate of Status',
      price: 50,
      description: 'Guest checkout ALLOWED - One-time certificate',
      color: 'green',
    },
    {
      type: 'EIN_APPLICATION',
      name: 'EIN Application',
      price: 99,
      description: 'Guest checkout ALLOWED - One-time service',
      color: 'green',
    },
  ];

  const handleBack = () => {
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      {!selectedService ? (
        // Service Selection Screen
        <div className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-slate-900 mb-4">
                🧪 Checkout Router Test Page
              </h1>
              <p className="text-xl text-slate-600 mb-2">
                Test conditional checkout with UPL compliance
              </p>
              <p className="text-sm text-slate-500">
                Select a service below to see how the checkout router handles account requirements
              </p>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Legend:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-slate-700">
                    <strong>Blue</strong> = Account REQUIRED (no guest checkout)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-slate-700">
                    <strong>Green</strong> = Guest checkout ALLOWED
                  </span>
                </div>
              </div>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testServices.map((service) => (
                <button
                  key={service.type}
                  onClick={() => setSelectedService(service.type)}
                  className={`text-left p-6 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-xl ${
                    service.color === 'blue'
                      ? 'border-blue-300 bg-blue-50 hover:border-blue-500'
                      : 'border-green-300 bg-green-50 hover:border-green-500'
                  }`}
                >
                  <div className="text-3xl mb-3">
                    {service.color === 'blue' ? '🔐' : '📄'}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-2xl font-semibold text-sky-600 mb-3">
                    ${service.price.toFixed(2)}
                  </p>
                  <p className={`text-xs ${
                    service.color === 'blue' ? 'text-blue-700' : 'text-green-700'
                  }`}>
                    {service.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Info Box */}
            <div className="mt-12 bg-amber-50 border-2 border-amber-300 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h3 className="font-bold text-amber-900 mb-2">
                    What You'll See:
                  </h3>
                  <ul className="text-sm text-amber-800 space-y-1 list-disc ml-5">
                    <li><strong>Blue services:</strong> "Account Required" notice with dashboard features</li>
                    <li><strong>Green services:</strong> Choice between "Create Account" or "Continue as Guest"</li>
                    <li><strong>All services:</strong> UPL disclaimer + Terms of Service acceptance required</li>
                    <li><strong>All services:</strong> Privacy Policy acceptance required</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Checkout Router Screen
        <div>
          {/* Back Button */}
          <div className="bg-white border-b border-slate-200 py-4 px-4">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={handleBack}
                className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-2"
              >
                ← Back to Service Selection
              </button>
            </div>
          </div>

          {/* Checkout Router Component */}
          <CheckoutRouter
            serviceType={selectedService}
            serviceName={testServices.find(s => s.type === selectedService)?.name || ''}
            servicePrice={testServices.find(s => s.type === selectedService)?.price || 0}
          />
        </div>
      )}
    </div>
  );
}

