/**
 * LegalOps v1 - Privacy Policy Page
 * 
 * CRITICAL: This page is required for GDPR, CCPA, and Florida law compliance.
 * 
 * DO NOT modify without consulting an attorney.
 */

'use client';

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 30, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-600">Last Updated: {lastUpdated}</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                LegalOps ("we," "us," or "our") is committed to protecting your privacy. This Privacy 
                Policy explains how we collect, use, disclose, and safeguard your information when you 
                use our services.
              </p>
              <p className="font-semibold">
                Please read this Privacy Policy carefully. By using our services, you agree to the 
                collection and use of information in accordance with this policy.
              </p>
            </div>
          </section>

          {/* 1. Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p className="font-semibold text-slate-900">
                1.1 Personal Information
              </p>
              <p>
                We collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Create an account</li>
                <li>Purchase our services</li>
                <li>Complete forms or wizards</li>
                <li>Contact customer support</li>
                <li>Subscribe to newsletters or communications</li>
              </ul>
              <p className="mt-3">
                This information may include:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Name, email address, phone number</li>
                <li>Mailing address</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Business information (business name, address, ownership details)</li>
                <li>Government identification numbers (EIN, SSN for business purposes)</li>
              </ul>

              <p className="font-semibold text-slate-900 mt-4">
                1.2 Automatically Collected Information
              </p>
              <p>
                When you access our services, we automatically collect certain information, including:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <p className="font-semibold text-slate-900 mt-4">
                1.3 Information from Third Parties
              </p>
              <p>
                We may receive information from third parties, including:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Payment processors (Stripe)</li>
                <li>Address validation services (USPS)</li>
                <li>Government agencies (Florida Department of State)</li>
              </ul>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Provide, operate, and maintain our services</li>
                <li>Process your orders and payments</li>
                <li>Prepare and file documents on your behalf</li>
                <li>Serve as your registered agent (if purchased)</li>
                <li>Communicate with you about your orders and services</li>
                <li>Send you important notices and updates</li>
                <li>Provide customer support</li>
                <li>Improve our services and develop new features</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </div>
          </section>

          {/* 3. How We Share Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Share Your Information</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                We may share your information with:
              </p>
              
              <p className="font-semibold text-slate-900 mt-3">
                3.1 Government Agencies
              </p>
              <p>
                We share information with government agencies as necessary to provide our services, 
                including the Florida Department of State for business filings.
              </p>

              <p className="font-semibold text-slate-900 mt-3">
                3.2 Service Providers
              </p>
              <p>
                We share information with third-party service providers who perform services on our behalf:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Payment processing (Stripe)</li>
                <li>Email delivery (Resend)</li>
                <li>SMS messaging (Twilio)</li>
                <li>Address validation (USPS)</li>
                <li>Cloud hosting and storage</li>
                <li>Analytics and performance monitoring</li>
              </ul>

              <p className="font-semibold text-slate-900 mt-3">
                3.3 Legal Requirements
              </p>
              <p>
                We may disclose your information if required by law or in response to:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Court orders or subpoenas</li>
                <li>Government investigations</li>
                <li>Legal processes</li>
                <li>Protection of our rights or safety</li>
              </ul>

              <p className="font-semibold text-slate-900 mt-3">
                3.4 Business Transfers
              </p>
              <p>
                If LegalOps is involved in a merger, acquisition, or sale of assets, your information 
                may be transferred as part of that transaction.
              </p>

              <p className="font-semibold text-slate-900 mt-3">
                3.5 With Your Consent
              </p>
              <p>
                We may share your information for other purposes with your explicit consent.
              </p>
            </div>
          </section>

          {/* 4. Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                We implement appropriate technical and organizational security measures to protect 
                your information, including:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure payment processing through PCI-compliant providers</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="mt-3 font-semibold text-amber-900">
                ⚠️ However, no method of transmission over the Internet or electronic storage is 100% 
                secure. We cannot guarantee absolute security of your information.
              </p>
            </div>
          </section>

          {/* 5. Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Retention</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                We retain your information for as long as necessary to:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations (minimum 7 years for business records)</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p className="mt-3">
                When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </div>
          </section>

          {/* 6. Your Privacy Rights */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Your Privacy Rights</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                Depending on your location, you may have the following rights:
              </p>

              <p className="font-semibold text-slate-900 mt-3">
                6.1 Access and Portability
              </p>
              <p>
                You have the right to request a copy of the personal information we hold about you.
              </p>

              <p className="font-semibold text-slate-900 mt-3">
                6.2 Correction
              </p>
              <p>
                You have the right to request correction of inaccurate or incomplete information.
              </p>

              <p className="font-semibold text-slate-900 mt-3">
                6.3 Deletion
              </p>
              <p>
                You have the right to request deletion of your personal information, subject to legal 
                retention requirements.
              </p>

              <p className="font-semibold text-slate-900 mt-3">
                6.4 Opt-Out of Marketing
              </p>
              <p>
                You can opt out of marketing emails by clicking "unsubscribe" in any marketing email 
                or by contacting us.
              </p>

              <p className="font-semibold text-slate-900 mt-3">
                6.5 California Residents (CCPA)
              </p>
              <p>
                California residents have additional rights under the California Consumer Privacy Act, 
                including the right to know what personal information is collected and the right to 
                opt out of sale of personal information (we do not sell personal information).
              </p>

              <p className="font-semibold text-slate-900 mt-3">
                6.6 European Residents (GDPR)
              </p>
              <p>
                European residents have additional rights under the General Data Protection Regulation, 
                including the right to object to processing and the right to data portability.
              </p>

              <p className="mt-4">
                To exercise any of these rights, please contact us at privacy@legalops.com.
              </p>
            </div>
          </section>

          {/* 7. Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies and Tracking Technologies</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Maintain your session and keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Analyze usage and improve our services</li>
                <li>Provide personalized content</li>
              </ul>
              <p className="mt-3">
                You can control cookies through your browser settings. However, disabling cookies may 
                limit your ability to use certain features of our services.
              </p>
            </div>
          </section>

          {/* 8. Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Children's Privacy</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                Our services are not intended for individuals under the age of 18. We do not knowingly 
                collect personal information from children. If you believe we have collected information 
                from a child, please contact us immediately.
              </p>
            </div>
          </section>

          {/* 9. Changes to This Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Changes to This Privacy Policy</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes 
                are effective when posted on this page.
              </p>
            </div>
          </section>

          {/* 10. Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Contact Us</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <p className="font-semibold">
                LegalOps<br />
                Email: privacy@legalops.com<br />
                Phone: (555) 123-4567<br />
                Address: [Your Business Address]
              </p>
            </div>
          </section>

        </div>

        {/* Bottom Notice */}
        <div className="bg-slate-100 rounded-lg p-6 mt-6 text-center">
          <p className="text-sm text-slate-600">
            By using LegalOps services, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

