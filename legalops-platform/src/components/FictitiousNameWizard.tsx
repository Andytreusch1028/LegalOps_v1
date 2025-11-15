'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormWizard, FormSection, FormInput, FormSelect, FormCheckbox } from '@/components/forms';
import { FictitiousNameFormData } from '@/types/forms';
import { Info, AlertCircle, Newspaper, Building2, User, Mail, CheckCircle, Save, AlertTriangle, Phone, Globe, DollarSign, Clock } from 'lucide-react';
import { getSuggestedCounty } from '@/lib/geolocation';
import { getNewspapersByCounty } from '@/lib/florida-newspapers';

// All 67 Florida counties in alphabetical order
const FLORIDA_COUNTIES = [
  'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward', 'Calhoun', 'Charlotte',
  'Citrus', 'Clay', 'Collier', 'Columbia', 'DeSoto', 'Dixie', 'Duval', 'Escambia',
  'Flagler', 'Franklin', 'Gadsden', 'Gilchrist', 'Glades', 'Gulf', 'Hamilton', 'Hardee',
  'Hendry', 'Hernando', 'Highlands', 'Hillsborough', 'Holmes', 'Indian River', 'Jackson',
  'Jefferson', 'Lafayette', 'Lake', 'Lee', 'Leon', 'Levy', 'Liberty', 'Madison',
  'Manatee', 'Marion', 'Martin', 'Miami-Dade', 'Monroe', 'Nassau', 'Okaloosa', 'Okeechobee',
  'Orange', 'Osceola', 'Palm Beach', 'Pasco', 'Pinellas', 'Polk', 'Putnam', 'St. Johns',
  'St. Lucie', 'Santa Rosa', 'Sarasota', 'Seminole', 'Sumter', 'Suwannee', 'Taylor',
  'Union', 'Volusia', 'Wakulla', 'Walton', 'Washington'
];

const STEPS = [
  { id: 1, name: 'Fictitious Name', description: 'DBA Name' },
  { id: 2, name: 'Business Location', description: 'Address & County' },
  { id: 3, name: 'Owner Information', description: 'Who Owns the DBA' },
  { id: 4, name: 'Advertisement', description: 'Newspaper Requirement' },
  { id: 5, name: 'Review', description: 'Confirm Details' },
];

interface FictitiousNameWizardProps {
  onSubmit: (data: FictitiousNameFormData) => Promise<void>;
  initialData?: Partial<FictitiousNameFormData>;
}

