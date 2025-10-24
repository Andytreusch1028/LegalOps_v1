'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Info, Check } from 'lucide-react';
import { FormWizard, FormInput, FormTextArea, FormSection } from '@/components/forms';
import { cn } from '@/components/legalops/theme';

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

interface Service {
  id: string;
  serviceFee: number;
  stateFee: number;
  registeredAgentFee: number;
  totalPrice: number;
  rushFee: number;
  rushFeeAvailable: boolean;
}

interface LLCFormationWizardProps {
  serviceId: string;
  service?: Service;
  onSubmit?: (data: FormData) => void;
}

const STEPS = [
  { id: 1, name: 'Business Info', description: 'Basic details' },
  { id: 2, name: 'Addresses', description: 'Location info' },
  { id: 3, name: 'Registered Agent', description: 'Agent details' },
  { id: 4, name: 'Managers', description: 'Owner info' },
  { id: 5, name: 'Review', description: 'Confirm & submit' },
];

export default function LLCFormationWizard({ serviceId, service, onSubmit }: LLCFormationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sameAsBusinessAddress, setSameAsBusinessAddress] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showRushTooltip, setShowRushTooltip] = useState(false);

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
    registeredAgentName: 'LegalOps Platform LLC',
    registeredAgentAddress: '123 Business Blvd',
    registeredAgentCity: 'Miami',
    registeredAgentState: 'FL',
    registeredAgentZip: '33101',
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

    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.businessName.trim()) errors.businessName = 'Business name is required';
      if (!formData.businessPurpose.trim()) errors.businessPurpose = 'Business purpose is required';
    }

    if (step === 2) {
      if (!formData.businessAddress.trim()) errors.businessAddress = 'Street address is required';
      if (!formData.businessCity.trim()) errors.businessCity = 'City is required';
      if (!formData.businessZip.trim()) errors.businessZip = 'ZIP code is required';
      
      if (!sameAsBusinessAddress) {
        if (!formData.mailingAddress.trim()) errors.mailingAddress = 'Mailing address is required';
        if (!formData.mailingCity.trim()) errors.mailingCity = 'Mailing city is required';
        if (!formData.mailingZip.trim()) errors.mailingZip = 'Mailing ZIP is required';
      }
    }

    if (step === 3) {
      if (!formData.registeredAgentName.trim()) errors.registeredAgentName = 'Registered agent name is required';
      if (!formData.registeredAgentAddress.trim()) errors.registeredAgentAddress = 'Agent address is required';
      if (!formData.registeredAgentCity.trim()) errors.registeredAgentCity = 'Agent city is required';
      if (!formData.registeredAgentZip.trim()) errors.registeredAgentZip = 'Agent ZIP is required';
    }

    if (step === 4) {
      formData.managers.forEach((manager, index) => {
        if (!manager.name.trim()) errors[`manager_${index}_name`] = 'Manager name is required';
        if (!manager.email.trim()) errors[`manager_${index}_email`] = 'Manager email is required';
        if (!manager.phone.trim()) errors[`manager_${index}_phone`] = 'Manager phone is required';
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (onSubmit) {
        onSubmit(formData);
        return;
      }

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

      const data = await response.json();
      router.push(`/checkout/${data.orderId || data.order?.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormWizard
      steps={STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      showTrustSignals={true}
      estimatedTime="5-10 Minutes"
    >
        {/* Step 1: Business Information */}
        {currentStep === 1 && (
          <FormSection
            title="Business Information"
            description="Tell us about your business"
          >
            <FormInput
              label="Business Name"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="e.g., Acme LLC"
              required
              error={fieldErrors.businessName}
            />

            <FormInput
              label="Alternative Business Name"
              name="businessNameAlternative"
              value={formData.businessNameAlternative}
              onChange={handleChange}
              placeholder="If different from above"
            />

            <FormTextArea
              label="Business Purpose"
              name="businessPurpose"
              value={formData.businessPurpose}
              onChange={handleChange}
              placeholder="e.g., Consulting services, retail sales, etc."
              rows={4}
              required
              error={fieldErrors.businessPurpose}
              tooltip="Describe the primary activities your business will engage in (e.g., consulting, retail sales, real estate)"
            />
          </FormSection>
        )}

        {/* Step 2: Addresses */}
        {currentStep === 2 && (
          <FormSection
            title="Business Addresses"
            description="Where is your business located?"
          >
            {/* Principal Address */}
            <div
              className="bg-white rounded-xl"
              style={{
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #0ea5e9',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                padding: '32px',
              }}
            >
              <h3 className="font-semibold text-slate-900" style={{ fontSize: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '32px', lineHeight: '1.4' }}>
                Principal Address
              </h3>

              <div className="space-y-8">

                <FormInput
                  label="Street Address"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  required
                  error={fieldErrors.businessAddress}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormInput
                    label="City"
                    name="businessCity"
                    value={formData.businessCity}
                    onChange={handleChange}
                    placeholder="Miami"
                    required
                    error={fieldErrors.businessCity}
                  />
                  <FormInput
                    label="ZIP Code"
                    name="businessZip"
                    value={formData.businessZip}
                    onChange={handleChange}
                    placeholder="33101"
                    required
                    error={fieldErrors.businessZip}
                  />
                </div>
              </div>
            </div>

            {/* Mailing Address */}
            <div
              className="bg-white rounded-xl"
              style={{
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #10b981',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                padding: '32px',
              }}
            >
              <h3 className="font-semibold text-slate-900" style={{ fontSize: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '32px', lineHeight: '1.4' }}>
                Mailing Address
              </h3>

              <div className="space-y-8">
                <div
                  className="flex items-center bg-slate-50 rounded-lg"
                  style={{
                    border: '2px solid #e2e8f0',
                    padding: '20px',
                  }}
                >
                  <input
                    type="checkbox"
                    id="sameAsBusinessAddress"
                    checked={sameAsBusinessAddress}
                    onChange={handleSameAsBusinessAddress}
                    className="w-5 h-5 text-sky-600 rounded border-gray-300 focus:ring-2 focus:ring-sky-500 cursor-pointer flex-shrink-0"
                  />
                  <label htmlFor="sameAsBusinessAddress" className="font-medium text-gray-900 cursor-pointer" style={{ fontSize: '16px', lineHeight: '1.5', marginLeft: '12px' }}>
                    Same as principal address
                  </label>
                </div>

                {!sameAsBusinessAddress && (
                  <div className="space-y-8 pt-4">
                    <FormInput
                      label="Mailing Address"
                      name="mailingAddress"
                      value={formData.mailingAddress}
                      onChange={handleChange}
                      placeholder="123 Main Street"
                      required
                      error={fieldErrors.mailingAddress}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormInput
                        label="City"
                        name="mailingCity"
                        value={formData.mailingCity}
                        onChange={handleChange}
                        placeholder="Miami"
                        required
                        error={fieldErrors.mailingCity}
                      />
                      <FormInput
                        label="ZIP Code"
                        name="mailingZip"
                        value={formData.mailingZip}
                        onChange={handleChange}
                        placeholder="33101"
                        required
                        error={fieldErrors.mailingZip}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FormSection>
        )}

        {/* Step 3: Registered Agent */}
        {currentStep === 3 && (
          <FormSection title="Registered Agent">
            <div
              className="mb-10 bg-sky-50 rounded-xl flex items-start gap-5"
              style={{
                border: '1px solid #bae6fd',
                borderLeft: '4px solid #0ea5e9',
                padding: '24px',
              }}
            >
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-sky-600" />
              </div>
              <div className="text-slate-700" style={{ fontSize: '16px', lineHeight: '1.6', paddingTop: '4px' }}>
                <p className="mb-2">
                  A registered agent is a person or business authorized to receive legal documents on behalf of your LLC.
                </p>
                <p className="font-medium text-sky-700">
                  ✓ We include free registered agent service for the first year! Our address is pre-filled below, but you can change it if you prefer to use your own.
                </p>
              </div>
            </div>

            <FormInput
              label="Registered Agent Name"
              name="registeredAgentName"
              value={formData.registeredAgentName}
              onChange={handleChange}
              placeholder="John Doe or ABC Registered Agent Services"
              required
              error={fieldErrors.registeredAgentName}
            />

            <FormInput
              label="Registered Agent Address"
              name="registeredAgentAddress"
              value={formData.registeredAgentAddress}
              onChange={handleChange}
              placeholder="123 Main Street"
              required
              error={fieldErrors.registeredAgentAddress}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormInput
                label="City"
                name="registeredAgentCity"
                value={formData.registeredAgentCity}
                onChange={handleChange}
                placeholder="Miami"
                required
                error={fieldErrors.registeredAgentCity}
              />
              <FormInput
                label="ZIP Code"
                name="registeredAgentZip"
                value={formData.registeredAgentZip}
                onChange={handleChange}
                placeholder="33101"
                required
                error={fieldErrors.registeredAgentZip}
              />
            </div>
          </FormSection>
        )}

        {/* Step 4: Managers */}
        {currentStep === 4 && (
          <FormSection title="Manager/Owner Information" description="Add up to 6 managers or owners. At least one is required.">
            <div className="flex justify-end mb-10">
              <span
                className="font-semibold text-sky-600 bg-sky-50 rounded-full"
                style={{
                  fontSize: '16px',
                  border: '2px solid #bae6fd',
                  padding: '12px 24px',
                }}
              >
                {formData.managers.length} of 6
              </span>
            </div>

            <div className="space-y-8">
              {formData.managers.map((manager, index) => (
                <div
                  key={manager.id}
                  className="rounded-xl bg-white hover:shadow-lg transition-all duration-200"
                  style={{
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #8b5cf6',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    padding: '32px',
                  }}
                >
                  <div className="flex justify-between items-start mb-10">
                    <h3 className="font-semibold text-slate-900" style={{ fontSize: '20px', lineHeight: '1.4' }}>
                      Manager {index + 1}
                    </h3>
                    {formData.managers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveManager(manager.id)}
                        className="text-slate-400 hover:text-red-600 font-light transition-colors hover:bg-red-50 rounded"
                        style={{
                          fontSize: '24px',
                          padding: '4px 12px',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="space-y-8">
                    <FormInput
                      label="Full Name"
                      value={manager.name}
                      onChange={(e) => handleManagerChange(manager.id, 'name', e.target.value)}
                      placeholder="John Doe"
                      required
                      error={fieldErrors[`manager_${index}_name`]}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormInput
                        label="Email"
                        type="email"
                        value={manager.email}
                        onChange={(e) => handleManagerChange(manager.id, 'email', e.target.value)}
                        placeholder="john@example.com"
                        required
                        error={fieldErrors[`manager_${index}_email`]}
                      />
                      <FormInput
                        label="Phone"
                        type="tel"
                        value={manager.phone}
                        onChange={(e) => handleManagerChange(manager.id, 'phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        required
                        error={fieldErrors[`manager_${index}_phone`]}
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
                className="w-full border-2 border-dashed border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-sky-400 hover:text-sky-700 transition-all duration-200 mt-8"
                style={{
                  fontSize: '16px',
                  padding: '32px',
                }}
              >
                + Add Another Manager
              </button>
            )}
          </FormSection>
        )}

        {/* Step 5: Review & Additional Options */}
        {currentStep === 5 && (
          <FormSection
            title="Review & Additional Options"
            description="Review your information and select any additional services"
          >

            {/* Summary Cards */}
            <div className="space-y-8">
              {/* Business Info */}
              <div
                className="rounded-xl bg-white hover:shadow-md transition-shadow"
                style={{
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #0ea5e9',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  padding: '32px',
                }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-semibold text-slate-900" style={{ fontSize: '20px', lineHeight: '1.4' }}>
                    Business Information
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-sky-600 hover:text-sky-700 font-semibold hover:bg-sky-50 rounded-lg transition-colors"
                    style={{
                      fontSize: '16px',
                      padding: '8px 16px',
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-5" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  <div className="flex">
                    <span className="text-slate-600 w-48 font-medium">Business Name:</span>
                    <span className="text-slate-900 font-semibold">{formData.businessName}</span>
                  </div>
                  {formData.businessNameAlternative && (
                    <div className="flex">
                      <span className="text-slate-600 w-48 font-medium">Alternative Name:</span>
                      <span className="text-slate-900 font-semibold">{formData.businessNameAlternative}</span>
                    </div>
                  )}
                  <div className="flex">
                    <span className="text-slate-600 w-48 font-medium">Purpose:</span>
                    <span className="text-slate-900 font-semibold">{formData.businessPurpose}</span>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div
                className="rounded-xl bg-white hover:shadow-md transition-shadow"
                style={{
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #10b981',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  padding: '32px',
                }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-semibold text-slate-900" style={{ fontSize: '20px', lineHeight: '1.4' }}>
                    Addresses
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-sky-600 hover:text-sky-700 font-semibold hover:bg-sky-50 rounded-lg transition-colors"
                    style={{
                      fontSize: '16px',
                      padding: '8px 16px',
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-6" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  <div>
                    <p className="text-slate-600 font-semibold mb-3">Principal Address:</p>
                    <p className="text-slate-900">
                      {formData.businessAddress}, {formData.businessCity}, FL {formData.businessZip}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold mb-3">Mailing Address:</p>
                    <p className="text-slate-900">
                      {sameAsBusinessAddress
                        ? 'Same as principal address'
                        : `${formData.mailingAddress}, ${formData.mailingCity}, FL ${formData.mailingZip}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Registered Agent */}
              <div
                className="rounded-xl bg-white hover:shadow-md transition-shadow"
                style={{
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #f59e0b',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  padding: '32px',
                }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-semibold text-slate-900" style={{ fontSize: '20px', lineHeight: '1.4' }}>
                    Registered Agent
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-sky-600 hover:text-sky-700 font-semibold hover:bg-sky-50 rounded-lg transition-colors"
                    style={{
                      fontSize: '16px',
                      padding: '8px 16px',
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-5" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  <div className="flex">
                    <span className="text-slate-600 w-48 font-medium">Name:</span>
                    <span className="text-slate-900 font-semibold">{formData.registeredAgentName}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-600 w-48 font-medium">Address:</span>
                    <span className="text-slate-900 font-semibold">
                      {formData.registeredAgentAddress}, {formData.registeredAgentCity}, FL {formData.registeredAgentZip}
                    </span>
                  </div>
                </div>
              </div>

              {/* Managers */}
              <div
                className="rounded-xl bg-white hover:shadow-md transition-shadow"
                style={{
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #8b5cf6',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  padding: '32px',
                }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-semibold text-slate-900" style={{ fontSize: '20px', lineHeight: '1.4' }}>
                    Managers ({formData.managers.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-sky-600 hover:text-sky-700 font-semibold hover:bg-sky-50 rounded-lg transition-colors"
                    style={{
                      fontSize: '16px',
                      padding: '8px 16px',
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-6">
                  {formData.managers.map((manager, index) => (
                    <div
                      key={manager.id}
                      className="last:border-0"
                      style={{
                        fontSize: '16px',
                        lineHeight: '1.6',
                        borderBottom: index < formData.managers.length - 1 ? '2px solid #f1f5f9' : 'none',
                        paddingBottom: index < formData.managers.length - 1 ? '24px' : '0',
                      }}
                    >
                      <p className="font-semibold text-slate-900 mb-2" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                        {manager.name}
                      </p>
                      <p className="text-slate-600">{manager.email} • {manager.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="mt-12">
              <div
                className="rounded-xl bg-gradient-to-br from-sky-50 to-blue-50"
                style={{
                  border: '2px solid #0ea5e9',
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.15)',
                  padding: '32px',
                }}
              >
                <h3 className="font-semibold text-slate-900 mb-8" style={{ fontSize: '24px', lineHeight: '1.4' }}>
                  Pricing Summary
                </h3>
                <div className="space-y-4" style={{ fontSize: '18px', lineHeight: '1.6' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-medium">LLC Formation Service</span>
                    <span className="text-slate-900 font-semibold">
                      ${service?.serviceFee?.toFixed(2) || '100.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-medium">State Filing Fee</span>
                    <span className="text-slate-900 font-semibold">
                      ${service?.stateFee?.toFixed(2) || '125.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-medium">Registered Agent Fee (1st Year)</span>
                    <span className="text-emerald-600 font-semibold">
                      ${service?.registeredAgentFee?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  {formData.rushProcessing && service?.rushFeeAvailable && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-medium">Rush Processing</span>
                      <span className="text-slate-900 font-semibold">
                        ${service?.rushFee?.toFixed(2) || '50.00'}
                      </span>
                    </div>
                  )}
                  <div
                    className="pt-4 mt-4 flex justify-between items-center"
                    style={{ borderTop: '2px solid #0ea5e9' }}
                  >
                    <span className="text-slate-900 font-bold" style={{ fontSize: '20px' }}>Total</span>
                    <span className="text-sky-600 font-bold" style={{ fontSize: '24px' }}>
                      ${(() => {
                        const baseTotal = service?.totalPrice || 250;
                        const rushFee = (formData.rushProcessing && service?.rushFeeAvailable)
                          ? (service?.rushFee || 50)
                          : 0;
                        return (baseTotal + rushFee).toFixed(2);
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="mt-12" style={{ borderTop: '2px solid #e2e8f0', paddingTop: '48px' }}>
              <h3 className="font-semibold text-slate-900 mb-10" style={{ fontSize: '24px', lineHeight: '1.4' }}>
                Additional Services
              </h3>

              <div
                className="flex items-start gap-6 rounded-xl bg-white hover:shadow-md transition-all duration-200"
                style={{
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #f59e0b',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  padding: '32px',
                }}
              >
                <input
                  type="checkbox"
                  id="rushProcessing"
                  name="rushProcessing"
                  checked={formData.rushProcessing}
                  onChange={handleChange}
                  className="w-6 h-6 text-sky-600 rounded border-gray-300 focus:ring-2 focus:ring-sky-500 mt-1 flex-shrink-0 cursor-pointer"
                />
                <label htmlFor="rushProcessing" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-semibold text-slate-900" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                      Rush Processing
                    </span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowRushTooltip(!showRushTooltip);
                        }}
                        onBlur={() => setTimeout(() => setShowRushTooltip(false), 200)}
                        className="w-5 h-5 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-colors"
                        aria-label="Rush processing information"
                      >
                        <Info className="w-3.5 h-3.5 text-sky-600" />
                      </button>
                      {showRushTooltip && (
                        <div
                          className="absolute z-50 w-96 bg-white rounded-lg shadow-xl"
                          style={{
                            border: '1px solid #e2e8f0',
                            padding: '20px',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginTop: '8px',
                          }}
                        >
                          <div className="text-sm text-slate-700" style={{ lineHeight: '1.6' }}>
                            <p className="font-semibold text-slate-900 mb-3">What is Rush Processing?</p>
                            <p className="mb-3">
                              Instead of processing your filing in the order it's received, we move it to the front of the line and expedite sending it to the state for filing. However, once it reaches the state, they process it under their normal schedule — the state does not offer expedited processing on their end.
                            </p>
                            <div className="bg-slate-50 rounded p-3 mt-3" style={{ border: '1px solid #e2e8f0' }}>
                              <p className="text-xs font-semibold text-slate-600 mb-2">Official Florida Department of State FAQ (Question #17):</p>
                              <p className="text-xs italic text-slate-600">
                                "How can I expedite my filing?"<br />
                                "We do not offer expedited services."
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <span
                      className="inline-flex items-center rounded-full font-semibold bg-amber-100 text-amber-800"
                      style={{
                        fontSize: '14px',
                        border: '2px solid #fcd34d',
                        padding: '6px 16px',
                      }}
                    >
                      +$50
                    </span>
                  </div>
                  <p className="text-slate-600" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    We expedite your filing on our end - processed within 1-2 business days
                  </p>
                </label>
              </div>
            </div>

            {/* Final CTA */}
            <div
              className="bg-gradient-to-r from-emerald-50 to-sky-50 rounded-xl mt-10"
              style={{
                border: '1px solid #a7f3d0',
                borderLeft: '4px solid #10b981',
                padding: '32px',
              }}
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4" style={{ fontSize: '20px', lineHeight: '1.4' }}>
                    Ready to Submit
                  </h4>
                  <p className="text-slate-700" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    Your information has been reviewed. Click "Submit & Continue to Checkout" below to proceed with payment and finalize your LLC formation.
                  </p>
                </div>
              </div>
            </div>
          </FormSection>
        )}
    </FormWizard>
  );
}

