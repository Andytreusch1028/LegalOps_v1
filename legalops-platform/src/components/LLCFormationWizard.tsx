'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';
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

interface LLCFormationWizardProps {
  serviceId: string;
  onSubmit?: (data: FormData) => void;
}

const STEPS = [
  { id: 1, name: 'Business Info', description: 'Basic details' },
  { id: 2, name: 'Addresses', description: 'Location info' },
  { id: 3, name: 'Registered Agent', description: 'Agent details' },
  { id: 4, name: 'Managers', description: 'Owner info' },
  { id: 5, name: 'Review', description: 'Confirm & submit' },
];

export default function LLCFormationWizard({ serviceId, onSubmit }: LLCFormationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sameAsBusinessAddress, setSameAsBusinessAddress] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

      const order = await response.json();
      router.push(`/checkout/${order.id}`);
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
            <div className="space-y-8 p-8 bg-slate-50 rounded-xl border-2 border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 pb-4 border-b-2 border-slate-300">
                Principal Address
              </h3>

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

            {/* Mailing Address */}
            <div className="space-y-8 p-8 bg-slate-50 rounded-xl border-2 border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 pb-4 border-b-2 border-slate-300">
                Mailing Address
              </h3>

              <div className="flex items-center p-5 bg-white rounded-lg border-2 border-slate-200">
                <input
                  type="checkbox"
                  id="sameAsBusinessAddress"
                  checked={sameAsBusinessAddress}
                  onChange={handleSameAsBusinessAddress}
                  className="w-5 h-5 text-sky-600 rounded border-gray-300 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="sameAsBusinessAddress" className="ml-4 text-base font-medium text-gray-900 cursor-pointer">
                  Same as principal address
                </label>
              </div>

              {!sameAsBusinessAddress && (
                <div className="space-y-2 pt-6">
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
          </FormSection>
        )}

        {/* Step 3: Registered Agent */}
        {currentStep === 3 && (
          <FormSection title="Registered Agent">
            <div className="mb-10 p-6 bg-sky-50 border-2 border-sky-200 rounded-xl flex items-start gap-4">
              <Info className="w-5 h-5 mt-1 flex-shrink-0 text-sky-600" />
              <p className="text-base text-slate-700 leading-relaxed">
                A registered agent is a person or business authorized to receive legal documents on behalf of your LLC
              </p>
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
            <div className="flex justify-end mb-8">
              <span className="text-base font-semibold text-sky-600 bg-sky-50 px-6 py-3 rounded-full border-2 border-sky-200">
                {formData.managers.length} of 6
              </span>
            </div>

            <div className="space-y-8">
              {formData.managers.map((manager, index) => (
                <div key={manager.id} className="border-2 border-slate-200 rounded-xl p-8 bg-white hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-xl font-semibold text-slate-900">Manager {index + 1}</h3>
                    {formData.managers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveManager(manager.id)}
                        className="text-slate-400 hover:text-red-600 text-2xl font-light transition-colors px-3 py-1 hover:bg-red-50 rounded"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
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
                className="w-full border-2 border-dashed border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-sky-400 hover:text-sky-700 transition-all duration-200 text-base py-8 mt-8"
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
            <div className="space-y-6">
              {/* Business Info */}
              <div className="border-2 border-slate-200 rounded-xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-900">Business Information</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-base text-sky-600 hover:text-sky-700 font-semibold px-4 py-2 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-4 text-base">
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
              <div className="border-2 border-slate-200 rounded-xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-900">Addresses</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-base text-sky-600 hover:text-sky-700 font-semibold px-4 py-2 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-6 text-base">
                  <div>
                    <p className="text-slate-600 font-semibold mb-2">Principal Address:</p>
                    <p className="text-slate-900">
                      {formData.businessAddress}, {formData.businessCity}, FL {formData.businessZip}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold mb-2">Mailing Address:</p>
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
              <div className="border-2 border-slate-200 rounded-xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-900">Registered Agent</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-base text-sky-600 hover:text-sky-700 font-semibold px-4 py-2 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-4 text-base">
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
              <div className="border-2 border-slate-200 rounded-xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-900">Managers ({formData.managers.length})</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-base text-sky-600 hover:text-sky-700 font-semibold px-4 py-2 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-5">
                  {formData.managers.map((manager, index) => (
                    <div key={manager.id} className="text-base pb-5 border-b-2 border-slate-100 last:border-0 last:pb-0">
                      <p className="font-semibold text-slate-900 mb-2 text-lg">{manager.name}</p>
                      <p className="text-slate-600">{manager.email} • {manager.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="border-t-2 border-slate-200 pt-10 mt-10">
              <h3 className="text-2xl font-semibold text-slate-900 mb-8">Additional Services</h3>

              <div className="flex items-start gap-6 p-8 border-2 border-slate-200 rounded-xl bg-white hover:border-sky-300 hover:shadow-md transition-all duration-200">
                <input
                  type="checkbox"
                  id="rushProcessing"
                  name="rushProcessing"
                  checked={formData.rushProcessing}
                  onChange={handleChange}
                  className="w-6 h-6 text-sky-600 rounded border-gray-300 focus:ring-2 focus:ring-sky-500 mt-1 flex-shrink-0 cursor-pointer"
                />
                <label htmlFor="rushProcessing" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-semibold text-slate-900 text-lg">Rush Processing</span>
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border-2 border-amber-200">
                      +$50
                    </span>
                  </div>
                  <p className="text-base text-slate-600 leading-relaxed">Get approved in 1-2 business days instead of the standard 5-7 days</p>
                </label>
              </div>
            </div>

            {/* Final CTA */}
            <div className="bg-gradient-to-r from-emerald-50 to-sky-50 border-2 border-emerald-200 rounded-xl p-8 mt-10">
              <div className="flex items-start gap-5">
                <Check className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 text-xl">Ready to Submit</h4>
                  <p className="text-base text-slate-700 leading-relaxed">
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

