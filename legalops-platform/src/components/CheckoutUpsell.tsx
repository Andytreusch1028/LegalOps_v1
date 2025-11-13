'use client';

import { useState, useEffect } from 'react';
import { Shield, Check } from 'lucide-react';

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

interface CheckoutUpsellProps {
  currentPackage: Package | null; // null = individual filing
  onUpgrade: (pkg: Package) => void;
  onContinue: () => void;
}

export default function CheckoutUpsell({ currentPackage, onUpgrade, onContinue }: CheckoutUpsellProps) {
  const [standardPackage, setStandardPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Standard package for comparison
  useEffect(() => {
    const fetchStandardPackage = async () => {
      try {
        const response = await fetch('/api/packages');
        if (response.ok) {
          const packages = await response.json();
          const standard = packages.find((p: Package) => p.slug === 'standard');
          setStandardPackage(standard || null);
        }
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStandardPackage();
  }, []);

  // Only show upsell if user selected Basic package or individual filing
  if (!currentPackage || currentPackage.slug !== 'basic') {
    return null;
  }

  if (loading || !standardPackage) {
    return null;
  }

  const savings = 224 - standardPackage.price; // $125 RA + $99 Operating Agreement = $224 value

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
    }}>
      <div className="max-w-2xl w-full rounded-3xl overflow-hidden" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      }}>
        {/* Header */}
        <div className="text-center" style={{ padding: '40px 40px 32px 40px' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
          }}>
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Florida Requires a Registered Agent
          </h2>

          <p className="text-lg text-slate-600" style={{ lineHeight: '1.7' }}>
            Let LegalOps handle this requirement for you—professionally and affordably.
          </p>
        </div>

        {/* Benefits */}
        <div style={{ padding: '0 40px 32px 40px' }}>
          <div className="rounded-2xl" style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '28px',
          }}>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                }}>
                  <Check className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Privacy Protection</p>
                  <p className="text-sm text-slate-600">Use our address instead of your home</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                }}>
                  <Check className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Never Miss Legal Documents</p>
                  <p className="text-sm text-slate-600">We receive and forward all official notices</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                }}>
                  <Check className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Professional Business Image</p>
                  <p className="text-sm text-slate-600">No process servers at your door</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                }}>
                  <Check className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Compliance Peace of Mind</p>
                  <p className="text-sm text-slate-600">Stay compliant with Florida law automatically</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="text-center pt-6" style={{
              borderTop: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <div className="mb-2">
                <span className="text-4xl font-bold text-emerald-600">$149</span>
                <span className="text-slate-600 ml-2">+ state fees</span>
              </div>
              <p className="text-sm text-slate-600 mb-1">
                Includes first year FREE ($125 value)
              </p>
              <p className="text-xs text-slate-500">
                Plus Operating Agreement ($99 value) • Total value: $224
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '0 40px 40px 40px' }}>
          <button
            onClick={() => onUpgrade(standardPackage)}
            className="w-full rounded-xl font-semibold text-white text-lg transition-all mb-3"
            style={{
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            Add Registered Agent Service
          </button>

          <button
            onClick={onContinue}
            className="w-full text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors"
            style={{ padding: '12px' }}
          >
            No thanks, I'll provide my own
          </button>

          <p className="text-xs text-center text-slate-500 mt-4">
            95% of customers choose LegalOps as their registered agent
          </p>
        </div>
      </div>
    </div>
  );
}

