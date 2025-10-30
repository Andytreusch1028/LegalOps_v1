'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Building2, MapPin, Mail, User, Users, FileText } from 'lucide-react';

interface AnnualReportFormData {
  // Business Information
  fein?: string;
  
  // Principal Address
  principalStreet: string;
  principalCity: string;
  principalState: string;
  principalZip: string;
  
  // Mailing Address (optional)
  mailingIsDifferent: boolean;
  mailingStreet?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingZip?: string;
  
  // Registered Agent
  registeredAgentName: string;
  registeredAgentStreet: string;
  registeredAgentCity: string;
  registeredAgentState: string;
  registeredAgentZip: string;
  registeredAgentSignature: string;
  
  // Principals (Officers/Directors/Managers)
  principals: Array<{
    title: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  }>;
  
  // Certificate of Status (optional)
  requestCertificate: boolean;
  certificateEmail?: string;
}

interface AnnualReportFormProps {
  initialData?: Partial<AnnualReportFormData>;
  onChange: (data: AnnualReportFormData) => void;
  preFilledBusinessName?: string;
  preFilledEntityType?: 'LLC' | 'CORPORATION';
}

const defaultFormData: AnnualReportFormData = {
  fein: '',
  principalStreet: '',
  principalCity: '',
  principalState: 'FL',
  principalZip: '',
  mailingIsDifferent: false,
  mailingStreet: '',
  mailingCity: '',
  mailingState: 'FL',
  mailingZip: '',
  registeredAgentName: '',
  registeredAgentStreet: '',
  registeredAgentCity: '',
  registeredAgentState: 'FL',
  registeredAgentZip: '',
  registeredAgentSignature: '',
  principals: [
    {
      title: '',
      name: '',
      street: '',
      city: '',
      state: 'FL',
      zip: '',
    },
  ],
  requestCertificate: false,
  certificateEmail: '',
};

