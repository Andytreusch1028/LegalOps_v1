'use client';

import { useState, useEffect } from 'react';
import { Mail, Building2, MapPin, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface EntityUpdateData {
  // Multi-select checkboxes for what to update
  updateEmail: boolean;
  updateFEIN: boolean;
  updatePrincipalAddress: boolean;
  updateMailingAddress: boolean;
  
  // Field values
  newEmailAddress?: string;
  newFEIN?: string;
  newPrincipalStreet?: string;
  newPrincipalCity?: string;
  newPrincipalState?: string;
  newPrincipalZip?: string;
  newMailingStreet?: string;
  newMailingCity?: string;
  newMailingState?: string;
  newMailingZip?: string;
  
  reasonForUpdate: string;
}

interface EntityInformationUpdateFormProps {
  initialData?: Partial<EntityUpdateData>;
  onChange: (data: EntityUpdateData) => void;
  preFilledBusinessName?: string;
}

export default function EntityInformationUpdateForm({
  initialData,
  onChange,
  preFilledBusinessName,
}: EntityInformationUpdateFormProps) {
  const [formData, setFormData] = useState<EntityUpdateData>({
    updateEmail: initialData?.updateEmail || false,
    updateFEIN: initialData?.updateFEIN || false,
    updatePrincipalAddress: initialData?.updatePrincipalAddress || false,
    updateMailingAddress: initialData?.updateMailingAddress || false,
    newEmailAddress: initialData?.newEmailAddress || '',
    newFEIN: initialData?.newFEIN || '',
    newPrincipalStreet: initialData?.newPrincipalStreet || '',
    newPrincipalCity: initialData?.newPrincipalCity || '',
    newPrincipalState: initialData?.newPrincipalState || 'FL',
    newPrincipalZip: initialData?.newPrincipalZip || '',
    newMailingStreet: initialData?.newMailingStreet || '',
    newMailingCity: initialData?.newMailingCity || '',
    newMailingState: initialData?.newMailingState || 'FL',
    newMailingZip: initialData?.newMailingZip || '',
    reasonForUpdate: initialData?.reasonForUpdate || '',
  });

  // Accordion states
  const [emailOpen, setEmailOpen] = useState(false);
  const [feinOpen, setFeinOpen] = useState(false);
  const [principalOpen, setPrincipalOpen] = useState(false);
  const [mailingOpen, setMailingOpen] = useState(false);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleCheckboxChange = (field: keyof EntityUpdateData, value: boolean) => {
    setFormData({ ...formData, [field]: value });
    
    // Auto-open accordion when checkbox is checked
    if (field === 'updateEmail' && value) setEmailOpen(true);
    if (field === 'updateFEIN' && value) setFeinOpen(true);
    if (field === 'updatePrincipalAddress' && value) setPrincipalOpen(true);
    if (field === 'updateMailingAddress' && value) setMailingOpen(true);
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
                Updating information for: <span className="font-bold">{preFilledBusinessName}</span>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                This form is FREE and updates are processed immediately. Select which information you want to update below.
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
        <h3 className="text-lg font-bold text-gray-900 mb-3">What Would You Like to Update?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select one or more items below to update your entity's information with the Florida Department of State.
          This service is <span className="font-bold text-green-600">FREE</span> and updates are processed immediately.
        </p>
        <p className="text-xs text-gray-500">
          Note: To change your registered agent or business name, you'll need to use a different form (additional fees apply).
        </p>
      </div>

      {/* Email Address Update */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="updateEmail"
            checked={formData.updateEmail}
            onChange={(e) => handleCheckboxChange('updateEmail', e.target.checked)}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="updateEmail" className="flex items-center gap-2 cursor-pointer flex-1">
            <Mail className="w-5 h-5 text-purple-600" />
            <span className="text-base font-semibold text-gray-900">Update Email Address</span>
          </label>
          {formData.updateEmail && (
            <button
              type="button"
              onClick={() => setEmailOpen(!emailOpen)}
              className="text-purple-600 hover:text-purple-700"
            >
              {emailOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
        </div>

        {formData.updateEmail && emailOpen && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Email Address *
            </label>
            <input
              type="email"
              value={formData.newEmailAddress}
              onChange={(e) => setFormData({ ...formData, newEmailAddress: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="your.email@example.com"
              required={formData.updateEmail}
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the official email address on file with the state
            </p>
          </div>
        )}
      </div>

      {/* FEIN Update */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="updateFEIN"
            checked={formData.updateFEIN}
            onChange={(e) => handleCheckboxChange('updateFEIN', e.target.checked)}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="updateFEIN" className="flex items-center gap-2 cursor-pointer flex-1">
            <Building2 className="w-5 h-5 text-purple-600" />
            <span className="text-base font-semibold text-gray-900">Add or Update Federal Employer Identification Number (FEIN)</span>
          </label>
          {formData.updateFEIN && (
            <button
              type="button"
              onClick={() => setFeinOpen(!feinOpen)}
              className="text-purple-600 hover:text-purple-700"
            >
              {feinOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
        </div>

        {formData.updateFEIN && feinOpen && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New FEIN *
            </label>
            <input
              type="text"
              value={formData.newFEIN}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9-]/g, '');
                if (value.length <= 10) {
                  setFormData({ ...formData, newFEIN: value });
                }
              }}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="XX-XXXXXXX"
              maxLength={10}
              required={formData.updateFEIN}
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: XX-XXXXXXX (e.g., 12-3456789)
            </p>
          </div>
        )}
      </div>

      {/* Principal Address Update */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="updatePrincipalAddress"
            checked={formData.updatePrincipalAddress}
            onChange={(e) => handleCheckboxChange('updatePrincipalAddress', e.target.checked)}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="updatePrincipalAddress" className="flex items-center gap-2 cursor-pointer flex-1">
            <MapPin className="w-5 h-5 text-purple-600" />
            <span className="text-base font-semibold text-gray-900">Update Principal Office Address</span>
          </label>
          {formData.updatePrincipalAddress && (
            <button
              type="button"
              onClick={() => setPrincipalOpen(!principalOpen)}
              className="text-purple-600 hover:text-purple-700"
            >
              {principalOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
        </div>

        {formData.updatePrincipalAddress && principalOpen && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <p className="text-xs text-gray-500 mb-3">
              This is the physical location where your business operates (P.O. Box NOT acceptable)
            </p>
            
            <div style={{ marginBottom: '16px' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.newPrincipalStreet}
                onChange={(e) => setFormData({ ...formData, newPrincipalStreet: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                style={{ padding: '12px 16px' }}
                placeholder="123 Main Street"
                required={formData.updatePrincipalAddress}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.newPrincipalCity}
                  onChange={(e) => setFormData({ ...formData, newPrincipalCity: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  style={{ padding: '12px 16px' }}
                  placeholder="Miami"
                  required={formData.updatePrincipalAddress}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.newPrincipalState}
                  onChange={(e) => setFormData({ ...formData, newPrincipalState: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  style={{ padding: '12px 16px' }}
                  placeholder="FL"
                  maxLength={2}
                  required={formData.updatePrincipalAddress}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code *
              </label>
              <input
                type="text"
                value={formData.newPrincipalZip}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 5) {
                    setFormData({ ...formData, newPrincipalZip: value });
                  }
                }}
                className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                style={{ padding: '12px 16px' }}
                placeholder="33101"
                maxLength={5}
                required={formData.updatePrincipalAddress}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mailing Address Update */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="updateMailingAddress"
            checked={formData.updateMailingAddress}
            onChange={(e) => handleCheckboxChange('updateMailingAddress', e.target.checked)}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="updateMailingAddress" className="flex items-center gap-2 cursor-pointer flex-1">
            <MapPin className="w-5 h-5 text-purple-600" />
            <span className="text-base font-semibold text-gray-900">Update Mailing Address</span>
          </label>
          {formData.updateMailingAddress && (
            <button
              type="button"
              onClick={() => setMailingOpen(!mailingOpen)}
              className="text-purple-600 hover:text-purple-700"
            >
              {mailingOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
        </div>

        {formData.updateMailingAddress && mailingOpen && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <p className="text-xs text-gray-500 mb-3">
              This is where you receive official correspondence and legal notices (P.O. Box IS acceptable)
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address or P.O. Box *
              </label>
              <input
                type="text"
                value={formData.newMailingStreet}
                onChange={(e) => setFormData({ ...formData, newMailingStreet: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                style={{ padding: '12px 16px' }}
                placeholder="P.O. Box 123 or 123 Main Street"
                required={formData.updateMailingAddress}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.newMailingCity}
                  onChange={(e) => setFormData({ ...formData, newMailingCity: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  style={{ padding: '12px 16px' }}
                  placeholder="Miami"
                  required={formData.updateMailingAddress}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.newMailingState}
                  onChange={(e) => setFormData({ ...formData, newMailingState: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  style={{ padding: '12px 16px' }}
                  placeholder="FL"
                  maxLength={2}
                  required={formData.updateMailingAddress}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code *
              </label>
              <input
                type="text"
                value={formData.newMailingZip}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 5) {
                    setFormData({ ...formData, newMailingZip: value });
                  }
                }}
                className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                style={{ padding: '12px 16px' }}
                placeholder="33101"
                maxLength={5}
                required={formData.updateMailingAddress}
              />
            </div>
          </div>
        )}
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
          placeholder="Briefly explain why you're updating this information..."
        />
        <p className="text-xs text-gray-500 mt-1">
          This helps us process your request more efficiently
        </p>
      </div>
    </div>
  );
}
