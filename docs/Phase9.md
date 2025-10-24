# Phase 9: Testing & Quality Assurance

## Phase Overview

**Goal:** Comprehensive testing and bug fixing to ensure production readiness  
**Prerequisites:** Phase 8 completed (integration)  
**Estimated Duration:** 4-6 hours  
**Key Deliverables:**
- Complete test suite (unit, integration, E2E)
- Bug fixes and improvements
- Performance profiling
- Cross-browser testing
- Documentation of known issues
- Test coverage report

---

## Step 1: Set Up Testing Framework

**Purpose:** Configure Vitest for testing  
**Duration:** 30 minutes

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Create `vite.config.ts` test configuration:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
  // ... rest of config
});
```

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;
```

---

## Step 2: Write Unit Tests

**Purpose:** Test individual functions and utilities  
**Duration:** 90 minutes

### Test Paragraph Detection

Create `src/utils/__tests__/paragraphDetector.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  detectParagraphsFromText,
  hasCompletedParagraphs,
  getParagraphCount,
} from '../paragraphDetector';

describe('paragraphDetector', () => {
  describe('hasCompletedParagraphs', () => {
    it('should detect double newlines', () => {
      expect(hasCompletedParagraphs('Hello\n\nWorld')).toBe(true);
      expect(hasCompletedParagraphs('Hello\nWorld')).toBe(false);
      expect(hasCompletedParagraphs('Hello World')).toBe(false);
    });
  });

  describe('getParagraphCount', () => {
    it('should count paragraphs correctly', () => {
      expect(getParagraphCount('Hello\n\nWorld')).toBe(2);
      expect(getParagraphCount('One\n\nTwo\n\nThree')).toBe(3);
      expect(getParagraphCount('')).toBe(0);
    });

    it('should ignore short paragraphs', () => {
      const text = 'Hi\n\nThis is a longer paragraph\n\nOk';
      const count = getParagraphCount(text);
      expect(count).toBe(1); // Only middle paragraph is long enough
    });
  });

  describe('detectParagraphsFromText', () => {
    it('should detect new paragraphs', () => {
      const text = 'First paragraph here\n\nSecond paragraph there';
      const existing = new Map();
      
      const detected = detectParagraphsFromText(text, existing);
      
      expect(detected).toHaveLength(2);
      expect(detected[0].originalText).toBe('First paragraph here');
      expect(detected[1].originalText).toBe('Second paragraph there');
    });

    it('should not detect duplicates', () => {
      const text = 'Same paragraph\n\nSame paragraph';
      const existing = new Map();
      
      const first = detectParagraphsFromText(text, existing);
      existing.set(first[0].id, first[0]);
      
      const second = detectParagraphsFromText(text, existing);
      
      expect(second).toHaveLength(1); // Only one new paragraph
    });
  });
});
```

### Test Animation Helpers

Create `src/utils/__tests__/animationHelpers.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  getAnimatingIndices,
  calculateCharacterDelay,
  shouldCharacterBeVisible,
} from '../animationHelpers';

describe('animationHelpers', () => {
  describe('getAnimatingIndices', () => {
    it('should return correct wave indices', () => {
      const indices = getAnimatingIndices(10, 5);
      
      expect(indices.has(5)).toBe(true);
      expect(indices.has(9)).toBe(true);
      expect(indices.has(10)).toBe(false);
      expect(indices.size).toBe(5);
    });
  });

  describe('calculateCharacterDelay', () => {
    it('should calculate delays correctly', () => {
      expect(calculateCharacterDelay(5, 10)).toBeGreaterThan(0);
      expect(calculateCharacterDelay(10, 10)).toBe(0);
      expect(calculateCharacterDelay(11, 10)).toBe(0);
    });
  });

  describe('shouldCharacterBeVisible', () => {
    it('should determine visibility correctly', () => {
      expect(shouldCharacterBeVisible(5, 50, 20)).toBe(true);
      expect(shouldCharacterBeVisible(15, 50, 20)).toBe(false);
    });
  });
});
```

### Test Validation

