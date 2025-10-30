/**
 * LegalOps v1 - Terms of Service Page
 * 
 * CRITICAL: This page contains comprehensive UPL (Unauthorized Practice of Law) 
 * protection disclaimers required for legal compliance in Florida.
 * 
 * DO NOT modify disclaimer language without consulting an attorney.
 */

'use client';

export default function TermsOfServicePage() {
  const lastUpdated = "October 30, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-600">Last Updated: {lastUpdated}</p>
        </div>

        {/* Critical UPL Disclaimer - Prominent Display */}
        <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">⚖️</div>
            <div>
              <h2 className="text-xl font-bold text-amber-900 mb-3">
                IMPORTANT LEGAL NOTICE - PLEASE READ CAREFULLY
              </h2>
              <div className="text-amber-900 space-y-2 text-sm leading-relaxed">
                <p className="font-semibold">
                  LEGALOPS IS NOT A LAW FIRM AND DOES NOT PROVIDE LEGAL ADVICE.
                </p>
                <p>
                  We provide self-help document preparation services at your specific direction. 
                  We are not a substitute for the advice of an attorney.
                </p>
                <p>
                  Use of our services does not create an attorney-client relationship between 
                  you and LegalOps or any of our employees or contractors.
                </p>
                <p className="font-semibold">
                  For legal advice, please consult a licensed attorney in your jurisdiction.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Terms Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                By accessing or using LegalOps services, you agree to be bound by these Terms of Service 
                and all applicable laws and regulations. If you do not agree with any of these terms, 
                you are prohibited from using our services.
              </p>
            </div>
          </section>

          {/* 2. Nature of Services - CRITICAL UPL PROTECTION */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Nature of Our Services</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p className="font-semibold text-slate-900">
                2.1 Document Preparation Services Only
              </p>
              <p>
                LegalOps provides self-help document preparation services. We prepare and file documents 
                based solely on the information you provide to us. We do not:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Provide legal advice or recommendations</li>
                <li>Make legal judgments on your behalf</li>
                <li>Interpret laws or regulations for your specific situation</li>
                <li>Recommend which legal documents or services you should purchase</li>
                <li>Advise you on the legal consequences of your decisions</li>
                <li>Represent you in any legal proceedings</li>
                <li>Act as your attorney or legal representative</li>
              </ul>

              <p className="font-semibold text-slate-900 mt-4">
                2.2 No Attorney-Client Relationship
              </p>
              <p>
                Use of our services does not create an attorney-client relationship. Communications 
                between you and LegalOps are not protected by attorney-client privilege. We are not 
                your attorney and you are not our client.
              </p>

              <p className="font-semibold text-slate-900 mt-4">
                2.3 You Are Responsible for Your Decisions
              </p>
              <p>
                You are solely responsible for all decisions regarding which services to purchase, 
                what information to provide, and how to use the documents we prepare. We cannot and 
                do not advise you on these matters.
              </p>

              <p className="font-semibold text-slate-900 mt-4">
                2.4 Recommendation to Consult an Attorney
              </p>
              <p>
                We strongly recommend that you consult with a licensed attorney before making any 
                legal decisions, including but not limited to:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Choosing a business entity type (LLC, Corporation, etc.)</li>
                <li>Deciding on business management structure</li>
                <li>Determining ownership percentages</li>
                <li>Understanding tax implications of your choices</li>
                <li>Reviewing any legal documents before signing</li>
                <li>Making changes to your business structure</li>
                <li>Dissolving your business</li>
              </ul>
            </div>
          </section>

          {/* 3. Scope of Services */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Scope of Services</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p className="font-semibold text-slate-900">
                3.1 What We Do
              </p>
              <p>
                LegalOps provides the following services:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Prepare business formation documents based on information you provide</li>
                <li>File documents with the Florida Department of State on your behalf</li>
                <li>Serve as registered agent for service of process (if purchased)</li>
                <li>Prepare standardized template documents (Operating Agreements, Bylaws, etc.)</li>
                <li>Prepare and file annual reports based on information you provide</li>
                <li>Prepare amendment documents based on your instructions</li>
              </ul>

              <p className="font-semibold text-slate-900 mt-4">
                3.2 What We Do NOT Do
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Provide legal advice or recommendations</li>
                <li>Customize legal documents based on your specific situation</li>
                <li>Interpret laws or regulations</li>
                <li>Advise on tax implications</li>
                <li>Represent you in legal matters</li>
                <li>Guarantee that our services are suitable for your needs</li>
              </ul>

              <p className="font-semibold text-slate-900 mt-4">
                3.3 Standardized Templates Only
              </p>
              <p>
                All template documents (Operating Agreements, Bylaws, etc.) are standardized forms. 
                We do not customize legal provisions or advise which provisions to include. These 
                templates may not be suitable for your specific situation. You should have an attorney 
                review any legal document before signing it.
              </p>
            </div>
          </section>

          {/* 4. Registered Agent Services */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Registered Agent Services</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                If you purchase registered agent services, we will receive legal documents and 
                service of process on behalf of your business and forward them to you. We do not:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Interpret or explain legal documents we receive</li>
                <li>Advise you on how to respond to legal documents</li>
                <li>Represent you in any legal proceedings</li>
              </ul>
              <p className="font-semibold text-amber-900 mt-3">
                ⚠️ IMPORTANT: If you receive legal documents through our registered agent service, 
                consult an attorney immediately. Legal documents often have strict deadlines.
              </p>
            </div>
          </section>

          {/* 5. Right to Refuse Service */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Right to Refuse Service</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                LegalOps reserves the right to refuse service to any customer at our sole discretion. 
                We may decline to process your order for any reason, including but not limited to:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Inability to verify identity or payment information</li>
                <li>Compliance with fraud prevention policies</li>
                <li>Inability to verify business information</li>
                <li>Suspicious or unusual order patterns</li>
                <li>Previous payment disputes or chargebacks</li>
                <li>Any other reason deemed necessary for business protection</li>
              </ul>
              <p className="mt-3">
                If your order is declined, you will be notified immediately and any payment 
                authorization will be voided. No charges will be processed for declined orders.
              </p>
            </div>
          </section>

          {/* 6. Accuracy of Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Accuracy of Information</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                You are solely responsible for the accuracy and completeness of all information 
                you provide to us. We prepare documents based on the information you provide and 
                do not verify its accuracy. Errors in the information you provide may result in:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Rejection of filings by government agencies</li>
                <li>Additional fees for corrections or re-filings</li>
                <li>Legal or tax consequences</li>
              </ul>
              <p className="mt-3">
                LegalOps is not responsible for any consequences resulting from inaccurate or 
                incomplete information you provide.
              </p>
            </div>
          </section>

          {/* 7. No Guarantees */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. No Guarantees or Warranties</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                LegalOps makes no guarantees or warranties regarding:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>The suitability of our services for your specific needs</li>
                <li>The legal sufficiency of documents we prepare</li>
                <li>The acceptance of filings by government agencies</li>
                <li>The legal or tax consequences of using our services</li>
                <li>The completeness or accuracy of information we provide</li>
              </ul>
              <p className="mt-3 font-semibold">
                ALL SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.
              </p>
            </div>
          </section>

          {/* 8. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Limitation of Liability</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                To the maximum extent permitted by law, LegalOps shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages, or any loss 
                of profits or revenues, whether incurred directly or indirectly, or any loss of 
                data, use, goodwill, or other intangible losses resulting from:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Your use or inability to use our services</li>
                <li>Any errors or omissions in documents we prepare</li>
                <li>Rejection of filings by government agencies</li>
                <li>Legal or tax consequences of your decisions</li>
              </ul>
              <p className="mt-3">
                Our total liability to you for any claim arising from our services shall not 
                exceed the amount you paid for the specific service giving rise to the claim.
              </p>
            </div>
          </section>

          {/* 9. Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Governing Law</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                These Terms of Service shall be governed by and construed in accordance with the 
                laws of the State of Florida, without regard to its conflict of law provisions.
              </p>
            </div>
          </section>

          {/* 10. Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Contact Information</h2>
            <div className="text-slate-700 space-y-3 leading-relaxed">
              <p>
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p className="font-semibold">
                LegalOps<br />
                Email: support@legalops.com<br />
                Phone: (555) 123-4567
              </p>
            </div>
          </section>

        </div>

        {/* Bottom Disclaimer */}
        <div className="bg-slate-100 rounded-lg p-6 mt-6 text-center">
          <p className="text-sm text-slate-600">
            By using LegalOps services, you acknowledge that you have read, understood, and agree 
            to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}

