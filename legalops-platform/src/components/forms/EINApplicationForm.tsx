'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, Briefcase, DollarSign, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface EINApplicationData {
  // Responsible Party Information
  responsiblePartyName: string;
  responsiblePartySSN: string;
  responsiblePartyTitle: string;
  
  // Business Information
  businessStartDate: string;
  numberOfEmployees: number;
  
  // Tax Classification (filtered based on entity type)
  taxClassification: 'LLC_SINGLE' | 'LLC_PARTNERSHIP' | 'LLC_SCORP' | 'LLC_CCORP' | 'CORPORATION' | 'PARTNERSHIP' | 'SOLE_PROPRIETOR';
  
  // Reason for Applying
  reasonForApplying: 'STARTED_NEW_BUSINESS' | 'HIRED_EMPLOYEES' | 'BANKING_PURPOSES' | 'CHANGED_ORGANIZATION' | 'PURCHASED_BUSINESS' | 'CREATED_TRUST' | 'OTHER';
  otherReason?: string;
  
  // Additional Information
  firstDateWagesPaid?: string;
  principalActivity: string;
  specificProductOrService: string;
}

interface EINApplicationFormProps {
  initialData?: Partial<EINApplicationData>;
  onChange: (data: EINApplicationData) => void;
  preFilledBusinessName?: string;
  preFilledEntityType?: string;
}

