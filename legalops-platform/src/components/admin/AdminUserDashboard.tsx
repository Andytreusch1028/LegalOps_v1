/**
 * AdminUserDashboard Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Administrative dashboard for user management and oversight
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  UserX, 
  UserCheck, 
  Key, 
  AlertTriangle,
  Download,
  Calendar,
  Mail,
  Phone,
  Building
} from 'lucide-react';

export interface AdminUserDashboardProps {
  /** User search and filter handler */
  onSearchUsers: (query: string, filters: UserFilters) => Promise<UserSearchResult>;
  
  /** User action handlers */
  onViewUser: (userId: string) => void;
  onToggleUserStatus: (userId: string, enabled: boolean) => Promise<void>;
  onResetPassword: (userId: string) => Promise<void>;
  onExportUserData: (userId: string) => Promise<void>;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Error message */
  error?: string;
}

export interface User {
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
  totalOrders: number;
  totalSpent: number;
  flags: UserFlag[];
}

export interface UserFlag {
  id: string;
  type: 'security' | 'compliance' | 'support' | 'billing';
  severity: 'info' | 'warning' | 'error';
  message: string;
  createdAt: string;
}

export interface UserFilters {
  status?: 'all' | 'active' | 'disabled' | 'unverified';
  riskLevel?: 'all' | 'low' | 'medium' | 'high' | 'critical';
  registrationDate?: {
    from?: string;
    to?: string;
  };
  lastActivity?: {
    from?: string;
    to?: string;
  };
  hasOrders?: boolean;
  hasFlags?: boolean;
}

export interface UserSearchResult {
  users: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const INITIAL_FILTERS: UserFilters = {
  status: 'all',
  riskLevel: 'all',
  hasOrders: undefined,
  hasFlags: undefined,
};

export function AdminUserDashboard({
  onSearchUsers,
  onViewUser,
  onToggleUserStatus,
  onResetPassword,
  onExportUserData,
  isLoading = false,
  error,
}: AdminUserDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Search users
  const searchUsers = useCallback(async (query = searchQuery, userFilters = filters, page = 1) => {
    try {
      const result = await onSearchUsers(query, userFilters);
      setSearchResult(result);
    } catch (err) {
      console.error('Failed to search users:', err);
    }
  }, [searchQuery, filters, onSearchUsers]);

  // Initial load
  useEffect(() => {
    searchUsers();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers();
  };

  // Handle filter change
  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    searchUsers(searchQuery, newFilters);
  };

  // Handle user action with loading state
  const handleUserAction = async (userId: string, action: () => Promise<void>) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await action();
      // Refresh search results
      await searchUsers();
    } catch (err) {
      console.error('User action failed:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all users
  const selectAllUsers = () => {
    if (searchResult) {
      setSelectedUsers(searchResult.users.map(user => user.id));
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // Get risk level styling
  const getRiskLevelStyle = (riskLevel: User['riskLevel']) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'critical':
        return 'bg-red-100 text-red-700';
    }
  };

  // Get flag styling
  const getFlagStyle = (flag: UserFlag) => {
    const baseStyle = 'px-2 py-1 text-xs rounded-full';
    switch (flag.severity) {
      case 'info':
        return `${baseStyle} bg-blue-100 text-blue-700`;
      case 'warning':
        return `${baseStyle} bg-yellow-100 text-yellow-700`;
      case 'error':
        return `${baseStyle} bg-red-100 text-red-700`;
    }
  };

  return (
    <div className="admin-user-dashboard max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">User Management</h1>
        <p className="text-slate-600">Manage user accounts, permissions, and security settings</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="text-red-500 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="liquid-glass-card mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:border-sky-500 focus:ring-sky-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
              showFilters ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <Filter size={20} />
            Filters
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="liquid-glass-button flex items-center gap-2 py-3 px-6 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={16} />
            )}
            Search
          </button>
        </form>

        {/* Filter Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-sky-500 focus:ring-sky-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Risk Level</label>
                <select
                  value={filters.riskLevel}
                  onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-sky-500 focus:ring-sky-500"
                >
                  <option value="all">All Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasOrders === true}
                    onChange={(e) => handleFilterChange('hasOrders', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">Has Orders</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasFlags === true}
                    onChange={(e) => handleFilterChange('hasFlags', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">Has Flags</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary and Bulk Actions */}
      {searchResult && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <p className="text-slate-600">
              {searchResult.totalCount} user{searchResult.totalCount !== 1 ? 's' : ''} found
            </p>
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">
                  {selectedUsers.length} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-sky-600 hover:text-sky-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {searchResult.users.length > 0 && (
              <button
                onClick={selectAllUsers}
                className="text-sm text-sky-600 hover:text-sky-700 transition-colors"
              >
                Select All
              </button>
            )}
          </div>
        </div>
      )}

      {/* User List */}
      {searchResult && (
        <div className="liquid-glass-card">
          {searchResult.users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-500">No users found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === searchResult.users.length}
                        onChange={selectedUsers.length === searchResult.users.length ? clearSelection : selectAllUsers}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">User</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Risk Level</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Activity</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Orders</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResult.users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                        />
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                            <span className="text-slate-600 font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Mail size={14} />
                              {user.email}
                              {user.emailVerified && (
                                <span className="text-green-600">✓</span>
                              )}
                            </div>
                            {user.flags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {user.flags.slice(0, 2).map((flag) => (
                                  <span key={flag.id} className={getFlagStyle(flag)}>
                                    {flag.type}
                                  </span>
                                ))}
                                {user.flags.length > 2 && (
                                  <span className="text-xs text-slate-500">
                                    +{user.flags.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            user.enabled ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm">
                            {user.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Profile: {user.profileCompletionPercentage}%
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRiskLevelStyle(user.riskLevel)}`}>
                          {user.riskLevel.charAt(0).toUpperCase() + user.riskLevel.slice(1)}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-600">
                          {user.lastLoginAt ? (
                            <>
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(user.lastLoginAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {new Date(user.lastLoginAt).toLocaleTimeString()}
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-400">Never</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="text-slate-900 font-medium">
                            {user.totalOrders} orders
                          </div>
                          <div className="text-slate-500">
                            ${user.totalSpent.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewUser(user.id)}
                            className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleUserAction(user.id, () => onToggleUserStatus(user.id, !user.enabled))}
                            disabled={actionLoading[user.id]}
                            className={`p-2 rounded transition-colors ${
                              user.enabled
                                ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                            title={user.enabled ? 'Disable User' : 'Enable User'}
                          >
                            {actionLoading[user.id] ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : user.enabled ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleUserAction(user.id, () => onResetPassword(user.id))}
                            disabled={actionLoading[user.id]}
                            className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Reset Password"
                          >
                            <Key size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleUserAction(user.id, () => onExportUserData(user.id))}
                            disabled={actionLoading[user.id]}
                            className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Export Data"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {searchResult && searchResult.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-600">
            Showing {((searchResult.page - 1) * searchResult.pageSize) + 1} to{' '}
            {Math.min(searchResult.page * searchResult.pageSize, searchResult.totalCount)} of{' '}
            {searchResult.totalCount} results
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => searchUsers(searchQuery, filters, searchResult.page - 1)}
              disabled={searchResult.page <= 1 || isLoading}
              className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-slate-600">
              Page {searchResult.page} of {searchResult.totalPages}
            </span>
            
            <button
              onClick={() => searchUsers(searchQuery, filters, searchResult.page + 1)}
              disabled={searchResult.page >= searchResult.totalPages || isLoading}
              className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}