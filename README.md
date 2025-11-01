# 🧠 D-Level AI Analyzer - Chrome Extension

**Submission for the Google Chrome Built-in AI Challenge 2025** 🚀  
*Category: Best hybrid AI application*

A Chrome extension that acts as a "digital nutrition label" for YouTube videos, measuring their perceptual energy and potential impact on our nervous system.

## 💡 The Story Behind This Project

As a parent and an animation creator, I wanted to understand the difference between a calm, poetic story and a fast-paced, stimulating video. I realized we lack a simple tool to measure this "energy." So, I built one using Google's powerful new AI.

This project is my submission for the Google Chrome Built-in AI Challenge 2025 in the "Best hybrid AI application" category. It's an MVP born from a real need, with a vision to create a universal compass for digital well-being.

## 🎯 What is D-Level?

The **D-Level** (Dopamine Level) is a perceptual score (0-100) that measures how video content affects attention, emotion, and cognitive processing. It's not about "good" or "bad" content—it's about understanding the experience so children can follow meaning, not just chase stimulus.

## ✨ Features

### 🤖 Hybrid AI Architecture
- **Client-Side AI (Gemini Nano)**: Fast, private "Promise Analysis" that examines video metadata locally
- **Server-Side AI (Gemini 2.5 Pro)**: Deep multimodal video analysis with extended thinking

### 📊 Comprehensive Analysis
- **D-Level Score (0-100)**: Overall stimulation measurement
- **5 Perceptual Layers**: Sensory, Affective, Cognitive, Rhythmic, Functional
- **5 Dopamine Types**: Reflective, Creative, Affective, Sensory, Chaotic
- **20+ Metrics**: Shot length, BPM, color saturation, emotional coherence, and more

### 🎨 Modern UI
- Dark mode with warm yellow-orange gradient accents
- Responsive side panel for analysis
- Interactive D3.js visualizations
- Analysis history with local caching

### 🧒 Platform Support
- YouTube.com
- YouTubeKids.com (with kid-friendly UI)

## 🚀 Installation

### For Users

