# Phase 2: Core Type System & Data Structures

## Phase Overview

**Goal:** Define comprehensive TypeScript types and interfaces that will be the foundation for the entire application  
**Prerequisites:** Phase 1 completed (project setup and infrastructure)  
**Estimated Duration:** 2-3 hours  
**Key Deliverables:**
- Complete type definitions in `src/types/index.ts`
- Paragraph state machine types
- Character transition system
- Queue management interfaces
- Stream configuration types
- Utility type helpers
- Full TypeScript IntelliSense support

---

## Context & Architecture

### Why Types First?

In TypeScript applications, defining types before implementation provides:
1. **Clear contracts** between components
2. **IDE autocomplete** throughout development
3. **Compile-time safety** catching errors early
4. **Documentation** through type definitions
5. **Refactoring confidence** with type checking

### Type System Overview

```
Application Types Hierarchy:

Paragraph (Core Entity)
├── id: string
├── originalText: string
├── transformedText: string
├── status: ParagraphStatus (State Machine)
├── position: TextPosition
├── progress: StreamProgress
└── characterMap: CharacterTransition[]

StreamConfig (API Configuration)
├── apiKey: string
├── model: ModelType
├── systemPrompt: string
└── parameters: ModelParameters

QueueItem (Processing Management)
├── paragraph: Paragraph
├── priority: number
└── timestamp: number
```

---

## Step-by-Step Implementation

### Step 1: Create Base Type Definitions

**Purpose:** Define foundational types used throughout the application  
**Duration:** 30 minutes

#### Instructions

1. Create or open `src/types/index.ts`

2. Add base types and enums:

