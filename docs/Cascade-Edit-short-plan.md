# Cascade-Edit MVP Development Guide

## System Overview

Cascade-Edit is a real-time text transformation system that processes completed paragraphs through an AI API, streaming the results back with a character-by-character "wave" effect that transforms the original text inline above the user as they continue typing.

### Core Features
- **Paragraph Detection**: Identifies completed paragraphs via double carriage returns
- **Streaming Queue**: Processes multiple paragraphs in parallel via OpenRouter API
- **Character Wave Effect**: Transforms source text into output text with animated character replacement
- **Inline Editing**: Displays transformations above the typing position
- **Real-time Processing**: Continuous background processing as user types

---

## Architecture Overview

```
User Types → Paragraph Detector → Processing Queue → OpenRouter API (Streaming)
                                                              ↓
User Continues Typing ← Character Wave Animation ← Stream Parser
```

### Key Components

1. **TextEditor Component**: Main input area with paragraph detection
2. **ParagraphQueue**: Manages pending and processing paragraphs
3. **StreamProcessor**: Handles OpenRouter API streaming connections
4. **WaveAnimator**: Renders character-by-character transformations
5. **StateManager**: Coordinates multiple concurrent streams

---

## Tech Stack

- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **State Management**: Zustand (lightweight, perfect for queue management)
- **Animation**: Framer Motion (for character wave effects)
- **API**: OpenRouter streaming endpoints
- **Styling**: Tailwind CSS (rapid prototyping)

---

## Development Pathway

### Phase 1: Project Setup (30 minutes)

#### 1.1 Initialize Vite + React + TypeScript
```bash
npm create vite@latest cascade-edit -- --template react-ts
cd cascade-edit
npm install
```

#### 1.2 Install Dependencies
```bash
npm install zustand framer-motion
npm install -D @types/node
npm install --save-dev tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 1.3 Configure Tailwind
Update `tailwind.config.js`:
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### Phase 2: Core Data Structures (45 minutes)

#### 2.1 Type Definitions (`src/types/index.ts`)

```typescript
export interface Paragraph {
  id: string;
  originalText: string;
  transformedText: string;
  status: 'pending' | 'processing' | 'streaming' | 'complete' | 'error';
  startIndex: number; // Position in original document
  endIndex: number;
  streamProgress: number; // 0-100
  characterMap: CharacterTransition[];
}

export interface CharacterTransition {
  sourceChar: string;
  targetChar: string;
  progress: number; // 0-1 for animation
  index: number;
}

export interface QueueItem {
  paragraph: Paragraph;
  priority: number;
  timestamp: number;
}

export interface StreamConfig {
  apiKey: string;
  model: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}
```

#### 2.2 Store Setup (`src/store/editorStore.ts`)

```typescript
import { create } from 'zustand';
import { Paragraph, StreamConfig } from '../types';

interface EditorState {
  // Document state
  rawText: string;
  paragraphs: Map<string, Paragraph>;
  
  // Queue state
  processingQueue: string[]; // paragraph IDs
  maxConcurrent: number;
  
  // Config
  streamConfig: StreamConfig;
  
  // Actions
  updateRawText: (text: string) => void;
  detectParagraphs: () => void;
  addToQueue: (paragraphId: string) => void;
  updateParagraph: (id: string, updates: Partial<Paragraph>) => void;
  setStreamConfig: (config: StreamConfig) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  rawText: '',
  paragraphs: new Map(),
  processingQueue: [],
  maxConcurrent: 3,
  streamConfig: {
    apiKey: '',
    model: 'anthropic/claude-3.5-sonnet',
    systemPrompt: 'You are a helpful writing assistant. Improve grammar, clarity, and style while preserving the author\'s voice and intent.',
    temperature: 0.7,
    maxTokens: 1000,
  },
  
  updateRawText: (text) => set({ rawText: text }),
  
  detectParagraphs: () => {
    const { rawText, paragraphs } = get();
    const sections = rawText.split(/\n\n+/); // Double newline detector
    
    let currentIndex = 0;
    const newParagraphs = new Map(paragraphs);
    
    sections.forEach((text, idx) => {
      const trimmed = text.trim();
      if (trimmed.length > 0) {
        const id = `para-${idx}-${Date.now()}`;
        const existing = Array.from(paragraphs.values()).find(
          p => p.originalText === trimmed && p.status !== 'complete'
        );
        
        if (!existing) {
          newParagraphs.set(id, {
            id,
            originalText: trimmed,
            transformedText: '',
            status: 'pending',
            startIndex: currentIndex,
            endIndex: currentIndex + trimmed.length,
            streamProgress: 0,
            characterMap: [],
          });
        }
      }
      currentIndex += text.length + 2; // +2 for \n\n
    });
    
    set({ paragraphs: newParagraphs });
  },
  
