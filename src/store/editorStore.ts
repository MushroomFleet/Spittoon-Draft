/**
 * Main application store using Zustand
 * Manages paragraphs, queue, and configuration state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  EditorState,
  EditorActions,
  Paragraph,
  ParagraphId,
  StreamConfig,
} from '../types';
import { QueuePriority, ParagraphStatus } from '../types';
import {
  createDefaultQueueState,
  createDefaultSessionStatistics,
  createDefaultStreamConfig,
  createPromptRegion,
} from '../types/factories';
import {
  STORAGE_KEY_CONFIG,
  STORAGE_KEY_API_KEY,
  SINGLE_VIEW_PROMPTS,
} from '../constants';
import { detectParagraphsFromText } from '../utils/paragraphDetector';
import { isParagraphActive } from '../types/guards';
import { createQueueItem } from '../types/factories';
import type { QueueState } from '../types';
import { queueManager } from '../services/queueManager';
import { parseNSLToBucket, extractMetadata, validateBucket } from '../services/nslParser';
import { saveBucketFiles, saveBucketMetadata, loadBucketFiles, loadBucketMetadata, clearBucket as clearBucketStorage, saveBucketFile } from '../services/bucketStorage';

/**
 * Initial state for the editor
 */
const initialState: Omit<EditorState, keyof EditorActions> = {
  rawText: '',
  paragraphs: new Map(),
  viewMode: 'split' as const,
  singleViewText: '',
  singleViewPrompts: new Map(),
  currentSelection: null,
  selectedPromptPreset: 'enhance' as const,
  customSystemPrompt: '',
  activeProcessingRanges: [],
  bucketFiles: null,
  isBucketImported: false,
  isBucketEnabled: false,
  nslMetadata: null,
  queue: createDefaultQueueState(),
  streamConfig: createDefaultStreamConfig(),
  isSettingsOpen: false,
  selectedParagraphId: null,
  statistics: createDefaultSessionStatistics(),
};

/**
 * Main editor store
 */