```typescript
/**
 * Cascade-Edit Type Definitions
 * Complete type system for paragraph processing and streaming
 */

// ============================================================================
// Base Types
// ============================================================================

/**
 * Unique identifier for paragraphs
 */
export type ParagraphId = string;

/**
 * Unique identifier for streams
 */
export type StreamId = string;

/**
 * Timestamp in milliseconds since epoch
 */
export type Timestamp = number;

// ============================================================================
// Enums and Union Types
// ============================================================================

/**
 * Lifecycle states for paragraph processing
 */
export enum ParagraphStatus {
  /** Paragraph detected but not yet queued */
  PENDING = 'pending',
  /** Paragraph is queued and waiting for processing slot */
  QUEUED = 'queued',
  /** API request initiated but no response yet */
  PROCESSING = 'processing',
  /** Receiving streaming response from API */
  STREAMING = 'streaming',
  /** Successfully completed transformation */
  COMPLETE = 'complete',
  /** Processing failed with error */
  ERROR = 'error',
  /** Processing was cancelled by user */
  CANCELLED = 'cancelled',
}

/**
 * Available AI models via OpenRouter
 */
export type ModelType =
  | 'anthropic/claude-3.5-sonnet'
  | 'anthropic/claude-3-opus'
  | 'anthropic/claude-3-sonnet'
  | 'anthropic/claude-3-haiku'
  | 'openai/gpt-4-turbo'
  | 'openai/gpt-4'
  | 'openai/gpt-3.5-turbo'
  | 'google/gemini-pro'
  | 'meta-llama/llama-3-70b-instruct';

/**
 * Error types that can occur during processing
 */
export enum ErrorType {
  /** Network connectivity issues */
  NETWORK_ERROR = 'network_error',
  /** API returned error response */
  API_ERROR = 'api_error',
  /** Invalid API key */
  AUTH_ERROR = 'auth_error',
  /** Request timed out */
  TIMEOUT_ERROR = 'timeout_error',
  /** Rate limit exceeded */
  RATE_LIMIT_ERROR = 'rate_limit_error',
  /** Invalid configuration */
  CONFIG_ERROR = 'config_error',
  /** Parsing error */
  PARSE_ERROR = 'parse_error',
  /** Unknown error */
  UNKNOWN_ERROR = 'unknown_error',
}

// ============================================================================
// Character Animation Types
// ============================================================================

/**
 * Represents a single character's transition state
 */
export interface CharacterTransition {
  /** Index position in the paragraph */
  index: number;
  /** Original character from source text */
  sourceChar: string;
  /** Target character from transformed text */
  targetChar: string;
  /** Animation progress from 0 (source) to 1 (target) */
  progress: number;
  /** Whether this character is currently animating */
  isAnimating: boolean;
}

/**
 * Animation state for the wave effect
 */
export interface WaveState {
  /** Current wave position (character index) */
  position: number;
  /** Width of the wave (number of characters) */
  width: number;
  /** Animation speed multiplier */
  speed: number;
  /** Whether the wave is currently active */
  isActive: boolean;
}

// ============================================================================
// Position and Progress Types
// ============================================================================

/**
 * Position of text within the document
 */
export interface TextPosition {
  /** Starting character index in the full document */
  startIndex: number;
  /** Ending character index in the full document */
  endIndex: number;
  /** Line number where paragraph starts */
  startLine: number;
  /** Line number where paragraph ends */
  endLine: number;
}

/**
 * Progress information for streaming
 */
export interface StreamProgress {
  /** Total characters expected (if known) */
  total: number | null;
  /** Characters received so far */
  current: number;
  /** Percentage complete (0-100) */
  percentage: number;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining: number | null;
  /** Bytes per second */
  bytesPerSecond: number | null;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Detailed error information
 */
export interface ProcessingError {
  /** Type of error */
  type: ErrorType;
  /** Human-readable error message */
  message: string;
  /** Detailed error information */
  details?: string;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Timestamp when error occurred */
  timestamp: Timestamp;
  /** Whether this error is retryable */
  isRetryable: boolean;
  /** Number of retry attempts made */
  retryCount: number;
}

// ============================================================================
// Paragraph Types
// ============================================================================

/**
 * Core paragraph entity representing a unit of text to be processed
 */
export interface Paragraph {
  /** Unique identifier for this paragraph */
  id: ParagraphId;
  
  /** Original text as typed by the user */
  originalText: string;
  
  /** AI-transformed text (empty until streaming begins) */
  transformedText: string;
  
  /** Current processing status */
  status: ParagraphStatus;
  
  /** Position within the document */
  position: TextPosition;
  
  /** Streaming progress information */
  progress: StreamProgress;
  
  /** Character-by-character transition map for animation */
  characterMap: CharacterTransition[];
  
  /** Wave animation state */
  waveState: WaveState;
  
  /** Error information if status is ERROR */
  error: ProcessingError | null;
  
  /** When this paragraph was created */
  createdAt: Timestamp;
  
  /** When this paragraph was last updated */
  updatedAt: Timestamp;
  
  /** When processing started (null if not started) */
  processingStartedAt: Timestamp | null;
  
  /** When processing completed (null if not complete) */
  completedAt: Timestamp | null;
}

/**
 * Factory function return type for creating paragraphs
 */
export type CreateParagraphOptions = Pick<
  Paragraph,
  'id' | 'originalText' | 'position'
>;

// ============================================================================
// Queue Management Types
// ============================================================================

/**
 * Priority levels for queue management
 */
export enum QueuePriority {
  /** Low priority - process when slots available */
  LOW = 1,
  /** Normal priority - default */
  NORMAL = 5,
  /** High priority - process as soon as possible */
  HIGH = 10,
}

/**
 * Item in the processing queue
 */
export interface QueueItem {
  /** The paragraph to be processed */
  paragraph: Paragraph;
  
  /** Priority level for processing order */
  priority: QueuePriority;
  
  /** When this item was added to the queue */
  timestamp: Timestamp;
  
  /** Number of retry attempts */
  retryCount: number;
  
  /** Abort controller for cancellation */
  abortController: AbortController;
}

/**
 * Queue state and statistics
 */
export interface QueueState {
  /** Items currently in the queue */
  items: QueueItem[];
  
  /** Maximum concurrent processing slots */
  maxConcurrent: number;
  
  /** Number of currently active processing slots */
  activeCount: number;
  
  /** Total items processed in this session */
  totalProcessed: number;
  
  /** Total items that failed */
  totalFailed: number;
  
  /** Average processing time in milliseconds */
  averageProcessingTime: number;
}

// ============================================================================
// OpenRouter API Types
// ============================================================================

/**
 * Model parameters for API requests
 */
export interface ModelParameters {
  /** Sampling temperature (0-2) */
  temperature: number;
  
  /** Maximum tokens to generate */
  maxTokens: number;
  
  /** Top-p sampling */
  topP?: number;
  
  /** Frequency penalty */
  frequencyPenalty?: number;
  
  /** Presence penalty */
  presencePenalty?: number;
  
  /** Stop sequences */
  stop?: string[];
}

/**
 * Complete configuration for streaming API
 */
export interface StreamConfig {
  /** OpenRouter API key */
  apiKey: string;
  
  /** Selected model */
  model: ModelType;
  
  /** System prompt for the model */
  systemPrompt: string;
  
  /** Model parameters */
  parameters: ModelParameters;
  
  /** Request timeout in milliseconds */
  timeout: number;
  
  /** Maximum retry attempts */
  maxRetries: number;
  
  /** Retry delay multiplier */
  retryDelayMs: number;
}

/**
 * Message in the chat format
 */
export interface ChatMessage {
  /** Role of the message sender */
  role: 'system' | 'user' | 'assistant';
  
  /** Content of the message */
  content: string;
}

/**
 * OpenRouter API request body
 */
export interface OpenRouterRequest {
  /** Model identifier */
  model: string;
  
  /** Array of messages */
  messages: ChatMessage[];
  
  /** Enable streaming */
  stream: boolean;
  
  /** Temperature parameter */
  temperature?: number;
  
  /** Max tokens parameter */
  max_tokens?: number;
  
  /** Top-p parameter */
  top_p?: number;
  
  /** Frequency penalty */
  frequency_penalty?: number;
  
  /** Presence penalty */
  presence_penalty?: number;
  
  /** Stop sequences */
  stop?: string[];
}

/**
 * Streaming chunk from OpenRouter API
 */
export interface StreamChunk {
  /** Chunk ID */
  id: string;
  
  /** Object type */
  object: 'chat.completion.chunk';
  
  /** Creation timestamp */
  created: number;
  
  /** Model used */
  model: string;
  
  /** Choices array */
  choices: Array<{
    /** Index of this choice */
    index: number;
    
    /** Delta content */
    delta: {
      /** Content chunk */
      content?: string;
      
      /** Role if first chunk */
      role?: 'assistant';
    };
    
    /** Finish reason */
    finish_reason: 'stop' | 'length' | null;
  }>;
}

// ============================================================================
// Store Types
// ============================================================================

/**
 * Application state structure
 */
export interface EditorState {
  // Document state
  /** Raw text from the editor */
  rawText: string;
  
  /** Map of paragraph ID to paragraph */
  paragraphs: Map<ParagraphId, Paragraph>;
  
  // Queue state
  /** Current queue state */
  queue: QueueState;
  
  // Configuration
  /** Streaming configuration */
  streamConfig: StreamConfig;
  
  // UI state
  /** Whether settings modal is open */
  isSettingsOpen: boolean;
  
  /** Selected paragraph for inspection */
  selectedParagraphId: ParagraphId | null;
  
  // Statistics
  /** Session statistics */
  statistics: SessionStatistics;
}

/**
 * Session statistics
 */
export interface SessionStatistics {
  /** Total paragraphs processed */
  totalParagraphs: number;
  
  /** Total characters processed */
  totalCharacters: number;
  
  /** Total API calls made */
  totalApiCalls: number;
  
  /** Total errors encountered */
  totalErrors: number;
  
  /** Session start time */
  sessionStartTime: Timestamp;
  
  /** Total processing time in milliseconds */
  totalProcessingTime: number;
}

// ============================================================================
// Action Types for Store
// ============================================================================

/**
 * Actions that can be dispatched to update state
 */
export interface EditorActions {
  // Document actions
  updateRawText: (text: string) => void;
  detectParagraphs: () => void;
  
  // Paragraph actions
  addParagraph: (paragraph: Paragraph) => void;
  updateParagraph: (id: ParagraphId, updates: Partial<Paragraph>) => void;
  removeParagraph: (id: ParagraphId) => void;
  
  // Queue actions
  addToQueue: (paragraphId: ParagraphId, priority?: QueuePriority) => void;
  removeFromQueue: (paragraphId: ParagraphId) => void;
  clearQueue: () => void;
  
  // Configuration actions
  setStreamConfig: (config: Partial<StreamConfig>) => void;
  loadConfigFromStorage: () => void;
  saveConfigToStorage: () => void;
  
  // UI actions
  setSettingsOpen: (isOpen: boolean) => void;
  setSelectedParagraph: (id: ParagraphId | null) => void;
  
  // Stream actions
  startStream: (paragraphId: ParagraphId) => Promise<void>;
  cancelStream: (paragraphId: ParagraphId) => void;
  retryStream: (paragraphId: ParagraphId) => Promise<void>;
  
  // Utility actions
  reset: () => void;
  exportState: () => string;
  importState: (state: string) => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type-safe event emitter events
 */
export interface AppEvents {
  'paragraph:created': Paragraph;
  'paragraph:updated': { id: ParagraphId; updates: Partial<Paragraph> };
  'paragraph:completed': Paragraph;
  'paragraph:error': { paragraph: Paragraph; error: ProcessingError };
  'stream:started': ParagraphId;
  'stream:chunk': { id: ParagraphId; chunk: string };
  'stream:completed': ParagraphId;
  'queue:changed': QueueState;
}

/**
 * Type guard for checking paragraph status
 */
export const isParagraphProcessing = (
  paragraph: Paragraph
): boolean => {
  return (
    paragraph.status === ParagraphStatus.PROCESSING ||
    paragraph.status === ParagraphStatus.STREAMING ||
    paragraph.status === ParagraphStatus.QUEUED
  );
};

/**
 * Type guard for checking if paragraph has error
 */
export const isParagraphError = (
  paragraph: Paragraph
): paragraph is Paragraph & { error: ProcessingError } => {
  return paragraph.status === ParagraphStatus.ERROR && paragraph.error !== null;
};

/**
 * Type guard for checking if paragraph is complete
 */
export const isParagraphComplete = (
  paragraph: Paragraph
): boolean => {
  return paragraph.status === ParagraphStatus.COMPLETE;
};
```

