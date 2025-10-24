# Phase 11: NSL Style Alignment

## Phase Overview

**Goal:** Align Spittoon-Draft styling with NSL ecosystem branding guidelines for visual consistency
**Version:** 1.0.0
**Prerequisites:** App completed and functional  
**Estimated Duration:** 3-4 hours  
**Key Deliverables:**
- NSL dark theme implementation
- Purple/violet primary colors with golden accents
- Complete design system alignment
- All 12 components updated
- NSL-compliant gradients, shadows, and animations

---

## Current State vs Target State

### Current Styling
- ❌ Blue color scheme (blue-600, blue-500)
- ❌ Light background theme
- ❌ Standard Tailwind defaults
- ❌ Simple shadows and effects

### Target NSL Styling
- ✅ Purple/violet primary colors (hsl(263 70% 60%))
- ✅ Golden/amber accents (hsl(38 92% 50%))
- ✅ Dark theme background (hsl(250 24% 10%))
- ✅ Sophisticated gradients and glows
- ✅ Professional NSL appearance

---

## Step 1: Update Tailwind Configuration

**Purpose:** Implement complete NSL color system in Tailwind  
**Duration:** 30 minutes

### Instructions

Replace the entire `tailwind.config.js` with the NSL-compliant configuration:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          glow: "hsl(var(--accent-glow))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        glow: {
          from: {
            boxShadow: "0 0 20px hsl(263 70% 60% / 0.3)",
          },
          to: {
            boxShadow: "0 0 40px hsl(263 80% 70% / 0.5)",
          },
        },
        slideUp: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.5s ease-out",
      },
    },
  },
  plugins: [],
}
```

### Verification
- [ ] Tailwind config updated
- [ ] No build errors
- [ ] Colors now reference CSS variables

---

## Step 2: Update CSS Custom Properties

**Purpose:** Implement full NSL design system in CSS  
**Duration:** 45 minutes

### Instructions

Replace the entire `src/index.css` with NSL design system:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================================================
   NSL Design System - CSS Custom Properties
   ============================================================================ */

@layer base {
  :root {
    /* Background Colors */
    --background: 250 24% 10%;
    --foreground: 250 10% 98%;
    
    /* Card Colors */
    --card: 250 20% 14%;
    --card-foreground: 250 10% 98%;
    
    /* Popover Colors */
    --popover: 250 24% 12%;
    --popover-foreground: 250 10% 98%;
    
    /* Primary Colors - Purple/Violet */
    --primary: 263 70% 60%;
    --primary-foreground: 250 10% 98%;
    --primary-glow: 263 80% 70%;
    
    /* Secondary Colors */
    --secondary: 250 15% 20%;
    --secondary-foreground: 250 10% 98%;
    
    /* Muted Colors */
    --muted: 250 15% 18%;
    --muted-foreground: 250 10% 65%;
    
    /* Accent Colors - Golden/Amber */
    --accent: 38 92% 50%;
    --accent-foreground: 250 24% 10%;
    --accent-glow: 38 100% 60%;
    
    /* Semantic Colors */
    --success: 142 71% 45%;
    --success-foreground: 250 10% 98%;
    
    --destructive: 0 72% 51%;
    --destructive-foreground: 250 10% 98%;
    
    /* Border & Input */
    --border: 250 15% 22%;
    --input: 250 15% 22%;
    --ring: 263 70% 60%;
    
    /* Border Radius */
    --radius: 0.75rem;
    
    /* Gradients */
    --gradient-primary: linear-gradient(135deg, hsl(263 70% 60%) 0%, hsl(263 80% 70%) 100%);
    --gradient-accent: linear-gradient(135deg, hsl(38 92% 50%) 0%, hsl(38 100% 60%) 100%);
    --gradient-subtle: linear-gradient(180deg, hsl(250 20% 14%) 0%, hsl(250 24% 10%) 100%);
    
    /* Shadows */
    --shadow-elegant: 0 10px 40px -10px hsl(263 70% 30% / 0.4);
    --shadow-glow: 0 0 40px hsl(263 80% 70% / 0.3);
    --shadow-accent: 0 4px 20px hsl(38 92% 50% / 0.3);
    
    /* Transitions */
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold tracking-tight;
  }
}

@layer utilities {
  /* Gradient Utilities */
  .gradient-primary {
    background: var(--gradient-primary);
  }
  
  .gradient-accent {
    background: var(--gradient-accent);
  }
  
  .gradient-subtle {
    background: var(--gradient-subtle);
  }
  
  /* Shadow Utilities */
  .shadow-elegant {
    box-shadow: var(--shadow-elegant);
  }
  
  .shadow-glow {
    box-shadow: var(--shadow-glow);
  }

  .shadow-accent {
    box-shadow: var(--shadow-accent);
  }
  
  /* Transition Utilities */
  .transition-smooth {
    transition: var(--transition-smooth);
  }

  /* Animation Utilities */
  .animate-glow {
    animation: glow 2s ease-in-out infinite alternate;
  }

  @keyframes glow {
    from {
      box-shadow: 0 0 20px hsl(263 70% 60% / 0.3);
    }
    to {
      box-shadow: 0 0 40px hsl(263 80% 70% / 0.5);
    }
  }

  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* Custom Scrollbar - NSL Style */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-muted;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--primary) / 0.5);
  @apply rounded;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary) / 0.7);
}

/* Focus Styles - NSL */
*:focus-visible {
  @apply outline-none ring-2 ring-ring ring-offset-2;
  ring-offset-color: hsl(var(--background));
}

/* Selection - NSL */
::selection {
  background: hsl(var(--primary) / 0.3);
  color: hsl(var(--foreground));
}
```

