/**
 * Admin Risk Assessment Detail Page
 * Displays detailed information about a specific risk assessment
 */

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  ShieldAlert,
  User,
  Mail,
  Phone,
  CreditCard,
  ArrowLeft,
  Globe,
  Monitor,
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminRiskDetailPage({ params }: PageProps) {
  const { id } = await params;
  const assessment = await prisma.riskAssessment.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          orderItems: true,
        },
      },
      user: true,
    },
  });

  if (!assessment) {
    notFound();
  }

  const riskFactors = assessment.riskFactors as any[];

  return (
    <div style={{ padding: '32px' }}>
      {/* Back Button */}
      <Link
        href="/admin/risk"
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
        Back to Risk Assessments
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ShieldAlert size={32} style={{ color: '#6366F1' }} />
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1E293B',
            margin: 0,
          }}>
            Risk Assessment
          </h1>
        </div>
        <div style={{ marginLeft: '44px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            background: 
              assessment.riskLevel === 'CRITICAL' ? '#FEE2E2' :
              assessment.riskLevel === 'HIGH' ? '#FED7AA' :
              assessment.riskLevel === 'MEDIUM' ? '#FEF3C7' :
              '#DCFCE7',
            color: 
              assessment.riskLevel === 'CRITICAL' ? '#DC2626' :
              assessment.riskLevel === 'HIGH' ? '#EA580C' :
              assessment.riskLevel === 'MEDIUM' ? '#F59E0B' :
              '#16A34A',
          }}>
            {assessment.riskLevel} RISK
          </span>
          <span style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            background: 
              assessment.recommendation === 'DECLINE' ? '#FEE2E2' :
              assessment.recommendation === 'VERIFY' ? '#FED7AA' :
              assessment.recommendation === 'REVIEW' ? '#FEF3C7' :
              '#DCFCE7',
            color: 
              assessment.recommendation === 'DECLINE' ? '#DC2626' :
              assessment.recommendation === 'VERIFY' ? '#EA580C' :
              assessment.recommendation === 'REVIEW' ? '#F59E0B' :
              '#16A34A',
          }}>
            {assessment.recommendation}
          </span>
          {assessment.requiresReview && !assessment.reviewedAt && (
            <span style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              background: '#FEF3C7',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <AlertTriangle size={14} />
              Requires Review
            </span>
          )}
        </div>
      </div>

      {/* Risk Score Card */}
      <div style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '12px', fontWeight: '500' }}>
          Risk Score
        </div>
        <div style={{ 
          fontSize: '72px', 
          fontWeight: '700',
          color: 
            assessment.riskScore >= 76 ? '#DC2626' :
            assessment.riskScore >= 51 ? '#EA580C' :
            assessment.riskScore >= 26 ? '#F59E0B' :
            '#16A34A',
        }}>
          {assessment.riskScore}
        </div>
        <div style={{ fontSize: '18px', color: '#64748B' }}>
          out of 100
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Customer Information */}
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
            Customer Information
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Name
              </div>
              <div style={{ fontSize: '15px', color: '#1E293B' }}>
                {assessment.customerName || 'Guest'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Email
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} style={{ color: '#64748B' }} />
                <a 
                  href={`mailto:${assessment.customerEmail}`}
                  style={{ fontSize: '15px', color: '#6366F1', textDecoration: 'none' }}
                >
                  {assessment.customerEmail}
                </a>
              </div>
            </div>

            {assessment.customerPhone && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Phone
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} style={{ color: '#64748B' }} />
                  <a 
                    href={`tel:${assessment.customerPhone}`}
                    style={{ fontSize: '15px', color: '#6366F1', textDecoration: 'none' }}
                  >
                    {assessment.customerPhone}
                  </a>
                </div>
              </div>
            )}

            {assessment.accountAge !== null && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Account Age
                </div>
                <div style={{ fontSize: '15px', color: '#1E293B' }}>
                  {assessment.accountAge} days
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Previous Orders
              </div>
              <div style={{ fontSize: '15px', color: '#1E293B' }}>
                {assessment.previousOrders}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Previous Chargebacks
              </div>
              <div style={{ fontSize: '15px', color: assessment.previousChargebacks > 0 ? '#DC2626' : '#1E293B', fontWeight: assessment.previousChargebacks > 0 ? '600' : 'normal' }}>
                {assessment.previousChargebacks}
              </div>
            </div>
          </div>
        </div>

        {/* Order Information */}
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
            Order Information
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Order Number
              </div>
              <Link
                href={`/admin/orders/${assessment.orderId}`}
                style={{
                  fontSize: '15px',
                  color: '#6366F1',
                  textDecoration: 'none',
                  fontFamily: 'monospace',
                  fontWeight: '600',
                }}
              >
                {assessment.order.orderNumber}
              </Link>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Order Amount
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} style={{ color: '#64748B' }} />
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
                  {Number(assessment.orderAmount).toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Payment Method
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={16} style={{ color: '#64748B' }} />
                <span style={{ fontSize: '15px', color: '#1E293B' }}>
                  {assessment.paymentMethod}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Rush Order
              </div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '500',
                background: assessment.isRushOrder ? '#FEF3C7' : '#F1F5F9',
                color: assessment.isRushOrder ? '#F59E0B' : '#64748B',
              }}>
                {assessment.isRushOrder ? 'Yes' : 'No'}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Assessment Date
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: '#64748B' }} />
                <span style={{ fontSize: '15px', color: '#1E293B' }}>
                  {new Date(assessment.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                AI Model
              </div>
              <div style={{ fontSize: '15px', color: '#1E293B', fontFamily: 'monospace' }}>
                {assessment.aiModel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
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
          marginBottom: '16px',
        }}>
          AI Analysis
        </h2>
        <div style={{
          fontSize: '15px',
          color: '#1E293B',
          lineHeight: '1.7',
          padding: '16px',
          background: '#F8FAFC',
          borderRadius: '8px',
          whiteSpace: 'pre-wrap',
        }}>
          {assessment.aiReasoning}
        </div>
      </div>

      {/* Risk Factors */}
      {riskFactors && riskFactors.length > 0 && (
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
            Risk Factors
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {riskFactors.map((factor, index: number) => (
              <div 
                key={index}
                style={{
                  padding: '16px',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${
                    factor.severity === 'HIGH' ? '#DC2626' :
                    factor.severity === 'MEDIUM' ? '#F59E0B' :
                    '#64748B'
                  }`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>
                    {factor.factor}
                  </div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: 
                      factor.severity === 'HIGH' ? '#FEE2E2' :
                      factor.severity === 'MEDIUM' ? '#FEF3C7' :
                      '#F1F5F9',
                    color: 
                      factor.severity === 'HIGH' ? '#DC2626' :
                      factor.severity === 'MEDIUM' ? '#F59E0B' :
                      '#64748B',
                  }}>
                    {factor.severity}
                  </span>
                </div>
                {factor.description && (
                  <div style={{ fontSize: '14px', color: '#64748B' }}>
                    {factor.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Data */}
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
          Technical Data
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {assessment.ipAddress && (
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                IP Address
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={16} style={{ color: '#64748B' }} />
                <span style={{ fontSize: '15px', color: '#1E293B', fontFamily: 'monospace' }}>
                  {assessment.ipAddress}
                </span>
              </div>
            </div>
          )}

          {assessment.userAgent && (
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                User Agent
              </div>
              <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                <Monitor size={16} style={{ color: '#64748B', marginTop: '2px' }} />
                <span style={{ fontSize: '13px', color: '#1E293B', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {assessment.userAgent}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