#### Verification
- [ ] File created at `src/types/index.ts`
- [ ] All types compile without errors
- [ ] TypeScript IntelliSense shows type hints
- [ ] No `any` types used

---

### Step 2: Create Utility Type Helpers

**Purpose:** Add helper functions and type utilities for common operations  
**Duration:** 20 minutes

#### Instructions

1. Create `src/types/guards.ts` for type guards:

```typescript
/**
 * Type guard utilities for runtime type checking
 */

import {
  Paragraph,
  ParagraphStatus,
  ProcessingError,
  StreamChunk,
  QueueItem,
} from './index';

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
```

2. Create `src/types/factories.ts` for creating typed objects:

```typescript
/**
 * Factory functions for creating typed objects with defaults
 */

import {
  Paragraph,
  ParagraphId,
  ParagraphStatus,
  TextPosition,
  StreamProgress,
  WaveState,
  CharacterTransition,
  CreateParagraphOptions,
  StreamConfig,
  ModelParameters,
  ProcessingError,
  ErrorType,
  QueueItem,
  QueuePriority,
  QueueState,
  SessionStatistics,
} from './index';
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
```

#### Verification
- [ ] `guards.ts` created with type guards
- [ ] `factories.ts` created with factory functions
- [ ] All functions have proper return types
- [ ] No circular dependencies

