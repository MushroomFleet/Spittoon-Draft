/**
 * Application-wide constants with proper TypeScript types
 */

import type { ModelType } from '../types';

// ============================================================================
// Application Info
// ============================================================================

export const APP_NAME = 'Spittoon-Draft' as const;
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

/** Delay before inline text replacement to allow wave animation to complete (milliseconds) */
export const WAVE_ANIMATION_DELAY = 2500 as const;

// ============================================================================
// Animation Colors - NSL Palette
// ============================================================================

/** Color for pending/original text - Muted gray-purple */
export const COLOR_PENDING = 'hsl(250 10% 65%)'; // muted-foreground

/** Color for animating characters - Primary purple */
export const COLOR_ANIMATING = 'hsl(263 70% 60%)'; // primary

/** Color for complete/transformed text - Success green */
export const COLOR_COMPLETE = 'hsl(142 71% 45%)'; // success

/** Color for error state - Destructive red */
export const COLOR_ERROR = 'hsl(0 72% 51%)'; // destructive

// ============================================================================
// OpenRouter Configuration
// ============================================================================

/** OpenRouter API base URL */
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions' as const;

/** Default AI model */
export const DEFAULT_MODEL: ModelType = 'x-ai/grok-4-fast';

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
  'Start typing... Press Space then Backspace to send text for AI enhancement.' as const;

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
export const MODEL_OPTIONS: ReadonlyArray<{ 
  value: ModelType; 
  label: string; 
  description: string;
}> = [
  {
    value: 'x-ai/grok-4-fast',
    label: 'Grok 4 Fast',
    description: 'Ultra-fast and highly capable (Default)',
  },
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

// ============================================================================
// Single-View Mode Prompts
// ============================================================================

/** System prompt presets optimized for single-view inline enhancement */
export const SINGLE_VIEW_PROMPTS = {
  ENHANCE: 'Enhance and improve the following text while preserving its meaning. Make it more polished and professional.',
  EXPAND: 'Expand on the following text with additional detail and examples. Keep the core message but elaborate.',
  SIMPLIFY: 'Simplify the following text. Make it clearer and more concise.',
  CREATIVE: 'Rewrite the following text to be more creative, vivid, and engaging.',
  CONTINUE: 'Continue writing from where this text leaves off. Maintain the same style and tone.',
  PROFESSIONAL: 'Rewrite the following text in a professional, formal tone.',
  CASUAL: 'Rewrite the following text in a casual, conversational tone.',
  UNO: 'You are UNO (Unified Narrative Operator), an advanced literary assistant. Enhance this text while preserving narrative integrity. Apply: Golden Shadow development (expand underdeveloped elements), environmental expansion (enrich setting details), action scene enrichment, prose smoothing (improve flow), and repetition elimination (vary language). Maintain the author\'s unique voice, style, and intent. All dialogue must be preserved exactly. Focus on enriching description and atmosphere without changing the core narrative.',
  CUSTOM: '', // User will provide their own prompt
} as const;

/** Prompt preset labels for UI display */
export const PROMPT_PRESET_LABELS: Record<string, string> = {
  enhance: '✨ Enhance',
  expand: '📝 Expand',
  simplify: '🎯 Simplify',
  creative: '🎨 Creative',
  continue: '➡️ Continue',
  professional: '💼 Professional',
  casual: '😊 Casual',
  uno: '🎭 UNO (Narrative)',
  custom: '✏️ Custom',
} as const;
