'use client';

import { useState, useEffect } from 'react';
import { FileText, Building2, User, Mail } from 'lucide-react';

interface NameReservationData {
  // Proposed Names (up to 3 choices)
  firstChoiceName: string;
  secondChoiceName?: string;
  thirdChoiceName?: string;
  
  // Entity Type
  entityType: 'LLC' | 'CORPORATION' | 'PARTNERSHIP';
  
  // Applicant Information
  applicantName: string;
  applicantAddress: string;
  applicantEmail: string;
  applicantPhone: string;
  
  // Purpose
  intendedUse: string;
}

interface NameReservationFormProps {
  initialData?: Partial<NameReservationData>;
  onChange: (data: NameReservationData) => void;
}

export default function NameReservationForm({
  initialData,
  onChange,
}: NameReservationFormProps) {
  const [formData, setFormData] = useState<NameReservationData>({
    firstChoiceName: initialData?.firstChoiceName || '',
    secondChoiceName: initialData?.secondChoiceName || '',
    thirdChoiceName: initialData?.thirdChoiceName || '',
    entityType: initialData?.entityType || 'LLC',
    applicantName: initialData?.applicantName || '',
    applicantAddress: initialData?.applicantAddress || '',
    applicantEmail: initialData?.applicantEmail || '',
    applicantPhone: initialData?.applicantPhone || '',
    intendedUse: initialData?.intendedUse || '',
  });

  // Notify parent of changes
  useEffect(() => {
    onChange(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  return (
    <div>
      {/* Info Notice */}
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
          <strong>Name Reservation - 120 Days</strong>
        </p>
        <p className="text-blue-700 text-xs mt-1">
          Reserve your business name for 120 days while you prepare to form your entity. 
          Provide up to 3 name choices in order of preference.
        </p>
      </div>

      {/* Proposed Names */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Proposed Business Names</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Provide up to 3 name choices in order of preference. If your first choice is unavailable, 
          we'll check your second and third choices.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Choice Name *
          </label>
          <input
            type="text"
            value={formData.firstChoiceName}
            onChange={(e) => setFormData({ ...formData, firstChoiceName: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="Your Business Name LLC"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Must include LLC, L.L.C., Inc., Corp., or Corporation as appropriate
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Second Choice Name (optional)
          </label>
          <input
            type="text"
            value={formData.secondChoiceName}
            onChange={(e) => setFormData({ ...formData, secondChoiceName: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="Alternative Business Name LLC"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Third Choice Name (optional)
          </label>
          <input
            type="text"
            value={formData.thirdChoiceName}
            onChange={(e) => setFormData({ ...formData, thirdChoiceName: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="Another Alternative LLC"
          />
        </div>
      </div>

      {/* Entity Type */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Entity Type</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What type of entity will you form? *
          </label>
          <select
            value={formData.entityType}
            onChange={(e) => setFormData({ ...formData, entityType: e.target.value as any })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            required
          >
            <option value="LLC">Limited Liability Company (LLC)</option>
            <option value="CORPORATION">Corporation (Inc./Corp.)</option>
            <option value="PARTNERSHIP">Partnership</option>
          </select>
        </div>
      </div>

      {/* Applicant Information */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Applicant Information</h3>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.applicantName}
            onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="Your full name"
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <textarea
            value={formData.applicantAddress}
            onChange={(e) => setFormData({ ...formData, applicantAddress: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            rows={2}
            placeholder="Street Address&#10;City, State ZIP"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.applicantEmail}
              onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.applicantPhone}
              onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="(555) 123-4567"
              required
            />
          </div>
        </div>
      </div>

      {/* Intended Use */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Intended Use</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What will this business do? *
          </label>
          <textarea
            value={formData.intendedUse}
            onChange={(e) => setFormData({ ...formData, intendedUse: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            rows={3}
            placeholder="Brief description of your business purpose or industry..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This helps ensure the name is appropriate for your intended business type
          </p>
        </div>
      </div>
    </div>
  );
}