export default function FictitiousNameWizard({ onSubmit, initialData }: FictitiousNameWizardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [calendarEvent, setCalendarEvent] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [suggestedCounty, setSuggestedCounty] = useState<string | null>(null);
  const [countyAutoFilled, setCountyAutoFilled] = useState(false);
  const [alreadyPublished, setAlreadyPublished] = useState(false); // Default to NO (not yet published) - safer for UPL compliance

  const [formData, setFormData] = useState<FictitiousNameFormData>({
    fictitiousName: initialData?.fictitiousName || '',
    mailingAddress: initialData?.mailingAddress || {
      street: '',
      city: '',
      state: 'FL',
      zipCode: '',
    },
    principalCounty: initialData?.principalCounty || '',
    hasFEIN: initialData?.hasFEIN || false,
    fein: initialData?.fein || '',
    ownerType: initialData?.ownerType || 'INDIVIDUAL',
    individualOwners: initialData?.individualOwners || [{
      firstName: '',
      lastName: '',
      middleName: '',
      address: {
        street: '',
        city: '',
        state: 'FL',
        zipCode: '',
      },
    }],
    businessEntityOwners: initialData?.businessEntityOwners || [],
    newspaperAdvertised: initialData?.newspaperAdvertised || false,
    newspaperName: initialData?.newspaperName || '',
    advertisementDate: initialData?.advertisementDate || '',
    paymentTiming: initialData?.paymentTiming || undefined,
    certificateOfStatus: initialData?.certificateOfStatus || false,
    certifiedCopy: initialData?.certifiedCopy || false,
    correspondenceEmail: initialData?.correspondenceEmail || '',
  });

  // Check for resumed draft on mount (guest magic link)
  useEffect(() => {
    const draftData = sessionStorage.getItem('dba_draft_data');
    const draftEmail = sessionStorage.getItem('dba_draft_email');

    if (draftData && draftEmail) {
      try {
        const parsedData = JSON.parse(draftData);
        setFormData(parsedData);
        // Start at Step 4 (newspaper publication step)
        setCurrentStep(4);
        // Clear session storage
        sessionStorage.removeItem('dba_draft_data');
        sessionStorage.removeItem('dba_draft_email');
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Load saved draft for authenticated users on mount
  useEffect(() => {
    // Don't auto-load if resuming from guest magic link
    const hasGuestDraft = sessionStorage.getItem('dba_draft_data');

    if (session?.user?.id && !initialData && !hasGuestDraft) {
      loadSavedDraft();
    }
  }, [session?.user?.id]);

  // Smart county default - get suggested county based on IP geolocation
  useEffect(() => {
    // Only suggest if county is not already set
    if (!formData.principalCounty && !initialData?.principalCounty) {
      getSuggestedCounty().then((county) => {
        if (county) {
          setSuggestedCounty(county);
          // Auto-fill the county
          setFormData(prev => ({ ...prev, principalCounty: county }));
          setCountyAutoFilled(true);
        }
      }).catch((error) => {
        console.error('[Geolocation] Error:', error);
      });
    }
  }, []);

  // Auto-save draft every 30 seconds for authenticated users
  useEffect(() => {
    if (!session?.user?.id) return; // Only for authenticated users

    const autoSaveInterval = setInterval(() => {
      autoSaveDraft();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData, currentStep, session?.user?.id]);

  const loadSavedDraft = async () => {
    try {
      const response = await fetch('/api/form-drafts/load?formType=DBA_REGISTRATION');

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.draft) {
          // Preserve geolocation county if draft doesn't have one
          setFormData(prev => {
            const draftData = data.draft.formData;
            // If draft has no county but we have a suggested county, keep the suggested one
            if (!draftData.principalCounty && prev.principalCounty) {
              return { ...draftData, principalCounty: prev.principalCounty };
            }
            return draftData;
          });
          setCurrentStep(data.draft.currentStep);
          setLastSavedAt(new Date(data.draft.updatedAt));
        }
      }
    } catch (error) {
      console.error('Error loading saved draft:', error);
    }
  };

  const autoSaveDraft = async () => {
    // Don't auto-save if not logged in
    if (!session?.user?.id) {
      return;
    }

    // Don't auto-save if on first step with no data
    if (currentStep === 1 && !formData.fictitiousName.trim()) {
      return;
    }

    setAutoSaveStatus('saving');

    try {
      const response = await fetch('/api/form-drafts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'DBA_REGISTRATION',
          formData,
          currentStep,
          totalSteps: 5,
          displayName: formData.fictitiousName || 'Untitled DBA',
          emailRemindersEnabled: false, // Will be set separately
        }),
      });

      if (response.ok) {
        setAutoSaveStatus('saved');
        setLastSavedAt(new Date());

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Auto-save failed:', response.status, errorData);
        setAutoSaveStatus('error');
      }
    } catch (error) {
      console.error('Error auto-saving draft:', error);
      setAutoSaveStatus('error');
    }
  };

  const validateStep = (step: number, isSubmitting: boolean = false): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fictitiousName.trim()) {
        errors.fictitiousName = 'Fictitious name is required';
      }
      if (!formData.correspondenceEmail.trim()) {
        errors.correspondenceEmail = 'Email is required';
      }
    }

    if (step === 2) {
      if (!formData.mailingAddress.street.trim()) {
        errors['mailingAddress.street'] = 'Street address is required';
      }
      if (!formData.mailingAddress.city.trim()) {
        errors['mailingAddress.city'] = 'City is required';
      }
      if (!formData.mailingAddress.zipCode.trim()) {
        errors['mailingAddress.zipCode'] = 'ZIP code is required';
      }
      if (!formData.principalCounty) {
        errors.principalCounty = 'County is required';
      }
    }

    if (step === 3) {
      if (formData.ownerType === 'INDIVIDUAL') {
        formData.individualOwners?.forEach((owner, index) => {
          if (!owner.firstName.trim()) {
            errors[`individualOwners.${index}.firstName`] = 'First name is required';
          }
          if (!owner.lastName.trim()) {
            errors[`individualOwners.${index}.lastName`] = 'Last name is required';
          }
          if (!owner.address.street.trim()) {
            errors[`individualOwners.${index}.address.street`] = 'Street address is required';
          }
          if (!owner.address.city.trim()) {
            errors[`individualOwners.${index}.address.city`] = 'City is required';
          }
          if (!owner.address.zipCode.trim()) {
            errors[`individualOwners.${index}.address.zipCode`] = 'ZIP code is required';
          }
        });
      } else {
        formData.businessEntityOwners?.forEach((owner, index) => {
          if (!owner.entityName.trim()) {
            errors[`businessEntityOwners.${index}.entityName`] = 'Entity name is required';
          }
          if (!owner.entityAddress.street.trim()) {
            errors[`businessEntityOwners.${index}.entityAddress.street`] = 'Street address is required';
          }
        });
      }
    }

    // Step 4: Validate payment timing selection and certification
    if (step === 4) {
      // If NOT certified, require payment timing selection
      if (!formData.newspaperAdvertised && !formData.paymentTiming) {
        errors.paymentTiming = 'Please select when you would like to pay';
      }

      // If certified, validate required publication details
      if (formData.newspaperAdvertised) {
        if (!formData.newspaperName || !formData.newspaperName.trim()) {
          errors.newspaperName = 'Newspaper name is required when certifying publication';
        }
        if (!formData.advertisementDate || !formData.advertisementDate.trim()) {
          errors.advertisementDate = 'Publication date is required when certifying publication';
        }
      }

      // Only validate certification if submitting and user chose PAY_NOW
      if (isSubmitting) {
        if (formData.paymentTiming === 'PAY_NOW' && !formData.newspaperAdvertised) {
          errors.newspaperAdvertised = 'You must certify publication before paying now. Choose "Pay After Publication" if you haven\'t published yet.';
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    // Validate with isSubmitting=true to enforce certification requirement
    if (!validateStep(currentStep, true)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If user selected "Pay After Publication", save draft instead of creating order
      if (formData.paymentTiming === 'PAY_AFTER_PUBLICATION') {
        await handleSaveDraft();

        // Wait 2 seconds to show success message, then redirect
        setTimeout(() => {
          if (session?.user?.id) {
            router.push('/dashboard/customer');
          } else {
            router.push('/');
          }
        }, 2000);

        setLoading(false);
        return;
      }

      // Otherwise, proceed to checkout (PAY_NOW)
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  const addIndividualOwner = () => {
    setFormData(prev => ({
      ...prev,
      individualOwners: [
        ...(prev.individualOwners || []),
        {
          firstName: '',
          lastName: '',
          middleName: '',
          address: {
            street: '',
            city: '',
            state: 'FL',
            zipCode: '',
          },
        },
      ],
    }));
  };

  const removeIndividualOwner = (index: number) => {
    setFormData(prev => ({
      ...prev,
      individualOwners: prev.individualOwners?.filter((_, i) => i !== index),
    }));
  };

  const addBusinessEntityOwner = () => {
    setFormData(prev => ({
      ...prev,
      businessEntityOwners: [
        ...(prev.businessEntityOwners || []),
        {
          entityName: '',
          entityAddress: {
            street: '',
            city: '',
            state: 'FL',
            zipCode: '',
          },
          floridaDocumentNumber: '',
          fein: '',
          feinStatus: 'NOT_APPLICABLE',
        },
      ],
    }));
  };

  const removeBusinessEntityOwner = (index: number) => {
    setFormData(prev => ({
      ...prev,
      businessEntityOwners: prev.businessEntityOwners?.filter((_, i) => i !== index),
    }));
  };

  const downloadCalendarReminder = () => {
    if (!calendarEvent) return;

    const blob = new Blob([calendarEvent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DBA-Reminder-${formData.fictitiousName.replace(/[^a-zA-Z0-9]/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveDraft = async () => {
    // Validate email first
    if (!formData.correspondenceEmail || !formData.correspondenceEmail.trim()) {
      setError('Please enter your email address in Step 1 before saving.');
      return;
    }

    setSavingDraft(true);
    setError(null);

    try {
      // For authenticated users, save to FormDraft AND send magic link + create notice
      if (session?.user?.id) {
        console.log('[DBA Save] Authenticated user - calling save-draft-authenticated API');
        console.log('[DBA Save] Current step:', currentStep);
        console.log('[DBA Save] Email:', formData.correspondenceEmail);

        const response = await fetch('/api/dba/save-draft-authenticated', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData,
            currentStep,
            email: formData.correspondenceEmail,
          }),
        });

        const data = await response.json();
        console.log('[DBA Save] API response:', data);

        if (!response.ok) {
          console.error('[DBA Save] API error:', data.error);
          throw new Error(data.error || 'Failed to save draft');
        }

        // Store calendar event for download
        if (data.calendarEvent) {
          console.log('[DBA Save] Calendar event received:', data.calendarEvent.substring(0, 50) + '...');
          setCalendarEvent(data.calendarEvent);
        } else {
          console.warn('[DBA Save] No calendar event in response');
        }

        console.log('[DBA Save] Setting draftSaved to true');
        setDraftSaved(true);
        console.log('[DBA Save] Session user ID:', session?.user?.id);
        console.log('[DBA Save] Calendar event state will be set on next render');

        // Don't auto-hide the success message - let user dismiss it manually or navigate away
      } else {
        // For guests, use existing guest workflow
        console.log('[DBA Save] Guest user - calling save-draft API');
        console.log('[DBA Save] Email:', formData.correspondenceEmail);

        const response = await fetch('/api/dba/save-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData,
            email: formData.correspondenceEmail,
          }),
        });

        const data = await response.json();
        console.log('[DBA Save] API response:', data);

        if (!response.ok) {
          console.error('[DBA Save] API error:', data.error);
          throw new Error(data.error || 'Failed to save draft');
        }

        // Store calendar event for download
        if (data.calendarEvent) {
          console.log('[DBA Save] Calendar event received:', data.calendarEvent.substring(0, 50) + '...');
          setCalendarEvent(data.calendarEvent);
        } else {
          console.warn('[DBA Save] No calendar event in response');
        }

        console.log('[DBA Save] Setting draftSaved to true');
        setDraftSaved(true);

        // Don't auto-hide the success message - let user dismiss it manually or navigate away
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft. Please try again.');
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <div>
      {/* Auto-Save Status Indicator (for authenticated users only) */}
      {session?.user?.id && currentStep > 1 && autoSaveStatus !== 'idle' && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 20px',
          background: autoSaveStatus === 'saved' ? '#D1FAE5' :
                     autoSaveStatus === 'saving' ? '#DBEAFE' :
                     autoSaveStatus === 'error' ? '#FEE2E2' : '#F3F4F6',
          border: `2px solid ${autoSaveStatus === 'saved' ? '#10B981' :
                               autoSaveStatus === 'saving' ? '#0EA5E9' :
                               autoSaveStatus === 'error' ? '#EF4444' : '#E5E7EB'}`,
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 1000,
          transition: 'all 0.3s',
        }}>
          {autoSaveStatus === 'saving' && (
            <>
              <Save size={16} className="text-sky-600 animate-pulse" />
              <span style={{ color: '#0369A1' }}>Saving...</span>
            </>
          )}
          {autoSaveStatus === 'saved' && (
            <>
              <CheckCircle size={16} className="text-green-600" />
              <span style={{ color: '#065F46' }}>
                Saved {lastSavedAt && `at ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </>
          )}
          {autoSaveStatus === 'error' && (
            <>
              <AlertCircle size={16} className="text-red-600" />
              <span style={{ color: '#991B1B' }}>Save failed</span>
            </>
          )}
        </div>
      )}

      <FormWizard
        steps={STEPS}
        currentStep={currentStep}
        onNext={handleNext}
        onBack={handleBack}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        submitButtonText={
          formData.newspaperAdvertised || formData.paymentTiming === 'PAY_NOW'
            ? 'Continue to Payment'
            : session?.user?.id
              ? 'Save Information & Return to Dashboard'
              : 'Save Information & Return to Home'
        }
        showTrustSignals={true}
        estimatedTime="5-7 Minutes"
      >
        {/* Step 1: Fictitious Name */}
        {currentStep === 1 && (
          <FormSection
            title="Fictitious Name Registration"
            description="Enter the DBA name you want to register"
          >
          <div style={{
            padding: '16px 20px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
          }}>
            <Info size={20} className="text-blue-600 flex-shrink-0" style={{ marginTop: '2px' }} />
            <div style={{ fontSize: '14px', color: '#1E40AF', lineHeight: '1.6' }}>
              <strong>What is a Fictitious Name (DBA)?</strong>
              <p style={{ marginTop: '8px', marginBottom: '0' }}>
                A "Doing Business As" (DBA) name allows you to operate your business under a name different from your legal name or entity name. 
                For example, if John Smith wants to operate "Smith's Landscaping," he would register that as a fictitious name.
              </p>
            </div>
          </div>

          <FormInput
            label="Fictitious Name to Register"
            name="fictitiousName"
            value={formData.fictitiousName}
            onChange={(e) => setFormData(prev => ({ ...prev, fictitiousName: e.target.value }))}
            placeholder="e.g., Smith's Landscaping"
            required
            error={fieldErrors.fictitiousName}
            tooltip="Enter only the DBA name, not 'Your Name DBA Business Name'"
          />

          <FormInput
            label="Email Address"
            name="correspondenceEmail"
            type="email"
            value={formData.correspondenceEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, correspondenceEmail: e.target.value }))}
            placeholder="your@email.com"
            required
            error={fieldErrors.correspondenceEmail}
            tooltip="All correspondence and confirmation will be sent to this email"
          />
        </FormSection>
      )}

      {/* Step 2: Business Location */}
      {currentStep === 2 && (
        <FormSection
          title="Business Location"
          description="Where will your business operate?"
        >
          {countyAutoFilled && suggestedCounty && (
            <div style={{
              padding: '12px 16px',
              background: '#F0FDF4',
              border: '1px solid #86EFAC',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <CheckCircle size={16} className="text-green-600" />
              <p style={{ fontSize: '13px', color: '#166534', margin: 0 }}>
                We've pre-selected <strong>{suggestedCounty} County</strong> based on your location. You can change this if needed.
              </p>
            </div>
          )}

          <FormSelect
            label="Florida County of Principal Place of Business"
            name="principalCounty"
            value={formData.principalCounty}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, principalCounty: e.target.value }));
              setCountyAutoFilled(false); // Remove the auto-fill indicator once user changes it
            }}
            required
            error={fieldErrors.principalCounty}
            tooltip="Select the county where your business will primarily operate"
            key={`county-select-${formData.principalCounty || 'empty'}`}
          >
            <option value="">Select a county...</option>
            {FLORIDA_COUNTIES.map(county => (
              <option key={county} value={county}>{county}</option>
            ))}
          </FormSelect>

          <div style={{ marginTop: '32px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
              Mailing Address
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
              Where should we send correspondence?
            </p>
          </div>

          <FormInput
            label="Street Address"
            name="mailingAddress.street"
            value={formData.mailingAddress.street}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              mailingAddress: { ...prev.mailingAddress, street: e.target.value }
            }))}
            placeholder="123 Main St"
            required
            error={fieldErrors['mailingAddress.street']}
          />

          <FormInput
            label="Street Address Line 2"
            name="mailingAddress.street2"
            value={formData.mailingAddress.street2 || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              mailingAddress: { ...prev.mailingAddress, street2: e.target.value }
            }))}
            placeholder="Suite, Unit, Apt, etc. (optional)"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="City"
              name="mailingAddress.city"
              value={formData.mailingAddress.city}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                mailingAddress: { ...prev.mailingAddress, city: e.target.value }
              }))}
              placeholder="Miami"
              required
              error={fieldErrors['mailingAddress.city']}
            />

            <FormInput
              label="ZIP Code"
              name="mailingAddress.zipCode"
              value={formData.mailingAddress.zipCode}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                mailingAddress: { ...prev.mailingAddress, zipCode: e.target.value }
              }))}
              placeholder="33101"
              required
              error={fieldErrors['mailingAddress.zipCode']}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <FormCheckbox
              label="I have a Federal Employer Identification Number (FEIN/EIN)"
              name="hasFEIN"
              checked={formData.hasFEIN}
              onChange={(e) => setFormData(prev => ({ ...prev, hasFEIN: e.target.checked }))}
            />

            {formData.hasFEIN && (
              <div style={{ marginTop: '16px' }}>
                <FormInput
                  label="Federal Employer ID Number (FEIN/EIN)"
                  name="fein"
                  value={formData.fein || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fein: e.target.value }))}
                  placeholder="12-3456789"
                  tooltip="Optional - 9 digit number assigned by the IRS"
                />
              </div>
            )}
          </div>
        </FormSection>
      )}

      {/* Step 3: Owner Information */}
      {currentStep === 3 && (
        <FormSection
          title="Owner Information"
          description="Who owns this fictitious name?"
        >
          <div style={{
            padding: '16px 20px',
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
          }}>
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0" style={{ marginTop: '2px' }} />
            <div style={{ fontSize: '14px', color: '#92400E', lineHeight: '1.6' }}>
              <strong>Owner Type</strong>
              <p style={{ marginTop: '8px', marginBottom: '0' }}>
                Choose "Individual" if you're registering as a person. Choose "Business Entity" if a corporation, LLC, or other business entity owns the DBA.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1F2937', marginBottom: '12px' }}>
              Owner Type <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    ownerType: 'INDIVIDUAL',
                    // Ensure at least one individual owner exists
                    individualOwners: prev.individualOwners && prev.individualOwners.length > 0
                      ? prev.individualOwners
                      : [{
                          firstName: '',
                          lastName: '',
                          middleName: '',
                          address: {
                            street: '',
                            city: '',
                            state: 'FL',
                            zipCode: '',
                          },
                        }]
                  }));
                }}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: formData.ownerType === 'INDIVIDUAL' ? '2px solid #0EA5E9' : '2px solid #E5E7EB',
                  borderRadius: '8px',
                  background: formData.ownerType === 'INDIVIDUAL' ? '#F0F9FF' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <User size={24} className={formData.ownerType === 'INDIVIDUAL' ? 'text-sky-600' : 'text-gray-400'} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: formData.ownerType === 'INDIVIDUAL' ? '#0369A1' : '#6B7280' }}>
                    Individual
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    Person(s)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    ownerType: 'BUSINESS_ENTITY',
                    // Ensure at least one business entity owner exists
                    businessEntityOwners: prev.businessEntityOwners && prev.businessEntityOwners.length > 0
                      ? prev.businessEntityOwners
                      : [{
                          entityName: '',
                          entityAddress: {
                            street: '',
                            city: '',
                            state: 'FL',
                            zipCode: '',
                          },
                          floridaDocumentNumber: '',
                          fein: '',
                          feinStatus: 'NOT_APPLICABLE',
                        }]
                  }));
                }}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: formData.ownerType === 'BUSINESS_ENTITY' ? '2px solid #0EA5E9' : '2px solid #E5E7EB',
                  borderRadius: '8px',
                  background: formData.ownerType === 'BUSINESS_ENTITY' ? '#F0F9FF' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <Building2 size={24} className={formData.ownerType === 'BUSINESS_ENTITY' ? 'text-sky-600' : 'text-gray-400'} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: formData.ownerType === 'BUSINESS_ENTITY' ? '#0369A1' : '#6B7280' }}>
                    Business Entity
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    LLC, Corp, etc.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Individual Owners */}
          {formData.ownerType === 'INDIVIDUAL' && (
            <div>
              {formData.individualOwners?.map((owner, index) => (
                <div key={index} style={{
                  padding: '20px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  background: 'white',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
                      Owner {index + 1}
                    </h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeIndividualOwner(index)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '14px',
                          color: '#EF4444',
                          background: 'transparent',
                          border: '1px solid #FCA5A5',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <FormInput
                      label="First Name"
                      name={`individualOwners.${index}.firstName`}
                      value={owner.firstName}
                      onChange={(e) => {
                        const newOwners = [...(formData.individualOwners || [])];
                        newOwners[index].firstName = e.target.value;
                        setFormData(prev => ({ ...prev, individualOwners: newOwners }));
                      }}
                      required
                      error={fieldErrors[`individualOwners.${index}.firstName`]}
                    />

                    <FormInput
                      label="Middle Name"
                      name={`individualOwners.${index}.middleName`}
                      value={owner.middleName || ''}
                      onChange={(e) => {
                        const newOwners = [...(formData.individualOwners || [])];
                        newOwners[index].middleName = e.target.value;
                        setFormData(prev => ({ ...prev, individualOwners: newOwners }));
                      }}
                    />

                    <FormInput
                      label="Last Name"
                      name={`individualOwners.${index}.lastName`}
                      value={owner.lastName}
                      onChange={(e) => {
                        const newOwners = [...(formData.individualOwners || [])];
                        newOwners[index].lastName = e.target.value;
                        setFormData(prev => ({ ...prev, individualOwners: newOwners }));
                      }}
                      required
                      error={fieldErrors[`individualOwners.${index}.lastName`]}
                    />
                  </div>

                  <FormInput
                    label="Street Address"
                    name={`individualOwners.${index}.address.street`}
                    value={owner.address.street}
                    onChange={(e) => {
                      const newOwners = [...(formData.individualOwners || [])];
                      newOwners[index].address.street = e.target.value;
                      setFormData(prev => ({ ...prev, individualOwners: newOwners }));
                    }}
                    required
                    error={fieldErrors[`individualOwners.${index}.address.street`]}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormInput
                      label="City"
                      name={`individualOwners.${index}.address.city`}
                      value={owner.address.city}
                      onChange={(e) => {
                        const newOwners = [...(formData.individualOwners || [])];
                        newOwners[index].address.city = e.target.value;
                        setFormData(prev => ({ ...prev, individualOwners: newOwners }));
                      }}
                      required
                      error={fieldErrors[`individualOwners.${index}.address.city`]}
                    />

                    <FormInput
                      label="ZIP Code"
                      name={`individualOwners.${index}.address.zipCode`}
                      value={owner.address.zipCode}
                      onChange={(e) => {
                        const newOwners = [...(formData.individualOwners || [])];
                        newOwners[index].address.zipCode = e.target.value;
                        setFormData(prev => ({ ...prev, individualOwners: newOwners }));
                      }}
                      required
                      error={fieldErrors[`individualOwners.${index}.address.zipCode`]}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addIndividualOwner}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0EA5E9',
                  background: 'white',
                  border: '2px dashed #0EA5E9',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                + Add Another Owner
              </button>
            </div>
          )}

          {/* Business Entity Owners */}
          {formData.ownerType === 'BUSINESS_ENTITY' && (
            <div>
              {formData.businessEntityOwners?.map((owner, index) => (
                <div key={index} style={{
                  padding: '20px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  background: 'white',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
                      Business Entity Owner {index + 1}
                    </h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeBusinessEntityOwner(index)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '14px',
                          color: '#EF4444',
                          background: 'transparent',
                          border: '1px solid #FCA5A5',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <FormInput
                    label="Business Entity Name"
                    name={`businessEntityOwners.${index}.entityName`}
                    value={owner.entityName}
                    onChange={(e) => {
                      const newOwners = [...(formData.businessEntityOwners || [])];
                      newOwners[index].entityName = e.target.value;
                      setFormData(prev => ({ ...prev, businessEntityOwners: newOwners }));
                    }}
                    placeholder="e.g., ABC Corporation"
                    required
                    error={fieldErrors[`businessEntityOwners.${index}.entityName`]}
                  />

                  <FormInput
                    label="Florida Document Number"
                    name={`businessEntityOwners.${index}.floridaDocumentNumber`}
                    value={owner.floridaDocumentNumber || ''}
                    onChange={(e) => {
                      const newOwners = [...(formData.businessEntityOwners || [])];
                      newOwners[index].floridaDocumentNumber = e.target.value;
                      setFormData(prev => ({ ...prev, businessEntityOwners: newOwners }));
                    }}
                    placeholder="L12000012345"
                    tooltip="If registered with FL Division of Corporations"
                  />

                  <FormInput
                    label="Street Address"
                    name={`businessEntityOwners.${index}.entityAddress.street`}
                    value={owner.entityAddress.street}
                    onChange={(e) => {
                      const newOwners = [...(formData.businessEntityOwners || [])];
                      newOwners[index].entityAddress.street = e.target.value;
                      setFormData(prev => ({ ...prev, businessEntityOwners: newOwners }));
                    }}
                    required
                    error={fieldErrors[`businessEntityOwners.${index}.entityAddress.street`]}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormInput
                      label="City"
                      name={`businessEntityOwners.${index}.entityAddress.city`}
                      value={owner.entityAddress.city}
                      onChange={(e) => {
                        const newOwners = [...(formData.businessEntityOwners || [])];
                        newOwners[index].entityAddress.city = e.target.value;
                        setFormData(prev => ({ ...prev, businessEntityOwners: newOwners }));
                      }}
                      required
                    />

                    <FormInput
                      label="ZIP Code"
                      name={`businessEntityOwners.${index}.entityAddress.zipCode`}
                      value={owner.entityAddress.zipCode}
                      onChange={(e) => {
                        const newOwners = [...(formData.businessEntityOwners || [])];
                        newOwners[index].entityAddress.zipCode = e.target.value;
                        setFormData(prev => ({ ...prev, businessEntityOwners: newOwners }));
                      }}
                      required
                    />
                  </div>

                  <FormInput
                    label="Federal Employer ID (FEIN/EIN)"
                    name={`businessEntityOwners.${index}.fein`}
                    value={owner.fein || ''}
                    onChange={(e) => {
                      const newOwners = [...(formData.businessEntityOwners || [])];
                      newOwners[index].fein = e.target.value;
                      setFormData(prev => ({ ...prev, businessEntityOwners: newOwners }));
                    }}
                    placeholder="12-3456789"
                    tooltip="9-digit number assigned by the IRS"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addBusinessEntityOwner}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0EA5E9',
                  background: 'white',
                  border: '2px dashed #0EA5E9',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                + Add Another Business Entity Owner
              </button>
            </div>
          )}
        </FormSection>
      )}

      {/* Step 4: Advertisement - Simplified Toggle Flow */}
      {currentStep === 4 && (
        <FormSection
          title="Newspaper Publication Required"
          description="Complete this step before we can file your DBA"
        >
          {/* Legal Requirement Notice */}
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            border: '2px solid #F59E0B',
            borderRadius: '12px',
            marginBottom: '32px',
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <Newspaper size={28} className="text-amber-700 flex-shrink-0" style={{ marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400E', marginBottom: '12px', lineHeight: '1.3' }}>
                  Florida Law Requires Newspaper Publication
                </h3>
                <p style={{ fontSize: '15px', color: '#78350F', lineHeight: '1.7', marginBottom: '0' }}>
                  Before we can file your DBA with the State of Florida, you must publish your fictitious name
                  once in a newspaper in <strong>{formData.principalCounty} County</strong>. This is required by
                  Chapter 50, Florida Statutes.
                </p>
              </div>
            </div>
          </div>

          {/* Toggle Question: Already Published? */}
          <div style={{
            padding: '28px',
            background: '#FFFFFF',
            border: '2px solid #E5E7EB',
            borderRadius: '12px',
            marginBottom: '32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Have you already published your DBA in a newspaper?
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', marginBottom: '0' }}>
                  If you've already completed the newspaper publication requirement, select "Yes" to proceed.
                </p>
              </div>

              {/* Toggle Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: alreadyPublished ? '400' : '600',
                  color: alreadyPublished ? '#9CA3AF' : '#111827',
                }}>
                  No
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAlreadyPublished(!alreadyPublished);
                    // If switching to YES, auto-check the certification
                    if (!alreadyPublished) {
                      setFormData(prev => ({
                        ...prev,
                        newspaperAdvertised: true,
                        paymentTiming: 'PAY_NOW'
                      }));
                    } else {
                      // If switching to NO, uncheck certification
                      setFormData(prev => ({
                        ...prev,
                        newspaperAdvertised: false,
                      }));
                    }
                  }}
                  style={{
                    position: 'relative',
                    width: '56px',
                    height: '32px',
                    borderRadius: '16px',
                    background: alreadyPublished ? '#10B981' : '#D1D5DB',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.3s',
                    padding: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    left: alreadyPublished ? '28px' : '4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    transition: 'left 0.3s',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }} />
                </button>
                <span style={{
                  fontSize: '14px',
                  fontWeight: alreadyPublished ? '600' : '400',
                  color: alreadyPublished ? '#111827' : '#9CA3AF',
                }}>
                  Yes
                </span>
              </div>
            </div>
          </div>

          {/* If YES (Already Published) - Show Certification */}
          {alreadyPublished && (
            <>
              {/* Certification Checkbox with Warning */}
              <div style={{
                padding: '24px',
                background: '#FFFFFF',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                marginBottom: '24px',
              }}>
                {/* Warning Banner */}
                <div style={{
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                  border: '2px solid #F59E0B',
                  borderRadius: '8px',
                  marginBottom: '24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <AlertTriangle size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400E', marginBottom: '6px' }}>
                        ⚠️ Important Legal Notice
                      </h4>
                      <p style={{ fontSize: '13px', color: '#78350F', lineHeight: '1.6', marginBottom: '0' }}>
                        False certification may result in rejection of your filing and potential penalties under Florida law.
                        Only certify if you have actually published the required notice in a qualified newspaper.
                      </p>
                    </div>
                  </div>
                </div>

                <FormCheckbox
                  label={`I certify that as of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, I have published the required notice in a newspaper of general circulation in the county where my business is located, as required by Florida law.`}
                  name="newspaperAdvertised"
                  checked={formData.newspaperAdvertised}
                  onChange={async (e) => {
                    const isChecked = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      newspaperAdvertised: isChecked,
                      paymentTiming: isChecked ? 'PAY_NOW' : prev.paymentTiming
                    }));

                    // Send certification confirmation email when user checks the box
                    // (only if they've filled in newspaper name and publication date)
                    if (isChecked && formData.newspaperName && formData.advertisementDate && formData.correspondenceEmail) {
                      try {
                        const response = await fetch('/api/dba/certify-publication', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: formData.correspondenceEmail,
                            fictitiousName: formData.fictitiousName,
                            newspaperName: formData.newspaperName,
                            publicationDate: formData.advertisementDate,
                          }),
                        });

                        if (response.ok) {
                          console.log('✅ Certification confirmation email sent');
                        } else {
                          console.warn('⚠️ Failed to send certification email, but continuing...');
                        }
                      } catch (error) {
                        console.error('Error sending certification email:', error);
                        // Don't block the user if email fails - it's not critical
                      }
                    }
                  }}
                  error={fieldErrors.newspaperAdvertised}
                />

                {formData.newspaperAdvertised && (
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
                    <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                      <span style={{ color: '#DC2626', fontWeight: '600' }}>*Required:</span> Please provide publication details for our records
                    </p>
                    <FormInput
                      label="Newspaper Name *"
                      name="newspaperName"
                      value={formData.newspaperName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, newspaperName: e.target.value }))}
                      placeholder="e.g., Miami Herald"
                      required
                      error={fieldErrors.newspaperName}
                    />

                    <FormInput
                      label="Publication Date *"
                      name="advertisementDate"
                      type="date"
                      value={formData.advertisementDate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, advertisementDate: e.target.value }))}
                      required
                      error={fieldErrors.advertisementDate}
                    />
                  </div>
                )}
              </div>

              {/* Certified - Ready to File Message */}
              {formData.newspaperAdvertised && (
                <div style={{
                  padding: '20px 24px',
                  background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                  border: '2px solid #10B981',
                  borderRadius: '12px',
                  marginBottom: '24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle size={24} className="text-green-600" />
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#065F46', marginBottom: '4px' }}>
                        ✓ Ready to File!
                      </h3>
                      <p style={{ fontSize: '14px', color: '#047857', marginBottom: '0' }}>
                        You've certified publication. Continue to payment and we'll file your DBA immediately.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* If NO (Not Published Yet) - Show Instructions */}
          {!alreadyPublished && (
            <>
              {/* Simple 3-Step Process */}
              <div style={{
                padding: '28px',
                background: '#FFFFFF',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                marginBottom: '32px',
                marginTop: '32px',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                  Here's How to Publish Your DBA:
                </h3>

                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#0EA5E9',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
                      Contact a Newspaper in {formData.principalCounty} County
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', marginBottom: '12px' }}>
                      Call or email a local newspaper and request to publish a "fictitious name notice" or "DBA advertisement."
                    </p>
                    <div style={{
                      padding: '12px 16px',
                      background: '#F9FAFB',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                    }}>
                      <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>
                        <strong style={{ color: '#374151' }}>Your Fictitious Name:</strong>
                      </p>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: '#0EA5E9', marginBottom: '0' }}>
                        {formData.fictitiousName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#0EA5E9',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
                      Publish the Advertisement
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', marginBottom: '0' }}>
                      The newspaper will publish your notice (typically costs $50-$150). Keep a copy of the published ad for your records.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#0EA5E9',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}>
                    3
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
                      Return Here to Complete Your Filing
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', marginBottom: '0' }}>
                      Once published, come back and toggle the switch above to "Yes" to proceed with your DBA registration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Newspaper List for Selected County */}
              {(() => {
                // Only show if county is selected
                if (!formData.principalCounty) {
                  return (
                    <div style={{
                      padding: '20px 24px',
                      background: '#FEF3C7',
                      border: '2px solid #FDE68A',
                      borderRadius: '12px',
                      marginBottom: '24px',
                    }}>
                      <p style={{ fontSize: '14px', color: '#92400E', margin: '0' }}>
                        <strong>Note:</strong> Please select your county in Step 2 to see newspapers available in your area.
                      </p>
                    </div>
                  );
                }

                const newspapers = getNewspapersByCounty(formData.principalCounty);
                const isDefaultInstructions = newspapers.length === 1 && newspapers[0].name === 'Local Newspaper in Your County';

                return (
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
                      📰 Newspapers in {formData.principalCounty} County
                    </h3>

                    {!isDefaultInstructions ? (
                      <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>
                        Contact one of these newspapers to publish your fictitious name notice:
                      </p>
                    ) : (
                      <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>
                        Here's how to find and contact a newspaper in {formData.principalCounty} County:
                      </p>
                    )}

                    {newspapers.map((newspaper, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '24px',
                          background: '#FFFFFF',
                          border: '2px solid #E2E8F0',
                          borderRadius: '12px',
                          marginBottom: index < newspapers.length - 1 ? '20px' : '0',
                        }}
                      >
                        {/* Newspaper Header */}
                        <div style={{ marginBottom: '16px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '12px' }}>
                            {newspaper.name}
                          </h4>

                          {/* Contact Info Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Phone size={16} style={{ color: '#0EA5E9' }} />
                              <span style={{ fontSize: '14px', color: '#334155' }}>{newspaper.phone}</span>
                            </div>
                            {newspaper.email && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={16} style={{ color: '#0EA5E9' }} />
                                <a href={`mailto:${newspaper.email}`} style={{ fontSize: '14px', color: '#0EA5E9', textDecoration: 'none' }}>
                                  {newspaper.email}
                                </a>
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <DollarSign size={16} style={{ color: '#10B981' }} />
                              <span style={{ fontSize: '14px', color: '#334155' }}>{newspaper.estimatedCost}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Clock size={16} style={{ color: '#F59E0B' }} />
                              <span style={{ fontSize: '14px', color: '#334155' }}>{newspaper.processingTime}</span>
                            </div>
                          </div>

                          {newspaper.website && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Globe size={16} style={{ color: '#0EA5E9' }} />
                              <a
                                href={newspaper.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '14px', color: '#0EA5E9', textDecoration: 'none' }}
                              >
                                {newspaper.website.replace('https://', '').replace('http://', '')}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Step-by-Step Instructions */}
                        <div style={{
                          padding: '16px',
                          background: '#F8FAFC',
                          borderRadius: '8px',
                          marginBottom: newspaper.notes ? '12px' : '0',
                        }}>
                          <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', marginBottom: '12px' }}>
                            📋 Step-by-Step Instructions:
                          </h5>
                          <ol style={{ margin: '0', paddingLeft: '20px' }}>
                            {newspaper.instructions.map((instruction, i) => (
                              <li key={i} style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '8px' }}>
                                {instruction}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Notes */}
                        {newspaper.notes && (
                          <div style={{
                            padding: '12px 16px',
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            borderRadius: '6px',
                          }}>
                            <p style={{ fontSize: '13px', color: '#1E40AF', margin: '0' }}>
                              <strong>Note:</strong> {newspaper.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Disclaimer */}
                    <div style={{
                      padding: '12px 16px',
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '8px',
                      marginTop: '20px',
                    }}>
                      <p style={{ fontSize: '12px', color: '#92400E', margin: '0', lineHeight: '1.5' }}>
                        <strong>Disclaimer:</strong> This is an informational resource only. We do not recommend specific newspapers.
                        Costs and processing times are estimates and may vary. Please verify details directly with the newspaper.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* UPL Disclaimer */}
              <div style={{
                padding: '16px 20px',
                background: '#F9FAFB',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                marginBottom: '32px',
              }}>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', marginBottom: '0' }}>
                  <strong style={{ color: '#374151' }}>Legal Information Only:</strong> We provide filing services and legal information,
                  not legal advice. We cannot recommend specific newspapers or advise you on legal requirements. For legal advice,
                  please consult a licensed Florida attorney.
                </p>
              </div>

              {/* Not Ready - Can Still Continue */}
              <div style={{
                padding: '16px 20px',
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: '8px',
                marginBottom: '24px',
              }}>
                <p style={{ fontSize: '13px', color: '#0369A1', margin: 0 }}>
                  💡 <strong>Not ready to publish yet?</strong> You can continue to review your order and pricing.
                  Publication will be required before final submission.
                </p>
              </div>
            </>
          )}

          {/* Payment Timing Selection - Only show if NOT certified */}
          {!formData.newspaperAdvertised && (
            <div style={{
              padding: '24px',
              background: '#FFFFFF',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              marginBottom: '24px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                When would you like to pay?
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
                Choose your preferred payment timing based on your publication status
              </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Pay Now Option */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  border: formData.paymentTiming === 'PAY_NOW' ? '2px solid #0EA5E9' : '2px solid #E5E7EB',
                  borderRadius: '8px',
                  background: formData.paymentTiming === 'PAY_NOW' ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (formData.paymentTiming !== 'PAY_NOW') {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.paymentTiming !== 'PAY_NOW') {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }
                }}
              >
                <input
                  type="radio"
                  name="paymentTiming"
                  value="PAY_NOW"
                  checked={formData.paymentTiming === 'PAY_NOW'}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentTiming: 'PAY_NOW' }))}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                    💳 Pay Now
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>
                    {formData.newspaperAdvertised ? (
                      <>
                        <strong>Ready to file!</strong> You've certified publication. Pay now and we'll file your DBA immediately.
                      </>
                    ) : (
                      <>
                        <strong>Reserve your spot.</strong> Pay now, publish your ad later, then notify us to file.
                        Your information is secured and ready to go.
                      </>
                    )}
                  </div>
                </div>
              </label>

              {/* Pay After Publication Option */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  border: formData.paymentTiming === 'PAY_AFTER_PUBLICATION' ? '2px solid #0EA5E9' : '2px solid #E5E7EB',
                  borderRadius: '8px',
                  background: formData.paymentTiming === 'PAY_AFTER_PUBLICATION' ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (formData.paymentTiming !== 'PAY_AFTER_PUBLICATION') {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.paymentTiming !== 'PAY_AFTER_PUBLICATION') {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }
                }}
              >
                <input
                  type="radio"
                  name="paymentTiming"
                  value="PAY_AFTER_PUBLICATION"
                  checked={formData.paymentTiming === 'PAY_AFTER_PUBLICATION'}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentTiming: 'PAY_AFTER_PUBLICATION' }))}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                    📅 Pay After Publication
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>
                    <strong>Publish first, pay later.</strong> We'll save your information. After you publish your ad,
                    return to pay and we'll file your DBA.
                  </div>
                </div>
              </label>
            </div>

              {formData.paymentTiming === 'PAY_AFTER_PUBLICATION' && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: '8px',
                }}>
                  <p style={{ fontSize: '13px', color: '#92400E', margin: 0 }}>
                    ⚠️ <strong>Important:</strong> Your DBA will not be filed until you return, certify publication, and complete payment.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Save & Get Link Button */}
          {!formData.newspaperAdvertised && formData.paymentTiming === 'PAY_AFTER_PUBLICATION' && (
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
              border: '2px solid #0EA5E9',
              borderRadius: '12px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <Mail size={24} className="text-sky-600 flex-shrink-0" style={{ marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0C4A6E', marginBottom: '8px' }}>
                    Need Time to Publish Your Ad?
                  </h3>
                  <p style={{ fontSize: '14px', color: '#075985', lineHeight: '1.6', marginBottom: '0' }}>
                    Save your progress and we'll email you a secure link to return and complete your registration
                    after you've published your newspaper advertisement.
                  </p>
                </div>
              </div>

              {draftSaved ? (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 20px',
                    background: '#D1FAE5',
                    border: '2px solid #10B981',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}>
                    <CheckCircle size={20} className="text-green-600" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#065F46', marginBottom: '4px' }}>
                        ✓ Your registration is saved!
                      </div>
                      <div style={{ fontSize: '13px', color: '#047857' }}>
                        {session?.user?.id ? (
                          <>Email sent to {formData.correspondenceEmail}. Also check your dashboard for reminders.</>
                        ) : (
                          <>Link sent to {formData.correspondenceEmail}! Check your email.</>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Calendar Download Button (for all users) */}
                  {calendarEvent && (
                    <button
                      type="button"
                      onClick={downloadCalendarReminder}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        background: '#FFFFFF',
                        color: '#0EA5E9',
                        border: '2px solid #0EA5E9',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#EFF6FF';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                      }}
                    >
                      📅 Add Reminder to Calendar
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    background: '#0EA5E9',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: savingDraft ? 'not-allowed' : 'pointer',
                    opacity: savingDraft ? 0.6 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseOver={(e) => !savingDraft && (e.currentTarget.style.background = '#0284C7')}
                  onMouseOut={(e) => !savingDraft && (e.currentTarget.style.background = '#0EA5E9')}
                >
                  <Mail size={18} />
                  {savingDraft ? 'Sending Link...' : 'Save & Email Me a Link to Return'}
                </button>
              )}

              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '12px', marginBottom: '0', textAlign: 'center' }}>
                The link will be sent to <strong>{formData.correspondenceEmail || 'your email'}</strong> and expires in 7 days
              </p>
            </div>
          )}

          {/* Additional Options */}
          <div style={{
            padding: '24px',
            background: '#FFFFFF',
            border: '2px solid #E5E7EB',
            borderRadius: '12px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Additional Documents (Optional)
            </h3>

            <FormCheckbox
              label="Certificate of Status (+$10.00)"
              name="certificateOfStatus"
              checked={formData.certificateOfStatus}
              onChange={(e) => setFormData(prev => ({ ...prev, certificateOfStatus: e.target.checked }))}
            />

            <FormCheckbox
              label="Certified Copy (+$30.00)"
              name="certifiedCopy"
              checked={formData.certifiedCopy}
              onChange={(e) => setFormData(prev => ({ ...prev, certifiedCopy: e.target.checked }))}
            />
          </div>
        </FormSection>
      )}

      {/* Step 5: Review */}
      {currentStep === 5 && (
        <FormSection
          title="Review Your Information"
          description="Please review all details before submitting"
        >
          <div style={{
            padding: '20px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
              Fictitious Name
            </h3>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#0EA5E9', marginBottom: '8px' }}>
              {formData.fictitiousName}
            </p>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              Email: {formData.correspondenceEmail}
            </p>
          </div>

          <div style={{
            padding: '20px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
              Business Location
            </h3>
            <p style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
              <strong>County:</strong> {formData.principalCounty}
            </p>
            <p style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
              <strong>Mailing Address:</strong>
            </p>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '0' }}>
              {formData.mailingAddress.street}
              {formData.mailingAddress.street2 && `, ${formData.mailingAddress.street2}`}
              <br />
              {formData.mailingAddress.city}, {formData.mailingAddress.state} {formData.mailingAddress.zipCode}
            </p>
          </div>

          <div style={{
            padding: '20px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
              Owner Information
            </h3>
            {formData.ownerType === 'INDIVIDUAL' && formData.individualOwners?.map((owner, index) => (
              <div key={index} style={{ marginBottom: index < (formData.individualOwners?.length || 0) - 1 ? '16px' : '0', paddingBottom: index < (formData.individualOwners?.length || 0) - 1 ? '16px' : '0', borderBottom: index < (formData.individualOwners?.length || 0) - 1 ? '1px solid #E5E7EB' : 'none' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                  {owner.firstName} {owner.middleName} {owner.lastName}
                </p>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '0' }}>
                  {owner.address.street}, {owner.address.city}, {owner.address.state} {owner.address.zipCode}
                </p>
              </div>
            ))}
            {formData.ownerType === 'BUSINESS_ENTITY' && formData.businessEntityOwners?.map((owner, index) => (
              <div key={index} style={{ marginBottom: index < (formData.businessEntityOwners?.length || 0) - 1 ? '16px' : '0', paddingBottom: index < (formData.businessEntityOwners?.length || 0) - 1 ? '16px' : '0', borderBottom: index < (formData.businessEntityOwners?.length || 0) - 1 ? '1px solid #E5E7EB' : 'none' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                  {owner.entityName}
                </p>
                {owner.floridaDocumentNumber && (
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                    FL Doc #: {owner.floridaDocumentNumber}
                  </p>
                )}
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '0' }}>
                  {owner.entityAddress.street}, {owner.entityAddress.city}, {owner.entityAddress.state} {owner.entityAddress.zipCode}
                </p>
              </div>
            ))}
          </div>

          {/* Payment Timing Status */}
          <div style={{
            padding: '20px',
            background: formData.paymentTiming === 'PAY_NOW' ? '#EFF6FF' : '#FEF3C7',
            border: `2px solid ${formData.paymentTiming === 'PAY_NOW' ? '#0EA5E9' : '#FCD34D'}`,
            borderRadius: '8px',
            marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '12px' }}>
              {formData.paymentTiming === 'PAY_NOW' ? '💳 Payment & Filing' : '📅 Payment Timeline'}
            </h3>
            {formData.paymentTiming === 'PAY_NOW' ? (
              <>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                  <strong>Payment:</strong> You'll pay now and secure your filing.
                </p>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '0' }}>
                  <strong>Filing:</strong> {formData.newspaperAdvertised
                    ? 'We\'ll file your DBA immediately after payment.'
                    : 'After you publish your ad and notify us, we\'ll file your DBA.'}
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                  <strong>Now:</strong> We'll save your information (no payment required).
                </p>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                  <strong>After Publication:</strong> Return to this page, certify publication, and pay.
                </p>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '0' }}>
                  <strong>Then:</strong> We'll file your DBA immediately.
                </p>
              </>
            )}
          </div>

          <div style={{
            padding: '20px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
              Order Summary
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#374151' }}>Fictitious Name Registration</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>$50.00</span>
            </div>
            {formData.certificateOfStatus && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>Certificate of Status</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>$10.00</span>
              </div>
            )}
            {formData.certifiedCopy && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>Certified Copy</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>$30.00</span>
              </div>
            )}
            <div style={{ borderTop: '2px solid #E5E7EB', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>Total</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#0EA5E9' }}>
                ${(50 + (formData.certificateOfStatus ? 10 : 0) + (formData.certifiedCopy ? 30 : 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </FormSection>
      )}
    </FormWizard>
    </div>
  );
}