### Verification
- [ ] CSS file updated
- [ ] Dark theme applied
- [ ] Variables accessible
- [ ] Gradients and shadows work

---

## Step 3: Update Color Constants

**Purpose:** Update animation and status colors to match NSL  
**Duration:** 15 minutes

### Instructions

Update `src/constants/index.ts` - find and replace the color constants section:

```typescript
// ============================================================================
// Animation Colors - NSL Palette
// ============================================================================

/** Color for pending/original text - Muted gray-purple */
export const COLOR_PENDING = 'hsl(250 10% 65%)'; // muted-foreground

/** Color for animating characters - Primary purple */
export const COLOR_ANIMATING = 'hsl(263 70% 60%)'; // primary

/** Color for complete/transformed text - Success green */
export const COLOR_COMPLETE = 'hsl(142 71% 45%)'; // success

/** Color for error state - Destructive red */
export const COLOR_ERROR = 'hsl(0 72% 51%)'; // destructive
```

### Verification
- [ ] Constants updated
- [ ] Animation colors reference NSL palette
- [ ] TypeScript compiles

---

## Step 4: Update Editor Header Component

**Purpose:** Apply NSL gradient and styling to header  
**Duration:** 20 minutes

### Instructions

Update `src/components/EditorHeader.tsx` - replace the header element:

```typescript
<header className="gradient-primary px-6 py-3 shadow-glow">
  <div className="flex items-center justify-between">
    {/* Logo and Title */}
    <div className="flex items-center gap-3">
      <h1 className="text-2xl font-bold text-primary-foreground">
        ⚡ {APP_NAME}
      </h1>
      <span className="text-xs bg-accent px-2 py-1 rounded font-semibold text-accent-foreground">
        v1.0.0
      </span>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-3">
      <button
        onClick={() => setSettingsOpen(true)}
        className="px-4 py-2 bg-card hover:bg-card/80 text-card-foreground rounded-md transition-smooth text-sm font-medium flex items-center gap-2 border border-border"
        title="Open Settings"
      >
        <span>⚙️</span>
        <span>Settings</span>
      </button>
    </div>
  </div>
</header>
```

### Verification
- [ ] Header has purple gradient
- [ ] Version badge is golden
- [ ] Settings button styled correctly
- [ ] Glow shadow visible

---

## Step 5: Update Text Editor Panels

**Purpose:** Apply dark theme to editor panels  
**Duration:** 30 minutes

### Instructions

Update `src/components/TextEditor.tsx` - replace the main content section:

