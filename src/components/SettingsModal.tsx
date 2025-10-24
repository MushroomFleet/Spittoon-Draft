/**
 * SettingsModal - Configuration interface
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '../store/editorStore';
import type { StreamConfig, ModelType } from '../types';
import { validateStreamConfig } from '../utils/validation';
import { createDefaultStreamConfig } from '../types/factories';
import { MODEL_OPTIONS } from '../constants';
import { toast } from './Toast';

export const SettingsModal: React.FC = () => {
  const isOpen = useEditorStore((state) => state.isSettingsOpen);
  const setSettingsOpen = useEditorStore((state) => state.setSettingsOpen);
  const streamConfig = useEditorStore((state) => state.streamConfig);
  const setStreamConfig = useEditorStore((state) => state.setStreamConfig);

  // Local state for editing
  const [config, setConfig] = useState<StreamConfig>(streamConfig);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfig(streamConfig);
      setErrors([]);
      setHasChanges(false);
    }
  }, [isOpen, streamConfig]);

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(config) !== JSON.stringify(streamConfig);
    setHasChanges(changed);
  }, [config, streamConfig]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, hasChanges]);

  // Handle save
  const handleSave = () => {
    // Validate configuration
    const validation = validateStreamConfig(config);

    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix validation errors before saving');
      return;
    }

    // Save to store
    setStreamConfig(config);
    setErrors([]);
    toast.success('Settings saved successfully!');
    setSettingsOpen(false);
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('Discard unsaved changes?')) {
        setSettingsOpen(false);
      }
    } else {
      setSettingsOpen(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  // Handle reset to defaults
  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      setConfig(createDefaultStreamConfig(config.apiKey));
      setErrors([]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card rounded-lg shadow-elegant w-full max-w-3xl max-h-[90vh] overflow-hidden border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="gradient-primary px-6 py-4">
            <h2 className="text-2xl font-bold text-primary-foreground">Settings</h2>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Configure API access and model parameters
            </p>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-card">
            {/* Error Display */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-md">
                <div className="font-semibold text-destructive mb-2">
                  Please fix the following errors:
                </div>
                <ul className="list-disc list-inside text-sm text-destructive/90 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Settings Sections */}
            <div className="space-y-6">
              {/* API Key Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  OpenRouter API Key
                  <span className="text-destructive ml-1">*</span>
                </label>

                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-ring transition-smooth font-mono text-sm"
                    placeholder="sk-or-v1-..."
                  />

                  {/* Show/Hide Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showApiKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showApiKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <span>💡</span>
                  <span>
                    Get your API key from{' '}
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      openrouter.ai/keys
                    </a>
                  </span>
                </p>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  AI Model
                  <span className="text-destructive ml-1">*</span>
                </label>

                <select
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value as ModelType })}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring transition-smooth"
                >
                  {MODEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Model Description */}
                {(() => {
                  const selectedModel = MODEL_OPTIONS.find((m) => m.value === config.model);
                  return selectedModel ? (
                    <p className="text-xs text-muted-foreground">{selectedModel.description}</p>
                  ) : null;
                })()}
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  System Prompt
                  <span className="text-destructive ml-1">*</span>
                </label>

                <textarea
                  value={config.systemPrompt}
                  onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring transition-smooth resize-none font-mono text-sm"
                  placeholder="Enter instructions for the AI..."
                />

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Define how the AI should transform your text
                  </p>
                  <span className="text-xs text-muted-foreground font-mono">
                    {config.systemPrompt.length} / 2000
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        systemPrompt:
                          "You are a helpful writing assistant. Improve grammar, clarity, and style while preserving the author's voice and intent.",
                      })
                    }
                    className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 text-foreground rounded transition-smooth"
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        systemPrompt:
                          'Make this text more professional and formal while maintaining clarity.',
                      })
                    }
                    className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 text-foreground rounded transition-smooth"
                  >
                    Professional
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        systemPrompt:
                          'Make this text more casual and conversational while keeping the main ideas.',
                      })
                    }
                    className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 text-foreground rounded transition-smooth"
                  >
                    Casual
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        systemPrompt:
                          'Fix grammar and spelling errors only. Do not change the style or meaning.',
                      })
                    }
                    className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 text-foreground rounded transition-smooth"
                  >
                    Grammar Only
                  </button>
                </div>
              </div>

              {/* Model Parameters */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-sm">Model Parameters</h3>

                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-foreground">Temperature</label>
                    <span className="text-sm font-mono text-muted-foreground">
                      {config.parameters.temperature.toFixed(1)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.parameters.temperature}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        parameters: {
                          ...config.parameters,
                          temperature: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-primary"
                  />

                  <p className="text-xs text-muted-foreground">
                    Higher values make output more creative and random. Lower values make it more
                    focused and deterministic.
                  </p>
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-foreground">Max Tokens</label>
                    <input
                      type="number"
                      min="100"
                      max="4000"
                      value={config.parameters.maxTokens}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          parameters: {
                            ...config.parameters,
                            maxTokens: parseInt(e.target.value) || 1000,
                          },
                        })
                      }
                      className="w-24 px-2 py-1 border border-input bg-background text-foreground rounded text-sm font-mono text-right"
                    />
                  </div>

                  <input
                    type="range"
                    min="100"
                    max="4000"
                    step="100"
                    value={config.parameters.maxTokens}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        parameters: {
                          ...config.parameters,
                          maxTokens: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-primary"
                  />

                  <p className="text-xs text-muted-foreground">
                    Maximum length of the generated response. Higher values allow longer
                    transformations but may cost more.
                  </p>
                </div>

                {/* Advanced Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-primary hover:text-primary-glow font-medium"
                >
                  {showAdvanced ? '▼' : '▶'} Advanced Parameters
                </button>

                {/* Advanced Parameters */}
                {showAdvanced && (
                  <div className="pl-4 space-y-4 border-l-2 border-border">
                    {/* Top-P */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-foreground">Top-P</label>
                        <span className="text-sm font-mono text-muted-foreground">
                          {config.parameters.topP?.toFixed(2) || '1.00'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.parameters.topP || 1}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            parameters: {
                              ...config.parameters,
                              topP: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        Nucleus sampling threshold. Lower values make output more focused.
                      </p>
                    </div>

                    {/* Frequency Penalty */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-foreground">Frequency Penalty</label>
                        <span className="text-sm font-mono text-muted-foreground">
                          {config.parameters.frequencyPenalty?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={config.parameters.frequencyPenalty || 0}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            parameters: {
                              ...config.parameters,
                              frequencyPenalty: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        Penalizes repeated tokens. Positive values discourage repetition.
                      </p>
                    </div>

                    {/* Presence Penalty */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-foreground">Presence Penalty</label>
                        <span className="text-sm font-mono text-muted-foreground">
                          {config.parameters.presencePenalty?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={config.parameters.presencePenalty || 0}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            parameters: {
                              ...config.parameters,
                              presencePenalty: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        Penalizes new topics. Positive values encourage topic diversity.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-muted px-6 py-4 flex items-center justify-between border-t border-border">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-smooth"
            >
              Reset to Defaults
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-foreground hover:bg-secondary rounded-md transition-smooth"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                {hasChanges && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
                <button
                  onClick={handleSave}
                  className="px-6 py-2 gradient-primary text-primary-foreground hover:opacity-90 rounded-md transition-smooth font-medium shadow-glow"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