export const useEditorStore = create<EditorState & EditorActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Document actions
      updateRawText: (text: string) => {
        set({ rawText: text }, false, 'updateRawText');
      },

      detectParagraphs: () => {
        const { rawText, paragraphs, selectedPromptPreset, customSystemPrompt, streamConfig } = get();
        
        // Detect new paragraphs
        const newParagraphs = detectParagraphsFromText(rawText, paragraphs);
        
        if (newParagraphs.length > 0) {
          // Get the system prompt based on selected preset (same logic as enhanceSelection)
          let systemPrompt = streamConfig.systemPrompt; // Default
          
          if (selectedPromptPreset === 'custom') {
            // Use custom prompt if provided
            systemPrompt = customSystemPrompt || streamConfig.systemPrompt;
          } else {
            // Use preset prompt
            const presetKey = selectedPromptPreset.toUpperCase() as keyof typeof SINGLE_VIEW_PROMPTS;
            systemPrompt = SINGLE_VIEW_PROMPTS[presetKey] || streamConfig.systemPrompt;
          }
          
          // Temporarily update stream config with selected prompt
          const originalSystemPrompt = streamConfig.systemPrompt;
          get().setStreamConfig({ systemPrompt });
          
          const updatedParagraphs = new Map(paragraphs);
          
          // Add new paragraphs to the map
          newParagraphs.forEach((paragraph) => {
            updatedParagraphs.set(paragraph.id, paragraph);
          });
          
          // Update statistics
          const statistics = get().statistics;
          const updatedStatistics = {
            ...statistics,
            totalParagraphs: updatedParagraphs.size,
          };
          
          set(
            {
              paragraphs: updatedParagraphs,
              statistics: updatedStatistics,
            },
            false,
            'detectParagraphs'
          );
          
          // Auto-queue new paragraphs
          newParagraphs.forEach((p) => {
            get().addToQueue(p.id, QueuePriority.NORMAL);
          });
          
          // Restore original system prompt after queuing
          setTimeout(() => {
            get().setStreamConfig({ systemPrompt: originalSystemPrompt });
          }, 100);
        }
      },

      // Paragraph actions
      addParagraph: (paragraph: Paragraph) => {
        const { paragraphs } = get();
        const updatedParagraphs = new Map(paragraphs);
        updatedParagraphs.set(paragraph.id, paragraph);
        
        set(
          { paragraphs: updatedParagraphs },
          false,
          'addParagraph'
        );
      },

      updateParagraph: (id: ParagraphId, updates: Partial<Paragraph>) => {
        const { paragraphs } = get();
        const existing = paragraphs.get(id);
        
        if (!existing) {
          console.warn(`Paragraph ${id} not found`);
          return;
        }
        
        const updatedParagraphs = new Map(paragraphs);
        const updatedParagraph: Paragraph = {
          ...existing,
          ...updates,
          updatedAt: Date.now(),
        };
        
        updatedParagraphs.set(id, updatedParagraph);
        
        // Update statistics if status changed to complete
        let updatedStatistics = get().statistics;
        if (
          updates.status === ParagraphStatus.COMPLETE &&
          existing.status !== ParagraphStatus.COMPLETE
        ) {
          const processingTime =
            updatedParagraph.completedAt && updatedParagraph.processingStartedAt
              ? updatedParagraph.completedAt - updatedParagraph.processingStartedAt
              : 0;
          
          updatedStatistics = {
            ...updatedStatistics,
            totalCharacters: updatedStatistics.totalCharacters + existing.originalText.length,
            totalProcessingTime: updatedStatistics.totalProcessingTime + processingTime,
          };
        }
        
        // Update statistics if status changed to error
        if (
          updates.status === ParagraphStatus.ERROR &&
          existing.status !== ParagraphStatus.ERROR
        ) {
          updatedStatistics = {
            ...updatedStatistics,
            totalErrors: updatedStatistics.totalErrors + 1,
          };
        }
        
        set(
          {
            paragraphs: updatedParagraphs,
            statistics: updatedStatistics,
          },
          false,
          'updateParagraph'
        );
      },

      removeParagraph: (id: ParagraphId) => {
        const { paragraphs } = get();
        const updatedParagraphs = new Map(paragraphs);
        updatedParagraphs.delete(id);
        
        // Also remove from queue if present
        get().removeFromQueue(id);
        
        set(
          { paragraphs: updatedParagraphs },
          false,
          'removeParagraph'
        );
      },

      // Queue actions
      addToQueue: (paragraphId: ParagraphId, priority: QueuePriority = QueuePriority.NORMAL) => {
        const { paragraphs, singleViewPrompts, queue } = get();
        
        // Check both paragraphs and prompts
        const paragraph = paragraphs.get(paragraphId);
        const prompt = singleViewPrompts.get(paragraphId);
        const item = paragraph || prompt;
        
        if (!item) {
          console.warn(`Cannot queue item ${paragraphId}: not found in paragraphs or prompts`);
          return;
        }
        
        // Check if already in queue
        const alreadyQueued = queue.items.some((qItem) => qItem.paragraph.id === paragraphId);
        if (alreadyQueued) {
          return;
        }
        
        // Check if item is already being processed
        // Cast to Paragraph for the check since both types share status properties
        if (isParagraphActive(item as Paragraph)) {
          return;
        }
        
        // Create queue item (works for both paragraphs and prompts since they have the same core structure)
        // Cast as Paragraph since both types have same queue-relevant properties
        const queueItem = createQueueItem(item as Paragraph, priority);
        
        // Add to queue
        const updatedQueue: QueueState = {
          ...queue,
          items: [...queue.items, queueItem],
        };
        
        // Update status to queued (check if it's a paragraph or prompt)
        if (paragraph) {
          get().updateParagraph(paragraphId, {
            status: ParagraphStatus.QUEUED,
          });
        } else if (prompt) {
          get().updatePrompt(paragraphId, {
            status: ParagraphStatus.QUEUED,
          });
        }
        
        set({ queue: updatedQueue }, false, 'addToQueue');
      },

      removeFromQueue: (paragraphId: ParagraphId) => {
        const { queue } = get();
        
        // Find and abort the item
        const item = queue.items.find((i) => i.paragraph.id === paragraphId);
        if (item) {
          item.abortController.abort();
        }
        
        // Remove from queue
        const updatedItems = queue.items.filter(
          (item) => item.paragraph.id !== paragraphId
        );
        
        const updatedQueue: QueueState = {
          ...queue,
          items: updatedItems,
        };
        
        set({ queue: updatedQueue }, false, 'removeFromQueue');
        
        // Update paragraph status back to pending if it was queued
        const paragraph = get().paragraphs.get(paragraphId);
        if (paragraph?.status === ParagraphStatus.QUEUED) {
          get().updateParagraph(paragraphId, {
            status: ParagraphStatus.PENDING,
          });
        }
      },

      clearQueue: () => {
        const { queue } = get();
        
        // Abort all items
        queue.items.forEach((item) => {
          item.abortController.abort();
        });
        
        // Clear queue
        const updatedQueue: QueueState = {
          ...queue,
          items: [],
          activeCount: 0,
        };
        
        set({ queue: updatedQueue }, false, 'clearQueue');
      },

      // Configuration actions
      setStreamConfig: (config: Partial<StreamConfig>) => {
        const currentConfig = get().streamConfig;
        const updatedConfig = {
          ...currentConfig,
          ...config,
        };
        
        set(
          { streamConfig: updatedConfig },
          false,
          'setStreamConfig'
        );
        
        // Auto-save to storage
        get().saveConfigToStorage();
      },

      loadConfigFromStorage: () => {
        try {
          // Load API key
          const apiKey = localStorage.getItem(STORAGE_KEY_API_KEY);
          
          // Load config
          const configJson = localStorage.getItem(STORAGE_KEY_CONFIG);
          const savedConfig = configJson ? JSON.parse(configJson) : null;
          
          if (apiKey || savedConfig) {
            const currentConfig = get().streamConfig;
            const updatedConfig = {
              ...currentConfig,
              ...(savedConfig || {}),
              apiKey: apiKey || currentConfig.apiKey,
            };
            
            set(
              { streamConfig: updatedConfig },
              false,
              'loadConfigFromStorage'
            );
          }
        } catch (error) {
          console.error('Failed to load config from storage:', error);
        }
      },

      saveConfigToStorage: () => {
        try {
          const { streamConfig } = get();
          
          // Save API key separately (more secure)
          if (streamConfig.apiKey) {
            localStorage.setItem(STORAGE_KEY_API_KEY, streamConfig.apiKey);
          }
          
          // Save rest of config (without API key)
          const { apiKey, ...configWithoutKey } = streamConfig;
          localStorage.setItem(
            STORAGE_KEY_CONFIG,
            JSON.stringify(configWithoutKey)
          );
        } catch (error) {
          console.error('Failed to save config to storage:', error);
        }
      },

      // UI actions
      setSettingsOpen: (isOpen: boolean) => {
        set({ isSettingsOpen: isOpen }, false, 'setSettingsOpen');
      },

      setSelectedParagraph: (id: ParagraphId | null) => {
        set({ selectedParagraphId: id }, false, 'setSelectedParagraph');
      },

      // Stream actions
      startStream: async (paragraphId: ParagraphId) => {
        const { paragraphs, singleViewPrompts } = get();
        
        // Check both paragraphs and prompts
        const paragraph = paragraphs.get(paragraphId);
        const prompt = singleViewPrompts.get(paragraphId);
        
        if (!paragraph && !prompt) {
          console.warn(`Cannot start stream for ${paragraphId}: not found in paragraphs or prompts`);
          return;
        }

        // Add to queue (queue manager will handle processing)
        get().addToQueue(paragraphId);
        
        // Ensure queue manager is running
        queueManager.startProcessing();
      },

      cancelStream: (paragraphId: ParagraphId) => {
        // Abort the stream
        queueManager.abortStream(paragraphId);
        
        // Remove from queue
        get().removeFromQueue(paragraphId);
      },

      retryStream: async (paragraphId: ParagraphId) => {
        const { paragraphs } = get();
        const paragraph = paragraphs.get(paragraphId);
        
        if (!paragraph) {
          console.warn(`Cannot retry stream for ${paragraphId}: not found`);
          return;
        }

        // Reset paragraph status
        get().updateParagraph(paragraphId, {
          status: ParagraphStatus.PENDING,
          error: null,
          transformedText: '',
          progress: {
            total: null,
            current: 0,
            percentage: 0,
            estimatedTimeRemaining: null,
            bytesPerSecond: null,
          },
        });

        // Add back to queue
        get().startStream(paragraphId);
      },

      // Single-view mode actions
      setViewMode: (mode: 'split' | 'single' | 'bucket') => {
        const { viewMode, isBucketImported } = get();
        
        // Bucket view requires imported bucket
        if (mode === 'bucket' && !isBucketImported) {
          console.warn('Cannot switch to bucket view: no bucket imported');
          return;
        }
        
        // Bucket view doesn't require confirmation
        if (mode === 'bucket') {
          set({ viewMode: mode }, false, 'setViewMode');
          return;
        }
        
        // Switching from bucket view doesn't require confirmation
        if (viewMode === 'bucket') {
          set({ viewMode: mode }, false, 'setViewMode');
          return;
        }
        
        // If switching between split/single modes, confirm and clear content
        if (mode !== viewMode) {
          const shouldSwitch = window.confirm(
            'Switching modes will clear current content. Continue?'
          );
          
          if (!shouldSwitch) {
            return;
          }
          
          // Clear mode-specific state
          if (mode === 'single') {
            // Switching to single-view: clear split-view state
            set({
              viewMode: mode,
              rawText: '',
              paragraphs: new Map(),
            }, false, 'setViewMode');
          } else {
            // Switching to split-view: clear single-view state
            set({
              viewMode: mode,
              singleViewText: '',
              singleViewPrompts: new Map(),
              currentSelection: null,
            }, false, 'setViewMode');
          }
        }
      },

      updateSingleViewText: (text: string) => {
        set({ singleViewText: text }, false, 'updateSingleViewText');
      },

      setCurrentSelection: (selection: { start: number; end: number; text: string } | null) => {
        set({ currentSelection: selection }, false, 'setCurrentSelection');
      },

      setSelectedPromptPreset: (preset: 'enhance' | 'expand' | 'simplify' | 'creative' | 'continue' | 'professional' | 'casual' | 'uno' | 'custom') => {
        set({ selectedPromptPreset: preset }, false, 'setSelectedPromptPreset');
      },

      setCustomSystemPrompt: (prompt: string) => {
        set({ customSystemPrompt: prompt }, false, 'setCustomSystemPrompt');
      },

      enhanceSelection: () => {
        const { currentSelection, selectedPromptPreset, customSystemPrompt, streamConfig, activeProcessingRanges, singleViewText } = get();
        
        if (!currentSelection) {
          console.warn('No text selected');
          return;
        }
        
        // Get the system prompt based on selected preset
        let systemPrompt = streamConfig.systemPrompt; // Default
        
        if (selectedPromptPreset === 'custom') {
          // Use custom prompt if provided
          systemPrompt = customSystemPrompt || streamConfig.systemPrompt;
        } else {
          // Use preset prompt
          const presetKey = selectedPromptPreset.toUpperCase() as keyof typeof SINGLE_VIEW_PROMPTS;
          systemPrompt = SINGLE_VIEW_PROMPTS[presetKey] || streamConfig.systemPrompt;
        }
        
        // Temporarily update stream config with selected prompt
        const originalSystemPrompt = streamConfig.systemPrompt;
        get().setStreamConfig({ systemPrompt });
        
        // Create prompt region from selection
        const promptRegion = createPromptRegion(currentSelection);
        
        // Calculate which occurrence of this text was selected
        const textBeforeSelection = singleViewText.substring(0, currentSelection.start);
        const searchText = currentSelection.text;
        
        let occurrence = 1;
        let index = textBeforeSelection.indexOf(searchText);
        while (index !== -1) {
          occurrence++;
          index = textBeforeSelection.indexOf(searchText, index + 1);
        }
        
        // Add to active processing ranges immediately for visual highlighting
        const updatedRanges = [
          ...activeProcessingRanges,
          {
            promptId: promptRegion.id,
            searchText: searchText,
            occurrence: occurrence,
          }
        ];
        
        // Add to prompts map
        const updatedPrompts = new Map(get().singleViewPrompts);
        updatedPrompts.set(promptRegion.id, promptRegion);
        
        set(
          { 
            singleViewPrompts: updatedPrompts,
            currentSelection: null, // Clear selection after enhancement
            activeProcessingRanges: updatedRanges,
          },
          false,
          'enhanceSelection'
        );
        
        // Queue for processing (reuse existing queue manager)
        get().startStream(promptRegion.id);
        
        // Restore original system prompt after queuing
        setTimeout(() => {
          get().setStreamConfig({ systemPrompt: originalSystemPrompt });
        }, 100);
      },

      updatePrompt: (id: string, updates: Partial<any>) => {
        const { singleViewPrompts } = get();
        const existing = singleViewPrompts.get(id);
        
        if (!existing) return;
        
        const updatedPrompts = new Map(singleViewPrompts);
        updatedPrompts.set(id, {
          ...existing,
          ...updates,
          updatedAt: Date.now(),
        });
        
        set({ singleViewPrompts: updatedPrompts }, false, 'updatePrompt');
      },

      replaceTextInline: (promptId: string) => {
        const { singleViewText, singleViewPrompts, activeProcessingRanges } = get();
        const prompt = singleViewPrompts.get(promptId);
        
        if (!prompt || prompt.status !== ParagraphStatus.COMPLETE) {
          return;
        }
        
        // Find which occurrence to replace
        const rangeInfo = activeProcessingRanges.find(r => r.promptId === promptId);
        const occurrence = rangeInfo?.occurrence || 1;
        
        // Helper function to find Nth occurrence
        const findNthOccurrence = (text: string, searchText: string, n: number): number => {
          let count = 0;
          let index = -1;
          
          while (count < n) {
            index = text.indexOf(searchText, index + 1);
            if (index === -1) return -1;
            count++;
          }
          
          return index;
        };
        
        // Find the occurrence in current text
        const startIndex = findNthOccurrence(singleViewText, prompt.originalText, occurrence);
        
        if (startIndex === -1) {
          console.warn('Could not find text to replace');
          // Still remove from ranges
          const updatedRanges = activeProcessingRanges.filter(
            range => range.promptId !== promptId
          );
          set({ activeProcessingRanges: updatedRanges }, false, 'replaceTextInline');
          return;
        }
        
        // Replace selected text with enhanced text
        const before = singleViewText.substring(0, startIndex);
        const after = singleViewText.substring(startIndex + prompt.originalText.length);
        const newText = before + prompt.transformedText + after;
        
        // Remove from active processing ranges (no position adjustment needed!)
        const updatedRanges = activeProcessingRanges.filter(
          range => range.promptId !== promptId
        );
        
        set({ 
          singleViewText: newText,
          activeProcessingRanges: updatedRanges
        }, false, 'replaceTextInline');
      },

      // Export actions
      exportToMarkdown: () => {
        const { singleViewText, viewMode, rawText } = get();
        const content = viewMode === 'single' ? singleViewText : rawText;
        
        // Generate metadata
        const now = new Date();
        const timestamp = now.toISOString();
        const readableDate = now.toLocaleString('en-GB', {
          dateStyle: 'full',
          timeStyle: 'short'
        });
        
        // Create markdown with metadata
        const markdown = `<!-- 
Exported from Spittoon-Draft
Date: ${readableDate}
Timestamp: ${timestamp}
View Mode: ${viewMode}
-->

${content}`;
        
        // Generate filename: 2025-10-24T10-45-30.md
        const filename = `${timestamp.split('.')[0].replace(/:/g, '-')}.md`;
        
        // Download
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      // NSL Bucket actions
      importNSLFile: async (file: File) => {
        try {
          // Parse NSL file into bucket files
          const bucketFiles = await parseNSLToBucket(file);
          
          // Parse again for metadata extraction (reuse parsed XML)
          const text = await file.text();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, 'text/xml');
          const metadata = extractMetadata(xmlDoc);
          
          if (!metadata) {
            throw new Error('Failed to extract metadata from NSL file');
          }
          
          // Validate required files
          const validation = validateBucket(bucketFiles);
          if (!validation.valid) {
            throw new Error(`Invalid NSL file:\n${validation.errors.join('\n')}`);
          }
          
          // Show warnings if any
          if (validation.warnings && validation.warnings.length > 0) {
            console.warn('NSL Import Warnings:', validation.warnings);
          }
          
          // Clear existing bucket from IndexedDB
          await clearBucketStorage();
          
          // Save to IndexedDB
          await saveBucketFiles(bucketFiles);
          await saveBucketMetadata(metadata);
          
          // Convert to Map for store
          const filesMap = new Map(
            bucketFiles.map(f => [f.filename, f])
          );
          
          // Update store state
          set({
            bucketFiles: filesMap,
            isBucketImported: true,
            isBucketEnabled: true, // Auto-enable on import
            nslMetadata: metadata
          }, false, 'importNSLFile');
          
          console.log('NSL bucket imported successfully:', {
            title: metadata.title,
            fileCount: bucketFiles.length,
            version: metadata.version
          });
        } catch (error) {
          console.error('NSL Import Error:', error);
          throw error;
        }
      },

      clearNSLImport: async () => {
        try {
          // Clear from IndexedDB
          await clearBucketStorage();
          
          // Clear from store
          set({
            bucketFiles: null,
            isBucketImported: false,
            isBucketEnabled: false,
            nslMetadata: null
          }, false, 'clearNSLImport');
          
          console.log('NSL bucket cleared');
        } catch (error) {
          console.error('Failed to clear NSL bucket:', error);
          throw error;
        }
      },

      toggleBucketEnabled: () => {
        const { isBucketEnabled } = get();
        set({ isBucketEnabled: !isBucketEnabled }, false, 'toggleBucketEnabled');
        console.log('Bucket context:', !isBucketEnabled ? 'enabled' : 'disabled');
      },

      updateBucketFile: async (filename: string, content: string) => {
        const { bucketFiles } = get();
        if (!bucketFiles) {
          console.warn('No bucket imported');
          return;
        }
        
        const file = bucketFiles.get(filename);
        if (!file) {
          console.warn(`File not found: ${filename}`);
          return;
        }
        
        try {
          // Create updated file
          const updatedFile = {
            ...file,
            content,
            lastModified: Date.now()
          };
          
          // Save to IndexedDB
          await saveBucketFile(updatedFile);
          
          // Update store
          const newMap = new Map(bucketFiles);
          newMap.set(filename, updatedFile);
          
          set({ bucketFiles: newMap }, false, 'updateBucketFile');
          
          console.log('Bucket file updated:', filename);
        } catch (error) {
          console.error('Failed to update bucket file:', error);
          throw error;
        }
      },

      loadBucketFromStorage: async () => {
        try {
          // Load from IndexedDB
          const files = await loadBucketFiles();
          const metadata = await loadBucketMetadata();
          
          if (files.length === 0 || !metadata) {
            // No bucket in storage
            return;
          }
          
          // Convert to Map
          const filesMap = new Map(
            files.map(f => [f.filename, f])
          );
          
          // Update store
          set({
            bucketFiles: filesMap,
            isBucketImported: true,
            isBucketEnabled: true, // Keep enabled if it was imported before
            nslMetadata: metadata
          }, false, 'loadBucketFromStorage');
          
          console.log('NSL bucket loaded from storage:', {
            title: metadata.title,
            fileCount: files.length
          });
        } catch (error) {
          console.error('Failed to load bucket from storage:', error);
        }
      },

      // Utility actions
      reset: () => {
        set(initialState, false, 'reset');
      },

      exportState: () => {
        const state = get();
        return JSON.stringify({
          rawText: state.rawText,
          paragraphs: Array.from(state.paragraphs.entries()),
          statistics: state.statistics,
        });
      },

      importState: (stateString: string) => {
        try {
          const parsed = JSON.parse(stateString);
          set(
            {
              rawText: parsed.rawText,
              paragraphs: new Map(parsed.paragraphs),
              statistics: parsed.statistics,
            },
            false,
            'importState'
          );
        } catch (error) {
          console.error('Failed to import state:', error);
        }
      },
    }),
    { name: 'CascadeEditStore' }
  )
);