  addToQueue: (paragraphId) => {
    const { processingQueue, maxConcurrent } = get();
    if (processingQueue.length < maxConcurrent && !processingQueue.includes(paragraphId)) {
      set({ processingQueue: [...processingQueue, paragraphId] });
    }
  },
  
  updateParagraph: (id, updates) => {
    const { paragraphs } = get();
    const updated = new Map(paragraphs);
    const existing = updated.get(id);
    if (existing) {
      updated.set(id, { ...existing, ...updates });
      set({ paragraphs: updated });
    }
  },
  
  setStreamConfig: (config) => set({ streamConfig: config }),
}));
```

---

### Phase 3: OpenRouter API Integration (60 minutes)

#### 3.1 Stream Processor (`src/services/streamProcessor.ts`)

```typescript
import { StreamConfig } from '../types';

export class StreamProcessor {
  private config: StreamConfig;
  private abortController: AbortController | null = null;

  constructor(config: StreamConfig) {
    this.config = config;
  }

  async processStream(
    text: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    this.abortController = new AbortController();

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Cascade-Edit',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: this.config.systemPrompt,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens ?? 1000,
          stream: true,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Stream aborted');
        } else {
          onError(error);
        }
      }
    }
  }

  abort(): void {
    this.abortController?.abort();
  }
}
```

#### 3.2 Queue Manager (`src/services/queueManager.ts`)

```typescript
import { useEditorStore } from '../store/editorStore';
import { StreamProcessor } from './streamProcessor';

export class QueueManager {
  private processors: Map<string, StreamProcessor> = new Map();
  private isProcessing = false;

  async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const processNext = async () => {
      const store = useEditorStore.getState();
      const { processingQueue, paragraphs, streamConfig, maxConcurrent } = store;

      // Get pending paragraphs
      const pending = Array.from(paragraphs.values())
        .filter(p => p.status === 'pending')
        .slice(0, maxConcurrent - processingQueue.length);

      for (const paragraph of pending) {
        if (processingQueue.length >= maxConcurrent) break;
        
        store.addToQueue(paragraph.id);
        store.updateParagraph(paragraph.id, { status: 'processing' });

        this.processParagraph(paragraph.id);
      }

      if (processingQueue.length > 0 || pending.length > 0) {
        setTimeout(processNext, 100);
      } else {
        this.isProcessing = false;
      }
    };

    processNext();
  }

  private async processParagraph(paragraphId: string): Promise<void> {
    const store = useEditorStore.getState();
    const paragraph = store.paragraphs.get(paragraphId);
    
    if (!paragraph) return;

    const processor = new StreamProcessor(store.streamConfig);
    this.processors.set(paragraphId, processor);

    store.updateParagraph(paragraphId, { status: 'streaming' });

    let accumulated = '';

    await processor.processStream(
      paragraph.originalText,
      // onChunk
      (chunk) => {
        accumulated += chunk;
        store.updateParagraph(paragraphId, {
          transformedText: accumulated,
          streamProgress: Math.min((accumulated.length / paragraph.originalText.length) * 100, 99),
        });
      },
      // onComplete
      () => {
        store.updateParagraph(paragraphId, {
          status: 'complete',
          streamProgress: 100,
          transformedText: accumulated,
        });
        
        // Remove from queue
        const { processingQueue } = useEditorStore.getState();
        const updated = processingQueue.filter(id => id !== paragraphId);
        useEditorStore.setState({ processingQueue: updated });
        
        this.processors.delete(paragraphId);
      },
      // onError
      (error) => {
        console.error(`Error processing paragraph ${paragraphId}:`, error);
        store.updateParagraph(paragraphId, {
          status: 'error',
          transformedText: paragraph.originalText, // Fallback to original
        });
        
        // Remove from queue
        const { processingQueue } = useEditorStore.getState();
        const updated = processingQueue.filter(id => id !== paragraphId);
        useEditorStore.setState({ processingQueue: updated });
        
        this.processors.delete(paragraphId);
      }
    );
  }

  abortParagraph(paragraphId: string): void {
    const processor = this.processors.get(paragraphId);
    if (processor) {
      processor.abort();
      this.processors.delete(paragraphId);
    }
  }

  abortAll(): void {
    this.processors.forEach(processor => processor.abort());
    this.processors.clear();
  }
}
```

---

### Phase 4: Character Wave Animation (60 minutes)

#### 4.1 Wave Animator Component (`src/components/WaveAnimator.tsx`)

```typescript
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaveAnimatorProps {
  sourceText: string;
  targetText: string;
  progress: number; // 0-100
  isComplete: boolean;
}

