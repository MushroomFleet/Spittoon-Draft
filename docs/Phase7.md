# Phase 7: Settings & Configuration UI

## Phase Overview

**Goal:** Create comprehensive settings interface for configuring API access and model parameters  
**Prerequisites:** Phase 6 completed (editor component)  
**Estimated Duration:** 2-3 hours  
**Key Deliverables:**
- SettingsModal component
- API key input with masking
- Model selection dropdown
- Parameter controls (temperature, max tokens)
- System prompt editor
- Form validation
- Settings persistence via localStorage
- Help tooltips and descriptions

---

## Step-by-Step Implementation

### Step 1: Create Settings Modal Shell

**Purpose:** Build base modal component with open/close logic  
**Duration:** 30 minutes

#### Instructions

Create `src/components/SettingsModal.tsx`:

```typescript
/**
 * SettingsModal - Configuration interface
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '../store/editorStore';
import { StreamConfig } from '../types';
import { validateStreamConfig } from '../utils/validation';

export const SettingsModal: React.FC = () => {
  const isOpen = useEditorStore((state) => state.isSettingsOpen);
  const setSettingsOpen = useEditorStore((state) => state.setSettingsOpen);
  const streamConfig = useEditorStore((state) => state.streamConfig);
  const setStreamConfig = useEditorStore((state) => state.setStreamConfig);

  // Local state for editing
  const [config, setConfig] = useState<StreamConfig>(streamConfig);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

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

  // Handle save
  const handleSave = () => {
    // Validate configuration
    const validation = validateStreamConfig(config);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Save to store
    setStreamConfig(config);
    setErrors([]);
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
          className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-sm text-blue-100 mt-1">
              Configure API access and model parameters
            </p>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Error Display */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-md">
                <div className="font-semibold text-red-800 mb-2">
                  Please fix the following errors:
                </div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Settings will be added in next steps */}
            <div className="space-y-6">
              {/* Placeholder for settings sections */}
              <p className="text-gray-500">Settings sections will be added here...</p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-sm text-gray-600">
                  Unsaved changes
                </span>
              )}
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors font-medium"
              >
                Save Settings
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
```

#### Verification
- [ ] Modal opens and closes
- [ ] Backdrop click closes modal
- [ ] Animation smooth
- [ ] Escape key closes modal (add if needed)

---

### Step 2: Add API Key Configuration

**Purpose:** Secure API key input with masking  
**Duration:** 30 minutes

#### Instructions

Add API key section to SettingsModal:

```typescript
// Import at top:
import { useState } from 'react';

// Inside modal body, replace placeholder:

{/* API Key Section */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    OpenRouter API Key
    <span className="text-red-500 ml-1">*</span>
  </label>
  
  <div className="relative">
    <input
      type={showApiKey ? 'text' : 'password'}
      value={config.apiKey}
      onChange={(e) =>
        setConfig({ ...config, apiKey: e.target.value })
      }
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
      placeholder="sk-or-v1-..."
    />
    
    {/* Show/Hide Toggle */}
    <button
      type="button"
      onClick={() => setShowApiKey(!showApiKey)}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      title={showApiKey ? 'Hide API key' : 'Show API key'}
    >
      {showApiKey ? '👁️' : '👁️‍🗨️'}
    </button>
  </div>
  
  <p className="text-xs text-gray-500 flex items-start gap-1">
    <span>💡</span>
    <span>
      Get your API key from{' '}
      <a
        href="https://openrouter.ai/keys"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        openrouter.ai/keys
      </a>
    </span>
  </p>
</div>
```

// Add state at component top:
```typescript
const [showApiKey, setShowApiKey] = useState(false);
```

#### Verification
- [ ] API key input works
- [ ] Show/hide toggle works
- [ ] Masking applies correctly
- [ ] Link opens in new tab

---

### Step 3: Add Model Selection

**Purpose:** Dropdown for selecting AI model  
**Duration:** 20 minutes

#### Instructions

