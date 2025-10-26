'use client';

import { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, Shield, Clock, FileText } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-4 border-amber-400 p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            <h2 className="text-3xl font-bold text-slate-900">Wait! Important Legal Requirement</h2>
          </div>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            Florida law <strong>REQUIRES</strong> every LLC to have a Registered Agent. 
            You're about to proceed without one. Let us help you stay compliant!
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Basic Package - Current Selection */}
            <div className="relative rounded-xl border-3 border-slate-300 bg-slate-50 p-6">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                Your Current Selection
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mt-4 mb-2">Basic Package</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">
                $0 <span className="text-lg font-normal text-slate-600">+ state fees</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">LLC formation filing</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Digital documents</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Email support</span>
                </div>
              </div>

              {/* What's Missing */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                  <X className="w-5 h-5" />
                  What You're Missing:
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-800"><strong>NO Registered Agent</strong> (required by law!)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-800">Your home address becomes public</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-800">NO Operating Agreement ($99 value)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-800">NO compliance reminders</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onContinue}
                className="w-full py-3 px-6 rounded-lg border-2 border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all"
              >
                Continue with Basic
              </button>
            </div>

            {/* Standard Package - Recommended */}
            <div className="relative rounded-xl border-4 border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 p-6" style={{
              boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.3), 0 10px 10px -5px rgba(16, 185, 129, 0.2)',
            }}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                ⭐ RECOMMENDED - SAVE ${savings}!
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mt-4 mb-2">Standard Package</h3>
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                $149 <span className="text-lg font-normal text-slate-600">+ state fees</span>
              </div>
              <div className="text-sm text-slate-600 mb-4">
                <span className="line-through">$224 value</span> - Save ${savings}!
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Everything in Basic</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>FREE 1st Year Registered Agent</strong> ($125 value)</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Operating Agreement</strong> ($99 value)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Compliance calendar & reminders</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Priority support</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Document storage</span>
                </div>
              </div>

              {/* Benefits Callout */}
              <div className="bg-white border-2 border-emerald-200 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-emerald-900 mb-2">✅ Why Upgrade?</h4>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>• <strong>Stay compliant</strong> with Florida law</li>
                  <li>• <strong>Protect your privacy</strong> - use our address</li>
                  <li>• <strong>Never miss</strong> important legal documents</li>
                  <li>• <strong>Save money</strong> - $224 value for just $149</li>
                </ul>
              </div>

              <button
                onClick={() => onUpgrade(standardPackage)}
                className="w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                }}
              >
                Upgrade to Standard - Save ${savings}!
              </button>

              <p className="text-xs text-center text-slate-600 mt-3">
                RA service: FREE year 1, then $125/year (cancel anytime)
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <p className="text-slate-700 mb-2">
              <strong>95% of our customers choose Standard</strong> for the peace of mind and compliance protection.
            </p>
            <p className="text-sm text-slate-600">
              Don't risk legal issues or privacy concerns. Upgrade now and save ${savings}!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