---

### Step 3: Create Constants Integration

**Purpose:** Update constants file with proper type annotations  
**Duration:** 15 minutes

#### Instructions

1. Update `src/constants/index.ts` with proper types:

```typescript
/**
 * Application-wide constants with proper TypeScript types
 */

import { ModelType } from '../types';

// ============================================================================
// Application Info
// ============================================================================

export const APP_NAME = 'Cascade-Edit' as const;
export const APP_VERSION = '0.1.0' as const;

// ============================================================================
// Paragraph Detection
// ============================================================================

/** Regex pattern for detecting paragraph separators (double newline) */
export const PARAGRAPH_SEPARATOR = /\n\n+/;

/** Debounce delay for paragraph detection in milliseconds */
export const PARAGRAPH_DETECTION_DEBOUNCE = 500 as const;

/** Minimum paragraph length to process (characters) */
export const MIN_PARAGRAPH_LENGTH = 10 as const;

/** Maximum paragraph length to process (characters) */
export const MAX_PARAGRAPH_LENGTH = 5000 as const;

// ============================================================================
// Queue Configuration
// ============================================================================

/** Maximum number of concurrent API streams */
export const MAX_CONCURRENT_STREAMS = 3 as const;

/** Request timeout in milliseconds */
export const STREAM_TIMEOUT = 30000 as const;

/** Maximum retry attempts for failed requests */
export const MAX_RETRY_ATTEMPTS = 3 as const;

/** Base delay for exponential backoff (milliseconds) */
export const RETRY_BASE_DELAY = 1000 as const;

// ============================================================================
// Animation Configuration
// ============================================================================

/** Number of characters in the wave effect */
export const WAVE_WIDTH = 5 as const;

/** Duration of character animation in seconds */
export const ANIMATION_DURATION = 0.3 as const;

/** Delay between character animations in seconds */
export const CHARACTER_DELAY = 0.05 as const;

/** Target frames per second for animations */
export const ANIMATION_FPS = 60 as const;

// ============================================================================
// Animation Colors
// ============================================================================

/** Color for pending/original text */
export const COLOR_PENDING = '#6b7280' as const; // gray-500

/** Color for animating characters */
export const COLOR_ANIMATING = '#3b82f6' as const; // blue-500

/** Color for complete/transformed text */
export const COLOR_COMPLETE = '#10b981' as const; // green-500

/** Color for error state */
export const COLOR_ERROR = '#ef4444' as const; // red-500

// ============================================================================
// OpenRouter Configuration
// ============================================================================

/** OpenRouter API base URL */
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions' as const;

/** Default AI model */
export const DEFAULT_MODEL: ModelType = 'anthropic/claude-3.5-sonnet';

/** Default temperature parameter */
export const DEFAULT_TEMPERATURE = 0.7 as const;

/** Default max tokens */
export const DEFAULT_MAX_TOKENS = 1000 as const;

/** Default system prompt */
export const DEFAULT_SYSTEM_PROMPT = 
  'You are a helpful writing assistant. Improve grammar, clarity, and style while preserving the author\'s voice and intent.' as const;

// ============================================================================
// UI Configuration
// ============================================================================

/** Placeholder text for editor */
export const EDITOR_PLACEHOLDER = 
  'Start typing... Use double enters (↵↵) to complete a paragraph and trigger AI enhancement.' as const;

/** Toast notification duration (milliseconds) */
export const TOAST_DURATION = 3000 as const;

/** Auto-save delay (milliseconds) */
export const AUTO_SAVE_DELAY = 2000 as const;

// ============================================================================
// Storage Keys
// ============================================================================

/** LocalStorage key for API key */
export const STORAGE_KEY_API_KEY = 'cascade-edit-api-key' as const;

/** LocalStorage key for configuration */
export const STORAGE_KEY_CONFIG = 'cascade-edit-config' as const;

/** LocalStorage key for session data */
export const STORAGE_KEY_SESSION = 'cascade-edit-session' as const;

// ============================================================================
// Model Options
// ============================================================================

/** Available model options for dropdown */
export const MODEL_OPTIONS: Array<{ value: ModelType; label: string; description: string }> = [
  {
    value: 'anthropic/claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet',
    description: 'Best balance of intelligence and speed',
  },
  {
    value: 'anthropic/claude-3-opus',
    label: 'Claude 3 Opus',
    description: 'Most capable model for complex tasks',
  },
  {
    value: 'anthropic/claude-3-sonnet',
    label: 'Claude 3 Sonnet',
    description: 'Fast and capable for most tasks',
  },
  {
    value: 'openai/gpt-4-turbo',
    label: 'GPT-4 Turbo',
    description: 'OpenAI\'s latest and most capable model',
  },
  {
    value: 'openai/gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    description: 'Fast and cost-effective',
  },
] as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  NO_API_KEY: 'Please configure your OpenRouter API key in settings',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  API_ERROR: 'API error. Please try again.',
  AUTH_ERROR: 'Invalid API key. Please check your settings.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  RATE_LIMIT_ERROR: 'Rate limit exceeded. Please wait and try again.',
  CONFIG_ERROR: 'Invalid configuration. Please check your settings.',
  PARSE_ERROR: 'Failed to parse API response.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;
```

