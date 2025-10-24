# ⚡ Spittoon-Draft

**Real-time AI-powered writing enhancement with streaming transformations**

> Part of the NSL (Narrative Spittoon Language) ecosystem - powerful, low-cost tools for narrative generation and enhancement.

Spittoon-Draft is an innovative writing tool that combines human creativity with AI enhancement in real-time. Write naturally in one panel while AI-powered transformations appear character-by-character in another panel, creating a unique collaborative writing experience with mesmerizing wave animations.

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

- 🎯 **Real-time Processing** - Continue writing while AI enhances previous paragraphs
- 🌊 **Wave Animation** - Smooth character-by-character transformation visualization
- 🎨 **Customizable AI** - Choose models, adjust parameters, customize prompts
- ⚡ **Concurrent Streams** - Process up to 3 paragraphs simultaneously
- 💾 **Auto-Save** - Settings persist across sessions
- ⌨️ **Keyboard Shortcuts** - Power user features for efficiency
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

## 📖 How to Use Spittoon-Draft

### Basic Workflow

#### 1. Start Writing

Type your content in the **left editor panel**. Focus on getting your ideas down without worrying about polish:

```
The detective walked into the office. It was late. 
She looked at the files on her desk.


The phone rang.
```

#### 2. Trigger AI Enhancement

Complete a paragraph by pressing **Enter twice** (creating a double line break). This signals that the paragraph is ready for enhancement:

```
The detective walked into the office. It was late. 
She looked at the files on her desk.
[PRESS ENTER]
[PRESS ENTER] ← This triggers processing
```

#### 3. Watch the Transformation

The enhanced text appears in the **right panel** with a beautiful wave animation:

```
Detective Sarah Chen stepped through the frosted glass door, 
the click of her heels echoing in the empty office. The amber 
glow of street lights filtered through venetian blinds, casting 
long shadows across the mountain of case files sprawled across 
her mahogany desk - each one a story left unfinished, a voice 
crying out for justice in the darkness.
```

#### 4. Continue Writing

While the AI processes your first paragraph, continue writing the next one. The queue system handles up to 3 paragraphs simultaneously.

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

1. **Keep Paragraphs Focused** - Single-topic paragraphs transform better than multi-topic ones
2. **Use Descriptive Language** - Give the AI context about tone, setting, and emotion
3. **Monitor the Queue** - Watch the status lights to pace your writing
4. **Experiment with Prompts** - Different system prompts yield different enhancement styles
5. **Save Your Work** - Copy transformed text regularly (export feature coming soon)
6. **Adjust Temperature** - Lower for consistency, higher for creative variation

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/⌘ + ,` | Open Settings |
| `Ctrl/⌘ + K` | Clear Queue |
| `Ctrl/⌘ + Shift + R` | Reset All Data |
| `Esc` | Close Modal |
| `?` | Show Keyboard Shortcuts |

### Understanding the Interface

#### Status Indicators

- **Yellow badge** - Paragraph in queue, waiting to process
- **Blue badge + animation** - Currently processing with AI
- **Green badge** - Transformation complete

#### Progress Information

- **Bytes/sec** - Streaming speed from API
- **ETA** - Estimated time to completion
- **Character count** - Real-time character tracking

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

1. **Type** your content in the left editor panel
2. **Complete paragraphs** with double line breaks (Enter twice)
3. **Auto-detection** identifies completed paragraphs
4. **Queue system** manages up to 3 concurrent transformations
5. **Streaming API** sends requests to OpenRouter
6. **Wave animation** displays character-by-character enhancement
7. **Enhanced text** appears in the right panel with smooth transitions

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
