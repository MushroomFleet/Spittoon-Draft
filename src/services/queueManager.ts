/**
 * QueueManager handles concurrent stream processing
 * Manages multiple StreamProcessors with priority queue
 */

import { useEditorStore } from '../store/editorStore';
import { StreamProcessor } from './streamProcessor';
import type { StreamCallbacks } from './streamProcessor';
import type { ParagraphId, ProcessingError, CharacterTransition } from '../types';
import { ParagraphStatus } from '../types';
import { buildEnhancedPrompt } from './contextBuilder';
import {
  getAvailableSlots,
  sortQueueItems,
  calculateAverageProcessingTime,
} from '../utils/queueHelpers';
import { createCharacterTransition } from '../types/factories';
import { WAVE_ANIMATION_DELAY } from '../constants';

/**
 * Active stream tracking
 */
interface ActiveStream {
  paragraphId: ParagraphId;
  processor: StreamProcessor;
  startTime: number;
  accumulatedText: string;
}

/**
 * Queue manager singleton
 */
export class QueueManager {
  private activeStreams: Map<ParagraphId, ActiveStream> = new Map();
  private isProcessing = false;
  private processingInterval: number | null = null;

  /**
   * Start the queue processing loop
   */
  startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processQueue();

    // Set up interval to check queue regularly
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 1000); // Check every second
  }

  /**
   * Stop queue processing
   */
  stopProcessing(): void {
    this.isProcessing = false;

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    // Abort all active streams
    this.abortAll();
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    const store = useEditorStore.getState();
    const { queue } = store;

    // Get available slots
    const availableSlots = getAvailableSlots(queue);

    if (availableSlots === 0) {
      return; // No slots available
    }

    // Get sorted queue items
    const sortedItems = sortQueueItems(queue.items);

    // Get items to process
    const itemsToProcess = sortedItems.slice(0, availableSlots);

    // Process each item
    for (const item of itemsToProcess) {
      // Check if already processing
      if (this.activeStreams.has(item.paragraph.id)) {
        continue;
      }

      // Remove from queue
      store.removeFromQueue(item.paragraph.id);

      // Start processing
      await this.processParagraph(item.paragraph.id);
    }
  }

  /**
   * Process a single paragraph or prompt
   */
  private async processParagraph(paragraphId: ParagraphId): Promise<void> {
    const store = useEditorStore.getState();
    
    // Check if it's a paragraph or a prompt region
    const paragraph = store.paragraphs.get(paragraphId);
    const prompt = store.singleViewPrompts.get(paragraphId);
    
    if (!paragraph && !prompt) {
      console.warn(`Item ${paragraphId} not found in paragraphs or prompts`);
      return;
    }
    
    // Route to appropriate handler
    if (prompt) {
      return this.processPrompt(paragraphId);
    }

    if (!paragraph) {
      console.warn(`Paragraph ${paragraphId} not found`);
      return;
    }

    // Create stream processor
    const processor = new StreamProcessor(store.streamConfig);

    // Track active stream
    const activeStream: ActiveStream = {
      paragraphId,
      processor,
      startTime: Date.now(),
      accumulatedText: '',
    };

    this.activeStreams.set(paragraphId, activeStream);

    // Update paragraph status
    store.updateParagraph(paragraphId, {
      status: ParagraphStatus.PROCESSING,
      processingStartedAt: Date.now(),
    });

    // Increment active count
    const updatedQueue = {
      ...store.queue,
      activeCount: store.queue.activeCount + 1,
    };
    useEditorStore.setState({ queue: updatedQueue });

    // Create callbacks
    const callbacks: StreamCallbacks = {
      onStart: () => {
        store.updateParagraph(paragraphId, {
          status: ParagraphStatus.STREAMING,
        });
      },

      onChunk: (chunk: string) => {
        const stream = this.activeStreams.get(paragraphId);
        if (!stream) return;

        // Accumulate text
        stream.accumulatedText += chunk;

        // Update paragraph
        const currentParagraph = store.paragraphs.get(paragraphId);
        if (!currentParagraph) return;

        // Calculate progress
        const progress = Math.min(
          (stream.accumulatedText.length / currentParagraph.originalText.length) * 100,
          99
        );

        // Create character map for animation
        const characterMap = this.createCharacterMap(
          currentParagraph.originalText,
          stream.accumulatedText
        );

        // Update with new text and progress
        store.updateParagraph(paragraphId, {
          transformedText: stream.accumulatedText,
          progress: {
            ...currentParagraph.progress,
            current: stream.accumulatedText.length,
            percentage: progress,
            bytesPerSecond: processor.getBytesPerSecond(),
          },
          characterMap,
          waveState: {
            ...currentParagraph.waveState,
            isActive: true,
            position: stream.accumulatedText.length,
          },
        });
      },

      onComplete: () => {
        const stream = this.activeStreams.get(paragraphId);
        if (!stream) return;

        const duration = Date.now() - stream.startTime;
        const paragraph = store.paragraphs.get(paragraphId);

        if (paragraph) {
          // Update paragraph to complete
          store.updateParagraph(paragraphId, {
            status: ParagraphStatus.COMPLETE,
            completedAt: Date.now(),
            progress: {
              ...paragraph.progress,
              percentage: 100,
            },
            waveState: {
              ...paragraph.waveState,
              isActive: false,
            },
          });

          // Update queue statistics
          const currentQueue = useEditorStore.getState().queue;
          const newAverageTime = calculateAverageProcessingTime(
            currentQueue.averageProcessingTime,
            currentQueue.totalProcessed,
            duration
          );

          const updatedQueue = {
            ...currentQueue,
            activeCount: Math.max(0, currentQueue.activeCount - 1),
            totalProcessed: currentQueue.totalProcessed + 1,
            averageProcessingTime: newAverageTime,
          };

          useEditorStore.setState({ queue: updatedQueue });
        }

        // Clean up
        this.activeStreams.delete(paragraphId);
      },

      onError: (error: ProcessingError) => {
        console.error(`Error processing paragraph ${paragraphId}:`, error);

        // Update paragraph with error
        store.updateParagraph(paragraphId, {
          status: ParagraphStatus.ERROR,
          error,
        });

        // Update queue statistics
        const currentQueue = useEditorStore.getState().queue;
        const updatedQueue = {
          ...currentQueue,
          activeCount: Math.max(0, currentQueue.activeCount - 1),
          totalFailed: currentQueue.totalFailed + 1,
        };

        useEditorStore.setState({ queue: updatedQueue });

        // Clean up
        this.activeStreams.delete(paragraphId);

        // Retry if error is retryable and retry count is low
        if (error.isRetryable && error.retryCount < store.streamConfig.maxRetries) {
          setTimeout(() => {
            this.retryParagraph(paragraphId, error.retryCount + 1);
          }, store.streamConfig.retryDelayMs * Math.pow(2, error.retryCount));
        }
      },

      onProgress: (bytesReceived: number) => {
        const paragraph = store.paragraphs.get(paragraphId);
        if (!paragraph) return;

        store.updateParagraph(paragraphId, {
          progress: {
            ...paragraph.progress,
            current: bytesReceived,
          },
        });
      },
    };

    // Build context if bucket is enabled
    let fullContext: string | undefined;
    if (store.isBucketEnabled && store.bucketFiles) {
      fullContext = buildEnhancedPrompt(
        store.streamConfig.systemPrompt,
        store.bucketFiles,
        '', // No document context for split-view
        paragraph.originalText
      );
    }

    // Start processing with context
    await processor.processStream(paragraph.originalText, callbacks, fullContext);
  }

  /**
   * Process a single prompt (single-view mode)
   */
  private async processPrompt(promptId: string): Promise<void> {
    const store = useEditorStore.getState();
    const prompt = store.singleViewPrompts.get(promptId);

    if (!prompt) {
      console.warn(`Prompt ${promptId} not found`);
      return;
    }

    // Create stream processor
    const processor = new StreamProcessor(store.streamConfig);

    // Track active stream
    const activeStream: ActiveStream = {
      paragraphId: promptId,
      processor,
      startTime: Date.now(),
      accumulatedText: '',
    };

    this.activeStreams.set(promptId, activeStream);

    // Update prompt status
    store.updatePrompt(promptId, {
      status: ParagraphStatus.PROCESSING,
      processingStartedAt: Date.now(),
    });

    // Increment active count
    const updatedQueue = {
      ...store.queue,
      activeCount: store.queue.activeCount + 1,
    };
    useEditorStore.setState({ queue: updatedQueue });

    // Create callbacks
    const callbacks: StreamCallbacks = {
      onStart: () => {
        store.updatePrompt(promptId, {
          status: ParagraphStatus.STREAMING,
        });
      },

      onChunk: (chunk: string) => {
        const stream = this.activeStreams.get(promptId);
        if (!stream) return;

        // Accumulate text
        stream.accumulatedText += chunk;

        // Update prompt
        const currentPrompt = store.singleViewPrompts.get(promptId);
        if (!currentPrompt) return;

        // Calculate progress
        const progress = Math.min(
          (stream.accumulatedText.length / currentPrompt.originalText.length) * 100,
          99
        );

        // Create character map for animation
        const characterMap = this.createCharacterMap(
          currentPrompt.originalText,
          stream.accumulatedText
        );

        // Update with new text and progress
        store.updatePrompt(promptId, {
          transformedText: stream.accumulatedText,
          progress: {
            ...currentPrompt.progress,
            current: stream.accumulatedText.length,
            percentage: progress,
            bytesPerSecond: processor.getBytesPerSecond(),
          },
          characterMap,
          waveState: {
            ...currentPrompt.waveState,
            isActive: true,
            position: stream.accumulatedText.length,
          },
        });
      },

      onComplete: () => {
        const stream = this.activeStreams.get(promptId);
        if (!stream) return;

        const duration = Date.now() - stream.startTime;
        const prompt = store.singleViewPrompts.get(promptId);

        if (prompt) {
          // Update prompt to complete
          store.updatePrompt(promptId, {
            status: ParagraphStatus.COMPLETE,
            completedAt: Date.now(),
            progress: {
              ...prompt.progress,
              percentage: 100,
            },
            waveState: {
              ...prompt.waveState,
              isActive: false,
            },
          });

          // Delay inline replacement to allow wave animation to complete
          setTimeout(() => {
            store.replaceTextInline(promptId);
          }, WAVE_ANIMATION_DELAY);

          // Update queue statistics
          const currentQueue = useEditorStore.getState().queue;
          const newAverageTime = calculateAverageProcessingTime(
            currentQueue.averageProcessingTime,
            currentQueue.totalProcessed,
            duration
          );

          const updatedQueue = {
            ...currentQueue,
            activeCount: Math.max(0, currentQueue.activeCount - 1),
            totalProcessed: currentQueue.totalProcessed + 1,
            averageProcessingTime: newAverageTime,
          };

          useEditorStore.setState({ queue: updatedQueue });
        }

        // Clean up
        this.activeStreams.delete(promptId);
      },

      onError: (error: ProcessingError) => {
        console.error(`Error processing prompt ${promptId}:`, error);

        // Update prompt with error
        store.updatePrompt(promptId, {
          status: ParagraphStatus.ERROR,
          error,
        });

        // Update queue statistics
        const currentQueue = useEditorStore.getState().queue;
        const updatedQueue = {
          ...currentQueue,
          activeCount: Math.max(0, currentQueue.activeCount - 1),
          totalFailed: currentQueue.totalFailed + 1,
        };

        useEditorStore.setState({ queue: updatedQueue });

        // Clean up
        this.activeStreams.delete(promptId);
      },

      onProgress: (bytesReceived: number) => {
        const prompt = store.singleViewPrompts.get(promptId);
        if (!prompt) return;

        store.updatePrompt(promptId, {
          progress: {
            ...prompt.progress,
            current: bytesReceived,
          },
        });
      },
    };

    // Build context for single-view
    let fullContext: string | undefined;
    
    if (store.isBucketEnabled && store.bucketFiles) {
      // Use bucket context if enabled
      fullContext = buildEnhancedPrompt(
        store.streamConfig.systemPrompt,
        store.bucketFiles,
        store.singleViewText,
        prompt.originalText
      );
    } else {
      // Fall back to regular page context
      fullContext = store.singleViewText;
    }

    // Start processing with context
    await processor.processStream(prompt.originalText, callbacks, fullContext);
  }

  /**
   * Create character transition map for animation
   */
  private createCharacterMap(
    sourceText: string,
    targetText: string
  ): CharacterTransition[] {
    const maxLength = Math.max(sourceText.length, targetText.length);
    const map: CharacterTransition[] = [];

    for (let i = 0; i < maxLength; i++) {
      const sourceChar = sourceText[i] || '';
      const targetChar = targetText[i] || '';

      map.push(createCharacterTransition(i, sourceChar, targetChar));
    }

    return map;
  }

  /**
   * Retry a failed paragraph
   */
  private retryParagraph(paragraphId: ParagraphId, retryCount: number): void {
    const store = useEditorStore.getState();
    const paragraph = store.paragraphs.get(paragraphId);

    if (!paragraph) return;

    // Update error with retry count
    if (paragraph.error) {
      store.updateParagraph(paragraphId, {
        status: ParagraphStatus.PENDING,
        error: {
          ...paragraph.error,
          retryCount,
        },
      });
    }

    // Add back to queue
    store.addToQueue(paragraphId);
  }

  /**
   * Abort a specific stream
   */
  abortStream(paragraphId: ParagraphId): void {
    const stream = this.activeStreams.get(paragraphId);

    if (stream) {
      stream.processor.abort();
      this.activeStreams.delete(paragraphId);

      // Update paragraph status
      const store = useEditorStore.getState();
      store.updateParagraph(paragraphId, {
        status: ParagraphStatus.CANCELLED,
      });

      // Update queue count
      const currentQueue = store.queue;
      const updatedQueue = {
        ...currentQueue,
        activeCount: Math.max(0, currentQueue.activeCount - 1),
      };

      useEditorStore.setState({ queue: updatedQueue });
    }
  }

  /**
   * Abort all active streams
   */
  abortAll(): void {
    this.activeStreams.forEach((stream) => {
      stream.processor.abort();
    });

    this.activeStreams.clear();

    // Reset active count
    const store = useEditorStore.getState();
    const updatedQueue = {
      ...store.queue,
      activeCount: 0,
    };

    useEditorStore.setState({ queue: updatedQueue });
  }

  /**
   * Get active stream count
   */
  getActiveCount(): number {
    return this.activeStreams.size;
  }

  /**
   * Check if a paragraph is being processed
   */
  isProcessingParagraph(paragraphId: ParagraphId): boolean {
    return this.activeStreams.has(paragraphId);
  }
}

// Export singleton instance
export const queueManager = new QueueManager();
