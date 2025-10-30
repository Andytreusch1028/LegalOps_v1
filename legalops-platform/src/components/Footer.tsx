/**
 * LegalOps v1 - Footer Component with UPL Disclaimer
 * 
 * CRITICAL: This footer appears on EVERY page and contains required UPL disclaimers
 * for legal compliance in Florida.
 * 
 * DO NOT remove or modify disclaimer language without consulting an attorney.
 */

'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white mt-auto">
      {/* UPL Disclaimer Banner - CRITICAL */}
      <div className="bg-amber-600 text-slate-900 py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-center">
            <span className="text-lg">⚖️</span>
            <p>
              <strong>IMPORTANT:</strong> LegalOps is not a law firm and does not provide legal advice. 
              We provide document preparation services only. For legal advice, consult a licensed attorney.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">LegalOps</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Professional document preparation services for Florida businesses.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/services/llc-formation" className="hover:text-white transition-colors">
                  LLC Formation
                </Link>
              </li>
              <li>
                <Link href="/services/corp-formation" className="hover:text-white transition-colors">
                  Corporation Formation
                </Link>
              </li>
              <li>
                <Link href="/services/annual-report" className="hover:text-white transition-colors">
                  Annual Reports
                </Link>
              </li>
              <li>
                <Link href="/services/registered-agent" className="hover:text-white transition-colors">
                  Registered Agent
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/legal/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Email: support@legalops.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Detailed Disclaimer Section */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h4 className="font-semibold mb-3 text-amber-400">Legal Disclaimer</h4>
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>
                <strong>LegalOps is not a law firm.</strong> We do not provide legal advice, 
                recommendations, mediation, or counseling. We provide self-help document preparation 
                services at your specific direction.
              </p>
              <p>
                <strong>No attorney-client relationship.</strong> Use of our services does not create 
                an attorney-client relationship between you and LegalOps or any of our employees or 
                contractors. Communications between you and LegalOps are not protected by attorney-client 
                privilege.
              </p>
              <p>
                <strong>We are not a substitute for an attorney.</strong> We strongly recommend that 
                you consult with a licensed attorney before making any legal decisions. We cannot advise 
                you on which services to purchase, what information to provide, or the legal consequences 
                of your decisions.
              </p>
              <p>
                <strong>Document preparation only.</strong> We prepare documents based solely on the 
                information you provide. We do not customize legal provisions, interpret laws, or make 
                legal judgments on your behalf.
              </p>
              <p>
                <strong>No guarantees.</strong> We make no guarantees regarding the suitability of our 
                services for your specific needs, the legal sufficiency of documents we prepare, or the 
                acceptance of filings by government agencies.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-slate-500">
            <p>
              © {currentYear} LegalOps. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

