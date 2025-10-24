# Phase 5: Character Wave Animation System

## Phase Overview

**Goal:** Implement smooth character-by-character transformation animations with wave effects using Framer Motion  
**Prerequisites:** Phase 3 & 4 completed (state management and API integration)  
**Estimated Duration:** 4-5 hours  
**Key Deliverables:**
- WaveAnimator component with Framer Motion
- Character-level animation logic
- Color transition system
- Wave progression calculation
- ParagraphDisplay wrapper component
- Performance-optimized animations
- Animation configuration controls

---

## Step-by-Step Implementation

### Step 1: Create Base Animation Components

**Purpose:** Build foundational animation component structure  
**Duration:** 45 minutes

#### Instructions

1. Create `src/components/animations/AnimatedCharacter.tsx`:

```typescript
/**
 * AnimatedCharacter - Single character with transition animation
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  COLOR_PENDING,
  COLOR_ANIMATING,
  COLOR_COMPLETE,
  ANIMATION_DURATION,
} from '../../constants';

export interface AnimatedCharacterProps {
  /** The character to display */
  char: string;
  /** Character index in the text */
  index: number;
  /** Whether this character is currently animating */
  isAnimating: boolean;
  /** Whether the transformation is complete */
  isComplete: boolean;
  /** Animation delay based on position */
  delay: number;
}

export const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({
  char,
  index,
  isAnimating,
  isComplete,
  delay,
}) => {
  // Determine the color based on state
  const getColor = () => {
    if (isComplete) return COLOR_COMPLETE;
    if (isAnimating) return COLOR_ANIMATING;
    return COLOR_PENDING;
  };

  // Handle spaces - use non-breaking space for proper layout
  const displayChar = char === ' ' ? '\u00A0' : char;

  return (
    <motion.span
      key={`char-${index}`}
      className="inline-block"
      initial={false}
      animate={{
        color: getColor(),
        y: isAnimating ? [-8, 0] : 0,
        scale: isAnimating ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: ANIMATION_DURATION,
        delay: delay,
        ease: 'easeOut',
      }}
      style={{
        display: 'inline-block',
        whiteSpace: 'pre',
      }}
    >
      {displayChar}
    </motion.span>
  );
};
```

2. Create animation utilities in `src/utils/animationHelpers.ts`:

```typescript
/**
 * Animation calculation utilities
 */

import {
  CharacterTransition,
  WaveState,
} from '../types';
import {
  WAVE_WIDTH,
  CHARACTER_DELAY,
} from '../constants';

/**
 * Calculate which characters should be animating based on wave position
 */
export const getAnimatingIndices = (
  wavePosition: number,
  waveWidth: number = WAVE_WIDTH
): Set<number> => {
  const indices = new Set<number>();
  
  const startIndex = Math.max(0, wavePosition - waveWidth);
  const endIndex = wavePosition;
  
  for (let i = startIndex; i < endIndex; i++) {
    indices.add(i);
  }
  
  return indices;
};

/**
 * Calculate delay for a character based on its position in the wave
 */
export const calculateCharacterDelay = (
  characterIndex: number,
  wavePosition: number
): number => {
  const distanceFromWave = wavePosition - characterIndex;
  
  if (distanceFromWave <= 0) {
    return 0;
  }
  
  return Math.max(0, (WAVE_WIDTH - distanceFromWave) * CHARACTER_DELAY);
};

/**
 * Determine if a character should be visible based on progress
 */
export const shouldCharacterBeVisible = (
  index: number,
  progress: number,
  totalLength: number
): boolean => {
  const progressIndex = Math.floor((progress / 100) * totalLength);
  return index < progressIndex;
};

/**
 * Calculate wave progress based on text length and stream progress
 */
export const calculateWaveProgress = (
  streamProgress: number,
  textLength: number
): number => {
  return Math.floor((streamProgress / 100) * textLength);
};

/**
 * Create character array from text with proper handling
 */
export const textToCharacterArray = (text: string): string[] => {
  // Handle special characters and emojis properly
  return Array.from(text);
};

/**
 * Interpolate between source and target text
 */
export const interpolateText = (
  sourceText: string,
  targetText: string,
  progress: number
): string => {
  const charactersToShow = Math.floor((progress / 100) * targetText.length);
  return targetText.slice(0, charactersToShow) + sourceText.slice(charactersToShow);
};
```

