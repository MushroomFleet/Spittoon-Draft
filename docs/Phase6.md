# Phase 6: Editor Component & UI Layout

## Phase Overview

**Goal:** Build the main text editor interface with split-pane layout and real-time paragraph detection  
**Prerequisites:** Phase 5 completed (animation system)  
**Estimated Duration:** 4-5 hours  
**Key Deliverables:**
- TextEditor main component
- Split-pane layout (input/output)
- Real-time paragraph detection integration
- Debounced text handling
- Auto-scroll behavior
- Status indicators and statistics
- Responsive layout

---

## Step-by-Step Implementation

### Step 1: Create Base Editor Component

**Purpose:** Build the main text editor with textarea and basic state  
**Duration:** 45 minutes

#### Instructions

Create `src/components/TextEditor.tsx`:

```typescript
/**
 * TextEditor - Main component with split-pane layout
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useParagraphs } from '../store/hooks';
import { queueManager } from '../services/queueManager';
import { ParagraphDisplay } from './ParagraphDisplay';
import { EditorHeader } from './EditorHeader';
import { EditorStats } from './EditorStats';
import {
  EDITOR_PLACEHOLDER,
  PARAGRAPH_DETECTION_DEBOUNCE,
} from '../constants';

export const TextEditor: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const outputPanelRef = useRef<HTMLDivElement>(null);

  // Store state
  const rawText = useEditorStore((state) => state.rawText);
  const updateRawText = useEditorStore((state) => state.updateRawText);
  const detectParagraphs = useEditorStore((state) => state.detectParagraphs);
  const retryStream = useEditorStore((state) => state.retryStream);
  const cancelStream = useEditorStore((state) => state.cancelStream);

  // Get paragraphs (sorted by position)
  const paragraphs = useParagraphs();

  // Initialize queue manager
  useEffect(() => {
    queueManager.startProcessing();

    return () => {
      queueManager.stopProcessing();
    };
  }, []);

  // Handle text changes with debouncing
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      updateRawText(newText);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounced detection
      debounceTimerRef.current = setTimeout(() => {
        detectParagraphs();
      }, PARAGRAPH_DETECTION_DEBOUNCE);
    },
    [updateRawText, detectParagraphs]
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

  // Auto-scroll output panel when new content appears
  useEffect(() => {
    if (outputPanelRef.current) {
      const panel = outputPanelRef.current;
      const isNearBottom = 
        panel.scrollHeight - panel.scrollTop - panel.clientHeight < 100;
      
      if (isNearBottom) {
        panel.scrollTop = panel.scrollHeight;
      }
    }
  }, [paragraphs.length]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <EditorHeader />

      {/* Main Content - Split Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Input */}
        <div className="w-1/2 border-r border-gray-300 flex flex-col bg-white">
          {/* Input Header */}
          <div className="bg-gray-800 text-white px-4 py-2 font-semibold flex items-center justify-between">
            <span>Your Writing</span>
            <div className="text-xs text-gray-300">
              {rawText.length} characters
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={rawText}
            onChange={handleTextChange}
            placeholder={EDITOR_PLACEHOLDER}
            className="flex-1 p-4 resize-none font-mono text-sm focus:outline-none"
            spellCheck={false}
          />

          {/* Input Footer */}
          <div className="bg-gray-100 px-4 py-2 text-xs text-gray-600 border-t flex items-center justify-between">
            <span>💡 Tip: Use double line breaks (↵↵) to complete paragraphs</span>
            <span className="font-mono">{paragraphs.length} paragraphs</span>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="w-1/2 flex flex-col bg-gray-50">
          {/* Output Header */}
          <div className="bg-blue-600 text-white px-4 py-2 font-semibold flex items-center justify-between">
            <span>AI-Enhanced Output</span>
            <EditorStats />
          </div>

          {/* Output Content */}
          <div
            ref={outputPanelRef}
            className="flex-1 p-4 overflow-y-auto"
          >
            {paragraphs.length === 0 ? (
              <div className="text-center text-gray-400 mt-16">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-lg font-medium">No paragraphs yet</p>
                <p className="text-sm mt-2">
                  Start typing and use ↵↵ to complete paragraphs
                </p>
              </div>
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
    </div>
  );
};
```

#### Verification
- [ ] TextEditor renders correctly
- [ ] Split-pane layout works
- [ ] Textarea captures input
- [ ] Debouncing works

---

### Step 2: Create Editor Header Component

**Purpose:** Build top header with title and settings button  
**Duration:** 20 minutes

#### Instructions

Create `src/components/EditorHeader.tsx`:

```typescript
/**
 * EditorHeader - Top navigation bar
 */

import React from 'react';
import { useEditorStore } from '../store/editorStore';
import { APP_NAME } from '../constants';

export const EditorHeader: React.FC = () => {
  const setSettingsOpen = useEditorStore((state) => state.setSettingsOpen);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">⚡ {APP_NAME}</h1>
          <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
            MVP
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSettingsOpen(true)}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
            title="Open Settings"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
```

