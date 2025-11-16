'use client';

import { useState, useEffect } from 'react';
import { FileEdit, Building2, AlertCircle } from 'lucide-react';

interface BusinessAmendmentData {
  // Amendment Type
  amendmentType: 'NAME_CHANGE' | 'PURPOSE_CHANGE' | 'MANAGEMENT_CHANGE' | 'STOCK_CHANGE' | 'OTHER';
  
  // Changes
  newBusinessName?: string;
  newPurpose?: string;
  newManagementStructure?: string;
  newAuthorizedShares?: number;
  newParValue?: number;
  otherChanges?: string;
  
  // Effective Date
  effectiveDate?: string;
  
  // Reason for Amendment
  reasonForAmendment: string;
}

interface BusinessAmendmentFormProps {
  initialData?: Partial<BusinessAmendmentData>;
  onChange: (data: BusinessAmendmentData) => void;
  preFilledBusinessName?: string;
  preFilledEntityType?: 'LLC' | 'CORPORATION';
}

export default function BusinessAmendmentForm({
  initialData,
  onChange,
  preFilledBusinessName,
  preFilledEntityType = 'LLC',
}: BusinessAmendmentFormProps) {
  const [formData, setFormData] = useState<BusinessAmendmentData>({
    amendmentType: initialData?.amendmentType || 'NAME_CHANGE',
    newBusinessName: initialData?.newBusinessName || '',
    newPurpose: initialData?.newPurpose || '',
    newManagementStructure: initialData?.newManagementStructure || '',
    newAuthorizedShares: initialData?.newAuthorizedShares || 0,
    newParValue: initialData?.newParValue || 0,
    otherChanges: initialData?.otherChanges || '',
    effectiveDate: initialData?.effectiveDate || '',
    reasonForAmendment: initialData?.reasonForAmendment || '',
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const filingFee = 25.00;

  return (
    <div className="space-y-6">
      {/* Filing Fee Notice */}
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
            <p className="text-sm font-bold text-yellow-900 mb-1">
              Filing Fee Required: ${filingFee.toFixed(2)}
            </p>
            <p className="text-xs text-yellow-800">
              Business amendments must be filed by mail with the Florida Department of State.
              This cannot be done online.
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
            <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Filing amendment for: <span className="font-bold">{preFilledBusinessName}</span>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Entity Type: {preFilledEntityType}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Amendment Type Selection */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FileEdit className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">What Would You Like to Amend?</h3>
        </div>

        <select
          value={formData.amendmentType}
          onChange={(e) => setFormData({ ...formData, amendmentType: e.target.value as BusinessAmendmentData['amendmentType'] })}
          className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          style={{ padding: '12px 16px' }}
          required
        >
          <option value="NAME_CHANGE">Business Name Change</option>
          <option value="PURPOSE_CHANGE">Business Purpose Change</option>
          {preFilledEntityType === 'LLC' && (
            <option value="MANAGEMENT_CHANGE">Management Structure Change</option>
          )}
          {preFilledEntityType === 'CORPORATION' && (
            <option value="STOCK_CHANGE">Stock/Shares Change</option>
          )}
          <option value="OTHER">Other Amendment</option>
        </select>

        <p className="text-xs text-gray-500 mt-2">
          Note: To update email, FEIN, or addresses, use the free "Entity Information Update" form instead.
        </p>
      </div>

      {/* Name Change */}
      {formData.amendmentType === 'NAME_CHANGE' && (
        <div
          className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
          style={{ padding: '24px' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">New Business Name</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Business Name *
            </label>
            <input
              type="text"
              value={formData.newBusinessName}
              onChange={(e) => setFormData({ ...formData, newBusinessName: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="Enter new business name"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {preFilledEntityType === 'LLC' 
                ? 'Must include "LLC" or "Limited Liability Company"'
                : 'Must include "Corporation", "Corp.", "Incorporated", or "Inc."'}
            </p>
          </div>
        </div>
      )}

      {/* Purpose Change */}
      {formData.amendmentType === 'PURPOSE_CHANGE' && (
        <div
          className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
          style={{ padding: '24px' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FileEdit className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">New Business Purpose</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Business Purpose *
            </label>
            <textarea
              value={formData.newPurpose}
              onChange={(e) => setFormData({ ...formData, newPurpose: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              rows={4}
              placeholder="Describe the new business purpose..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Clearly describe what your business will do
            </p>
          </div>
        </div>
      )}

      {/* Management Structure Change (LLC only) */}
      {formData.amendmentType === 'MANAGEMENT_CHANGE' && preFilledEntityType === 'LLC' && (
        <div
          className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
          style={{ padding: '24px' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">New Management Structure</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Management Structure *
            </label>
            <select
              value={formData.newManagementStructure}
              onChange={(e) => setFormData({ ...formData, newManagementStructure: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              required
            >
              <option value="">Select management structure...</option>
              <option value="MEMBER_MANAGED">Member-Managed</option>
              <option value="MANAGER_MANAGED">Manager-Managed</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Member-managed: All members participate in management<br />
              Manager-managed: Designated managers handle day-to-day operations
            </p>
          </div>
        </div>
      )}

      {/* Stock/Shares Change (Corporation only) */}
      {formData.amendmentType === 'STOCK_CHANGE' && preFilledEntityType === 'CORPORATION' && (
        <div
          className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
          style={{ padding: '24px' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Stock/Shares Information</h3>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Number of Authorized Shares *
            </label>
            <input
              type="number"
              value={formData.newAuthorizedShares}
              onChange={(e) => setFormData({ ...formData, newAuthorizedShares: parseInt(e.target.value) || 0 })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Par Value per Share (Optional)
            </label>
            <input
              type="number"
              value={formData.newParValue}
              onChange={(e) => setFormData({ ...formData, newParValue: parseFloat(e.target.value) || 0 })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              step="0.01"
              min="0"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave as 0 for no par value stock
            </p>
          </div>
        </div>
      )}

      {/* Other Changes */}
      {formData.amendmentType === 'OTHER' && (
        <div
          className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
          style={{ padding: '24px' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FileEdit className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Other Amendment Details</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe the Amendment *
            </label>
            <textarea
              value={formData.otherChanges}
              onChange={(e) => setFormData({ ...formData, otherChanges: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              rows={5}
              placeholder="Provide detailed description of the changes you want to make..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Be as specific as possible about what you want to amend
            </p>
          </div>
        </div>
      )}

      {/* Effective Date */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Effective Date</h3>

        <div>
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
      </div>

      {/* Reason for Amendment */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Amendment *
        </label>
        <textarea
          value={formData.reasonForAmendment}
          onChange={(e) => setFormData({ ...formData, reasonForAmendment: e.target.value })}
          className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          style={{ padding: '12px 16px' }}
          rows={3}
          placeholder="Briefly explain why you're making this amendment..."
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          This helps us process your request more efficiently
        </p>
      </div>

      {/* Mailing Instructions */}
      <div
        className="rounded-lg border-2 border-gray-200"
        style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        }}
      >
        <h4 className="text-sm font-bold text-gray-900 mb-3">📋 Mailing Instructions</h4>
        <ol className="text-xs text-gray-700 space-y-2 ml-4 list-decimal">
          <li>Download and print the completed amendment form (we'll generate it for you)</li>
          <li>Sign the form where indicated</li>
          <li>Write a check for ${filingFee.toFixed(2)} payable to "Florida Department of State"</li>
          <li>Mail both to:
            <div className="ml-4 mt-2 font-mono text-xs bg-white p-3 rounded border border-gray-300">
              Division of Corporations<br />
              P.O. Box 6327<br />
              Tallahassee, FL 32314
            </div>
          </li>
          <li>Allow 7-10 business days for processing</li>
        </ol>
      </div>
    </div>
  );
}
