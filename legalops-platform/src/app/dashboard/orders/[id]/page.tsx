"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface StatusUpdate {
  id: string;
  status: string;
  message: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  businessName: string;
  type: string;
  status: string;
  entityType: string;
  state: string;
  basePrice: number;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  statusUpdates: StatusUpdate[];
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch order");
        return;
      }

      setOrder(data.order);
    } catch (err) {
      setError("An error occurred while fetching order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      PENDING: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      PAYMENT_REQUIRED: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
      PAID: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
      IN_REVIEW: { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
      SUBMITTED_TO_STATE: { bg: '#ddd6fe', text: '#5b21b6', border: '#c4b5fd' },
      APPROVED: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
      COMPLETED: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
      CANCELLED: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
    };
    return colors[status] || colors.PENDING;
  };

  const formatOrderType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '96px 24px' }}>
        <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 mx-auto" style={{ width: '64px', height: '64px' }}></div>
        <p className="font-medium" style={{ fontSize: '18px', color: '#64748b', marginTop: '24px' }}>
          Loading order details...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center" style={{ padding: '96px 24px' }}>
        <div 
          className="inline-flex items-center justify-center mx-auto" 
          style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%',
            background: '#fee2e2',
            marginBottom: '24px'
          }}
        >
          <svg style={{ width: '40px', height: '40px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="font-semibold" style={{ fontSize: '24px', color: '#dc2626', marginBottom: '12px' }}>
          {error || "Order not found"}
        </p>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center font-medium transition-colors duration-200"
          style={{ fontSize: '16px', color: '#0ea5e9', gap: '8px' }}
        >
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusColors = getStatusColor(order.status);

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
            Order Details
          </h1>
        </div>
        <p style={{ fontSize: '16px', color: '#64748b' }}>
          {order.orderNumber}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '32px' }}>
        {/* Main Content */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Order Information */}
          <div 
            className="bg-white rounded-xl" 
            style={{ 
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <h2 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a', marginBottom: '24px' }}>
              Order Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '24px' }}>
              <div>
                <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Business Name
                </p>
                <p className="font-medium" style={{ fontSize: '16px', color: '#0f172a' }}>
                  {order.businessName}
                </p>
              </div>

              <div>
                <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Entity Type
                </p>
                <p className="font-medium" style={{ fontSize: '16px', color: '#0f172a' }}>
                  {order.entityType}
                </p>
              </div>

              <div>
                <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Service Type
                </p>
                <p className="font-medium" style={{ fontSize: '16px', color: '#0f172a' }}>
                  {formatOrderType(order.type)}
                </p>
              </div>

              <div>
                <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  State
                </p>
                <p className="font-medium" style={{ fontSize: '16px', color: '#0f172a' }}>
                  {order.state}
                </p>
              </div>

              <div>
                <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Order Date
                </p>
                <p className="font-medium" style={{ fontSize: '16px', color: '#0f172a' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div>
                <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Total Amount
                </p>
                <p className="font-semibold" style={{ fontSize: '20px', color: '#0ea5e9' }}>
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div 
            className="bg-white rounded-xl" 
            style={{ 
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <h2 className="font-semibold" style={{ fontSize: '20px', color: '#0f172a', marginBottom: '24px' }}>
              Status Timeline
            </h2>

            {order.statusUpdates && order.statusUpdates.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {order.statusUpdates.map((update, index) => {
                  const updateColors = getStatusColor(update.status);
                  return (
                    <div key={update.id} className="flex" style={{ gap: '16px' }}>
                      <div className="flex flex-col items-center" style={{ width: '24px' }}>
                        <div 
                          className="rounded-full" 
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            background: updateColors.text,
                            flexShrink: 0
                          }}
                        ></div>
                        {index < order.statusUpdates.length - 1 && (
                          <div 
                            style={{ 
                              width: '2px', 
                              flex: 1, 
                              background: '#e2e8f0',
                              marginTop: '8px',
                              marginBottom: '8px'
                            }}
                          ></div>
                        )}
                      </div>
                      <div style={{ flex: 1, paddingBottom: index < order.statusUpdates.length - 1 ? '0' : '0' }}>
                        <div className="flex items-center" style={{ gap: '12px', marginBottom: '8px' }}>
                          <span 
                            className="inline-block font-medium rounded-lg"
                            style={{ 
                              padding: '4px 10px',
                              fontSize: '12px',
                              background: updateColors.bg,
                              color: updateColors.text,
                              border: `1px solid ${updateColors.border}`
                            }}
                          >
                            {update.status.replace(/_/g, ' ')}
                          </span>
                          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                            {new Date(update.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>
                          {update.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center', padding: '32px 0' }}>
                No status updates yet
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Current Status Card */}
          <div 
            className="bg-white rounded-xl" 
            style={{ 
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
              Current Status
            </p>
            <span 
              className="inline-block font-semibold rounded-lg"
              style={{ 
                padding: '10px 16px',
                fontSize: '14px',
                background: statusColors.bg,
                color: statusColors.text,
                border: `1.5px solid ${statusColors.border}`
              }}
            >
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Payment Status Card */}
          <div 
            className="bg-white rounded-xl" 
            style={{ 
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
              Payment Status
            </p>
            <p className="font-semibold" style={{ fontSize: '16px', color: order.paymentStatus === 'PAID' ? '#059669' : '#dc2626' }}>
              {order.paymentStatus}
            </p>
          </div>

          {/* Actions */}
          {order.paymentStatus !== 'PAID' && (
            <button
              className="w-full font-medium text-white transition-all duration-200"
              style={{ 
                padding: '14px', 
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderRadius: '10px',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Pay Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

