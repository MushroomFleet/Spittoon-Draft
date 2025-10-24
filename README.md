# ⚡ Spittoon-Draft

**Real-time AI-powered writing enhancement with streaming transformations**

> Part of the NSL (Narrative Spittoon Language) ecosystem - powerful, low-cost tools for narrative generation and enhancement.

Spittoon-Draft is an innovative writing tool that combines human creativity with AI enhancement in real-time. Select any text and watch as AI transforms it inline, or use split-view mode to see original and enhanced text side-by-side. With support for NSL narrative buckets, multiple view modes, and character-by-character streaming, Spittoon-Draft creates a unique collaborative writing experience.

![Version](https://img.shields.io/badge/version-1.5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-19.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![NSL](https://img.shields.io/badge/NSL-1.1-purple)

## 🌟 Part of the NSL Ecosystem

Spittoon-Draft is one of three powerful tools in the NSL ecosystem:

- **[Spittoon-Scribe.oragenai.com](https://spittoon-scribe.oragenai.com/)** - Narrative bucket management and story generation
- **[Spittoon-UNO.oragenai.com](https://spittoon-uno.oragenai.com/)** - Unified narrative operator, with semantic echo
- **[Spittoon-Draft](https://github.com/MushroomFleet/Spittoon-Draft)** (this tool) - Real-time AI text enhancement with streaming

All tools are built on the **[NSL 1.1 Specification](docs/ref/NSL-1.1-specification.md)**, [a production-ready XML-based format](https://github.com/MushroomFleet/NSL-narrative-spittoon-language) for narrative generation projects. Model performance across these tools is validated through the **[NSL-Benchmark](https://github.com/MushroomFleet/Remembering-NSL-benchmark)**, where various AI models are tested for quality, speed, and cost-effectiveness.

### 💡 Recommended Setup

For optimal results with low costs, we recommend **Grok 4 Fast** at the time of publishing. According to NSL-Benchmark testing, Grok 4 Fast delivers:
- Excellent writing quality
- Fast streaming response times
- Competitive pricing
- Reliable performance across narrative tasks

Other compatible models include Claude 3.5 Sonnet, GPT-4 Turbo, and any OpenRouter-supported model.

## ✨ Features

- ✍️ **Single View Mode** - Select text and enhance inline with `Ctrl+E` (main workflow)
- 📊 **Split View Mode** - Side-by-side editing with real-time paragraph enhancement
- 📦 **Bucket Manager** - Import and manage NSL narrative buckets for context
- 🌊 **Wave Animation** - Smooth character-by-character transformation visualization
- 🎨 **Customizable AI** - Choose models, adjust parameters, customize prompts
- ⚡ **Concurrent Streams** - Process up to 3 paragraphs simultaneously
- 💾 **Auto-Save** - Settings persist across sessions
- ⌨️ **Keyboard Shortcuts** - Power user features for efficiency (`Ctrl+E` to enhance)
- 🎭 **Multiple Models** - Access to all OpenRouter AI models
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔗 **NSL Integration** - Import narrative buckets for context-aware transformations

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **OpenRouter API key** - [Get one free here](https://openrouter.ai/keys)
- *Optional*: NSL narrative bucket files for enhanced context

### Installation

```bash
# Clone the repository
git clone https://github.com/MushroomFleet/Spittoon-Draft
cd Spittoon-Draft

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

### First-Time Setup

#### Step 1: Configure Your API Key

1. Click the **Settings icon (⚙️)** in the top-right corner
2. Enter your **OpenRouter API key** in the API Key field
3. Toggle the visibility icon to verify your key is entered correctly

#### Step 2: Choose Your AI Model

1. In the Settings modal, locate the **Model Selection** dropdown
2. For best results, select **"x-ai/grok-4-fast"** (Grok 4 Fast)
3. Alternative options:
   - `anthropic/claude-3.5-sonnet` - High quality, slower
   - `openai/gpt-4-turbo` - Excellent quality, higher cost
   - `google/gemini-2.0-flash-exp:free` - Free tier option

#### Step 3: Customize Your Enhancement Prompt (Optional)

1. In the **System Prompt** section, choose a preset or write custom instructions:
   - UNO and a selection of present
   - custom to enter your own

2. Or write your own custom prompt:
   ```
   Transform the text to be engaging and narrative-driven, 
   with vivid descriptions and compelling character moments.
   ```

#### Step 4: Adjust Parameters (Optional)

- **Temperature** (0.0-2.0): Controls creativity
  - Lower (0.3-0.7): More focused and consistent
  - Higher (1.0-1.5): More creative and varied
  - Default: 0.7 (recommended for most use cases)

- **Max Tokens** (100-4000): Controls output length
  - Default: 2000 (handles most paragraph lengths)

- **Concurrent Streams** (1-3): Number of simultaneous transformations
  - Default: 3 (optimal for most systems)

#### Step 5: Save Settings

Click **"Save Settings"** at the bottom of the modal. Your configuration is automatically saved and will persist across sessions.

## 📖 View Modes

Spittoon-Draft offers three powerful view modes, each optimized for different workflows:

### 🎯 Single View Mode (Primary)

The **main workflow** for most users. Perfect for focused inline enhancement.

- **How it works**: Select any text in the editor and press `Ctrl+E` to enhance it inline
- **Best for**: Iterative editing, polishing specific sections, maintaining flow
- **Key features**:
  - Text selection replaces with enhanced version
  - Real-time processing highlights
  - Simple, distraction-free interface
  - Enhancement style selector at the top

### 📊 Split View Mode

Side-by-side editing with paragraph-based enhancement.

- **How it works**: Type in the left panel, press `Ctrl+E` to detect and enhance all complete paragraphs
- **Best for**: First drafts, comparing original vs enhanced text, batch processing
- **Key features**:
  - Original text in left panel
  - Enhanced output in right panel
  - Up to 3 concurrent paragraph transformations
  - Wave animation for each character

### 📦 Bucket View Mode

Import and manage NSL narrative buckets for context-aware enhancement.

- **How it works**: Import NSL files to provide narrative context (characters, world, story framework)
- **Best for**: Long-form narrative projects, maintaining consistency, character-driven stories
- **Key features**:
  - View and edit imported bucket files
  - Organized by category (framework, world, character, document)
  - Context automatically included in enhancements
  - Required vs optional file indicators

**Switching Views**: Use the view mode selector in the header to switch between modes at any time.

---

## 📖 How to Use Spittoon-Draft

### Single View Workflow (Recommended)

The primary way to use Spittoon-Draft for most writing tasks.

#### 1. Start Writing

Type your content naturally in the editor:

```
The detective walked into the office. It was late.
She looked at the files on her desk. The phone rang.
```

#### 2. Select Text to Enhance

Highlight any portion of text you want to improve - a sentence, paragraph, or multiple paragraphs:

```
[SELECT TEXT]
The detective walked into the office. It was late.
She looked at the files on her desk.
```

#### 3. Press Ctrl+E

Press **`Ctrl+E`** (or click the **Enhance** button) to start the transformation. Watch the processing highlight:

```
[PROCESSING...]
The detective walked into the office. It was late.
She looked at the files on her desk.
```

#### 4. See the Enhancement

The selected text is replaced inline with the enhanced version:

```
Detective Sarah Chen stepped through the frosted glass door,
the click of her heels echoing in the empty office. The amber
glow of street lights filtered through venetian blinds, casting
long shadows across the case files on her mahogany desk.
```

#### 5. Keep Writing

Continue writing, select more text, and enhance as you go. Multiple enhancements can process simultaneously.

---

### Split View Workflow

Alternative workflow for comparing original and enhanced text side-by-side.

#### 1. Switch to Split View

Use the view mode selector in the header to switch to Split View mode.

#### 2. Type in Left Panel

Write your content in the left editor panel:

```
The detective walked into the office. It was late.
She looked at the files on her desk.
```

#### 3. Press Ctrl+E to Detect Paragraphs

Press **`Ctrl+E`** to detect and queue all complete paragraphs for enhancement. Paragraphs must be separated by blank lines.

#### 4. Watch the Transformation

Enhanced text streams into the right panel with wave animation. The queue system processes up to 3 paragraphs simultaneously.

---

### Bucket View Workflow

For narrative projects requiring consistent context.

#### 1. Import NSL Bucket

Click the **Import** button and select an NSL (`.nm3` or `.xml`) file containing your narrative context.

#### 2. Browse Bucket Contents

View imported files organized by category:
- **Framework**: Story structure, themes, rules
- **World**: Settings, locations, lore
- **Character**: Character profiles, relationships
- **Document**: Plot outlines, scene lists

#### 3. Edit as Needed

Click any file to view or edit its contents. Changes are saved automatically.

#### 4. Switch to Enhancement

Return to Single or Split view to write. The bucket context is automatically included in all enhancement requests for better consistency.

### Advanced Usage Examples

#### Example 1: Story Writing

**Input:**
```
Tom was scared. He heard a noise upstairs. 
He didn't know what to do.


He slowly walked to the stairs.
```

**Enhanced Output (with "Add Creativity" preset):**
```
Fear clutched at Tom's chest like icy fingers as the sound 
echoed from above—a slow, deliberate creaking that sent shivers 
racing down his spine. His mind raced through possibilities, 
each more terrifying than the last. Should he run? Call for help? 
His body froze, caught between instinct and indecision.

With trembling legs and a heart hammering against his ribs, 
Tom forced himself toward the staircase. Each step felt like 
an eternity, the darkness above seeming to grow deeper, more 
menacing with every breath.
```

#### Example 2: Technical Writing Enhancement

**Input:**
```
The API returns data in JSON format. You need to parse it.
Use the fetch method to get the data.


Error handling is important.
```

**Enhanced Output (with "Professional Tone" preset):**
```
The API endpoint delivers responses in JSON format, requiring 
proper parsing for data extraction. Implement the fetch() method 
to retrieve data asynchronously, ensuring your application handles 
the Promise-based response appropriately.

Robust error handling is critical for production applications. 
Implement try-catch blocks and validate response status codes 
to gracefully handle network failures, timeout scenarios, and 
invalid data structures.
```

#### Example 3: Blog Post Creation

**Input:**
```
Morning routines are important. They help you start the day right.
Many successful people have morning routines.


You should try creating one.
```

**Enhanced Output (with "Enhance Clarity" preset):**
```
Establishing a consistent morning routine is a cornerstone of 
productivity and well-being. These structured beginnings set a 
positive tone for the entire day, creating momentum that carries 
through your most challenging tasks. Research shows that 
high-achievers across industries—from CEOs to athletes—credit 
their morning rituals as fundamental to their success.

Creating your own morning routine doesn't require dramatic 
lifestyle changes. Start small: identify three meaningful 
activities that energize and focus you, then commit to them 
daily. Whether it's meditation, exercise, journaling, or simply 
enjoying coffee in silence, the key is consistency and intention.
```

### Pro Tips

**For Single View Mode:**
1. **Select Strategically** - Enhance sentences, paragraphs, or entire sections based on your needs
2. **Iterate Gradually** - Enhance one section, review, then move to the next for better control
3. **Use Processing Highlights** - Watch the visual feedback to track active enhancements
4. **Try Different Selections** - Experiment with enhancing different amounts of text

**For Split View Mode:**
5. **Separate Paragraphs** - Use blank lines to separate paragraphs for proper detection with `Ctrl+E`
6. **Monitor the Queue** - Watch status lights (yellow/blue/green) to pace your writing
7. **Keep Writing** - Continue writing while previous paragraphs process (up to 3 concurrent)

**For All Modes:**
8. **Experiment with Prompts** - Different enhancement styles yield different results (UNO, Creative, Professional, etc.)
9. **Import Buckets** - Use NSL buckets for consistent character voices and world-building
10. **Adjust Temperature** - Lower (0.3-0.7) for consistency, higher (1.0-1.5) for creative variation
11. **Use Descriptive Language** - Give the AI context about tone, setting, and emotion in your draft
12. **Save Your Work** - Copy enhanced text regularly (export feature coming soon)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/⌘ + E` | Enhance (selected text in Single View, paragraphs in Split View) |
| `Ctrl/⌘ + ,` | Open Settings |
| `Ctrl/⌘ + K` | Clear Queue |
| `Ctrl/⌘ + Shift + R` | Reset All Data |
| `Esc` | Close Modal |
| `?` | Show Keyboard Shortcuts |

### Understanding the Interface

#### Single View Mode Interface

- **Enhancement Style Selector** - Choose from preset prompts (UNO, Creative, Professional, etc.) or use custom
- **Character Count** - Shows total document length in the header
- **Selection Count** - Displays number of characters selected when text is highlighted
- **Processing Highlights** - Visual overlay shows which text is currently being enhanced
- **Enhance Button** - Bottom-right button to trigger enhancement (or use `Ctrl+E`)
- **Active Enhancements** - Counter shows how many enhancements are currently processing

#### Split View Mode Interface

- **Status Lights** - Colored indicators in header showing worker status
- **Status Badges** (on paragraphs):
  - **Yellow badge** - Paragraph in queue, waiting to process
  - **Blue badge + animation** - Currently processing with AI
  - **Green badge** - Transformation complete
- **Progress Information**:
  - **Bytes/sec** - Streaming speed from API
  - **ETA** - Estimated time to completion
  - **Character count** - Real-time character tracking for each panel

#### Bucket View Mode Interface

- **Category Sections** - Files organized by Framework, World, Character, Document
- **File Cards** - Click any card to view/edit file contents
- **Required Badge** - Indicates which files are marked as required in the NSL bucket
- **Word/Character Counts** - Stats shown on each file card
- **Edit Mode** - Modal with syntax highlighting for viewing and editing files

## 🔧 Development

```bash
# Development
npm run dev              # Start dev server (localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check for issues
npm run lint:fix         # Auto-fix issues
npm run format           # Format code with Prettier
npm run type-check       # Verify TypeScript types

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Generate coverage report
npm run test:ui          # Visual test interface
```

## 🏗️ Built With

- **[React 19](https://react.dev)** - Modern UI framework
- **[TypeScript 5.9](https://www.typescriptlang.org)** - Type-safe development
- **[Vite 7](https://vitejs.dev)** - Lightning-fast build tool
- **[Zustand 5](https://docs.pmnd.rs/zustand)** - Lightweight state management
- **[Framer Motion 12](https://www.framer.com/motion/)** - Smooth animations
- **[Tailwind CSS 3.4](https://tailwindcss.com)** - Utility-first styling
- **[OpenRouter](https://openrouter.ai)** - Unified AI API access

## 📁 Project Structure

```
spittoon-draft/
├── src/
│   ├── components/        # React components
│   │   ├── animations/    # Animation system
│   │   ├── TextEditor.tsx # Main editor
│   │   └── SettingsModal.tsx
│   ├── services/          # Business logic
│   │   ├── streamProcessor.ts
│   │   ├── queueManager.ts
│   │   └── nslParser.ts   # NSL bucket support
│   ├── store/             # State management
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Helper functions
│   └── hooks/             # Custom React hooks
├── docs/                  # Documentation
│   └── ref/              # Reference materials
│       └── NSL-1.1-specification.md
└── public/               # Static assets
```

## 🎯 How It Works

### Single View Mode
1. **Write** your content in the editor
2. **Select** the text you want to enhance
3. **Press Ctrl+E** (or click Enhance button)
4. **Processing highlight** shows the enhancement in progress
5. **Streaming API** sends request to OpenRouter with your chosen model
6. **Character-by-character** replacement updates text inline
7. **Continue** writing and enhancing iteratively

### Split View Mode
1. **Type** your content in the left editor panel
2. **Press Ctrl+E** to detect complete paragraphs (separated by blank lines)
3. **Queue system** manages up to 3 concurrent transformations
4. **Streaming API** sends requests to OpenRouter
5. **Wave animation** displays character-by-character enhancement
6. **Enhanced text** appears in the right panel with smooth transitions
7. **Continue writing** while previous paragraphs process

### Bucket View Mode
1. **Import** NSL bucket file (`.nm3` or `.xml`)
2. **Browse** organized files by category
3. **Edit** any file as needed
4. **Context** automatically included in all enhancements
5. **Switch** back to Single or Split view to write

## 📚 Documentation

- **[NSL 1.1 Specification](docs/ref/NSL-1.1-specification.md)** - Narrative bucket format
- **[Development Guide](docs/DEVELOPMENT.md)** - Architecture and development
- **[NSL Branding Guide](docs/ref/nsl-app-branding-guidance.md)** - Design system
- **[Phase Documents](docs/)** - Implementation phases

## 🧪 Testing

Comprehensive test suite with Vitest and Testing Library:

```bash
npm run test              # Watch mode
npm run test:ui           # Visual test interface
npm run test:coverage     # Coverage report
```

**Test Status:** 9/9 tests passing ✅

## 🤝 Contributing

Contributions to the Spittoon-Draft project are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for development guidelines.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenRouter** for unified AI API access
- **Anthropic, OpenAI, Meta, Google** for AI models
- **NSL Community** for narrative generation innovation
- **Open Source Community** for amazing tools and libraries

---

## 📚 Citation

### Academic Citation

If you use this codebase in your research or project, please cite:

```bibtex
@software{spittoon_draft,
  title = {Spittoon-Draft: Real-time AI-powered Writing Enhancement with Streaming},
  author = {Drift Johnson},
  year = {2025},
  url = {https://github.com/MushroomFleet/Spittoon-Draft},
  version = {1.5.0}
}
```

### Donate:

[![Ko-Fi](https://cdn.ko-fi.com/cdn/kofi3.png?v=3)](https://ko-fi.com/driftjohnson)

---

**Made with ❤️ for the NSL Ecosystem**

*Spittoon-Draft v1.5.0 - Transforming writing, one character at a time*
