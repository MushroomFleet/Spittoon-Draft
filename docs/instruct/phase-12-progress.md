# Phase 12: Single-View Mode Implementation - Progress Tracker

**Started:** 2025-10-24 09:54:40 (Europe/London)  
**Status:** 🚧 In Progress  
**Estimated Duration:** 3.5-4 hours

---

## Overview

Phase 12 adds Single-View mode alongside existing Split-View mode with text selection-based inline enhancement and wave animations.

## Implementation Checklist

### Step 1: Update Type Definitions ⏳
**Duration:** 15 minutes | **Status:** ⏳ In Progress

- [ ] Add ViewMode type
- [ ] Add PromptId type
- [ ] Add TextSelection interface
- [ ] Add PromptRegion interface
- [ ] Add PromptPreset type
- [ ] Update EditorState interface
- [ ] Add factory functions for PromptRegion

**Files to Modify:**
- `src/types/index.ts`
- `src/types/factories.ts`

---

### Step 2: Update Store with View Mode State ⏳
**Duration:** 25 minutes | **Status:** ⏳ Pending

- [ ] Add viewMode state
- [ ] Add singleViewText state
- [ ] Add singleViewPrompts Map
- [ ] Add currentSelection state
- [ ] Add selectedPromptPreset state
- [ ] Implement setViewMode action
- [ ] Implement updateSingleViewText action
- [ ] Implement setCurrentSelection action
- [ ] Implement enhanceSelection action
- [ ] Implement updatePrompt action
- [ ] Implement replaceTextInline action
- [ ] Add mode switch confirmation logic

**Files to Modify:**
- `src/store/editorStore.ts`

---

### Step 3: Create Tab Navigation ⏳
**Duration:** 20 minutes | **Status:** ⏳ Pending

- [ ] Update EditorHeader component
- [ ] Add Split-View / Single-View tabs
- [ ] Add active tab highlighting
- [ ] Add mode switch confirmation dialog
- [ ] Test tab switching

**Files to Modify:**
- `src/components/EditorHeader.tsx`

---

### Step 4: Create SingleViewEditor Component ⏳
**Duration:** 45 minutes | **Status:** ⏳ Pending

- [ ] Create SingleViewEditor.tsx
- [ ] Add textarea with selection tracking
- [ ] Add prompt preset dropdown
- [ ] Add Enhance button
- [ ] Implement Ctrl+E keyboard shortcut
- [ ] Add selection change handlers
- [ ] Add visual feedback overlay
- [ ] Test text selection

**Files to Create:**
- `src/components/SingleViewEditor.tsx`

---

### Step 5: Integrate with Queue Manager ⏳
**Duration:** 30 minutes | **Status:** ⏳ Pending

- [ ] Update queueManager to handle PromptRegions
- [ ] Add processPrompt method
- [ ] Update startStream to detect type
- [ ] Test queue processing for prompts
- [ ] Verify wave animation triggers

**Files to Modify:**
- `src/services/queueManager.ts`
- `src/store/editorStore.ts`

---

### Step 6: Update TextEditor for Mode Switching ⏳
**Duration:** 15 minutes | **Status:** ⏳ Pending

- [ ] Add conditional rendering based on viewMode
- [ ] Import SingleViewEditor
- [ ] Add mode switch clear logic
- [ ] Test mode switching
- [ ] Verify state preservation

**Files to Modify:**
- `src/components/TextEditor.tsx`

---

### Step 7: Add Visual Feedback + Wave Animation ⏳
**Duration:** 20 minutes | **Status:** ⏳ Pending

- [ ] Add selection highlight overlay
- [ ] Add active prompts indicators
- [ ] Integrate WaveAnimator for inline replacement
- [ ] Add character transition calculations
- [ ] Test wave effect on inline replacement

**Files to Modify:**
- `src/components/SingleViewEditor.tsx`

---

### Step 8: Add System Prompt Presets UI ⏳
**Duration:** 15 minutes | **Status:** ⏳ Pending

- [ ] Add SINGLE_VIEW_PROMPTS to constants
- [ ] Add preset dropdown to SingleViewEditor
- [ ] Add "Custom" option
- [ ] Show/hide custom input based on selection
- [ ] Test preset switching

**Files to Modify:**
- `src/constants/index.ts`
- `src/components/SingleViewEditor.tsx`

---

### Step 9: Testing Procedures ⏳
**Duration:** 45 minutes | **Status:** ⏳ Pending

- [ ] Test split-view mode (regression)
- [ ] Test single-view text selection
- [ ] Test Enhance button functionality
- [ ] Test Ctrl+E shortcut
- [ ] Test wave animation
- [ ] Test mode switching with confirmation
- [ ] Test prompt presets
- [ ] Test edge cases

---

### Step 10: Documentation Updates ⏳
**Duration:** 30 minutes | **Status:** ⏳ Pending

- [ ] Update README.md with Single-View mode
- [ ] Document keyboard shortcuts
- [ ] Add usage examples
- [ ] Update CHANGELOG.md

**Files to Modify:**
- `README.md`
- `CHANGELOG.md`

---

## Time Log

| Step | Start Time | End Time | Duration | Status |
|------|-----------|----------|----------|--------|
| Progress Tracker | 09:54:40 | - | - | ✅ Created |
| Step 1: Type Definitions | - | - | - | ⏳ Starting |
| Step 2: Store Updates | - | - | - | ⏳ Pending |
| Step 3: Tab Navigation | - | - | - | ⏳ Pending |
| Step 4: SingleViewEditor | - | - | - | ⏳ Pending |
| Step 5: Queue Integration | - | - | - | ⏳ Pending |
| Step 6: Mode Switching | - | - | - | ⏳ Pending |
| Step 7: Visual Feedback | - | - | - | ⏳ Pending |
| Step 8: Prompt Presets | - | - | - | ⏳ Pending |
| Step 9: Testing | - | - | - | ⏳ Pending |
| Step 10: Documentation | - | - | - | ⏳ Pending |

---

## Issues & Solutions

(To be filled in during implementation)

---

## Key Design Decisions

1. **Mode Switching**: Clear state when switching modes to prevent confusion
2. **Prompt Presets**: Dropdown with 8 presets + Custom option
3. **Wave Animation**: Full wave effect for inline text replacement
4. **Queue Reuse**: Existing queue manager handles both paragraphs and prompts

---

**Last Updated:** 2025-10-24 09:54:40  
**Phase Status:** 🚧 In Progress (0/10 steps complete)