#### Verification
- [ ] All constants have proper types
- [ ] Constants use `as const` for literal types
- [ ] No magic numbers in codebase (use constants)
- [ ] Model options array is properly typed

---

### Step 4: Create Validation Utilities

**Purpose:** Add runtime validation for complex types  
**Duration:** 20 minutes

#### Instructions

1. Create `src/utils/validation.ts`:

```typescript
/**
 * Validation utilities for runtime type checking and data validation
 */

import {
  Paragraph,
  StreamConfig,
  ModelParameters,
  ProcessingError,
  TextPosition,
} from '../types';
import {
  MIN_PARAGRAPH_LENGTH,
  MAX_PARAGRAPH_LENGTH,
} from '../constants';

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate paragraph text
 */
export const validateParagraphText = (text: string): ValidationResult => {
  const errors: string[] = [];
  
  if (text.length < MIN_PARAGRAPH_LENGTH) {
    errors.push(`Paragraph must be at least ${MIN_PARAGRAPH_LENGTH} characters`);
  }
  
  if (text.length > MAX_PARAGRAPH_LENGTH) {
    errors.push(`Paragraph must be less than ${MAX_PARAGRAPH_LENGTH} characters`);
  }
  
  if (text.trim().length === 0) {
    errors.push('Paragraph cannot be empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate API key format
 */
export const validateApiKey = (apiKey: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!apiKey || apiKey.trim().length === 0) {
    errors.push('API key is required');
  }
  
  if (apiKey && !apiKey.startsWith('sk-or-')) {
    errors.push('API key should start with "sk-or-"');
  }
  
  if (apiKey && apiKey.length < 20) {
    errors.push('API key appears to be invalid (too short)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate model parameters
 */
export const validateModelParameters = (
  params: ModelParameters
): ValidationResult => {
  const errors: string[] = [];
  
  if (params.temperature < 0 || params.temperature > 2) {
    errors.push('Temperature must be between 0 and 2');
  }
  
  if (params.maxTokens < 1 || params.maxTokens > 4000) {
    errors.push('Max tokens must be between 1 and 4000');
  }
  
  if (params.topP !== undefined && (params.topP < 0 || params.topP > 1)) {
    errors.push('Top-p must be between 0 and 1');
  }
  
  if (
    params.frequencyPenalty !== undefined &&
    (params.frequencyPenalty < -2 || params.frequencyPenalty > 2)
  ) {
    errors.push('Frequency penalty must be between -2 and 2');
  }
  
  if (
    params.presencePenalty !== undefined &&
    (params.presencePenalty < -2 || params.presencePenalty > 2)
  ) {
    errors.push('Presence penalty must be between -2 and 2');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate stream configuration
 */
export const validateStreamConfig = (config: StreamConfig): ValidationResult => {
  const errors: string[] = [];
  
  // Validate API key
  const apiKeyValidation = validateApiKey(config.apiKey);
  if (!apiKeyValidation.isValid) {
    errors.push(...apiKeyValidation.errors);
  }
  
  // Validate parameters
  const paramsValidation = validateModelParameters(config.parameters);
  if (!paramsValidation.isValid) {
    errors.push(...paramsValidation.errors);
  }
  
  // Validate system prompt
  if (!config.systemPrompt || config.systemPrompt.trim().length === 0) {
    errors.push('System prompt is required');
  }
  
  if (config.systemPrompt && config.systemPrompt.length > 2000) {
    errors.push('System prompt is too long (max 2000 characters)');
  }
  
  // Validate timeout
  if (config.timeout < 1000 || config.timeout > 120000) {
    errors.push('Timeout must be between 1 and 120 seconds');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize text input
 */
export const sanitizeText = (text: string): string => {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
};

/**
 * Validate text position
 */
export const validateTextPosition = (
  position: TextPosition,
  textLength: number
): ValidationResult => {
  const errors: string[] = [];
  
  if (position.startIndex < 0) {
    errors.push('Start index cannot be negative');
  }
  
  if (position.endIndex > textLength) {
    errors.push('End index exceeds text length');
  }
  
  if (position.startIndex >= position.endIndex) {
    errors.push('Start index must be less than end index');
  }
  
  if (position.startLine < 1) {
    errors.push('Start line must be at least 1');
  }
  
  if (position.endLine < position.startLine) {
    errors.push('End line must be greater than or equal to start line');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

#### Verification
- [ ] Validation functions created
- [ ] All functions return `ValidationResult`
- [ ] Edge cases handled
- [ ] Type-safe validation

---

### Step 5: Document Types with JSDoc

**Purpose:** Add comprehensive documentation for all types  
**Duration:** 30 minutes

#### Instructions

This step involves reviewing all type definitions and ensuring they have:
1. JSDoc comments explaining their purpose
2. Examples where appropriate
3. Links to related types
4. Notes about usage patterns

This has already been included in Step 1, but verify:

- [ ] All interfaces have JSDoc comments
- [ ] Complex types have usage examples
- [ ] Enums document each value
- [ ] Type relationships are clear

---

## Testing Procedures

### Type System Testing

1. **Create test file** `src/types/__tests__/types.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  createParagraph,
  createDefaultStreamConfig,
  generateParagraphId,
} from '../factories';
import { validateParagraphText, validateApiKey } from '../../utils/validation';
import { isParagraphActive, isParagraphTerminal } from '../guards';
import { ParagraphStatus } from '../index';