```typescript
// Import constants
import { MODEL_OPTIONS } from '../constants';

// Add to modal body:

{/* Model Selection */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    AI Model
    <span className="text-red-500 ml-1">*</span>
  </label>
  
  <select
    value={config.model}
    onChange={(e) =>
      setConfig({ ...config, model: e.target.value as any })
    }
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    {MODEL_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
  
  {/* Model Description */}
  {(() => {
    const selectedModel = MODEL_OPTIONS.find(
      (m) => m.value === config.model
    );
    return selectedModel ? (
      <p className="text-xs text-gray-500">
        {selectedModel.description}
      </p>
    ) : null;
  })()}
</div>
```

#### Verification
- [ ] Dropdown displays models
- [ ] Selection updates
- [ ] Description shows
- [ ] Default value correct

---

### Step 4: Add System Prompt Editor

**Purpose:** Textarea for customizing AI instructions  
**Duration:** 20 minutes

#### Instructions

```typescript
{/* System Prompt */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    System Prompt
    <span className="text-red-500 ml-1">*</span>
  </label>
  
  <textarea
    value={config.systemPrompt}
    onChange={(e) =>
      setConfig({ ...config, systemPrompt: e.target.value })
    }
    rows={4}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
    placeholder="Enter instructions for the AI..."
  />
  
  <div className="flex items-center justify-between">
    <p className="text-xs text-gray-500">
      Define how the AI should transform your text
    </p>
    <span className="text-xs text-gray-400 font-mono">
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
            'You are a helpful writing assistant. Improve grammar, clarity, and style while preserving the author\'s voice and intent.',
        })
      }
      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
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
      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
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
      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
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
      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
    >
      Grammar Only
    </button>
  </div>
</div>
```

#### Verification
- [ ] Textarea works
- [ ] Character count updates
- [ ] Presets work
- [ ] Length limit enforced

---

### Step 5: Add Parameter Controls

**Purpose:** Sliders and inputs for model parameters  
**Duration:** 30 minutes

#### Instructions

```typescript
{/* Model Parameters */}
<div className="space-y-4">
  <h3 className="font-semibold text-gray-800 text-sm">
    Model Parameters
  </h3>

  {/* Temperature */}
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-700">
        Temperature
      </label>
      <span className="text-sm font-mono text-gray-600">
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
      className="w-full accent-blue-600"
    />
    
    <p className="text-xs text-gray-500">
      Higher values make output more creative and random. Lower values make it more focused and deterministic.
    </p>
  </div>

  {/* Max Tokens */}
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-700">
        Max Tokens
      </label>
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
        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono text-right"
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
      className="w-full accent-blue-600"
    />
    
    <p className="text-xs text-gray-500">
      Maximum length of the generated response. Higher values allow longer transformations but may cost more.
    </p>
  </div>

  {/* Advanced Toggle */}
  <button
    type="button"
    onClick={() => setShowAdvanced(!showAdvanced)}
    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
  >
    {showAdvanced ? '▼' : '▶'} Advanced Parameters
  </button>

  {/* Advanced Parameters */}
  {showAdvanced && (
    <div className="pl-4 space-y-4 border-l-2 border-gray-200">
      {/* Top-P */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">
            Top-P
          </label>
          <span className="text-sm font-mono text-gray-600">
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
          className="w-full accent-blue-600"
        />
        <p className="text-xs text-gray-500">
          Nucleus sampling threshold. Lower values make output more focused.
        </p>
      </div>

      {/* Frequency Penalty */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">
            Frequency Penalty
          </label>
          <span className="text-sm font-mono text-gray-600">
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
          className="w-full accent-blue-600"
        />
        <p className="text-xs text-gray-500">
          Penalizes repeated tokens. Positive values discourage repetition.
        </p>
      </div>

      {/* Presence Penalty */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">
            Presence Penalty
          </label>
          <span className="text-sm font-mono text-gray-600">
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
          className="w-full accent-blue-600"
        />
        <p className="text-xs text-gray-500">
          Penalizes new topics. Positive values encourage topic diversity.
        </p>
      </div>
    </div>
  )}
</div>
```

// Add state:
```typescript
const [showAdvanced, setShowAdvanced] = useState(false);
```

