/**
 * Progress estimation utilities
 */

import type { StreamProgress } from '../types';

/**
 * Calculate estimated time remaining
 */
export const estimateTimeRemaining = (
  bytesReceived: number,
  bytesPerSecond: number,
  estimatedTotal: number
): number | null => {
  if (bytesPerSecond === 0 || estimatedTotal === 0) {
    return null;
  }

  const remaining = estimatedTotal - bytesReceived;
  return (remaining / bytesPerSecond) * 1000; // Convert to milliseconds
};

/**
 * Format time duration
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Format bytes
 */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Calculate bytes per second with smoothing
 */
export const calculateBytesPerSecond = (
  currentBps: number,
  newBps: number,
  smoothingFactor: number = 0.3
): number => {
  // Exponential moving average
  return currentBps * (1 - smoothingFactor) + newBps * smoothingFactor;
};

/**
 * Update progress with estimates
 */
export const updateProgressWithEstimates = (
  progress: StreamProgress,
  bytesReceived: number,
  elapsedTime: number
): StreamProgress => {
  const bytesPerSecond = elapsedTime > 0 ? bytesReceived / (elapsedTime / 1000) : 0;

  // Smooth bytes per second
  const smoothedBps = progress.bytesPerSecond
    ? calculateBytesPerSecond(progress.bytesPerSecond, bytesPerSecond)
    : bytesPerSecond;

  // Estimate total if we have a current percentage
  const estimatedTotal =
    progress.percentage > 0 ? (bytesReceived / progress.percentage) * 100 : null;

  // Estimate time remaining
  const timeRemaining =
    estimatedTotal && smoothedBps > 0
      ? estimateTimeRemaining(bytesReceived, smoothedBps, estimatedTotal)
      : null;

  return {
    ...progress,
    current: bytesReceived,
    bytesPerSecond: smoothedBps,
    estimatedTimeRemaining: timeRemaining,
    total: estimatedTotal,
  };
};