```typescript
{/* Main Content - Split Pane */}
<div className="flex-1 flex overflow-hidden">
  {/* Left Panel - Input */}
  <div className="w-1/2 border-r border-border flex flex-col bg-card">
    {/* Input Header */}
    <div className="bg-secondary text-secondary-foreground px-4 py-2 font-semibold flex items-center justify-between border-b border-border">
      <span>Your Writing</span>
      <div className="text-xs text-muted-foreground font-mono">
        {rawText.length} characters
      </div>
    </div>

    {/* Textarea */}
    <textarea
      ref={textareaRef}
      value={rawText}
      onChange={handleTextChange}
      placeholder={EDITOR_PLACEHOLDER}
      className="flex-1 p-4 resize-none font-mono text-sm focus:outline-none bg-card text-foreground placeholder:text-muted-foreground"
      spellCheck={false}
      aria-label="Text input for writing"
    />

    {/* Input Footer */}
    <div className="bg-muted px-4 py-2 text-xs text-muted-foreground border-t border-border flex items-center justify-between">
      <span>💡 Tip: Use double line breaks (↵↵) to complete paragraphs</span>
      <span className="font-mono">{paragraphs.length} paragraphs</span>
    </div>
  </div>

  {/* Right Panel - Output */}
  <div className="w-1/2 flex flex-col bg-background">
    {/* Output Header */}
    <div className="gradient-primary px-4 py-2 font-semibold flex items-center justify-between">
      <span className="text-primary-foreground">AI-Enhanced Output</span>
      <EditorStats />
    </div>

    {/* Output Content */}
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
          className="fixed bottom-4 right-4 px-3 py-2 gradient-accent text-accent-foreground rounded-full shadow-accent hover:opacity-90 transition-smooth text-sm font-medium z-10"
        >
          ↓ Jump to Bottom
        </button>
      )}
      
      {paragraphs.length === 0 ? (
        <EmptyState
          icon="✨"
          title="No paragraphs yet"
          description="Start typing and use ↵↵ to complete paragraphs"
        />
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
```

### Verification
- [ ] Left panel has dark card background
- [ ] Right panel has darker background
- [ ] Headers use NSL colors
- [ ] Borders visible
- [ ] Text readable

---

## Step 6: Update Status Badge Component

**Purpose:** Apply NSL colors to status indicators  
**Duration:** 20 minutes

### Instructions

Update `src/components/StatusBadge.tsx` - replace the getStatusConfig function:

```typescript
const getStatusConfig = () => {
  switch (status) {
    case ParagraphStatus.PENDING:
      return {
        label: 'Pending',
        icon: '○',
        className: 'bg-muted text-muted-foreground',
      };
    case ParagraphStatus.QUEUED:
      return {
        label: 'Queued',
        icon: '⋯',
        className: 'bg-primary/20 text-primary border border-primary/30',
      };
    case ParagraphStatus.PROCESSING:
      return {
        label: 'Processing',
        icon: '◐',
        className: 'bg-primary/30 text-primary-glow animate-pulse border border-primary/40',
      };
    case ParagraphStatus.STREAMING:
      return {
        label: 'Streaming',
        icon: '▶',
        className: 'gradient-primary text-primary-foreground shadow-glow',
      };
    case ParagraphStatus.COMPLETE:
      return {
        label: 'Complete',
        icon: '✓',
        className: 'bg-success/30 text-success border border-success/40',
      };
    case ParagraphStatus.ERROR:
      return {
        label: 'Error',
        icon: '✗',
        className: 'bg-destructive/30 text-destructive border border-destructive/40',
      };
    case ParagraphStatus.CANCELLED:
      return {
        label: 'Cancelled',
        icon: '⊘',
        className: 'bg-muted text-muted-foreground border border-border',
      };
    default:
      return {
        label: 'Unknown',
        icon: '?',
        className: 'bg-muted text-muted-foreground',
      };
  }
};
```

### Verification
- [ ] Pending: muted gray
- [ ] Streaming: purple gradient with glow
- [ ] Complete: green
- [ ] Error: red
- [ ] All readable on dark background

---

## Step 7: Update Paragraph Display Component

**Purpose:** Apply NSL styling to paragraph cards  
**Duration:** 25 minutes

### Instructions

Update `src/components/ParagraphDisplay.tsx` - replace the getStatusColor function:

