'use client';

import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Check, Shield, Clock, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/components/legalops/theme';
import { LiquidGlassIcon } from '@/components/legalops/icons/LiquidGlassIcon';

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

export const FormWizard = ({
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
}: FormWizardProps) => {
  // Helper function for liquid glass step numbers
  const renderStepNumber = (number: number, isActive: boolean) => (
    <div 
      className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center font-semibold relative overflow-hidden',
        isActive ? 'text-white' : 'text-slate-600'
      )}
      style={{
        background: isActive 
          ? 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        boxShadow: isActive
          ? '0 6px 16px -2px rgba(14, 165, 233, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)'
          : '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.4)'
      }}
    >
      {/* Glass highlight effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%)',
          transform: 'translateY(-20%)',
        }}
      />
      <span className="relative" style={{ 
        textShadow: '0 2px 3px rgba(0,0,0,0.2)',
        fontSize: '16px'
      }}>
        {number}
      </span>
    </div>
  );
  const progress = (currentStep / steps.length) * 100;
  const isLastStep = currentStep === steps.length;

  return (
    <div className="w-full">
      {/* Progress Bar - Dashboard Style with Enhanced Visual Hierarchy */}
      <div
        className="mb-8 bg-white rounded-xl"
        style={{
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #0ea5e9',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
          padding: '20px 24px',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '6px' }}>
              Step {currentStep} of {steps.length}
            </h3>
            <p className="text-slate-600" style={{ fontSize: '14px', lineHeight: '1.5' }}>
              {steps[currentStep - 1].name} - {steps[currentStep - 1].description}
            </p>
          </div>
          <div
            className="font-semibold text-sky-600 bg-sky-50 rounded-full flex-shrink-0"
            style={{
              fontSize: '14px',
              border: '2px solid #e0f2fe',
              padding: '8px 16px',
            }}
          >
            {Math.round(progress)}% Complete
          </div>
        </div>

        {/* Progress bar - Enhanced Dashboard style */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden" style={{ boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)' }}>
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-sky-600 transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)',
            }}
          />
        </div>

        {/* Step indicators - Enhanced Dashboard card pattern */}
        <div className="flex justify-between mt-8 gap-2">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {currentStep > step.id ? (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 text-white relative overflow-hidden"
                  style={{
                    fontSize: '16px',
                    background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                    boxShadow: '0 6px 16px -2px rgba(14, 165, 233, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                >
                  {/* Glass highlight effect */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%)',
                      transform: 'translateY(-20%)',
                    }}
                  />
                  <Check className="w-5 h-5 relative" style={{
                    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))'
                  }} />
                </div>
              ) : (
                renderStepNumber(step.id, currentStep === step.id)
              )}
              <span className={cn(
                "mt-3 text-center hidden sm:block",
                currentStep >= step.id ? "text-slate-900 font-semibold" : "text-slate-500"
              )}
              style={{ fontSize: '14px' }}
              >
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Signals - Liquid Glass Style */}
      {showTrustSignals && (
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 bg-white rounded-xl"
          style={{
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
            padding: '32px',
          }}
        >
          <div className="flex items-center gap-4">
            <LiquidGlassIcon
              icon={Shield}
              category="info"
              size="lg"
            />
            <div>
              <p className="font-semibold text-slate-900" style={{ fontSize: '16px', marginBottom: '4px', lineHeight: '1.5' }}>
                100% Secure
              </p>
              <p className="text-slate-600" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Bank-level encryption
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LiquidGlassIcon
              icon={Check}
              category="success"
              size="lg"
            />
            <div>
              <p className="font-semibold text-slate-900" style={{ fontSize: '16px', marginBottom: '4px', lineHeight: '1.5' }}>
                Accuracy Guaranteed
              </p>
              <p className="text-slate-600" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                We'll fix any errors
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LiquidGlassIcon
              icon={Clock}
              category="warning"
              size="lg"
            />
            <div>
              <p className="font-semibold text-slate-900" style={{ fontSize: '16px', marginBottom: '4px', lineHeight: '1.5' }}>
                {estimatedTime}
              </p>
              <p className="text-slate-600" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Average completion time
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message - Enhanced design */}
      {error && (
        <div
          className="mb-8 bg-red-50 text-red-700 rounded-xl flex items-start gap-4"
          style={{
            border: '1px solid #fecaca',
            borderLeft: '4px solid #ef4444',
            padding: '24px',
          }}
        >
          <span className="text-2xl">⚠️</span>
          <span style={{ fontSize: '16px', lineHeight: '1.6' }}>{error}</span>
        </div>
      )}

      {/* Form Content - Enhanced Dashboard card pattern */}
      <div
        className="bg-white rounded-xl"
        style={{
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #0ea5e9',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Content area with generous padding */}
        <div style={{ padding: '48px' }}>
          {children}
        </div>

        {/* Navigation Buttons - Enhanced button styling with breathing room */}
        <div
          className="flex gap-6 bg-slate-50"
          style={{
            borderTop: '1px solid #e2e8f0',
            padding: '32px 48px',
          }}
        >
          {currentStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-3 text-slate-700 rounded-lg font-semibold transition-all duration-200 relative overflow-hidden"
              style={{
                fontSize: '16px',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.7)'
              }}
            >
              {/* Glass highlight effect */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)',
                  transform: 'translateY(-30%)',
                }}
              />
              <ChevronLeft className="w-5 h-5 relative" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }} />
              <span className="relative">Back</span>
            </button>
          )}

          {!isLastStep && (
            <button
              type="button"
              onClick={onNext}
              className="flex-1 flex items-center justify-center gap-3 text-white rounded-lg font-semibold transition-all duration-200 relative overflow-hidden"
              style={{
                fontSize: '16px',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                boxShadow: '0 6px 16px -2px rgba(14, 165, 233, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.4)'
              }}
            >
              {/* Glass highlight effect */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%)',
                  transform: 'translateY(-30%)',
                }}
              />
              <span className="relative">Continue</span>
              <ChevronRight className="w-5 h-5 relative" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }} />
            </button>
          )}

          {isLastStep && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
              style={{
                fontSize: '16px',
                padding: '16px 32px',
              }}
            >
              {loading ? 'Processing...' : 'Submit & Continue to Checkout'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

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
            <div className="cursor-help">
              <Info className="w-4 h-4 text-slate-400" />
            </div>
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
          className
        )}
        style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px', paddingBottom: '16px' }}
        {...props}
      />
      {error && (
        <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
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
            <div className="cursor-help">
              <Info className="w-4 h-4 text-slate-400" />
            </div>
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
          className
        )}
        style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px', paddingBottom: '16px' }}
        {...props}
      />
      {error && (
        <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
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
 * - H2: 24px semibold (matching dashboard)
 * - Muted description
 * - Proper spacing (mb-8)
 * - Left border accent for visual hierarchy
 */
export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-10">
      <div
        className="pb-8"
        style={{
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '32px',
        }}
      >
        <h2 className="font-semibold text-slate-900" style={{ fontSize: '24px', marginBottom: '12px', lineHeight: '1.4' }}>
          {title}
        </h2>
        {description && (
          <p className="text-slate-600" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {description}
          </p>
        )}
      </div>
      <div className="space-y-10">
        {children}
      </div>
    </div>
  );
}

