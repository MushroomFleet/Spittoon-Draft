# Phase 4: OpenRouter API Integration & Streaming

## Phase Overview

**Goal:** Build robust streaming API integration with OpenRouter including SSE parsing, error handling, and concurrent stream management  
**Prerequisites:** Phase 3 completed (state management)  
**Estimated Duration:** 4-6 hours  
**Key Deliverables:**
- StreamProcessor class with SSE support
- QueueManager for parallel processing
- Error handling and retry logic
- Stream progress tracking
- Abort/cancel functionality
- Complete API integration with store

---

## Step-by-Step Implementation

### Step 1: Create Stream Processor Foundation

**Purpose:** Build core class for handling OpenRouter streaming API  
**Duration:** 60 minutes

#### Instructions

1. Create `src/services/streamProcessor.ts`:

```typescript
/**
 * StreamProcessor handles streaming responses from OpenRouter API
 * Implements SSE (Server-Sent Events) parsing and error handling
 */

import {
  StreamConfig,
  ChatMessage,
  OpenRouterRequest,
  StreamChunk,
  ProcessingError,
  ErrorType,
} from '../types';
import {
  isValidStreamChunk,
  extractChunkContent,
  isChunkFinal,
} from '../types/guards';
import {
  createProcessingError,
} from '../types/factories';
import {
  OPENROUTER_API_URL,
} from '../constants';

/**
 * Callback types for stream events
 */
export interface StreamCallbacks {
  onStart?: () => void;
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: ProcessingError) => void;
  onProgress?: (bytesReceived: number) => void;
}

/**
 * Stream processor class
 */
export class StreamProcessor {
  private config: StreamConfig;
  private abortController: AbortController | null = null;
  private startTime: number = 0;
  private bytesReceived: number = 0;

  constructor(config: StreamConfig) {
    this.config = config;
  }

  /**
   * Process a text stream with OpenRouter API
   */
  async processStream(
    text: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    this.abortController = new AbortController();
    this.startTime = Date.now();
    this.bytesReceived = 0;

    // Validate configuration
    if (!this.config.apiKey || this.config.apiKey.trim().length === 0) {
      callbacks.onError(
        createProcessingError(
          ErrorType.CONFIG_ERROR,
          'API key is required',
          { isRetryable: false }
        )
      );
      return;
    }

    // Build request body
    const requestBody: OpenRouterRequest = {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: this.config.systemPrompt,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      stream: true,
      temperature: this.config.parameters.temperature,
      max_tokens: this.config.parameters.maxTokens,
      top_p: this.config.parameters.topP,
      frequency_penalty: this.config.parameters.frequencyPenalty,
      presence_penalty: this.config.parameters.presencePenalty,
      stop: this.config.parameters.stop,
    };

    try {
      // Call onStart callback
      callbacks.onStart?.();

      // Make API request
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Cascade-Edit',
        },
        body: JSON.stringify(requestBody),
        signal: this.abortController.signal,
      });

      // Check response status
      if (!response.ok) {
        throw await this.handleHttpError(response);
      }

      // Get reader for streaming
      const reader = response.body?.getReader();
      if (!reader) {
        throw createProcessingError(
          ErrorType.API_ERROR,
          'No response body available'
        );
      }

      // Process stream
      await this.processStreamReader(reader, callbacks);

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Stream was cancelled - don't call error callback
          return;
        }
        
        if (error instanceof ProcessingError) {
          callbacks.onError(error);
        } else {
          callbacks.onError(
            createProcessingError(
              ErrorType.UNKNOWN_ERROR,
              error.message,
              { details: error.stack }
            )
          );
        }
      }
    }
  }

  /**
   * Process the stream reader
   */
  private async processStreamReader(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Stream completed
          callbacks.onComplete();
          return;
        }

        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });
        this.bytesReceived += chunk.length;
        callbacks.onProgress?.(this.bytesReceived);

        // Add to buffer
        buffer += chunk;

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          await this.processLine(line, callbacks);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw createProcessingError(
          ErrorType.PARSE_ERROR,
          'Failed to process stream',
          { details: error.message }
        );
      }
      throw error;
    }
  }

  /**
   * Process a single SSE line
   */
  private async processLine(
    line: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    // Skip empty lines
    if (line.trim().length === 0) {
      return;
    }

    // Check for SSE data line
    if (!line.startsWith('data: ')) {
      return;
    }

    // Extract data
    const data = line.slice(6); // Remove 'data: ' prefix

    // Check for completion marker
    if (data === '[DONE]') {
      callbacks.onComplete();
      return;
    }

    try {
      // Parse JSON
      const parsed = JSON.parse(data);

      // Validate chunk structure
      if (!isValidStreamChunk(parsed)) {
        console.warn('Invalid chunk structure:', parsed);
        return;
      }

      // Extract content
      const content = extractChunkContent(parsed);
      
      if (content && content.length > 0) {
        callbacks.onChunk(content);
      }

      // Check if this is the final chunk
      if (isChunkFinal(parsed)) {
        callbacks.onComplete();
      }

    } catch (error) {
      // Log but don't throw - some lines might not be valid JSON
      console.warn('Failed to parse SSE line:', data, error);
    }
  }

  /**
   * Handle HTTP error responses
   */
  private async handleHttpError(response: Response): Promise<ProcessingError> {
    const statusCode = response.status;
    let message = 'API request failed';
    let errorType = ErrorType.API_ERROR;
    let isRetryable = true;

    // Try to get error details from response
    try {
      const errorData = await response.json();
      message = errorData.error?.message || errorData.message || message;
    } catch {
      // Couldn't parse error response
      message = `HTTP ${statusCode}: ${response.statusText}`;
    }

    // Determine error type based on status code
    switch (statusCode) {
      case 401:
      case 403:
        errorType = ErrorType.AUTH_ERROR;
        isRetryable = false;
        message = 'Invalid API key. Please check your settings.';
        break;
      case 429:
        errorType = ErrorType.RATE_LIMIT_ERROR;
        message = 'Rate limit exceeded. Please wait and try again.';
        break;
      case 408:
      case 504:
        errorType = ErrorType.TIMEOUT_ERROR;
        break;
      case 500:
      case 502:
      case 503:
        errorType = ErrorType.API_ERROR;
        message = 'API service error. Please try again.';
        break;
      default:
        if (statusCode >= 400 && statusCode < 500) {
          isRetryable = false;
        }
    }

    return createProcessingError(errorType, message, {
      statusCode,
      isRetryable,
    });
  }

  /**
   * Abort the current stream
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Get processing duration
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get bytes received
   */
  getBytesReceived(): number {
    return this.bytesReceived;
  }

  /**
   * Calculate bytes per second
   */
  getBytesPerSecond(): number {
    const duration = this.getDuration() / 1000; // Convert to seconds
    if (duration === 0) return 0;
    return this.bytesReceived / duration;
  }
}
```

