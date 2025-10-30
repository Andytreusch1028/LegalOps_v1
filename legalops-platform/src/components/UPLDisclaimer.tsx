/**
 * LegalOps v1 - UPL Disclaimer Component
 * 
 * CRITICAL: This component displays UPL (Unauthorized Practice of Law) disclaimers
 * on form pages and service pages for legal compliance.
 * 
 * DO NOT modify disclaimer language without consulting an attorney.
 */

'use client';

import Link from 'next/link';

interface UPLDisclaimerProps {
  variant?: 'form' | 'service' | 'document' | 'minimal';
  className?: string;
}

export default function UPLDisclaimer({ variant = 'form', className = '' }: UPLDisclaimerProps) {
  
  // Minimal version - for pages where space is limited
  if (variant === 'minimal') {
    return (
      <div className={`bg-amber-50 border border-amber-300 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-2">
          <span className="text-lg">⚖️</span>
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">
              LegalOps is not a law firm and does not provide legal advice.
            </p>
            <p>
              We provide document preparation services only. For legal advice, consult a licensed attorney.{' '}
              <Link href="/legal/terms-of-service" className="underline hover:text-amber-700">
                Learn more
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Form version - for formation wizards and data collection forms
  if (variant === 'form') {
    return (
      <div className={`bg-blue-50 border-2 border-blue-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="text-3xl">⚖️</div>
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-3">
              Important Legal Notice
            </h3>
            <div className="text-sm text-blue-800 space-y-2 leading-relaxed">
              <p className="font-semibold">
                LegalOps is not a law firm and does not provide legal advice.
              </p>
              <p>
                We provide self-help document preparation services at your specific direction. 
                We prepare documents based on the information you provide and do not make legal 
                judgments on your behalf.
              </p>
              <p>
                <strong>We cannot advise you on:</strong>
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Which business entity type to choose</li>
                <li>What information to provide in forms</li>
                <li>The legal or tax consequences of your decisions</li>
                <li>Whether our services are suitable for your needs</li>
              </ul>
              <p className="font-semibold mt-3">
                We strongly recommend consulting a licensed attorney before making any legal decisions.
              </p>
              <p className="text-xs mt-3">
                <Link href="/legal/terms-of-service" className="underline hover:text-blue-600">
                  View complete Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Service version - for service catalog pages
  if (variant === 'service') {
    return (
      <div className={`bg-slate-50 border border-slate-300 rounded-lg p-5 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚖️</div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Document Preparation Service
            </h3>
            <div className="text-sm text-slate-700 space-y-2 leading-relaxed">
              <p>
                LegalOps is not a law firm. We provide document preparation services only and do not 
                provide legal advice or recommendations.
              </p>
              <p>
                Use of our services does not create an attorney-client relationship. For legal advice, 
                consult a licensed attorney.
              </p>
              <p className="text-xs mt-2">
                <Link href="/legal/terms-of-service" className="underline hover:text-slate-600">
                  View Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Document version - for template documents (Operating Agreement, Bylaws, etc.)
  if (variant === 'document') {
    return (
      <div className={`bg-red-50 border-2 border-red-300 rounded-lg p-6 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="text-3xl">⚠️</div>
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-3">
              CRITICAL: Attorney Review Recommended
            </h3>
            <div className="text-sm text-red-800 space-y-2 leading-relaxed">
              <p className="font-semibold">
                This is a standardized template document. It may not be suitable for your specific situation.
              </p>
              <p>
                <strong>LegalOps is not a law firm.</strong> We do not:
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Customize legal provisions for your situation</li>
                <li>Provide advice about which terms to include</li>
                <li>Interpret the legal meaning of provisions</li>
                <li>Advise on the legal or tax consequences</li>
              </ul>
              <p className="font-semibold mt-3 text-red-900">
                ⚠️ We STRONGLY RECOMMEND having a licensed attorney review this document before you sign it.
              </p>
              <p className="mt-3">
                An attorney can:
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Customize provisions for your specific needs</li>
                <li>Explain legal and tax implications</li>
                <li>Ensure the document protects your interests</li>
                <li>Advise on compliance with applicable laws</li>
              </ul>
              <p className="text-xs mt-3">
                <Link href="/legal/terms-of-service" className="underline hover:text-red-600">
                  View complete Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

