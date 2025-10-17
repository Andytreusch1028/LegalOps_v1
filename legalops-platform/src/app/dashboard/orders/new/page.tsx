"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * New Order Page - Professional Order Creation Form with Accordion
 */

/**
 * New Order Page - Professional Order Creation Form
 */

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtherEntities, setShowOtherEntities] = useState(false);

  // Name availability checking
  const [checkingName, setCheckingName] = useState(false);
  const [nameAvailability, setNameAvailability] = useState<{
    available: boolean;
    message: string;
    suggestions?: string[];
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    businessName: "",
    entityType: "LLC",
    orderType: "LLC_FORMATION",
    state: "FL",
  });

  // Top 3 most popular entity types (95% of customers choose these)
  const topEntities = [
    {
      type: "LLC",
      orderType: "LLC_FORMATION",
      name: "LLC",
      fullName: "Limited Liability Company",
      description: "Most popular - 85% of our clients choose this",
      details: "Perfect for small businesses, startups, and real estate. Liability protection with tax flexibility.",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      price: 299
    },
    {
      type: "CORPORATION",
      orderType: "CORP_FORMATION",
      name: "Corporation",
      fullName: "C-Corp or S-Corp",
      description: "Best for raising capital or going public",
      details: "Ideal for high-growth companies, tech startups, and businesses seeking investment.",
      icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      price: 299
    },
    {
      type: "SOLE_PROPRIETORSHIP",
      orderType: "LLC_FORMATION",
      name: "DBA",
      fullName: "Doing Business As (Fictitious Name)",
      description: "Simplest option for freelancers and consultants",
      details: "Quick and affordable, but no liability protection. Your personal assets are at risk.",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      price: 149
    },
  ];

  // Other entity types organized by category
  const otherEntityCategories = [
    {
      name: "Professional Services",
      description: "For licensed professionals like doctors, lawyers, CPAs, architects, and engineers",
      entities: [
        {
          type: "PROFESSIONAL_LLC",
          orderType: "PROFESSIONAL_LLC_FORMATION",
          name: "Professional LLC (PLLC)",
          description: "For licensed professionals (doctors, lawyers, CPAs, architects, engineers)",
          icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
          price: 349
        },
        {
          type: "PROFESSIONAL_CORPORATION",
          orderType: "PROFESSIONAL_CORP_FORMATION",
          name: "Professional Corporation (PA)",
          description: "Professional association for licensed professionals",
          icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
          price: 349
        },
      ]
    },
    {
      name: "Partnerships",
      description: "For businesses with multiple owners sharing profits and management",
      entities: [
        {
          type: "LIMITED_PARTNERSHIP",
          orderType: "LP_FORMATION",
          name: "Limited Partnership (LP)",
          description: "General partners manage, limited partners invest only",
          icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
          price: 279
        },
        {
          type: "LIMITED_LIABILITY_PARTNERSHIP",
          orderType: "LLP_FORMATION",
          name: "Limited Liability Partnership (LLP)",
          description: "All partners have limited liability protection",
          icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
          price: 279
        },
        {
          type: "LIMITED_LIABILITY_LIMITED_PARTNERSHIP",
          orderType: "LLLP_FORMATION",
          name: "Limited Liability Limited Partnership (LLLP)",
          description: "LP with additional liability protection for general partners",
          icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
          price: 279
        },
        {
          type: "GENERAL_PARTNERSHIP",
          orderType: "GP_FORMATION",
          name: "General Partnership (GP)",
          description: "All partners share management and liability equally",
          icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
          price: 279
        },
      ]
    },
    {
      name: "Nonprofit",
      description: "For charitable, religious, educational, or social welfare organizations",
      entities: [
        {
          type: "NONPROFIT_CORPORATION",
          orderType: "NONPROFIT_FORMATION",
          name: "Nonprofit Corporation",
          description: "Tax-exempt charitable organization (requires IRS 501(c)(3) approval)",
          icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
          price: 399
        },
      ]
    }
  ];

  // Check name availability with debounce
  const checkNameAvailability = useCallback(async (name: string, entityType: string) => {
    if (!name || name.trim().length < 3) {
      setNameAvailability(null);
      return;
    }

    setCheckingName(true);

    try {
      const response = await fetch('/api/check-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: name, entityType }),
      });

      const result = await response.json();

      if (result.success) {
        setNameAvailability({
          available: result.data.available,
          message: result.data.message,
          suggestions: result.data.suggestions,
        });
      } else {
        setNameAvailability({
          available: false,
          message: result.error || 'Unable to check name availability',
        });
      }
    } catch (error) {
      console.error('Error checking name:', error);
      setNameAvailability({
        available: false,
        message: 'Unable to check name availability. Please try again.',
      });
    } finally {
      setCheckingName(false);
    }
  }, []);

  // Debounce name checking
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.businessName.trim().length >= 3) {
        checkNameAvailability(formData.businessName, formData.entityType);
      } else {
        setNameAvailability(null);
      }
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timer);
  }, [formData.businessName, formData.entityType, checkNameAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create order");
        return;
      }

      // Redirect to order details page
      router.push(`/dashboard/orders/${data.order.id}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '48px' }}>
        <div className="flex items-center" style={{ gap: '16px', marginBottom: '12px' }}>
          <Link
            href="/dashboard/orders"
            className="transition-colors duration-200"
            style={{ color: '#64748b' }}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a' }}>
            Create New Order
          </h1>
        </div>
        <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '16px' }}>
          Register your business entity in Florida - All entity types available on Sunbiz.org
        </p>

        {/* Info Banner */}
        <div
          className="rounded-xl"
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
            display: 'flex',
            alignItems: 'start',
            gap: '12px'
          }}
        >
          <svg style={{ width: '20px', height: '20px', color: '#0284c7', flexShrink: 0, marginTop: '2px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold" style={{ fontSize: '14px', color: '#0369a1', marginBottom: '4px' }}>
              Not sure which entity type to choose?
            </p>
            <p style={{ fontSize: '13px', color: '#0c4a6e', lineHeight: '1.5' }}>
              LLCs are the most popular choice for small businesses (95% of our clients). They offer liability protection, tax flexibility, and simple management. Corporations are better for raising capital or going public.
            </p>
          </div>
        </div>
      </div>

      {/* Order Form Card */}
      <div 
        className="bg-white rounded-xl" 
        style={{ 
          padding: '48px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          maxWidth: '800px'
        }}
      >
        {/* Error Message */}
        {error && (
          <div 
            className="rounded-lg" 
            style={{ 
              marginBottom: '32px', 
              padding: '14px 18px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626'
            }}
          >
            <p style={{ fontSize: '14px', fontWeight: '500' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Entity Type Selection */}
          <div>
            <label className="block font-medium" style={{ fontSize: '14px', marginBottom: '16px', color: '#334155' }}>
              Select Entity Type
            </label>

            {/* Top 3 Most Popular - Large Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '16px', marginBottom: '24px' }}>
              {topEntities.map((entity) => (
                <button
                  key={entity.type}
                  type="button"
                  onClick={() => setFormData({ ...formData, orderType: entity.orderType, entityType: entity.type })}
                  className="text-center rounded-xl transition-all duration-200"
                  style={{
                    padding: '24px 20px',
                    border: formData.entityType === entity.type ? '2.5px solid #0ea5e9' : '2px solid #e2e8f0',
                    background: formData.entityType === entity.type ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' : '#ffffff',
                    boxShadow: formData.entityType === entity.type ? '0 8px 24px rgba(14, 165, 233, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div
                    className="flex items-center justify-center mx-auto"
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: formData.entityType === entity.type ? '#0ea5e9' : '#dbeafe',
                      marginBottom: '16px'
                    }}
                  >
                    <svg
                      style={{ width: '28px', height: '28px', color: formData.entityType === entity.type ? '#ffffff' : '#0284c7' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={entity.icon} />
                    </svg>
                  </div>
                  <p className="font-bold" style={{ fontSize: '18px', color: '#0f172a', marginBottom: '6px' }}>
                    {entity.name}
                  </p>
                  <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                    {entity.fullName}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '12px' }}>
                    {entity.description}
                  </p>
                  <div
                    className="font-semibold"
                    style={{
                      fontSize: '20px',
                      color: '#0ea5e9',
                      marginTop: '12px'
                    }}
                  >
                    ${entity.price}
                  </div>
                </button>
              ))}
            </div>

            {/* Accordion for Other Entity Types */}
            <div
              className="rounded-xl"
              style={{
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                overflow: 'hidden'
              }}
            >
              <button
                type="button"
                onClick={() => setShowOtherEntities(!showOtherEntities)}
                className="w-full text-left transition-colors duration-200"
                style={{
                  padding: '18px 20px',
                  background: showOtherEntities ? '#f8fafc' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#f1f5f9'
                    }}
                  >
                    <svg style={{ width: '20px', height: '20px', color: '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontSize: '15px', color: '#0f172a', marginBottom: '4px' }}>
                      Other Entity Types
                    </p>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>
                      Professional services, partnerships, and nonprofit organizations
                    </p>
                  </div>
                </div>
                <svg
                  style={{
                    width: '20px',
                    height: '20px',
                    color: '#64748b',
                    transform: showOtherEntities ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Accordion Content */}
              {showOtherEntities && (
                <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {otherEntityCategories.map((category, categoryIndex) => (
                    <div key={category.name} style={{ marginBottom: categoryIndex < otherEntityCategories.length - 1 ? '28px' : '0' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <h3 className="font-semibold" style={{ fontSize: '13px', color: '#0f172a', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {category.name}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>
                          {category.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '12px' }}>
                        {category.entities.map((entity) => (
                          <button
                            key={entity.type}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, orderType: entity.orderType, entityType: entity.type });
                              setShowOtherEntities(false); // Close accordion after selection
                            }}
                            className="text-left rounded-lg transition-all duration-200"
                            style={{
                              padding: '14px',
                              border: formData.entityType === entity.type ? '2px solid #0ea5e9' : '1.5px solid #e2e8f0',
                              background: formData.entityType === entity.type ? '#f0f9ff' : '#ffffff',
                            }}
                          >
                            <div className="flex items-start" style={{ gap: '10px' }}>
                              <div
                                className="flex items-center justify-center"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  background: formData.entityType === entity.type ? '#0ea5e9' : '#dbeafe',
                                  flexShrink: 0
                                }}
                              >
                                <svg
                                  style={{ width: '16px', height: '16px', color: formData.entityType === entity.type ? '#ffffff' : '#0284c7' }}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d={entity.icon} />
                                </svg>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                                  <p className="font-semibold" style={{ fontSize: '13px', color: '#0f172a' }}>
                                    {entity.name}
                                  </p>
                                  <span className="font-semibold" style={{ fontSize: '14px', color: '#0ea5e9' }}>
                                    ${entity.price}
                                  </span>
                                </div>
                                <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                                  {entity.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label
              htmlFor="businessName"
              className="block font-medium"
              style={{ fontSize: '14px', marginBottom: '10px', color: '#334155' }}
            >
              Business Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
                className="w-full bg-white transition-all duration-200"
                style={{
                  padding: '14px 48px 14px 16px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  border: nameAvailability
                    ? nameAvailability.available
                      ? '2px solid #10b981'
                      : '2px solid #ef4444'
                    : '1.5px solid #e2e8f0',
                  color: '#0f172a'
                }}
                placeholder="Enter your business name (e.g., Sunshine Consulting)"
                onFocus={(e) => {
                  if (!nameAvailability) {
                    e.target.style.borderColor = '#0ea5e9';
                  }
                }}
                onBlur={(e) => {
                  if (!nameAvailability) {
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
              />

              {/* Status Icon */}
              <div
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {checkingName && (
                  <div
                    className="animate-spin"
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #e2e8f0',
                      borderTopColor: '#0ea5e9',
                      borderRadius: '50%'
                    }}
                  />
                )}
                {!checkingName && nameAvailability && nameAvailability.available && (
                  <svg style={{ width: '24px', height: '24px', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {!checkingName && nameAvailability && !nameAvailability.available && (
                  <svg style={{ width: '24px', height: '24px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Availability Message */}
            {nameAvailability && (
              <div
                className="flex items-start"
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: nameAvailability.available ? '#f0fdf4' : '#fef2f2',
                  border: nameAvailability.available ? '1px solid #bbf7d0' : '1px solid #fecaca',
                  gap: '8px'
                }}
              >
                <svg
                  style={{
                    width: '16px',
                    height: '16px',
                    color: nameAvailability.available ? '#16a34a' : '#dc2626',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {nameAvailability.available ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  )}
                </svg>
                <div style={{ flex: 1 }}>
                  <p
                    className="font-medium"
                    style={{
                      fontSize: '13px',
                      color: nameAvailability.available ? '#16a34a' : '#dc2626',
                      marginBottom: '4px'
                    }}
                  >
                    {nameAvailability.message}
                  </p>

                  {/* Suggestions */}
                  {nameAvailability.suggestions && nameAvailability.suggestions.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#991b1b', marginBottom: '6px' }}>
                        Try these alternatives:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {nameAvailability.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setFormData({ ...formData, businessName: suggestion })}
                            className="transition-colors duration-200"
                            style={{
                              padding: '4px 10px',
                              fontSize: '12px',
                              borderRadius: '6px',
                              background: '#ffffff',
                              border: '1px solid #fca5a5',
                              color: '#991b1b',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#ffffff';
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!nameAvailability && !checkingName && (
              <p style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                We'll check if this name is available in Florida
              </p>
            )}
          </div>

          {/* State Selection */}
          <div>
            <label
              htmlFor="state"
              className="block font-medium"
              style={{ fontSize: '14px', marginBottom: '10px', color: '#334155' }}
            >
              State of Formation
            </label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
              className="w-full bg-white transition-all duration-200"
              style={{ 
                padding: '14px 16px', 
                borderRadius: '10px', 
                fontSize: '15px',
                border: '1.5px solid #e2e8f0',
                color: '#0f172a'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            >
              <option value="FL">Florida</option>
              <option value="DE">Delaware</option>
              <option value="WY">Wyoming</option>
              <option value="NV">Nevada</option>
              <option value="TX">Texas</option>
              <option value="CA">California</option>
              <option value="NY">New York</option>
            </select>
            <p style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
              Where you want to register your business
            </p>
          </div>

          {/* Pricing Info */}
          <div
            className="rounded-xl"
            style={{
              padding: '20px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
              <span className="font-medium" style={{ fontSize: '14px', color: '#334155' }}>
                Base Service Fee
              </span>
              <span className="font-semibold" style={{ fontSize: '18px', color: '#0f172a' }}>
                {formData.entityType === 'NONPROFIT_CORPORATION' ? '$399.00' :
                 formData.entityType.startsWith('PROFESSIONAL') ? '$349.00' :
                 formData.entityType.includes('PARTNERSHIP') ? '$279.00' :
                 formData.entityType === 'SOLE_PROPRIETORSHIP' ? '$149.00' :
                 '$299.00'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Includes state filing fees and registered agent service for 1 year
            </p>
            <div
              className="flex items-start"
              style={{
                marginTop: '12px',
                padding: '12px',
                background: '#dbeafe',
                borderRadius: '8px',
                gap: '8px'
              }}
            >
              <svg style={{ width: '16px', height: '16px', color: '#0284c7', flexShrink: 0, marginTop: '2px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p style={{ fontSize: '12px', color: '#0369a1', lineHeight: '1.5' }}>
                <strong>What's included:</strong> Document preparation, state filing, registered agent (1 year), EIN application assistance, operating agreement/bylaws template
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex" style={{ gap: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                padding: '15px', 
                borderRadius: '10px', 
                fontSize: '15px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(14, 165, 233, 0.3)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center" style={{ gap: '10px' }}>
                  <div className="animate-spin rounded-full border-2 border-white border-t-transparent" style={{ width: '18px', height: '18px' }}></div>
                  Creating Order...
                </span>
              ) : (
                "Create Order"
              )}
            </button>
            <Link
              href="/dashboard/orders"
              className="flex-1 text-center font-medium transition-all duration-200"
              style={{ 
                padding: '15px', 
                borderRadius: '10px', 
                fontSize: '15px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0'
              }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

