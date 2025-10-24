# Phase 3: State Management & Store Implementation

## Phase Overview

**Goal:** Implement comprehensive Zustand store with all state management logic for the application  
**Prerequisites:** Phase 2 completed (type system defined)  
**Estimated Duration:** 3-4 hours  
**Key Deliverables:**
- Complete Zustand store implementation
- Paragraph detection logic
- Queue management functions
- State update actions
- Store hooks and selectors
- LocalStorage persistence
- State debugging tools

---

## Step-by-Step Implementation

### Step 1: Create Base Store Structure

**Purpose:** Set up Zustand store skeleton with initial state  
**Duration:** 30 minutes

#### Instructions

1. Create `src/store/editorStore.ts`:

```typescript
/**
 * Main application store using Zustand
 * Manages paragraphs, queue, and configuration state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  EditorState,
  EditorActions,
  Paragraph,
  ParagraphId,
  QueuePriority,
  StreamConfig,
  ParagraphStatus,
  SessionStatistics,
} from '../types';
import {
  createDefaultQueueState,
  createDefaultSessionStatistics,
  createDefaultStreamConfig,
} from '../types/factories';
import {
  STORAGE_KEY_CONFIG,
  STORAGE_KEY_API_KEY,
} from '../constants';

/**
 * Initial state for the editor
 */
const initialState: Omit<EditorState, keyof EditorActions> = {
  rawText: '',
  paragraphs: new Map(),
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

      // Will implement actions in following steps
      updateRawText: (text: string) => {
        set({ rawText: text }, false, 'updateRawText');
      },

      detectParagraphs: () => {
        // To be implemented
      },

      addParagraph: (paragraph: Paragraph) => {
        // To be implemented
      },

      updateParagraph: (id: ParagraphId, updates: Partial<Paragraph>) => {
        // To be implemented
      },

      removeParagraph: (id: ParagraphId) => {
        // To be implemented
      },

      addToQueue: (paragraphId: ParagraphId, priority?: QueuePriority) => {
        // To be implemented
      },

      removeFromQueue: (paragraphId: ParagraphId) => {
        // To be implemented
      },

      clearQueue: () => {
        // To be implemented
      },

      setStreamConfig: (config: Partial<StreamConfig>) => {
        // To be implemented
      },

      loadConfigFromStorage: () => {
        // To be implemented
      },

      saveConfigToStorage: () => {
        // To be implemented
      },

      setSettingsOpen: (isOpen: boolean) => {
        set({ isSettingsOpen: isOpen }, false, 'setSettingsOpen');
      },

      setSelectedParagraph: (id: ParagraphId | null) => {
        set({ selectedParagraphId: id }, false, 'setSelectedParagraph');
      },

      startStream: async (paragraphId: ParagraphId) => {
        // To be implemented in Phase 4
      },

      cancelStream: (paragraphId: ParagraphId) => {
        // To be implemented in Phase 4
      },

      retryStream: async (paragraphId: ParagraphId) => {
        // To be implemented in Phase 4
      },

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
          set({
            rawText: parsed.rawText,
            paragraphs: new Map(parsed.paragraphs),
            statistics: parsed.statistics,
          }, false, 'importState');
        } catch (error) {
          console.error('Failed to import state:', error);
        }
      },
    }),
    { name: 'CascadeEditStore' }
  )
);
```

#### Verification
- [ ] Store file created
- [ ] Initial state defined
- [ ] TypeScript compiles without errors
- [ ] DevTools enabled for debugging

---

### Step 2: Implement Paragraph Detection Logic

**Purpose:** Detect completed paragraphs from raw text using double newline separator  
**Duration:** 45 minutes

#### Instructions

1. Create helper function in `src/utils/paragraphDetector.ts`:

