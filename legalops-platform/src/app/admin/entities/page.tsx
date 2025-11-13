/**
 * Admin Business Entities Page
 * Displays all business entities with filtering and search
 */

import { prisma } from '@/lib/prisma';
import { Building2, Calendar, FileText, User } from 'lucide-react';
import Link from 'next/link';

export default async function AdminEntitiesPage() {
  // Fetch all business entities with client information
  const entities = await prisma.businessEntity.findMany({
    include: {
      client: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      filings: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate stats
  const totalEntities = entities.length;
  const activeEntities = entities.filter(e => e.status === 'ACTIVE').length;
  const pendingEntities = entities.filter(e => e.status === 'PENDING').length;
  const llcCount = entities.filter(e => e.entityType === 'LLC').length;
  const corpCount = entities.filter(e => e.entityType === 'CORPORATION').length;

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
          Business Entities
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748B',
          margin: 0,
        }}>
          Manage all business entities and their information
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {/* Total Entities */}
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
              <Building2 size={20} style={{ color: '#6366F1' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Total Entities
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            {totalEntities}
          </div>
        </div>

        {/* Active Entities */}
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
              <Building2 size={20} style={{ color: '#16A34A' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Active
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            {activeEntities}
          </div>
        </div>

        {/* Pending Entities */}
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
              <Building2 size={20} style={{ color: '#F59E0B' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Pending
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            {pendingEntities}
          </div>
        </div>

        {/* LLCs */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              background: '#E0E7FF',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Building2 size={20} style={{ color: '#4F46E5' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              LLCs
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            {llcCount}
          </div>
        </div>

        {/* Corporations */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              background: '#FCE7F3',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Building2 size={20} style={{ color: '#DB2777' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Corporations
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            {corpCount}
          </div>
        </div>
      </div>

      {/* Entities Table */}
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
            All Business Entities
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Entity Name
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Type
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Owner
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Document #
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Filings
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Created
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity) => (
                <tr key={entity.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '500', color: '#1E293B' }}>
                      {entity.legalName}
                    </div>
                    {entity.dbaName && (
                      <div style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
                        DBA: {entity.dbaName}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      background: entity.entityType === 'LLC' ? '#EEF2FF' : '#FCE7F3',
                      color: entity.entityType === 'LLC' ? '#4F46E5' : '#DB2777',
                    }}>
                      {entity.entityType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} style={{ color: '#64748B' }} />
                      <div>
                        <div style={{ fontSize: '14px', color: '#1E293B' }}>
                          {entity.client.firstName} {entity.client.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          {entity.client.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      background: 
                        entity.status === 'ACTIVE' ? '#DCFCE7' :
                        entity.status === 'PENDING' ? '#FEF3C7' :
                        entity.status === 'FILED' ? '#DBEAFE' :
                        '#FEE2E2',
                      color: 
                        entity.status === 'ACTIVE' ? '#16A34A' :
                        entity.status === 'PENDING' ? '#F59E0B' :
                        entity.status === 'FILED' ? '#2563EB' :
                        '#DC2626',
                    }}>
                      {entity.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>
                    {entity.documentNumber || '—'}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} style={{ color: '#64748B' }} />
                      <span style={{ fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                        {entity.filings.length}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} style={{ color: '#64748B' }} />
                      <span style={{ fontSize: '14px', color: '#64748B' }}>
                        {new Date(entity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <Link
                      href={`/admin/entities/${entity.id}`}
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

        {entities.length === 0 && (
          <div style={{ 
            padding: '48px 24px', 
            textAlign: 'center',
            color: '#64748B',
          }}>
            No business entities found
          </div>
        )}
      </div>
    </div>
  );
}