#### Verification
- [ ] Header renders
- [ ] Settings button works
- [ ] Gradient background displays
- [ ] Responsive to width

---

### Step 3: Create Editor Statistics Component

**Purpose:** Display real-time processing statistics  
**Duration:** 30 minutes

#### Instructions

Create `src/components/EditorStats.tsx`:

```typescript
/**
 * EditorStats - Display processing statistics
 */

import React from 'react';
import {
  useQueueStats,
  useParagraphCountByStatus,
  useActiveParagraphs,
} from '../store/hooks';

export const EditorStats: React.FC = () => {
  const queueStats = useQueueStats();
  const statusCounts = useParagraphCountByStatus();
  const activeParagraphs = useActiveParagraphs();

  return (
    <div className="flex items-center gap-4 text-xs">
      {/* Active Processing */}
      <div className="flex items-center gap-1">
        <span className="font-mono font-semibold">
          {queueStats.activeCount}/{queueStats.maxConcurrent}
        </span>
        <span className="text-blue-200">active</span>
      </div>

      {/* Queue Length */}
      {queueStats.queueLength > 0 && (
        <div className="flex items-center gap-1">
          <span className="font-mono font-semibold">
            {queueStats.queueLength}
          </span>
          <span className="text-blue-200">queued</span>
        </div>
      )}

      {/* Completed */}
      <div className="flex items-center gap-1">
        <span className="text-green-300">✓</span>
        <span className="font-mono font-semibold">
          {statusCounts.complete}
        </span>
      </div>

      {/* Errors */}
      {statusCounts.error > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-red-300">✗</span>
          <span className="font-mono font-semibold">
            {statusCounts.error}
          </span>
        </div>
      )}
    </div>
  );
};
```

#### Verification
- [ ] Statistics display correctly
- [ ] Updates in real-time
- [ ] Numbers are accurate
- [ ] Conditional rendering works

---

### Step 4: Add Keyboard Shortcuts

**Purpose:** Implement helpful keyboard shortcuts for power users  
**Duration:** 30 minutes

#### Instructions

1. Create keyboard shortcut hook `src/hooks/useKeyboardShortcuts.ts`:

```typescript
/**
 * useKeyboardShortcuts - Handle keyboard shortcuts
 */

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};
```

2. Add shortcuts to TextEditor:

```typescript
// In TextEditor.tsx, add:

import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

// Inside component:
const clearQueue = useEditorStore((state) => state.clearQueue);
const reset = useEditorStore((state) => state.reset);

useKeyboardShortcuts([
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
```

#### Verification
- [ ] Ctrl+, opens settings
- [ ] Ctrl+K clears queue
- [ ] Ctrl+Shift+R resets app
- [ ] Shortcuts don't conflict

---

### Step 5: Implement Auto-Scroll Behavior

**Purpose:** Automatically scroll output panel as new content appears  
**Duration:** 20 minutes

#### Instructions

Update TextEditor with improved auto-scroll:

```typescript
// In TextEditor.tsx

import { useEffect, useRef, useState } from 'react';

// Add state for auto-scroll
const [autoScroll, setAutoScroll] = useState(true);
const isUserScrollingRef = useRef(false);

// Handle manual scrolling
const handleOutputScroll = useCallback(() => {
  if (!outputPanelRef.current) return;

  const panel = outputPanelRef.current;
  const isAtBottom = 
    Math.abs(panel.scrollHeight - panel.scrollTop - panel.clientHeight) < 50;

  // Update auto-scroll state based on user position
  if (!isUserScrollingRef.current) {
    setAutoScroll(isAtBottom);
  }
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

// Add scroll listener
useEffect(() => {
  const panel = outputPanelRef.current;
  if (!panel) return;

  panel.addEventListener('scroll', handleOutputScroll);

  return () => {
    panel.removeEventListener('scroll', handleOutputScroll);
  };
}, [handleOutputScroll]);

// Update JSX to add scroll handler and auto-scroll indicator
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
      className="fixed bottom-4 right-4 px-3 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors text-sm font-medium z-10"
    >
      ↓ Jump to Bottom
    </button>
  )}
  
  {/* Content */}
  {/* ... rest of content ... */}
</div>
```

#### Verification
- [ ] Auto-scrolls on new content
- [ ] Stops when user scrolls up
- [ ] "Jump to bottom" button appears
- [ ] Smooth scrolling works

---

### Step 6: Add Loading States and Empty States

**Purpose:** Provide visual feedback for all application states  
**Duration:** 30 minutes

#### Instructions

1. Create loading indicator `src/components/LoadingIndicator.tsx`:

```typescript
/**
 * LoadingIndicator - Animated loading spinner
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  message,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};
```

2. Create empty state `src/components/EmptyState.tsx`:

```typescript
/**
 * EmptyState - Display when no content available
 */

import React from 'react';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📝',
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center text-gray-400 py-16">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-lg font-medium text-gray-600">{title}</p>
      {description && (
        <p className="text-sm mt-2 text-gray-500">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
```

3. Update TextEditor to use these components:

