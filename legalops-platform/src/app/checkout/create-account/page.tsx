/**
 * LegalOps v1 - Create Account Checkout Page
 * 
 * Account creation page for services that require customer accounts
 * (LLC Formation, Corporation Formation, Registered Agent, Annual Report)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import UPLDisclaimer from '@/components/UPLDisclaimer';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Get service info from URL params
  const serviceType = searchParams.get('service') || '';
  const serviceName = searchParams.get('name') || '';
  const servicePrice = parseFloat(searchParams.get('price') || '0');
  const orderId = searchParams.get('orderId') || ''; // If order already created

  // Redirect authenticated users to service page
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // User is already signed in, redirect to service page
      if (serviceType === 'LLC_FORMATION') {
        router.push('/services/llc-formation');
      } else if (serviceType === 'CORP_FORMATION') {
        router.push('/services/corporation-formation');
      } else if (serviceType === 'LLC_ANNUAL_REPORT') {
        router.push('/services/llc-annual-report');
      } else if (serviceType === 'CORP_ANNUAL_REPORT') {
        router.push('/services/corporation-annual-report');
      } else if (serviceType === 'ANNUAL_REPORT') {
        router.push('/services/annual-report');
      } else if (serviceType === 'REGISTERED_AGENT') {
        router.push('/services/registered-agent');
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, session, serviceType, router]);

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
      } else if (serviceType === 'LLC_ANNUAL_REPORT') {
        router.push('/services/llc-annual-report');
      } else if (serviceType === 'CORP_ANNUAL_REPORT') {
        router.push('/services/corporation-annual-report');
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

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #e8f0f7 0%, #f5f8fb 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #e8f0f7 0%, #f5f8fb 100%)', padding: '48px 24px' }}>
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <h1 className="font-bold text-slate-900" style={{ fontSize: '32px', marginBottom: '8px' }}>
            Create Your Account
          </h1>
          <p className="text-slate-600" style={{ fontSize: '16px' }}>
            {serviceName && `Complete your ${serviceName} order`}
          </p>
        </div>

        {/* UPL Disclaimer */}
        <div style={{ marginBottom: '24px' }}>
          <UPLDisclaimer variant="minimal" />
        </div>

        {/* Account Creation Form */}
        <div className="bg-white rounded-lg" style={{
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '32px'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 rounded-lg" style={{
                border: '1px solid #fca5a5',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '20px', marginBottom: '20px' }}>
              <div>
                <label className="block font-semibold text-slate-700" style={{ fontSize: '14px', marginBottom: '8px' }}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full rounded-lg transition-colors"
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '12px 16px',
                    fontSize: '15px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0ea5e9';
                    e.target.style.outline = '2px solid rgba(14, 165, 233, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.outline = 'none';
                  }}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700" style={{ fontSize: '14px', marginBottom: '8px' }}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full rounded-lg transition-colors"
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '12px 16px',
                    fontSize: '15px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0ea5e9';
                    e.target.style.outline = '2px solid rgba(14, 165, 233, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.outline = 'none';
                  }}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label className="block font-semibold text-slate-700" style={{ fontSize: '14px', marginBottom: '8px' }}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg transition-colors"
                style={{
                  border: '1px solid #cbd5e1',
                  padding: '12px 16px',
                  fontSize: '15px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0ea5e9';
                  e.target.style.outline = '2px solid rgba(14, 165, 233, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.outline = 'none';
                }}
                required
              />
              <p className="text-slate-500" style={{ fontSize: '12px', marginTop: '6px' }}>
                We'll send order updates and important notices to this email
              </p>
            </div>

            {/* Phone (Optional) */}
            <div style={{ marginBottom: '20px' }}>
              <label className="block font-semibold text-slate-700" style={{ fontSize: '14px', marginBottom: '8px' }}>
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg transition-colors"
                style={{
                  border: '1px solid #cbd5e1',
                  padding: '12px 16px',
                  fontSize: '15px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0ea5e9';
                  e.target.style.outline = '2px solid rgba(14, 165, 233, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.outline = 'none';
                }}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '20px' }}>
              <label className="block font-semibold text-slate-700" style={{ fontSize: '14px', marginBottom: '8px' }}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg transition-colors"
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '12px 16px',
                    paddingRight: '48px',
                    fontSize: '15px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0ea5e9';
                    e.target.style.outline = '2px solid rgba(14, 165, 233, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.outline = 'none';
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-slate-400 hover:text-slate-600"
                  style={{ right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div style={{ marginTop: '8px' }}>
                  <div className="flex" style={{ gap: '4px', marginBottom: '4px' }}>
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? 'bg-red-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-yellow-500' : 'bg-slate-200'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                  </div>
                  <p className={`${passwordStrength === 'weak' ? 'text-red-600' : passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'}`} style={{ fontSize: '12px' }}>
                    Password strength: {passwordStrength}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '20px' }}>
              <label className="block font-semibold text-slate-700" style={{ fontSize: '14px', marginBottom: '8px' }}>
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg transition-colors"
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '12px 16px',
                    paddingRight: '48px',
                    fontSize: '15px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0ea5e9';
                    e.target.style.outline = '2px solid rgba(14, 165, 233, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.outline = 'none';
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-slate-400 hover:text-slate-600"
                  style={{ right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Marketing Consent */}
            <div className="bg-amber-50 rounded-lg" style={{
              border: '1px solid #fcd34d',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 className="font-bold text-amber-900" style={{ fontSize: '14px', marginBottom: '12px' }}>
                📬 Stay Informed (Optional)
              </h3>
              <p className="text-amber-800" style={{ fontSize: '12px', marginBottom: '16px' }}>
                We can send you helpful reminders for important deadlines like annual reports, renewals, and compliance requirements.
              </p>

              {/* Email Reminders */}
              <div className="flex items-start" style={{ marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  id="emailReminders"
                  checked={emailRemindersConsent}
                  onChange={(e) => setEmailRemindersConsent(e.target.checked)}
                  className="text-sky-600 border-amber-300 rounded focus:ring-sky-500"
                  style={{ marginTop: '4px', height: '16px', width: '16px' }}
                />
                <label htmlFor="emailReminders" className="text-amber-900" style={{ marginLeft: '12px', fontSize: '14px' }}>
                  <span className="font-semibold">Email Reminders</span>
                  <span className="block text-amber-700" style={{ fontSize: '12px', marginTop: '2px' }}>
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
                  className="text-sky-600 border-amber-300 rounded focus:ring-sky-500"
                  style={{ marginTop: '4px', height: '16px', width: '16px' }}
                  disabled={!formData.phone}
                />
                <label htmlFor="smsReminders" className={!formData.phone ? 'text-amber-500' : 'text-amber-900'} style={{ marginLeft: '12px', fontSize: '14px' }}>
                  <span className="font-semibold">SMS Reminders</span>
                  <span className="block text-amber-700" style={{ fontSize: '12px', marginTop: '2px' }}>
                    {formData.phone
                      ? 'Get text message reminders for critical deadlines'
                      : 'Enter a phone number above to enable SMS reminders'}
                  </span>
                </label>
              </div>

              <p className="text-amber-600 italic" style={{ fontSize: '12px', marginTop: '12px' }}>
                You can unsubscribe at any time. We'll never share your information.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold rounded-lg transition-all duration-200"
              style={{
                background: loading ? '#cbd5e1' : '#0284c7',
                padding: '14px 28px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#0369a1';
                  e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#0284c7';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account & Continue'}
            </button>
          </form>
        </div>

        {/* Already Have Account */}
        <div className="text-center" style={{ marginTop: '24px' }}>
          <p className="text-slate-600" style={{ fontSize: '15px' }}>
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