#### Verification
- [ ] AnimatedCharacter component created
- [ ] Animation utilities created
- [ ] Framer Motion animations work
- [ ] Character delays calculated correctly

---

### Step 2: Build Wave Animator Component

**Purpose:** Create the main component that orchestrates character animations  
**Duration:** 60 minutes

#### Instructions

Create `src/components/animations/WaveAnimator.tsx`:

```typescript
/**
 * WaveAnimator - Orchestrates character-by-character wave animation
 */

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AnimatedCharacter } from './AnimatedCharacter';
import {
  getAnimatingIndices,
  calculateCharacterDelay,
  textToCharacterArray,
  calculateWaveProgress,
} from '../../utils/animationHelpers';
import { WaveState } from '../../types';

export interface WaveAnimatorProps {
  /** Original source text */
  sourceText: string;
  /** Target transformed text */
  targetText: string;
  /** Stream progress (0-100) */
  progress: number;
  /** Whether transformation is complete */
  isComplete: boolean;
  /** Wave state configuration */
  waveState?: WaveState;
  /** Custom class name */
  className?: string;
}

export const WaveAnimator: React.FC<WaveAnimatorProps> = ({
  sourceText,
  targetText,
  progress,
  isComplete,
  waveState,
  className = '',
}) => {
  // Current display text
  const [displayText, setDisplayText] = useState(sourceText);
  
  // Calculate wave position based on progress
  const wavePosition = useMemo(() => {
    if (isComplete) return targetText.length;
    return calculateWaveProgress(progress, targetText.length);
  }, [progress, targetText.length, isComplete]);

  // Get indices of characters currently animating
  const animatingIndices = useMemo(() => {
    if (isComplete) return new Set<number>();
    return getAnimatingIndices(wavePosition, waveState?.width);
  }, [wavePosition, waveState?.width, isComplete]);

  // Update display text based on progress
  useEffect(() => {
    if (isComplete) {
      setDisplayText(targetText);
      return;
    }

    // Show transformed text up to wave position, original text after
    const newText = 
      targetText.slice(0, wavePosition) + 
      sourceText.slice(wavePosition);
    
    setDisplayText(newText);
  }, [wavePosition, sourceText, targetText, isComplete]);

  // Convert text to character array
  const characters = useMemo(() => {
    return textToCharacterArray(displayText);
  }, [displayText]);

  return (
    <div 
      className={`font-mono text-sm leading-relaxed ${className}`}
      style={{ wordBreak: 'break-word' }}
    >
      <AnimatePresence mode="popLayout">
        {characters.map((char, index) => {
          const isAnimating = animatingIndices.has(index);
          const delay = calculateCharacterDelay(index, wavePosition);
          
          return (
            <AnimatedCharacter
              key={`${index}-${char}-${isComplete}`}
              char={char}
              index={index}
              isAnimating={isAnimating}
              isComplete={isComplete && index < targetText.length}
              delay={delay}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(WaveAnimator);
```

#### Verification
- [ ] WaveAnimator component created
- [ ] Wave effect visible
- [ ] Character transitions smooth
- [ ] Performance acceptable (60fps)

---

### Step 3: Create Paragraph Display Component

**Purpose:** Wrapper component that combines paragraph data with animation  
**Duration:** 45 minutes

#### Instructions

Create `src/components/ParagraphDisplay.tsx`:

