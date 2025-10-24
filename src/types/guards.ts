/**
 * Type guard utilities for runtime type checking
 */

import type {
  Paragraph,
  ProcessingError,
  StreamChunk,
} from './index';
import { ParagraphStatus } from './index';

/**
 * Check if a value is a valid paragraph
 */
export const isParagraph = (value: unknown): value is Paragraph => {
  if (typeof value !== 'object' || value === null) return false;
  
  const p = value as Partial<Paragraph>;
  
  return (
    typeof p.id === 'string' &&
    typeof p.originalText === 'string' &&
    typeof p.transformedText === 'string' &&
    typeof p.status === 'string' &&
    Object.values(ParagraphStatus).includes(p.status as ParagraphStatus)
  );
};

/**
 * Check if paragraph is in a processing state
 */
export const isParagraphActive = (paragraph: Paragraph): boolean => {
  return [
    ParagraphStatus.QUEUED,
    ParagraphStatus.PROCESSING,
    ParagraphStatus.STREAMING,
  ].includes(paragraph.status);
};

/**
 * Check if paragraph is in a terminal state
 */
export const isParagraphTerminal = (paragraph: Paragraph): boolean => {
  return [
    ParagraphStatus.COMPLETE,
    ParagraphStatus.ERROR,
    ParagraphStatus.CANCELLED,
  ].includes(paragraph.status);
};

/**
 * Check if error is retryable
 */
export const isErrorRetryable = (error: ProcessingError): boolean => {
  return error.isRetryable && error.retryCount < 3;
};

/**
 * Type guard for stream chunks
 */
export const isValidStreamChunk = (value: unknown): value is StreamChunk => {
  if (typeof value !== 'object' || value === null) return false;
  
  const chunk = value as Partial<StreamChunk>;
  
  return (
    typeof chunk.id === 'string' &&
    chunk.object === 'chat.completion.chunk' &&
    Array.isArray(chunk.choices)
  );
};

/**
 * Extract content from stream chunk safely
 */
export const extractChunkContent = (chunk: StreamChunk): string => {
  return chunk.choices[0]?.delta?.content || '';
};

/**
 * Check if chunk is final
 */
export const isChunkFinal = (chunk: StreamChunk): boolean => {
  return chunk.choices[0]?.finish_reason === 'stop';
};