```typescript
/**
 * Paragraph detection utilities
 */

import {
  Paragraph,
  ParagraphId,
  TextPosition,
} from '../types';
import {
  createParagraph,
  generateParagraphId,
  createTextPosition,
} from '../types/factories';
import {
  validateParagraphText,
  sanitizeText,
} from './validation';
import {
  PARAGRAPH_SEPARATOR,
  MIN_PARAGRAPH_LENGTH,
} from '../constants';

/**
 * Detected paragraph info before full object creation
 */
interface DetectedParagraph {
  text: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Detect paragraphs from raw text
 */
export const detectParagraphsFromText = (
  text: string,
  existingParagraphs: Map<ParagraphId, Paragraph>
): Paragraph[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split by double newline
  const sections = text.split(PARAGRAPH_SEPARATOR);
  const detected: DetectedParagraph[] = [];
  let currentIndex = 0;

  // Build detected paragraphs with positions
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const trimmed = sanitizeText(section);
    
    if (trimmed.length >= MIN_PARAGRAPH_LENGTH) {
      detected.push({
        text: trimmed,
        startIndex: currentIndex,
        endIndex: currentIndex + section.length,
      });
    }
    
    // Move index forward (including separator)
    currentIndex += section.length;
    if (i < sections.length - 1) {
      currentIndex += 2; // Add 2 for \n\n
    }
  }

  // Filter out paragraphs that already exist
  const newParagraphs: Paragraph[] = [];
  
  for (const det of detected) {
    // Check if this exact text already exists in a non-terminal state
    const exists = Array.from(existingParagraphs.values()).some(
      (p) =>
        p.originalText === det.text &&
        (p.status === ParagraphStatus.PENDING ||
         p.status === ParagraphStatus.QUEUED ||
         p.status === ParagraphStatus.PROCESSING ||
         p.status === ParagraphStatus.STREAMING)
    );

    if (!exists) {
      // Validate before creating
      const validation = validateParagraphText(det.text);
      if (validation.isValid) {
        const position = createTextPosition(
          det.startIndex,
          det.endIndex,
          text
        );

        const paragraph = createParagraph({
          id: generateParagraphId(),
          originalText: det.text,
          position,
        });

        newParagraphs.push(paragraph);
      }
    }
  }

  return newParagraphs;
};

/**
 * Check if text contains completed paragraphs
 */
export const hasCompletedParagraphs = (text: string): boolean => {
  return PARAGRAPH_SEPARATOR.test(text);
};

/**
 * Get paragraph count from text
 */
export const getParagraphCount = (text: string): number => {
  if (!text || text.trim().length === 0) return 0;
  
  const sections = text.split(PARAGRAPH_SEPARATOR);
  return sections.filter(
    (s) => sanitizeText(s).length >= MIN_PARAGRAPH_LENGTH
  ).length;
};
```

2. Update `detectParagraphs` in store:

```typescript
// In src/store/editorStore.ts

import { detectParagraphsFromText } from '../utils/paragraphDetector';

// Inside the store definition:

detectParagraphs: () => {
  const { rawText, paragraphs } = get();
  
  // Detect new paragraphs
  const newParagraphs = detectParagraphsFromText(rawText, paragraphs);
  
  if (newParagraphs.length > 0) {
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
  }
},
```

#### Verification
- [ ] Paragraph detection utility created
- [ ] Detection logic integrated into store
- [ ] Double newline splitting works
- [ ] Duplicates are filtered out
- [ ] Auto-queueing triggers

---

### Step 3: Implement Paragraph CRUD Operations

**Purpose:** Add, update, and remove paragraphs from state  
**Duration:** 30 minutes

#### Instructions

Update the store actions in `src/store/editorStore.ts`:

```typescript
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
```

#### Verification
- [ ] Can add paragraphs to store
- [ ] Updates are immutable
- [ ] Statistics update correctly
- [ ] Remove also removes from queue

---

### Step 4: Implement Queue Management

**Purpose:** Manage processing queue with priority and concurrency limits  
**Duration:** 45 minutes

#### Instructions

1. Create queue utilities in `src/utils/queueHelpers.ts`:

```typescript
/**
 * Queue management utilities
 */

import {
  QueueItem,
  QueueState,
  Paragraph,
  QueuePriority,
  ParagraphId,
} from '../types';
import { createQueueItem } from '../types/factories';
import { isParagraphActive } from '../types/guards';

/**
 * Sort queue items by priority (highest first) then timestamp (oldest first)
 */
export const sortQueueItems = (items: QueueItem[]): QueueItem[] => {
  return [...items].sort((a, b) => {
    // First by priority (descending)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    // Then by timestamp (ascending - oldest first)
    return a.timestamp - b.timestamp;
  });
};

/**
 * Get next items to process based on available slots
 */
export const getNextItemsToProcess = (
  queue: QueueState,
  availableSlots: number
): QueueItem[] => {
  const sorted = sortQueueItems(queue.items);
  return sorted.slice(0, availableSlots);
};

/**
 * Check if queue has capacity for more items
 */
export const hasQueueCapacity = (queue: QueueState): boolean => {
  return queue.activeCount < queue.maxConcurrent;
};

/**
 * Get available processing slots
 */
export const getAvailableSlots = (queue: QueueState): number => {
  return Math.max(0, queue.maxConcurrent - queue.activeCount);
};

/**
 * Calculate average processing time
 */
export const calculateAverageProcessingTime = (
  currentAverage: number,
  totalProcessed: number,
  newProcessingTime: number
): number => {
  if (totalProcessed === 0) return newProcessingTime;
  
  const totalTime = currentAverage * totalProcessed;
  return (totalTime + newProcessingTime) / (totalProcessed + 1);
};
```

