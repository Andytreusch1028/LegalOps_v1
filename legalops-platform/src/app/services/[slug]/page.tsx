'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, Clock, Tag } from 'lucide-react';
import LLCFormationWizard from '@/components/LLCFormationWizard';
import { cn, cardBase } from '@/components/legalops/theme';
import { formatCurrency } from '@/components/legalops/utils';

interface Service {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  totalPrice: number;
  serviceFee: number;
  stateFee: number;
  icon: string;
  processingTime: string;
  category: string;
  requirements?: string[];
}

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${slug}`);
        if (response.ok) {
          const data = await response.json();
          // Convert Decimal strings to numbers
          const service = {
            ...data,
            totalPrice: typeof data.totalPrice === 'string' ? parseFloat(data.totalPrice) : data.totalPrice,
            serviceFee: typeof data.serviceFee === 'string' ? parseFloat(data.serviceFee) : data.serviceFee,
            stateFee: typeof data.stateFee === 'string' ? parseFloat(data.stateFee) : data.stateFee,
          };
          setService(service);
        }
      } catch (error) {
        console.error('Failed to fetch service:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Service not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}>
      {/* Hero Header */}
      <div className="bg-white" style={{ borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="text-6xl">{service.icon}</span>
          </div>
          <h1 className="font-semibold tracking-tight" style={{ fontSize: '48px', color: '#0f172a', marginBottom: '16px' }}>
            {service.name}
          </h1>
          <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '768px', margin: '0 auto' }}>
            {service.shortDescription}
          </p>
        </div>
      </div>

      {/* Combined Section - Service Info + Form */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px 64px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Service Info Cards */}
          <div className="lg:col-span-4">
            <div className="space-y-8 sticky top-6">
              {/* About Card */}
              <div
                className="bg-white rounded-xl"
                style={{
                  borderTop: '1px solid #e2e8f0',
                  borderRight: '1px solid #e2e8f0',
                  borderBottom: '1px solid #e2e8f0',
                  borderLeft: '4px solid #0ea5e9',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <h3 className="font-semibold text-slate-900 mb-3" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                  About This Service
                </h3>
                <p className="text-slate-600" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  {service.longDescription}
                </p>
              </div>

              {/* What's Included Card */}
              <div
                className="bg-white rounded-xl"
                style={{
                  borderTop: '1px solid #e2e8f0',
                  borderRight: '1px solid #e2e8f0',
                  borderBottom: '1px solid #e2e8f0',
                  borderLeft: '4px solid #10b981',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <h3 className="font-semibold text-slate-900 mb-4" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                  What's Included
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      Professional document preparation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      State filing & confirmation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      Free registered agent service (first year)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      Email receipt & support
                    </span>
                  </li>
                </ul>
              </div>

              {/* Pricing Card */}
              <div
                className="bg-white rounded-xl"
                style={{
                  borderTop: '1px solid #e2e8f0',
                  borderRight: '1px solid #e2e8f0',
                  borderBottom: '1px solid #e2e8f0',
                  borderLeft: '4px solid #8b5cf6',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
                  padding: '24px',
                }}
              >
                {/* Pricing */}
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-4" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                    Pricing
                  </h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600" style={{ fontSize: '15px' }}>Service Fee</span>
                      <span className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>
                        {formatCurrency(service.serviceFee)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600" style={{ fontSize: '15px' }}>State Fee</span>
                      <span className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>
                        {formatCurrency(service.stateFee)}
                      </span>
                    </div>
                    <div className="pt-3" style={{ borderTop: '2px solid #e2e8f0' }}>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>Total</span>
                        <span className="font-bold text-sky-600" style={{ fontSize: '28px' }}>
                          {formatCurrency(service.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Details */}
                <div className="mb-6 pb-6" style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-sky-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900" style={{ fontSize: '14px' }}>
                          {service.processingTime}
                        </p>
                        <p className="text-slate-600" style={{ fontSize: '13px' }}>Processing time</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guarantee Badge */}
                <div
                  className="bg-emerald-50 rounded-lg"
                  style={{
                    border: '1px solid #a7f3d0',
                    padding: '16px',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-900 mb-1" style={{ fontSize: '14px' }}>
                        100% Satisfaction Guarantee
                      </p>
                      <p className="text-emerald-700" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                        Full refund if we can't complete your filing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Complete Your Order Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl" style={{
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ padding: '32px 32px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h2 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px', lineHeight: '1.2' }}>
                    Complete Your Order
                  </h2>
                  <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.5' }}>
                    Fill out the form below to get started with your {service.name.toLowerCase()}
                  </p>
                </div>
                <LLCFormationWizard serviceId={service.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