```typescript
const getStatusColor = () => {
  switch (paragraph.status) {
    case ParagraphStatus.PENDING:
      return 'bg-card border-border';
    case ParagraphStatus.QUEUED:
      return 'bg-card border-primary/30 shadow-sm';
    case ParagraphStatus.PROCESSING:
      return 'bg-card border-primary/40';
    case ParagraphStatus.STREAMING:
      return 'bg-card border-primary shadow-glow';
    case ParagraphStatus.COMPLETE:
      return 'bg-card border-success/40 shadow-elegant';
    case ParagraphStatus.ERROR:
      return 'bg-card border-destructive/40';
    case ParagraphStatus.CANCELLED:
      return 'bg-muted border-border';
    default:
      return 'bg-card border-border';
  }
};
```

Also update the action buttons:

```typescript
{/* Cancel button */}
{paragraph.status === ParagraphStatus.STREAMING && onCancel && (
  <button
    onClick={() => onCancel(paragraph.id)}
    className="text-xs px-2 py-1 text-destructive hover:bg-destructive/10 rounded transition-smooth border border-destructive/30"
    title="Cancel processing"
  >
    ✕ Cancel
  </button>
)}

{/* Retry button */}
{paragraph.status === ParagraphStatus.ERROR && onRetry && (
  <button
    onClick={() => onRetry(paragraph.id)}
    className="text-xs px-2 py-1 text-primary hover:bg-primary/10 rounded transition-smooth border border-primary/30"
    title="Retry processing"
  >
    ↻ Retry
  </button>
)}
```

And error message styling:

```typescript
{paragraph.status === ParagraphStatus.ERROR && paragraph.error && (
  <div className="mt-3 p-2 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
    <div className="font-semibold">Error:</div>
    <div>{paragraph.error.message}</div>
  </div>
)}
```

### Verification
- [ ] Cards have dark background
- [ ] Streaming cards have purple glow
- [ ] Complete cards have elegant shadow
- [ ] Error styling clear
- [ ] Buttons styled correctly

---

## Step 8: Update Progress Bar Component

**Purpose:** Apply purple/amber theme to progress indicators  
**Duration:** 15 minutes

### Instructions

Update `src/components/ProgressBar.tsx` - replace the progress bar div:

```typescript
<div className={`relative ${className}`}>
  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
    <motion.div
      className="h-full gradient-primary rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${clampedProgress}%` }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    />
  </div>
  
  {showLabel && (
    <div className="absolute -right-12 top-0 text-xs text-muted-foreground font-mono">
      {Math.round(clampedProgress)}%
    </div>
  )}
</div>
```

### Verification
- [ ] Progress bar has purple gradient
- [ ] Background is muted
- [ ] Animation smooth
- [ ] Label readable

---

## Step 9: Update Settings Modal

**Purpose:** Apply NSL dark theme to settings modal  
**Duration:** 30 minutes

### Instructions

Update `src/components/SettingsModal.tsx` - replace the modal structure:

```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  className="bg-card rounded-lg shadow-elegant w-full max-w-3xl max-h-[90vh] overflow-hidden border border-border"
  onClick={(e) => e.stopPropagation()}
>
  {/* Modal Header */}
  <div className="gradient-primary px-6 py-4">
    <h2 className="text-2xl font-bold text-primary-foreground">Settings</h2>
    <p className="text-sm text-primary-foreground/80 mt-1">
      Configure API access and model parameters
    </p>
  </div>

  {/* Modal Body */}
  <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-card">
    {/* Error Display */}
    {errors.length > 0 && (
      <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-md">
        <div className="font-semibold text-destructive mb-2">
          Please fix the following errors:
        </div>
        <ul className="list-disc list-inside text-sm text-destructive/90 space-y-1">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    )}
    
    {/* Settings content... */}
  </div>

  {/* Modal Footer */}
  <div className="bg-muted px-6 py-4 flex items-center justify-between border-t border-border">
    <button
      onClick={handleCancel}
      className="px-4 py-2 text-foreground hover:bg-secondary rounded-md transition-smooth"
    >
      Cancel
    </button>
    
    <div className="flex items-center gap-3">
      {hasChanges && (
        <span className="text-sm text-muted-foreground">
          Unsaved changes
        </span>
      )}
      <button
        onClick={handleSave}
        className="px-6 py-2 gradient-primary text-primary-foreground hover:opacity-90 rounded-md transition-smooth font-medium shadow-glow"
      >
        Save Settings
      </button>
    </div>
  </div>