1. Download **D-Level-AI-Analyzer-v1.0.0.zip** from [Releases](https://github.com/acwo/dopamine-level-checker-chrome-extension/releases)
2. **Extract the ZIP file** to a folder on your computer
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable **"Developer mode"** (toggle in top-right corner)
5. Click **"Load unpacked"**
6. Select the **EXTRACTED FOLDER** (the folder containing manifest.json and INSTALL.txt)
7. Get your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
8. Click the extension icon in Chrome toolbar and enter your API key in the settings
9. Navigate to any YouTube video and click **"Run D-Level Analysis"** button

### For Developers

```bash
# Clone the repository
git clone git@github.com:acwo/dopamine-level-checker-chrome-extension.git
cd dopamine-level-checker-chrome-extension

# Install dependencies
npm install

# Build the extension
npm run build

# Or watch for changes during development
npm run watch
```

## 🛠️ Requirements

- **Chrome 138+** (for Gemini Nano support)
- **At least 22 GB free disk space** (for Gemini Nano model download)
- **Gemini API Key** (free tier available at [Google AI Studio](https://aistudio.google.com/app/apikey))

## 📖 How to Use

1. Navigate to any YouTube or YouTube Kids video
2. Click the **"Run D-Level Analysis"** button that appears below the video
3. The side panel opens with two analysis options:

### Promise Analysis (Gemini Nano - Local)
- Analyzes video metadata (title, description, channel)
- Runs instantly on your device
- Completely private
- Shows what the content "promises"

### Full Video Analysis (Gemini 2.5 Pro - Cloud)
- Deep multimodal analysis of actual video content
- Analyzes visual, audio, pacing, emotions, and cognitive depth
- Provides detailed D-Level score with justification
- Results cached for future viewing

## 🏗️ Project Structure

```
chrome-extension/
├── src/
│   ├── background/       # Service worker (API communication)
│   ├── content/          # Content script (YouTube integration)
│   ├── popup/            # Extension popup UI
│   │   ├── components/   # React components
│   │   │   ├── charts/   # D3.js visualizations
│   │   │   └── ui/       # UI components
│   │   ├── index.tsx     # Main popup entry
│   │   └── sidepanel.js  # Side panel logic
│   └── types/            # TypeScript definitions
├── public/
│   ├── icons/            # Extension icons
│   ├── prompt.txt        # D-Level Checker system prompt
│   └── sidepanel.html    # Side panel HTML
├── manifest.json         # Chrome extension manifest
├── package.json          # Dependencies
├── webpack.config.js     # Build configuration
└── tsconfig.json         # TypeScript configuration
```

## 🧪 Technologies Used

- **TypeScript** - Type-safe development
- **React** - UI components
- **D3.js** - Data visualizations
- **Tailwind CSS** - Modern styling
- **Webpack** - Module bundling
- **Chrome APIs** - Extension functionality
- **Gemini Nano** - Local AI analysis
- **Gemini 2.5 Pro** - Cloud AI analysis

## 🌟 The D-Level System Prompt

The heart of this project is the **"Dopamine Level Checker"** (v0.94-beta) - a carefully engineered system prompt that instructs Gemini 2.5 Pro to:

1. Operate as both a **Technician** (objective analyst) and **Translator-Empath** (developmental psychologist)
2. Use **E-Prime language** to avoid subjective judgments
3. Analyze across **5 perceptual layers** (Sensory, Affective, Cognitive, Rhythmic, Functional)
4. Measure **20+ specific factors** (shot length, BPM, color saturation, emotional coherence, etc.)
5. Classify content into **5 dopamine types** (Reflective, Creative, Affective, Sensory, Chaotic)
6. Calculate a **D-Level score (0-100)** based on comprehensive analysis

**Philosophy**: Dopamine isn't "good" or "bad" – the goal is to help children follow meaning, not chase stimulus.

## 🤖 AI Integration Overview

This extension demonstrates a **hybrid AI architecture** that showcases the power of Chrome's Built-in AI:

### Client-Side AI (Gemini Nano)
- **Purpose**: Fast, private "Promise Analysis" of video metadata
- **How it works**: 
  - Runs entirely on your device using Chrome's Prompt API
  - Analyzes video title, description, channel info, and comments
  - No data sent to external servers
  - Provides instant insights about what the content promises
- **API**: Chrome Built-in AI Prompt API (`window.ai.languageModel`)
- **Requirements**: Chrome 138+ with Gemini Nano downloaded (~22GB)

### Server-Side AI (Gemini 2.5 Pro)
- **Purpose**: Deep multimodal analysis of actual video content
- **How it works**:
  - Sends YouTube video URL to Google's Gemini API
  - AI watches and analyzes the entire video (visual + audio)
  - Measures 20+ perceptual factors across 5 layers
  - Returns comprehensive D-Level score with justification
- **API**: Google Gemini 2.5 Pro via REST API
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-01-21:generateContent`
- **Authentication**: Requires user's personal Gemini API key
- **Privacy**: Video URL is sent to Google; subject to Google's Privacy Policy

### Data Flow
```
User clicks button → Content script extracts metadata
                  ↓
         ┌────────┴────────┐
         ↓                 ↓
    Local Analysis    Cloud Analysis
    (Gemini Nano)    (Gemini 2.5 Pro)
         ↓                 ↓
    Promise Analysis  Full Video Analysis
         ↓                 ↓
         └────────┬────────┘
                  ↓
         Display in Side Panel
                  ↓
         Cache locally for fast access
```

### API Configuration

The extension requires a **free Gemini API key**:
1. Get your key at: https://aistudio.google.com/app/apikey
2. Enter it in the extension settings
3. Key is stored locally in `chrome.storage.local`
4. Key is only used to authenticate API calls to Google

**No personal data is collected or stored by this extension.** See [PRIVACY.md](PRIVACY.md) for full details.

## 🔮 Future Vision

- **Public Database**: External API for accessing analyzed videos without running analyses
- **Multiple Analysis Averaging**: Statistical reliability through repeated analyses
- **YouTube Filtering**: Filter search results by D-Level ranges
- **Adult Mode**: Analysis from adult nervous system perspective
- **Cross-Platform**: TikTok, Netflix, Disney+, and more
- **Digital Diet Coach**: Personalized content recommendations and wellness tracking

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 🙏 Acknowledgments

- Google Chrome Team for the Built-in AI APIs
- Google AI for Gemini models
- The open-source community for amazing tools and libraries

## 📧 Contact

Created by [@acwo](https://github.com/acwo)

---

**Note**: This extension requires a Gemini API key (free tier available). API usage is your responsibility. The extension stores your API key locally in Chrome storage—never in code or on external servers.