describe('Type Factories', () => {
  it('should create paragraph with defaults', () => {
    const paragraph = createParagraph({
      id: 'test-1',
      originalText: 'Test paragraph',
      position: {
        startIndex: 0,
        endIndex: 14,
        startLine: 1,
        endLine: 1,
      },
    });
    
    expect(paragraph.id).toBe('test-1');
    expect(paragraph.status).toBe(ParagraphStatus.PENDING);
    expect(paragraph.transformedText).toBe('');
    expect(paragraph.error).toBeNull();
  });
  
  it('should generate unique IDs', () => {
    const id1 = generateParagraphId();
    const id2 = generateParagraphId();
    
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^para_/);
  });
});

describe('Validation', () => {
  it('should validate paragraph text', () => {
    const valid = validateParagraphText('This is a valid paragraph');
    expect(valid.isValid).toBe(true);
    
    const tooShort = validateParagraphText('Short');
    expect(tooShort.isValid).toBe(false);
  });
  
  it('should validate API keys', () => {
    const valid = validateApiKey('sk-or-v1-1234567890abcdef');
    expect(valid.isValid).toBe(true);
    
    const invalid = validateApiKey('invalid');
    expect(invalid.isValid).toBe(false);
  });
});

describe('Type Guards', () => {
  it('should identify active paragraphs', () => {
    const paragraph = createParagraph({
      id: 'test',
      originalText: 'Test',
      position: { startIndex: 0, endIndex: 4, startLine: 1, endLine: 1 },
    });
    
    paragraph.status = ParagraphStatus.STREAMING;
    expect(isParagraphActive(paragraph)).toBe(true);
    
    paragraph.status = ParagraphStatus.COMPLETE;
    expect(isParagraphActive(paragraph)).toBe(false);
    expect(isParagraphTerminal(paragraph)).toBe(true);
  });
});
```

2. **Run type checking**:
   ```bash
   npm run type-check
   ```

3. **Verify IntelliSense**:
   - Open any TypeScript file
   - Start typing a type name
   - Verify autocomplete shows all types
   - Hover over types to see documentation

---

## Troubleshooting

### Common Issues

#### Issue: Circular dependency errors
**Solution:**
- Move shared types to separate files
- Use type-only imports: `import type { ... }`
- Check import order

#### Issue: Type 'any' implicitly has type 'any'
**Solution:**
- Add explicit type annotations
- Check `tsconfig.json` has `noImplicitAny: true`
- Use proper generic constraints

#### Issue: Cannot find module errors
**Solution:**
- Verify path aliases in `tsconfig.json`
- Restart TypeScript server in VS Code
- Check file extensions are correct

#### Issue: Types not updating in IDE
**Solution:**
```bash
# Restart TypeScript server (VS Code)
Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"