```typescript
// In the output panel:
{paragraphs.length === 0 ? (
  <EmptyState
    icon="✨"
    title="No paragraphs yet"
    description="Start typing and use ↵↵ to complete paragraphs"
  />
) : (
  // ... existing paragraph display
)}
```

#### Verification
- [ ] Loading indicators animate
- [ ] Empty states display correctly
- [ ] Icons render properly
- [ ] Messages are clear

---

### Step 7: Make Layout Responsive

**Purpose:** Ensure UI works on different screen sizes  
**Duration:** 30 minutes

#### Instructions

1. Add responsive styles to TextEditor:

```typescript
// Update split-pane classes:
<div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
  {/* Left Panel */}
  <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-300 flex flex-col bg-white h-1/2 lg:h-full">
    {/* ... */}
  </div>

  {/* Right Panel */}
  <div className="w-full lg:w-1/2 flex flex-col bg-gray-50 h-1/2 lg:h-full">
    {/* ... */}
  </div>
</div>
```

2. Add mobile-friendly header:

```typescript
// In EditorHeader:
<header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 lg:px-6 py-3 shadow-lg">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 lg:gap-3">
      <h1 className="text-xl lg:text-2xl font-bold">⚡ {APP_NAME}</h1>
      <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded hidden sm:inline">
        MVP
      </span>
    </div>

    <button
      onClick={() => setSettingsOpen(true)}
      className="px-3 lg:px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors text-sm font-medium"
    >
      <span className="hidden sm:inline">⚙️ Settings</span>
      <span className="sm:hidden">⚙️</span>
    </button>
  </div>
</header>
```

#### Verification
- [ ] Works on mobile (< 768px)
- [ ] Works on tablet (768px - 1024px)
- [ ] Works on desktop (> 1024px)
- [ ] No horizontal scrolling
- [ ] Touch-friendly buttons

---

## Testing Procedures

### Functional Testing

1. **Text Input:**
   - [ ] Can type in textarea
   - [ ] Text updates in real-time
   - [ ] Character count updates
   - [ ] No lag when typing

2. **Paragraph Detection:**
   - [ ] Double enter creates paragraph
   - [ ] Debouncing works (500ms)
   - [ ] Paragraphs appear in output
   - [ ] No duplicates created

3. **Auto-Scroll:**
   - [ ] Scrolls on new content
   - [ ] Stops when user scrolls
   - [ ] Jump button appears
   - [ ] Smooth animation

4. **Keyboard Shortcuts:**
   - [ ] All shortcuts work
   - [ ] No conflicts
   - [ ] Prevent default behavior
   - [ ] Cross-platform (Ctrl/Cmd)

### Visual Testing

1. **Layout:**
   - [ ] 50/50 split on desktop
   - [ ] Responsive on mobile
   - [ ] No overflow issues
   - [ ] Proper spacing

2. **Components:**
   - [ ] Header displays correctly
   - [ ] Stats update in real-time
   - [ ] Empty state shows initially
   - [ ] Loading indicators animate

---

## Troubleshooting

### Common Issues

#### Issue: Textarea not debouncing
**Solution:**
- Check debounceTimerRef is cleared
- Verify PARAGRAPH_DETECTION_DEBOUNCE constant
- Add console.log to track calls
- Use useCallback properly

#### Issue: Auto-scroll not working
**Solution:**
- Check scrollHeight calculation
- Verify ref is attached
- Check isAtBottom logic
- Add console.log for debugging

#### Issue: Layout breaking on mobile
**Solution:**
- Use Chrome DevTools device mode
- Check flex-col/flex-row responsive
- Verify height classes (h-1/2)
- Test on real device

#### Issue: Performance lag when typing
**Solution:**
- Check for unnecessary re-renders
- Use React DevTools Profiler
- Verify memoization
- Reduce debounce time if needed

---

## Phase Completion Checklist

- [ ] **Editor component**
  - [ ] TextEditor created
  - [ ] Split-pane layout works
  - [ ] Textarea captures input
  - [ ] Debouncing implemented

- [ ] **Supporting components**
  - [ ] EditorHeader created
  - [ ] EditorStats displays correctly
  - [ ] LoadingIndicator animates
  - [ ] EmptyState shows properly

- [ ] **Features**
  - [ ] Keyboard shortcuts work
  - [ ] Auto-scroll functional
  - [ ] Statistics update
  - [ ] Error handling

- [ ] **Polish**
  - [ ] Responsive layout
  - [ ] Visual feedback
  - [ ] Smooth animations
  - [ ] User-friendly

- [ ] **Testing**
  - [ ] Functional tests pass
  - [ ] Visual inspection complete
  - [ ] Cross-browser tested
  - [ ] Mobile tested

---

## Next Steps

1. **Commit your work:**
   ```bash
   git add src/components src/hooks
   git commit -m "feat: complete Phase 6 - editor component and UI"
   git push
   ```

2. **Proceed to Phase 7:**
   - Open `Phase7.md`
   - Build settings modal
   - Add configuration UI

---

**Phase Status:** ✅ Ready for Implementation  
**Next Phase:** Phase 7 - Settings & Configuration UI
