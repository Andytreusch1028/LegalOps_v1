'use client';

import { useState } from 'react';
import { ChevronDown, Building2, Plus } from 'lucide-react';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
  entityType: string;
  status: string;
}

interface BusinessSelectorProps {
  businesses: Business[];
  selectedBusinessId?: string;
  onSelectBusiness?: (businessId: string) => void;
}

export default function BusinessSelector({ 
  businesses, 
  selectedBusinessId,
  onSelectBusiness 
}: BusinessSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // If no businesses, show "Add Business" button
  if (businesses.length === 0) {
    return (
      <Link
        href="/services"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(14, 165, 233, 0.3)';
        }}
      >
        <Plus size={18} />
        <span>Add Your First Business</span>
      </Link>
    );
  }

  // If only one business, show it without dropdown
  if (businesses.length === 1) {
    const business = businesses[0];
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 20px',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Building2 size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <p className="font-semibold" style={{ fontSize: '16px', color: '#0f172a', marginBottom: '2px' }}>
            {business.name}
          </p>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            {business.entityType.replace(/_/g, ' ')}
          </p>
        </div>
        <Link
          href={`/dashboard/businesses/${business.id}`}
          style={{
            padding: '8px 16px',
            background: '#0ea5e9',
            color: 'white',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0284c7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0ea5e9';
          }}
        >
          View Details
        </Link>
      </div>
    );
  }

  // Multiple businesses - show dropdown
  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId) || businesses[0];

  return (
    <div style={{ position: 'relative' }}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 20px',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s',
          minWidth: '300px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#0ea5e9';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(14, 165, 233, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Building2 size={20} color="white" />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p className="font-semibold" style={{ fontSize: '16px', color: '#0f172a', marginBottom: '2px' }}>
            {selectedBusiness.name}
          </p>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            {selectedBusiness.entityType.replace(/_/g, ' ')}
          </p>
        </div>
        <ChevronDown 
          size={20} 
          color="#64748b" 
          style={{ 
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40
            }}
          />

          {/* Menu */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              zIndex: 50,
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            {/* Business List */}
            <div style={{ padding: '8px' }}>
              {businesses.map((business) => (
                <div
                  key={business.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    background: business.id === selectedBusinessId ? '#f0f9ff' : 'transparent',
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (business.id !== selectedBusinessId) {
                      e.currentTarget.style.background = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (business.id !== selectedBusinessId) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <button
                    onClick={() => {
                      onSelectBusiness?.(business.id);
                      setIsOpen(false);
                    }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '4px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        background: business.id === selectedBusinessId
                          ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                          : '#f1f5f9',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Building2
                        size={18}
                        color={business.id === selectedBusinessId ? 'white' : '#64748b'}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        className="font-semibold"
                        style={{
                          fontSize: '14px',
                          color: business.id === selectedBusinessId ? '#0ea5e9' : '#0f172a',
                          marginBottom: '2px'
                        }}
                      >
                        {business.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>
                        {business.entityType.replace(/_/g, ' ')}
                      </p>
                    </div>
                    {business.id === selectedBusinessId && (
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          background: '#0ea5e9',
                          borderRadius: '50%'
                        }}
                      />
                    )}
                  </button>
                  <Link
                    href={`/dashboard/businesses/${business.id}`}
                    onClick={() => setIsOpen(false)}
                    style={{
                      padding: '6px 12px',
                      background: '#0ea5e9',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0284c7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#0ea5e9';
                    }}
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>

            {/* Add Business Button */}
            <div style={{ borderTop: '1px solid #e2e8f0', padding: '8px' }}>
              <Link
                href="/services"
                onClick={() => setIsOpen(false)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  color: '#0ea5e9',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f9ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    background: '#dbeafe',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Plus size={18} color="#0ea5e9" />
                </div>
                <span>Add Another Business</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