```typescript
/**
 * ParagraphDisplay - Displays a paragraph with status and animation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Paragraph, ParagraphStatus } from '../types';
import WaveAnimator from './animations/WaveAnimator';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

export interface ParagraphDisplayProps {
  paragraph: Paragraph;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const ParagraphDisplay: React.FC<ParagraphDisplayProps> = ({
  paragraph,
  onRetry,
  onCancel,
}) => {
  // Determine background color based on status
  const getStatusColor = () => {
    switch (paragraph.status) {
      case ParagraphStatus.PENDING:
        return 'bg-gray-50 border-gray-200';
      case ParagraphStatus.QUEUED:
        return 'bg-blue-50 border-blue-200';
      case ParagraphStatus.PROCESSING:
        return 'bg-blue-100 border-blue-300';
      case ParagraphStatus.STREAMING:
        return 'bg-blue-100 border-blue-400 shadow-sm';
      case ParagraphStatus.COMPLETE:
        return 'bg-green-50 border-green-300';
      case ParagraphStatus.ERROR:
        return 'bg-red-50 border-red-300';
      case ParagraphStatus.CANCELLED:
        return 'bg-gray-100 border-gray-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  // Show loading animation for pending/processing states
  const showLoadingAnimation =
    paragraph.status === ParagraphStatus.PROCESSING ||
    paragraph.status === ParagraphStatus.QUEUED;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mb-4 p-4 rounded-lg border-2 transition-all duration-300 ${getStatusColor()}`}
    >
      {/* Header with status and actions */}
      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={paragraph.status} />
        
        <div className="flex items-center gap-2">
          {/* Progress indicator for streaming */}
          {paragraph.status === ParagraphStatus.STREAMING && (
            <div className="flex items-center gap-2">
              <ProgressBar progress={paragraph.progress.percentage} />
              <span className="text-xs text-gray-600 font-mono">
                {Math.round(paragraph.progress.percentage)}%
              </span>
            </div>
          )}

          {/* Action buttons */}
          {paragraph.status === ParagraphStatus.STREAMING && onCancel && (
            <button
              onClick={() => onCancel(paragraph.id)}
              className="text-xs px-2 py-1 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Cancel processing"
            >
              ✕ Cancel
            </button>
          )}

          {paragraph.status === ParagraphStatus.ERROR && onRetry && (
            <button
              onClick={() => onRetry(paragraph.id)}
              className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Retry processing"
            >
              ↻ Retry
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="relative">
        {/* Loading animation overlay */}
        {showLoadingAnimation && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-20 rounded animate-pulse" />
        )}

        {/* Text display */}
        {paragraph.status === ParagraphStatus.PENDING ||
        paragraph.status === ParagraphStatus.QUEUED ||
        paragraph.status === ParagraphStatus.PROCESSING ? (
          // Show original text for non-streaming states
          <div className="text-gray-700 font-mono text-sm leading-relaxed">
            {paragraph.originalText}
          </div>
        ) : (
          // Show animated text for streaming/complete states
          <WaveAnimator
            sourceText={paragraph.originalText}
            targetText={paragraph.transformedText || paragraph.originalText}
            progress={paragraph.progress.percentage}
            isComplete={paragraph.status === ParagraphStatus.COMPLETE}
            waveState={paragraph.waveState}
          />
        )}
      </div>

      {/* Error message */}
      {paragraph.status === ParagraphStatus.ERROR && paragraph.error && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
          <div className="font-semibold">Error:</div>
          <div>{paragraph.error.message}</div>
        </div>
      )}

      {/* Processing time info */}
      {paragraph.status === ParagraphStatus.COMPLETE &&
        paragraph.processingStartedAt &&
        paragraph.completedAt && (
          <div className="mt-2 text-xs text-gray-500">
            Processed in{' '}
            {((paragraph.completedAt - paragraph.processingStartedAt) / 1000).toFixed(1)}s
          </div>
        )}
    </motion.div>
  );
};
```

#### Verification
- [ ] ParagraphDisplay renders correctly
- [ ] Status colors work
- [ ] Action buttons functional
- [ ] Error messages display

---

### Step 4: Create Supporting UI Components

**Purpose:** Build status badge and progress bar components  
**Duration:** 30 minutes

#### Instructions

1. Create `src/components/StatusBadge.tsx`:

```typescript
/**
 * StatusBadge - Display paragraph status with icon
 */

import React from 'react';
import { ParagraphStatus } from '../types';

