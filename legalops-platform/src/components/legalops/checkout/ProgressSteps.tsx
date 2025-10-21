import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../theme';

export interface Step {
  id: string;
  label: string;
  description?: string;
}

export interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({ steps, currentStep, className }: ProgressStepsProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200',
                    isCompleted && 'bg-emerald-500 text-white',
                    isCurrent && 'bg-sky-500 text-white ring-4 ring-sky-100',
                    isUpcoming && 'bg-slate-200 text-slate-500'
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <div
                    className={cn(
                      'text-sm font-medium transition-colors',
                      (isCompleted || isCurrent) && 'text-slate-900',
                      isUpcoming && 'text-slate-500'
                    )}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-slate-500 mt-1 hidden sm:block">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mb-8">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      stepNumber < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