2. Update queue actions in store:

```typescript
// In src/store/editorStore.ts

import {
  hasQueueCapacity,
  getAvailableSlots,
} from '../utils/queueHelpers';

// Inside store definition:

addToQueue: (paragraphId: ParagraphId, priority: QueuePriority = QueuePriority.NORMAL) => {
  const { paragraphs, queue } = get();
  const paragraph = paragraphs.get(paragraphId);
  
  if (!paragraph) {
    console.warn(`Cannot queue paragraph ${paragraphId}: not found`);
    return;
  }
  
  // Check if already in queue
  const alreadyQueued = queue.items.some((item) => item.paragraph.id === paragraphId);
  if (alreadyQueued) {
    return;
  }
  
  // Check if paragraph is already being processed
  if (isParagraphActive(paragraph)) {
    return;
  }
  
  // Create queue item
  const queueItem = createQueueItem(paragraph, priority);
  
  // Add to queue
  const updatedQueue: QueueState = {
    ...queue,
    items: [...queue.items, queueItem],
  };
  
  // Update paragraph status to queued
  get().updateParagraph(paragraphId, {
    status: ParagraphStatus.QUEUED,
  });
  
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
```

#### Verification
- [ ] Items added to queue correctly
- [ ] Priority sorting works
- [ ] Duplicate prevention works
- [ ] Queue capacity respected
- [ ] Abort controllers created

---

### Step 5: Implement Configuration Management

**Purpose:** Handle stream configuration and localStorage persistence  
**Duration:** 30 minutes

#### Instructions

Update configuration actions in `src/store/editorStore.ts`:

```typescript
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
```

#### Verification
- [ ] Configuration updates work
- [ ] localStorage persistence works
- [ ] API key stored separately
- [ ] Auto-save triggers on config change

---

### Step 6: Create Store Hooks and Selectors

**Purpose:** Create convenient hooks for components to access specific state  
**Duration:** 30 minutes

#### Instructions

Create `src/store/hooks.ts`:

```typescript
/**
 * Custom hooks and selectors for the editor store
 */

import { useEditorStore } from './editorStore';
import {
  Paragraph,
  ParagraphId,
  ParagraphStatus,
} from '../types';
import { isParagraphActive, isParagraphTerminal } from '../types/guards';

/**
 * Hook to get all paragraphs as an array (sorted by position)
 */
export const useParagraphs = (): Paragraph[] => {
  return useEditorStore((state) => {
    return Array.from(state.paragraphs.values()).sort(
      (a, b) => a.position.startIndex - b.position.startIndex
    );
  });
};

/**
 * Hook to get a specific paragraph by ID
 */
export const useParagraph = (id: ParagraphId | null): Paragraph | null => {
  return useEditorStore((state) => {
    if (!id) return null;
    return state.paragraphs.get(id) || null;
  });
};

/**
 * Hook to get active (processing) paragraphs
 */
export const useActiveParagraphs = (): Paragraph[] => {
  return useEditorStore((state) => {
    return Array.from(state.paragraphs.values()).filter(isParagraphActive);
  });
};

/**
 * Hook to get completed paragraphs
 */
export const useCompletedParagraphs = (): Paragraph[] => {
  return useEditorStore((state) => {
    return Array.from(state.paragraphs.values()).filter(
      (p) => p.status === ParagraphStatus.COMPLETE
    );
  });
};

/**
 * Hook to get paragraphs with errors
 */
export const useErrorParagraphs = (): Paragraph[] => {
  return useEditorStore((state) => {
    return Array.from(state.paragraphs.values()).filter(
      (p) => p.status === ParagraphStatus.ERROR
    );
  });
};

/**
 * Hook to get queue statistics
 */
export const useQueueStats = () => {
  return useEditorStore((state) => ({
    queueLength: state.queue.items.length,
    activeCount: state.queue.activeCount,
    maxConcurrent: state.queue.maxConcurrent,
    totalProcessed: state.queue.totalProcessed,
    totalFailed: state.queue.totalFailed,
    averageProcessingTime: state.queue.averageProcessingTime,
  }));
};

/**
 * Hook to get session statistics
 */
export const useSessionStats = () => {
  return useEditorStore((state) => state.statistics);
};

/**
 * Hook to get stream configuration
 */
export const useStreamConfig = () => {
  return useEditorStore((state) => state.streamConfig);
};

/**
 * Hook to check if API key is configured
 */
export const useHasApiKey = (): boolean => {
  return useEditorStore((state) => {
    return state.streamConfig.apiKey.length > 0;
  });
};

/**
 * Hook to get paragraph count by status
 */
export const useParagraphCountByStatus = () => {
  return useEditorStore((state) => {
    const paragraphs = Array.from(state.paragraphs.values());
    
    return {
      pending: paragraphs.filter((p) => p.status === ParagraphStatus.PENDING).length,
      queued: paragraphs.filter((p) => p.status === ParagraphStatus.QUEUED).length,
      processing: paragraphs.filter((p) => p.status === ParagraphStatus.PROCESSING).length,
      streaming: paragraphs.filter((p) => p.status === ParagraphStatus.STREAMING).length,
      complete: paragraphs.filter((p) => p.status === ParagraphStatus.COMPLETE).length,
      error: paragraphs.filter((p) => p.status === ParagraphStatus.ERROR).length,
      cancelled: paragraphs.filter((p) => p.status === ParagraphStatus.CANCELLED).length,
    };
  });
};
```