# Or restart dev server
npm run dev
```

---

## Phase Completion Checklist

- [ ] **Type definitions complete**
  - [ ] All interfaces defined in `types/index.ts`
  - [ ] Proper JSDoc comments on all types
  - [ ] No `any` types anywhere
  - [ ] Enums for all status types

- [ ] **Utility files created**
  - [ ] `types/guards.ts` with type guards
  - [ ] `types/factories.ts` with factory functions
  - [ ] All functions properly typed

- [ ] **Constants updated**
  - [ ] Proper TypeScript types
  - [ ] Used `as const` where appropriate
  - [ ] Model options array typed

- [ ] **Validation utilities**
  - [ ] `utils/validation.ts` created
  - [ ] All validation functions return `ValidationResult`
  - [ ] Edge cases handled

- [ ] **Documentation**
  - [ ] JSDoc comments on all public APIs
  - [ ] Complex types have examples
  - [ ] Type relationships clear

- [ ] **Testing**
  - [ ] Type checking passes
  - [ ] IntelliSense works correctly
  - [ ] No circular dependencies

---

## Next Steps

1. **Commit your work:**
   ```bash
   git add src/types src/utils
   git commit -m "feat: complete Phase 2 - core type system"
   git push
   ```

2. **Proceed to Phase 3:**
   - Open `Phase3.md`
   - Begin implementing Zustand store
   - Use the types defined in this phase

---

**Phase Status:** ✅ Ready for Implementation  
**Next Phase:** Phase 3 - State Management & Store Implementation  
**Dependencies:** Requires Phase 2 completion
