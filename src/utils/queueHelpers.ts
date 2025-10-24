/**
 * Queue management utilities
 */

import type { QueueState, QueueItem } from '../types';

/**
 * Sort queue items by priority (highest first) then timestamp (oldest first)
 */
export const sortQueueItems = (items: QueueItem[]): QueueItem[] => {
  return [...items].sort((a, b) => {
    // First by priority (descending)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    // Then by timestamp (ascending - oldest first)
    return a.timestamp - b.timestamp;
  });
};

/**
 * Get next items to process based on available slots
 */
export const getNextItemsToProcess = (
  queue: QueueState,
  availableSlots: number
): QueueItem[] => {
  const sorted = sortQueueItems(queue.items);
  return sorted.slice(0, availableSlots);
};

/**
 * Check if queue has capacity for more items
 */
export const hasQueueCapacity = (queue: QueueState): boolean => {
  return queue.activeCount < queue.maxConcurrent;
};

/**
 * Get available processing slots
 */
export const getAvailableSlots = (queue: QueueState): number => {
  return Math.max(0, queue.maxConcurrent - queue.activeCount);
};

/**
 * Calculate average processing time
 */
export const calculateAverageProcessingTime = (
  currentAverage: number,
  totalProcessed: number,
  newProcessingTime: number
): number => {
  if (totalProcessed === 0) return newProcessingTime;
  
  const totalTime = currentAverage * totalProcessed;
  return (totalTime + newProcessingTime) / (totalProcessed + 1);
};
