/**
 * SingleViewEditor - Single column with text selection enhancement
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { WorkerStatusLights } from './WorkerStatusLights';
import { ProcessingHighlight } from './ProcessingHighlight';
import { PROMPT_PRESET_LABELS } from '../constants';
import type { TextSelection, PromptPreset } from '../types';

export const SingleViewEditor: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  
  // Store state
  const singleViewText = useEditorStore((state) => state.singleViewText);
  const updateSingleViewText = useEditorStore((state) => state.updateSingleViewText);
  const enhanceSelection = useEditorStore((state) => state.enhanceSelection);
  const setCurrentSelection = useEditorStore((state) => state.setCurrentSelection);
  const singleViewPrompts = useEditorStore((state) => state.singleViewPrompts);
  const selectedPromptPreset = useEditorStore((state) => state.selectedPromptPreset);
  const setSelectedPromptPreset = useEditorStore((state) => state.setSelectedPromptPreset);
  const customSystemPrompt = useEditorStore((state) => state.customSystemPrompt);
  const setCustomSystemPrompt = useEditorStore((state) => state.setCustomSystemPrompt);
  const activeProcessingRanges = useEditorStore((state) => state.activeProcessingRanges);
  
  // Handle text changes
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateSingleViewText(e.target.value);
    },
    [updateSingleViewText]
  );
  
  // Track text selection
  const handleSelectionChange = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const selectedText = singleViewText.substring(start, end);
      const newSelection: TextSelection = { start, end, text: selectedText };
      setSelection(newSelection);
      setCurrentSelection(newSelection);
    } else {
      setSelection(null);
      setCurrentSelection(null);
    }
  }, [singleViewText, setCurrentSelection]);
  
  // Handle enhance button click
  const handleEnhance = useCallback(() => {
    if (!selection) return;
    enhanceSelection();
    // Clear local selection state after enhancement
    setSelection(null);
  }, [selection, enhanceSelection]);
  
  // Listen for selection changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.addEventListener('select', handleSelectionChange);
    textarea.addEventListener('mouseup', handleSelectionChange);
    textarea.addEventListener('keyup', handleSelectionChange);
    
    return () => {
      textarea.removeEventListener('select', handleSelectionChange);
      textarea.removeEventListener('mouseup', handleSelectionChange);
      textarea.removeEventListener('keyup', handleSelectionChange);
    };
  }, [handleSelectionChange]);
  
  // Keyboard shortcut for enhance (Ctrl+E)
  useKeyboardShortcuts([
    {
      key: 'e',
      ctrl: true,
      handler: handleEnhance,
      description: 'Enhance Selected Text',
    },
  ]);
  
  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);
  
  // Count active prompts
  const activePrompts = Array.from(singleViewPrompts.values())
    .filter(p => p.status === 'streaming' || p.status === 'processing');
  
  return (
    <div className="flex-1 flex flex-col bg-card overflow-hidden">
      {/* Header with stats */}
      <div className="bg-secondary text-secondary-foreground px-4 py-2 font-semibold flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <span>Document Workspace</span>
          <WorkerStatusLights />
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-muted-foreground font-mono">
            {singleViewText.length} characters
          </div>
          {selection && (
            <div className="text-accent font-mono">
              {selection.end - selection.start} selected
            </div>
          )}
          {activePrompts.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-primary">⚡</span>
              <span className="text-primary">{activePrompts.length} enhancing</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Prompt Preset Selector */}
      <div className="px-4 py-2 bg-muted border-b border-border flex items-center gap-3">
        <label htmlFor="preset-select" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          Enhancement Style:
        </label>
        <select
          id="preset-select"
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
      
      {/* Main textarea with highlight overlay */}
      <div className="flex-1 relative overflow-hidden">
        <ProcessingHighlight
          text={singleViewText}
          ranges={activeProcessingRanges}
          textareaClassName="p-6 font-mono text-base leading-relaxed"
        />
        <textarea
          ref={textareaRef}
          value={singleViewText}
          onChange={handleTextChange}
          placeholder="Start typing... Select text and click Enhance (or press Ctrl+E) to enhance it inline."
          className="w-full h-full p-6 resize-none font-mono text-base leading-relaxed focus:outline-none bg-transparent text-foreground placeholder:text-muted-foreground relative z-10"
          spellCheck={false}
          aria-label="Single view document editor"
        />
      </div>
      
      {/* Footer with Enhance button */}
      <div className="bg-muted px-4 py-3 border-t border-border flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          💡 Tip: Select text and click Enhance to improve it inline
        </div>
        
        <button
          onClick={handleEnhance}
          disabled={!selection}
          title={selection ? "Enhance selected text (Ctrl+E)" : "Select text first"}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-smooth flex items-center gap-2 ${
            selection
              ? 'gradient-primary text-primary-foreground shadow-glow hover:opacity-90 cursor-pointer'
              : 'bg-muted text-muted-foreground/50 cursor-not-allowed'
          }`}
        >
          <span>⚡</span>
          <span>Enhance</span>
          {selection && (
            <kbd className="text-xs bg-card/20 px-1 rounded">Ctrl+E</kbd>
          )}
        </button>
      </div>
    </div>
  );
};
