"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      // Update the session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          email: formData.email,
        },
      });

      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSendVerification = async () => {
    setSendingVerification(true);
    setVerificationMessage("");

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationMessage(
          `✅ Verification link generated! Check the console (F12) or the message below to copy the link.`
        );
        // In development, log the verification URL
        if (data.verificationUrl) {
          console.log("🔗 VERIFICATION URL (Click to copy):", data.verificationUrl);
          console.log("📋 Copy this link and paste it in your browser to verify your email");

          // Store the URL in state to display it
          setVerificationMessage(
            `✅ Verification link generated!\n\nCopy this link: ${data.verificationUrl}\n\n(In production, this would be sent via email)`
          );
        }
      } else {
        setVerificationMessage(data.error || "Failed to send verification email");
      }
    } catch (error) {
      setVerificationMessage("An error occurred. Please try again.");
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="page-enter">
      {/* Page Header - Minimal with Breathing Room */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Profile</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Manage your account information
        </p>
      </div>

      {/* Profile Card - Clean Design with Generous Spacing */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">

        {/* Header - Minimal with Avatar and Breathing Room */}
        <div className="bg-neutral-50 px-8 py-10 border-b border-neutral-200">
          <div className="flex items-center gap-6">
            {/* Avatar - Simple Circle */}
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-3xl">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            {/* User Info - Clean Typography */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">{session?.user?.name || "User"}</h2>
              <p className="text-sm text-neutral-600 mt-0.5">{session?.user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-neutral-200 px-2.5 py-1 rounded-md">
                <span className="text-xs font-medium text-neutral-700 uppercase tracking-wide">
                  {session?.user?.role || "USER"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section with Breathing Room */}
        <div className="p-8">
          {/* Success Message - Subtle */}
          {success && (
            <div className="mb-6 bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-md flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Error Message - Subtle */}
          {error && (
            <div className="mb-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Name Field - Clean */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-md bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="px-4 py-2.5 bg-neutral-50 rounded-md text-neutral-900">
                    {session?.user?.name || "Not set"}
                  </p>
                )}
              </div>

              {/* Email Field - Clean */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-md bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className="px-4 py-2.5 bg-neutral-50 rounded-md text-neutral-900">
                    {session?.user?.email || "Not set"}
                  </p>
                )}
              </div>

              {/* Role Field (Read-only) - Minimal */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Role
                </label>
                <p className="px-4 py-2.5 bg-neutral-50 rounded-md text-neutral-900 flex items-center justify-between">
                  <span>{session?.user?.role || "USER"}</span>
                  <span className="text-xs text-neutral-500">Read only</span>
                </p>
              </div>

              {/* Account Created - Minimal */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Member Since
                </label>
                <p className="px-4 py-2.5 bg-neutral-50 rounded-md text-neutral-900">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Action Buttons - Clean */}
            <div className="mt-8 flex gap-3">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary-500 text-white py-2.5 rounded-md font-medium hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 bg-neutral-100 text-neutral-900 py-2.5 rounded-md font-medium hover:bg-neutral-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-primary-500 text-white py-2.5 rounded-md font-medium hover:bg-primary-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Email Verification Section - Clean with Breathing Room */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-8">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Email Verification</h3>

        {verificationMessage && (
          <div className={`mb-4 px-4 py-3 rounded-md ${
            verificationMessage.includes("✅")
              ? "bg-success-50 border border-success-200 text-success-700"
              : "bg-error-50 border border-error-200 text-error-700"
          }`}>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {verificationMessage.includes("✅") ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
              <div className="flex-1">
                <p className="text-sm whitespace-pre-wrap break-all">{verificationMessage}</p>
                {verificationMessage.includes("http") && (
                  <button
                    onClick={() => {
                      const urlMatch = verificationMessage.match(/(http[^\s]+)/);
                      if (urlMatch) {
                        navigator.clipboard.writeText(urlMatch[0]);
                        alert("Link copied to clipboard!");
                      }
                    }}
                    className="mt-2 px-3 py-1.5 bg-success-600 text-white text-xs rounded-md hover:bg-success-700 transition-colors duration-200"
                  >
                    Copy Link
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-md">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${
              session?.user?.emailVerified
                ? "bg-success-100"
                : "bg-warning-100"
            }`}>
              {session?.user?.emailVerified ? (
                <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-neutral-900 text-sm">
                {session?.user?.emailVerified ? "Email Verified" : "Email Not Verified"}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {session?.user?.emailVerified
                  ? "Your email address has been verified"
                  : "Verify your email to secure your account"}
              </p>
            </div>
          </div>
          {!session?.user?.emailVerified && (
            <button
              onClick={handleSendVerification}
              disabled={sendingVerification}
              className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-medium hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingVerification ? "Sending..." : "Verify Email"}
            </button>
          )}
        </div>
      </div>

      {/* Security Section - Clean with Breathing Room */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-8">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Security</h3>
        <div className="space-y-4">
          <Link
            href="/dashboard/profile/change-password"
            className="block px-4 py-3 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary-100 group-hover:bg-primary-200 rounded-md p-2 transition-colors duration-200">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">Change Password</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Update your password</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

