/**
 * LegalOps v1 - Create Account Checkout Page
 * 
 * Account creation page for services that require customer accounts
 * (LLC Formation, Corporation Formation, Registered Agent, Annual Report)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import UPLDisclaimer from '@/components/UPLDisclaimer';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get service info from URL params
  const serviceType = searchParams.get('service') || '';
  const serviceName = searchParams.get('name') || '';
  const servicePrice = parseFloat(searchParams.get('price') || '0');
  const orderId = searchParams.get('orderId') || ''; // If order already created

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [emailRemindersConsent, setEmailRemindersConsent] = useState(false);
  const [smsRemindersConsent, setSmsRemindersConsent] = useState(false);

  // Password strength checker
  useEffect(() => {
    const { password } = formData;
    if (password.length === 0) {
      setPasswordStrength('weak');
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [formData.password]);

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
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Create user account
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          tosAcceptedAt: new Date().toISOString(),
          privacyPolicyAcceptedAt: new Date().toISOString(),
          emailRemindersConsent,
          smsRemindersConsent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Sign in the user
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error('Account created but sign-in failed. Please try signing in manually.');
      }

      // Redirect to service form or order page
      if (orderId) {
        router.push(`/orders/${orderId}`);
      } else if (serviceType === 'LLC_FORMATION') {
        router.push('/services/llc-formation');
      } else if (serviceType === 'CORP_FORMATION') {
        router.push('/services/corporation-formation');
      } else if (serviceType === 'ANNUAL_REPORT') {
        router.push('/services/annual-report');
      } else if (serviceType === 'REGISTERED_AGENT') {
        router.push('/services/registered-agent');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Create Your Account
          </h1>
          <p className="text-lg text-slate-600">
            {serviceName && `Complete your ${serviceName} order`}
          </p>
        </div>

        {/* UPL Disclaimer */}
        <UPLDisclaimer variant="minimal" className="mb-8" />

        {/* Account Creation Form */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-slate-200" style={{ padding: '32px' }}>
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
                We'll send order updates and important notices to this email
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

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border-2 border-slate-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors pr-12"
                  style={{ padding: '12px 16px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? 'bg-red-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-yellow-500' : 'bg-slate-200'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                  </div>
                  <p className={`text-xs ${passwordStrength === 'weak' ? 'text-red-600' : passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    Password strength: {passwordStrength}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border-2 border-slate-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors pr-12"
                  style={{ padding: '12px 16px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Marketing Consent */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-5 mb-6">
              <h3 className="font-bold text-amber-900 mb-3 text-sm">
                📬 Stay Informed (Optional)
              </h3>
              <p className="text-xs text-amber-800 mb-4">
                We can send you helpful reminders for important deadlines like annual reports, renewals, and compliance requirements.
              </p>

              {/* Email Reminders */}
              <div className="flex items-start mb-3">
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

              <p className="text-xs text-amber-600 mt-3 italic">
                You can unsubscribe at any time. We'll never share your information.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ padding: '14px 28px' }}
            >
              {loading ? 'Creating Account...' : 'Create Account & Continue'}
            </button>
          </form>
        </div>

        {/* Already Have Account */}
        <div className="text-center mt-6">
          <p className="text-slate-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push(`/auth/signin?service=${serviceType}&name=${serviceName}&price=${servicePrice}`)}
              className="text-sky-600 hover:text-sky-700 font-semibold underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

