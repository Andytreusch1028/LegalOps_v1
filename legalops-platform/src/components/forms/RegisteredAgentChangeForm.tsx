'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, AlertCircle, FileText, Mail as MailIcon } from 'lucide-react';

interface RegisteredAgentChangeData {
  // Current Registered Agent
  currentAgentName: string;
  currentAgentAddress: string;
  
  // New Registered Agent
  newAgentName: string;
  newAgentType: 'INDIVIDUAL' | 'COMMERCIAL';
  newAgentStreet: string;
  newAgentCity: string;
  newAgentState: string;
  newAgentZip: string;
  
  // Effective Date
  effectiveDate?: string;
  
  // Reason for Change
  reasonForChange: string;
  
  // Mailing Service Option
  useMailingService: boolean;
}

interface RegisteredAgentChangeFormProps {
  initialData?: Partial<RegisteredAgentChangeData>;
  onChange: (data: RegisteredAgentChangeData) => void;
  preFilledBusinessName?: string;
  preFilledEntityType?: 'LLC' | 'CORPORATION';
}

export default function RegisteredAgentChangeForm({
  initialData,
  onChange,
  preFilledBusinessName,
  preFilledEntityType = 'LLC',
}: RegisteredAgentChangeFormProps) {
  const [formData, setFormData] = useState<RegisteredAgentChangeData>({
    currentAgentName: initialData?.currentAgentName || '',
    currentAgentAddress: initialData?.currentAgentAddress || '',
    newAgentName: initialData?.newAgentName || '',
    newAgentType: initialData?.newAgentType || 'INDIVIDUAL',
    newAgentStreet: initialData?.newAgentStreet || '',
    newAgentCity: initialData?.newAgentCity || '',
    newAgentState: initialData?.newAgentState || 'FL',
    newAgentZip: initialData?.newAgentZip || '',
    effectiveDate: initialData?.effectiveDate || '',
    reasonForChange: initialData?.reasonForChange || '',
    useMailingService: initialData?.useMailingService || false,
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const filingFee = 25.00;
  const mailingServiceFee = 35.00;
  const totalFee = filingFee + (formData.useMailingService ? mailingServiceFee : 0);

  return (
    <div className="space-y-6">
      {/* Important Notice Banner */}
      <div
        className="rounded-lg border-2 border-yellow-300 shadow-sm"
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-yellow-900 mb-2">
              Important: Registered Agent Changes Require Mailing
            </p>
            <p className="text-xs text-yellow-800 mb-2">
              Florida requires registered agent changes to be filed by mail with a physical signature and check payment.
              This cannot be done online.
            </p>
            <p className="text-xs text-yellow-800">
              <span className="font-semibold">Filing Fee: ${filingFee.toFixed(2)}</span> (payable to Florida Department of State)
            </p>
          </div>
        </div>
      </div>

      {/* Business Info Banner */}
      {preFilledBusinessName && (
        <div
          className="rounded-lg border-2 border-blue-200 shadow-sm"
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
          }}
        >
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Changing registered agent for: <span className="font-bold">{preFilledBusinessName}</span>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Entity Type: {preFilledEntityType}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Registered Agent */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Current Registered Agent</h3>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Agent Name *
          </label>
          <input
            type="text"
            value={formData.currentAgentName}
            onChange={(e) => setFormData({ ...formData, currentAgentName: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="Current registered agent name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Agent Address *
          </label>
          <textarea
            value={formData.currentAgentAddress}
            onChange={(e) => setFormData({ ...formData, currentAgentAddress: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            rows={2}
            placeholder="Street Address&#10;City, State ZIP"
            required
          />
        </div>
      </div>

      {/* New Registered Agent */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">New Registered Agent</h3>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agent Type *
          </label>
          <select
            value={formData.newAgentType}
            onChange={(e) => setFormData({ ...formData, newAgentType: e.target.value as 'INDIVIDUAL' | 'COMMERCIAL' })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            required
          >
            <option value="INDIVIDUAL">Individual Person</option>
            <option value="COMMERCIAL">Commercial Registered Agent Service</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Commercial agents are businesses that provide registered agent services
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Agent Name *
          </label>
          <input
            type="text"
            value={formData.newAgentName}
            onChange={(e) => setFormData({ ...formData, newAgentName: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="Full name or company name"
            required
          />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-purple-600" />
          <h4 className="text-sm font-semibold text-gray-900">New Agent Florida Address</h4>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            value={formData.newAgentStreet}
            onChange={(e) => setFormData({ ...formData, newAgentStreet: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="123 Main Street (no P.O. Box)"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be a Florida street address (P.O. Box NOT acceptable)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '16px' }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.newAgentCity}
              onChange={(e) => setFormData({ ...formData, newAgentCity: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="Miami"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              type="text"
              value={formData.newAgentState}
              onChange={(e) => setFormData({ ...formData, newAgentState: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="FL"
              maxLength={2}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zip Code *
          </label>
          <input
            type="text"
            value={formData.newAgentZip}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length <= 5) {
                setFormData({ ...formData, newAgentZip: value });
              }
            }}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="33101"
            maxLength={5}
            required
          />
        </div>
      </div>

      {/* Additional Information */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Effective Date (Optional)
          </label>
          <input
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank for immediate effect upon filing
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Change (Optional)
          </label>
          <textarea
            value={formData.reasonForChange}
            onChange={(e) => setFormData({ ...formData, reasonForChange: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            rows={3}
            placeholder="Briefly explain why you're changing registered agents..."
          />
        </div>
      </div>

      {/* Mailing Service Option */}
      <div
        className="rounded-lg border-2 border-purple-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <MailIcon className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Mailing Service (Optional)</h3>
        </div>

        <div className="flex items-start gap-3 mb-4">
          <input
            type="checkbox"
            id="useMailingService"
            checked={formData.useMailingService}
            onChange={(e) => setFormData({ ...formData, useMailingService: e.target.checked })}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-0.5"
          />
          <label htmlFor="useMailingService" className="cursor-pointer flex-1">
            <span className="text-base font-semibold text-gray-900 block mb-1">
              Let LegalOps Mail This For You (+${mailingServiceFee.toFixed(2)})
            </span>
            <p className="text-sm text-gray-600">
              We'll print, sign, and mail your form with a check to the Florida Department of State.
              You'll receive tracking information once mailed.
            </p>
          </label>
        </div>

        {!formData.useMailingService && (
          <div
            className="rounded-lg border-2 border-gray-200"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
            }}
          >
            <h4 className="text-sm font-bold text-gray-900 mb-2">📋 DIY Mailing Instructions</h4>
            <ol className="text-xs text-gray-700 space-y-1 ml-4 list-decimal">
              <li>Download and print the completed form (we'll generate it for you)</li>
              <li>Sign the form where indicated</li>
              <li>Write a check for ${filingFee.toFixed(2)} payable to "Florida Department of State"</li>
              <li>Mail both to:
                <div className="ml-4 mt-1 font-mono text-xs bg-white p-2 rounded border border-gray-300">
                  Division of Corporations<br />
                  P.O. Box 6327<br />
                  Tallahassee, FL 32314
                </div>
              </li>
              <li>Allow 7-10 business days for processing</li>
            </ol>
          </div>
        )}
      </div>

      {/* Fee Summary */}
      <div
        className="rounded-lg border-2 border-green-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-3">Fee Summary</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">State Filing Fee:</span>
            <span className="font-semibold text-gray-900">${filingFee.toFixed(2)}</span>
          </div>

          {formData.useMailingService && (
            <div className="flex justify-between">
              <span className="text-gray-700">LegalOps Mailing Service:</span>
              <span className="font-semibold text-gray-900">${mailingServiceFee.toFixed(2)}</span>
            </div>
          )}

          <div className="pt-2 border-t-2 border-gray-200 flex justify-between">
            <span className="text-base font-bold text-gray-900">Total:</span>
            <span className="text-base font-bold text-green-600">${totalFee.toFixed(2)}</span>
          </div>
        </div>

        {!formData.useMailingService && (
          <p className="text-xs text-gray-500 mt-3">
            Note: You'll need to mail a check for ${filingFee.toFixed(2)} separately
          </p>
        )}
      </div>
    </div>
  );
}

