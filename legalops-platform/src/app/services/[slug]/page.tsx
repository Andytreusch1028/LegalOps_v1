'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, Clock, Tag, ShoppingCart, Lock } from 'lucide-react';
import LLCFormationWizard from '@/components/LLCFormationWizard';
import FictitiousNameWizard from '@/components/FictitiousNameWizard';
import PackageSelector from '@/components/PackageSelector';
import CheckoutUpsell from '@/components/CheckoutUpsell';
import { cn, cardBase } from '@/components/legalops/theme';
import { formatCurrency } from '@/components/legalops/utils';
import { requiresAccount, allowsGuestCheckout } from '@/config/service-data-requirements';

interface Service {
  id: string;
  name: string;
  slug: string;
  orderType: string; // Maps to ServiceType enum (LLC_FORMATION, OPERATING_AGREEMENT, etc.)
  shortDescription: string;
  longDescription: string;
  totalPrice: number;
  serviceFee: number;
  stateFee: number;
  registeredAgentFee?: number;
  rushFee?: number;
  rushFeeAvailable?: boolean;
  icon: string;
  processingTime: string;
  category: string;
  requirements?: string[];
}

interface Package {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  features: string[];
  badge: string | null;
  highlightColor: string | null;
  includesRA: boolean;
  raYears: number;
  includesEIN: boolean;
  includesAI: boolean;
  includesOperatingAgreement: boolean;
  includesComplianceCalendar: boolean;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<Record<string, unknown> | null>(null);
  const [preservedFormData, setPreservedFormData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${slug}`);
        if (response.ok) {
          const data = await response.json();
          // Convert Decimal strings to numbers
          const service = {
            ...data,
            totalPrice: typeof data.totalPrice === 'string' ? parseFloat(data.totalPrice) : data.totalPrice,
            serviceFee: typeof data.serviceFee === 'string' ? parseFloat(data.serviceFee) : data.serviceFee,
            stateFee: typeof data.stateFee === 'string' ? parseFloat(data.stateFee) : data.stateFee,
          };
          setService(service);
        }
      } catch (error) {
        console.error('Failed to fetch service:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  // Handle form submission - show upsell if Basic package selected
  const handleFormSubmit = async (formData: any) => {
    // If user selected Basic package, show upsell modal
    if (selectedPackage?.slug === 'basic') {
      setPendingFormData(formData);
      setShowUpsell(true);
      return;
    }

    // Otherwise, proceed directly to create order
    await createOrder(formData);
  };

  // Create order and redirect to checkout
  const createOrder = async (formData: any) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service?.id,
          orderType: service?.orderType || 'LLC_FORMATION',
          orderData: formData,
          packageId: selectedPackage?.id || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      router.push(`/checkout/${data.orderId || data.order?.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  // Handle Buy Now button click
  const handleBuyNow = async () => {
    console.log('handleBuyNow called');
    console.log('service:', service);
    console.log('session:', session);

    if (!service) {
      console.log('No service found, returning');
      return;
    }

    // If user is authenticated
    if (session) {
      console.log('User is authenticated');
      console.log('service.orderType:', service.orderType);

      // For services with forms on this page (LLC Formation, DBA), show the form
      if (service.orderType === 'LLC_FORMATION' || service.orderType === 'FICTITIOUS_NAME_REGISTRATION') {
        console.log('Showing form for LLC/DBA');
        setShowForm(true);
        // Scroll to form
        setTimeout(() => {
          const formElement = document.getElementById('service-form');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        // For other services (Annual Report, etc.), create order and redirect to appropriate page
        console.log('Creating order for other service type');
        try {
          console.log('Sending request to /api/orders with:', {
            serviceId: service.id,
            orderType: service.orderType,
            orderData: { rushProcessing: false },
          });

          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: service.id,
              orderType: service.orderType,
              orderData: {
                // Minimal data to satisfy API requirements
                // Actual data will be collected on the dedicated form page
                rushProcessing: false,
              },
            }),
          });

          console.log('Response status:', response.status);
          console.log('Response ok:', response.ok);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Order creation failed:', errorData);
            throw new Error(errorData.error || 'Failed to create order');
          }

          const data = await response.json();
          console.log('Order created successfully:', data);
          const orderId = data.orderId || data.order?.id;
          console.log('Order ID:', orderId);

          // Redirect based on service type
          if (service.orderType === 'LLC_ANNUAL_REPORT' || service.orderType === 'CORP_ANNUAL_REPORT' || service.orderType === 'ANNUAL_REPORT') {
            console.log('Redirecting to annual report form');
            router.push(`/orders/${orderId}/annual-report`);
          } else {
            // Default to checkout page
            console.log('Redirecting to checkout');
            router.push(`/checkout/${orderId}`);
          }
        } catch (error) {
          console.error('Error creating order:', error);
          alert('Failed to create order. Please try again.');
        }
      }
    } else {
      console.log('User not authenticated, routing to checkout-router');
      // If not authenticated, route to checkout-router
      router.push(`/checkout-router?service=${service.orderType}&name=${encodeURIComponent(service.name)}&price=${service.totalPrice}`);
    }
  };

  // Handle upgrade from upsell modal
  const handleUpgrade = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowUpsell(false);
    // Create order with upgraded package
    if (pendingFormData) {
      createOrder(pendingFormData);
    }
  };

  // Handle continue with Basic package
  const handleContinueBasic = () => {
    setShowUpsell(false);
    // Create order with Basic package
    if (pendingFormData) {
      createOrder(pendingFormData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Service not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}>
      {/* Hero Header */}
      <div className="bg-white" style={{ borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4"></div>
            <div className="lg:col-span-8">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span className="text-5xl">{service.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <h1 className="font-semibold tracking-tight" style={{ fontSize: '48px', color: '#0f172a', marginBottom: '8px' }}>
                    {service.name}
                  </h1>
                  <p style={{ fontSize: '18px', color: '#64748b' }}>
                    {service.shortDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About This Service Section */}
      <div className="flex items-center justify-center" style={{ padding: '32px 24px' }}>
        <div className="max-w-4xl mx-auto w-full">
          <div
            className="bg-white rounded-xl text-center"
            style={{
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              padding: '32px',
            }}
          >
            <h3 className="font-bold text-slate-900" style={{ fontSize: '20px', marginBottom: '16px' }}>
              About This Service
            </h3>
            <p className="text-slate-600 max-w-3xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.7' }}>
              {service.longDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Different for LLC Formation, Corporation Formation, DBA, vs Other Services */}
      <div className="flex items-center justify-center" style={{ padding: '0 24px 64px' }}>
        <div className="max-w-4xl mx-auto w-full">
          {(service.orderType === 'LLC_FORMATION' || service.orderType === 'CORP_FORMATION') ? (
            /* LLC/Corporation Formation - Show Package Selector and Form Wizard */
            <>
              {!showForm ? (
                /* Package Selection */
                <div>
                  <PackageSelector
                    onSelectPackage={(pkg) => {
                      setSelectedPackage(pkg);
                      setShowForm(true);
                    }}
                    selectedPackageId={selectedPackage?.id}
                  />
                </div>
              ) : (
                /* Form Wizard */
                <div id="service-form" className="bg-white rounded-xl" style={{
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
                }}>
                  <div style={{ padding: '32px 32px 24px' }}>
                    {/* Package Selection Summary */}
                    {selectedPackage && (
                      <div className="mb-6 bg-sky-50 border-2 border-sky-300 rounded-lg" style={{ padding: '20px 24px' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-sky-700 font-medium">Selected Package:</p>
                            <p className="text-lg font-bold text-sky-900">{selectedPackage.name} - ${selectedPackage.price}</p>
                          </div>
                          <button
                            onClick={() => {
                              // Form data is already preserved via onFormDataChange callback
                              setShowForm(false);
                            }}
                            className="relative overflow-hidden bg-white text-sky-700 hover:bg-sky-50 font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                            style={{
                              fontSize: '14px',
                              padding: '12px 28px',
                              border: '2px solid #0ea5e9',
                              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                            }}
                          >
                            {/* Glass highlight effect */}
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)',
                                transform: 'translateY(-30%)',
                              }}
                            />
                            <span className="relative">Change Package</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {!selectedPackage && (
                      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-700 font-medium">Individual Filing Selected</p>
                            <p className="text-xs text-slate-600">You can add services at checkout</p>
                          </div>
                          <button
                            onClick={() => setShowForm(false)}
                            className="text-sm text-sky-600 hover:text-sky-800 underline"
                          >
                            View Packages
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <h2 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px', lineHeight: '1.2' }}>
                        Complete Your Order
                      </h2>
                      <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.5' }}>
                        Fill out the form below to get started with your {service.name.toLowerCase()}
                      </p>
                    </div>

                    {service.orderType === 'LLC_FORMATION' ? (
                      <LLCFormationWizard
                        serviceId={service.id}
                        service={{
                          id: service.id,
                          serviceFee: service.serviceFee,
                          stateFee: service.stateFee,
                          registeredAgentFee: service.registeredAgentFee || 0,
                          totalPrice: service.totalPrice,
                          rushFee: service.rushFee || 0,
                          rushFeeAvailable: service.rushFeeAvailable || false,
                        }}
                        selectedPackage={selectedPackage}
                        onSubmit={handleFormSubmit}
                        onPackageChange={(pkg: any) => setSelectedPackage(pkg)}
                        initialFormData={preservedFormData}
                        onFormDataChange={setPreservedFormData}
                      />
                    ) : service.orderType === 'CORP_FORMATION' ? (
                      <div className="text-center" style={{ padding: '48px 24px' }}>
                        <div className="bg-sky-50 border-2 border-sky-300 rounded-xl" style={{ padding: '32px', marginBottom: '24px' }}>
                          <h3 className="text-2xl font-semibold text-slate-900" style={{ marginBottom: '16px' }}>
                            Corporation Formation Wizard Coming Soon
                          </h3>
                          <p className="text-slate-600" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                            You've selected the <strong>{selectedPackage?.name} Package</strong> for Corporation Formation.
                            Our comprehensive formation wizard is currently under development.
                          </p>
                          <p className="text-slate-600" style={{ fontSize: '16px', lineHeight: '1.6', marginTop: '16px' }}>
                            In the meantime, please contact us at <a href="mailto:support@legalops.com" className="text-sky-600 hover:text-sky-800 underline">support@legalops.com</a> to complete your corporation formation.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowForm(false)}
                          className="text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                          style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                          }}
                        >
                          ← Back to Package Selection
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </>
          ) : service.orderType === 'FICTITIOUS_NAME_REGISTRATION' ? (
            /* Fictitious Name (DBA) - Show Form Wizard */
            <FictitiousNameWizard
              onSubmit={createOrder}
              initialData={preservedFormData}
            />
          ) : (
            /* All Other Services - Show Buy Now Button */
            /* Pricing Card */
            <div className="bg-white rounded-xl" style={{
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              padding: '32px',
            }}>
              <div className="text-center" style={{ marginBottom: '32px' }}>
                <p className="text-slate-600 mb-2" style={{ fontSize: '16px' }}>Total Price</p>
                <p className="font-bold text-sky-600" style={{ fontSize: '56px', lineHeight: '1' }}>
                  ${service.totalPrice.toFixed(2)}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pb-8 border-b border-slate-200" style={{ marginBottom: '32px' }}>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700" style={{ fontSize: '16px' }}>Service Fee</span>
                  <span className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>
                    ${service.serviceFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700" style={{ fontSize: '16px' }}>State Filing Fee</span>
                  <span className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>
                    ${service.stateFee.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Processing Time */}
              <div className="flex items-center justify-center gap-2 text-slate-600" style={{ marginBottom: '32px' }}>
                <Clock className="w-5 h-5" />
                <span style={{ fontSize: '15px' }}>{service.processingTime}</span>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="w-full relative overflow-hidden bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
                style={{
                  padding: '16px 32px',
                  fontSize: '18px',
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
                }}
              >
                {/* Glass highlight effect */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)',
                    transform: 'translateY(-30%)',
                  }}
                />
                <ShoppingCart className="w-6 h-6" />
                <span className="relative">Buy Now</span>
              </button>

              {/* Account Requirement Notice */}
              {requiresAccount(service.orderType) && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg" style={{
                  marginTop: '24px',
                  padding: '16px 20px'
                }}>
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Account Required</p>
                      <p className="text-xs text-blue-700">
                        This service requires creating an account for ongoing access and document delivery.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Guest Checkout Available Notice */}
              {allowsGuestCheckout(service.orderType) && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg" style={{
                  marginTop: '24px',
                  padding: '16px 20px'
                }}>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-900 mb-1">Guest Checkout Available</p>
                      <p className="text-xs text-green-700">
                        You can purchase this service without creating an account.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Upsell Modal */}
      {showUpsell && (
        <CheckoutUpsell
          currentPackage={selectedPackage}
          onUpgrade={handleUpgrade}
          onContinue={handleContinueBasic}
        />
      )}
    </div>
  );
}

