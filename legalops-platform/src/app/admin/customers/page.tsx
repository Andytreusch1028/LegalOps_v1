/**
 * Admin - Customers List
 * View all customers with search and filtering
 */

import { PrismaClient } from '@/generated/prisma';
import { Users, Mail, Phone, Calendar, Building2 } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function CustomersPage() {
  // Fetch all customers with their entity count
  const customers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      clients: {
        include: {
          businessEntities: true,
        },
      },
      orders: {
        select: {
          id: true,
        },
      },
    },
  });

  await prisma.$disconnect();

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
          Customers
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748B',
          margin: 0,
        }}>
          Manage all customer accounts and profiles
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={24} color="#667EEA" />
            <div>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 4px 0' }}>
                Total Customers
              </p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>
                {customers.length}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 size={24} color="#10B981" />
            <div>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 4px 0' }}>
                Total Entities
              </p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>
                {customers.reduce((sum, c) => sum + c.clients.reduce((s, cl) => s + cl.businessEntities.length, 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
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
          margin: '0 0 20px 0',
          color: '#1E293B',
        }}>
          All Customers
        </h2>

        {customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Users size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '18px', color: '#64748B', margin: 0 }}>
              No customers yet
            </p>
          </div>
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
                    Name
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748B',
                  }}>
                    Email
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748B',
                  }}>
                    Phone
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748B',
                  }}>
                    Entities
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748B',
                  }}>
                    Orders
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748B',
                  }}>
                    Joined
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748B',
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const entityCount = customer.clients.reduce((sum, c) => sum + c.businessEntities.length, 0);
                  return (
                    <tr 
                      key={customer.id}
                      style={{ borderBottom: '1px solid #F1F5F9' }}
                    >
                      <td style={{ 
                        padding: '16px 12px',
                        fontSize: '14px',
                        color: '#1E293B',
                        fontWeight: '500',
                      }}>
                        {customer.firstName && customer.lastName
                          ? `${customer.firstName} ${customer.lastName}`
                          : 'Not provided'}
                      </td>
                      <td style={{ 
                        padding: '16px 12px',
                        fontSize: '14px',
                        color: '#64748B',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={14} />
                          {customer.email}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px 12px',
                        fontSize: '14px',
                        color: '#64748B',
                      }}>
                        {customer.phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Phone size={14} />
                            {customer.phone}
                          </div>
                        ) : (
                          <span style={{ color: '#CBD5E1' }}>Not provided</span>
                        )}
                      </td>
                      <td style={{ 
                        padding: '16px 12px',
                        fontSize: '14px',
                        color: '#1E293B',
                        textAlign: 'center',
                        fontWeight: '600',
                      }}>
                        {entityCount}
                      </td>
                      <td style={{ 
                        padding: '16px 12px',
                        fontSize: '14px',
                        color: '#1E293B',
                        textAlign: 'center',
                        fontWeight: '600',
                      }}>
                        {customer.orders.length}
                      </td>
                      <td style={{ 
                        padding: '16px 12px',
                        fontSize: '14px',
                        color: '#64748B',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={14} />
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px 12px',
                        textAlign: 'center',
                      }}>
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          style={{
                            padding: '8px 16px',
                            background: '#667EEA',
                            color: 'white',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            textDecoration: 'none',
                            display: 'inline-block',
                            transition: 'all 0.2s',
                          }}
                        >
                          View
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

