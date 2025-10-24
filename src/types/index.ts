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
 * Unique identifier for prompt regions in single-view
 */
export type PromptId = string;

/**
 * Timestamp in milliseconds since epoch
 */
export type Timestamp = number;

/**
 * View mode type
 */
export type ViewMode = 'split' | 'single' | 'bucket';

/**
 * System prompt presets for single-view mode
 */
export type PromptPreset = 
  | 'enhance'
  | 'expand'
  | 'simplify'
  | 'creative'
  | 'continue'
  | 'professional'
  | 'casual'
  | 'uno'
  | 'custom';

// ============================================================================
// NSL Bucket Types
// ============================================================================

/**
 * Category of bucket file
 */
export type BucketFileCategory = 'framework' | 'world' | 'character' | 'document';

/**
 * A virtual file extracted from NSL bucket
 */
export interface BucketFile {
  /** Filename in virtual bucket structure */
  filename: string;
  
  /** File content (markdown format) */
  content: string;
  
  /** Category for organization */
  category: BucketFileCategory;
  
  /** Whether this file is required for valid bucket */
  isRequired: boolean;
  
  /** When this file was last modified (for edit tracking) */
  lastModified: Timestamp;
}

/**
 * NSL metadata extracted from file
 */
export interface NSLMetadata {
  /** Project title */
  title: string;
  
  /** Author name if specified */
  author?: string;
  
  /** NSL version */
  version: string;
  
  /** When bucket was imported */
  importedAt: Timestamp;
  
  /** Series information if multi-volume */
  seriesInfo?: {
    type: string;
    totalVolumes: number;
    currentVolume: string | number;
  };
}

/**
 * Result of NSL validation
 */
export interface ValidationResult {
  /** Whether the bucket is valid */
  valid: boolean;
  
  /** Validation errors if any */
  errors: string[];
  
  /** Validation warnings (non-critical) */
  warnings?: string[];
}

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
  | 'x-ai/grok-4-fast'
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
 * Text selection range for single-view mode
 */
export interface TextSelection {
  /** Starting character index */
  start: number;
  /** Ending character index */
  end: number;
  /** Selected text content */
  text: string;
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
// Single-View Mode Types
// ============================================================================

/**
 * Prompt region in single-view mode
 * Created from user's text selection for inline enhancement
 */
export interface PromptRegion {
  /** Unique identifier */
  id: PromptId;
  
  /** Character index where selection starts */
  startIndex: number;
  
  /** Character index where selection ends */
  endIndex: number;
  
  /** Original selected text */
  originalText: string;
  
  /** AI-transformed text */
  transformedText: string;
  
  /** Processing status */
  status: ParagraphStatus;
  
  /** Streaming progress */
  progress: StreamProgress;
  
  /** Character transition map for animation */
  characterMap: CharacterTransition[];
  
  /** Wave animation state */
  waveState: WaveState;
  
  /** Error if processing failed */
  error: ProcessingError | null;
  
  /** Timestamps */
  createdAt: Timestamp;
  updatedAt: Timestamp;
  processingStartedAt: Timestamp | null;
  completedAt: Timestamp | null;
}

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
  
  // View mode
  /** Current view mode */
  viewMode: ViewMode;
  
  // NSL Bucket state
  /** Imported bucket files (null if no bucket imported) */
  bucketFiles: Map<string, BucketFile> | null;
  
  /** Whether an NSL bucket has been imported */
  isBucketImported: boolean;
  
  /** Whether bucket context should be included in prompts */
  isBucketEnabled: boolean;
  
  /** Metadata from imported NSL file */
  nslMetadata: NSLMetadata | null;
  
  // Single-view state
  /** Text content in single-view mode */
  singleViewText: string;
  
  /** Map of prompt ID to prompt region */
  singleViewPrompts: Map<PromptId, PromptRegion>;
  
  /** Current text selection in single-view */
  currentSelection: TextSelection | null;
  
  /** Selected prompt preset */
  selectedPromptPreset: PromptPreset;
  
  /** Custom system prompt (when preset is 'custom') */
  customSystemPrompt: string;
  
  /** Active processing ranges for visual highlighting */
  activeProcessingRanges: Array<{
    promptId: PromptId;
    searchText: string;      // The original text being enhanced
    occurrence: number;      // Which occurrence (1st, 2nd, 3rd, etc.)
  }>;
  
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
  
  // Single-view mode actions
  setViewMode: (mode: ViewMode) => void;
  updateSingleViewText: (text: string) => void;
  setCurrentSelection: (selection: TextSelection | null) => void;
  setSelectedPromptPreset: (preset: PromptPreset) => void;
  setCustomSystemPrompt: (prompt: string) => void;
  enhanceSelection: () => void;
  updatePrompt: (id: PromptId, updates: Partial<PromptRegion>) => void;
  replaceTextInline: (promptId: PromptId) => void;
  
  // NSL Bucket actions
  importNSLFile: (file: File) => Promise<void>;
  clearNSLImport: () => Promise<void>;
  toggleBucketEnabled: () => void;
  updateBucketFile: (filename: string, content: string) => Promise<void>;
  loadBucketFromStorage: () => Promise<void>;
  
  // Export actions
  exportToMarkdown: () => void;
  
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
