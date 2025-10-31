/**
 * Wizard Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Multi-step wizard with progress tracking and breadcrumbs
 * Used for Smart Forms and checkout flows
 */

import React, { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface WizardStep {
  /** Unique step identifier */
  id: string;
  
  /** Step title */
  title: string;
  
  /** Optional: Step description */
  description?: string;
  
  /** Optional: Icon component */
  icon?: ReactNode;
  
  /** Optional: Validation function */
  validate?: () => boolean | Promise<boolean>;
}

export interface WizardProps {
  /** Array of wizard steps */
  steps: WizardStep[];
  
  /** Current step index (0-based) */
  current: number;
  
  /** Callback when moving to next step */
  onNext: () => void;
  
  /** Callback when moving to previous step */
  onBack: () => void;
  
  /** Optional: Callback when wizard is completed */
  onComplete?: () => void;
  
  /** Optional: Show progress bar */
  showProgress?: boolean;
  
  /** Optional: Show breadcrumbs */
  showBreadcrumbs?: boolean;
  
  /** Optional: Children (step content) */
  children?: ReactNode;
  
  /** Optional: Additional CSS classes */
  className?: string;
}

export function Wizard({
  steps,
  current,
  onNext,
  onBack,
  onComplete,
  showProgress = true,
  showBreadcrumbs = true,
  children,
  className = '',
}: WizardProps) {
  const currentStep = steps[current];
  const isFirstStep = current === 0;
  const isLastStep = current === steps.length - 1;
  const progress = ((current + 1) / steps.length) * 100;
  
  const handleNext = async () => {
    // Validate current step if validation function exists
    if (currentStep.validate) {
      const isValid = await currentStep.validate();
      if (!isValid) return;
    }
    
    if (isLastStep && onComplete) {
      onComplete();
    } else {
      onNext();
    }
  };
  
  return (
    <div className={`wizard ${className}`}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">
              Step {current + 1} of {steps.length}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div
            className="h-2 bg-slate-200 rounded-full overflow-hidden"
            style={{ width: '100%' }}
          >
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <div className="mb-8">
          <nav className="flex items-center gap-2 overflow-x-auto">
            {steps.map((step, index) => {
              const isActive = index === current;
              const isCompleted = index < current;
              
              return (
                <React.Fragment key={step.id}>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 font-semibold'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={16} className="text-emerald-500" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                    <span className="text-sm whitespace-nowrap">{step.title}</span>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      )}
      
      {/* Step Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {currentStep.title}
        </h2>
        {currentStep.description && (
          <p className="text-slate-600">{currentStep.description}</p>
        )}
      </div>
      
      {/* Step Content */}
      <div className="wizard-content mb-8">
        {children}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-600 transition-all liquid-glass-button"
        >
          {isLastStep ? 'Complete' : 'Next'}
          {!isLastStep && <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
}

/**
 * Wizard Step Container
 * Wraps individual step content
 */
export interface WizardStepContainerProps {
  children: ReactNode;
  className?: string;
}

export function WizardStepContainer({
  children,
  className = '',
}: WizardStepContainerProps) {
  return (
    <div className={`liquid-glass-card ${className}`} style={{ padding: '32px' }}>
      {children}
    </div>
  );
}

