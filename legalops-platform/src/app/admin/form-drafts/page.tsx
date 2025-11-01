/**
 * Admin - Form Drafts
 * View all Smart Form drafts saved by customers
 */

import { PrismaClient } from '@/generated/prisma';
import { FileText, User, Calendar } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function FormDraftsPage() {
  // Fetch all form drafts with user info
  const drafts = await prisma.formDraft.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  await prisma.$disconnect();

  // Group drafts by form type
  const draftsByType = drafts.reduce((acc, draft) => {
    if (!acc[draft.formType]) {
      acc[draft.formType] = [];
    }
    acc[draft.formType].push(draft);
    return acc;
  }, {} as Record<string, typeof drafts>);

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
          Form Drafts
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748B',
          margin: 0,
        }}>
          View all Smart Form drafts saved by customers
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
            <FileText size={24} color="#667EEA" />
            <div>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 4px 0' }}>
                Total Drafts
              </p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>
                {drafts.length}
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
            <User size={24} color="#10B981" />
            <div>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 4px 0' }}>
                Form Types
              </p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>
                {Object.keys(draftsByType).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drafts by Type */}
      {Object.keys(draftsByType).length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <FileText size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '18px', color: '#64748B', margin: 0 }}>
            No form drafts yet
          </p>
        </div>
      ) : (
        Object.entries(draftsByType).map(([formType, typeDrafts]) => (
          <div
            key={formType}
            style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold',
              margin: '0 0 20px 0',
              color: '#1E293B',
            }}>
              {formType.replace(/_/g, ' ')}
              <span style={{
                marginLeft: '12px',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                background: '#F1F5F9',
                color: '#475569',
              }}>
                {typeDrafts.length} draft{typeDrafts.length !== 1 ? 's' : ''}
              </span>
            </h2>

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
                      Customer
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#64748B',
                    }}>
                      Last Updated
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#64748B',
                    }}>
                      Fields Filled
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
                  {typeDrafts.map((draft) => {
                    const fieldCount = Object.keys(draft.formData as object).length;
                    return (
                      <tr 
                        key={draft.id}
                        style={{ borderBottom: '1px solid #F1F5F9' }}
                      >
                        <td style={{ 
                          padding: '16px 12px',
                          fontSize: '14px',
                          color: '#1E293B',
                        }}>
                          {draft.user?.firstName && draft.user?.lastName
                            ? `${draft.user.firstName} ${draft.user.lastName}`
                            : draft.user?.email || 'Guest User'}
                        </td>
                        <td style={{ 
                          padding: '16px 12px',
                          fontSize: '14px',
                          color: '#64748B',
                        }}>
                          {new Date(draft.updatedAt).toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '16px 12px',
                          fontSize: '14px',
                          color: '#1E293B',
                        }}>
                          {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                        </td>
                        <td style={{ 
                          padding: '16px 12px',
                          textAlign: 'center',
                        }}>
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
                              display: 'inline-block',
                              transition: 'all 0.2s',
                            }}
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

