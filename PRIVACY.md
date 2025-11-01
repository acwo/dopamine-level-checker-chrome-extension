# Privacy Policy

**D-Level AI Analyzer Chrome Extension**

Last updated: October 31, 2025

## Data Collection and Usage

This Chrome extension is designed with privacy as a core principle. Here's what you need to know:

### What We DO NOT Collect

- ❌ **No personal information** - We do not collect, store, or transmit any personally identifiable information
- ❌ **No browsing history** - We do not track which videos you watch or your viewing patterns
- ❌ **No user profiles** - We do not create or maintain user profiles
- ❌ **No analytics or tracking** - We do not use any analytics services or tracking pixels
- ❌ **No video content storage** - We do not save or store video content on our servers

### What Data Is Processed

The extension processes the following data **locally on your device or through secure API calls**:

1. **Video Metadata** (Local Processing - Gemini Nano)
   - Video title, description, channel name
   - View count, upload date, likes (if visible)
   - Top comments (if loaded on the page)
   - **Storage**: Processed locally on your device, never sent to our servers
   - **Purpose**: Quick "Promise Analysis" of what the content offers

2. **Video Analysis** (Cloud Processing - Gemini 2.5 Pro)
   - YouTube video URL (sent to Google's Gemini API)
   - Video metadata for context
   - **Storage**: Not stored by us; processed through Google's Gemini API
   - **Purpose**: Deep multimodal analysis of video content
   - **Note**: Subject to [Google's Privacy Policy](https://policies.google.com/privacy)

### API Key Storage

- Your Gemini API key is stored **locally in Chrome's storage** (`chrome.storage.local`)
- The API key **never leaves your browser** except when making direct API calls to Google's Gemini service
- We do not have access to your API key

### Cache and Local Storage

- Analysis results are cached **locally in your browser** for faster access
- Cached data includes: D-Level scores, analysis text, and timestamps
- You can clear this data at any time through Chrome's extension settings
- No cached data is sent to external servers

### Third-Party Services

This extension uses:

1. **Google Gemini Nano (Chrome Built-in AI)**
   - Runs entirely on your device
   - No data sent to external servers
   - Requires Chrome 138+ with AI features enabled

2. **Google Gemini 2.5 Pro API**
   - Video URLs and metadata sent to Google for analysis
   - Subject to [Google's Terms of Service](https://policies.google.com/terms) and [Privacy Policy](https://policies.google.com/privacy)
   - Processed in accordance with Google's data handling practices

### Your Rights

You have the right to:
- Delete all locally stored data by removing the extension
- Clear cached analyses through Chrome's extension management
- Use the extension without providing any personal information
- Review all source code on our [GitHub repository](https://github.com/acwo/dopamine-level-checker-chrome-extension)

### Data Security

- All API communications use HTTPS encryption
- No data is stored on our servers (we don't have any)
- Your API key is stored securely in Chrome's encrypted storage

### Children's Privacy

This extension is designed to help analyze content for children, but the extension itself does not knowingly collect data from children under 13. All data processing is anonymous and does not require user registration or personal information.

### Changes to This Policy

We may update this privacy policy from time to time. Any changes will be posted in this file and the "Last updated" date will be revised.

### Contact

For questions about this privacy policy, please:
- Open an issue on [GitHub](https://github.com/acwo/dopamine-level-checker-chrome-extension/issues)
- Review the source code to verify our privacy claims

### Open Source Transparency

This extension is **100% open source**. You can review all code, including:
- How data is processed
- What API calls are made
- What is stored locally
- How your API key is handled

Repository: https://github.com/acwo/dopamine-level-checker-chrome-extension

---

**Summary**: We don't collect, store, or sell any personal data. All processing is done locally or through Google's Gemini API. Your privacy is protected by design.

