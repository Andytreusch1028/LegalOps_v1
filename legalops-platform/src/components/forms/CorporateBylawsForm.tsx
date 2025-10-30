'use client';

import { useState, useEffect } from 'react';
import { Users, Building2, Calendar, FileText } from 'lucide-react';

interface Director {
  name: string;
  address: string;
}

interface Officer {
  title: string;
  name: string;
}

interface CorporateBylawsData {
  // Directors
  directors: Director[];
  
  // Officers
  officers: Officer[];
  
  // Stock Information
  authorizedShares: number;
  parValue: number;
  
  // Meeting Requirements
  annualMeetingMonth: string;
  quorumPercentage: number;
  
  // Fiscal Year
  fiscalYearEnd: string; // MM/DD format
}

interface CorporateBylawsFormProps {
  initialData?: Partial<CorporateBylawsData>;
  onChange: (data: CorporateBylawsData) => void;
  preFilledBusinessName?: string;
}

export default function CorporateBylawsForm({
  initialData,
  onChange,
  preFilledBusinessName,
}: CorporateBylawsFormProps) {
  const [formData, setFormData] = useState<CorporateBylawsData>({
    directors: initialData?.directors || [{ name: '', address: '' }],
    officers: initialData?.officers || [
      { title: 'President', name: '' },
      { title: 'Secretary', name: '' },
      { title: 'Treasurer', name: '' },
    ],
    authorizedShares: initialData?.authorizedShares || 1000,
    parValue: initialData?.parValue || 0.01,
    annualMeetingMonth: initialData?.annualMeetingMonth || 'January',
    quorumPercentage: initialData?.quorumPercentage || 50,
    fiscalYearEnd: initialData?.fiscalYearEnd || '12/31',
  });

  // Notify parent of changes
  useEffect(() => {
    onChange(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const addDirector = () => {
    setFormData({
      ...formData,
      directors: [...formData.directors, { name: '', address: '' }],
    });
  };

  const removeDirector = (index: number) => {
    if (formData.directors.length > 1) {
      setFormData({
        ...formData,
        directors: formData.directors.filter((_, i) => i !== index),
      });
    }
  };

  const updateDirector = (index: number, field: keyof Director, value: string) => {
    const updatedDirectors = [...formData.directors];
    updatedDirectors[index] = { ...updatedDirectors[index], [field]: value };
    setFormData({ ...formData, directors: updatedDirectors });
  };

  const updateOfficer = (index: number, field: keyof Officer, value: string) => {
    const updatedOfficers = [...formData.officers];
    updatedOfficers[index] = { ...updatedOfficers[index], [field]: value };
    setFormData({ ...formData, officers: updatedOfficers });
  };

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
            <strong>Corporate Bylaws for:</strong> {preFilledBusinessName}
          </p>
          <p className="text-blue-700 text-xs mt-1">
            We've pre-filled some information from your corporation formation
          </p>
        </div>
      )}

      {/* Directors */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Board of Directors</h3>
          </div>
          <button
            type="button"
            onClick={addDirector}
            className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
          >
            + Add Director
          </button>
        </div>

        {formData.directors.map((director, index) => (
          <div
            key={index}
            className="rounded-lg border-2 border-gray-200 bg-gray-50"
            style={{ padding: '20px', marginBottom: '16px' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Director {index + 1}</h4>
              {formData.directors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDirector(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={director.name}
                onChange={(e) => updateDirector(index, 'name', e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                style={{ padding: '12px 16px' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={director.address}
                onChange={(e) => updateDirector(index, 'address', e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                style={{ padding: '12px 16px' }}
                placeholder="Street, City, State ZIP"
                required
              />
            </div>
          </div>
        ))}
      </div>

      {/* Officers */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Corporate Officers</h3>
        </div>

        {formData.officers.map((officer, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {officer.title} *
            </label>
            <input
              type="text"
              value={officer.name}
              onChange={(e) => updateOfficer(index, 'name', e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder={`Name of ${officer.title}`}
              required
            />
          </div>
        ))}
      </div>

      {/* Stock Information */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Stock Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authorized Shares *
            </label>
            <input
              type="number"
              value={formData.authorizedShares}
              onChange={(e) => setFormData({ ...formData, authorizedShares: parseInt(e.target.value) || 0 })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Par Value per Share *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.parValue}
              onChange={(e) => setFormData({ ...formData, parValue: parseFloat(e.target.value) || 0 })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              min="0"
              required
            />
          </div>
        </div>
      </div>

      {/* Meeting & Fiscal Year */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Meeting & Fiscal Year</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Meeting Month *
            </label>
            <select
              value={formData.annualMeetingMonth}
              onChange={(e) => setFormData({ ...formData, annualMeetingMonth: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quorum Percentage *
            </label>
            <input
              type="number"
              value={formData.quorumPercentage}
              onChange={(e) => setFormData({ ...formData, quorumPercentage: parseInt(e.target.value) || 0 })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              min="1"
              max="100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiscal Year End *
            </label>
            <input
              type="text"
              value={formData.fiscalYearEnd}
              onChange={(e) => setFormData({ ...formData, fiscalYearEnd: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="MM/DD (e.g., 12/31)"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}