#### Verification
- [ ] Custom hooks created
- [ ] Selectors are memoized
- [ ] Hooks return correct data
- [ ] No unnecessary re-renders

---

## Testing Procedures

### Unit Tests

Create `src/store/__tests__/editorStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../editorStore';
import { createParagraph, generateParagraphId } from '../../types/factories';
import { ParagraphStatus, QueuePriority } from '../../types';

describe('EditorStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useEditorStore.getState().reset();
  });

  describe('updateRawText', () => {
    it('should update raw text', () => {
      const { updateRawText, rawText } = useEditorStore.getState();
      
      updateRawText('Hello world');
      
      expect(useEditorStore.getState().rawText).toBe('Hello world');
    });
  });

  describe('paragraph management', () => {
    it('should add paragraph', () => {
      const { addParagraph, paragraphs } = useEditorStore.getState();
      
      const paragraph = createParagraph({
        id: 'test-1',
        originalText: 'Test paragraph',
        position: { startIndex: 0, endIndex: 14, startLine: 1, endLine: 1 },
      });
      
      addParagraph(paragraph);
      
      expect(useEditorStore.getState().paragraphs.has('test-1')).toBe(true);
    });

    it('should update paragraph', () => {
      const { addParagraph, updateParagraph } = useEditorStore.getState();
      
      const paragraph = createParagraph({
        id: 'test-1',
        originalText: 'Test',
        position: { startIndex: 0, endIndex: 4, startLine: 1, endLine: 1 },
      });
      
      addParagraph(paragraph);
      updateParagraph('test-1', { transformedText: 'Updated' });
      
      const updated = useEditorStore.getState().paragraphs.get('test-1');
      expect(updated?.transformedText).toBe('Updated');
    });

    it('should remove paragraph', () => {
      const { addParagraph, removeParagraph } = useEditorStore.getState();
      
      const paragraph = createParagraph({
        id: 'test-1',
        originalText: 'Test',
        position: { startIndex: 0, endIndex: 4, startLine: 1, endLine: 1 },
      });
      
      addParagraph(paragraph);
      removeParagraph('test-1');
      
      expect(useEditorStore.getState().paragraphs.has('test-1')).toBe(false);
    });
  });

  describe('queue management', () => {
    it('should add to queue', () => {
      const { addParagraph, addToQueue, queue } = useEditorStore.getState();
      
      const paragraph = createParagraph({
        id: 'test-1',
        originalText: 'Test paragraph',
        position: { startIndex: 0, endIndex: 14, startLine: 1, endLine: 1 },
      });
      
      addParagraph(paragraph);
      addToQueue('test-1', QueuePriority.NORMAL);
      
      const state = useEditorStore.getState();
      expect(state.queue.items.length).toBe(1);
      expect(state.queue.items[0].paragraph.id).toBe('test-1');
    });

    it('should not add duplicate to queue', () => {
      const { addParagraph, addToQueue } = useEditorStore.getState();
      
      const paragraph = createParagraph({
        id: 'test-1',
        originalText: 'Test',
        position: { startIndex: 0, endIndex: 4, startLine: 1, endLine: 1 },
      });
      
      addParagraph(paragraph);
      addToQueue('test-1');
      addToQueue('test-1'); // Try to add again
      
      expect(useEditorStore.getState().queue.items.length).toBe(1);
    });

    it('should remove from queue', () => {
      const { addParagraph, addToQueue, removeFromQueue } = useEditorStore.getState();
      
      const paragraph = createParagraph({
        id: 'test-1',
        originalText: 'Test',
        position: { startIndex: 0, endIndex: 4, startLine: 1, endLine: 1 },
      });
      
      addParagraph(paragraph);
      addToQueue('test-1');
      removeFromQueue('test-1');
      
      expect(useEditorStore.getState().queue.items.length).toBe(0);
    });

    it('should clear queue', () => {
      const { addParagraph, addToQueue, clearQueue } = useEditorStore.getState();
      
      const p1 = createParagraph({
        id: 'test-1',
        originalText: 'Test 1',
        position: { startIndex: 0, endIndex: 6, startLine: 1, endLine: 1 },
      });
      const p2 = createParagraph({
        id: 'test-2',
        originalText: 'Test 2',
        position: { startIndex: 7, endIndex: 13, startLine: 2, endLine: 2 },
      });
      
      addParagraph(p1);
      addParagraph(p2);
      addToQueue('test-1');
      addToQueue('test-2');
      
      clearQueue();
      
      expect(useEditorStore.getState().queue.items.length).toBe(0);
    });
  });

  describe('configuration', () => {
    it('should update stream config', () => {
      const { setStreamConfig, streamConfig } = useEditorStore.getState();
      
      setStreamConfig({ apiKey: 'test-key' });
      
      expect(useEditorStore.getState().streamConfig.apiKey).toBe('test-key');
    });
  });
});
```

