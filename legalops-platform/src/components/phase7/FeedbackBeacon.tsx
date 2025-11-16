/**
 * FeedbackBeacon Component
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Collects user feedback on clarity and usability
 * "Was this clear?" prompt after key interactions
 */

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';

export interface FeedbackBeaconProps {
  /** Unique identifier for this feedback point */
  feedbackId: string;
  
  /** Question to ask user */
  question?: string;
  
  /** Position on screen */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  /** Auto-show after delay (ms) */
  autoShowDelay?: number;
  
  /** Callback when feedback is submitted */
  onFeedback?: (feedbackId: string, positive: boolean, comment?: string) => void;
}

export function FeedbackBeacon({
  feedbackId,
  question = 'Was this clear?',
  position = 'bottom-right',
  autoShowDelay,
  onFeedback,
}: FeedbackBeaconProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Auto-show after delay
  React.useEffect(() => {
    if (autoShowDelay) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, autoShowDelay);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [autoShowDelay]);
  
  const handleFeedback = async (positive: boolean) => {
    // If negative feedback, expand to collect comment
    if (!positive && !isExpanded) {
      setIsExpanded(true);
      return;
    }
    
    // Submit feedback
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId,
          positive,
          comment: comment || undefined,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        }),
      });
      
      if (onFeedback) {
        onFeedback(feedbackId, positive, comment || undefined);
      }
      
      setSubmitted(true);
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };
  
  if (!isVisible) return null;
  
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };
  
  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 transition-all`}
      style={{
        maxWidth: isExpanded ? '400px' : '300px',
      }}
    >
      <div
        className="bg-white rounded-lg shadow-lg border border-slate-200"
        style={{ padding: '16px' }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close feedback"
        >
          <X size={16} />
        </button>
        
        {submitted ? (
          /* Thank You Message */
          <div className="text-center py-2">
            <p className="text-emerald-600 font-medium">
              Thank you for your feedback!
            </p>
          </div>
        ) : (
          <>
            {/* Question */}
            <p className="text-sm font-medium text-slate-900 mb-3 pr-6">
              {question}
            </p>
            
            {!isExpanded ? (
              /* Thumbs Up/Down Buttons */
              <div className="flex gap-2">
                <button
                  onClick={() => handleFeedback(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-all"
                >
                  <ThumbsUp size={18} />
                  <span className="text-sm font-medium">Yes</span>
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <ThumbsDown size={18} />
                  <span className="text-sm font-medium">No</span>
                </button>
              </div>
            ) : (
              /* Comment Form */
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What could we improve?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none mb-3"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFeedback(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-all"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Feedback API endpoint handler
 * Save to database or analytics service
 */
export async function saveFeedback(data: {
  feedbackId: string;
  positive: boolean;
  comment?: string;
  timestamp: string;
  url: string;
}) {
  // TODO: Save to database
  console.log('Feedback received:', data);

  // Example: Send to analytics
  if (typeof window !== 'undefined' && (window as Record<string, unknown>).gtag) {
    (window as Record<string, unknown>).gtag('event', 'feedback', {
      feedback_id: data.feedbackId,
      feedback_type: data.positive ? 'positive' : 'negative',
      feedback_comment: data.comment,
      page_url: data.url,
    });
  }
}

