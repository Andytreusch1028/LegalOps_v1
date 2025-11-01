/**
 * Admin - Form Draft Detail
 * View detailed information about a specific form draft
 */

import { PrismaClient } from '@/generated/prisma';
import { ArrowLeft, User, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function FormDraftDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const draft = await prisma.formDraft.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
        },
      },
    },
  });

  await prisma.$disconnect();

  if (!draft) {
    notFound();
  }

  const formData = draft.formData as Record<string, any>;

  return (
    <div>
      {/* Back Button */}
      <Link
        href="/admin/form-drafts"
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
        Back to Form Drafts
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          color: '#1E293B',
        }}>
          {draft.formType.replace(/_/g, ' ')}
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748B',
          margin: 0,
        }}>
          Draft ID: {draft.id}
        </p>
      </div>

      {/* Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
      }}>
        {/* Customer Info */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <User size={20} color="#667EEA" />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1E293B' }}>
              Customer Information
            </h2>
          </div>
          {draft.user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 4px 0' }}>Name</p>
                <p style={{ fontSize: '14px', color: '#1E293B', margin: 0 }}>
                  {draft.user.firstName && draft.user.lastName
                    ? `${draft.user.firstName} ${draft.user.lastName}`
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 4px 0' }}>Email</p>
                <p style={{ fontSize: '14px', color: '#1E293B', margin: 0 }}>
                  {draft.user.email}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 4px 0' }}>Phone</p>
                <p style={{ fontSize: '14px', color: '#1E293B', margin: 0 }}>
                  {draft.user.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <Link
                  href={`/admin/customers/${draft.user.id}`}
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '8px 16px',
                    background: '#667EEA',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'none',
                  }}
                >
                  View Customer Profile
                </Link>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
              Guest User
            </p>
          )}
        </div>

        {/* Draft Info */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Calendar size={20} color="#10B981" />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1E293B' }}>
              Draft Information
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 4px 0' }}>Created</p>
              <p style={{ fontSize: '14px', color: '#1E293B', margin: 0 }}>
                {new Date(draft.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 4px 0' }}>Last Updated</p>
              <p style={{ fontSize: '14px', color: '#1E293B', margin: 0 }}>
                {new Date(draft.updatedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 4px 0' }}>Fields Filled</p>
              <p style={{ fontSize: '14px', color: '#1E293B', margin: 0 }}>
                {Object.keys(formData).length} fields
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Data */}
      <div style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <FileText size={20} color="#F59E0B" />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1E293B' }}>
            Form Data
          </h2>
        </div>

        {Object.keys(formData).length === 0 ? (
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            No data saved yet
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            {Object.entries(formData).map(([key, value]) => (
              <div
                key={key}
                style={{
                  padding: '16px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              >
                <p style={{ 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: '#64748B', 
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#1E293B', 
                  margin: 0,
                  wordBreak: 'break-word',
                }}>
                  {typeof value === 'object' 
                    ? JSON.stringify(value, null, 2)
                    : String(value) || '(empty)'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw JSON (for debugging) */}
      <details style={{ marginTop: '32px' }}>
        <summary style={{
          padding: '16px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          color: '#475569',
        }}>
          View Raw JSON
        </summary>
        <pre style={{
          marginTop: '16px',
          padding: '20px',
          background: '#1E293B',
          color: '#E2E8F0',
          borderRadius: '8px',
          fontSize: '12px',
          overflow: 'auto',
          fontFamily: 'monospace',
        }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </details>
    </div>
  );
}

