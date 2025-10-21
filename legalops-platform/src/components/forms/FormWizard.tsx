'use client';

import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Check, Shield, Clock } from 'lucide-react';
import { cn } from '@/components/legalops/theme';

/**
 * FormWizard - Reusable Multi-Step Form Component
 * 
 * Follows LegalOps design guidelines from:
 * - DESIGN_BRIEF_FOR_CHATGPT.md
 * - DESIGN_BRIEF_TECHNICAL_DETAILS.md
 * - docs/legalops-ui-guide.md
 * 
 * Design Principles:
 * - Sky blue primary (#0ea5e9)
 * - 24px spacing system
 * - Dashboard card patterns
 * - Visible input borders
 * - Progress indicators
 * - Trust signals
 * - Inline validation
 */

export interface WizardStep {
  id: number;
  name: string;
  description: string;
}

export interface FormWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  loading?: boolean;
  error?: string | null;
  children: ReactNode;
  showTrustSignals?: boolean;
  estimatedTime?: string;
}

export function FormWizard({
  steps,
  currentStep,
  onNext,
  onBack,
  onSubmit,
  loading = false,
  error = null,
  children,
  showTrustSignals = true,
  estimatedTime = '5-10 Minutes',
}: FormWizardProps) {
  const progress = (currentStep / steps.length) * 100;
  const isLastStep = currentStep === steps.length;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Step {currentStep} of {steps.length}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {steps[currentStep - 1].name} - {steps[currentStep - 1].description}
            </p>
          </div>
          <div className="text-sm font-medium text-sky-600">
            {Math.round(progress)}% Complete
          </div>
        </div>
        
        {/* Progress bar - Dashboard style */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 to-sky-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators - Dashboard card pattern */}
        <div className="flex justify-between mt-6">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                currentStep > step.id 
                  ? "bg-sky-500 text-white" 
                  : currentStep === step.id
                  ? "bg-sky-500 text-white ring-4 ring-sky-100"
                  : "bg-slate-200 text-slate-500"
              )}>
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span className={cn(
                "text-xs mt-2 text-center hidden sm:block",
                currentStep >= step.id ? "text-slate-900 font-medium" : "text-slate-500"
              )}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Signals - Design guideline: Build trust with users */}
      {showTrustSignals && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-100">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">100% Secure</p>
              <p className="text-xs text-slate-600">Bank-level encryption</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Accuracy Guaranteed</p>
              <p className="text-xs text-slate-600">We'll fix any errors</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{estimatedTime}</p>
              <p className="text-xs text-slate-600">Average completion time</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message - Design guideline: Clear error states */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form Content - Dashboard card pattern with generous spacing */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        {/* Content area with proper padding */}
        <div className="p-8 md:p-12">
          {children}
        </div>

        {/* Navigation Buttons - Design guideline: Proper button styling */}
        <div className="flex gap-6 px-8 md:px-12 py-8 border-t border-slate-200 bg-slate-50">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-white hover:border-slate-400 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          {!isLastStep && (
            <button
              type="button"
              onClick={onNext}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-all duration-200 px-8 py-4 shadow-sm hover:shadow-md"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {isLastStep && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 px-8 py-4 shadow-sm hover:shadow-md"
            >
              {loading ? 'Processing...' : 'Submit & Continue to Checkout'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * FormInput - Standardized input following design guidelines
 * 
 * Design specs:
 * - Visible border: border-gray-300
 * - Proper padding: px-4 py-4 (16px)
 * - Clear focus state: focus:ring-2 focus:ring-sky-500
 * - Smooth transitions
 */
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  tooltip?: string;
}

export function FormInput({ label, error, tooltip, required, className, ...props }: FormInputProps) {
  return (
    <div className="mb-6">
      <label className="block text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
        {label} {required && <span className="text-red-500">*</span>}
        {tooltip && (
          <div className="group relative">
            <span className="w-4 h-4 text-slate-400 cursor-help">ⓘ</span>
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-4 bg-slate-900 text-white text-sm rounded-lg shadow-lg z-10">
              {tooltip}
            </div>
          </div>
        )}
      </label>
      <input
        className={cn(
          "w-full border-2 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-base transition-all",
          error ? "border-red-500" : "border-gray-300",
          "px-5 py-4",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * FormTextArea - Standardized textarea following design guidelines
 */
export interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  tooltip?: string;
}

export function FormTextArea({ label, error, tooltip, required, className, ...props }: FormTextAreaProps) {
  return (
    <div className="mb-6">
      <label className="block text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
        {label} {required && <span className="text-red-500">*</span>}
        {tooltip && (
          <div className="group relative">
            <span className="w-4 h-4 text-slate-400 cursor-help">ⓘ</span>
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-4 bg-slate-900 text-white text-sm rounded-lg shadow-lg z-10">
              {tooltip}
            </div>
          </div>
        )}
      </label>
      <textarea
        className={cn(
          "w-full border-2 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-base transition-all resize-none",
          error ? "border-red-500" : "border-gray-300",
          "px-5 py-4",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * FormSection - Section header following design guidelines
 * 
 * Design specs:
 * - H2: 24px semibold (text-2xl)
 * - Muted description
 * - Proper spacing (mb-8)
 */
export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-10">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-3">{title}</h2>
        {description && <p className="text-base text-slate-600">{description}</p>}
      </div>
      <div className="space-y-8">
        {children}
      </div>
    </div>
  );
}

