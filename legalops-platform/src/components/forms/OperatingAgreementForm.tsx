'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Percent, Building2 } from 'lucide-react';

interface Member {
  name: string;
  address: string;
  ownershipPercentage: number;
  capitalContribution: number;
}

interface OperatingAgreementData {
  members: Member[];
  managementStructure: 'MEMBER_MANAGED' | 'MANAGER_MANAGED';
  managerName?: string;
  fiscalYearEnd: string;
  votingRights: 'PROPORTIONAL' | 'EQUAL';
  profitDistribution: 'PROPORTIONAL' | 'CUSTOM';
  customDistributionNotes?: string;
}

interface OperatingAgreementFormProps {
  initialData?: Partial<OperatingAgreementData>;
  onChange: (data: OperatingAgreementData) => void;
  preFilledBusinessName?: string;
}

export default function OperatingAgreementForm({
  initialData,
  onChange,
  preFilledBusinessName,
}: OperatingAgreementFormProps) {
  const [formData, setFormData] = useState<OperatingAgreementData>({
    members: initialData?.members || [
      { name: '', address: '', ownershipPercentage: 100, capitalContribution: 0 },
    ],
    managementStructure: initialData?.managementStructure || 'MEMBER_MANAGED',
    managerName: initialData?.managerName || '',
    fiscalYearEnd: initialData?.fiscalYearEnd || '12/31',
    votingRights: initialData?.votingRights || 'PROPORTIONAL',
    profitDistribution: initialData?.profitDistribution || 'PROPORTIONAL',
    customDistributionNotes: initialData?.customDistributionNotes || '',
  });

  // Notify parent of changes
  useEffect(() => {
    onChange(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleAddMember = () => {
    setFormData({
      ...formData,
      members: [
        ...formData.members,
        { name: '', address: '', ownershipPercentage: 0, capitalContribution: 0 },
      ],
    });
  };

  const handleRemoveMember = (index: number) => {
    if (formData.members.length > 1) {
      const newMembers = formData.members.filter((_, i) => i !== index);
      setFormData({ ...formData, members: newMembers });
    }
  };

  const handleMemberChange = (index: number, field: keyof Member, value: string | number) => {
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, members: newMembers });
  };

  const totalOwnership = formData.members.reduce(
    (sum, member) => sum + (Number(member.ownershipPercentage) || 0),
    0
  );

  const ownershipValid = Math.abs(totalOwnership - 100) < 0.01;

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
            <strong>Operating Agreement for:</strong> {preFilledBusinessName}
          </p>
          <p className="text-blue-700 text-xs mt-1">
            We've pre-filled some information from your LLC formation
          </p>
        </div>
      )}

      {/* Members Section */}
      <div style={{ marginBottom: '32px' }}>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">LLC Members</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {formData.members.map((member, index) => (
            <div
              key={index}
              className="rounded-xl"
              style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                border: '2px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Member {index + 1}</h4>
                {formData.members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Member Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    style={{ padding: '12px 16px' }}
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Member Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={member.address}
                    onChange={(e) => handleMemberChange(index, 'address', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    style={{ padding: '12px 16px' }}
                    placeholder="123 Main St, City, FL 33101"
                    required
                  />
                </div>

                {/* Ownership Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Percent className="w-4 h-4 inline mr-1" />
                    Ownership Percentage *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={member.ownershipPercentage}
                    onChange={(e) =>
                      handleMemberChange(index, 'ownershipPercentage', parseFloat(e.target.value) || 0)
                    }
                    className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    style={{ padding: '12px 16px' }}
                    required
                  />
                </div>

                {/* Capital Contribution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Capital Contribution ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={member.capitalContribution}
                    onChange={(e) =>
                      handleMemberChange(index, 'capitalContribution', parseFloat(e.target.value) || 0)
                    }
                    className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    style={{ padding: '12px 16px' }}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Member Button */}
        <button
          type="button"
          onClick={handleAddMember}
          className="flex items-center gap-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all font-medium"
          style={{ marginTop: '20px', padding: '12px 24px' }}
        >
          <Plus className="w-4 h-4" />
          Add Another Member
        </button>

        {/* Ownership Validation */}
        <div
          className={`rounded-lg ${
            ownershipValid
              ? 'bg-green-50 border-2 border-green-300'
              : 'bg-red-50 border-2 border-red-300'
          }`}
          style={{ marginTop: '20px', padding: '20px' }}
        >
          <p
            className={`text-sm font-medium ${
              ownershipValid ? 'text-green-800' : 'text-red-800'
            }`}
          >
            Total Ownership: {totalOwnership.toFixed(2)}%{' '}
            {ownershipValid ? '✓' : '(Must equal 100%)'}
          </p>
        </div>
      </div>

      {/* Management Structure */}
      <div style={{ marginTop: '32px', marginBottom: '32px' }}>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Management Structure</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <label
            className={`rounded-lg border-2 cursor-pointer transition-all ${
              formData.managementStructure === 'MEMBER_MANAGED'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 bg-white hover:border-purple-300'
            }`}
            style={{ padding: '16px 20px' }}
          >
            <input
              type="radio"
              name="managementStructure"
              value="MEMBER_MANAGED"
              checked={formData.managementStructure === 'MEMBER_MANAGED'}
              onChange={(e) =>
                setFormData({ ...formData, managementStructure: e.target.value as any })
              }
              className="mr-3"
            />
            <span className="font-semibold text-gray-900">Member-Managed</span>
            <p className="text-sm text-gray-600 ml-6" style={{ marginTop: '4px' }}>
              All members participate in day-to-day management
            </p>
          </label>

          <label
            className={`rounded-lg border-2 cursor-pointer transition-all ${
              formData.managementStructure === 'MANAGER_MANAGED'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 bg-white hover:border-purple-300'
            }`}
            style={{ padding: '16px 20px' }}
          >
            <input
              type="radio"
              name="managementStructure"
              value="MANAGER_MANAGED"
              checked={formData.managementStructure === 'MANAGER_MANAGED'}
              onChange={(e) =>
                setFormData({ ...formData, managementStructure: e.target.value as any })
              }
              className="mr-3"
            />
            <span className="font-semibold text-gray-900">Manager-Managed</span>
            <p className="text-sm text-gray-600 ml-6" style={{ marginTop: '4px' }}>
              Designated manager(s) handle day-to-day operations
            </p>
          </label>
        </div>

        {/* Manager Name (if manager-managed) */}
        {formData.managementStructure === 'MANAGER_MANAGED' && (
          <div style={{ marginTop: '20px' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manager Name *
            </label>
            <input
              type="text"
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              style={{ padding: '12px 16px' }}
              placeholder="Name of designated manager"
              required
            />
          </div>
        )}
      </div>

      {/* Additional Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginTop: '32px', marginBottom: '32px' }}>
        {/* Fiscal Year End */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fiscal Year End Date
          </label>
          <input
            type="text"
            value={formData.fiscalYearEnd}
            onChange={(e) => setFormData({ ...formData, fiscalYearEnd: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
            placeholder="12/31"
          />
          <p className="text-xs text-gray-500 mt-1">Format: MM/DD (e.g., 12/31)</p>
        </div>

        {/* Voting Rights */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voting Rights
          </label>
          <select
            value={formData.votingRights}
            onChange={(e) =>
              setFormData({ ...formData, votingRights: e.target.value as any })
            }
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ padding: '12px 16px' }}
          >
            <option value="PROPORTIONAL">Proportional to Ownership</option>
            <option value="EQUAL">Equal (One Member, One Vote)</option>
          </select>
        </div>
      </div>

      {/* Profit Distribution */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profit/Loss Distribution
        </label>
        <select
          value={formData.profitDistribution}
          onChange={(e) =>
            setFormData({ ...formData, profitDistribution: e.target.value as any })
          }
          className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          style={{ padding: '12px 16px' }}
        >
          <option value="PROPORTIONAL">Proportional to Ownership Percentage</option>
          <option value="CUSTOM">Custom Distribution (specify below)</option>
        </select>

        {formData.profitDistribution === 'CUSTOM' && (
          <textarea
            value={formData.customDistributionNotes}
            onChange={(e) =>
              setFormData({ ...formData, customDistributionNotes: e.target.value })
            }
            className="w-full border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            style={{ marginTop: '12px', padding: '12px 16px' }}
            rows={3}
            placeholder="Describe your custom profit/loss distribution arrangement..."
          />
        )}
      </div>
    </div>
  );
}

