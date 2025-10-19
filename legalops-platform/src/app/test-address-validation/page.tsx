'use client';

import { useState } from 'react';
import AddressValidationModal from '@/components/AddressValidationModal';
import { AddressInput, AddressDisclaimerAcceptance } from '@/lib/services/usps-address-validation';

/**
 * Test page for USPS Address Validation
 * Navigate to: http://localhost:3000/test-address-validation
 */
export default function TestAddressValidationPage() {
  const [address, setAddress] = useState<AddressInput>({
    address1: '', // Apt/Suite/Unit
    address2: '73 W Flagler St', // Street Address
    city: 'Miami',
    state: 'FL',
    zip5: ''
  });

  const [finalAddress, setFinalAddress] = useState<AddressInput | null>(null);
  const [disclaimerAcceptances, setDisclaimerAcceptances] = useState<AddressDisclaimerAcceptance[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setShowModal(false);

    try {
      const response = await fetch('/api/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Validation failed');
        return;
      }

      setResult(data.result);
      setShowModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCorrection = (correctedAddress: AddressInput, disclaimerAcceptance?: AddressDisclaimerAcceptance) => {
    setFinalAddress(correctedAddress);

    // CRITICAL: Save disclaimer acceptance to customer data file
    if (disclaimerAcceptance) {
      setDisclaimerAcceptances(prev => [...prev, disclaimerAcceptance]);
      console.log('📝 DISCLAIMER ACCEPTANCE LOGGED:', disclaimerAcceptance);
      // In production: Save to database/customer file
      // await saveDisclaimerAcceptance(customerId, disclaimerAcceptance);
    }

    setShowModal(false);
    alert('Address accepted! Disclaimer acceptance has been logged with timestamp.');
  };

  const handleEdit = () => {
    setShowModal(false);
    // Focus back on the form to edit
  };

  const handleProceedAnyway = (originalAddress: AddressInput, disclaimerAcceptance: AddressDisclaimerAcceptance) => {
    setFinalAddress(originalAddress);

    // CRITICAL: Save disclaimer acceptance to customer data file
    setDisclaimerAcceptances(prev => [...prev, disclaimerAcceptance]);
    console.log('📝 DISCLAIMER ACCEPTANCE LOGGED:', disclaimerAcceptance);
    // In production: Save to database/customer file
    // await saveDisclaimerAcceptance(customerId, disclaimerAcceptance);

    setShowModal(false);
    alert('Proceeding with original address! Disclaimer acceptance has been logged with timestamp.');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>🏛️ USPS Address Validation Test</h1>
      
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '30px', 
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Enter Address to Validate:</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Street Address:
          </label>
          <input
            type="text"
            value={address.address2 || ''}
            onChange={(e) => setAddress({ ...address, address2: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px'
            }}
            placeholder="123 Main Street"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Apt / Suite / Unit (Optional):
          </label>
          <input
            type="text"
            value={address.address1 || ''}
            onChange={(e) => setAddress({ ...address, address1: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px'
            }}
            placeholder="Apt 5B, Suite 200, etc."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              City:
            </label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px'
              }}
              placeholder="Miami"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              State:
            </label>
            <input
              type="text"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px'
              }}
              placeholder="FL"
              maxLength={2}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              ZIP Code:
            </label>
            <input
              type="text"
              value={address.zip5}
              onChange={(e) => setAddress({ ...address, zip5: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px'
              }}
              placeholder="33101"
              maxLength={5}
            />
          </div>
        </div>

        <button
          onClick={handleValidate}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#94a3b8' : '#2563eb',
            color: 'white',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Validating...' : '✓ Validate Address'}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '10px' }}>❌ Error:</h3>
          <p style={{ color: '#991b1b' }}>{error}</p>
        </div>
      )}

      {finalAddress && (
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #6ee7b7',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#065f46', marginBottom: '15px', fontSize: '20px' }}>
            ✅ Final Address Selected:
          </h3>
          <div style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ margin: '5px 0' }}>{finalAddress.address2}</p>
            {finalAddress.address1 && (
              <p style={{ margin: '5px 0' }}>{finalAddress.address1}</p>
            )}
            <p style={{ margin: '5px 0' }}>
              {finalAddress.city}, {finalAddress.state} {finalAddress.zip5}
              {finalAddress.zip4 && `-${finalAddress.zip4}`}
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer Acceptances Log (CRITICAL for legal protection) */}
      {disclaimerAcceptances.length > 0 && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#92400e', marginBottom: '15px', fontSize: '20px', fontWeight: '700' }}>
            📋 Disclaimer Acceptances Log ({disclaimerAcceptances.length})
          </h3>
          <p style={{ color: '#78350f', marginBottom: '15px', fontSize: '14px' }}>
            ⚠️ <strong>CRITICAL:</strong> These records must be saved to the customer's data file for legal protection.
          </p>

          {disclaimerAcceptances.map((acceptance, index) => (
            <details key={index} style={{ marginBottom: '15px' }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: '600',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #fbbf24',
                marginBottom: '10px'
              }}>
                #{index + 1} - {acceptance.issueType} - {new Date(acceptance.timestamp).toLocaleString()}
              </summary>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                fontSize: '14px'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Timestamp:</strong> {acceptance.timestamp}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Issue Type:</strong> <span style={{
                    backgroundColor: acceptance.issueType === 'UNVERIFIED' ? '#fee2e2' : '#fef3c7',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: '600'
                  }}>{acceptance.issueType}</span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Address Used:</strong>
                  <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                    {acceptance.addressUsed.address2}<br />
                    {acceptance.addressUsed.address1 && <>{acceptance.addressUsed.address1}<br /></>}
                    {acceptance.addressUsed.city}, {acceptance.addressUsed.state} {acceptance.addressUsed.zip5}
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Acknowledged Risk:</strong> {acceptance.acknowledgedRisk ? '✅ Yes' : '❌ No'}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Confirmed Proceed:</strong> {acceptance.confirmedProceed ? '✅ Yes' : '❌ No'}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Disclaimer 1:</strong>
                  <div style={{
                    marginLeft: '20px',
                    marginTop: '5px',
                    padding: '10px',
                    backgroundColor: '#f9fafb',
                    borderLeft: '3px solid #f59e0b',
                    fontStyle: 'italic'
                  }}>
                    {acceptance.disclaimer1Text}
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Disclaimer 2:</strong>
                  <div style={{
                    marginLeft: '20px',
                    marginTop: '5px',
                    padding: '10px',
                    backgroundColor: '#f9fafb',
                    borderLeft: '3px solid #f59e0b',
                    fontStyle: 'italic'
                  }}>
                    {acceptance.disclaimer2Text}
                  </div>
                </div>
                {acceptance.context && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Context:</strong> {acceptance.context}
                  </div>
                )}
                <div style={{
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <strong>User Agent:</strong> {acceptance.userAgent}
                </div>
              </div>
            </details>
          ))}

          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px'
          }}>
            <p style={{ color: '#991b1b', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
              ⚠️ PRODUCTION IMPLEMENTATION REQUIRED:
            </p>
            <ul style={{ color: '#7f1d1d', fontSize: '13px', marginLeft: '20px' }}>
              <li>Save to customer database with customer ID</li>
              <li>Include in customer data export/download</li>
              <li>Preserve in audit logs</li>
              <li>Include in legal document packages</li>
              <li>Retain for compliance period (7+ years recommended)</li>
            </ul>
          </div>
        </div>
      )}

      {/* User-Friendly Modal */}
      {showModal && result && (
        <AddressValidationModal
          enteredAddress={address}
          validationResult={result}
          onAcceptCorrection={handleAcceptCorrection}
          onEdit={handleEdit}
          onProceedAnyway={handleProceedAnyway}
          onClose={() => setShowModal(false)}
          customerId="TEST_CUSTOMER_123" // In production: use actual customer ID
        />
      )}

      {/* Developer Debug Info (collapsible) */}
      {result && (
        <details style={{ marginTop: '20px' }}>
          <summary style={{
            cursor: 'pointer',
            fontWeight: '600',
            padding: '10px',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px'
          }}>
            🔧 Developer Debug Info
          </summary>
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '10px'
          }}>
            <h4 style={{ marginBottom: '10px', fontWeight: '600' }}>Full API Response:</h4>
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              fontSize: '12px'
            }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}