---

## Troubleshooting

### Common Issues

#### Issue: Store updates not triggering re-renders
**Solution:**
- Ensure components use hooks correctly
- Check that state updates are immutable
- Verify selectors return new references when needed

#### Issue: Paragraph detection not working
**Solution:**
- Check regex pattern for double newlines
- Verify text sanitization
- Check minimum length threshold
- Add console.log in `detectParagraphsFromText`

#### Issue: Queue items not processing
**Solution:**
- Verify `addToQueue` is called
- Check queue capacity limits
- Ensure paragraph status is correct
- Verify abort controllers are not triggered

#### Issue: localStorage not persisting
**Solution:**
- Check browser localStorage is enabled
- Verify storage keys are correct
- Check JSON serialization works
- Look for quota exceeded errors

---

## Phase Completion Checklist

- [ ] **Store structure complete**
  - [ ] Base store created with Zustand
  - [ ] Initial state defined
  - [ ] DevTools enabled
  - [ ] TypeScript types correct

- [ ] **Paragraph detection**
  - [ ] Detection utility created
  - [ ] Double newline splitting works
  - [ ] Duplicate filtering works
  - [ ] Auto-queueing triggers

- [ ] **CRUD operations**
  - [ ] Add paragraph works
  - [ ] Update paragraph works
  - [ ] Remove paragraph works
  - [ ] Statistics update correctly

- [ ] **Queue management**
  - [ ] Add to queue works
  - [ ] Priority ordering works
  - [ ] Remove from queue works
  - [ ] Clear queue works
  - [ ] Capacity limits enforced

- [ ] **Configuration**
  - [ ] Config updates work
  - [ ] localStorage persistence works
  - [ ] Load from storage works
  - [ ] Auto-save triggers

- [ ] **Hooks and selectors**
  - [ ] Custom hooks created
  - [ ] Selectors work correctly
  - [ ] No unnecessary re-renders
  - [ ] Statistics hooks work

- [ ] **Testing**
  - [ ] Unit tests written
  - [ ] Tests pass
  - [ ] Edge cases covered
  - [ ] Store behavior validated

---

## Next Steps

1. **Commit your work:**
   ```bash
   git add src/store src/utils
   git commit -m "feat: complete Phase 3 - state management"
   git push
   ```

2. **Proceed to Phase 4:**
   - Open `Phase4.md`
   - Begin OpenRouter API integration
   - Connect streaming to store

---

**Phase Status:** ✅ Ready for Implementation  
**Next Phase:** Phase 4 - OpenRouter API Integration & Streaming  
**Dependencies:** Requires Phase 3 completion
