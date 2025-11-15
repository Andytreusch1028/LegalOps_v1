'use client';

/**
 * LegalOps v1 - Annual Report Filing Form
 * 
 * This is the SMART FORM that demonstrates:
 * - Auto-population of existing business data
 * - Minimal user input required
 * - One-click confirmation for unchanged data
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BusinessEntity {
  id: string;
  legalName: string;
  documentNumber: string | null;
  feiNumber: string | null;
  entityType: string;
  status: string;
  addresses: Array<{
    id: string;
    street: string;
    street2: string | null;
    city: string;
    state: string;
    zipCode: string;
    addressType: string;
  }>;
  registeredAgent: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
    agentType: string;
  } | null;
  managersOfficers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    title: string | null;
    roleType: string;
    address: string;
  }>;
  filings: Array<{
    id: string;
    filingType: string;
    createdAt: string;
  }>;
}

export default function AnnualReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [entities, setEntities] = useState<BusinessEntity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<BusinessEntity | null>(null);
  const [confirmCurrentInfo, setConfirmCurrentInfo] = useState(true);
  const [correspondenceEmail, setCorrespondenceEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable fields state
  const [principalAddressChanged, setPrincipalAddressChanged] = useState(false);
  const [newPrincipalAddress, setNewPrincipalAddress] = useState({
    street: '', street2: '', city: '', state: 'FL', zipCode: ''
  });

  const [mailingAddressChanged, setMailingAddressChanged] = useState(false);
  const [newMailingAddress, setNewMailingAddress] = useState({
    street: '', street2: '', city: '', state: 'FL', zipCode: ''
  });

  const [registeredAgentChanged, setRegisteredAgentChanged] = useState(false);
  const [newRegisteredAgent, setNewRegisteredAgent] = useState({
    agentType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'COMPANY',
    firstName: '', lastName: '', companyName: '',
    address: { street: '', street2: '', city: '', state: 'FL', zipCode: '' }
  });

  const [managersOfficersChanged, setManagersOfficersChanged] = useState(false);
  const [newManagersOfficers, setNewManagersOfficers] = useState<Array<{
    firstName: string; lastName: string; title: string; roleType: string; address: string;
  }>>([]);

  const [feiNumberChanged, setFeiNumberChanged] = useState(false);
  const [newFeiNumber, setNewFeiNumber] = useState('');

  // Load user's business entities
  useEffect(() => {
    async function loadEntities() {
      try {
        // Fetch businesses for the logged-in user
        const response = await fetch('/api/businesses');
        const data = await response.json();

        if (data.success && data.businesses) {
          // Filter for active entities only
          const activeEntities = data.businesses.filter(
            (entity: BusinessEntity) => entity.status === 'ACTIVE'
          );

          setEntities(activeEntities);
          if (activeEntities.length > 0) {
            setSelectedEntityId(activeEntities[0].id);
            setSelectedEntity(activeEntities[0]);
          }
        } else {
          setError(data.error || 'Failed to load your businesses');
        }
      } catch (err) {
        console.error('Error loading businesses:', err);
        setError('Failed to load your businesses');
      } finally {
        setLoading(false);
      }
    }

    loadEntities();
  }, []);

  // Update selected entity when selection changes
  useEffect(() => {
    const entity = entities.find(e => e.id === selectedEntityId);
    setSelectedEntity(entity || null);
  }, [selectedEntityId, entities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formData: Record<string, unknown> = {
        businessEntityId: selectedEntityId,
        confirmCurrentInformation: confirmCurrentInfo,
        correspondenceEmail,
      };

      // Include changes if any were made
      if (feiNumberChanged) {
        formData.feiNumberChanged = true;
        formData.newFeiNumber = newFeiNumber;
      }

      if (principalAddressChanged) {
        formData.principalAddressChanged = true;
        formData.newPrincipalAddress = newPrincipalAddress;
      }

      if (mailingAddressChanged) {
        formData.mailingAddressChanged = true;
        formData.newMailingAddress = newMailingAddress;
      }

      if (registeredAgentChanged) {
        formData.registeredAgentChanged = true;
        formData.newRegisteredAgent = newRegisteredAgent;
      }

      if (managersOfficersChanged) {
        formData.managersOfficersChanged = true;
        formData.newManagersOfficers = newManagersOfficers;
      }

      const response = await fetch('/api/filings/annual-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Annual report filed successfully!');
        setTimeout(() => {
          router.push('/dashboard/filings');
        }, 2000);
      } else {
        setError(data.error || 'Failed to file annual report');
      }
    } catch (err) {
      setError('An error occurred while filing the annual report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f9fafb, #e5e7eb)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '12px',
          padding: '3rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#0ea5e9',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading your businesses...</p>
        </div>
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f9fafb, #e5e7eb)'
      }}>
        <div className="flex items-center justify-center" style={{ padding: '32px 24px' }}>
          <div className="max-w-4xl mx-auto w-full">
            {/* Header */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#0f172a' }}>
              No Businesses Found
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.125rem', lineHeight: '1.6' }}>
              You don't have any businesses in your account yet. Choose an option below to get started.
            </p>
          </div>

          {/* Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Option 1: Import Existing Business */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '2px solid #e5e7eb',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0ea5e9';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(14,165,233,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#dbeafe',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <svg style={{ width: '24px', height: '24px', color: '#0ea5e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: '#0f172a' }}>
                I Have an Existing Business
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Import your business from Florida Sunbiz using your Document Number or Entity Name
              </p>
              <button
                onClick={() => router.push('/dashboard/businesses/import')}
                style={{
                  width: '100%',
                  background: '#0ea5e9',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0284c7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0ea5e9';
                }}
              >
                Import Existing Business
              </button>
            </div>

            {/* Option 2: Form New Business */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '2px solid #e5e7eb',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(16,185,129,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#d1fae5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <svg style={{ width: '24px', height: '24px', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: '#0f172a' }}>
                Form a New Business
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Start a new LLC, Corporation, or other business entity in Florida
              </p>
              <button
                onClick={() => router.push('/services')}
                style={{
                  width: '100%',
                  background: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981';
                }}
              >
                Browse Formation Services
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div style={{
            background: '#f0f9ff',
            border: '2px solid #bae6fd',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#0369a1', fontSize: '0.9375rem', lineHeight: '1.6', margin: 0 }}>
              <strong>Need help?</strong> If you're not sure which option to choose, contact us at{' '}
              <a href="mailto:support@legalops.com" style={{ color: '#0284c7', textDecoration: 'underline' }}>
                support@legalops.com
              </a>
              {' '}or call <strong>(555) 123-4567</strong>
            </p>
          </div>
          </div>
        </div>
      </div>
    );
  }

  const principalAddr = selectedEntity?.addresses.find(a => a.addressType === 'PRINCIPAL');
  const mailingAddr = selectedEntity?.addresses.find(a => a.addressType === 'MAILING');
  const agent = selectedEntity?.registeredAgent;

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f9fafb, #e5e7eb)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            File Annual Report
          </h1>
          <p style={{ color: '#6b7280' }}>
            Review and confirm your business information for the annual report
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#065f46'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#991b1b'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Select Business */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#111827'
            }}>
              Select Business
            </h2>
            
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              {entities.map(entity => (
                <option key={entity.id} value={entity.id}>
                  {entity.legalName} {entity.documentNumber ? `(${entity.documentNumber})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Current Information (Auto-filled!) */}
          {selectedEntity && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                background: '#dbeafe',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: '#1e40af', fontWeight: '500', marginBottom: '0.5rem' }}>
                  ✨ <strong>Smart Form:</strong> All information below is auto-filled from your records!
                </p>
                <p style={{ color: '#1e40af', fontSize: '0.875rem' }}>
                  Click "Edit" buttons to update any information that has changed. Entity name and document number cannot be changed on annual reports.
                </p>
              </div>

              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '1.5rem',
                color: '#111827'
              }}>
                Current Business Information
              </h2>

              {/* Business Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                  Business Name ✅
                </label>
                <div style={{
                  padding: '0.75rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#111827'
                }}>
                  {selectedEntity.legalName}
                </div>
              </div>

              {/* Document Number */}
              {selectedEntity.documentNumber && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                    Document Number ✅
                  </label>
                  <div style={{
                    padding: '0.75rem',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}>
                    {selectedEntity.documentNumber}
                  </div>
                </div>
              )}

              {/* FEI/EIN Number */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: '500', color: '#374151' }}>
                    Federal Employer ID Number (FEI/EIN) {!feiNumberChanged && '✅'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFeiNumberChanged(!feiNumberChanged);
                      if (!feiNumberChanged) {
                        setNewFeiNumber(selectedEntity.feiNumber || '');
                      }
                    }}
                    style={{
                      background: feiNumberChanged ? '#ef4444' : '#0ea5e9',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {feiNumberChanged ? 'Cancel Edit' : 'Edit FEI/EIN'}
                  </button>
                </div>

                {!feiNumberChanged ? (
                  <div style={{
                    padding: '0.75rem',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}>
                    {selectedEntity.feiNumber || 'Not provided'}
                  </div>
                ) : (
                  <div style={{
                    padding: '1rem',
                    background: '#fef3c7',
                    border: '2px solid #fbbf24',
                    borderRadius: '8px'
                  }}>
                    <p style={{ marginBottom: '0.75rem', color: '#92400e', fontSize: '0.875rem' }}>
                      📝 <strong>Editing FEI/EIN Number</strong>
                    </p>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem', color: '#374151', fontSize: '0.875rem' }}>
                        FEI/EIN Number (Format: XX-XXXXXXX)
                      </label>
                      <input
                        type="text"
                        value={newFeiNumber}
                        onChange={(e) => {
                          // Format as XX-XXXXXXX
                          let value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length > 2) {
                            value = value.slice(0, 2) + '-' + value.slice(2, 9);
                          }
                          setNewFeiNumber(value);
                        }}
                        placeholder="12-3456789"
                        maxLength={10}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>
                    <p style={{ color: '#92400e', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                      💡 Enter your 9-digit Federal Employer Identification Number. Leave blank if not applicable.
                    </p>
                  </div>
                )}
              </div>

              {/* Principal Address */}
              {principalAddr && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: '500', color: '#374151' }}>
                      Principal Address {!principalAddressChanged && '✅'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPrincipalAddressChanged(!principalAddressChanged);
                        if (!principalAddressChanged) {
                          setNewPrincipalAddress({
                            street: principalAddr.street,
                            street2: principalAddr.street2 || '',
                            city: principalAddr.city,
                            state: principalAddr.state,
                            zipCode: principalAddr.zipCode
                          });
                        }
                      }}
                      style={{
                        background: principalAddressChanged ? '#ef4444' : '#0ea5e9',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {principalAddressChanged ? 'Cancel Edit' : 'Edit Address'}
                    </button>
                  </div>

                  {!principalAddressChanged ? (
                    <div style={{
                      padding: '0.75rem',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}>
                      {principalAddr.street}{principalAddr.street2 && `, ${principalAddr.street2}`}<br />
                      {principalAddr.city}, {principalAddr.state} {principalAddr.zipCode}
                    </div>
                  ) : (
                    <div style={{
                      padding: '1rem',
                      background: '#fef3c7',
                      border: '2px solid #fbbf24',
                      borderRadius: '8px'
                    }}>
                      <p style={{ color: '#92400e', marginBottom: '1rem', fontWeight: '500' }}>
                        📝 Editing Principal Address
                      </p>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={newPrincipalAddress.street}
                          onChange={(e) => setNewPrincipalAddress({...newPrincipalAddress, street: e.target.value})}
                          required={principalAddressChanged}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                          Suite/Unit (Optional)
                        </label>
                        <input
                          type="text"
                          value={newPrincipalAddress.street2}
                          onChange={(e) => setNewPrincipalAddress({...newPrincipalAddress, street2: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                            City *
                          </label>
                          <input
                            type="text"
                            value={newPrincipalAddress.city}
                            onChange={(e) => setNewPrincipalAddress({...newPrincipalAddress, city: e.target.value})}
                            required={principalAddressChanged}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                            State *
                          </label>
                          <input
                            type="text"
                            value={newPrincipalAddress.state}
                            onChange={(e) => setNewPrincipalAddress({...newPrincipalAddress, state: e.target.value})}
                            required={principalAddressChanged}
                            maxLength={2}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                            ZIP *
                          </label>
                          <input
                            type="text"
                            value={newPrincipalAddress.zipCode}
                            onChange={(e) => setNewPrincipalAddress({...newPrincipalAddress, zipCode: e.target.value})}
                            required={principalAddressChanged}
                            maxLength={10}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mailing Address */}
              {mailingAddr && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: '500', color: '#374151' }}>
                      Mailing Address {!mailingAddressChanged && '✅'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMailingAddressChanged(!mailingAddressChanged);
                        if (!mailingAddressChanged) {
                          setNewMailingAddress({
                            street: mailingAddr.street,
                            street2: mailingAddr.street2 || '',
                            city: mailingAddr.city,
                            state: mailingAddr.state,
                            zipCode: mailingAddr.zipCode
                          });
                        }
                      }}
                      style={{
                        background: mailingAddressChanged ? '#ef4444' : '#0ea5e9',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {mailingAddressChanged ? 'Cancel Edit' : 'Edit Address'}
                    </button>
                  </div>

                  {!mailingAddressChanged ? (
                    <div style={{
                      padding: '0.75rem',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}>
                      {mailingAddr.street}{mailingAddr.street2 && `, ${mailingAddr.street2}`}<br />
                      {mailingAddr.city}, {mailingAddr.state} {mailingAddr.zipCode}
                    </div>
                  ) : (
                    <div style={{
                      padding: '1rem',
                      background: '#fef3c7',
                      border: '2px solid #fbbf24',
                      borderRadius: '8px'
                    }}>
                      <p style={{ color: '#92400e', marginBottom: '1rem', fontWeight: '500' }}>
                        📝 Editing Mailing Address
                      </p>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={newMailingAddress.street}
                          onChange={(e) => setNewMailingAddress({...newMailingAddress, street: e.target.value})}
                          required={mailingAddressChanged}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                          Suite/Unit/PO Box (Optional)
                        </label>
                        <input
                          type="text"
                          value={newMailingAddress.street2}
                          onChange={(e) => setNewMailingAddress({...newMailingAddress, street2: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                            City *
                          </label>
                          <input
                            type="text"
                            value={newMailingAddress.city}
                            onChange={(e) => setNewMailingAddress({...newMailingAddress, city: e.target.value})}
                            required={mailingAddressChanged}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                            State *
                          </label>
                          <input
                            type="text"
                            value={newMailingAddress.state}
                            onChange={(e) => setNewMailingAddress({...newMailingAddress, state: e.target.value})}
                            required={mailingAddressChanged}
                            maxLength={2}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                            ZIP *
                          </label>
                          <input
                            type="text"
                            value={newMailingAddress.zipCode}
                            onChange={(e) => setNewMailingAddress({...newMailingAddress, zipCode: e.target.value})}
                            required={mailingAddressChanged}
                            maxLength={10}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Registered Agent */}
              {agent && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: '500', color: '#374151' }}>
                      Registered Agent {!registeredAgentChanged && '✅'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setRegisteredAgentChanged(!registeredAgentChanged)}
                      style={{
                        background: registeredAgentChanged ? '#ef4444' : '#0ea5e9',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {registeredAgentChanged ? 'Cancel Edit' : 'Change Agent'}
                    </button>
                  </div>

                  {!registeredAgentChanged ? (
                    <div style={{
                      padding: '0.75rem',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}>
                      {agent.agentType === 'COMPANY' ? agent.companyName : `${agent.firstName} ${agent.lastName}`}
                    </div>
                  ) : (
                    <div style={{
                      padding: '1rem',
                      background: '#fef3c7',
                      border: '2px solid #fbbf24',
                      borderRadius: '8px'
                    }}>
                      <p style={{ color: '#92400e', marginBottom: '1rem', fontWeight: '500' }}>
                        📝 Changing Registered Agent
                      </p>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#374151' }}>
                          Agent Type *
                        </label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              value="INDIVIDUAL"
                              checked={newRegisteredAgent.agentType === 'INDIVIDUAL'}
                              onChange={(e) => setNewRegisteredAgent({...newRegisteredAgent, agentType: 'INDIVIDUAL'})}
                              style={{ marginRight: '0.5rem' }}
                            />
                            Individual
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              value="COMPANY"
                              checked={newRegisteredAgent.agentType === 'COMPANY'}
                              onChange={(e) => setNewRegisteredAgent({...newRegisteredAgent, agentType: 'COMPANY'})}
                              style={{ marginRight: '0.5rem' }}
                            />
                            Company
                          </label>
                        </div>
                      </div>

                      {newRegisteredAgent.agentType === 'INDIVIDUAL' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                              First Name *
                            </label>
                            <input
                              type="text"
                              value={newRegisteredAgent.firstName}
                              onChange={(e) => setNewRegisteredAgent({...newRegisteredAgent, firstName: e.target.value})}
                              required={registeredAgentChanged}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                              Last Name *
                            </label>
                            <input
                              type="text"
                              value={newRegisteredAgent.lastName}
                              onChange={(e) => setNewRegisteredAgent({...newRegisteredAgent, lastName: e.target.value})}
                              required={registeredAgentChanged}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem'
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                            Company Name *
                          </label>
                          <input
                            type="text"
                            value={newRegisteredAgent.companyName}
                            onChange={(e) => setNewRegisteredAgent({...newRegisteredAgent, companyName: e.target.value})}
                            required={registeredAgentChanged}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                      )}

                      <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                        Agent Address (Must be Florida street address) *
                      </p>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={newRegisteredAgent.address.street}
                          onChange={(e) => setNewRegisteredAgent({...newRegisteredAgent, address: {...newRegisteredAgent.address, street: e.target.value}})}
                          required={registeredAgentChanged}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                        <input
                          type="text"
                          placeholder="City"
                          value={newRegisteredAgent.address.city}
                          onChange={(e) => setNewRegisteredAgent({...newRegisteredAgent, address: {...newRegisteredAgent.address, city: e.target.value}})}
                          required={registeredAgentChanged}
                          style={{
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="FL"
                          value={newRegisteredAgent.address.state}
                          onChange={(e) => setNewRegisteredAgent({...newRegisteredAgent, address: {...newRegisteredAgent.address, state: e.target.value}})}
                          required={registeredAgentChanged}
                          maxLength={2}
                          style={{
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="ZIP"
                          value={newRegisteredAgent.address.zipCode}
                          onChange={(e) => setNewRegisteredAgent({...newRegisteredAgent, address: {...newRegisteredAgent.address, zipCode: e.target.value}})}
                          required={registeredAgentChanged}
                          maxLength={10}
                          style={{
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Managers/Officers */}
              {selectedEntity.managersOfficers.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: '500', color: '#374151' }}>
                      Managers/Officers {!managersOfficersChanged && '✅'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setManagersOfficersChanged(!managersOfficersChanged);
                        if (!managersOfficersChanged) {
                          // Initialize with current managers/officers
                          setNewManagersOfficers(selectedEntity.managersOfficers.map(p => ({
                            firstName: p.firstName,
                            lastName: p.lastName,
                            title: p.title || p.roleType,
                            roleType: p.roleType,
                            address: p.address
                          })));
                        }
                      }}
                      style={{
                        background: managersOfficersChanged ? '#ef4444' : '#0ea5e9',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {managersOfficersChanged ? 'Cancel Edit' : 'Edit Officers'}
                    </button>
                  </div>

                  {!managersOfficersChanged ? (
                    <div style={{
                      padding: '0.75rem',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}>
                      {selectedEntity.managersOfficers.map((person, idx) => (
                        <div key={person.id} style={{ marginBottom: idx < selectedEntity.managersOfficers.length - 1 ? '0.5rem' : '0' }}>
                          {person.firstName} {person.lastName} - {person.title || person.roleType}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '1rem',
                      background: '#fef3c7',
                      border: '2px solid #fbbf24',
                      borderRadius: '8px'
                    }}>
                      <p style={{ color: '#92400e', marginBottom: '1rem', fontWeight: '500' }}>
                        📝 Editing Managers/Officers (Up to 150 allowed)
                      </p>

                      {newManagersOfficers.map((person, idx) => (
                        <div key={idx} style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '6px',
                          marginBottom: '1rem',
                          border: '1px solid #d1d5db'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: '500', color: '#374151' }}>Person {idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = newManagersOfficers.filter((_, i) => i !== idx);
                                setNewManagersOfficers(updated);
                              }}
                              style={{
                                background: '#ef4444',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Remove
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#374151' }}>
                                First Name *
                              </label>
                              <input
                                type="text"
                                value={person.firstName}
                                onChange={(e) => {
                                  const updated = [...newManagersOfficers];
                                  updated[idx].firstName = e.target.value;
                                  setNewManagersOfficers(updated);
                                }}
                                required={managersOfficersChanged}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem'
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#374151' }}>
                                Last Name *
                              </label>
                              <input
                                type="text"
                                value={person.lastName}
                                onChange={(e) => {
                                  const updated = [...newManagersOfficers];
                                  updated[idx].lastName = e.target.value;
                                  setNewManagersOfficers(updated);
                                }}
                                required={managersOfficersChanged}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem'
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#374151' }}>
                                Title *
                              </label>
                              <input
                                type="text"
                                value={person.title}
                                onChange={(e) => {
                                  const updated = [...newManagersOfficers];
                                  updated[idx].title = e.target.value;
                                  setNewManagersOfficers(updated);
                                }}
                                placeholder="e.g., Manager, President, Director"
                                required={managersOfficersChanged}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem'
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#374151' }}>
                                Role Type *
                              </label>
                              <select
                                value={person.roleType}
                                onChange={(e) => {
                                  const updated = [...newManagersOfficers];
                                  updated[idx].roleType = e.target.value;
                                  setNewManagersOfficers(updated);
                                }}
                                required={managersOfficersChanged}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem'
                                }}
                              >
                                <option value="MANAGER">Manager</option>
                                <option value="MEMBER">Member</option>
                                <option value="OFFICER">Officer</option>
                                <option value="DIRECTOR">Director</option>
                                <option value="PRESIDENT">President</option>
                                <option value="VICE_PRESIDENT">Vice President</option>
                                <option value="SECRETARY">Secretary</option>
                                <option value="TREASURER">Treasurer</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#374151' }}>
                              Address *
                            </label>
                            <input
                              type="text"
                              value={person.address}
                              onChange={(e) => {
                                const updated = [...newManagersOfficers];
                                updated[idx].address = e.target.value;
                                setNewManagersOfficers(updated);
                              }}
                              placeholder="Full address"
                              required={managersOfficersChanged}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '0.875rem'
                              }}
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          if (newManagersOfficers.length < 150) {
                            setNewManagersOfficers([...newManagersOfficers, {
                              firstName: '',
                              lastName: '',
                              title: '',
                              roleType: 'MANAGER',
                              address: ''
                            }]);
                          }
                        }}
                        disabled={newManagersOfficers.length >= 150}
                        style={{
                          background: newManagersOfficers.length >= 150 ? '#9ca3af' : '#10b981',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: newManagersOfficers.length >= 150 ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          width: '100%'
                        }}
                      >
                        + Add Another Person {newManagersOfficers.length >= 150 && '(Maximum Reached)'}
                      </button>

                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                        {newManagersOfficers.length} of 150 maximum
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Confirmation Checkbox */}
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '1.5rem'
              }}>
                {(feiNumberChanged || principalAddressChanged || mailingAddressChanged || registeredAgentChanged || managersOfficersChanged) && (
                  <div style={{
                    background: '#dbeafe',
                    border: '1px solid #60a5fa',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ color: '#1e40af', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                      📝 Changes Detected:
                    </p>
                    <ul style={{ color: '#1e40af', fontSize: '0.875rem', marginLeft: '1.5rem' }}>
                      {feiNumberChanged && <li>FEI/EIN Number</li>}
                      {principalAddressChanged && <li>Principal Address</li>}
                      {mailingAddressChanged && <li>Mailing Address</li>}
                      {registeredAgentChanged && <li>Registered Agent</li>}
                      {managersOfficersChanged && <li>Managers/Officers</li>}
                    </ul>
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={confirmCurrentInfo}
                    onChange={(e) => setConfirmCurrentInfo(e.target.checked)}
                    required
                    style={{ marginRight: '0.75rem', width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#92400e', fontWeight: '500' }}>
                    {(feiNumberChanged || principalAddressChanged || mailingAddressChanged || registeredAgentChanged || managersOfficersChanged)
                      ? 'I confirm that all information above (including changes) is current and accurate'
                      : 'I confirm that all information above is current and accurate'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Correspondence Email */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#111827'
            }}>
              Contact Information
            </h2>
            
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
              Correspondence Email *
            </label>
            <input
              type="email"
              value={correspondenceEmail}
              onChange={(e) => setCorrespondenceEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              We'll send filing confirmation to this email
            </p>
          </div>

          {/* Submit Button */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <button
              type="submit"
              disabled={submitting || !confirmCurrentInfo}
              style={{
                width: '100%',
                background: submitting || !confirmCurrentInfo ? '#9ca3af' : '#0ea5e9',
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: submitting || !confirmCurrentInfo ? 'not-allowed' : 'pointer',
                fontSize: '1.125rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {submitting ? 'Filing Annual Report...' : 'File Annual Report'}
            </button>
            
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem', textAlign: 'center' }}>
              Filing fee: $138.75 (will be charged after submission)
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

