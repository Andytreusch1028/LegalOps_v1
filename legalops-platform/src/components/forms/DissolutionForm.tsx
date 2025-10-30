'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, User, CheckCircle } from 'lucide-react';

interface DissolutionData {
  // Dissolution Reason
  dissolutionReason: string;
  
  // Effective Date
  effectiveDate?: string;
  
  // Authorization
  authorizedByName: string;
  authorizedByTitle: string;
  authorizationDate: string;
  
  // Final Details
  allDebtsSettled: boolean;
  allAssetsDistributed: boolean;
  
  // Additional Notes
  additionalNotes?: string;
}

interface DissolutionFormProps {
  initialData?: Partial<DissolutionData>;
  onChange: (data: DissolutionData) => void;
  preFilledBusinessName?: string;
  preFilledEntityType?: 'LLC' | 'CORPORATION';
}

export default function DissolutionForm({
  initialData,
  onChange,
  preFilledBusinessName,
  preFilledEntityType = 'LLC',
}: DissolutionFormProps) {
  const [formData, setFormData] = useState<DissolutionData>({
    dissolutionReason: initialData?.dissolutionReason || '',
    effectiveDate: initialData?.effectiveDate || '',
    authorizedByName: initialData?.authorizedByName || '',
    authorizedByTitle: initialData?.authorizedByTitle || '',
    authorizationDate: initialData?.authorizationDate || new Date().toISOString().split('T')[0],
    allDebtsSettled: initialData?.allDebtsSettled || false,
    allAssetsDistributed: initialData?.allAssetsDistributed || false,
    additionalNotes: initialData?.additionalNotes || '',
  });

  // Notify parent of changes
  useEffect(() => {
    onChange(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  return (
    <div>
      {/* Warning Notice */}
      <div
        className="rounded-lg"
        style={{
          padding: '20px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #fbbf24',
        }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-800 flex-shrink-0" style={{ marginTop: '2px' }} />
          <div>
            <p className="text-yellow-900 font-bold text-sm">
              Important: Dissolution is Permanent
            </p>
            <p className="text-yellow-800 text-xs mt-1">
              Dissolving your {preFilledEntityType === 'LLC' ? 'LLC' : 'corporation'} will permanently close your business with the state. 
              This action cannot be undone. Make sure all debts are settled and assets distributed before proceeding.
            </p>
          </div>
        </div>
      </div>

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
            <strong>Dissolution for:</strong> {preFilledBusinessName}
          </p>
        </div>
      )}

      {/* Dissolution Reason */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Reason for Dissolution</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Why are you dissolving this business? *
          </label>
          <textarea
            value={formData.dissolutionReason}
            onChange={(e) => setFormData({ ...formData, dissolutionReason: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            rows={4}
            placeholder="e.g., Business no longer operating, merging with another entity, retiring from business..."
            required
          />
        </div>
      </div>

      {/* Effective Date */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Effective Date</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dissolution Effective Date (optional)
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
      </div>

      {/* Authorization */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Authorization</h3>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Authorized By (Name) *
          </label>
          <input
            type="text"
            value={formData.authorizedByName}
            onChange={(e) => setFormData({ ...formData, authorizedByName: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="Full name of person authorizing dissolution"
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.authorizedByTitle}
            onChange={(e) => setFormData({ ...formData, authorizedByTitle: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder={preFilledEntityType === 'LLC' ? 'e.g., Manager, Member' : 'e.g., President, Director'}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Authorization Date *
          </label>
          <input
            type="date"
            value={formData.authorizationDate}
            onChange={(e) => setFormData({ ...formData, authorizationDate: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            required
          />
        </div>
      </div>

      {/* Final Confirmations */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px', marginBottom: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Final Confirmations</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Before dissolving, you must confirm the following:
        </p>

        <div
          className="rounded-lg border-2 border-gray-200 bg-gray-50"
          style={{ padding: '16px 20px', marginBottom: '16px' }}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allDebtsSettled}
              onChange={(e) => setFormData({ ...formData, allDebtsSettled: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              style={{ marginTop: '2px' }}
              required
            />
            <div>
              <span className="font-semibold text-gray-900">All debts and liabilities have been settled</span>
              <p className="text-sm text-gray-600 mt-1">
                All outstanding debts, taxes, and obligations have been paid or resolved
              </p>
            </div>
          </label>
        </div>

        <div
          className="rounded-lg border-2 border-gray-200 bg-gray-50"
          style={{ padding: '16px 20px' }}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allAssetsDistributed}
              onChange={(e) => setFormData({ ...formData, allAssetsDistributed: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              style={{ marginTop: '2px' }}
              required
            />
            <div>
              <span className="font-semibold text-gray-900">All assets have been distributed</span>
              <p className="text-sm text-gray-600 mt-1">
                All business assets have been properly distributed to {preFilledEntityType === 'LLC' ? 'members' : 'shareholders'}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Additional Notes */}
      <div
        className="rounded-lg border-2 border-gray-200 bg-white shadow-sm"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Additional Notes (Optional)</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Any additional information or special circumstances?
          </label>
          <textarea
            value={formData.additionalNotes}
            onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            rows={3}
            placeholder="Optional: Any additional details about the dissolution..."
          />
        </div>
      </div>
    </div>
  );
}

