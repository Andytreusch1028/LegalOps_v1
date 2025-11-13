/**
 * Admin Orders Page
 * Displays all orders with filtering and search
 */

import { prisma } from '@/lib/prisma';
import { ShoppingCart, Calendar, DollarSign, Package } from 'lucide-react';
import Link from 'next/link';

export default async function AdminOrdersPage() {
  // Fetch all orders with user and items information
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      orderItems: {
        select: {
          id: true,
          serviceType: true,
          description: true,
          totalPrice: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Helper function to safely format service type
  const formatServiceType = (serviceType: string | null | undefined): string => {
    if (!serviceType) return 'No service type';
    return serviceType.replace(/_/g, ' ');
  };

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING').length;
  const paidOrders = orders.filter(o => o.paymentStatus === 'PAID').length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#1E293B',
          margin: '0 0 8px 0',
        }}>
          Orders
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748B',
          margin: 0,
        }}>
          Manage all customer orders and payments
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {/* Total Orders */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              background: '#EEF2FF',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShoppingCart size={20} style={{ color: '#6366F1' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Total Orders
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            {totalOrders}
          </div>
        </div>

        {/* Pending Orders */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              background: '#FEF3C7',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package size={20} style={{ color: '#F59E0B' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Pending
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            {pendingOrders}
          </div>
        </div>

        {/* Paid Orders */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              background: '#DCFCE7',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShoppingCart size={20} style={{ color: '#16A34A' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Paid
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            {paidOrders}
          </div>
        </div>

        {/* Total Revenue */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              background: '#D1FAE5',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DollarSign size={20} style={{ color: '#059669' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Total Revenue
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            ${totalRevenue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1E293B',
            margin: 0,
          }}>
            All Orders
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Order #
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Customer
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Items
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Total
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Order Status
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Payment Status
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Date
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '600', color: '#1E293B', fontFamily: 'monospace' }}>
                      {order.orderNumber}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {order.isGuestOrder ? (
                      <div>
                        <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                          {order.guestFirstName} {order.guestLastName}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748B' }}>
                          {order.guestEmail}
                        </div>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#F1F5F9',
                          color: '#64748B',
                          marginTop: '4px',
                          display: 'inline-block',
                        }}>
                          Guest
                        </span>
                      </div>
                    ) : order.user ? (
                      <div>
                        <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                          {order.user.firstName} {order.user.lastName}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748B' }}>
                          {order.user.email}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '14px', color: '#1E293B' }}>
                      {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                      {order.orderItems.length > 0 ? order.orderItems[0].description : 'No items'}
                      {order.orderItems.length > 1 && ` +${order.orderItems.length - 1} more`}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>
                      ${Number(order.total).toFixed(2)}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      background: 
                        order.orderStatus === 'COMPLETED' ? '#DCFCE7' :
                        order.orderStatus === 'PROCESSING' ? '#DBEAFE' :
                        order.orderStatus === 'PENDING' ? '#FEF3C7' :
                        order.orderStatus === 'PAID' ? '#D1FAE5' :
                        '#FEE2E2',
                      color: 
                        order.orderStatus === 'COMPLETED' ? '#16A34A' :
                        order.orderStatus === 'PROCESSING' ? '#2563EB' :
                        order.orderStatus === 'PENDING' ? '#F59E0B' :
                        order.orderStatus === 'PAID' ? '#059669' :
                        '#DC2626',
                    }}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      background: 
                        order.paymentStatus === 'PAID' ? '#DCFCE7' :
                        order.paymentStatus === 'PENDING' ? '#FEF3C7' :
                        '#FEE2E2',
                      color: 
                        order.paymentStatus === 'PAID' ? '#16A34A' :
                        order.paymentStatus === 'PENDING' ? '#F59E0B' :
                        '#DC2626',
                    }}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} style={{ color: '#64748B' }} />
                      <span style={{ fontSize: '14px', color: '#64748B' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      style={{
                        padding: '8px 16px',
                        background: '#6366F1',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        display: 'inline-block',
                      }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div style={{ 
            padding: '48px 24px', 
            textAlign: 'center',
            color: '#64748B',
          }}>
            No orders found
          </div>
        )}
      </div>
    </div>
  );
}