#### Verification
- [ ] StreamProcessor class created
- [ ] SSE parsing logic implemented
- [ ] Error handling comprehensive
- [ ] HTTP status codes handled correctly

---

### Step 2: Implement Queue Manager

**Purpose:** Manage multiple concurrent streams with priority queue  
**Duration:** 60 minutes

#### Instructions

Create `src/services/queueManager.ts`:

```typescript
/**
 * QueueManager handles concurrent stream processing
 * Manages multiple StreamProcessors with priority queue
 */

import { useEditorStore } from '../store/editorStore';
import { StreamProcessor, StreamCallbacks } from './streamProcessor';
import {
  ParagraphId,
  ParagraphStatus,
  Paragraph,
  ProcessingError,
} from '../types';
import {
  getAvailableSlots,
  sortQueueItems,
  calculateAverageProcessingTime,
} from '../utils/queueHelpers';
import {
  createCharacterTransition,
} from '../types/factories';

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
  private processingInterval: NodeJS.Timeout | null = null;

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
    const { queue, streamConfig } = store;

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
   * Process a single paragraph
   */
  private async processParagraph(paragraphId: ParagraphId): Promise<void> {
    const store = useEditorStore.getState();
    const paragraph = store.paragraphs.get(paragraphId);
    
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

    // Start processing
    await processor.processStream(paragraph.originalText, callbacks);
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
      
      map.push(
        createCharacterTransition(i, sourceChar, targetChar)
      );
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
    this.activeStreams.forEach((stream, id) => {
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
  isProcessing(paragraphId: ParagraphId): boolean {
    return this.activeStreams.has(paragraphId);
  }
}

// Export singleton instance
export const queueManager = new QueueManager();
```

