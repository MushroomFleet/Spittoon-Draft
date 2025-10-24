/**
 * Factory functions for creating typed objects with defaults
 */

import type {
  Paragraph,
  ParagraphId,
  TextPosition,
  StreamProgress,
  WaveState,
  CharacterTransition,
  CreateParagraphOptions,
  StreamConfig,
  ModelParameters,
  ProcessingError,
  QueueItem,
  QueueState,
  SessionStatistics,
} from './index';
import { ParagraphStatus, ErrorType, QueuePriority } from './index';
import {
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_MAX_TOKENS,
  DEFAULT_SYSTEM_PROMPT,
  WAVE_WIDTH,
  MAX_CONCURRENT_STREAMS,
} from '../constants';

/**
 * Create a new paragraph with default values
 */
export const createParagraph = (
  options: CreateParagraphOptions
): Paragraph => {
  const now = Date.now();
  
  return {
    ...options,
    transformedText: '',
    status: ParagraphStatus.PENDING,
    progress: createDefaultProgress(),
    characterMap: [],
    waveState: createDefaultWaveState(),
    error: null,
    createdAt: now,
    updatedAt: now,
    processingStartedAt: null,
    completedAt: null,
  };
};

/**
 * Create default stream progress
 */
export const createDefaultProgress = (): StreamProgress => ({
  total: null,
  current: 0,
  percentage: 0,
  estimatedTimeRemaining: null,
  bytesPerSecond: null,
});

/**
 * Create default wave state
 */
export const createDefaultWaveState = (): WaveState => ({
  position: 0,
  width: WAVE_WIDTH,
  speed: 1,
  isActive: false,
});

/**
 * Create character transition
 */
export const createCharacterTransition = (
  index: number,
  sourceChar: string,
  targetChar: string
): CharacterTransition => ({
  index,
  sourceChar,
  targetChar,
  progress: 0,
  isAnimating: false,
});

/**
 * Create default model parameters
 */
export const createDefaultModelParameters = (): ModelParameters => ({
  temperature: DEFAULT_TEMPERATURE,
  maxTokens: DEFAULT_MAX_TOKENS,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
});

/**
 * Create default stream config
 */
export const createDefaultStreamConfig = (apiKey: string = ''): StreamConfig => ({
  apiKey,
  model: DEFAULT_MODEL,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  parameters: createDefaultModelParameters(),
  timeout: 30000,
  maxRetries: 3,
  retryDelayMs: 1000,
});

/**
 * Create processing error
 */
export const createProcessingError = (
  type: ErrorType,
  message: string,
  options: Partial<ProcessingError> = {}
): ProcessingError => ({
  type,
  message,
  details: options.details,
  statusCode: options.statusCode,
  timestamp: Date.now(),
  isRetryable: options.isRetryable ?? type !== ErrorType.AUTH_ERROR,
  retryCount: options.retryCount ?? 0,
});

/**
 * Create queue item
 */
export const createQueueItem = (
  paragraph: Paragraph,
  priority: QueuePriority = QueuePriority.NORMAL
): QueueItem => ({
  paragraph,
  priority,
  timestamp: Date.now(),
  retryCount: 0,
  abortController: new AbortController(),
});

/**
 * Create default queue state
 */
export const createDefaultQueueState = (): QueueState => ({
  items: [],
  maxConcurrent: MAX_CONCURRENT_STREAMS,
  activeCount: 0,
  totalProcessed: 0,
  totalFailed: 0,
  averageProcessingTime: 0,
});

/**
 * Create default session statistics
 */
export const createDefaultSessionStatistics = (): SessionStatistics => ({
  totalParagraphs: 0,
  totalCharacters: 0,
  totalApiCalls: 0,
  totalErrors: 0,
  sessionStartTime: Date.now(),
  totalProcessingTime: 0,
});

/**
 * Generate unique paragraph ID
 */
export const generateParagraphId = (): ParagraphId => {
  return `para_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Create text position from indices
 */
export const createTextPosition = (
  startIndex: number,
  endIndex: number,
  text: string
): TextPosition => {
  // Calculate line numbers
  const beforeText = text.substring(0, startIndex);
  const paragraphText = text.substring(startIndex, endIndex);
  
  const startLine = (beforeText.match(/\n/g) || []).length + 1;
  const endLine = startLine + (paragraphText.match(/\n/g) || []).length;
  
  return {
    startIndex,
    endIndex,
    startLine,
    endLine,
  };
};

/**
 * Generate unique prompt ID for single-view mode
 */
export const generatePromptId = (): string => {
  return `prompt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Create prompt region from text selection
 */
export const createPromptRegion = (
  selection: { start: number; end: number; text: string }
) => {
  const now = Date.now();
  
  return {
    id: generatePromptId(),
    startIndex: selection.start,
    endIndex: selection.end,
    originalText: selection.text,
    transformedText: '',
    status: ParagraphStatus.PENDING,
    progress: createDefaultProgress(),
    characterMap: [],
    waveState: createDefaultWaveState(),
    error: null,
    createdAt: now,
    updatedAt: now,
    processingStartedAt: null,
    completedAt: null,
  };
};
