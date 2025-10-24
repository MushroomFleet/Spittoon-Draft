/**
 * Retry and backoff utilities
 */

import type { ProcessingError } from '../types';
import { ErrorType } from '../types';

/**
 * Calculate retry delay with exponential backoff
 */
export const calculateRetryDelay = (
  baseDelay: number,
  retryCount: number,
  maxDelay: number = 30000
): number => {
  const delay = baseDelay * Math.pow(2, retryCount);
  return Math.min(delay, maxDelay);
};

/**
 * Check if error should be retried
 */
export const shouldRetry = (error: ProcessingError, maxRetries: number): boolean => {
  // Don't retry if not retryable
  if (!error.isRetryable) {
    return false;
  }

  // Don't retry if max retries reached
  if (error.retryCount >= maxRetries) {
    return false;
  }

  // Don't retry auth errors
  if (error.type === ErrorType.AUTH_ERROR) {
    return false;
  }

  // Don't retry config errors
  if (error.type === ErrorType.CONFIG_ERROR) {
    return false;
  }

  return true;
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: ProcessingError): string => {
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again.';

    case ErrorType.AUTH_ERROR:
      return 'Authentication failed. Please check your API key in settings.';

    case ErrorType.RATE_LIMIT_ERROR:
      return 'Rate limit exceeded. Please wait a moment and try again.';

    case ErrorType.TIMEOUT_ERROR:
      return 'Request timed out. Please try again.';

    case ErrorType.API_ERROR:
      return 'API error occurred. Please try again.';

    case ErrorType.CONFIG_ERROR:
      return 'Configuration error. Please check your settings.';

    case ErrorType.PARSE_ERROR:
      return 'Failed to process response. Please try again.';

    default:
      return error.message || 'An error occurred. Please try again.';
  }
};

/**
 * Add jitter to delay to prevent thundering herd
 */
export const addJitter = (delay: number, jitterFactor: number = 0.1): number => {
  const jitter = delay * jitterFactor * Math.random();
  return delay + jitter;
};