#### Verification
- [ ] QueueManager class created
- [ ] Concurrent processing works
- [ ] Priority queue respected
- [ ] Error retry logic works

---

### Step 3: Integrate with Store

**Purpose:** Connect streaming services to Zustand store actions  
**Duration:** 30 minutes

#### Instructions

Update `src/store/editorStore.ts` to integrate queue manager:

```typescript
// Add import at top
import { queueManager } from '../services/queueManager';

// Update the stream action implementations:

startStream: async (paragraphId: ParagraphId) => {
  const { paragraphs } = get();
  const paragraph = paragraphs.get(paragraphId);
  
  if (!paragraph) {
    console.warn(`Cannot start stream for ${paragraphId}: not found`);
    return;
  }

  // Add to queue (queue manager will handle processing)
  get().addToQueue(paragraphId);
  
  // Ensure queue manager is running
  queueManager.startProcessing();
},

cancelStream: (paragraphId: ParagraphId) => {
  // Abort the stream
  queueManager.abortStream(paragraphId);
  
  // Remove from queue
  get().removeFromQueue(paragraphId);
},

retryStream: async (paragraphId: ParagraphId) => {
  const { paragraphs } = get();
  const paragraph = paragraphs.get(paragraphId);
  
  if (!paragraph) {
    console.warn(`Cannot retry stream for ${paragraphId}: not found`);
    return;
  }

  // Reset paragraph status
  get().updateParagraph(paragraphId, {
    status: ParagraphStatus.PENDING,
    error: null,
    transformedText: '',
    progress: {
      total: null,
      current: 0,
      percentage: 0,
      estimatedTimeRemaining: null,
      bytesPerSecond: null,
    },
  });

  // Add back to queue
  get().startStream(paragraphId);
},
```

#### Verification
- [ ] Store actions integrated
- [ ] startStream triggers queue manager
- [ ] cancelStream aborts correctly
- [ ] retryStream resets and requeues

---

### Step 4: Add Progress Tracking and Estimation

**Purpose:** Calculate and update processing progress with time estimates  
**Duration:** 30 minutes

#### Instructions

Create `src/utils/progressEstimator.ts`:

```typescript
/**
 * Progress estimation utilities
 */

import { StreamProgress } from '../types';

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
  const estimatedTotal = progress.percentage > 0
    ? (bytesReceived / progress.percentage) * 100
    : null;

  // Estimate time remaining
  const timeRemaining = estimatedTotal && smoothedBps > 0
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
```

#### Verification
- [ ] Progress estimation works
- [ ] Time remaining calculated
- [ ] Formatting functions work
- [ ] Smoothing applied correctly

---

### Step 5: Add Error Recovery and Retry Logic

**Purpose:** Implement exponential backoff and retry strategies  
**Duration:** 30 minutes

#### Instructions

Create `src/utils/retryHelper.ts`:

```typescript
/**
 * Retry and backoff utilities
 */

import { ProcessingError, ErrorType } from '../types';

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
export const shouldRetry = (
  error: ProcessingError,
  maxRetries: number
): boolean => {
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
```

