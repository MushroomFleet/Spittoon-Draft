import { describe, it, expect } from 'vitest';
import {
  validateParagraphText,
  validateApiKey,
  validateStreamConfig,
} from '../validation';
import { createDefaultStreamConfig } from '../../types/factories';

describe('validation', () => {
  describe('validateParagraphText', () => {
    it('should accept valid text', () => {
      const result = validateParagraphText('This is a valid paragraph with enough characters');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject too short text', () => {
      const result = validateParagraphText('Short');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject empty text', () => {
      const result = validateParagraphText('   ');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateApiKey', () => {
    it('should accept valid API key format', () => {
      const result = validateApiKey('sk-or-v1-1234567890abcdef1234567890abcdef');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty key', () => {
      const result = validateApiKey('');
      expect(result.isValid).toBe(false);
    });

    it('should reject whitespace only', () => {
      const result = validateApiKey('   ');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateStreamConfig', () => {
    it('should accept valid config', () => {
      const config = createDefaultStreamConfig('sk-or-v1-validkey123');
      const result = validateStreamConfig(config);
      expect(result.isValid).toBe(true);
    });

    it('should reject config without API key', () => {
      const config = createDefaultStreamConfig('');
      const result = validateStreamConfig(config);
      expect(result.isValid).toBe(false);
    });

    it('should reject invalid temperature', () => {
      const config = createDefaultStreamConfig('sk-or-v1-validkey123');
      config.parameters.temperature = 5; // Invalid - max is 2

      const result = validateStreamConfig(config);
      expect(result.isValid).toBe(false);
    });
  });
});
