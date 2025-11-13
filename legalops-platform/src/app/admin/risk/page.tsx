/**
 * Admin Risk Assessments Page
 * Displays all risk assessments with filtering by risk level
 */

import { prisma } from '@/lib/prisma';
import { AlertTriangle, Calendar, DollarSign, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default async function AdminRiskPage() {
  // Fetch all risk assessments with order and user information
  const assessments = await prisma.riskAssessment.findMany({
    include: {
      order: {
        select: {
          orderNumber: true,
          orderStatus: true,
          paymentStatus: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate stats
  const totalAssessments = assessments.length;
  const criticalRisk = assessments.filter(a => a.riskLevel === 'CRITICAL').length;
  const highRisk = assessments.filter(a => a.riskLevel === 'HIGH').length;
  const requiresReview = assessments.filter(a => a.requiresReview && !a.reviewedAt).length;

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
          Risk Assessments
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748B',
          margin: 0,
        }}>
          Monitor and review AI-powered fraud detection assessments
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {/* Total Assessments */}
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
              <ShieldAlert size={20} style={{ color: '#6366F1' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Total Assessments
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            {totalAssessments}
          </div>
        </div>

        {/* Requires Review */}
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
              <AlertTriangle size={20} style={{ color: '#F59E0B' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Requires Review
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            {requiresReview}
          </div>
        </div>

        {/* High Risk */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              background: '#FED7AA',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle size={20} style={{ color: '#EA580C' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              High Risk
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            {highRisk}
          </div>
        </div>

        {/* Critical Risk */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              background: '#FEE2E2',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle size={20} style={{ color: '#DC2626' }} />
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Critical Risk
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B' }}>
            {criticalRisk}
          </div>
        </div>
      </div>

      {/* Assessments Table */}
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
            All Risk Assessments
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
                  Risk Score
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Risk Level
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Recommendation
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Amount
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                  Status
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
              {assessments.map((assessment) => (
                <tr key={assessment.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <Link
                      href={`/admin/orders/${assessment.orderId}`}
                      style={{
                        fontWeight: '600',
                        color: '#6366F1',
                        fontFamily: 'monospace',
                        textDecoration: 'none',
                      }}
                    >
                      {assessment.order.orderNumber}
                    </Link>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                        {assessment.customerName || 'Guest'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>
                        {assessment.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: '700',
                      color: 
                        assessment.riskScore >= 76 ? '#DC2626' :
                        assessment.riskScore >= 51 ? '#EA580C' :
                        assessment.riskScore >= 26 ? '#F59E0B' :
                        '#16A34A',
                    }}>
                      {assessment.riskScore}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      / 100
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
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
                      {assessment.riskLevel}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
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
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DollarSign size={16} style={{ color: '#64748B' }} />
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>
                        {Number(assessment.orderAmount).toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {assessment.requiresReview && !assessment.reviewedAt ? (
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
                        width: 'fit-content',
                      }}>
                        <AlertTriangle size={14} />
                        Needs Review
                      </span>
                    ) : assessment.reviewedAt ? (
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        background: '#DCFCE7',
                        color: '#16A34A',
                      }}>
                        Reviewed
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} style={{ color: '#64748B' }} />
                      <span style={{ fontSize: '14px', color: '#64748B' }}>
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <Link
                      href={`/admin/risk/${assessment.id}`}
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

        {assessments.length === 0 && (
          <div style={{ 
            padding: '48px 24px', 
            textAlign: 'center',
            color: '#64748B',
          }}>
            No risk assessments found
          </div>
        )}
      </div>
    </div>
  );
}

