/**
 * ProfileUpdatePrompt Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Prompts users to update their profile with new form data
 */

import React, { useState } from 'react';
import { User, Check, X, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export interface ProfileUpdateSuggestion {
  fieldName: string;
  currentValue: unknown;
  newValue: unknown;
  confidence: 'high' | 'medium' | 'low';
}

export interface ProfileUpdatePromptProps {
  /** Profile update suggestions */
  suggestions: ProfileUpdateSuggestion[];
  
  /** Apply selected suggestions */
  onApply: (suggestions: ProfileUpdateSuggestion[]) => Promise<void>;
  
  /** Dismiss suggestions */
  onDismiss: (fieldNames?: string[]) => void;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Show detailed view by default */
  defaultExpanded?: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  middleName: 'Middle Name',
  phone: 'Phone Number',
  alternatePhone: 'Alternate Phone',
  personalStreet: 'Personal Address',
  personalCity: 'Personal City',
  personalState: 'Personal State',
  personalZipCode: 'Personal ZIP Code',
  mailingStreet: 'Mailing Address',
  mailingCity: 'Mailing City',
  mailingState: 'Mailing State',
  mailingZipCode: 'Mailing ZIP Code',
  businessStreet: 'Business Address',
  businessCity: 'Business City',
  businessState: 'Business State',
  businessZipCode: 'Business ZIP Code',
  companyName: 'Company Name',
  jobTitle: 'Job Title',
  industry: 'Industry',
  businessPhone: 'Business Phone',
  businessEmail: 'Business Email',
  fein: 'Federal EIN',
  businessType: 'Business Type',
};

export function ProfileUpdatePrompt({
  suggestions,
  onApply,
  onDismiss,
  isLoading = false,
  defaultExpanded = false,
}: ProfileUpdatePromptProps) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>(
    suggestions.filter(s => s.confidence === 'high').map(s => s.fieldName)
  );
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (suggestions.length === 0) {
    return null;
  }

  const handleToggleSelection = (fieldName: string) => {
    setSelectedSuggestions(prev =>
      prev.includes(fieldName)
        ? prev.filter(name => name !== fieldName)
        : [...prev, fieldName]
    );
  };

  const handleSelectAll = () => {
    setSelectedSuggestions(suggestions.map(s => s.fieldName));
  };

  const handleSelectNone = () => {
    setSelectedSuggestions([]);
  };

  const handleApply = async () => {
    const selectedSuggestionObjects = suggestions.filter(s =>
      selectedSuggestions.includes(s.fieldName)
    );
    
    if (selectedSuggestionObjects.length > 0) {
      await onApply(selectedSuggestionObjects);
    }
  };

  const handleDismiss = () => {
    onDismiss();
  };

  const handleDismissSelected = () => {
    onDismiss(selectedSuggestions);
    setSelectedSuggestions([]);
  };

  const getConfidenceColor = (confidence: ProfileUpdateSuggestion['confidence']) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-orange-600 bg-orange-100';
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') {
      return '(empty)';
    }
    return String(value);
  };

  return (
    <div className="profile-update-prompt bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
            <User className="text-blue-600" size={16} />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">Update Your Profile</h3>
            <p className="text-blue-700 text-sm mt-1">
              We noticed some information that could improve your profile. 
              Would you like to save these updates?
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Summary */}
      {!isExpanded && (
        <div className="flex items-center justify-between">
          <p className="text-blue-700 text-sm">
            {suggestions.length} field{suggestions.length !== 1 ? 's' : ''} can be updated
            {selectedSuggestions.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
                {selectedSuggestions.length} selected
              </span>
            )}
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              disabled={selectedSuggestions.length === 0 || isLoading}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : `Update ${selectedSuggestions.length}`}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1 text-blue-600 hover:text-blue-700 transition-colors text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Detailed View */}
      {isExpanded && (
        <>
          {/* Selection Controls */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-200">
            <div className="flex gap-4">
              <button
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                Select All
              </button>
              <button
                onClick={handleSelectNone}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                Select None
              </button>
            </div>
            
            <span className="text-blue-700 text-sm">
              {selectedSuggestions.length} of {suggestions.length} selected
            </span>
          </div>

          {/* Suggestions List */}
          <div className="space-y-3 mb-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.fieldName}
                className={`p-3 border rounded-lg transition-colors ${
                  selectedSuggestions.includes(suggestion.fieldName)
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <label className="flex items-center cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.includes(suggestion.fieldName)}
                      onChange={() => handleToggleSelection(suggestion.fieldName)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                  </label>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-slate-900">
                        {FIELD_LABELS[suggestion.fieldName] || suggestion.fieldName}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(suggestion.confidence)}`}>
                        {suggestion.confidence} confidence
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Current:</span>
                        <p className="text-slate-700 font-mono">
                          {formatValue(suggestion.currentValue)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">New:</span>
                        <p className="text-slate-900 font-mono font-medium">
                          {formatValue(suggestion.newValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-blue-200">
            <div className="flex gap-2">
              <button
                onClick={handleDismissSelected}
                disabled={selectedSuggestions.length === 0}
                className="px-3 py-2 text-slate-600 hover:text-slate-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Dismiss Selected
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-slate-600 hover:text-slate-700 transition-colors text-sm"
              >
                Dismiss All
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors text-sm"
              >
                Collapse
              </button>
              <button
                onClick={handleApply}
                disabled={selectedSuggestions.length === 0 || isLoading}
                className="liquid-glass-button flex items-center gap-2 py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Update Profile ({selectedSuggestions.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Privacy Notice */}
      {isExpanded && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-blue-600 mt-0.5" size={16} />
            <p className="text-blue-800 text-xs">
              Profile updates help us provide better auto-fill suggestions for future forms. 
              You can manage your privacy settings and data retention preferences in your profile settings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}