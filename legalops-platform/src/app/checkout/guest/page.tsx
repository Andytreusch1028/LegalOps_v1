/**
 * LegalOps v1 - Guest Checkout Page
 * 
 * Guest checkout page for services that allow guest purchases
 * (Operating Agreement, Bylaws, Certificate of Status, EIN Application, etc.)
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UPLDisclaimer from '@/components/UPLDisclaimer';
import { AlertCircle, ShoppingCart } from 'lucide-react';

export default function GuestCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get service info from URL params
  const serviceType = searchParams.get('service') || '';
  const serviceName = searchParams.get('name') || '';
  const servicePrice = parseFloat(searchParams.get('price') || '0');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [emailRemindersConsent, setEmailRemindersConsent] = useState(false);
  const [smsRemindersConsent, setSmsRemindersConsent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Create guest order
      const response = await fetch('/api/orders/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          guestInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
          tosAcceptedAt: new Date().toISOString(),
          privacyPolicyAcceptedAt: new Date().toISOString(),
          emailRemindersConsent,
          smsRemindersConsent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Redirect to checkout page with order ID
      router.push(`/checkout/${data.orderId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #e8f0f7 0%, #f5f8fb 100%)', padding: '48px 24px' }}>
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
            <ShoppingCart className="w-8 h-8 text-sky-600" />
          </div>
          <h1 className="font-bold text-slate-900" style={{ fontSize: '32px', marginBottom: '8px' }}>
            Guest Checkout
          </h1>
          <p className="text-slate-600" style={{ fontSize: '16px' }}>
            {serviceName && `Complete your ${serviceName} order`}
          </p>
        </div>

        {/* UPL Disclaimer */}
        <div style={{ marginBottom: '24px' }}>
          <UPLDisclaimer variant="minimal" />
        </div>

        {/* Service Summary */}
        <div className="bg-white rounded-lg" style={{
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 className="font-bold text-slate-900" style={{ fontSize: '18px', marginBottom: '16px' }}>Order Summary</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-900">{serviceName}</p>
              <p className="text-sm text-slate-600">One-time service</p>
            </div>
            <div className="font-bold text-sky-600" style={{ fontSize: '24px' }}>
              ${servicePrice.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Guest Information Form */}
        <div className="bg-white rounded-lg" style={{
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '32px'
        }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Information</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border-2 border-slate-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
                  style={{ padding: '12px 16px' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border-2 border-slate-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
                  style={{ padding: '12px 16px' }}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-2 border-slate-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
                style={{ padding: '12px 16px' }}
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                We'll send your completed documents to this email
              </p>
            </div>

            {/* Phone (Optional) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border-2 border-slate-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
                style={{ padding: '12px 16px' }}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Marketing Consent */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg" style={{ padding: '20px', marginTop: '24px' }}>
              <h3 className="font-bold text-amber-900 text-sm" style={{ marginBottom: '12px' }}>
                📬 Stay Informed (Optional)
              </h3>
              <p className="text-xs text-amber-800" style={{ marginBottom: '16px' }}>
                We can send you helpful reminders for important deadlines like annual reports, renewals, and compliance requirements.
              </p>

              {/* Email Reminders */}
              <div className="flex items-start" style={{ marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  id="emailReminders"
                  checked={emailRemindersConsent}
                  onChange={(e) => setEmailRemindersConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 text-sky-600 border-amber-300 rounded focus:ring-sky-500"
                />
                <label htmlFor="emailReminders" className="ml-3 text-sm text-amber-900">
                  <span className="font-semibold">Email Reminders</span>
                  <span className="block text-xs text-amber-700 mt-0.5">
                    Get email notifications for upcoming deadlines and renewals
                  </span>
                </label>
              </div>

              {/* SMS Reminders */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="smsReminders"
                  checked={smsRemindersConsent}
                  onChange={(e) => setSmsRemindersConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 text-sky-600 border-amber-300 rounded focus:ring-sky-500"
                  disabled={!formData.phone}
                />
                <label htmlFor="smsReminders" className={`ml-3 text-sm ${!formData.phone ? 'text-amber-500' : 'text-amber-900'}`}>
                  <span className="font-semibold">SMS Reminders</span>
                  <span className="block text-xs text-amber-700 mt-0.5">
                    {formData.phone
                      ? 'Get text message reminders for critical deadlines'
                      : 'Enter a phone number above to enable SMS reminders'}
                  </span>
                </label>
              </div>

              <p className="text-xs text-amber-600 italic" style={{ marginTop: '12px' }}>
                You can unsubscribe at any time. We'll never share your information.
              </p>
            </div>

            {/* Benefits of Creating Account */}
            <div className="bg-sky-50 border-2 border-sky-200 rounded-lg" style={{ padding: '24px', marginTop: '24px' }}>
              <h3 className="font-bold text-sky-900" style={{ marginBottom: '12px' }}>
                💡 Want to save time on future orders?
              </h3>
              <p className="text-sm text-sky-800" style={{ marginBottom: '12px' }}>
                Create an account to:
              </p>
              <ul className="text-sm text-sky-800 list-disc" style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '4px' }}>Access all your documents in one place</li>
                <li style={{ marginBottom: '4px' }}>Track order status in real-time</li>
                <li style={{ marginBottom: '4px' }}>Reuse your information for faster checkout</li>
                <li>Receive important compliance reminders</li>
              </ul>
              <button
                type="button"
                onClick={() => router.push(`/checkout/create-account?service=${serviceType}&name=${serviceName}&price=${servicePrice}`)}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors"
                style={{ padding: '12px 24px', marginTop: '16px' }}
              >
                Create Account Instead
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ padding: '14px 28px', marginTop: '24px' }}
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900 underline"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

