/**
 * UserDetailsModal Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Detailed user information modal with profile and order history
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  Download,
  Key,
  UserX,
  UserCheck,
  Flag
} from 'lucide-react';

export interface UserDetailsModalProps {
  /** User ID to display */
  userId: string;
  
  /** Modal visibility */
  isOpen: boolean;
  
  /** Close modal handler */
  onClose: () => void;
  
  /** User data loader */
  onLoadUser: (userId: string) => Promise<UserDetails>;
  
  /** User action handlers */
  onToggleUserStatus: (userId: string, enabled: boolean) => Promise<void>;
  onResetPassword: (userId: string) => Promise<void>;
  onExportUserData: (userId: string) => Promise<void>;
  onAddFlag: (userId: string, flag: Omit<UserFlag, 'id' | 'createdAt'>) => Promise<void>;
  onRemoveFlag: (userId: string, flagId: string) => Promise<void>;
}

export interface UserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  enabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  profileCompletionPercentage: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Profile information
  profile: {
    personalInfo: {
      middleName?: string;
      dateOfBirth?: string;
      phone?: string;
      alternatePhone?: string;
    };
    addresses: {
      personal?: Address;
      mailing?: Address;
      business?: Address;
    };
    businessInfo: {
      companyName?: string;
      title?: string;
      industry?: string;
      businessPhone?: string;
      businessEmail?: string;
      fein?: string;
      businessType?: string;
    };
    preferences: {
      language: string;
      timezone: string;
      notifications: {
        email: boolean;
        sms: boolean;
        marketing: boolean;
      };
    };
  };
  
  // Order history
  orders: Order[];
  
  // Security and compliance
  flags: UserFlag[];
  securityEvents: SecurityEvent[];
  loginHistory: LoginEvent[];
}

