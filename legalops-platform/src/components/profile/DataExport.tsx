/**
 * DataExport Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * GDPR-compliant data export component
 */

import React, { useState } from 'react';
import { Download, FileText, Calendar, CheckCircle, AlertCircle, Clock, Archive } from 'lucide-react';

export interface DataExportProps {
  /** Available export types */
  exportTypes: ExportType[];
  
  /** Export request handler */
  onRequestExport: (request: ExportRequest) => Promise<void>;
  
  /** Previous export requests */
  previousExports?: ExportHistory[];
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Form-level error message */
  error?: string;
  
  /** Success callback */
  onSuccess?: () => void;
}

export interface ExportType {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  estimatedSize: string;
  processingTime: string;
  format: 'json' | 'csv' | 'pdf' | 'zip';
}

export interface ExportRequest {
  exportTypes: string[];
  format: 'json' | 'csv' | 'pdf' | 'zip';
  dateRange?: {
    from: string;
    to: string;
  };
  includeDeleted: boolean;
  reason: string;
}

export interface ExportHistory {
  id: string;
  requestedAt: string;
  completedAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  exportTypes: string[];
  format: string;
  fileSize?: string;
  downloadUrl?: string;
  expiresAt?: string;
  reason: string;
}

const DEFAULT_EXPORT_TYPES: ExportType[] = [
  {
    id: 'profile',
    name: 'Profile Data',
    description: 'Personal information, contact details, and preferences',
    dataTypes: ['Personal Info', 'Contact Details', 'Preferences', 'Settings'],
    estimatedSize: '< 1 MB',
    processingTime: '< 1 minute',
    format: 'json',
  },
  {
    id: 'forms',
    name: 'Form Data',
    description: 'All completed forms and their submissions',
    dataTypes: ['Completed Forms', 'Form Submissions', 'Form History'],
    estimatedSize: '1-5 MB',
    processingTime: '2-5 minutes',
    format: 'json',
  },
  {
    id: 'drafts',
    name: 'Draft Data',
    description: 'Saved form drafts and auto-fill data',
    dataTypes: ['Form Drafts', 'Auto-fill Data', 'Saved Progress'],
    estimatedSize: '< 1 MB',
    processingTime: '< 1 minute',
    format: 'json',
  },
  {
    id: 'activity',
    name: 'Activity Logs',
    description: 'Account activity, login history, and audit logs',
    dataTypes: ['Login History', 'Activity Logs', 'Security Events'],
    estimatedSize: '1-2 MB',
    processingTime: '1-2 minutes',
    format: 'csv',
  },
  {
    id: 'communications',
    name: 'Communications',
    description: 'Email history, notifications, and support conversations',
    dataTypes: ['Email History', 'Notifications', 'Support Tickets'],
    estimatedSize: '< 1 MB',
    processingTime: '< 1 minute',
    format: 'json',
  },
];

const EXPORT_REASONS = [
  'Personal backup',
  'Data portability',
  'Legal compliance',
  'Account migration',
  'Privacy audit',
  'Other',
];

