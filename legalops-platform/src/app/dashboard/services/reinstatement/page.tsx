'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface ReinstatementFees {
  baseFee: number;
  annualReportFeePerYear: number;
  yearsRevoked: number;
  totalAnnualReportFees: number;
  totalBaseFees: number;
  addOns: {
    changeAgent: boolean;
    amendBusiness: boolean;
    einApplication: boolean;
    operatingAgreement: boolean;
  };
  addOnFees: number;
  grandTotal: number;
}

// Helper function to format entity type
const formatEntityType = (entityType: string) => {
  if (!entityType) return '';
  return entityType.replace(/_/g, ' ');
};

export default function ReinstatementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get('businessId');

  const [business, setBusiness] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [fees, setFees] = useState<ReinstatementFees>({
    baseFee: 0,
    annualReportFeePerYear: 0,
    yearsRevoked: 0,
    totalAnnualReportFees: 0,
    totalBaseFees: 0,
    addOns: {
      changeAgent: false,
      amendBusiness: false,
      einApplication: false,
      operatingAgreement: false
    },
    addOnFees: 0,
    grandTotal: 0
  });

  useEffect(() => {
    if (businessId) {
      fetchBusiness();
    }
  }, [businessId]);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.business) {
          setBusiness(data.business);
          calculateFees(data.business);
        }
      }
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFees = (businessData: { entityType?: string }) => {
    // Calculate base fees based on entity type
    let baseFee = 0;
    let annualReportFeePerYear = 0;

    if (businessData.entityType === 'LLC') {
      baseFee = 100;
      annualReportFeePerYear = 138.75;
    } else if (businessData.entityType === 'CORPORATION') {
      baseFee = 600;
      annualReportFeePerYear = 150;
    } else if (businessData.entityType === 'NONPROFIT_CORPORATION') {
      baseFee = 175;
      annualReportFeePerYear = 61.25;
    }

    // Calculate years revoked (simplified - would need actual revocation date)
    const filingYear = new Date(businessData.filingDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const yearsRevoked = Math.max(1, currentYear - filingYear);

    const totalAnnualReportFees = annualReportFeePerYear * yearsRevoked;
    const totalBaseFees = baseFee + totalAnnualReportFees;

    setFees({
      baseFee,
      annualReportFeePerYear,
      yearsRevoked,
      totalAnnualReportFees,
      totalBaseFees,
      addOns: {
        changeAgent: false,
        amendBusiness: false,
        einApplication: false,
        operatingAgreement: false
      },
      addOnFees: 0,
      grandTotal: totalBaseFees
    });
  };

  const toggleAddOn = (addOn: keyof ReinstatementFees['addOns']) => {
    const addOnPrices = {
      changeAgent: 25,
      amendBusiness: 25,
      einApplication: 99,
      operatingAgreement: 149
    };

    const newAddOns = {
      ...fees.addOns,
      [addOn]: !fees.addOns[addOn]
    };

    const addOnFees = Object.entries(newAddOns).reduce((total, [key, value]) => {
      if (value) {
        return total + addOnPrices[key as keyof typeof addOnPrices];
      }
      return total;
    }, 0);

    setFees({
      ...fees,
      addOns: newAddOns,
      addOnFees,
      grandTotal: fees.totalBaseFees + addOnFees
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Business Not Found</h1>
        <Link href="/dashboard/businesses" style={{ color: '#0ea5e9', textDecoration: 'underline' }}>
          Return to My Businesses
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
            Reinstate Your Business
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6' }}>
            Get {business.legalName} back in good standing with the State of Florida
          </p>
        </div>

        {/* Business Info Card */}
        <div
          className="bg-white rounded-xl"
          style={{
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', marginBottom: '20px' }}>
            Business Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Legal Name</p>
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>{business.legalName}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Entity Type</p>
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>{formatEntityType(business.entityType)}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Document Number</p>
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>{business.documentNumber}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Years Revoked</p>
              <p style={{ fontSize: '15px', color: '#dc2626', fontWeight: '600' }}>{fees.yearsRevoked} year{fees.yearsRevoked !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Fee Breakdown Card */}
        <div
          className="bg-white rounded-xl"
          style={{
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', marginBottom: '20px' }}>
            Reinstatement Fee Breakdown
          </h2>

          {/* Base Fees */}
          <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px', color: '#475569' }}>Base Reinstatement Fee</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>${fees.baseFee.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '16px', color: '#475569' }}>
                Annual Reports ({fees.yearsRevoked} year{fees.yearsRevoked !== 1 ? 's' : ''} × ${fees.annualReportFeePerYear})
              </span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>${fees.totalAnnualReportFees.toFixed(2)}</span>
            </div>
          </div>

          {/* Add-On Services */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
              Optional Add-On Services
            </h3>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px', 
              background: fees.addOns.changeAgent ? '#eff6ff' : '#f8fafc',
              border: fees.addOns.changeAgent ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
              borderRadius: '8px',
              marginBottom: '12px',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={fees.addOns.changeAgent}
                onChange={() => toggleAddOn('changeAgent')}
                style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#0f172a' }}>Change Registered Agent</p>
                <p style={{ fontSize: '14px', color: '#64748b' }}>Update your registered agent information</p>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>+$25.00</span>
            </label>

            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px', 
              background: fees.addOns.amendBusiness ? '#eff6ff' : '#f8fafc',
              border: fees.addOns.amendBusiness ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
              borderRadius: '8px',
              marginBottom: '12px',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={fees.addOns.amendBusiness}
                onChange={() => toggleAddOn('amendBusiness')}
                style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#0f172a' }}>Amend Business Information</p>
                <p style={{ fontSize: '14px', color: '#64748b' }}>Update name, purpose, or management structure</p>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>+$25.00</span>
            </label>

            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px', 
              background: fees.addOns.einApplication ? '#eff6ff' : '#f8fafc',
              border: fees.addOns.einApplication ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
              borderRadius: '8px',
              marginBottom: '12px',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={fees.addOns.einApplication}
                onChange={() => toggleAddOn('einApplication')}
                style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#0f172a' }}>Apply for New EIN</p>
                <p style={{ fontSize: '14px', color: '#64748b' }}>Get a new Federal Tax ID number</p>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>+$99.00</span>
            </label>

            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px', 
              background: fees.addOns.operatingAgreement ? '#eff6ff' : '#f8fafc',
              border: fees.addOns.operatingAgreement ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={fees.addOns.operatingAgreement}
                onChange={() => toggleAddOn('operatingAgreement')}
                style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#0f172a' }}>
                  {business.entityType === 'LLC' ? 'Operating Agreement' : 'Corporate Bylaws'}
                </p>
                <p style={{ fontSize: '14px', color: '#64748b' }}>Updated governing documents for your business</p>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>+$149.00</span>
            </label>
          </div>

          {/* Total */}
          <div
            className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl"
            style={{
              padding: '24px',
              border: '2px solid #0ea5e9',
              borderLeft: '4px solid #0ea5e9',
              marginTop: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Due Today</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>${fees.grandTotal.toFixed(2)}</p>
              </div>
              <button
                onClick={() => {
                  // TODO: Navigate to checkout with reinstatement package
                  alert('Proceeding to checkout...');
                }}
                className="relative overflow-hidden"
                style={{
                  fontSize: '16px',
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                  boxShadow: '0 6px 16px -2px rgba(14, 165, 233, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 200ms'
                }}
              >
                {/* Glass highlight effect */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%)',
                    transform: 'translateY(-30%)',
                  }}
                />
                <span className="relative">Proceed to Checkout →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            href={`/dashboard/businesses/${businessId}`}
            style={{ color: '#64748b', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}
            className="hover:text-sky-600 transition-colors"
          >
            ← Back to Business Details
          </Link>
        </div>
      </div>
    </div>
  );
}