export interface Address {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Order {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  amount: number;
  createdAt: string;
  completedAt?: string;
}

export interface UserFlag {
  id: string;
  type: 'security' | 'compliance' | 'support' | 'billing';
  severity: 'info' | 'warning' | 'error';
  message: string;
  createdAt: string;
  createdBy: string;
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'password_reset' | 'email_change' | 'suspicious_activity';
  description: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface LoginEvent {
  id: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  createdAt: string;
}

export function UserDetailsModal({
  userId,
  isOpen,
  onClose,
  onLoadUser,
  onToggleUserStatus,
  onResetPassword,
  onExportUserData,
  onAddFlag,
  onRemoveFlag,
}: UserDetailsModalProps) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security' | 'flags'>('profile');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [showAddFlag, setShowAddFlag] = useState(false);
  const [newFlag, setNewFlag] = useState<Omit<UserFlag, 'id' | 'createdAt' | 'createdBy'>>({
    type: 'support',
    severity: 'info',
    message: '',
  });

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      loadUserData();
    }
  }, [isOpen, userId]);

  const loadUserData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await onLoadUser(userId);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user actions with loading state
  const handleUserAction = async (actionKey: string, action: () => Promise<void>) => {
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    try {
      await action();
      await loadUserData(); // Refresh data
    } catch (err) {
      console.error('User action failed:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  // Handle add flag
  const handleAddFlag = async () => {
    if (!newFlag.message.trim()) return;
    
    await handleUserAction('addFlag', async () => {
      await onAddFlag(userId, newFlag);
      setNewFlag({ type: 'support', severity: 'info', message: '' });
      setShowAddFlag(false);
    });
  };

  // Handle remove flag
  const handleRemoveFlag = async (flagId: string) => {
    await handleUserAction(`removeFlag-${flagId}`, () => onRemoveFlag(userId, flagId));
  };

  // Format address
  const formatAddress = (address: Address) => {
    return `${address.street}${address.street2 ? `, ${address.street2}` : ''}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  // Get risk level styling
  const getRiskLevelStyle = (riskLevel: UserDetails['riskLevel']) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  // Get flag styling
  const getFlagStyle = (flag: UserFlag) => {
    const baseStyle = 'px-2 py-1 text-xs rounded border';
    switch (flag.severity) {
      case 'info':
        return `${baseStyle} bg-blue-100 text-blue-700 border-blue-200`;
      case 'warning':
        return `${baseStyle} bg-yellow-100 text-yellow-700 border-yellow-200`;
      case 'error':
        return `${baseStyle} bg-red-100 text-red-700 border-red-200`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="text-slate-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
              </h2>
              {user && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-slate-600">{user.email}</span>
                  <span className={`px-2 py-1 text-xs rounded border ${getRiskLevelStyle(user.riskLevel)}`}>
                    {user.riskLevel.charAt(0).toUpperCase() + user.riskLevel.slice(1)} Risk
                  </span>
                  <span className={`w-2 h-2 rounded-full ${user.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-200 p-4">
            {/* Quick Actions */}
            {user && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleUserAction('toggleStatus', () => onToggleUserStatus(userId, !user.enabled))}
                    disabled={actionLoading.toggleStatus}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      user.enabled
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {actionLoading.toggleStatus ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : user.enabled ? (
                      <UserX size={16} />
                    ) : (
                      <UserCheck size={16} />
                    )}
                    {user.enabled ? 'Disable User' : 'Enable User'}
                  </button>
                  
                  <button
                    onClick={() => handleUserAction('resetPassword', () => onResetPassword(userId))}
                    disabled={actionLoading.resetPassword}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {actionLoading.resetPassword ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Key size={16} />
                    )}
                    Reset Password
                  </button>
                  
                  <button
                    onClick={() => handleUserAction('exportData', () => onExportUserData(userId))}
                    disabled={actionLoading.exportData}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {actionLoading.exportData ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    Export Data
                  </button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-1">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'orders', label: 'Orders', icon: ShoppingBag },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'flags', label: 'Flags', icon: Flag },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                    {tab.id === 'flags' && user?.flags.length ? (
                      <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                        {user.flags.length}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            {/* Sensitive Data Toggle */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-700 transition-colors"
              >
                {showSensitiveData ? <EyeOff size={16} /> : <Eye size={16} />}
                {showSensitiveData ? 'Hide' : 'Show'} sensitive data
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                  <p className="text-red-600 font-medium">Failed to load user data</p>
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                  <button
                    onClick={loadUserData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : user ? (
              <>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">First Name</label>
                          <p className="text-slate-900">{user.firstName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Last Name</label>
                          <p className="text-slate-900">{user.lastName}</p>
                        </div>
                        {user.profile.personalInfo.middleName && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Middle Name</label>
                            <p className="text-slate-900">{user.profile.personalInfo.middleName}</p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Email</label>
                          <div className="flex items-center gap-2">
                            <p className="text-slate-900">{user.email}</p>
                            {user.emailVerified && <span className="text-green-600 text-sm">✓ Verified</span>}
                          </div>
                        </div>
                        {user.profile.personalInfo.phone && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Phone</label>
                            <div className="flex items-center gap-2">
                              <p className="text-slate-900">
                                {showSensitiveData ? user.profile.personalInfo.phone : '***-***-****'}
                              </p>
                              {user.phoneVerified && <span className="text-green-600 text-sm">✓ Verified</span>}
                            </div>
                          </div>
                        )}
                        {user.profile.personalInfo.dateOfBirth && showSensitiveData && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                            <p className="text-slate-900">
                              {new Date(user.profile.personalInfo.dateOfBirth).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Addresses */}
                    {(user.profile.addresses.personal || user.profile.addresses.mailing || user.profile.addresses.business) && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Addresses</h3>
                        <div className="space-y-4">
                          {user.profile.addresses.personal && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Personal Address</label>
                              <p className="text-slate-900">
                                {showSensitiveData ? formatAddress(user.profile.addresses.personal) : 'Hidden'}
                              </p>
                            </div>
                          )}
                          {user.profile.addresses.mailing && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Mailing Address</label>
                              <p className="text-slate-900">
                                {showSensitiveData ? formatAddress(user.profile.addresses.mailing) : 'Hidden'}
                              </p>
                            </div>
                          )}
                          {user.profile.addresses.business && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
                              <p className="text-slate-900">
                                {showSensitiveData ? formatAddress(user.profile.addresses.business) : 'Hidden'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Business Information */}
                    {(user.profile.businessInfo.companyName || user.profile.businessInfo.title) && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Business Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {user.profile.businessInfo.companyName && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Company</label>
                              <p className="text-slate-900">{user.profile.businessInfo.companyName}</p>
                            </div>
                          )}
                          {user.profile.businessInfo.title && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Title</label>
                              <p className="text-slate-900">{user.profile.businessInfo.title}</p>
                            </div>
                          )}
                          {user.profile.businessInfo.industry && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Industry</label>
                              <p className="text-slate-900">{user.profile.businessInfo.industry}</p>
                            </div>
                          )}
                          {user.profile.businessInfo.businessEmail && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Business Email</label>
                              <p className="text-slate-900">{user.profile.businessInfo.businessEmail}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Account Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Created</label>
                          <p className="text-slate-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Last Login</label>
                          <p className="text-slate-900">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Profile Completion</label>
                          <p className="text-slate-900">{user.profileCompletionPercentage}%</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Status</label>
                          <p className={`font-medium ${user.enabled ? 'text-green-600' : 'text-red-600'}`}>
                            {user.enabled ? 'Active' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Order History</h3>
                    {user.orders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag className="mx-auto text-slate-400 mb-4" size={48} />
                        <p className="text-slate-500">No orders found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {user.orders.map((order) => (
                          <div key={order.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-slate-900">Order #{order.id}</h4>
                              <span className={`px-2 py-1 text-xs rounded ${
                                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-slate-500">Type:</span>
                                <p className="text-slate-900">{order.type}</p>
                              </div>
                              <div>
                                <span className="text-slate-500">Amount:</span>
                                <p className="text-slate-900">${order.amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-slate-500">Date:</span>
                                <p className="text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Security Events</h3>
                      {user.securityEvents.length === 0 ? (
                        <p className="text-slate-500">No security events recorded</p>
                      ) : (
                        <div className="space-y-3">
                          {user.securityEvents.slice(0, 10).map((event) => (
                            <div key={event.id} className="border border-slate-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-slate-900">{event.type.replace('_', ' ')}</span>
                                <span className="text-sm text-slate-500">
                                  {new Date(event.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-slate-600 text-sm">{event.description}</p>
                              {showSensitiveData && (
                                <div className="mt-2 text-xs text-slate-500">
                                  IP: {event.ipAddress} • {event.userAgent}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Login History</h3>
                      {user.loginHistory.length === 0 ? (
                        <p className="text-slate-500">No login history available</p>
                      ) : (
                        <div className="space-y-2">
                          {user.loginHistory.slice(0, 10).map((login) => (
                            <div key={login.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                              <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${login.success ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-sm text-slate-900">
                                  {login.success ? 'Successful login' : 'Failed login attempt'}
                                </span>
                              </div>
                              <span className="text-sm text-slate-500">
                                {new Date(login.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Flags Tab */}
                {activeTab === 'flags' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">User Flags</h3>
                      <button
                        onClick={() => setShowAddFlag(true)}
                        className="liquid-glass-button flex items-center gap-2 py-2 px-4"
                      >
                        <Flag size={16} />
                        Add Flag
                      </button>
                    </div>

                    {/* Add Flag Form */}
                    {showAddFlag && (
                      <div className="border border-slate-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-slate-900 mb-3">Add New Flag</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={newFlag.type}
                              onChange={(e) => setNewFlag(prev => ({ ...prev, type: e.target.value as any }))}
                              className="px-3 py-2 border border-slate-300 rounded-lg focus:border-sky-500 focus:ring-sky-500"
                            >
                              <option value="security">Security</option>
                              <option value="compliance">Compliance</option>
                              <option value="support">Support</option>
                              <option value="billing">Billing</option>
                            </select>
                            <select
                              value={newFlag.severity}
                              onChange={(e) => setNewFlag(prev => ({ ...prev, severity: e.target.value as any }))}
                              className="px-3 py-2 border border-slate-300 rounded-lg focus:border-sky-500 focus:ring-sky-500"
                            >
                              <option value="info">Info</option>
                              <option value="warning">Warning</option>
                              <option value="error">Error</option>
                            </select>
                          </div>
                          <textarea
                            value={newFlag.message}
                            onChange={(e) => setNewFlag(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Flag description..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-sky-500 focus:ring-sky-500"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddFlag}
                              disabled={!newFlag.message.trim() || actionLoading.addFlag}
                              className="liquid-glass-button py-2 px-4 disabled:opacity-50"
                            >
                              {actionLoading.addFlag ? 'Adding...' : 'Add Flag'}
                            </button>
                            <button
                              onClick={() => setShowAddFlag(false)}
                              className="px-4 py-2 text-slate-600 hover:text-slate-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Flags List */}
                    {user.flags.length === 0 ? (
                      <div className="text-center py-8">
                        <Flag className="mx-auto text-slate-400 mb-4" size={48} />
                        <p className="text-slate-500">No flags on this user</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {user.flags.map((flag) => (
                          <div key={flag.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={getFlagStyle(flag)}>
                                    {flag.type}
                                  </span>
                                  <span className="text-sm text-slate-500">
                                    {new Date(flag.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-900">{flag.message}</p>
                                <p className="text-sm text-slate-500 mt-1">Added by {flag.createdBy}</p>
                              </div>
                              <button
                                onClick={() => handleRemoveFlag(flag.id)}
                                disabled={actionLoading[`removeFlag-${flag.id}`]}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                {actionLoading[`removeFlag-${flag.id}`] ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <X size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}