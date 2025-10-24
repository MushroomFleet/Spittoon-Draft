/**
 * Validation utilities for runtime type checking and data validation
 */

import type { StreamConfig, ModelParameters, TextPosition } from '../types';
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
