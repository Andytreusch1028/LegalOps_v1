'use client';

import { useState, useEffect } from 'react';
import { FileText, Building2, Hash } from 'lucide-react';

interface CertificateOfStatusData {
  // Purpose
  purpose: string;
  recipientName: string;
  
  // Number of copies
  numberOfCopies: number;
  
  // Delivery preference
  deliveryMethod: 'EMAIL' | 'MAIL';
  deliveryEmail?: string;
  deliveryAddress?: string;
}

interface CertificateOfStatusFormProps {
  initialData?: Partial<CertificateOfStatusData>;
  onChange: (data: CertificateOfStatusData) => void;
  preFilledBusinessName?: string;
}

export default function CertificateOfStatusForm({
  initialData,
  onChange,
  preFilledBusinessName,
}: CertificateOfStatusFormProps) {
  const [formData, setFormData] = useState<CertificateOfStatusData>({
    purpose: initialData?.purpose || '',
    recipientName: initialData?.recipientName || '',
    numberOfCopies: initialData?.numberOfCopies || 1,
    deliveryMethod: initialData?.deliveryMethod || 'EMAIL',
    deliveryEmail: initialData?.deliveryEmail || '',
    deliveryAddress: initialData?.deliveryAddress || '',
  });

  // Notify parent of changes
  useEffect(() => {
    onChange(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  return (
    <div>
      {/* Pre-filled Business Name Notice */}
      {preFilledBusinessName && (
        <div
          className="rounded-lg"
          style={{
            padding: '20px',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '2px solid #93c5fd',
          }}
        >
          <p className="text-blue-800 font-medium text-sm">
            <strong>Certificate of Status for:</strong> {preFilledBusinessName}
          </p>
          <p className="text-blue-700 text-xs mt-1">
            This certificate confirms your business is in good standing with the state
          </p>
        </div>
      )}

      {/* Purpose */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Certificate Purpose</h3>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose of Certificate *
          </label>
          <select
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            required
          >
            <option value="">Select purpose...</option>
            <option value="BANK_ACCOUNT">Opening bank account</option>
            <option value="LOAN_APPLICATION">Loan application</option>
            <option value="CONTRACT">Contract requirement</option>
            <option value="LICENSING">Business licensing</option>
            <option value="LEGAL_PROCEEDING">Legal proceeding</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Name/Institution *
          </label>
          <input
            type="text"
            value={formData.recipientName}
            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="e.g., First National Bank, ABC Law Firm"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Who will receive this certificate?
          </p>
        </div>
      </div>

      {/* Number of Copies */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Number of Copies</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certified Copies Needed *
          </label>
          <input
            type="number"
            value={formData.numberOfCopies}
            onChange={(e) => setFormData({ ...formData, numberOfCopies: parseInt(e.target.value) || 1 })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            min="1"
            max="10"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Each certified copy costs $5. Most customers need 1-2 copies.
          </p>
        </div>
      </div>

      {/* Delivery Method */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Delivery Method</h3>
        </div>

        <div className="grid grid-cols-1 gap-3" style={{ marginBottom: '20px' }}>
          <label
            className={`rounded-lg border-2 cursor-pointer transition-all ${
              formData.deliveryMethod === 'EMAIL'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 bg-white hover:border-purple-300'
            }`}
            style={{ padding: '16px 20px' }}
          >
            <input
              type="radio"
              name="deliveryMethod"
              value="EMAIL"
              checked={formData.deliveryMethod === 'EMAIL'}
              onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value as 'EMAIL' | 'MAIL' })}
              className="mr-3"
            />
            <span className="font-semibold text-gray-900">Email Delivery (Recommended)</span>
            <p className="text-sm text-gray-600 ml-6" style={{ marginTop: '4px' }}>
              Fastest delivery - receive PDF within 1-2 business days
            </p>
          </label>

          <label
            className={`rounded-lg border-2 cursor-pointer transition-all ${
              formData.deliveryMethod === 'MAIL'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 bg-white hover:border-purple-300'
            }`}
            style={{ padding: '16px 20px' }}
          >
            <input
              type="radio"
              name="deliveryMethod"
              value="MAIL"
              checked={formData.deliveryMethod === 'MAIL'}
              onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value as 'EMAIL' | 'MAIL' })}
              className="mr-3"
            />
            <span className="font-semibold text-gray-900">Mail Delivery</span>
            <p className="text-sm text-gray-600 ml-6" style={{ marginTop: '4px' }}>
              Physical certified copy - 5-7 business days
            </p>
          </label>
        </div>

        {formData.deliveryMethod === 'EMAIL' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.deliveryEmail}
              onChange={(e) => setFormData({ ...formData, deliveryEmail: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="your@email.com"
              required
            />
          </div>
        )}

        {formData.deliveryMethod === 'MAIL' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mailing Address *
            </label>
            <textarea
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              rows={3}
              placeholder="Street Address&#10;City, State ZIP"
              required
            />
          </div>
        )}
      </div>
    </div>
  );
}

