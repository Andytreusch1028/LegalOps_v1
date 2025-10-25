'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, Clock, Tag } from 'lucide-react';
import LLCFormationWizard from '@/components/LLCFormationWizard';
import PackageSelector from '@/components/PackageSelector';
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
  registeredAgentFee?: number;
  rushFee?: number;
  rushFeeAvailable?: boolean;
  icon: string;
  processingTime: string;
  category: string;
  requirements?: string[];
}

interface Package {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  features: string[];
  badge: string | null;
  highlightColor: string | null;
  includesRA: boolean;
  raYears: number;
  includesEIN: boolean;
  includesAI: boolean;
  includesOperatingAgreement: boolean;
  includesComplianceCalendar: boolean;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showForm, setShowForm] = useState(false);

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
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4"></div>
            <div className="lg:col-span-8">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span className="text-5xl">{service.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <h1 className="font-semibold tracking-tight" style={{ fontSize: '48px', color: '#0f172a', marginBottom: '8px' }}>
                    {service.name}
                  </h1>
                  <p style={{ fontSize: '18px', color: '#64748b' }}>
                    {service.shortDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About This Service Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div
          className="bg-white rounded-xl text-center"
          style={{
            border: '3px solid #e2e8f0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            padding: '32px 48px',
          }}
        >
          <h3 className="font-bold text-slate-900" style={{ fontSize: '20px', marginBottom: '16px' }}>
            About This Service
          </h3>
          <p className="text-slate-600 max-w-3xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.7' }}>
            {service.longDescription}
          </p>
        </div>
      </div>

      {/* Main Content - Package Selection or Form */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 64px' }}>
        {!showForm ? (
          /* Package Selection */
          <div>
            <PackageSelector
              onSelectPackage={(pkg) => {
                setSelectedPackage(pkg);
                setShowForm(true);
              }}
              selectedPackageId={selectedPackage?.id}
            />
          </div>
        ) : (
          /* Form Wizard */
          <div className="bg-white rounded-xl" style={{
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ padding: '32px 32px 24px' }}>
              {/* Package Selection Summary */}
              {selectedPackage && (
                <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-sky-700 font-medium">Selected Package:</p>
                      <p className="text-lg font-bold text-sky-900">{selectedPackage.name} - ${selectedPackage.price}</p>
                    </div>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-sm text-sky-600 hover:text-sky-800 underline"
                    >
                      Change Package
                    </button>
                  </div>
                </div>
              )}

              {!selectedPackage && (
                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-700 font-medium">Individual Filing Selected</p>
                      <p className="text-xs text-slate-600">You can add services at checkout</p>
                    </div>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-sm text-sky-600 hover:text-sky-800 underline"
                    >
                      View Packages
                    </button>
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px', lineHeight: '1.2' }}>
                  Complete Your Order
                </h2>
                <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.5' }}>
                  Fill out the form below to get started with your {service.name.toLowerCase()}
                </p>
              </div>
              <LLCFormationWizard
                serviceId={service.id}
                service={{
                  id: service.id,
                  serviceFee: service.serviceFee,
                  stateFee: service.stateFee,
                  registeredAgentFee: service.registeredAgentFee || 0,
                  totalPrice: service.totalPrice,
                  rushFee: service.rushFee || 0,
                  rushFeeAvailable: service.rushFeeAvailable || false,
                }}
                selectedPackage={selectedPackage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