Create `src/utils/__tests__/validation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  validateParagraphText,
  validateApiKey,
  validateStreamConfig,
} from '../validation';
import { createDefaultStreamConfig } from '../../types/factories';

describe('validation', () => {
  describe('validateParagraphText', () => {
    it('should accept valid text', () => {
      const result = validateParagraphText('This is a valid paragraph');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject too short text', () => {
      const result = validateParagraphText('Short');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject empty text', () => {
      const result = validateParagraphText('   ');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateApiKey', () => {
    it('should accept valid API key', () => {
      const result = validateApiKey('sk-or-v1-1234567890abcdef');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid format', () => {
      const result = validateApiKey('invalid-key');
      expect(result.isValid).toBe(false);
    });

    it('should reject empty key', () => {
      const result = validateApiKey('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateStreamConfig', () => {
    it('should accept valid config', () => {
      const config = createDefaultStreamConfig('sk-or-v1-validkey123');
      const result = validateStreamConfig(config);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid parameters', () => {
      const config = createDefaultStreamConfig('sk-or-v1-validkey123');
      config.parameters.temperature = 5; // Invalid
      
      const result = validateStreamConfig(config);
      expect(result.isValid).toBe(false);
    });
  });
});
```

---

## Step 3: Write Component Tests

**Purpose:** Test React components  
**Duration:** 90 minutes

### Test ParagraphDisplay

Create `src/components/__tests__/ParagraphDisplay.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParagraphDisplay } from '../ParagraphDisplay';
import { createParagraph } from '../../types/factories';
import { ParagraphStatus } from '../../types';

describe('ParagraphDisplay', () => {
  it('should render paragraph text', () => {
    const paragraph = createParagraph({
      id: 'test-1',
      originalText: 'Test paragraph',
      position: { startIndex: 0, endIndex: 14, startLine: 1, endLine: 1 },
    });

    render(<ParagraphDisplay paragraph={paragraph} />);
    
    expect(screen.getByText('Test paragraph')).toBeInTheDocument();
  });

  it('should show status badge', () => {
    const paragraph = createParagraph({
      id: 'test-1',
      originalText: 'Test',
      position: { startIndex: 0, endIndex: 4, startLine: 1, endLine: 1 },
    });
    paragraph.status = ParagraphStatus.STREAMING;

    render(<ParagraphDisplay paragraph={paragraph} />);
    
    expect(screen.getByText('STREAMING')).toBeInTheDocument();
  });

  it('should show progress bar when streaming', () => {
    const paragraph = createParagraph({
      id: 'test-1',
      originalText: 'Test',
      position: { startIndex: 0, endIndex: 4, startLine: 1, endLine: 1 },
    });
    paragraph.status = ParagraphStatus.STREAMING;
    paragraph.progress.percentage = 50;

    render(<ParagraphDisplay paragraph={paragraph} />);
    
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should call onRetry when retry button clicked', () => {
    const onRetry = vi.fn();
    const paragraph = createParagraph({
      id: 'test-1',
      originalText: 'Test',
      position: { startIndex: 0, endIndex: 4, startLine: 1, endLine: 1 },
    });
    paragraph.status = ParagraphStatus.ERROR;

    render(<ParagraphDisplay paragraph={paragraph} onRetry={onRetry} />);
    
    const retryButton = screen.getByText(/retry/i);
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledWith('test-1');
  });
});
```

### Test StatusBadge

Create `src/components/__tests__/StatusBadge.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';
import { ParagraphStatus } from '../../types';

describe('StatusBadge', () => {
  it('should render pending status', () => {
    render(<StatusBadge status={ParagraphStatus.PENDING} />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('should render complete status with checkmark', () => {
    render(<StatusBadge status={ParagraphStatus.COMPLETE} />);
    expect(screen.getByText('COMPLETE')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should render error status', () => {
    render(<StatusBadge status={ParagraphStatus.ERROR} />);
    expect(screen.getByText('ERROR')).toBeInTheDocument();
  });
});
```

---

## Step 4: Write Integration Tests

**Purpose:** Test component interactions  
**Duration:** 60 minutes

Create `src/test/integration/editor.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TextEditor } from '../../components/TextEditor';
import { useEditorStore } from '../../store/editorStore';

describe('Editor Integration', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it('should detect paragraphs on double newline', async () => {
    render(<TextEditor />);
    
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, {
      target: { value: 'First paragraph\n\nSecond paragraph' },
    });

    // Wait for debounce
    await waitFor(
      () => {
        const paragraphs = useEditorStore.getState().paragraphs;
        expect(paragraphs.size).toBeGreaterThan(0);
      },
      { timeout: 1000 }
    );
  });

  it('should update character count', () => {
    render(<TextEditor />);
    
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, {
      target: { value: 'Hello' },
    });

    expect(screen.getByText(/5 characters/i)).toBeInTheDocument();
  });

  it('should show empty state when no paragraphs', () => {
    render(<TextEditor />);
    
    expect(screen.getByText(/no paragraphs yet/i)).toBeInTheDocument();
  });
});
```

