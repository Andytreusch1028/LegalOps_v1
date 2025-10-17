"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  businessName: string;
  type: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch orders");
        return;
      }

      setOrders(data.orders);
    } catch (err) {
      setError("An error occurred while fetching orders");
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

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '48px' }}>
        <div>
          <h1 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px' }}>
            Orders
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b' }}>
            Manage and track all your business formation orders
          </p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="inline-flex items-center font-medium text-white transition-all duration-200"
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            borderRadius: '10px',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
            gap: '8px'
          }}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Order
        </Link>
      </div>

      {/* Orders List */}
      <div
        className="bg-white rounded-xl"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}
      >
        {loading ? (
          <div className="text-center" style={{ padding: '64px 24px' }}>
            <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 mx-auto" style={{ width: '48px', height: '48px' }}></div>
            <p className="font-medium" style={{ fontSize: '16px', color: '#64748b', marginTop: '20px' }}>
              Loading orders...
            </p>
          </div>
        ) : error ? (
          <div className="text-center" style={{ padding: '64px 24px' }}>
            <div
              className="inline-flex items-center justify-center mx-auto"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fee2e2',
                marginBottom: '20px'
              }}
            >
              <svg style={{ width: '32px', height: '32px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="font-medium" style={{ fontSize: '18px', color: '#dc2626', marginBottom: '8px' }}>
              {error}
            </p>
            <button
              onClick={fetchOrders}
              className="font-medium transition-colors duration-200"
              style={{ fontSize: '14px', color: '#0ea5e9', marginTop: '12px' }}
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center" style={{ padding: '64px 24px' }}>
            <div
              className="inline-flex items-center justify-center mx-auto"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f1f5f9',
                marginBottom: '20px'
              }}
            >
              <svg style={{ width: '32px', height: '32px', color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium" style={{ fontSize: '18px', color: '#64748b', marginBottom: '8px' }}>
              No orders yet
            </p>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              Create your first order to get started
            </p>
            <Link
              href="/dashboard/orders/new"
              className="inline-flex items-center font-medium text-white transition-all duration-200"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderRadius: '10px',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                gap: '8px'
              }}
            >
              <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create First Order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th className="text-left font-medium" style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Order #
                  </th>
                  <th className="text-left font-medium" style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Business Name
                  </th>
                  <th className="text-left font-medium" style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Type
                  </th>
                  <th className="text-left font-medium" style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Status
                  </th>
                  <th className="text-left font-medium" style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Amount
                  </th>
                  <th className="text-left font-medium" style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Date
                  </th>
                  <th style={{ padding: '16px 24px' }}></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const statusColors = getStatusColor(order.status);
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <span className="font-medium" style={{ fontSize: '14px', color: '#0f172a' }}>
                          {order.orderNumber}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ fontSize: '14px', color: '#0f172a' }}>
                          {order.businessName}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                          {formatOrderType(order.type)}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span
                          className="inline-block font-medium rounded-lg"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            background: statusColors.bg,
                            color: statusColors.text,
                            border: `1px solid ${statusColors.border}`
                          }}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span className="font-medium" style={{ fontSize: '14px', color: '#0f172a' }}>
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="font-medium transition-colors duration-200"
                          style={{ fontSize: '14px', color: '#0ea5e9' }}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