export default function EINApplicationForm({
  initialData,
  onChange,
  preFilledBusinessName,
  preFilledEntityType,
}: EINApplicationFormProps) {
  const [formData, setFormData] = useState<EINApplicationData>({
    responsiblePartyName: initialData?.responsiblePartyName || '',
    responsiblePartySSN: initialData?.responsiblePartySSN || '',
    responsiblePartyTitle: initialData?.responsiblePartyTitle || 'Owner',
    businessStartDate: initialData?.businessStartDate || '',
    numberOfEmployees: initialData?.numberOfEmployees || 0,
    taxClassification: initialData?.taxClassification || 'LLC_SINGLE',
    reasonForApplying: initialData?.reasonForApplying || 'STARTED_NEW_BUSINESS',
    otherReason: initialData?.otherReason || '',
    firstDateWagesPaid: initialData?.firstDateWagesPaid || '',
    principalActivity: initialData?.principalActivity || '',
    specificProductOrService: initialData?.specificProductOrService || '',
  });

  // Accordion state
  const [taxClassificationOpen, setTaxClassificationOpen] = useState(false);
  const [reasonForApplyingOpen, setReasonForApplyingOpen] = useState(false);

  // Notify parent of changes
  useEffect(() => {
    onChange(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleChange = (field: keyof EINApplicationData, value: unknown) => {
    setFormData({ ...formData, [field]: value });
  };

  // Get valid tax classification options based on entity type
  const getTaxClassificationOptions = () => {
    // For LLCs, only show LLC-specific options per IRS guidelines
    if (preFilledEntityType === 'LLC') {
      return [
        { value: 'LLC_SINGLE', label: 'Single-Member LLC (Disregarded Entity)', desc: 'Default: Taxed as sole proprietor' },
        { value: 'LLC_PARTNERSHIP', label: 'Multi-Member LLC (Partnership)', desc: 'Default: Taxed as partnership' },
        { value: 'LLC_SCORP', label: 'LLC Electing S-Corporation', desc: 'Must file Form 2553 with IRS' },
        { value: 'LLC_CCORP', label: 'LLC Electing C-Corporation', desc: 'Must file Form 8832 with IRS' },
      ];
    }

    // For Corporations
    if (preFilledEntityType === 'CORPORATION') {
      return [
        { value: 'CORPORATION', label: 'C-Corporation', desc: 'Standard corporation taxation' },
        { value: 'SCORP', label: 'S-Corporation', desc: 'Must file Form 2553 with IRS' },
      ];
    }

    // For Partnerships
    if (preFilledEntityType === 'PARTNERSHIP') {
      return [
        { value: 'PARTNERSHIP', label: 'Partnership', desc: 'General or limited partnership' },
      ];
    }

    // For Sole Proprietorships
    if (preFilledEntityType === 'SOLE_PROPRIETOR') {
      return [
        { value: 'SOLE_PROPRIETOR', label: 'Sole Proprietorship', desc: 'Individual business owner' },
      ];
    }

    // Default: show all options (shouldn't happen in normal flow)
    return [
      { value: 'LLC_SINGLE', label: 'Single-Member LLC (Disregarded Entity)', desc: 'Default: Taxed as sole proprietor' },
      { value: 'LLC_PARTNERSHIP', label: 'Multi-Member LLC (Partnership)', desc: 'Default: Taxed as partnership' },
      { value: 'LLC_SCORP', label: 'LLC Electing S-Corporation', desc: 'Must file Form 2553 with IRS' },
      { value: 'LLC_CCORP', label: 'LLC Electing C-Corporation', desc: 'Must file Form 8832 with IRS' },
      { value: 'CORPORATION', label: 'C-Corporation', desc: 'Standard corporation taxation' },
      { value: 'PARTNERSHIP', label: 'Partnership', desc: 'General or limited partnership' },
      { value: 'SOLE_PROPRIETOR', label: 'Sole Proprietorship', desc: 'Individual business owner' },
    ];
  };

  return (
    <div>
      {/* Pre-filled Business Info Notice */}
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
            <strong>EIN Application for:</strong> {preFilledBusinessName}
          </p>
          {preFilledEntityType && (
            <p className="text-blue-700 text-xs mt-1">
              Entity Type: {preFilledEntityType}
            </p>
          )}
          <p className="text-blue-700 text-xs mt-1">
            We've pre-filled business information from your formation
          </p>
        </div>
      )}

      {/* Responsible Party Information */}
      <div style={{ marginBottom: '32px' }}>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Responsible Party Information</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          The responsible party is the individual who controls, manages, or directs the entity and the disposition of its funds and assets.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Responsible Party Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Legal Name *
            </label>
            <input
              type="text"
              value={formData.responsiblePartyName}
              onChange={(e) => handleChange('responsiblePartyName', e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="John Doe"
              required
            />
          </div>

          {/* SSN/ITIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Security Number (SSN) or ITIN *
            </label>
            <input
              type="text"
              value={formData.responsiblePartySSN}
              onChange={(e) => handleChange('responsiblePartySSN', e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="XXX-XX-XXXX"
              maxLength={11}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Required by IRS for EIN application</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title/Position *
            </label>
            <input
              type="text"
              value={formData.responsiblePartyTitle}
              onChange={(e) => handleChange('responsiblePartyTitle', e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="Owner, President, Managing Member, etc."
              required
            />
          </div>
        </div>
      </div>

      {/* Business Start Date & Employees */}
      <div style={{ marginBottom: '32px' }}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Business Timeline</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Start Date *
            </label>
            <input
              type="date"
              value={formData.businessStartDate}
              onChange={(e) => handleChange('businessStartDate', e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              required
            />
          </div>

          {/* Number of Employees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Number of Employees (Next 12 Months)
            </label>
            <input
              type="number"
              min="0"
              value={formData.numberOfEmployees}
              onChange={(e) => handleChange('numberOfEmployees', parseInt(e.target.value) || 0)}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="0"
            />
          </div>

          {/* First Date Wages Paid (if employees > 0) */}
          {formData.numberOfEmployees > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Date Wages Will Be Paid
              </label>
              <input
                type="date"
                value={formData.firstDateWagesPaid}
                onChange={(e) => handleChange('firstDateWagesPaid', e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                style={{ padding: '12px 16px' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tax Classification - Accordion */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <button
          type="button"
          onClick={() => setTaxClassificationOpen(!taxClassificationOpen)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Tax Classification</h3>
          </div>
          {taxClassificationOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {taxClassificationOpen && (
          <div style={{ marginTop: '20px' }}>
            <p className="text-sm text-gray-600 mb-4">
              Select how your business will be taxed by the IRS.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {getTaxClassificationOptions().map((option) => (
                <label
                  key={option.value}
                  className={`rounded-lg border-2 cursor-pointer transition-all ${
                    formData.taxClassification === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 bg-white hover:border-purple-300'
                  }`}
                  style={{ padding: '16px 20px' }}
                >
                  <input
                    type="radio"
                    name="taxClassification"
                    value={option.value}
                    checked={formData.taxClassification === option.value}
                    onChange={(e) => handleChange('taxClassification', e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-semibold text-gray-900">{option.label}</span>
                  <p className="text-sm text-gray-600 ml-6" style={{ marginTop: '4px' }}>{option.desc}</p>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reason for Applying */}
      <div style={{ marginBottom: '32px' }}>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Reason for Applying</h3>
        </div>

        <select
          value={formData.reasonForApplying}
          onChange={(e) => handleChange('reasonForApplying', e.target.value)}
          className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          style={{ padding: '12px 16px' }}
        >
          <option value="STARTED_NEW_BUSINESS">Started new business</option>
          <option value="HIRED_EMPLOYEES">Hired employees</option>
          <option value="BANKING_PURPOSES">Banking purposes</option>
          <option value="CHANGED_ORGANIZATION">Changed type of organization</option>
          <option value="PURCHASED_BUSINESS">Purchased going business</option>
          <option value="CREATED_TRUST">Created a trust</option>
          <option value="OTHER">Other (specify below)</option>
        </select>

        {formData.reasonForApplying === 'OTHER' && (
          <textarea
            value={formData.otherReason}
            onChange={(e) => handleChange('otherReason', e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            rows={2}
            placeholder="Please specify your reason for applying..."
            style={{ marginTop: '12px', padding: '12px 16px' }}
          />
        )}
      </div>

      {/* Principal Business Activity */}
      <div style={{ marginBottom: '32px' }}>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Business Activity</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Principal Activity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Principal Business Activity *
            </label>
            <input
              type="text"
              value={formData.principalActivity}
              onChange={(e) => handleChange('principalActivity', e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="e.g., Retail, Consulting, Real Estate, etc."
              required
            />
          </div>

          {/* Specific Product/Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Product or Service *
            </label>
            <textarea
              value={formData.specificProductOrService}
              onChange={(e) => handleChange('specificProductOrService', e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              rows={3}
              placeholder="Describe what your business does or sells..."
              required
            />
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div
        className="rounded-lg"
        style={{
          marginTop: '32px',
          padding: '20px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #fbbf24',
        }}
      >
        <p className="text-yellow-900 text-sm">
          <strong>Privacy Notice:</strong> Your SSN/ITIN is required by the IRS for EIN applications.
          This information is encrypted and securely transmitted directly to the IRS. We do not store
          your SSN/ITIN after submission.
        </p>
      </div>
    </div>
  );
}

