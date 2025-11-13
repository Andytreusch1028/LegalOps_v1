/**
 * Admin Business Entity Detail Page
 * Displays detailed information about a specific business entity
 */

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { 
  Building2, 
  Calendar, 
  FileText, 
  User, 
  MapPin, 
  Phone,
  Mail,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminEntityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const entity = await prisma.businessEntity.findUnique({
    where: { id },
    include: {
      client: true,
      addresses: true,
      registeredAgent: true,
      managersOfficers: true,
      filings: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!entity) {
    notFound();
  }

  const principalAddress = entity.addresses.find(a => a.type === 'PRINCIPAL');
  const mailingAddress = entity.addresses.find(a => a.type === 'MAILING');

  return (
    <div style={{ padding: '32px' }}>
      {/* Back Button */}
      <Link
        href="/admin/entities"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6366F1',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} />
        Back to Business Entities
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Building2 size={32} style={{ color: '#6366F1' }} />
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1E293B',
            margin: 0,
          }}>
            {entity.legalName}
          </h1>
        </div>
        {entity.dbaName && (
          <p style={{ 
            fontSize: '16px', 
            color: '#64748B',
            margin: '0 0 8px 44px',
          }}>
            DBA: {entity.dbaName}
          </p>
        )}
        <div style={{ marginLeft: '44px', display: 'flex', gap: '12px', alignItems: 'center' }}>
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
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Entity Information */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1E293B',
            marginBottom: '20px',
          }}>
            Entity Information
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Legal Name
              </div>
              <div style={{ fontSize: '15px', color: '#1E293B' }}>
                {entity.legalName}
              </div>
            </div>

            {entity.dbaName && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  DBA Name
                </div>
                <div style={{ fontSize: '15px', color: '#1E293B' }}>
                  {entity.dbaName}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                State of Formation
              </div>
              <div style={{ fontSize: '15px', color: '#1E293B' }}>
                {entity.stateOfFormation}
              </div>
            </div>

            {entity.documentNumber && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Document Number
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '15px', color: '#1E293B' }}>
                    {entity.documentNumber}
                  </div>
                  <a
                    href={`https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResultDetail?inquirytype=EntityName&directionType=Initial&searchNameOrder=TECHINNOVAT%20L230000403980&aggregateId=doml-l23000040398-4e044c94-e0be-4d5c-b3e5-c8f8e0e0e0e0&searchTerm=${entity.documentNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#6366F1',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                    }}
                  >
                    View on Sunbiz
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}

            {entity.feiNumber && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  EIN
                </div>
                <div style={{ fontSize: '15px', color: '#1E293B' }}>
                  {entity.feiNumber}
                </div>
              </div>
            )}

            {entity.filingDate && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Filing Date
                </div>
                <div style={{ fontSize: '15px', color: '#1E293B' }}>
                  {new Date(entity.filingDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {entity.purpose && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Business Purpose
                </div>
                <div style={{ fontSize: '15px', color: '#1E293B' }}>
                  {entity.purpose}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Owner Information */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1E293B',
            marginBottom: '20px',
          }}>
            Owner Information
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Name
              </div>
              <div style={{ fontSize: '15px', color: '#1E293B' }}>
                {entity.client.firstName} {entity.client.lastName}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Email
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} style={{ color: '#64748B' }} />
                <a 
                  href={`mailto:${entity.client.email}`}
                  style={{ fontSize: '15px', color: '#6366F1', textDecoration: 'none' }}
                >
                  {entity.client.email}
                </a>
              </div>
            </div>

            {entity.client.phone && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Phone
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} style={{ color: '#64748B' }} />
                  <a 
                    href={`tel:${entity.client.phone}`}
                    style={{ fontSize: '15px', color: '#6366F1', textDecoration: 'none' }}
                  >
                    {entity.client.phone}
                  </a>
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Member Since
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: '#64748B' }} />
                <span style={{ fontSize: '15px', color: '#1E293B' }}>
                  {new Date(entity.client.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <Link
                href={`/admin/customers/${entity.client.userId}`}
                style={{
                  padding: '10px 20px',
                  background: '#6366F1',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                View Customer Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses */}
      {(principalAddress || mailingAddress) && (
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px',
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1E293B',
            marginBottom: '20px',
          }}>
            Addresses
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {principalAddress && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px', fontWeight: '500' }}>
                  Principal Address
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <MapPin size={16} style={{ color: '#64748B', marginTop: '2px' }} />
                  <div style={{ fontSize: '15px', color: '#1E293B', lineHeight: '1.6' }}>
                    {principalAddress.street}<br />
                    {principalAddress.street2 && <>{principalAddress.street2}<br /></>}
                    {principalAddress.city}, {principalAddress.state} {principalAddress.zipCode}
                  </div>
                </div>
              </div>
            )}

            {mailingAddress && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px', fontWeight: '500' }}>
                  Mailing Address
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <MapPin size={16} style={{ color: '#64748B', marginTop: '2px' }} />
                  <div style={{ fontSize: '15px', color: '#1E293B', lineHeight: '1.6' }}>
                    {mailingAddress.street}<br />
                    {mailingAddress.street2 && <>{mailingAddress.street2}<br /></>}
                    {mailingAddress.city}, {mailingAddress.state} {mailingAddress.zipCode}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Registered Agent */}
      {entity.registeredAgent && (
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px',
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1E293B',
            marginBottom: '20px',
          }}>
            Registered Agent
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Name
              </div>
              <div style={{ fontSize: '15px', color: '#1E293B' }}>
                {entity.registeredAgent.firstName} {entity.registeredAgent.lastName}
              </div>
            </div>

            {entity.registeredAgent.email && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Email
                </div>
                <div style={{ fontSize: '15px', color: '#1E293B' }}>
                  {entity.registeredAgent.email}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

