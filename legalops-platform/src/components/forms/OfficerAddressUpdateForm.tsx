'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, AlertCircle } from 'lucide-react';

interface OfficerAddressUpdateData {
  principalName: string;
  principalTitle: string;
  newStreet: string;
  newCity: string;
  newState: string;
  newZip: string;
  reasonForUpdate: string;
}

interface OfficerAddressUpdateFormProps {
  initialData?: Partial<OfficerAddressUpdateData>;
  onChange: (data: OfficerAddressUpdateData) => void;
  preFilledBusinessName?: string;
  preFilledEntityType?: 'LLC' | 'CORPORATION';
}

export default function OfficerAddressUpdateForm({
  initialData,
  onChange,
  preFilledBusinessName,
  preFilledEntityType = 'LLC',
}: OfficerAddressUpdateFormProps) {
  const [formData, setFormData] = useState<OfficerAddressUpdateData>({
    principalName: initialData?.principalName || '',
    principalTitle: initialData?.principalTitle || '',
    newStreet: initialData?.newStreet || '',
    newCity: initialData?.newCity || '',
    newState: initialData?.newState || 'FL',
    newZip: initialData?.newZip || '',
    reasonForUpdate: initialData?.reasonForUpdate || '',
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  // Get appropriate title options based on entity type
  const getTitleOptions = () => {
    if (preFilledEntityType === 'CORPORATION') {
      return [
        'President',
        'Vice President',
        'Secretary',
        'Treasurer',
        'Director',
        'Chief Executive Officer (CEO)',
        'Chief Financial Officer (CFO)',
        'Chief Operating Officer (COO)',
        'Other Officer',
      ];
    } else {
      return [
        'Manager',
        'Managing Member',
        'Member',
        'Designated Principal',
        'Authorized Representative',
        'Other',
      ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      {preFilledBusinessName && (
        <div
          className="rounded-lg border-2 border-blue-200 shadow-sm"
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
          }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Updating officer/manager address for: <span className="font-bold">{preFilledBusinessName}</span>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                This form is FREE and updates are processed immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Update {preFilledEntityType === 'CORPORATION' ? 'Officer or Director' : 'Manager or Member'} Address
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          Use this form to update the address for a specific {preFilledEntityType === 'CORPORATION' ? 'officer, director, or principal' : 'manager, member, or designated principal'}.
        </p>
        <p className="text-xs text-gray-500">
          This service is <span className="font-bold text-green-600">FREE</span> and updates are processed immediately.
        </p>
      </div>

      {/* Principal Information */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">
            {preFilledEntityType === 'CORPORATION' ? 'Officer/Director' : 'Manager/Member'} Information
          </h3>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.principalName}
            onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="John Doe"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the full name of the {preFilledEntityType === 'CORPORATION' ? 'officer or director' : 'manager or member'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title/Position *
          </label>
          <select
            value={formData.principalTitle}
            onChange={(e) => setFormData({ ...formData, principalTitle: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            required
          >
            <option value="">Select a title...</option>
            {getTitleOptions().map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* New Address */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">New Address</h3>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            value={formData.newStreet}
            onChange={(e) => setFormData({ ...formData, newStreet: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="123 Main Street"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '16px' }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.newCity}
              onChange={(e) => setFormData({ ...formData, newCity: e.target.value })}
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
              value={formData.newState}
              onChange={(e) => setFormData({ ...formData, newState: e.target.value })}
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
            value={formData.newZip}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length <= 5) {
                setFormData({ ...formData, newZip: value });
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

      {/* Reason for Update */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Update (Optional)
        </label>
        <textarea
          value={formData.reasonForUpdate}
          onChange={(e) => setFormData({ ...formData, reasonForUpdate: e.target.value })}
          className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          style={{ padding: '12px 16px' }}
          rows={3}
          placeholder="Briefly explain why you're updating this address..."
        />
        <p className="text-xs text-gray-500 mt-1">
          This helps us process your request more efficiently
        </p>
      </div>
    </div>
  );
}

