/**
 * StreamProcessor handles streaming responses from OpenRouter API
 * Implements SSE (Server-Sent Events) parsing and error handling
 */

import type { StreamConfig, OpenRouterRequest, ProcessingError } from '../types';
import { ErrorType } from '../types';
import {
  isValidStreamChunk,
  extractChunkContent,
  isChunkFinal,
} from '../types/guards';
import { createProcessingError } from '../types/factories';
import { OPENROUTER_API_URL } from '../constants';

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
    callbacks: StreamCallbacks,
    fullContext?: string
  ): Promise<void> {
    this.abortController = new AbortController();
    this.startTime = Date.now();
    this.bytesReceived = 0;

    // Validate configuration
    if (!this.config.apiKey || this.config.apiKey.trim().length === 0) {
      callbacks.onError(
        createProcessingError(ErrorType.CONFIG_ERROR, 'API key is required', {
          isRetryable: false,
        })
      );
      return;
    }

    // Construct user prompt with full context if provided
    let userPrompt = text;
    if (fullContext) {
      userPrompt = `Here is the full document for context:

---DOCUMENT START---
${fullContext}
---DOCUMENT END---

Please enhance ONLY the following selected text while considering the context of the full document above:

---SELECTED TEXT---
${text}
---SELECTED TEXT END---

Return ONLY the enhanced version of the selected text, nothing else. Do not include the markers or any explanations.`;
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
          content: userPrompt,
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
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Spittoon-Draft',
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
        throw createProcessingError(ErrorType.API_ERROR, 'No response body available');
      }

      // Process stream
      await this.processStreamReader(reader, callbacks);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Stream was cancelled - don't call error callback
          return;
        }

        // Check if it's already a ProcessingError by checking for unique properties
        if (
          'type' in error &&
          'timestamp' in error &&
          'isRetryable' in error &&
          'retryCount' in error
        ) {
          // It's already a ProcessingError
          callbacks.onError(error as unknown as ProcessingError);
        } else {
          callbacks.onError(
            createProcessingError(ErrorType.UNKNOWN_ERROR, error.message, {
              details: error.stack,
            })
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
        throw createProcessingError(ErrorType.PARSE_ERROR, 'Failed to process stream', {
          details: error.message,
        });
      }
      throw error;
    }
  }

  /**
   * Process a single SSE line
   */
  private async processLine(line: string, callbacks: StreamCallbacks): Promise<void> {
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
