'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  estimatedTime?: string;
}

interface DocumentWizardProps {
  steps: WizardStep[];
  currentStepIndex: number;
  onStepChange: (stepIndex: number) => void;
  onSave: (stepId: string, data: Record<string, unknown>) => Promise<void>;
  onComplete: () => void;
  formData: Record<string, unknown>;
  onFormDataChange: (stepId: string, data: Record<string, unknown>) => void;
  autoSaveEnabled?: boolean;
}

export default function DocumentWizard({
  steps,
  currentStepIndex,
  onStepChange,
  onSave,
  onComplete,
  formData,
  onFormDataChange,
  autoSaveEnabled = true,
}: DocumentWizardProps) {
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const completedSteps = currentStepIndex;
  const totalSteps = steps.length;

  // Auto-save effect - saves 1 second after user stops typing
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const currentData = JSON.stringify(formData[currentStep.id] || {});

    // Only save if data has changed
    if (currentData === lastSavedDataRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set saving status
    setSaveStatus('saving');

    // Set new timeout to save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await onSave(currentStep.id, formData[currentStep.id] || {});
        lastSavedDataRef.current = currentData;
        setSaveStatus('saved');

        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 1000);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, currentStep.id, onSave, autoSaveEnabled]);

  const handleNext = async () => {
    // Ensure current data is saved before moving
    if (autoSaveEnabled && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      await onSave(currentStep.id, formData[currentStep.id] || {});
    }

    if (!isLastStep) {
      onStepChange(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange(currentStepIndex - 1);
    }
  };

  return (
    <div className="w-full">
      {/* Step Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    index < currentStepIndex
                      ? 'bg-green-500 text-white'
                      : index === currentStepIndex
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                  style={{
                    border: index === currentStepIndex ? '3px solid #9333ea' : 'none',
                    boxShadow: index === currentStepIndex ? '0 0 0 4px rgba(147, 51, 234, 0.2)' : 'none',
                  }}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className="flex-1 h-1 mx-2"
                  style={{
                    background: index < currentStepIndex
                      ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                      : '#d1d5db',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex items-start justify-between">
          {steps.map((step, index) => (
            <div
              key={`label-${step.id}`}
              className="flex-1 text-center"
              style={{ maxWidth: `${100 / steps.length}%` }}
            >
              <p
                className={`text-sm font-semibold ${
                  index === currentStepIndex ? 'text-purple-700' : 'text-gray-600'
                }`}
              >
                {step.title}
              </p>
              {step.estimatedTime && index === currentStepIndex && (
                <p className="text-xs text-gray-500 mt-1">{step.estimatedTime}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div
        className="rounded-xl mb-6"
        style={{
          padding: '32px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '3px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          minHeight: '400px',
        }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStep.title}</h2>
          {currentStep.description && (
            <p className="text-gray-600">{currentStep.description}</p>
          )}
        </div>

        {/* Step Component */}
        <div>{currentStep.component}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between" style={{ marginTop: '32px' }}>
        <button
          onClick={handlePrevious}
          disabled={isFirstStep}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            isFirstStep
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
          }`}
          style={{ padding: '12px 24px' }}
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="flex items-center gap-4">
          {/* Auto-save Status Indicator */}
          {autoSaveEnabled && saveStatus !== 'idle' && (
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-600">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">All changes saved</span>
                </>
              )}
              {saveStatus === 'error' && (
                <span className="text-sm text-red-600">Failed to save</span>
              )}
            </div>
          )}

          {/* Next/Complete Button */}
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
          >
            {isLastStep ? 'Complete' : 'Next'}
            {!isLastStep && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Step {currentStepIndex + 1} of {totalSteps} •{' '}
          {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}% complete
        </p>
      </div>
    </div>
  );
}