export interface StatusBadgeProps {
  status: ParagraphStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case ParagraphStatus.PENDING:
        return {
          label: 'Pending',
          icon: '○',
          className: 'bg-gray-200 text-gray-700',
        };
      case ParagraphStatus.QUEUED:
        return {
          label: 'Queued',
          icon: '⋯',
          className: 'bg-blue-200 text-blue-700',
        };
      case ParagraphStatus.PROCESSING:
        return {
          label: 'Processing',
          icon: '◐',
          className: 'bg-blue-300 text-blue-800 animate-pulse',
        };
      case ParagraphStatus.STREAMING:
        return {
          label: 'Streaming',
          icon: '▶',
          className: 'bg-blue-400 text-blue-900',
        };
      case ParagraphStatus.COMPLETE:
        return {
          label: 'Complete',
          icon: '✓',
          className: 'bg-green-300 text-green-800',
        };
      case ParagraphStatus.ERROR:
        return {
          label: 'Error',
          icon: '✗',
          className: 'bg-red-300 text-red-800',
        };
      case ParagraphStatus.CANCELLED:
        return {
          label: 'Cancelled',
          icon: '⊘',
          className: 'bg-gray-300 text-gray-700',
        };
      default:
        return {
          label: 'Unknown',
          icon: '?',
          className: 'bg-gray-200 text-gray-600',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold uppercase ${config.className}`}
    >
      <span className="text-sm">{config.icon}</span>
      {config.label}
    </span>
  );
};
```

2. Create `src/components/ProgressBar.tsx`:

```typescript
/**
 * ProgressBar - Animated progress indicator
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showLabel = false,
}) => {
  // Clamp progress to 0-100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`relative ${className}`}>
      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      
      {showLabel && (
        <div className="absolute -right-12 top-0 text-xs text-gray-600 font-mono">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
};
```

#### Verification
- [ ] StatusBadge renders correctly
- [ ] ProgressBar animates smoothly
- [ ] Icons display properly
- [ ] Colors match design

---

### Step 5: Optimize Animation Performance

**Purpose:** Ensure animations run at 60fps and don't cause jank  
**Duration:** 45 minutes

#### Instructions

1. Create `src/hooks/useAnimationFrame.ts`:

```typescript
/**
 * Custom hook for animation frame optimization
 */

import { useEffect, useRef } from 'react';

export const useAnimationFrame = (callback: (deltaTime: number) => void) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callback]);
};
```

2. Create performance monitoring utility in `src/utils/performanceMonitor.ts`:

```typescript
/**
 * Performance monitoring for animations
 */

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private fpsHistory: number[] = [];
  private maxHistoryLength = 60;

  /**
   * Update FPS calculation
   */
  update(): void {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.fpsHistory.push(this.fps);
      
      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift();
      }

      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Get average FPS
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  /**
   * Check if performance is good (>50 FPS)
   */
  isPerformanceGood(): boolean {
    return this.getAverageFPS() > 50;
  }

  /**
   * Reset monitoring
   */
  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.fpsHistory = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

3. Add performance optimization to WaveAnimator:

```typescript
// Add to WaveAnimator.tsx

import { useMemo, useCallback } from 'react';

// Memoize expensive calculations
const MemoizedWaveAnimator: React.FC<WaveAnimatorProps> = (props) => {
  const {
    sourceText,
    targetText,
    progress,
    isComplete,
    waveState,
    className,
  } = props;

  // Memoize character array to prevent recalculation
  const characters = useMemo(() => {
    return textToCharacterArray(displayText);
  }, [displayText]);

  // Memoize animating indices
  const animatingIndices = useMemo(() => {
    if (isComplete) return new Set<number>();
    return getAnimatingIndices(wavePosition, waveState?.width);
  }, [wavePosition, waveState?.width, isComplete]);

  // Use callback for performance
  const shouldAnimate = useCallback(
    (index: number) => animatingIndices.has(index),
    [animatingIndices]
  );

  // ... rest of component
};

export default React.memo(MemoizedWaveAnimator, (prevProps, nextProps) => {
  // Custom comparison for memoization
  return (
    prevProps.sourceText === nextProps.sourceText &&
    prevProps.targetText === nextProps.targetText &&
    prevProps.progress === nextProps.progress &&
    prevProps.isComplete === nextProps.isComplete &&
    prevProps.waveState?.position === nextProps.waveState?.position
  );
});
```

#### Verification
- [ ] FPS stays above 50
- [ ] No visible jank during animation
- [ ] Memory usage stable
- [ ] CPU usage reasonable

---

### Step 6: Add Animation Controls

**Purpose:** Allow users to customize animation behavior  
**Duration:** 30 minutes

#### Instructions

Create `src/components/AnimationControls.tsx`:

```typescript
/**
 * AnimationControls - Settings for animation behavior
 */

import React from 'react';
import { useEditorStore } from '../store/editorStore';

export const AnimationControls: React.FC = () => {
  const [animationSpeed, setAnimationSpeed] = React.useState(1);
  const [waveWidth, setWaveWidth] = React.useState(5);
  const [animationEnabled, setAnimationEnabled] = React.useState(true);

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <h3 className="font-semibold text-gray-800">Animation Settings</h3>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">Enable Animations</label>
        <input
          type="checkbox"
          checked={animationEnabled}
          onChange={(e) => setAnimationEnabled(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
      </div>

      {/* Speed Control */}
      <div>
        <label className="text-sm text-gray-700 block mb-1">
          Animation Speed: {animationSpeed.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
          className="w-full"
          disabled={!animationEnabled}
        />
      </div>

      {/* Wave Width */}
      <div>
        <label className="text-sm text-gray-700 block mb-1">
          Wave Width: {waveWidth} characters
        </label>
        <input
          type="range"
          min="3"
          max="10"
          step="1"
          value={waveWidth}
          onChange={(e) => setWaveWidth(parseInt(e.target.value))}
          className="w-full"
          disabled={!animationEnabled}
        />
      </div>
    </div>
  );
};
```

#### Verification
- [ ] Controls render correctly
- [ ] Settings update animation
- [ ] Disable option works
- [ ] Speed adjustment visible

---

## Testing Procedures

### Visual Testing Checklist

1. **Character Wave Effect:**
   - [ ] Wave moves smoothly from left to right
   - [ ] 5 characters animate simultaneously
   - [ ] Colors transition: gray → blue → green
   - [ ] No visual glitches

2. **Performance Testing:**
   - [ ] Open Chrome DevTools Performance tab
   - [ ] Record while animation plays
   - [ ] Verify FPS stays above 50
   - [ ] Check for long tasks (>50ms)

3. **Edge Cases:**
   - [ ] Very long paragraphs (1000+ chars)
   - [ ] Special characters and emojis
   - [ ] Rapid progress updates
   - [ ] Multiple paragraphs animating

### Automated Tests

Create `src/components/__tests__/WaveAnimator.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WaveAnimator from '../animations/WaveAnimator';

describe('WaveAnimator', () => {
  it('should render source text initially', () => {
    render(
      <WaveAnimator
        sourceText="Hello"
        targetText="World"
        progress={0}
        isComplete={false}
      />
    );
    
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
  });

  it('should show target text when complete', () => {
    render(
      <WaveAnimator
        sourceText="Hello"
        targetText="World"
        progress={100}
        isComplete={true}
      />
    );
    
    expect(screen.getByText(/World/)).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Common Issues

#### Issue: Animation stuttering/jank
**Solution:**
- Use Chrome DevTools Performance profiler
- Check for excessive re-renders
- Verify React.memo is working
- Reduce wave width if needed
- Use will-change CSS property

#### Issue: Characters not animating
**Solution:**
- Check wave position calculation
- Verify animatingIndices Set
- Check Framer Motion import
- Verify character delays

#### Issue: Color transitions not smooth
**Solution:**
- Check CSS color values
- Verify Framer Motion transition config
- Check for conflicting styles
- Use hex colors instead of named

#### Issue: Performance degradation with many paragraphs
**Solution:**
- Implement virtualization
- Limit concurrent animations
- Use IntersectionObserver
- Optimize re-render logic

---

## Phase Completion Checklist

- [ ] **Animation components**
  - [ ] AnimatedCharacter created
  - [ ] WaveAnimator complete
  - [ ] ParagraphDisplay wrapper works
  - [ ] Supporting components created

- [ ] **Animation logic**
  - [ ] Wave progression works
  - [ ] Character delays correct
  - [ ] Color transitions smooth
  - [ ] Text interpolation works

- [ ] **Performance**
  - [ ] FPS above 50
  - [ ] No memory leaks
  - [ ] React.memo optimizations
  - [ ] Smooth on multiple paragraphs

- [ ] **Polish**
  - [ ] Animation controls added
  - [ ] Status indicators work
  - [ ] Progress bars smooth
  - [ ] Error states handled

- [ ] **Testing**
  - [ ] Visual testing complete
  - [ ] Edge cases tested
  - [ ] Performance profiled
  - [ ] Unit tests pass

---

## Next Steps

1. **Commit your work:**
   ```bash
   git add src/components src/hooks src/utils
   git commit -m "feat: complete Phase 5 - character wave animation"
   git push
   ```

2. **Proceed to Phase 6:**
   - Open `Phase6.md`
   - Build main editor component
   - Integrate animations with editor

---

**Phase Status:** ✅ Ready for Implementation  
**Next Phase:** Phase 6 - Editor Component & UI Layout
