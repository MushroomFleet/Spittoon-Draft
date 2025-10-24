# Phase 12: Single-View Mode Implementation

## Phase Overview

**Goal:** Add Single-View mode with text selection-based enhancement and inline replacement  
**Version:** 1.0.0 (Simplified)  
**Prerequisites:** Phase 11 completed (NSL styling)  
**Estimated Duration:** 3-4 hours  
**Key Deliverables:**
- Tab navigation system (Split-View | Single-View)
- SingleViewEditor component with text selection
- Enhance button (enabled when text selected)
- Keyboard shortcut (Ctrl+E) for enhancement
- Inline text replacement with wave animation
- View mode state management

---

## Feature Overview

### Current: Split-View Mode ✅
- **Left Panel:** User types input text
- **Right Panel:** AI-enhanced output appears separately
- **Trigger:** Space→Backspace sends text for enhancement
- **Separation:** Double newlines separate multiple paragraphs
- **Status:** Working perfectly, must preserve

### New: Single-View Mode ⭐ (Simplified)
- **Single Column:** One unified document workspace
- **Select Text:** Highlight any text to enhance
- **Enhance Button:** Click button or press Ctrl+E
- **Inline Replacement:** Enhanced text overwrites selection with wave animation
- **Natural UX:** Familiar select→action pattern
- **Multiple Enhancements:** Select and enhance different regions independently

---

## Why This Approach is Better

### Simpler Implementation
✅ Use native browser text selection APIs  
✅ No complex cursor position tracking  
✅ No key sequence detection  
✅ Straightforward button enable/disable logic  

### Better UX
✅ Users see exactly what will be enhanced (highlighted)  
✅ Can adjust selection before triggering  
✅ Clear button provides visual affordance  
✅ Keyboard shortcut for power users  
✅ Familiar pattern (select text → take action)  

### More Flexible
✅ Select any text, anywhere in document  
✅ Re-enhance same text multiple times  
✅ Edit, then re-select and enhance again  
✅ Undo-friendly workflow  

---

## Architecture Changes

### State Management Updates

```typescript
// Add to EditorState
interface EditorState {
  // ... existing state
  
  // View mode
  viewMode: 'split' | 'single';
  
  // Single-view mode state
  singleViewText: string;
  singleViewPrompts: Map<PromptId, PromptRegion>;
  currentSelection: { start: number; end: number } | null;
}

// Simplified PromptRegion (from text selection)
interface PromptRegion {
  id: PromptId;
  startIndex: number; // Selection start
  endIndex: number; // Selection end
  originalText: string; // Selected text
  transformedText: string; // AI enhanced text
  status: ParagraphStatus;
  progress: StreamProgress;
  // ... other fields
}
```

### Component Hierarchy

```
App
├── EditorHeader (updated with tabs)
├── Split-View Mode (existing TextEditor)
│   ├── Left Panel: Input
│   └── Right Panel: Output
└── Single-View Mode (new SingleViewEditor)
    ├── Textarea with selection tracking
    └── Enhance Button (enabled when text selected)
```

---

## Step 1: Update Type Definitions

**Purpose:** Add types for view mode and simplified prompt regions  
**Duration:** 15 minutes

### Instructions

Add to `src/types/index.ts`:

```typescript
/**
 * View mode type
 */
export type ViewMode = 'split' | 'single';

/**
 * Unique identifier for prompt regions in single-view
 */
export type PromptId = string;

/**
 * Text selection range
 */
export interface TextSelection {
  start: number;
  end: number;
  text: string;
}

/**
 * Prompt region in single-view mode
 * Created from user's text selection
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
```

Update EditorState:

```typescript
export interface EditorState {
  // ... existing fields
  
  // View mode
  viewMode: ViewMode;
  
  // Single-view state
  singleViewText: string;
  singleViewPrompts: Map<PromptId, PromptRegion>;
  currentSelection: TextSelection | null;
}
```

Add to `src/types/factories.ts`:

```typescript
/**
 * Generate unique prompt ID
 */
export const generatePromptId = (): PromptId => {
  return `prompt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Create prompt region from text selection
 */
