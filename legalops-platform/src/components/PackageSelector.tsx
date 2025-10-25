'use client';

import { useState, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';

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

interface PackageSelectorProps {
  onSelectPackage: (packageData: Package | null) => void;
  selectedPackageId?: string | null;
}

export default function PackageSelector({ onSelectPackage, selectedPackageId }: PackageSelectorProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'package' | 'individual'>('package');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages');
        if (response.ok) {
          const data = await response.json();
          setPackages(data);
        }
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePackageSelect = (pkg: Package) => {
    onSelectPackage(pkg);
  };

  const handleIndividualSelect = () => {
    setSelectedMode('individual');
    onSelectPackage(null);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Loading packages...</p>
      </div>
    );
  }

  const getColorStyles = (color: string | null) => {
    switch (color) {
      case 'emerald':
        return {
          borderColor: '#6ee7b7',
          cardBg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          badgeBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          buttonBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          buttonBorder: '#059669',
          buttonShadow: '0 4px 14px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        };
      case 'purple':
        return {
          borderColor: '#c4b5fd',
          cardBg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
          badgeBg: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
          buttonBg: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
          buttonBorder: '#9333ea',
          buttonShadow: '0 4px 14px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        };
      default:
        return {
          borderColor: '#7dd3fc',
          cardBg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          badgeBg: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          buttonBg: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          buttonBorder: '#0284c7',
          buttonShadow: '0 4px 14px rgba(14, 165, 233, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        };
    }
  };

  return (
    <div style={{ marginBottom: '64px' }}>
      {/* Mode Toggle */}
      <div className="text-center" style={{ marginBottom: '48px' }}>
        <h2 className="text-3xl font-bold text-slate-900" style={{ marginBottom: '16px' }}>Choose Your Package</h2>
        <p className="text-slate-600" style={{ marginBottom: '32px', fontSize: '16px' }}>Select a package for the best value, or choose individual filing</p>

        <div
          className="inline-flex rounded-xl p-1.5"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '2px solid #e2e8f0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <button
            onClick={() => setSelectedMode('package')}
            className="px-8 py-3 rounded-lg font-semibold transition-all duration-200"
            style={
              selectedMode === 'package'
                ? {
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    color: 'white',
                    border: '2px solid #0284c7',
                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  }
                : {
                    background: 'transparent',
                    color: '#64748b',
                    border: '2px solid transparent',
                  }
            }
          >
            📦 Packages (Best Value)
          </button>
          <button
            onClick={handleIndividualSelect}
            className="px-8 py-3 rounded-lg font-semibold transition-all duration-200 ml-2"
            style={
              selectedMode === 'individual'
                ? {
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    color: 'white',
                    border: '2px solid #0284c7',
                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  }
                : {
                    background: 'transparent',
                    color: '#64748b',
                    border: '2px solid transparent',
                  }
            }
          >
            📄 Individual Filing
          </button>
        </div>
      </div>

      {/* Package Cards */}
      {selectedMode === 'package' && (
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '32px', marginTop: '48px' }}>
          {packages.map((pkg) => {
            const colors = getColorStyles(pkg.highlightColor);
            const isSelected = selectedPackageId === pkg.id;
            const isMostPopular = pkg.badge === 'Most Popular';

            return (
              <div
                key={pkg.id}
                className={`relative rounded-xl cursor-pointer ${isMostPopular ? 'md:scale-105 hover:md:scale-110' : 'hover:scale-105'}`}
                style={{
                  background: isSelected ? colors.cardBg : 'white',
                  border: isSelected ? `4px solid ${colors.borderColor}` : '3px solid #e2e8f0',
                  boxShadow: isSelected
                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    : '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
                  padding: '40px 32px 32px',
                  marginTop: '24px',
                  transition: 'all 0.2s ease-in-out',
                }}
                onClick={() => handlePackageSelect(pkg)}
              >
                {/* Badge */}
                {pkg.badge && (
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 text-white rounded-full font-bold"
                    style={{
                      background: colors.badgeBg,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      top: '-14px',
                      padding: '8px 20px',
                      fontSize: '14px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {pkg.badge}
                  </div>
                )}

                {/* Package Name & Price */}
                <div className="text-center" style={{ marginBottom: '32px' }}>
                  <h3 className="text-2xl font-bold text-slate-900" style={{ marginBottom: '12px' }}>{pkg.name}</h3>
                  <div style={{ marginBottom: '16px' }}>
                    <span className="text-5xl font-bold text-slate-900">${pkg.price}</span>
                    <span className="text-slate-600" style={{ marginLeft: '8px', fontSize: '15px' }}>+ state fees</span>
                  </div>
                  <p className="text-slate-600" style={{ fontSize: '14px', lineHeight: '1.5' }}>{pkg.description}</p>
                </div>

                {/* Features */}
                <ul style={{ marginBottom: '32px' }}>
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2" style={{ marginBottom: '12px' }}>
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700" style={{ fontSize: '14px', lineHeight: '1.5' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* AI Badge */}
                {pkg.includesAI && (
                  <div
                    className="rounded-lg"
                    style={{
                      marginBottom: '24px',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                      border: '2px solid #c4b5fd',
                    }}
                  >
                    <div className="flex items-center gap-2 text-purple-700">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-semibold">AI-Powered Features Included</span>
                    </div>
                  </div>
                )}

                {/* Select Button */}
                <button
                  onClick={() => handlePackageSelect(pkg)}
                  className="w-full rounded-xl font-bold text-white transition-all duration-200 hover:scale-105"
                  style={{
                    background: colors.buttonBg,
                    border: `3px solid ${colors.buttonBorder}`,
                    boxShadow: colors.buttonShadow,
                    padding: '16px 24px',
                    fontSize: '16px',
                  }}
                >
                  {isSelected ? '✓ Selected' : 'Select Package'}
                </button>

                {/* Savings Badge for non-Basic packages */}
                {pkg.price > 0 && (
                  <p className="text-center text-emerald-600 font-semibold" style={{ marginTop: '16px', fontSize: '14px' }}>
                    Save ${pkg.includesRA ? 199 - pkg.price : 50}+ vs individual services
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Individual Filing Message */}
      {selectedMode === 'individual' && (
        <div
          className="max-w-2xl mx-auto text-center rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '3px solid #e2e8f0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '48px 40px',
            marginTop: '48px',
          }}
        >
          <h3 className="text-2xl font-bold text-slate-900" style={{ marginBottom: '20px' }}>Individual Filing Selected</h3>
          <p className="text-slate-600" style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '28px' }}>
            You've chosen to file individually. You'll be able to add additional services at checkout.
          </p>
          <div
            className="inline-flex items-center rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '2px solid #7dd3fc',
              padding: '14px 24px',
              gap: '8px',
            }}
          >
            <span className="font-semibold text-sky-700" style={{ fontSize: '14px' }}>💡 Tip: Packages save you money on bundled services!</span>
          </div>
        </div>
      )}
    </div>
  );
}

