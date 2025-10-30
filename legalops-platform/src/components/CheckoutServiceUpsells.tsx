'use client';

import { useState } from 'react';
import { ShieldCheck, FileText, Building2, TrendingUp, Clock, Info } from 'lucide-react';
import { getServiceDataRequirements } from '@/config/service-data-requirements';

interface UpsellItem {
  id: string;
  name: string;
  price: number;
  description: string;
  benefit: string;
  urgency?: string;
  socialProof?: string;
  icon: 'shield' | 'file' | 'building' | 'trending';
  category: 'essential' | 'recommended' | 'optional';
  serviceType?: string; // Maps to ServiceType enum for database
}

interface UpsellBundle {
  id: string;
  name: string;
  itemIds: string[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  description: string;
}

interface CheckoutServiceUpsellsProps {
  serviceType: string;
  onAddUpsell: (upsellId: string, price: number, serviceType?: string) => void;
  onRemoveUpsell: (upsellId: string, price: number) => void;
  onAddBundle: (bundleId: string, itemIds: string[], price: number, itemServiceTypes?: Record<string, string>) => void;
  onRemoveBundle: (bundleId: string, itemIds: string[], price: number) => void;
  addedUpsells?: string[];
}

// Icon mapping
const iconMap = {
  shield: ShieldCheck,
  file: FileText,
  building: Building2,
  trending: TrendingUp,
};

// Upsell configurations by service type
const upsellConfigs: Record<string, { upsells: UpsellItem[]; bundles?: UpsellBundle[] }> = {
  LLC_FORMATION: {
    upsells: [
      {
        id: 'registered-agent',
        name: 'Registered Agent Service',
        price: 125,
        description: 'Professional registered agent service for your LLC',
        benefit: 'Let us handle all legal correspondence for you',
        urgency: 'Required by Florida law - don\'t risk missing important legal documents',
        socialProof: '85% of our customers choose this',
        icon: 'shield',
        category: 'essential',
        serviceType: 'REGISTERED_AGENT',
      },
      {
        id: 'operating-agreement',
        name: 'Operating Agreement',
        price: 99,
        description: 'Customized operating agreement for your LLC',
        benefit: 'Protect your personal assets and define ownership structure',
        socialProof: '90% of our customers add this',
        icon: 'file',
        category: 'recommended',
        serviceType: 'OPERATING_AGREEMENT',
      },
      {
        id: 'ein-application',
        name: 'EIN Application',
        price: 49,
        description: 'Federal Employer Identification Number from the IRS',
        benefit: 'Get your federal tax ID to open a business bank account',
        urgency: 'Needed to hire employees or open business accounts',
        icon: 'building',
        category: 'recommended',
        serviceType: 'EIN_APPLICATION',
      },
    ],
    bundles: [
      {
        id: 'complete-startup-bundle',
        name: 'Complete Startup Bundle',
        itemIds: ['registered-agent', 'operating-agreement', 'ein-application'],
        originalPrice: 273,
        bundlePrice: 249,
        savings: 24,
        description: 'Everything you need to start your LLC the right way',
      },
    ],
  },
  CORP_FORMATION: {
    upsells: [
      {
        id: 'registered-agent',
        name: 'Registered Agent Service',
        price: 125,
        description: 'Professional registered agent service for your corporation',
        benefit: 'Let us handle all legal correspondence for you',
        urgency: 'Required by Florida law',
        socialProof: '85% of our customers choose this',
        icon: 'shield',
        category: 'essential',
        serviceType: 'REGISTERED_AGENT',
      },
      {
        id: 'corporate-bylaws',
        name: 'Corporate Bylaws',
        price: 99,
        description: 'Customized bylaws for your corporation',
        benefit: 'Establish rules for running your corporation',
        urgency: 'Required by most banks and investors',
        icon: 'file',
        category: 'essential',
        serviceType: 'CORPORATE_BYLAWS',
      },
      {
        id: 'ein-application',
        name: 'EIN Application',
        price: 49,
        description: 'Federal Employer Identification Number from the IRS',
        benefit: 'Get your federal tax ID to open a business bank account',
        icon: 'building',
        category: 'recommended',
        serviceType: 'EIN_APPLICATION',
      },
    ],
    bundles: [
      {
        id: 'complete-corp-bundle',
        name: 'Complete Corporation Bundle',
        itemIds: ['registered-agent', 'corporate-bylaws', 'ein-application'],
        originalPrice: 273,
        bundlePrice: 249,
        savings: 24,
        description: 'Everything you need to start your corporation',
      },
    ],
  },
  LLC_ANNUAL_REPORT: {
    upsells: [
      {
        id: 'certificate-of-status',
        name: 'Certificate of Status',
        price: 30,
        description: 'Official proof your LLC is in good standing',
        benefit: 'Required by banks, lenders, and vendors',
        icon: 'file',
        category: 'recommended',
        serviceType: 'CERTIFICATE_OF_STATUS',
      },
    ],
  },
  CORP_ANNUAL_REPORT: {
    upsells: [
      {
        id: 'certificate-of-status',
        name: 'Certificate of Status',
        price: 30,
        description: 'Official proof your corporation is in good standing',
        benefit: 'Required by banks, lenders, and vendors',
        icon: 'file',
        category: 'recommended',
        serviceType: 'CERTIFICATE_OF_STATUS',
      },
    ],
  },
};

export function CheckoutServiceUpsells({ serviceType, onAddUpsell, onRemoveUpsell, onAddBundle, onRemoveBundle, addedUpsells = [] }: CheckoutServiceUpsellsProps) {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  const config = upsellConfigs[serviceType];

  // Don't show upsells if no configuration exists for this service type
  if (!config || !config.upsells || config.upsells.length === 0) {
    return null;
  }

  const handleToggleUpsell = (upsell: UpsellItem) => {
    const isAdded = addedUpsells.includes(upsell.id);
    if (isAdded) {
      onRemoveUpsell(upsell.id, upsell.price);
    } else {
      onAddUpsell(upsell.id, upsell.price, upsell.serviceType);
    }
  };

  const handleToggleBundle = (bundle: UpsellBundle) => {
    const isSelected = selectedBundle === bundle.id;
    if (isSelected) {
      setSelectedBundle(null);
      onRemoveBundle(bundle.id, bundle.itemIds, bundle.bundlePrice);
    } else {
      setSelectedBundle(bundle.id);

      // Create a map of itemId -> serviceType for the bundle
      const itemServiceTypes: Record<string, string> = {};
      bundle.itemIds.forEach((itemId) => {
        const upsell = config.upsells.find((u) => u.id === itemId);
        if (upsell?.serviceType) {
          itemServiceTypes[itemId] = upsell.serviceType;
        }
      });

      onAddBundle(bundle.id, bundle.itemIds, bundle.bundlePrice, itemServiceTypes);
    }
  };

  return (
    <div
      className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50"
      style={{
        border: '2px solid #f59e0b',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
        padding: '28px',
        marginTop: '32px',
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="rounded-full"
          style={{
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
          }}
        >
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-amber-900" style={{ fontSize: '20px', lineHeight: '1.2' }}>
            Recommended Add-Ons
          </h3>
          <p className="text-amber-700" style={{ fontSize: '14px' }}>
            Complete your setup with these essential services
          </p>
        </div>
      </div>

      {/* Individual Upsells */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        {config.upsells.map((upsell) => {
          const Icon = iconMap[upsell.icon];
          const isAdded = addedUpsells.includes(upsell.id);
          const dataRequirements = upsell.serviceType ? getServiceDataRequirements(upsell.serviceType) : null;

          return (
            <div
              key={upsell.id}
              className="bg-white rounded-lg"
              style={{
                border: isAdded ? '2px solid #10b981' : '2px solid #e5e7eb',
                padding: '20px',
                transition: 'all 0.2s',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="rounded-full flex-shrink-0"
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isAdded
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                    border: isAdded ? '2px solid #10b981' : '2px solid #d1d5db',
                  }}
                >
                  <Icon className={`w-5 h-5 ${isAdded ? 'text-white' : 'text-slate-600'}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>
                        {upsell.name}
                      </h4>
                      <p className="text-slate-600" style={{ fontSize: '14px', lineHeight: '1.5', marginTop: '4px' }}>
                        {upsell.description}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 ml-4" style={{ fontSize: '18px' }}>
                      ${upsell.price}
                    </span>
                  </div>

                  <p className="text-emerald-700 font-medium" style={{ fontSize: '14px', marginBottom: '8px' }}>
                    ✓ {upsell.benefit}
                  </p>

                  {upsell.urgency && (
                    <p className="text-amber-700 text-sm mb-2">⚠️ {upsell.urgency}</p>
                  )}

                  {upsell.socialProof && (
                    <p className="text-slate-600 text-sm mb-3">👥 {upsell.socialProof}</p>
                  )}

                  <button
                    onClick={() => handleToggleUpsell(upsell)}
                    className={`font-semibold rounded-lg transition-all duration-200 ${
                      isAdded
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-amber-600 hover:bg-amber-700 text-white hover:scale-105'
                    }`}
                    style={{
                      fontSize: '14px',
                      padding: '10px 20px',
                      border: isAdded ? '2px solid #ef4444' : 'none',
                    }}
                  >
                    {isAdded ? '✕ Remove from Order' : 'Add to Order'}
                  </button>

                  {/* Data Collection Notice */}
                  {dataRequirements?.requiresAdditionalData && !isAdded && (
                    <div
                      className="flex items-start gap-2 rounded-lg"
                      style={{
                        marginTop: '12px',
                        padding: '10px 12px',
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        border: '1px solid #93c5fd',
                      }}
                    >
                      <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" style={{ marginTop: '2px' }} />
                      <div className="flex-1">
                        <p className="text-blue-800 font-medium" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                          <strong>Quick details needed after payment</strong> ({dataRequirements.estimatedTimeToComplete})
                        </p>
                        {dataRequirements.preFilledMessage && (
                          <p className="text-blue-700" style={{ fontSize: '11px', marginTop: '4px', lineHeight: '1.3' }}>
                            {dataRequirements.preFilledMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bundle Offer */}
      {config.bundles && config.bundles.length > 0 && (
        <div
          className="rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '3px solid #f59e0b',
            padding: '24px',
            marginTop: '20px',
          }}
        >
          {config.bundles.map((bundle) => {
            const isSelected = selectedBundle === bundle.id;

            return (
              <div key={bundle.id}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-amber-900" style={{ fontSize: '18px' }}>
                      💰 {bundle.name}
                    </h4>
                    <p className="text-amber-800" style={{ fontSize: '14px', marginTop: '4px' }}>
                      {bundle.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 line-through" style={{ fontSize: '14px' }}>
                      ${bundle.originalPrice}
                    </p>
                    <p className="font-bold text-amber-900" style={{ fontSize: '24px' }}>
                      ${bundle.bundlePrice}
                    </p>
                  </div>
                </div>

                <p className="text-emerald-700 font-semibold mb-4" style={{ fontSize: '15px' }}>
                  ✓ Save ${bundle.savings} when you add all {bundle.itemIds.length} services
                </p>

                <button
                  onClick={() => handleToggleBundle(bundle)}
                  className={`w-full font-bold rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
                      : 'bg-amber-600 hover:bg-amber-700 text-white hover:scale-105'
                  }`}
                  style={{
                    fontSize: '16px',
                    padding: '14px 24px',
                  }}
                >
                  {isSelected ? '✕ Remove Bundle from Order' : 'Add Complete Bundle'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