---

## Step 5: Performance Testing

**Purpose:** Profile and optimize performance  
**Duration:** 60 minutes

### Memory Leak Detection

```typescript
// Create src/test/performance/memory.test.ts
describe('Memory Leaks', () => {
  it('should not leak memory with many paragraphs', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize;
    
    // Create and destroy many paragraphs
    for (let i = 0; i < 100; i++) {
      const store = useEditorStore.getState();
      store.addParagraph(createParagraph({
        id: `test-${i}`,
        originalText: 'Test paragraph',
        position: { startIndex: 0, endIndex: 14, startLine: 1, endLine: 1 },
      }));
    }
    
    useEditorStore.getState().reset();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize;
    const memoryGrowth = finalMemory - initialMemory;
    
    // Memory growth should be reasonable (<10MB)
    expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
  });
});
```

### Animation Performance

```typescript
// Create src/test/performance/animation.test.ts
import { performanceMonitor } from '../../utils/performanceMonitor';

describe('Animation Performance', () => {
  it('should maintain 50+ FPS during animation', async () => {
    performanceMonitor.reset();
    
    // Simulate animations
    for (let i = 0; i < 100; i++) {
      performanceMonitor.update();
      await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
    }
    
    const avgFps = performanceMonitor.getAverageFPS();
    expect(avgFps).toBeGreaterThan(50);
  });
});
```

---

## Step 6: Cross-Browser Testing

**Purpose:** Ensure compatibility across browsers  
**Duration:** 60 minutes

### Manual Testing Checklist

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

For each browser, verify:
- [ ] UI renders correctly
- [ ] Animations smooth
- [ ] API calls work
- [ ] LocalStorage works
- [ ] No console errors
- [ ] Performance acceptable

### Browser-Specific Issues

Common issues to watch for:

1. **Safari:**
   - Flexbox behavior differences
   - LocalStorage in private mode
   - Animation performance

2. **Firefox:**
   - Input autofill styling
   - Scrollbar styling
   - Font rendering

3. **Mobile:**
   - Touch targets size
   - Viewport height (100vh)
   - Soft keyboard behavior

---

## Step 7: Bug Fixing

**Purpose:** Fix identified issues  
**Duration:** Variable

### Bug Tracking

Create `docs/KNOWN_ISSUES.md`:

```markdown
# Known Issues

## High Priority
- [ ] Issue #1: Description
- [ ] Issue #2: Description

## Medium Priority
- [ ] Issue #3: Description

## Low Priority / Nice to Have
- [ ] Issue #4: Description

## Won't Fix
- Issue #5: Description (reason)
```

### Common Bugs and Fixes

1. **Race condition in queue**
   - Add proper locking mechanism
   - Use atomic operations

2. **Memory leak in animations**
   - Clean up event listeners
   - Cancel animation frames

3. **LocalStorage quota exceeded**
   - Add try-catch
   - Implement data pruning

---

## Step 8: Generate Test Coverage Report

**Purpose:** Measure test coverage  
**Duration:** 15 minutes

```bash
npm run test -- --coverage
```

Target coverage:
- [ ] Overall: >80%
- [ ] Store: >90%
- [ ] Utils: >90%
- [ ] Components: >70%
- [ ] Services: >85%

---

## Testing Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

---

## Phase Completion Checklist

- [ ] Testing framework set up
- [ ] Unit tests written (>50 tests)
- [ ] Component tests written
- [ ] Integration tests written
- [ ] Performance profiled
- [ ] Cross-browser tested
- [ ] Bugs documented
- [ ] Critical bugs fixed
- [ ] Coverage report generated
- [ ] Test documentation complete

---

## Next Steps

**Commit your work:**
```bash
git add .
git commit -m "feat: complete Phase 9 - testing and QA"
git push
```

**Proceed to Phase 10:** Deployment & Documentation

---

**Phase Status:** ✅ Ready for Implementation  
**Next Phase:** Phase 10 - Deployment & Documentation
