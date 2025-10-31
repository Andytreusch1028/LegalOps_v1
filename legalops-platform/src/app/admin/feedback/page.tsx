/**
 * Admin Feedback Dashboard
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * View and analyze user feedback from FeedbackBeacon components
 */

import { prisma } from '@/lib/prisma';
import { ThumbsUp, ThumbsDown, MessageSquare, TrendingDown, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface FeedbackStats {
  total: number;
  positive: number;
  negative: number;
  withComments: number;
  confusionRate: number;
}

async function getFeedbackStats(): Promise<FeedbackStats> {
  const [total, positive, negative, withComments] = await Promise.all([
    prisma.feedback.count(),
    prisma.feedback.count({ where: { positive: true } }),
    prisma.feedback.count({ where: { positive: false } }),
    prisma.feedback.count({ where: { comment: { not: null } } }),
  ]);

  const confusionRate = total > 0 ? (negative / total) * 100 : 0;

  return {
    total,
    positive,
    negative,
    withComments,
    confusionRate,
  };
}

async function getRecentFeedback() {
  return await prisma.feedback.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

async function getProblemPages() {
  // Get pages with highest negative feedback
  const feedback = await prisma.feedback.groupBy({
    by: ['feedbackId'],
    _count: {
      id: true,
    },
    where: {
      positive: false,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  });

  return feedback;
}

export default async function AdminFeedbackPage() {
  const [stats, recentFeedback, problemPages] = await Promise.all([
    getFeedbackStats(),
    getRecentFeedback(),
    getProblemPages(),
  ]);

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          User Feedback Dashboard
        </h1>
        <p style={{ color: '#6B7280' }}>
          Monitor customer confusion and improve user experience
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Total Feedback */}
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <MessageSquare size={24} color="#6B7280" />
            <h3 style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
              Total Feedback
            </h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total}</p>
        </div>

        {/* Positive Feedback */}
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <ThumbsUp size={24} color="#10B981" />
            <h3 style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
              Positive
            </h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>
            {stats.positive}
          </p>
        </div>

        {/* Negative Feedback */}
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <ThumbsDown size={24} color="#EF4444" />
            <h3 style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
              Negative
            </h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#EF4444' }}>
            {stats.negative}
          </p>
        </div>

        {/* Confusion Rate */}
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <TrendingDown size={24} color="#F59E0B" />
            <h3 style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
              Confusion Rate
            </h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#F59E0B' }}>
            {stats.confusionRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Problem Pages */}
      {problemPages.length > 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <AlertCircle size={24} color="#EF4444" />
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
              Pages with Most Confusion
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {problemPages.map((page) => (
              <div
                key={page.feedbackId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontWeight: '500' }}>{page.feedbackId}</span>
                <span style={{ 
                  background: '#EF4444',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>
                  {page._count.id} complaints
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Feedback Table */}
      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          Recent Feedback
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>
                  Date
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>
                  Page
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>
                  Feedback
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>
                  Comment
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>
                  User
                </th>
              </tr>
            </thead>
            <tbody>
              {recentFeedback.map((feedback) => (
                <tr key={feedback.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', fontFamily: 'monospace' }}>
                    {feedback.feedbackId}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {feedback.positive ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#D1FAE5',
                        color: '#065F46',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}>
                        <ThumbsUp size={14} />
                        Positive
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#FEE2E2',
                        color: '#991B1B',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}>
                        <ThumbsDown size={14} />
                        Negative
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', maxWidth: '300px' }}>
                    {feedback.comment || <span style={{ color: '#9CA3AF' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {feedback.user ? (
                      <span>
                        {feedback.user.firstName} {feedback.user.lastName}
                        <br />
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>
                          {feedback.user.email}
                        </span>
                      </span>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>Guest</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