#### Verification
- [ ] Exponential backoff works
- [ ] Retry logic correct
- [ ] Error messages user-friendly
- [ ] Jitter prevents synchronized retries

---

## Testing Procedures

### Manual Testing

1. **Test basic streaming:**
   - Type a paragraph and double-enter
   - Verify stream starts
   - Check progress updates
   - Confirm completion

2. **Test concurrent streams:**
   - Create 3+ paragraphs quickly
   - Verify max 3 process simultaneously
   - Check queue ordering

3. **Test error handling:**
   - Use invalid API key
   - Verify error display
   - Check retry logic

4. **Test cancellation:**
   - Start a stream
   - Cancel it mid-processing
   - Verify clean abort

### Integration Tests

Create `src/services/__tests__/streamProcessor.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StreamProcessor } from '../streamProcessor';
import { createDefaultStreamConfig } from '../../types/factories';
import { ErrorType } from '../../types';

// Mock fetch
global.fetch = vi.fn();

describe('StreamProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process a successful stream', async () => {
    const config = createDefaultStreamConfig('test-key');
    const processor = new StreamProcessor(config);

    const chunks: string[] = [];
    let completed = false;

    // Mock successful response
    const mockResponse = new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'));
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      }),
      { status: 200 }
    );

    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    await processor.processStream('Test', {
      onChunk: (chunk) => chunks.push(chunk),
      onComplete: () => { completed = true; },
      onError: () => {},
    });

    expect(chunks).toContain('Hello');
    expect(completed).toBe(true);
  });

  it('should handle auth errors', async () => {
    const config = createDefaultStreamConfig('invalid-key');
    const processor = new StreamProcessor(config);

    let error: any = null;

    const mockResponse = new Response(null, { status: 401 });
    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    await processor.processStream('Test', {
      onChunk: () => {},
      onComplete: () => {},
      onError: (e) => { error = e; },
    });

    expect(error).not.toBeNull();
    expect(error.type).toBe(ErrorType.AUTH_ERROR);
  });
});
```

---

## Troubleshooting

### Common Issues

#### Issue: Streams not starting
**Solution:**
- Check API key is configured
- Verify queue manager is started
- Check network connectivity
- Look for console errors

#### Issue: SSE parsing errors
**Solution:**
- Check response format from API
- Verify chunk validation logic
- Add more console.log in processLine
- Check for malformed JSON

#### Issue: Multiple retries failing
**Solution:**
- Check retry delay calculation
- Verify error.isRetryable flag
- Check maxRetries configuration
- Look at error details

#### Issue: Memory leaks with many streams
**Solution:**
- Verify abort controllers are cleaned up
- Check activeStreams Map is cleared
- Use Chrome DevTools memory profiler
- Ensure event listeners are removed

---

## Phase Completion Checklist

- [ ] **StreamProcessor complete**
  - [ ] SSE parsing works
  - [ ] Error handling robust
  - [ ] Progress tracking works
  - [ ] Abort functionality works

- [ ] **QueueManager complete**
  - [ ] Concurrent processing works
  - [ ] Priority queue respected
  - [ ] Retry logic implemented
  - [ ] Statistics updated

- [ ] **Store integration**
  - [ ] Actions connected
  - [ ] State updates properly
  - [ ] Progress reflected in UI
  - [ ] Errors handled gracefully

- [ ] **Testing**
  - [ ] Unit tests pass
  - [ ] Integration tests pass
  - [ ] Manual testing complete
  - [ ] Error scenarios covered

---

## Next Steps

1. **Commit your work:**
   ```bash
   git add src/services src/utils
   git commit -m "feat: complete Phase 4 - OpenRouter API integration"
   git push
   ```

2. **Proceed to Phase 5:**
   - Open `Phase5.md`
   - Begin animation system
   - Create character wave effects

---

**Phase Status:** ✅ Ready for Implementation  
**Next Phase:** Phase 5 - Character Wave Animation System