export function DataExport({
  exportTypes = DEFAULT_EXPORT_TYPES,
  onRequestExport,
  previousExports = [],
  isLoading = false,
  error,
  onSuccess,
}: DataExportProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [format, setFormat] = useState<'json' | 'csv' | 'pdf' | 'zip'>('json');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: new Date().toISOString().split('T')[0],
  });
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTypes.length === 0) {
      return;
    }
    
    const request: ExportRequest = {
      exportTypes: selectedTypes,
      format,
      dateRange: dateRange.from ? dateRange : undefined,
      includeDeleted,
      reason: reason === 'Other' ? customReason : reason,
    };
    
    try {
      await onRequestExport(request);
      // Reset form
      setSelectedTypes([]);
      setReason('');
      setCustomReason('');
      setDateRange({ from: '', to: new Date().toISOString().split('T')[0] });
      setIncludeDeleted(false);
      onSuccess?.();
    } catch (err) {
      // Error handling is managed by parent component
    }
  };

  const toggleExportType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const selectAllTypes = () => {
    setSelectedTypes(exportTypes.map(type => type.id));
  };

  const clearSelection = () => {
    setSelectedTypes([]);
  };

  const getEstimatedSize = () => {
    if (selectedTypes.length === 0) return '0 MB';
    
    // Simple estimation based on selected types
    const totalSizeEstimate = selectedTypes.reduce((total, typeId) => {
      const type = exportTypes.find(t => t.id === typeId);
      if (!type) return total;
      
      const sizeMatch = type.estimatedSize.match(/(\d+)/);
      const size = sizeMatch ? parseInt(sizeMatch[1]) : 1;
      return total + size;
    }, 0);
    
    return `~${totalSizeEstimate} MB`;
  };

  const getEstimatedTime = () => {
    if (selectedTypes.length === 0) return '0 minutes';
    
    const maxTime = selectedTypes.reduce((max, typeId) => {
      const type = exportTypes.find(t => t.id === typeId);
      if (!type) return max;
      
      const timeMatch = type.processingTime.match(/(\d+)/);
      const time = timeMatch ? parseInt(timeMatch[1]) : 1;
      return Math.max(max, time);
    }, 0);
    
    return `~${maxTime} minutes`;
  };

  const getStatusIcon = (status: ExportHistory['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'failed':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'processing':
        return <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />;
      case 'expired':
        return <Clock className="text-slate-400" size={20} />;
      default:
        return <Clock className="text-yellow-600" size={20} />;
    }
  };

  const getStatusLabel = (status: ExportHistory['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
      case 'expired':
        return 'Expired';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="data-export max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Export Your Data</h1>
        <p className="text-slate-600">Download a copy of your personal data in compliance with GDPR</p>
      </div>

      {/* Form Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Export Request Failed</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Export Request Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="liquid-glass-card">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Request Data Export</h2>

            {/* Data Types Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-900">Select Data Types</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllTypes}
                    className="text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-slate-600 hover:text-slate-700 text-sm font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {exportTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTypes.includes(type.id)
                        ? 'border-sky-200 bg-sky-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type.id)}
                        onChange={() => toggleExportType(type.id)}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{type.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>{type.estimatedSize}</span>
                            <span>{type.processingTime}</span>
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm mb-2">{type.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {type.dataTypes.map((dataType) => (
                            <span
                              key={dataType}
                              className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                            >
                              {dataType}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Export Format</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['json', 'csv', 'pdf', 'zip'] as const).map((formatOption) => (
                  <label
                    key={formatOption}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      format === formatOption
                        ? 'border-sky-200 bg-sky-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={formatOption}
                      checked={format === formatOption}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="w-4 h-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                    />
                    <span className="font-medium text-slate-900 uppercase">{formatOption}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason for Export */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Reason for Export</h3>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-sky-500 focus:ring-sky-500"
              >
                <option value="">Select a reason</option>
                {EXPORT_REASONS.map((reasonOption) => (
                  <option key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </option>
                ))}
              </select>
              
              {reason === 'Other' && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please specify your reason for requesting this data export"
                  required
                  className="w-full mt-3 px-4 py-3 border border-slate-300 rounded-lg focus:border-sky-500 focus:ring-sky-500"
                  rows={3}
                />
              )}
            </div>

            {/* Advanced Options */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-700 transition-colors"
              >
                <span>Advanced Options</span>
                <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {showAdvanced && (
                <div className="mt-4 p-4 border border-slate-200 rounded-lg space-y-4">
                  {/* Date Range */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Date Range (Optional)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">From</label>
                        <input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
                        <input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Include Deleted Data */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDeleted}
                      onChange={(e) => setIncludeDeleted(e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                    <div>
                      <span className="text-slate-700 font-medium">Include deleted data</span>
                      <p className="text-slate-500 text-sm">Include data that has been marked for deletion</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                {selectedTypes.length > 0 && (
                  <>
                    Estimated size: {getEstimatedSize()} • Processing time: {getEstimatedTime()}
                  </>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isLoading || selectedTypes.length === 0 || !reason}
                className="liquid-glass-button flex items-center gap-2 py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Request Export
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Export History */}
        <div className="lg:col-span-1">
          <div className="liquid-glass-card">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Export History</h2>

            {previousExports.length === 0 ? (
              <div className="text-center py-8">
                <Archive className="mx-auto text-slate-400 mb-4" size={48} />
                <p className="text-slate-500">No previous exports</p>
              </div>
            ) : (
              <div className="space-y-4">
                {previousExports.map((exportItem) => (
                  <div key={exportItem.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(exportItem.status)}
                        <span className="font-medium text-slate-900">
                          {getStatusLabel(exportItem.status)}
                        </span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {new Date(exportItem.requestedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-slate-600">
                        <span className="font-medium">Types:</span> {exportItem.exportTypes.join(', ')}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium">Format:</span> {exportItem.format.toUpperCase()}
                      </p>
                      {exportItem.fileSize && (
                        <p className="text-slate-600">
                          <span className="font-medium">Size:</span> {exportItem.fileSize}
                        </p>
                      )}
                      <p className="text-slate-600">
                        <span className="font-medium">Reason:</span> {exportItem.reason}
                      </p>
                    </div>

                    {exportItem.status === 'completed' && exportItem.downloadUrl && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <a
                          href={exportItem.downloadUrl}
                          className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium transition-colors"
                        >
                          <Download size={16} />
                          Download
                        </a>
                        {exportItem.expiresAt && (
                          <p className="text-xs text-slate-500 mt-1">
                            Expires: {new Date(exportItem.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GDPR Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Your Rights</h3>
            <p className="text-blue-800 text-sm">
              Under GDPR, you have the right to access, rectify, erase, restrict processing, 
              and port your personal data. This export tool helps you exercise your right to data portability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}