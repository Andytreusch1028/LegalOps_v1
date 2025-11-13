/**
 * Admin - Customer Detail
 * View detailed customer profile with entities, orders, and Smart Form data
 */

import { PrismaClient } from '@/generated/prisma';
import { ArrowLeft, User, Mail, Phone, Calendar, Building2, ShoppingCart, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      clients: {
        include: {
          businessEntities: true,
        },
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      formDrafts: {
        orderBy: { updatedAt: 'desc' },
      },
    },
  });

  await prisma.$disconnect();

  if (!customer) {
    notFound();
  }

  const totalEntities = customer.clients.reduce((sum, c) => sum + c.businessEntities.length, 0);

  return (
    <div>
      {/* Back Button */}
      <Link
        href="/admin/customers"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#667EEA',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} />
        Back to Customers
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          color: '#1E293B',
        }}>
          {customer.firstName && customer.lastName
            ? `${customer.firstName} ${customer.lastName}`
            : customer.email}
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748B',
          margin: 0,
        }}>
          Customer ID: {customer.id}
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
            <Building2 size={24} color="#667EEA" />
            <div>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 4px 0' }}>
                Business Entities
              </p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>
                {totalEntities}
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
            <ShoppingCart size={24} color="#10B981" />
            <div>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 4px 0' }}>
                Total Orders
              </p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>
                {customer.orders.length}
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
            <FileText size={24} color="#F59E0B" />
            <div>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 4px 0' }}>
                Form Drafts
              </p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>
                {customer.formDrafts.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          color: '#1E293B',
        }}>
          Contact Information
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
        }}>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 4px 0' }}>Email</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="#667EEA" />
              <p style={{ fontSize: '14px', color: '#1E293B', margin: 0 }}>
                {customer.email}
              </p>
            </div>
          </div>

          <div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 4px 0' }}>Phone</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="#667EEA" />
              <p style={{ fontSize: '14px', color: '#1E293B', margin: 0 }}>
                {customer.phone || 'Not provided'}
              </p>
            </div>
          </div>

          <div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 4px 0' }}>Member Since</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="#667EEA" />
              <p style={{ fontSize: '14px', color: '#1E293B', margin: 0 }}>
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Entities */}
      <div style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          color: '#1E293B',
        }}>
          Business Entities
        </h2>

        {totalEntities === 0 ? (
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            No business entities yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {customer.clients.map((client) =>
              client.businessEntities.map((entity) => (
                <div
                  key={entity.id}
                  style={{
                    padding: '16px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', margin: '0 0 4px 0' }}>
                      {entity.legalName}
                    </p>
                    <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                      {entity.entityType} • {entity.status}
                    </p>
                  </div>
                  <Link
                    href={`/admin/entities/${entity.id}`}
                    style={{
                      padding: '8px 16px',
                      background: '#667EEA',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      textDecoration: 'none',
                    }}
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Form Drafts */}
      {customer.formDrafts.length > 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            margin: '0 0 20px 0',
            color: '#1E293B',
          }}>
            Smart Form Drafts
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {customer.formDrafts.map((draft) => (
              <div
                key={draft.id}
                style={{
                  padding: '16px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', margin: '0 0 4px 0' }}>
                    {draft.formType.replace(/_/g, ' ')}
                  </p>
                  <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                    Last updated: {new Date(draft.updatedAt).toLocaleString()}
                  </p>
                </div>
                <Link
                  href={`/admin/form-drafts/${draft.id}`}
                  style={{
                    padding: '8px 16px',
                    background: '#667EEA',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'none',
                  }}
                >
                  View Draft
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

