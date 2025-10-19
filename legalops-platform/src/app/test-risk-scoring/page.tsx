'use client';

import { useState } from 'react';

export default function TestRiskScoringPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Test data
  const [customerData, setCustomerData] = useState({
    email: 'test@example.com',
    name: 'John Doe',
    phone: '555-1234',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  });

  const [orderData, setOrderData] = useState({
    amount: 299,
    services: ['LLC_FORMATION'],
    isRushOrder: false,
    paymentMethod: 'credit_card'
  });

  const runRiskAssessment = async () => {
    setLoading(true);
    setResult(null);

    try {
      // In a real implementation, this would be called from your order creation API
      // For testing, we'll call the risk scoring service directly
      const response = await fetch('/api/test-risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerData,
          orderData
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to assess risk' });
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-500';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🤖 AI Risk Scoring Test Page
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Customer Data</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={customerData.email}
                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={customerData.name}
                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={customerData.phone}
                onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="555-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
              <input
                type="text"
                value={customerData.ipAddress}
                onChange={(e) => setCustomerData({ ...customerData, ipAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="192.168.1.1"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Data</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input
                type="number"
                value={orderData.amount}
                onChange={(e) => setOrderData({ ...orderData, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="299"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={orderData.paymentMethod}
                onChange={(e) => setOrderData({ ...orderData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="prepaid_card">Prepaid Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={orderData.isRushOrder}
                  onChange={(e) => setOrderData({ ...orderData, isRushOrder: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Rush Order</span>
              </label>
            </div>
          </div>
        </div>

        {/* Test Scenarios */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">🧪 Quick Test Scenarios</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setCustomerData({
                  email: 'legitimate@gmail.com',
                  name: 'Jane Smith',
                  phone: '555-1234',
                  ipAddress: '192.168.1.1',
                  userAgent: 'Mozilla/5.0...'
                });
                setOrderData({
                  amount: 299,
                  services: ['LLC_FORMATION'],
                  isRushOrder: false,
                  paymentMethod: 'credit_card'
                });
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              ✅ Low Risk Customer
            </button>
            <button
              onClick={() => {
                setCustomerData({
                  email: 'test@tempmail.com',
                  name: 'John Smith',
                  phone: '',
                  ipAddress: '185.220.101.50',
                  userAgent: 'Mozilla/5.0...'
                });
                setOrderData({
                  amount: 500,
                  services: ['LLC_FORMATION', 'EXPEDITED_PROCESSING'],
                  isRushOrder: true,
                  paymentMethod: 'prepaid_card'
                });
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              🚨 High Risk Customer
            </button>
          </div>
        </div>

        <button
          onClick={runRiskAssessment}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 mb-6"
        >
          {loading ? '🔄 Analyzing Risk...' : '🤖 Run AI Risk Assessment'}
        </button>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Assessment Results</h2>

            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                ❌ Error: {result.error}
              </div>
            ) : (
              <>
                {/* Risk Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">Risk Score</span>
                    <span className={`px-4 py-2 rounded-full font-bold border-2 ${getRiskLevelColor(result.riskLevel)}`}>
                      {result.riskLevel} - {result.riskScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${
                        result.riskScore >= 76 ? 'bg-red-500' :
                        result.riskScore >= 51 ? 'bg-orange-500' :
                        result.riskScore >= 26 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${result.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="font-semibold text-blue-900 mb-2">🤖 AI Recommendation</div>
                  <div className="text-blue-800 font-medium mb-2">{result.recommendation}</div>
                  <div className="text-blue-700 text-sm">{result.reasoning}</div>
                </div>

                {/* Risk Factors */}
                {result.riskFactors && result.riskFactors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Risk Factors Detected ({result.riskFactors.length})
                    </h3>
                    <div className="space-y-3">
                      {result.riskFactors.map((factor: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-gray-300 pl-4 py-2 bg-gray-50 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{factor.factor}</span>
                            <span className={`text-sm font-semibold ${
                              factor.severity === 'critical' ? 'text-red-700' :
                              factor.severity === 'high' ? 'text-orange-700' :
                              factor.severity === 'medium' ? 'text-yellow-700' :
                              'text-blue-700'
                            }`}>
                              {factor.severity.toUpperCase()} (+{factor.points} points)
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{factor.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Required */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-semibold text-yellow-900 mb-2">⚠️ Next Steps</div>
                  <div className="text-yellow-800 text-sm">
                    {result.requiresReview ? (
                      <>This order requires manual review before processing. It will appear in the Risk Management Dashboard.</>
                    ) : (
                      <>This order can be processed automatically. No manual review required.</>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