export default function AnnualReportForm({
  initialData,
  onChange,
  preFilledBusinessName,
  preFilledEntityType = 'LLC',
}: AnnualReportFormProps) {
  const [formData, setFormData] = useState<AnnualReportFormData>({
    ...defaultFormData,
    ...initialData,
  });

  // Memoize onChange to prevent infinite loops
  const handleChange = useCallback(onChange, []);

  // Notify parent of changes (but don't include onChange in dependencies)
  useEffect(() => {
    handleChange(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const addPrincipal = () => {
    setFormData({
      ...formData,
      principals: [
        ...formData.principals,
        {
          title: '',
          name: '',
          street: '',
          city: '',
          state: 'FL',
          zip: '',
        },
      ],
    });
  };

  const removePrincipal = (index: number) => {
    if (formData.principals.length > 1) {
      setFormData({
        ...formData,
        principals: formData.principals.filter((_, i) => i !== index),
      });
    }
  };

  const updatePrincipal = (index: number, field: string, value: string) => {
    const updatedPrincipals = [...formData.principals];
    updatedPrincipals[index] = {
      ...updatedPrincipals[index],
      [field]: value,
    };
    setFormData({ ...formData, principals: updatedPrincipals });
  };

  // Title options based on entity type
  const titleOptions = preFilledEntityType === 'LLC'
    ? ['Manager', 'Member', 'Managing Member', 'President', 'Vice President', 'Secretary', 'Treasurer']
    : ['President', 'Vice President', 'Secretary', 'Treasurer', 'Director', 'CEO', 'CFO', 'COO'];

  return (
    <div className="space-y-8">
      {/* Pre-filled Business Info Notice */}
      {preFilledBusinessName && (
        <div
          className="rounded-lg border-2 border-blue-200 bg-blue-50"
          style={{ padding: '16px 20px' }}
        >
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" style={{ marginTop: '2px' }} />
            <div>
              <p className="font-semibold text-blue-900">Annual Report for:</p>
              <p className="text-blue-800 mt-1">{preFilledBusinessName}</p>
              <p className="text-sm text-blue-700 mt-2">
                Review and update the information below. We've pre-filled what we have on file.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Federal EIN */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginTop: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Federal Employer Identification Number (FEIN)</h3>
        </div>
        <input
          type="text"
          placeholder="XX-XXXXXXX"
          value={formData.fein || ''}
          onChange={(e) => setFormData({ ...formData, fein: e.target.value })}
          className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          style={{ padding: '12px 16px' }}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter your 9-digit FEIN. Do not enter a Social Security Number.
        </p>
      </div>

      {/* Principal Address */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginTop: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Principal Place of Business</h3>
        </div>
        <div>
          <input
            type="text"
            placeholder="Street Address"
            value={formData.principalStreet}
            onChange={(e) => setFormData({ ...formData, principalStreet: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            style={{ padding: '12px 16px', marginBottom: '16px' }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="City"
              value={formData.principalCity}
              onChange={(e) => setFormData({ ...formData, principalCity: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              style={{ padding: '12px 16px' }}
            />
            <input
              type="text"
              placeholder="State"
              value={formData.principalState}
              onChange={(e) => setFormData({ ...formData, principalState: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              style={{ padding: '12px 16px' }}
            />
            <input
              type="text"
              placeholder="ZIP Code"
              value={formData.principalZip}
              onChange={(e) => setFormData({ ...formData, principalZip: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              style={{ padding: '12px 16px' }}
            />
          </div>
        </div>
      </div>

      {/* Mailing Address */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginTop: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Mailing Address</h3>
        </div>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.mailingIsDifferent}
            onChange={(e) => setFormData({ ...formData, mailingIsDifferent: e.target.checked })}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="text-gray-700">Mailing address is different from principal address</span>
        </label>

        {formData.mailingIsDifferent && (
          <div>
            <input
              type="text"
              placeholder="Street Address or P.O. Box"
              value={formData.mailingStreet || ''}
              onChange={(e) => setFormData({ ...formData, mailingStreet: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              style={{ padding: '12px 16px', marginBottom: '16px' }}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="City"
                value={formData.mailingCity || ''}
                onChange={(e) => setFormData({ ...formData, mailingCity: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                style={{ padding: '12px 16px' }}
              />
              <input
                type="text"
                placeholder="State"
                value={formData.mailingState || ''}
                onChange={(e) => setFormData({ ...formData, mailingState: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                style={{ padding: '12px 16px' }}
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={formData.mailingZip || ''}
                onChange={(e) => setFormData({ ...formData, mailingZip: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                style={{ padding: '12px 16px' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Registered Agent */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginTop: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Registered Agent</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          The registered agent must have a physical street address in Florida (no P.O. Box).
        </p>
        <div>
          <input
            type="text"
            placeholder="Registered Agent Name"
            value={formData.registeredAgentName}
            onChange={(e) => setFormData({ ...formData, registeredAgentName: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            style={{ padding: '12px 16px', marginBottom: '16px' }}
          />
          <input
            type="text"
            placeholder="Street Address (no P.O. Box)"
            value={formData.registeredAgentStreet}
            onChange={(e) => setFormData({ ...formData, registeredAgentStreet: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            style={{ padding: '12px 16px', marginBottom: '16px' }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="City"
              value={formData.registeredAgentCity}
              onChange={(e) => setFormData({ ...formData, registeredAgentCity: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              style={{ padding: '12px 16px' }}
            />
            <input
              type="text"
              placeholder="State"
              value={formData.registeredAgentState}
              onChange={(e) => setFormData({ ...formData, registeredAgentState: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              style={{ padding: '12px 16px' }}
            />
            <input
              type="text"
              placeholder="ZIP Code"
              value={formData.registeredAgentZip}
              onChange={(e) => setFormData({ ...formData, registeredAgentZip: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              style={{ padding: '12px 16px' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registered Agent Signature <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Type your name to sign electronically"
              value={formData.registeredAgentSignature}
              onChange={(e) => setFormData({ ...formData, registeredAgentSignature: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              style={{ padding: '12px 16px' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Electronic signatures have the same legal effect as original signatures per Florida Statute 15.16.
            </p>
          </div>
        </div>
      </div>

      {/* Principals */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginTop: '32px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">
              {preFilledEntityType === 'LLC' ? 'Managers/Members' : 'Officers/Directors'}
            </h3>
          </div>
          <button
            type="button"
            onClick={addPrincipal}
            className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
          >
            + Add Another
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          You must provide at least one {preFilledEntityType === 'LLC' ? 'manager or member' : 'officer or director'}.
        </p>

        <div className="space-y-6">
          {formData.principals.map((principal, index) => (
            <div
              key={index}
              className="rounded-lg border-2 border-gray-200 bg-white"
              style={{ padding: '20px' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">
                  {preFilledEntityType === 'LLC' ? 'Manager/Member' : 'Officer/Director'} #{index + 1}
                </h4>
                {formData.principals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrincipal(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={principal.title}
                    onChange={(e) => updatePrincipal(index, 'title', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    style={{ padding: '12px 16px' }}
                  >
                    <option value="">Select Title</option>
                    {titleOptions.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Full Name"
                  value={principal.name}
                  onChange={(e) => updatePrincipal(index, 'name', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  style={{ padding: '12px 16px', marginBottom: '16px' }}
                />

                <input
                  type="text"
                  placeholder="Street Address"
                  value={principal.street}
                  onChange={(e) => updatePrincipal(index, 'street', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  style={{ padding: '12px 16px', marginBottom: '16px' }}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={principal.city}
                    onChange={(e) => updatePrincipal(index, 'city', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    style={{ padding: '12px 16px' }}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={principal.state}
                    onChange={(e) => updatePrincipal(index, 'state', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    style={{ padding: '12px 16px' }}
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={principal.zip}
                    onChange={(e) => updatePrincipal(index, 'zip', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    style={{ padding: '12px 16px' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate of Status */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginTop: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Certificate of Status (Optional)</h3>
        </div>
        <div
          className="rounded-lg border-2 border-gray-200 bg-gray-50"
          style={{ padding: '16px 20px' }}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requestCertificate}
              onChange={(e) => setFormData({ ...formData, requestCertificate: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              style={{ marginTop: '2px' }}
            />
            <div className="flex-1">
              <span className="font-semibold text-gray-900">
                Request Certificate of Status (+${preFilledEntityType === 'LLC' ? '5.00' : '8.75'})
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Certifies your business is active and has paid all fees. Emailed to you as a PDF attachment.
              </p>
            </div>
          </label>

          {formData.requestCertificate && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address for Certificate <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.certificateEmail || ''}
                onChange={(e) => setFormData({ ...formData, certificateEmail: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                style={{ padding: '12px 16px' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
