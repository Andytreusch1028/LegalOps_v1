"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Sign Up Page - Jony Ive Design Philosophy
 * Principles: Clarity, Simplicity, Single-page Form with Smart Sections
 */

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Registration successful, redirect to sign in
      router.push("/auth/signin?registered=true");
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center page-enter"
      style={{
        padding: '96px 24px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
      }}
    >
      <div className="w-full" style={{ maxWidth: '480px' }}>

        {/* Logo/Brand - Professional Legal Tech */}
        <div className="text-center" style={{ marginBottom: '48px' }}>
          <div
            className="inline-flex items-center justify-center"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              boxShadow: '0 8px 24px rgba(14, 165, 233, 0.25)',
              marginBottom: '24px'
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h1 className="font-semibold tracking-tight" style={{ fontSize: '32px', marginBottom: '12px', color: '#0f172a' }}>
            Create your account
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b' }}>
            Join LegalOps to streamline your legal operations
          </p>
        </div>

        {/* Main Card - Professional with subtle shadow */}
        <div
          className="bg-white rounded-xl"
          style={{
            padding: '48px 40px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 20px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}
        >
          {/* Error Message - Subtle */}
          {error && (
            <div
              className="rounded-lg text-center"
              style={{
                marginBottom: '32px',
                padding: '14px 18px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626'
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: '500' }}>{error}</p>
            </div>
          )}

          {/* Sign Up Form - Professional with generous spacing */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Personal Information Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label
                  htmlFor="name"
                  className="block font-medium"
                  style={{ fontSize: '14px', marginBottom: '10px', color: '#334155' }}
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white transition-all duration-200"
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    border: '1.5px solid #e2e8f0',
                    color: '#0f172a'
                  }}
                  placeholder="John Doe"
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block font-medium"
                  style={{ fontSize: '14px', marginBottom: '10px', color: '#334155' }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white transition-all duration-200"
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    border: '1.5px solid #e2e8f0',
                    color: '#0f172a'
                  }}
                  placeholder="you@company.com"
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Security Section - Subtle Divider */}
            <div style={{ paddingTop: '28px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label
                  htmlFor="password"
                  className="block font-medium"
                  style={{ fontSize: '14px', marginBottom: '10px', color: '#334155' }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white transition-all duration-200"
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    border: '1.5px solid #e2e8f0',
                    color: '#0f172a'
                  }}
                  placeholder="Create a password"
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <p style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>Minimum 6 characters</p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block font-medium"
                  style={{ fontSize: '14px', marginBottom: '10px', color: '#334155' }}
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-white transition-all duration-200"
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    border: '1.5px solid #e2e8f0',
                    color: '#0f172a'
                  }}
                  placeholder="Confirm your password"
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Submit Button - Professional gradient */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                padding: '15px',
                borderRadius: '10px',
                fontSize: '15px',
                marginTop: '12px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(14, 165, 233, 0.3)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center" style={{ gap: '10px' }}>
                  <div className="animate-spin rounded-full border-2 border-white border-t-transparent" style={{ width: '18px', height: '18px' }}></div>
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Security Badge - Trust indicator */}
          <div className="flex items-center justify-center" style={{ marginTop: '32px', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              256-bit SSL encrypted
            </span>
          </div>
        </div>

        {/* Divider - Subtle */}
        <div className="flex items-center" style={{ margin: '40px 0' }}>
          <div className="flex-1" style={{ borderTop: '1px solid #e2e8f0' }}></div>
          <span style={{ padding: '0 16px', fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>OR</span>
          <div className="flex-1" style={{ borderTop: '1px solid #e2e8f0' }}></div>
        </div>

        {/* Sign In Link - Professional */}
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '15px', color: '#64748b' }}>
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-medium transition-colors duration-200"
              style={{ color: '#0ea5e9' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0284c7'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#0ea5e9'}
            >
              Sign in →
            </Link>
          </p>
        </div>

        {/* Back to Home - Subtle */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center transition-colors duration-200"
            style={{ gap: '6px', fontSize: '14px', color: '#94a3b8' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#64748b'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

