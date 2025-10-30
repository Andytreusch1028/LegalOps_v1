'use client';

import { useState, useEffect } from 'react';
import { FileEdit, Building2, MapPin, User, Calendar } from 'lucide-react';

interface AmendmentData {
  // Amendment Type
  amendmentType: 'NAME_CHANGE' | 'PRINCIPAL_ADDRESS_CHANGE' | 'MAILING_ADDRESS_CHANGE' | 'EMAIL_CHANGE' | 'EIN_CHANGE' | 'PURPOSE_CHANGE' | 'MANAGEMENT_CHANGE' | 'STOCK_CHANGE' | 'OTHER';

  // Changes
  newBusinessName?: string;
  newPrincipalAddress?: string;
  newMailingAddress?: string;
  newEmailAddress?: string;
  newEIN?: string;
  newPurpose?: string;
  newManagementStructure?: string;
  newAuthorizedShares?: number;
  otherChanges?: string;

  // Effective Date
  effectiveDate?: string;

  // Reason for Amendment
  reasonForAmendment: string;
}

interface AmendmentFormProps {
  initialData?: Partial<AmendmentData>;
  onChange: (data: AmendmentData) => void;
  preFilledBusinessName?: string;
  preFilledEntityType?: 'LLC' | 'CORPORATION';
}

export default function AmendmentForm({
  initialData,
  onChange,
  preFilledBusinessName,
  preFilledEntityType = 'LLC',
}: AmendmentFormProps) {
  const [formData, setFormData] = useState<AmendmentData>({
    amendmentType: initialData?.amendmentType || 'NAME_CHANGE',
    newBusinessName: initialData?.newBusinessName || '',
    newPrincipalAddress: initialData?.newPrincipalAddress || '',
    newMailingAddress: initialData?.newMailingAddress || '',
    newEmailAddress: initialData?.newEmailAddress || '',
    newEIN: initialData?.newEIN || '',
    newPurpose: initialData?.newPurpose || '',
    newManagementStructure: initialData?.newManagementStructure || '',
    newAuthorizedShares: initialData?.newAuthorizedShares || 0,
    otherChanges: initialData?.otherChanges || '',
    effectiveDate: initialData?.effectiveDate || '',
    reasonForAmendment: initialData?.reasonForAmendment || '',
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
            <strong>Amendment for:</strong> {preFilledBusinessName}
          </p>
          <p className="text-blue-700 text-xs mt-1">
            We'll show your current information for reference
          </p>
        </div>
      )}

      {/* Amendment Type */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FileEdit className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">What Are You Changing?</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amendment Type *
          </label>
          <select
            value={formData.amendmentType}
            onChange={(e) => setFormData({ ...formData, amendmentType: e.target.value as any })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            required
          >
            <option value="NAME_CHANGE">Business Name Change</option>
            <option value="PRINCIPAL_ADDRESS_CHANGE">Principal Address Change</option>
            <option value="MAILING_ADDRESS_CHANGE">Mailing Address Change</option>
            <option value="EMAIL_CHANGE">Email Address Change</option>
            <option value="EIN_CHANGE">EIN/Federal Tax ID Change</option>
            <option value="PURPOSE_CHANGE">Business Purpose Change</option>
            {preFilledEntityType === 'LLC' && (
              <option value="MANAGEMENT_CHANGE">Management Structure Change</option>
            )}
            {preFilledEntityType === 'CORPORATION' && (
              <option value="STOCK_CHANGE">Stock/Shares Change</option>
            )}
            <option value="OTHER">Other Amendment</option>
          </select>
        </div>
      </div>

      {/* Name Change */}
      {formData.amendmentType === 'NAME_CHANGE' && (
        <div
          className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
          style={{ padding: '24px', marginBottom: '32px' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">New Business Name</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Legal Name *
            </label>
            <input
              type="text"
              value={formData.newBusinessName}
              onChange={(e) => setFormData({ ...formData, newBusinessName: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder={preFilledEntityType === 'LLC' ? 'New Name LLC' : 'New Name Inc.'}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Must include {preFilledEntityType === 'LLC' ? 'LLC or L.L.C.' : 'Inc., Corp., or Corporation'}
            </p>
          </div>
        </div>
      )}

      {/* Principal Address Change */}
      {formData.amendmentType === 'PRINCIPAL_ADDRESS_CHANGE' && (
        <div
          className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
          style={{ padding: '24px', marginBottom: '32px' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">New Principal Address</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Principal Address *
            </label>
            <textarea
              value={formData.newPrincipalAddress}
              onChange={(e) => setFormData({ ...formData, newPrincipalAddress: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              rows={2}
              placeholder="Street Address&#10;City, State ZIP"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the physical location where your business operates
            </p>
          </div>
        </div>
      )}

      {/* Mailing Address Change */}
      {formData.amendmentType === 'MAILING_ADDRESS_CHANGE' && (
        <div
          className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
          style={{ padding: '24px', marginBottom: '32px' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">New Mailing Address</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Mailing Address *
            </label>
            <textarea
              value={formData.newMailingAddress}
              onChange={(e) => setFormData({ ...formData, newMailingAddress: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              rows={2}
              placeholder="Street Address&#10;City, State ZIP"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This is where you receive official correspondence and legal notices
            </p>
          </div>
        </div>
      )}

      {/* Email Address Change */}
      {formData.amendmentType === 'EMAIL_CHANGE' && (
        <div
          className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
          style={{ padding: '24px', marginBottom: '32px' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">New Email Address</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Email Address *
            </label>
            <input
              type="email"
              value={formData.newEmailAddress}
              onChange={(e) => setFormData({ ...formData, newEmailAddress: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="newemail@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the official email address on file with the state
            </p>
          </div>
        </div>
      )}

      {/* EIN Change */}
      {formData.amendmentType === 'EIN_CHANGE' && (
        <div
          className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
          style={{ padding: '24px', marginBottom: '32px' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">New EIN/Federal Tax ID</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New EIN (Federal Employer Identification Number) *
            </label>
            <input
              type="text"
              value={formData.newEIN}
              onChange={(e) => setFormData({ ...formData, newEIN: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="XX-XXXXXXX"
              maxLength={10}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: XX-XXXXXXX (9 digits with hyphen after 2nd digit)
            </p>
          </div>
        </div>
      )}

      {/* Other Changes */}
      {(formData.amendmentType === 'PURPOSE_CHANGE' || 
        formData.amendmentType === 'MANAGEMENT_CHANGE' || 
        formData.amendmentType === 'STOCK_CHANGE' || 
        formData.amendmentType === 'OTHER') && (
        <div
          className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
          style={{ padding: '24px', marginBottom: '32px' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FileEdit className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Amendment Details</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe the Changes *
            </label>
            <textarea
              value={formData.otherChanges}
              onChange={(e) => setFormData({ ...formData, otherChanges: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              rows={4}
              placeholder="Provide detailed description of the changes you want to make..."
              required
            />
          </div>
        </div>
      )}

      {/* Effective Date & Reason */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Effective Date & Reason</h3>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Effective Date (optional)
          </label>
          <input
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to make effective immediately upon filing
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Amendment *
          </label>
          <textarea
            value={formData.reasonForAmendment}
            onChange={(e) => setFormData({ ...formData, reasonForAmendment: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            rows={3}
            placeholder="Why are you making this amendment?"
            required
          />
        </div>
      </div>
    </div>
  );
}

