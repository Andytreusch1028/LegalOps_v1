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

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Single Floating Card */}
        <div className={cn(cardBase, 'p-8 md:p-12 shadow-lg')}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Service Details */}
            <div className="lg:col-span-2 space-y-10">
              {/* About This Service */}
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">About This Service</h2>
                <p className="text-base text-slate-600 leading-relaxed">{service.longDescription}</p>
              </div>

              {/* What's Included */}
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">What's Included</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-base text-slate-700">Professional preparation of all required documents</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-base text-slate-700">Filing with Florida Department of State</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-base text-slate-700">Email confirmation and filing receipt</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-base text-slate-700">Customer support throughout the process</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Pricing & Details */}
            <div className="lg:col-span-1">
              <div className="space-y-8">
                {/* Pricing Section */}
                <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">Pricing</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-base text-slate-600">Service Fee</span>
                      <span className="text-lg font-semibold text-slate-900">{formatCurrency(service.serviceFee)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-slate-600">State Fee</span>
                      <span className="text-lg font-semibold text-slate-900">{formatCurrency(service.stateFee)}</span>
                    </div>
                    <div className="pt-4 border-t-2 border-slate-300">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-slate-900">Total</span>
                        <span className="text-3xl font-bold text-sky-600">{formatCurrency(service.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Details Section */}
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">Service Details</h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-base font-medium text-slate-900">Processing Time</p>
                        <p className="text-base text-slate-600">{service.processingTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-base font-medium text-slate-900">Category</p>
                        <p className="text-base text-slate-600">{service.category.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Satisfaction Guarantee */}
                <div className="p-5 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-base font-semibold text-emerald-900 mb-2">100% Satisfaction Guarantee</p>
                      <p className="text-sm text-emerald-700 leading-relaxed">
                        If we can't complete your filing, we'll refund your service fee.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white" style={{ borderTop: '1px solid #e2e8f0', padding: '64px 0' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="font-semibold" style={{ fontSize: '36px', color: '#0f172a', marginBottom: '12px' }}>
              Complete Your Order
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b' }}>
              Fill out the form below to get started with your {service.name.toLowerCase()}
            </p>
          </div>
          <LLCFormationWizard serviceId={service.id} />
        </div>
      </div>
    </div>
  );
}