export const createPromptRegion = (
  selection: TextSelection
): PromptRegion => {
  const now = Date.now();
  
  return {
    id: generatePromptId(),
    startIndex: selection.start,
    endIndex: selection.end,
    originalText: selection.text,
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
```

### Verification
- [ ] Types added
- [ ] Factory functions created
- [ ] TypeScript compiles

---

## Step 2: Update Store with View Mode State

**Purpose:** Add simplified view mode management  
**Duration:** 25 minutes

### Instructions

Update `src/store/editorStore.ts`:

```typescript
// Update initial state
const initialState = {
  // ... existing state
  
  // View mode state
  viewMode: 'split' as ViewMode,
  singleViewText: '',
  singleViewPrompts: new Map<PromptId, PromptRegion>(),
  currentSelection: null as TextSelection | null,
};

// Add new actions
setViewMode: (mode: ViewMode) => {
  set({ viewMode: mode }, false, 'setViewMode');
},

updateSingleViewText: (text: string) => {
  set({ singleViewText: text }, false, 'updateSingleViewText');
},

setCurrentSelection: (selection: TextSelection | null) => {
  set({ currentSelection: selection }, false, 'setCurrentSelection');
},

enhanceSelection: () => {
  const { currentSelection, singleViewText } = get();
  
  if (!currentSelection) {
    console.warn('No text selected');
    return;
  }
  
  // Create prompt region from selection
  const promptRegion = createPromptRegion(currentSelection);
  
  // Add to prompts map
  const updatedPrompts = new Map(get().singleViewPrompts);
  updatedPrompts.set(promptRegion.id, promptRegion);
  
  set(
    { 
      singleViewPrompts: updatedPrompts,
      currentSelection: null, // Clear selection after enhancement
    },
    false,
    'enhanceSelection'
  );
  
  // Queue for processing (reuse existing queue manager)
  get().startStream(promptRegion.id);
},

updatePrompt: (id: PromptId, updates: Partial<PromptRegion>) => {
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

replaceTextInline: (promptId: PromptId) => {
  const { singleViewText, singleViewPrompts } = get();
  const prompt = singleViewPrompts.get(promptId);
  
  if (!prompt || prompt.status !== ParagraphStatus.COMPLETE) {
    return;
  }
  
  // Replace selected text with enhanced text
  const before = singleViewText.substring(0, prompt.startIndex);
  const after = singleViewText.substring(prompt.endIndex);
  const newText = before + prompt.transformedText + after;
  
  set({ singleViewText: newText }, false, 'replaceTextInline');
},
```

### Verification
- [ ] Store actions simplified
- [ ] Text selection tracked
- [ ] Enhancement logic clear

---

## Step 3: Create Tab Navigation

**Purpose:** Add view mode tabs to header  
**Duration:** 20 minutes

### Instructions

Update `src/components/EditorHeader.tsx`:

```typescript
export const EditorHeader: React.FC = () => {
  const setSettingsOpen = useEditorStore((state) => state.setSettingsOpen);
  const viewMode = useEditorStore((state) => state.viewMode);
  const setViewMode = useEditorStore((state) => state.setViewMode);

  return (
    <header className="gradient-primary px-6 py-3 shadow-glow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-primary-foreground">
              ⚡ {APP_NAME}
            </h1>
            <span className="text-xs bg-accent px-2 py-1 rounded font-semibold text-accent-foreground">
              v1.0.0
            </span>
          </div>
          
          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-card/20 rounded-md p-1">
            <button
              onClick={() => setViewMode('split')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-smooth ${
                viewMode === 'split'
                  ? 'bg-card text-card-foreground shadow-sm'
                  : 'text-primary-foreground/70 hover:text-primary-foreground'
              }`}
            >
              Split-View
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-smooth ${
                viewMode === 'single'
                  ? 'bg-card text-card-foreground shadow-sm'
                  : 'text-primary-foreground/70 hover:text-primary-foreground'
              }`}
            >
              Single-View
            </button>
          </div>
        </div>

        {/* Settings Button */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="px-4 py-2 bg-card hover:bg-card/80 text-card-foreground rounded-md transition-smooth text-sm font-medium flex items-center gap-2 border border-border"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
};
```

### Verification
- [ ] Tabs display correctly
- [ ] Active tab highlighted
- [ ] Mode switching works

---

## Step 4: Create SingleViewEditor Component

**Purpose:** Build single-column editor with text selection and Enhance button  
**Duration:** 45 minutes

### Instructions

Create `src/components/SingleViewEditor.tsx`:

```typescript
/**
 * SingleViewEditor - Single column with text selection enhancement
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { TextSelection } from '../types';

export const SingleViewEditor: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  
  // Store state
  const singleViewText = useEditorStore((state) => state.singleViewText);
  const updateSingleViewText = useEditorStore((state) => state.updateSingleViewText);
  const enhanceSelection = useEditorStore((state) => state.enhanceSelection);
  const setCurrentSelection = useEditorStore((state) => state.setCurrentSelection);
  const singleViewPrompts = useEditorStore((state) => state.singleViewPrompts);
  
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
  
  // Replace completed prompts inline
  useEffect(() => {
    const completedPrompts = Array.from(singleViewPrompts.values())
      .filter(p => p.status === 'complete')
      .sort((a, b) => a.startIndex - b.startIndex);
    
    if (completedPrompts.length === 0) return;
    
    let mergedText = singleViewText;
    let offset = 0;
    
    for (const prompt of completedPrompts) {
      const adjustedStart = prompt.startIndex + offset;
      const adjustedEnd = prompt.endIndex + offset;
      
      const before = mergedText.substring(0, adjustedStart);
      const after = mergedText.substring(adjustedEnd);
      
      mergedText = before + prompt.transformedText + after;
      offset += prompt.transformedText.length - prompt.originalText.length;
    }
    
    if (mergedText !== singleViewText) {
      updateSingleViewText(mergedText);
    }
  }, [singleViewPrompts]);
  
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
        <span>Document Workspace</span>
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
      
      {/* Main textarea */}
      <textarea
        ref={textareaRef}
        value={singleViewText}
        onChange={handleTextChange}
        placeholder="Start typing... Select text and click Enhance (or press Ctrl+E) to enhance it inline."
        className="flex-1 p-6 resize-none font-mono text-base leading-relaxed focus:outline-none bg-card text-foreground placeholder:text-muted-foreground"
        spellCheck={false}
        aria-label="Single view document editor"
      />
      
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
```

### Verification
- [ ] Component renders
- [ ] Text selection tracked
- [ ] Enhance button enables/disables
- [ ] Keyboard shortcut works

---

## Step 5: Integrate with Queue Manager

**Purpose:** Process selected text through existing queue system  
**Duration:** 30 minutes

### Instructions

The queue manager can already process prompts - just need to update the store's `startStream` action to handle both paragraph IDs and prompt IDs:

```typescript
// In src/store/editorStore.ts

startStream: async (id: ParagraphId | PromptId) => {
  const { paragraphs, singleViewPrompts, viewMode } = get();
  
  if (viewMode === 'split') {
    // Existing split-view logic
    const paragraph = paragraphs.get(id);
    if (!paragraph) return;
    
    get().addToQueue(id);
    queueManager.startProcessing();
  } else {
    // Single-view logic
    const prompt = singleViewPrompts.get(id);
    if (!prompt) return;
    
    // Process prompt (queue manager handles this)
    queueManager.startProcessing();
  }
},
```

Update queue manager to detect type:

```typescript
// In src/services/queueManager.ts

private async processParagraph(paragraphId: string): Promise<void> {
  const store = useEditorStore.getState();
  
  // Check if it's a paragraph or prompt
  const paragraph = store.paragraphs.get(paragraphId);
  const prompt = store.singleViewPrompts.get(paragraphId);
  
  if (paragraph) {
    // Existing paragraph processing
    // ... existing code
  } else if (prompt) {
    // Process as prompt (similar logic, different store methods)
    await this.processPrompt(paragraphId);
  }
}

private async processPrompt(promptId: PromptId): Promise<void> {
  // Same as paragraph processing but uses:
  // - store.singleViewPrompts instead of store.paragraphs
  // - store.updatePrompt instead of store.updateParagraph
  // - store.replaceTextInline on complete
}
```

### Verification
- [ ] Selected text processes correctly
- [ ] Queue manager handles prompts
- [ ] Inline replacement works

---

## Step 6: Update TextEditor for Mode Switching

**Purpose:** Conditional rendering based on view mode  
**Duration:** 15 minutes

### Instructions

Update `src/components/TextEditor.tsx`:

```typescript
import { SingleViewEditor } from './SingleViewEditor';

export const TextEditor: React.FC = () => {
  // ... existing hooks and state
  
  const viewMode = useEditorStore((state) => state.viewMode);
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <SettingsModal />
      <EditorHeader />

      {/* Conditional rendering */}
      {viewMode === 'split' ? (
        // Existing split-view (preserve as-is)
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* ... all existing split-view code unchanged ... */}
        </div>
      ) : (
        // New single-view
        <SingleViewEditor />
      )}
    </div>
  );
};
```

### Verification
- [ ] Mode switching works
- [ ] Split-view preserved
- [ ] Single-view displays
- [ ] No data loss on switch

---

## Step 7: Add Visual Feedback for Selection

**Purpose:** Show users what text is selected for enhancement  
**Duration:** 20 minutes

### Instructions

Add visual highlight overlay to SingleViewEditor:

```typescript
// Add to SingleViewEditor component

const renderSelectionHighlight = () => {
  if (!selection) return null;
  
  return (
    <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-mono shadow-accent">
      {selection.end - selection.start} characters selected
    </div>
  );
};

// Update JSX
<div className="relative flex-1">
  <textarea ref={textareaRef} /* ... */ />
  {renderSelectionHighlight()}
  {renderActivePromptMarkers()}
</div>
```

Add markers for active (streaming) prompts:

```typescript
const renderActivePromptMarkers = () => {
  const activePrompts = Array.from(singleViewPrompts.values())
    .filter(p => p.status === 'streaming' || p.status === 'processing');
  
  if (activePrompts.length === 0) return null;
  
  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1">
      {activePrompts.map(prompt => (
        <div
          key={prompt.id}
          className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-mono border border-primary/30"
        >
          Enhancing... {Math.round(prompt.progress.percentage)}%
        </div>
      ))}
    </div>
  );
};
```

### Verification
- [ ] Selection count shows
- [ ] Active prompts displayed
- [ ] Progress updates

---

## Step 8: Add System Prompt Presets

**Purpose:** Specialized prompts for single-view use cases  
**Duration:** 15 minutes

### Instructions

Add to `src/constants/index.ts`:

```typescript
/** System prompt presets optimized for single-view inline enhancement */
export const SINGLE_VIEW_PROMPTS = {
  ENHANCE: 'Enhance and improve the following text while preserving its meaning. Make it more polished and professional.',
  EXPAND: 'Expand on the following text with additional detail and examples. Keep the core message but elaborate.',
  SIMPLIFY: 'Simplify the following text. Make it clearer and more concise.',
  CREATIVE: 'Rewrite the following text to be more creative, vivid, and engaging.',
  CONTINUE: 'Continue writing from where this text leaves off. Maintain the same style and tone.',
  PROFESSIONAL: 'Rewrite the following text in a professional, formal tone.',
  CASUAL: 'Rewrite the following text in a casual, conversational tone.',
} as const;
```

---

## Step 9: Testing Procedures

**Purpose:** Comprehensive testing of both modes  
**Duration:** 45 minutes

### Manual Testing Checklist

#### Single-View Mode
- [ ] Can type in textarea
- [ ] Text selection works (mouse and keyboard)
- [ ] Enhance button disabled when nothing selected
- [ ] Enhance button enabled when text selected
- [ ] Clicking Enhance triggers processing
- [ ] Ctrl+E shortcut works
- [ ] Selected text queues for enhancement
- [ ] Progress indicator shows
- [ ] Completed text replaces inline
- [ ] Multiple selections work
- [ ] Can re-select and re-enhance

#### Split-View Mode (Regression Testing)
- [ ] Still works exactly as before
- [ ] Space→Backspace trigger works
- [ ] Double newlines separate paragraphs
- [ ] Output in right panel
- [ ] Wave animations work
- [ ] All features functional

#### Mode Switching
- [ ] Tabs switch smoothly
- [ ] No crashes
- [ ] Data preserved
- [ ] Performance stable

### Edge Cases
- [ ] Select entire document
- [ ] Select single word
- [ ] Select across line breaks
- [ ] Empty selection
- [ ] Overlapping enhancements
- [ ] Rapid button clicking

---

## Step 10: Documentation Updates

**Purpose:** Update all docs to reflect simplified approach  
**Duration:** 30 minutes

### Update README.md

```markdown
## 📘 Usage Guide

### Single-View Mode

**Inline Enhancement Workflow:**

1. **Write Your Text**: Type naturally in the document
2. **Select Text**: Highlight the text you want to enhance
3. **Click Enhance**: Press the ⚡ Enhance button (or Ctrl+E)
4. **Watch Transformation**: See your text improve inline with animation
5. **Continue Writing**: Keep editing and enhancing different sections

**Perfect For:**
- Writing stories with AI assistance
- Expanding brief notes into full paragraphs
- Refining style and tone inline
- Creative collaboration with AI

**Keyboard Shortcut:** Ctrl+E (or ⌘+E on Mac)
```

---

## Implementation Summary

### What Changed from Original Plan

**Removed (Complex):**
- ❌ Cursor position tracking on Space key
- ❌ Space→Backspace sequence detection for end
- ❌ `activeCursorPosition` state management
- ❌ `setCursorPosition` action
- ❌ `createPromptFromCursor` action

**Added (Simple):**
- ✅ Native text selection tracking
- ✅ Enhance button in footer
- ✅ Button disabled/enabled state
- ✅ Ctrl+E keyboard shortcut
- ✅ `currentSelection` state
- ✅ `enhanceSelection` action
- ✅ Visual selection counter

### Code Reduction

**Before:** ~400 lines of complex logic  
**After:** ~250 lines of simple logic  
**Reduction:** 37% less code, much clearer!

---

## Phase Completion Checklist

- [ ] **Types & State**
  - [ ] ViewMode, PromptId, PromptRegion, TextSelection types added
  - [ ] Store has viewMode and singleView state
  - [ ] Factory functions created
  - [ ] Actions implemented

- [ ] **UI Components**
  - [ ] Tab navigation in header
  - [ ] SingleViewEditor component
  - [ ] Enhance button with proper states
  - [ ] Visual feedback for selection

- [ ] **Functionality**
  - [ ] Text selection tracking works
  - [ ] Enhance button triggers processing
  - [ ] Ctrl+E shortcut works
  - [ ] Inline replacement works
  - [ ] Multiple enhancements supported

- [ ] **Integration**
  - [ ] Queue manager handles prompts
  - [ ] Streaming works
  - [ ] Error handling works
  - [ ] Mode switching works
  - [ ] Split-view preserved

- [ ] **Testing**
  - [ ] Manual testing complete
  - [ ] Edge cases tested
  - [ ] Both modes verified
  - [ ] Performance acceptable

- [ ] **Documentation**
  - [ ] README updated
  - [ ] User guide created
  - [ ] Examples provided
  - [ ] Shortcuts documented

---

## Success Criteria

**Phase 12 is complete when:**
- ✅ Both view modes work perfectly
- ✅ Text selection triggers Enhance button
- ✅ Ctrl+E shortcut functional
- ✅ Inline replacement accurate
- ✅ Multiple enhancements supported
- ✅ No data loss between modes
- ✅ All tests passing
- ✅ Documentation complete

---

## Next Steps After Phase 12

1. **Gather user feedback** on single-view UX
2. **Consider Phase 13**: ContentEditable for real-time wave animation during streaming
3. **Add undo/redo** for text replacements
4. **Create preset workflows** (e.g., "Story Mode", "Blog Post Mode")
5. **Export functionality** for saving final documents

---

**Phase Status:** 📋 Ready for Implementation  
**Estimated Duration:** 3-4 hours (reduced from 6-8!)  
**Complexity:** Medium (reduced from High)

---

## Summary

Phase 12 adds an intuitive Single-View mode using familiar text selection UX:

✨ **Select Text** → **Click Enhance** → **Watch it Transform Inline**

This simplified approach is:
- **Easier to implement** (37% less code)
- **Better UX** (familiar select→action pattern)
- **More flexible** (enhance any text, anywhere)
- **Keyboard friendly** (Ctrl+E shortcut)
- **Visual** (clear button state, selection counter)

Combined with specialized system prompts, Single-View mode creates an immersive AI-assisted writing experience!