</motion.div>
```

Update form inputs styling:

```typescript
// Text inputs
className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-ring transition-smooth"

// Textareas
className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring transition-smooth resize-none"

// Select dropdowns
className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring transition-smooth"

// Range sliders
className="w-full accent-primary"
```

### Verification
- [ ] Modal has dark background
- [ ] Header has purple gradient
- [ ] Inputs have dark styling
- [ ] Save button has gradient
- [ ] All text readable

---

## Step 10: Update Editor Stats Component

**Purpose:** Update statistics display colors  
**Duration:** 15 minutes

### Instructions

Update `src/components/EditorStats.tsx` - replace color classes:

```typescript
<div className="flex items-center gap-4 text-xs">
  {/* Active Processing */}
  <div className="flex items-center gap-1">
    <span className="font-mono font-semibold text-primary-foreground">
      {queueStats.activeCount}/{queueStats.maxConcurrent}
    </span>
    <span className="text-primary-foreground/70">active</span>
  </div>

  {/* Queue Length */}
  {queueStats.queueLength > 0 && (
    <div className="flex items-center gap-1">
      <span className="font-mono font-semibold text-primary-foreground">
        {queueStats.queueLength}
      </span>
      <span className="text-primary-foreground/70">queued</span>
    </div>
  )}

  {/* Completed */}
  <div className="flex items-center gap-1">
    <span className="text-success">✓</span>
    <span className="font-mono font-semibold text-primary-foreground">
      {statusCounts.complete}
    </span>
  </div>

  {/* Errors */}
  {statusCounts.error > 0 && (
    <div className="flex items-center gap-1">
      <span className="text-destructive">✗</span>
      <span className="font-mono font-semibold text-primary-foreground">
        {statusCounts.error}
      </span>
    </div>
  )}
</div>
```

### Verification
- [ ] Stats readable on gradient header
- [ ] Success icon green
- [ ] Error icon red
- [ ] Numbers clearly visible

---

## Step 11: Update Empty State Component

**Purpose:** Style empty state for dark theme  
**Duration:** 10 minutes

### Instructions

Update `src/components/EmptyState.tsx`:

```typescript
<div className="text-center py-16">
  <div className="text-6xl mb-4">{icon}</div>
  <p className="text-lg font-medium text-foreground">{title}</p>
  {description && (
    <p className="text-sm mt-2 text-muted-foreground">{description}</p>
  )}
  {action && (
    <button
      onClick={action.onClick}
      className="mt-6 px-4 py-2 gradient-primary text-primary-foreground rounded-md hover:opacity-90 transition-smooth shadow-glow"
    >
      {action.label}
    </button>
  )}
</div>
```

### Verification
- [ ] Text visible on dark background
- [ ] Icon prominent
- [ ] Button has gradient

---

## Step 12: Update Toast Notifications

**Purpose:** Apply NSL colors to toast messages  
**Duration:** 15 minutes

### Instructions

Update `src/components/Toast.tsx` - replace getToastStyles function:

```typescript
const getToastStyles = (type: ToastMessage['type']) => {
  switch (type) {
    case 'success':
      return 'bg-success text-success-foreground shadow-elegant';
    case 'error':
      return 'bg-destructive text-destructive-foreground shadow-elegant';
    case 'warning':
      return 'bg-accent text-accent-foreground shadow-accent';
    case 'info':
      return 'gradient-primary text-primary-foreground shadow-glow';
  }
};
```

### Verification
- [ ] Success: green with success foreground
- [ ] Error: red with destructive foreground
- [ ] Warning: amber/golden
- [ ] Info: purple gradient

---

## Visual Testing Checklist

After completing all steps, verify the following:

### Overall Theme
- [ ] Dark background throughout (hsl(250 24% 10%))
- [ ] Purple primary colors visible
- [ ] Golden accents present
- [ ] Text clearly readable
- [ ] Proper contrast ratios

### Components
- [ ] Header: purple gradient with glow
- [ ] Editor panels: dark theme
- [ ] Paragraph cards: elegant shadows
- [ ] Status badges: correct colors
- [ ] Progress bars: purple gradient
- [ ] Settings modal: dark with gradient header
- [ ] Buttons: proper styling