#### Verification
- [ ] Temperature slider works
- [ ] Max tokens input/slider works
- [ ] Advanced toggle works
- [ ] All parameters update correctly

---

### Step 6: Add Reset to Defaults Button

**Purpose:** Allow users to restore default settings  
**Duration:** 15 minutes

#### Instructions

Add to modal footer, before Cancel button:

```typescript
<button
  onClick={() => {
    if (confirm('Reset all settings to defaults?')) {
      setConfig(createDefaultStreamConfig(config.apiKey));
      setErrors([]);
    }
  }}
  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
>
  Reset to Defaults
</button>
```

Import at top:
```typescript
import { createDefaultStreamConfig } from '../types/factories';
```

#### Verification
- [ ] Reset button works
- [ ] Confirmation dialog shows
- [ ] API key preserved
- [ ] All other settings reset

---

## Testing Procedures

### Functional Testing

1. **Modal Behavior:**
   - [ ] Opens via header button
   - [ ] Closes via cancel button
   - [ ] Closes via backdrop click
   - [ ] Prompts on unsaved changes
   - [ ] Animation smooth

2. **Form Validation:**
   - [ ] Empty API key shows error
   - [ ] Invalid parameters show error
   - [ ] Cannot save with errors
   - [ ] Error messages clear

3. **Settings Persistence:**
   - [ ] Settings save to localStorage
   - [ ] Settings load on app start
   - [ ] API key stored separately
   - [ ] Changes persist after reload

4. **Parameter Controls:**
   - [ ] All sliders work
   - [ ] Number inputs work
   - [ ] Min/max enforced
   - [ ] Real-time updates

### Visual Testing

1. **Layout:**
   - [ ] Modal centered
   - [ ] Content scrollable
   - [ ] Footer always visible
   - [ ] Responsive

2. **Styling:**
   - [ ] Consistent colors
   - [ ] Proper spacing
   - [ ] Clear typography
   - [ ] Accessible contrast

---

## Troubleshooting

### Common Issues

#### Issue: Settings not persisting
**Solution:**
- Check localStorage is available
- Verify saveConfigToStorage is called
- Check browser storage quota
- Look for JSON serialization errors

#### Issue: Validation not working
**Solution:**
- Check validateStreamConfig function
- Verify error state updates
- Check if errors clear on fix
- Add console.log for debugging

#### Issue: Modal not closing
**Solution:**
- Check setSettingsOpen is called
- Verify backdrop click handler
- Check for event propagation issues
- Verify state updates

#### Issue: Sliders jumpy or not smooth
**Solution:**
- Check step values
- Verify onChange updates
- Check for unnecessary re-renders
- Use debouncing if needed

---

## Phase Completion Checklist

- [ ] **Modal structure**
  - [ ] Modal opens and closes
  - [ ] Animation smooth
  - [ ] Backdrop behavior correct
  - [ ] Unsaved changes handled

- [ ] **Configuration options**
  - [ ] API key input works
  - [ ] Model selection works
  - [ ] System prompt editor works
  - [ ] All parameters work

- [ ] **Validation**
  - [ ] Form validation works
  - [ ] Error messages clear
  - [ ] Cannot save invalid
  - [ ] Validation comprehensive

- [ ] **Persistence**
  - [ ] Settings save
  - [ ] Settings load
  - [ ] Reset to defaults works
  - [ ] API key secure

- [ ] **Polish**
  - [ ] Help text clear
  - [ ] Tooltips helpful
  - [ ] Presets work
  - [ ] Advanced toggle works

- [ ] **Testing**
  - [ ] All functionality tested
  - [ ] Visual inspection complete
  - [ ] Edge cases covered
  - [ ] Cross-browser tested

---

## Next Steps

1. **Commit your work:**
   ```bash
   git add src/components
   git commit -m "feat: complete Phase 7 - settings and configuration UI"
   git push
   ```

2. **Proceed to Phase 8:**
   - Open `Phase8.md`
   - Integrate all components
   - Add final polish

---

**Phase Status:** ✅ Ready for Implementation  
**Next Phase:** Phase 8 - Integration & Polish
