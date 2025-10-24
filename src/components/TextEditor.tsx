/**
 * TextEditor - Main component with split-pane layout
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useParagraphs } from '../store/hooks';
import { queueManager } from '../services/queueManager';
import { ParagraphDisplay } from './ParagraphDisplay';
import { EditorHeader } from './EditorHeader';
import { EditorStats } from './EditorStats';
import { EmptyState } from './EmptyState';
import { SettingsModal } from './SettingsModal';
import { SingleViewEditor } from './SingleViewEditor';
import { BucketView } from './BucketView';
import { WorkerStatusLights } from './WorkerStatusLights';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { EDITOR_PLACEHOLDER, PROMPT_PRESET_LABELS } from '../constants';
import type { PromptPreset } from '../types';

export const TextEditor: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputPanelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll state
  const [autoScroll, setAutoScroll] = useState(true);

  // Store state
  const viewMode = useEditorStore((state) => state.viewMode);
  const rawText = useEditorStore((state) => state.rawText);
  const updateRawText = useEditorStore((state) => state.updateRawText);
  const detectParagraphs = useEditorStore((state) => state.detectParagraphs);
  const retryStream = useEditorStore((state) => state.retryStream);
  const cancelStream = useEditorStore((state) => state.cancelStream);
  const setSettingsOpen = useEditorStore((state) => state.setSettingsOpen);
  const clearQueue = useEditorStore((state) => state.clearQueue);
  const reset = useEditorStore((state) => state.reset);
  
  // Prompt preset state
  const selectedPromptPreset = useEditorStore((state) => state.selectedPromptPreset);
  const setSelectedPromptPreset = useEditorStore((state) => state.setSelectedPromptPreset);
  const customSystemPrompt = useEditorStore((state) => state.customSystemPrompt);
  const setCustomSystemPrompt = useEditorStore((state) => state.setCustomSystemPrompt);

  // Get paragraphs (sorted by position)
  const paragraphs = useParagraphs();

  // Initialize queue manager
  useEffect(() => {
    queueManager.startProcessing();

    return () => {
      queueManager.stopProcessing();
    };
  }, []);

  // Handle text changes (no automatic detection)
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      updateRawText(newText);
    },
    [updateRawText]
  );
  

  // Handle retry
  const handleRetry = useCallback(
    (id: string) => {
      retryStream(id);
    },
    [retryStream]
  );

  // Handle cancel
  const handleCancel = useCallback(
    (id: string) => {
      cancelStream(id);
    },
    [cancelStream]
  );

  // Handle manual scrolling
  const handleOutputScroll = useCallback(() => {
    if (!outputPanelRef.current) return;

    const panel = outputPanelRef.current;
    const isAtBottom =
      Math.abs(panel.scrollHeight - panel.scrollTop - panel.clientHeight) < 50;

    setAutoScroll(isAtBottom);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScroll || !outputPanelRef.current) return;

    const panel = outputPanelRef.current;
    panel.scrollTo({
      top: panel.scrollHeight,
      behavior: 'smooth',
    });
  }, [paragraphs, autoScroll]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'e',
      ctrl: true,
      handler: detectParagraphs,
      description: 'Detect and Enhance Paragraphs',
    },
    {
      key: ',',
      ctrl: true,
      handler: () => setSettingsOpen(true),
      description: 'Open Settings',
    },
    {
      key: 'k',
      ctrl: true,
      handler: () => clearQueue(),
      description: 'Clear Queue',
    },
    {
      key: 'r',
      ctrl: true,
      shift: true,
      handler: () => {
        if (confirm('Reset all data? This cannot be undone.')) {
          reset();
        }
      },
      description: 'Reset All',
    },
  ]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Settings Modal */}
      <SettingsModal />

      {/* Header */}
      <EditorHeader />

      {/* Conditional rendering based on view mode */}
      {viewMode === 'bucket' ? (
        /* Bucket View */
        <BucketView />
      ) : viewMode === 'split' ? (
        /* Main Content - Split Pane */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Input */}
        <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-card h-1/2 lg:h-full">
          {/* Input Header */}
          <div className="bg-secondary text-secondary-foreground px-4 py-2 font-semibold flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <span>Your Writing</span>
              <WorkerStatusLights />
            </div>
            <div className="text-xs text-muted-foreground font-mono">{rawText.length} characters</div>
          </div>

          {/* Prompt Preset Selector */}
          <div className="px-4 py-2 bg-muted border-b border-border flex items-center gap-3">
            <label htmlFor="split-preset-select" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Enhancement Style:
            </label>
            <select
              id="split-preset-select"
              value={selectedPromptPreset}
              onChange={(e) => setSelectedPromptPreset(e.target.value as PromptPreset)}
              className="flex-1 px-3 py-1.5 bg-card text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Object.entries(PROMPT_PRESET_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Custom Prompt Input - shown only when custom selected */}
          {selectedPromptPreset === 'custom' && (
            <div className="px-4 py-3 bg-muted/50 border-b border-border">
              <textarea
                value={customSystemPrompt}
                onChange={(e) => setCustomSystemPrompt(e.target.value)}
                placeholder="Enter your custom system prompt here..."
                className="w-full px-3 py-2 bg-card text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Your custom prompt will be used for enhancement
              </div>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={rawText}
            onChange={handleTextChange}
            placeholder={EDITOR_PLACEHOLDER}
            className="flex-1 p-4 resize-none font-mono text-sm focus:outline-none bg-card text-foreground placeholder:text-muted-foreground"
            spellCheck={false}
          />

          {/* Input Footer */}
          <div className="bg-muted px-4 py-2 text-xs text-muted-foreground border-t border-border flex items-center justify-between">
            <span>💡 Tip: Press Ctrl+E to detect and enhance paragraphs</span>
            <span className="font-mono">{paragraphs.length} paragraphs</span>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="w-full lg:w-1/2 flex flex-col bg-background h-1/2 lg:h-full">
          {/* Output Header */}
          <div className="gradient-primary px-4 py-2 font-semibold">
            <span className="text-primary-foreground">AI-Enhanced Output</span>
          </div>

          {/* Output Content */}
          <div
            ref={outputPanelRef}
            onScroll={handleOutputScroll}
            className="flex-1 p-4 overflow-y-auto relative"
          >
            {/* Auto-scroll indicator */}
            {!autoScroll && (
              <button
                onClick={() => {
                  setAutoScroll(true);
                  if (outputPanelRef.current) {
                    outputPanelRef.current.scrollTop = outputPanelRef.current.scrollHeight;
                  }
                }}
                className="fixed bottom-4 right-4 px-3 py-2 gradient-accent text-accent-foreground rounded-full shadow-accent hover:opacity-90 transition-smooth text-sm font-medium z-10"
              >
                ↓ Jump to Bottom
              </button>
            )}

            {/* Content */}
            {paragraphs.length === 0 ? (
              <EmptyState
                icon="✨"
                title="No paragraphs yet"
                description="Start typing and press Ctrl+E to enhance"
              />
            ) : (
              <div className="space-y-4">
                {paragraphs.map((paragraph) => (
                  <ParagraphDisplay
                    key={paragraph.id}
                    paragraph={paragraph}
                    onRetry={handleRetry}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      ) : (
        /* Single-View Mode */
        <SingleViewEditor />
      )}
    </div>
  );
};