export const WaveAnimator: React.FC<WaveAnimatorProps> = ({
  sourceText,
  targetText,
  progress,
  isComplete,
}) => {
  const [displayText, setDisplayText] = useState(sourceText);
  const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isComplete) {
      setDisplayText(targetText);
      return;
    }

    // Calculate which characters should be transforming based on progress
    const targetLength = targetText.length;
    const charactersToShow = Math.floor((progress / 100) * targetLength);

    // Create wave effect: transform characters progressively
    const newAnimating = new Set<number>();
    const waveWidth = 5; // Number of characters animating simultaneously

    for (let i = Math.max(0, charactersToShow - waveWidth); i < charactersToShow; i++) {
      newAnimating.add(i);
    }

    setAnimatingIndices(newAnimating);

    // Update display text up to current progress
    setDisplayText(targetText.slice(0, charactersToShow) + sourceText.slice(charactersToShow));
  }, [progress, targetText, sourceText, isComplete]);

  return (
    <div className="relative font-mono text-sm leading-relaxed">
      <AnimatePresence mode="popLayout">
        {displayText.split('').map((char, index) => {
          const isAnimating = animatingIndices.has(index);
          const sourceChar = sourceText[index] || '';
          const targetChar = targetText[index] || '';

          return (
            <motion.span
              key={`${index}-${char}`}
              initial={isAnimating ? { 
                opacity: 0.5, 
                y: -10,
                color: '#3b82f6' // blue-500
              } : {}}
              animate={isAnimating ? { 
                opacity: 1, 
                y: 0,
                color: '#10b981' // green-500
              } : {
                opacity: 1,
                y: 0,
                color: isComplete ? '#10b981' : '#6b7280' // green-500 : gray-500
              }}
              transition={{ 
                duration: 0.3,
                ease: 'easeOut'
              }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
```

#### 4.2 Paragraph Display Component (`src/components/ParagraphDisplay.tsx`)

```typescript
import React from 'react';
import { Paragraph } from '../types';
import { WaveAnimator } from './WaveAnimator';

interface ParagraphDisplayProps {
  paragraph: Paragraph;
}

export const ParagraphDisplay: React.FC<ParagraphDisplayProps> = ({ paragraph }) => {
  const getStatusColor = () => {
    switch (paragraph.status) {
      case 'pending': return 'bg-gray-100 border-gray-300';
      case 'processing': return 'bg-blue-50 border-blue-300';
      case 'streaming': return 'bg-blue-100 border-blue-400';
      case 'complete': return 'bg-green-50 border-green-300';
      case 'error': return 'bg-red-50 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className={`mb-4 p-4 rounded-lg border-2 transition-colors ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600 uppercase">
          {paragraph.status}
        </span>
        {paragraph.status === 'streaming' && (
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${paragraph.streamProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">
              {Math.round(paragraph.streamProgress)}%
            </span>
          </div>
        )}
      </div>

      {paragraph.status === 'pending' || paragraph.status === 'processing' ? (
        <div className="text-gray-700">{paragraph.originalText}</div>
      ) : (
        <WaveAnimator
          sourceText={paragraph.originalText}
          targetText={paragraph.transformedText || paragraph.originalText}
          progress={paragraph.streamProgress}
          isComplete={paragraph.status === 'complete'}
        />
      )}
    </div>
  );
};
```

---

### Phase 5: Main Editor Component (45 minutes)

#### 5.1 Text Editor (`src/components/TextEditor.tsx`)

```typescript
import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { ParagraphDisplay } from './ParagraphDisplay';
import { QueueManager } from '../services/queueManager';

const queueManager = new QueueManager();

export const TextEditor: React.FC = () => {
  const { 
    rawText, 
    updateRawText, 
    detectParagraphs, 
    paragraphs 
  } = useEditorStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Start queue processing
    queueManager.startProcessing();

    return () => {
      queueManager.abortAll();
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    updateRawText(newText);

    // Debounce paragraph detection
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      detectParagraphs();
      queueManager.startProcessing();
    }, 500);
  };

  const sortedParagraphs = Array.from(paragraphs.values()).sort(
    (a, b) => a.startIndex - b.startIndex
  );

  return (
    <div className="h-screen flex">
      {/* Left Panel: Input */}
      <div className="w-1/2 border-r border-gray-300 flex flex-col">
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold">
          Your Writing
        </div>
        <textarea
          ref={textareaRef}
          value={rawText}
          onChange={handleTextChange}
          placeholder="Start typing... Use double enters (↵↵) to complete a paragraph and trigger AI enhancement."
          className="flex-1 p-4 resize-none font-mono text-sm focus:outline-none"
          autoFocus
        />
        <div className="bg-gray-100 px-4 py-2 text-xs text-gray-600 border-t">
          Tip: Complete paragraphs with double line breaks
        </div>
      </div>

      {/* Right Panel: Transformed Output */}
      <div className="w-1/2 flex flex-col bg-gray-50">
        <div className="bg-blue-600 text-white px-4 py-2 font-semibold flex items-center justify-between">
          <span>AI-Enhanced Output</span>
          <span className="text-xs bg-blue-500 px-2 py-1 rounded">
            {paragraphs.size} paragraphs
          </span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {sortedParagraphs.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <p className="text-lg">No paragraphs yet</p>
              <p className="text-sm mt-2">Start typing and use ↵↵ to complete paragraphs</p>
            </div>
          ) : (
            sortedParagraphs.map(paragraph => (
              <ParagraphDisplay key={paragraph.id} paragraph={paragraph} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
```

---

### Phase 6: Configuration UI (30 minutes)

#### 6.1 Settings Modal (`src/components/SettingsModal.tsx`)

```typescript
import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { StreamConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { streamConfig, setStreamConfig } = useEditorStore();
  const [config, setConfig] = useState<StreamConfig>(streamConfig);

  if (!isOpen) return null;

  const handleSave = () => {
    setStreamConfig(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="sk-or-..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from{' '}
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                openrouter.ai
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
              <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
              <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Prompt
            </label>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Define how the AI should transform your text..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature ({config.temperature})
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                value={config.maxTokens}
                onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="100"
                max="4000"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### Phase 7: App Assembly (15 minutes)

#### 7.1 Main App (`src/App.tsx`)

```typescript
import React, { useState } from 'react';
import { TextEditor } from './components/TextEditor';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">⚡ Cascade-Edit</div>
          <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">MVP</div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors text-sm font-medium"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Editor */}
      <TextEditor />

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default App;
```

---

## Testing & Running

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Windows Desktop Packaging (Optional)
```bash
npm install -D @tauri-apps/cli
npm install @tauri-apps/api
```

Then follow Tauri documentation for desktop app creation.

---

## Key Implementation Notes

### 1. **Paragraph Detection Strategy**
- Use `split(/\n\n+/)` for double newline detection
- Debounce detection by 500ms to avoid excessive API calls
- Track paragraph positions via `startIndex` and `endIndex`

### 2. **Streaming Queue Management**
- Limit to 3 concurrent streams to avoid rate limiting
- Use Map-based state for O(1) paragraph lookups
- Implement proper cleanup on component unmount

### 3. **Character Wave Effect**
- Use Framer Motion for smooth animations
- Animate 5 characters simultaneously for wave effect
- Transition colors: gray → blue → green
- Use `AnimatePresence` for enter/exit transitions

### 4. **Performance Optimization**
- Use `useRef` for textarea to avoid re-renders
- Debounce text change handlers
- Memoize sorted paragraph arrays
- Use CSS containment for animation performance

### 5. **Error Handling**
- Implement retry logic for failed API calls
- Fallback to original text on error
- Display error status visually
- Log errors for debugging

---

## MVP Feature Checklist

- [x] Real-time text input capture
- [x] Double newline paragraph detection
- [x] Parallel paragraph processing queue
- [x] OpenRouter API streaming integration
- [x] Character-by-character wave animation
- [x] Split-screen editor layout
- [x] Configuration modal
- [x] Status indicators for each paragraph
- [x] Progress bars for streaming
- [x] Graceful error handling

---

## Future Enhancements

1. **Local Storage**: Persist API key and settings
2. **Export Functionality**: Save transformed text to file
3. **Undo/Redo**: Track editing history
4. **Custom Animations**: User-selectable wave styles
5. **Batch Processing**: Process all paragraphs at once
6. **Context Awareness**: Use previous paragraphs as context
7. **Desktop App**: Package with Tauri for native Windows app
8. **Keyboard Shortcuts**: Power user features
9. **Theme Customization**: Dark mode and color schemes
10. **Real-time Collaboration**: Multi-user editing

---

## Development Timeline

- **Phase 1-2**: 1.25 hours (Setup + Data Structures)
- **Phase 3**: 1 hour (API Integration)
- **Phase 4**: 1 hour (Animation)
- **Phase 5**: 0.75 hours (Main Editor)
- **Phase 6**: 0.5 hours (Settings UI)
- **Phase 7**: 0.25 hours (Assembly)

**Total MVP Development Time**: ~5 hours

---

## Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Framer Motion API](https://www.framer.com/motion/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [React + TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**Ready to build?** Start with Phase 1 and work through sequentially. The architecture is designed to be modular, allowing you to test each component independently before integration.
