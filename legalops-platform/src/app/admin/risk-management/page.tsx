'use client';

import { useState, useEffect } from 'react';

interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  points: number;
}

interface RiskAssessment {
  id: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
  aiReasoning: string;
  riskFactors: RiskFactor[];
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  orderAmount: number;
  paymentMethod: string;
  isRushOrder: boolean;
  ipAddress: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    orderStatus: string;
    total: number;
    createdAt: string;
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
    };
  };
}

export default function RiskManagementPage() {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadHighRiskOrders();
  }, [filterLevel]);

  const loadHighRiskOrders = async () => {
    setLoading(true);
    try {
      const url = filterLevel 
        ? `/api/risk/high-risk-orders?riskLevel=${filterLevel}`
        : '/api/risk/high-risk-orders';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAssessments(data.assessments);
      }
    } catch (error) {
      console.error('Error loading high-risk orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (decision: 'APPROVED' | 'DECLINED' | 'VERIFIED' | 'MONITORING') => {
    if (!selectedAssessment) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/risk/high-risk-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: selectedAssessment.id,
          reviewDecision: decision,
          reviewNotes,
          reviewedBy: 'admin-user-id' // TODO: Get from session
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove from list
        setAssessments(prev => prev.filter(a => a.id !== selectedAssessment.id));
        setSelectedAssessment(null);
        setReviewNotes('');
        alert(`Order ${decision.toLowerCase()} successfully!`);
      }
    } catch (error) {
      console.error('Error reviewing order:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700';
      case 'high': return 'text-orange-700';
      case 'medium': return 'text-yellow-700';
      case 'low': return 'text-blue-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🚨 Risk Management Dashboard</h1>
          <p className="text-gray-600 mt-2">Review and manage high-risk orders flagged by AI</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Filter by Risk Level:</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <button
              onClick={loadHighRiskOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Pending</div>
            <div className="text-2xl font-bold text-gray-900">{assessments.length}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <div className="text-sm text-red-600">Critical Risk</div>
            <div className="text-2xl font-bold text-red-700">
              {assessments.filter(a => a.riskLevel === 'CRITICAL').length}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg shadow p-4">
            <div className="text-sm text-orange-600">High Risk</div>
            <div className="text-2xl font-bold text-orange-700">
              {assessments.filter(a => a.riskLevel === 'HIGH').length}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="text-sm text-yellow-600">Medium Risk</div>
            <div className="text-2xl font-bold text-yellow-700">
              {assessments.filter(a => a.riskLevel === 'MEDIUM').length}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-600">Loading high-risk orders...</div>
          </div>
        ) : assessments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-600">✅ No high-risk orders requiring review!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedAssessment(assessment)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-gray-900">
                          Order #{assessment.order.orderNumber}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskLevelColor(assessment.riskLevel)}`}>
                          {assessment.riskLevel} RISK ({assessment.riskScore}/100)
                        </span>
                      </div>
                      <div className="text-gray-600">
                        Customer: {assessment.customerName || assessment.customerEmail}
                      </div>
                      <div className="text-gray-600">
                        Amount: ${parseFloat(assessment.orderAmount.toString()).toFixed(2)}
                        {assessment.isRushOrder && <span className="ml-2 text-orange-600 font-semibold">⚡ RUSH ORDER</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {new Date(assessment.createdAt).toLocaleString()}
                      </div>
                      <div className="text-sm font-semibold text-blue-600 mt-1">
                        Recommendation: {assessment.recommendation}
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors Preview */}
                  <div className="border-t pt-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      Risk Factors ({assessment.riskFactors.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {assessment.riskFactors.slice(0, 3).map((factor, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(factor.severity)}`}
                        >
                          {factor.factor} (+{factor.points})
                        </span>
                      ))}
                      {assessment.riskFactors.length > 3 && (
                        <span className="px-2 py-1 rounded text-xs font-medium text-gray-600">
                          +{assessment.riskFactors.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedAssessment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order #{selectedAssessment.order.orderNumber}
                    </h2>
                    <span className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-semibold border ${getRiskLevelColor(selectedAssessment.riskLevel)}`}>
                      {selectedAssessment.riskLevel} RISK - Score: {selectedAssessment.riskScore}/100
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedAssessment(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{selectedAssessment.customerName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{selectedAssessment.customerEmail}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{selectedAssessment.customerPhone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">IP Address:</span>
                      <span className="ml-2 font-medium">{selectedAssessment.ipAddress || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="ml-2 font-medium">${parseFloat(selectedAssessment.orderAmount.toString()).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="ml-2 font-medium">{selectedAssessment.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rush Order:</span>
                      <span className="ml-2 font-medium">{selectedAssessment.isRushOrder ? '⚡ Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 font-medium">{new Date(selectedAssessment.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">🤖 AI Analysis</h3>
                  <p className="text-blue-800 text-sm">{selectedAssessment.aiReasoning}</p>
                  <div className="mt-3 text-sm">
                    <span className="font-semibold text-blue-900">Recommendation:</span>
                    <span className="ml-2 text-blue-800">{selectedAssessment.recommendation}</span>
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Risk Factors ({selectedAssessment.riskFactors.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedAssessment.riskFactors.map((factor, idx) => (
                      <div key={idx} className="border-l-4 border-gray-300 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{factor.factor}</span>
                          <span className={`text-sm font-semibold ${getSeverityColor(factor.severity)}`}>
                            {factor.severity.toUpperCase()} (+{factor.points} points)
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Notes */}
                <div className="mb-6">
                  <label className="block font-semibold text-gray-900 mb-2">
                    Review Notes (Optional)
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Add any notes about your decision..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReview('APPROVED')}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                  >
                    ✅ Approve Order
                  </button>
                  <button
                    onClick={() => handleReview('VERIFIED')}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
                  >
                    🔍 Request Verification
                  </button>
                  <button
                    onClick={() => handleReview('MONITORING')}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold disabled:opacity-50"
                  >
                    👁️ Approve & Monitor
                  </button>
                  <button
                    onClick={() => handleReview('DECLINED')}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
                  >
                    ❌ Decline Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

