/**
 * Admin Dashboard Home
 * Overview of key metrics and recent activity
 */

import { PrismaClient } from '@/generated/prisma';
import { Users, Building2, ShoppingCart, FileText } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  // Fetch key metrics
  const [
    totalUsers,
    totalEntities,
    totalOrders,
    totalFormDrafts,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.businessEntity.count(),
    prisma.order.count(),
    prisma.formDraft.count(),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  await prisma.$disconnect();

  const stats = [
    {
      label: 'Total Customers',
      value: totalUsers,
      icon: Users,
      color: '#667EEA',
    },
    {
      label: 'Business Entities',
      value: totalEntities,
      icon: Building2,
      color: '#F59E0B',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: '#10B981',
    },
    {
      label: 'Form Drafts',
      value: totalFormDrafts,
      icon: FileText,
      color: '#8B5CF6',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          color: '#1E293B',
        }}>
          Dashboard
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748B',
          margin: 0,
        }}>
          Welcome to the LegalOps Admin Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '48px',
      }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                marginBottom: '16px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={24} color={stat.color} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#64748B',
                    margin: '0 0 4px 0',
                  }}>
                    {stat.label}
                  </p>
                  <p style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold',
                    color: '#1E293B',
                    margin: 0,
                  }}>
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold',
          margin: '0 0 24px 0',
          color: '#1E293B',
        }}>
          Recent Orders
        </h2>

        {recentOrders.length === 0 ? (
          <p style={{ color: '#64748B', margin: 0 }}>No orders yet</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748B',
                  }}>
                    Order ID
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748B',
                  }}>
                    Customer
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748B',
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'right',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748B',
                  }}>
                    Total
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748B',
                  }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr 
                    key={order.id}
                    style={{ borderBottom: '1px solid #F1F5F9' }}
                  >
                    <td style={{ 
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: '#1E293B',
                      fontFamily: 'monospace',
                    }}>
                      {order.id.slice(0, 8)}...
                    </td>
                    <td style={{ 
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: '#1E293B',
                    }}>
                      {order.user?.firstName && order.user?.lastName
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : order.user?.email || 'Guest'}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: order.status === 'COMPLETED' ? '#D1FAE5' : '#FEF3C7',
                        color: order.status === 'COMPLETED' ? '#065F46' : '#92400E',
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '16px 12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1E293B',
                      textAlign: 'right',
                    }}>
                      ${(order.totalAmount / 100).toFixed(2)}
                    </td>
                    <td style={{ 
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: '#64748B',
                    }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

