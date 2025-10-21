'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface FormData {
  businessName: string;
  businessNameAlternative: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  mailingAddress: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  registeredAgentName: string;
  registeredAgentAddress: string;
  registeredAgentCity: string;
  registeredAgentState: string;
  registeredAgentZip: string;
  managers: Manager[];
  businessPurpose: string;
  rushProcessing: boolean;
}

interface LLCFormationFormProps {
  serviceId: string;
  onSubmit?: (data: FormData) => void;
}

export default function LLCFormationForm({ serviceId, onSubmit }: LLCFormationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sameAsBusinessAddress, setSameAsBusinessAddress] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessNameAlternative: '',
    businessAddress: '',
    businessCity: '',
    businessState: 'FL',
    businessZip: '',
    mailingAddress: '',
    mailingCity: '',
    mailingState: 'FL',
    mailingZip: '',
    registeredAgentName: '',
    registeredAgentAddress: '',
    registeredAgentCity: '',
    registeredAgentState: 'FL',
    registeredAgentZip: '',
    managers: [{ id: '1', name: '', email: '', phone: '' }],
    businessPurpose: '',
    rushProcessing: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSameAsBusinessAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSameAsBusinessAddress(e.target.checked);
    if (e.target.checked) {
      setFormData(prev => ({
        ...prev,
        mailingAddress: prev.businessAddress,
        mailingCity: prev.businessCity,
        mailingState: prev.businessState,
        mailingZip: prev.businessZip,
      }));
    }
  };

  const handleManagerChange = (id: string, field: keyof Manager, value: string) => {
    setFormData(prev => ({
      ...prev,
      managers: prev.managers.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    }));
  };

  const handleAddManager = () => {
    if (formData.managers.length >= 6) {
      setError('Maximum 6 managers allowed per Sunbiz requirements');
      return;
    }
    setError(null);
    const newId = Date.now().toString();
    setFormData(prev => ({
      ...prev,
      managers: [...prev.managers, { id: newId, name: '', email: '', phone: '' }],
    }));
  };

  const handleRemoveManager = (id: string) => {
    if (formData.managers.length === 1) {
      setError('At least one manager is required');
      return;
    }
    setError(null);
    setFormData(prev => ({
      ...prev,
      managers: prev.managers.filter(m => m.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (onSubmit) {
        onSubmit(formData);
        return;
      }

      // Create order with form data
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          orderType: 'LLC_FORMATION',
          orderData: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      router.push(`/checkout/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {error && (
        <div className="mb-12 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Business Information */}
      <div className="mb-24 pb-24 border-b border-gray-100">
        <h2 className="text-2xl font-light text-gray-900 mb-16">Business Information</h2>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
              placeholder="e.g., Acme LLC"
              className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Alternative Business Name <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              name="businessNameAlternative"
              value={formData.businessNameAlternative}
              onChange={handleChange}
              placeholder="If different from above"
              className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Business Purpose <span className="text-red-500">*</span>
            </label>
            <textarea
              name="businessPurpose"
              value={formData.businessPurpose}
              onChange={handleChange}
              required
              placeholder="e.g., Consulting services, retail sales, etc."
              rows={4}
              className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Principal Address */}
      <div className="mb-24 pb-24 border-b border-gray-100">
        <h2 className="text-2xl font-light text-gray-900 mb-16">Principal Address</h2>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-4">City <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="businessCity"
                value={formData.businessCity}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-4">ZIP Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="businessZip"
                value={formData.businessZip}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mailing Address */}
      <div className="mb-24 pb-24 border-b border-gray-100">
        <h2 className="text-2xl font-light text-gray-900 mb-16">Mailing Address</h2>

        <div className="space-y-8">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sameAsBusinessAddress"
              checked={sameAsBusinessAddress}
              onChange={handleSameAsBusinessAddress}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="sameAsBusinessAddress" className="ml-3 text-sm font-medium text-gray-900">
              Same as principal address
            </label>
          </div>

          {!sameAsBusinessAddress && (
            <div className="space-y-8 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-4">
                Mailing Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mailingAddress"
                value={formData.mailingAddress}
                onChange={handleChange}
                required={!sameAsBusinessAddress}
                className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-4">City <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="mailingCity"
                  value={formData.mailingCity}
                  onChange={handleChange}
                  required={!sameAsBusinessAddress}
                  className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-4">ZIP Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="mailingZip"
                  value={formData.mailingZip}
                  onChange={handleChange}
                  required={!sameAsBusinessAddress}
                  className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
                />
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Registered Agent */}
      <div className="mb-24 pb-24 border-b border-gray-100">
        <h2 className="text-2xl font-light text-gray-900 mb-16">Registered Agent</h2>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Registered Agent Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="registeredAgentName"
              value={formData.registeredAgentName}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Registered Agent Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="registeredAgentAddress"
              value={formData.registeredAgentAddress}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-4">City <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="registeredAgentCity"
                value={formData.registeredAgentCity}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-4">ZIP Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="registeredAgentZip"
                value={formData.registeredAgentZip}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Manager Information */}
      <div className="mb-24 pb-24 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3 mb-12">
          <h2 className="text-2xl font-light text-gray-900">Manager/Owner Information</h2>
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
            {formData.managers.length} of 6
          </span>
        </div>

        <p className="text-base text-gray-600 mb-12">
          Add up to 6 managers or owners. At least one is required.
        </p>

        <div className="space-y-8">
          {formData.managers.map((manager, index) => (
            <div key={manager.id} className="border border-gray-300 rounded-lg p-8 bg-white hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-lg font-medium text-gray-900">Manager {index + 1}</h3>
                {formData.managers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveManager(manager.id)}
                    className="text-gray-400 hover:text-red-600 text-xl font-light transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-4">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manager.name}
                    onChange={(e) => handleManagerChange(manager.id, 'name', e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-4">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={manager.email}
                    onChange={(e) => handleManagerChange(manager.id, 'email', e.target.value)}
                    required
                    placeholder="john@example.com"
                    className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-4">Phone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={manager.phone}
                    onChange={(e) => handleManagerChange(manager.id, 'phone', e.target.value)}
                    required
                    placeholder="(555) 123-4567"
                    className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {formData.managers.length < 6 && (
          <button
            type="button"
            onClick={handleAddManager}
            className="mt-10 w-full border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 text-base"
            style={{ padding: '18px 32px' }}
          >
            + Add Another Manager
          </button>
        )}
      </div>

      {/* Options */}
      <div className="mb-24 pb-24 border-b border-gray-100">
        <h2 className="text-2xl font-light text-gray-900 mb-12">Additional Options</h2>

        <div className="flex items-start gap-5 p-8 border border-gray-300 rounded-lg bg-white hover:shadow-sm transition-shadow">
          <input
            type="checkbox"
            id="rushProcessing"
            name="rushProcessing"
            checked={formData.rushProcessing}
            onChange={handleChange}
            className="w-6 h-6 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 mt-1 flex-shrink-0 cursor-pointer"
          />
          <label htmlFor="rushProcessing" className="cursor-pointer flex-1">
            <span className="block font-medium text-gray-900 text-base">Rush Processing</span>
            <span className="text-sm text-gray-600 mt-2 block">Get approved in 1-2 business days (+$50)</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-16 pb-8">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 text-base"
          style={{ padding: '22px 40px' }}
        >
          {loading ? 'Processing...' : 'Continue to Checkout'}
        </button>
      </div>
    </form>
  );
}

