/**
 * ParagraphDisplay - Displays a paragraph with status and animation
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { Paragraph } from '../types';
import { ParagraphStatus } from '../types';
import WaveAnimator from './animations/WaveAnimator';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

export interface ParagraphDisplayProps {
  paragraph: Paragraph;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const ParagraphDisplay: React.FC<ParagraphDisplayProps> = ({
  paragraph,
  onRetry,
  onCancel,
}) => {
  // Determine background color based on status
  const getStatusColor = () => {
    switch (paragraph.status) {
      case ParagraphStatus.PENDING:
        return 'bg-card border-border';
      case ParagraphStatus.QUEUED:
        return 'bg-card border-primary/30 shadow-sm';
      case ParagraphStatus.PROCESSING:
        return 'bg-card border-primary/40';
      case ParagraphStatus.STREAMING:
        return 'bg-card border-primary shadow-glow';
      case ParagraphStatus.COMPLETE:
        return 'bg-card border-success/40 shadow-elegant';
      case ParagraphStatus.ERROR:
        return 'bg-card border-destructive/40';
      case ParagraphStatus.CANCELLED:
        return 'bg-muted border-border';
      default:
        return 'bg-card border-border';
    }
  };

  // Show loading animation for pending/processing states
  const showLoadingAnimation =
    paragraph.status === ParagraphStatus.PROCESSING ||
    paragraph.status === ParagraphStatus.QUEUED;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mb-4 p-4 rounded-lg border-2 transition-all duration-300 ${getStatusColor()}`}
    >
      {/* Header with status and actions */}
      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={paragraph.status} />

        <div className="flex items-center gap-2">
          {/* Progress indicator for streaming */}
          {paragraph.status === ParagraphStatus.STREAMING && (
            <div className="flex items-center gap-2">
              <ProgressBar progress={paragraph.progress.percentage} />
              <span className="text-xs text-gray-600 font-mono">
                {Math.round(paragraph.progress.percentage)}%
              </span>
            </div>
          )}

          {/* Action buttons */}
          {paragraph.status === ParagraphStatus.STREAMING && onCancel && (
            <button
              onClick={() => onCancel(paragraph.id)}
              className="text-xs px-2 py-1 text-destructive hover:bg-destructive/10 rounded transition-smooth border border-destructive/30"
              title="Cancel processing"
            >
              ✕ Cancel
            </button>
          )}

          {paragraph.status === ParagraphStatus.ERROR && onRetry && (
            <button
              onClick={() => onRetry(paragraph.id)}
              className="text-xs px-2 py-1 text-primary hover:bg-primary/10 rounded transition-smooth border border-primary/30"
              title="Retry processing"
            >
              ↻ Retry
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="relative">
        {/* Loading animation overlay */}
        {showLoadingAnimation && (
          <div className="absolute inset-0 bg-primary/5 rounded animate-pulse" />
        )}

        {/* Text display */}
        {paragraph.status === ParagraphStatus.PENDING ||
        paragraph.status === ParagraphStatus.QUEUED ||
        paragraph.status === ParagraphStatus.PROCESSING ? (
          // Show original text for non-streaming states
          <div className="text-foreground font-mono text-sm leading-relaxed">
            {paragraph.originalText}
          </div>
        ) : (
          // Show animated text for streaming/complete states
          <WaveAnimator
            sourceText={paragraph.originalText}
            targetText={paragraph.transformedText || paragraph.originalText}
            progress={paragraph.progress.percentage}
            isComplete={paragraph.status === ParagraphStatus.COMPLETE}
            waveState={paragraph.waveState}
          />
        )}
      </div>

      {/* Error message */}
      {paragraph.status === ParagraphStatus.ERROR && paragraph.error && (
        <div className="mt-3 p-2 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
          <div className="font-semibold">Error:</div>
          <div>{paragraph.error.message}</div>
        </div>
      )}

      {/* Processing time info */}
      {paragraph.status === ParagraphStatus.COMPLETE &&
        paragraph.processingStartedAt &&
        paragraph.completedAt && (
          <div className="mt-2 text-xs text-muted-foreground">
            Processed in{' '}
            {((paragraph.completedAt - paragraph.processingStartedAt) / 1000).toFixed(1)}s
          </div>
        )}
    </motion.div>
  );
};
