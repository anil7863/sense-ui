# SenseUI Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  index.html  │  │settings.html │  │  about.html  │          │
│  │  (Chat UI)   │  │  (Settings)  │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘          │
│         │                 │                                      │
│         │                 │                                      │
│  ┌──────▼───────┐  ┌──────▼───────┐                            │
│  │  script.js   │  │settingsUI.js │                            │
│  │  (Main UI)   │  │              │                            │
│  └──────┬───────┘  └──────┬───────┘                            │
└─────────┼──────────────────┼───────────────────────────────────┘
          │                  │
          │                  │
┌─────────▼──────────────────▼───────────────────────────────────┐
│                       MODULE LAYER                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   orchestrator.js                         │  │
│  │           (Main Coordination & Processing)                │  │
│  └────┬──────────┬──────────┬──────────┬─────────┬─────────┘  │
│       │          │          │          │         │             │
│  ┌────▼────┐ ┌──▼────┐ ┌───▼────┐ ┌──▼─────┐ ┌─▼─────────┐  │
│  │content  │ │screen │ │llm     │ │response│ │settings    │  │
│  │Extractor│ │shot   │ │Client  │ │Formatter│ │Manager     │  │
│  └────┬────┘ └──┬────┘ └───┬────┘ └────────┘ └─┬─────────┘  │
│       │         │          │                    │             │
│  ┌────▼─────────▼──────────▼────────────────────▼──────────┐  │
│  │              encryption.js & config.js                    │  │
│  │        (Utilities, Constants, Configuration)              │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                     EXTERNAL SERVICES                             │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  Chrome APIs     │  │  OpenAI API      │  │  Gemini API   │ │
│  │  - tabs          │  │  - GPT-4         │  │  - Gemini 1.5 │ │
│  │  - storage       │  │  - Vision        │  │  - Vision     │ │
│  │  - scripting     │  │                  │  │               │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow: User Query to AI Response

```
1. USER INPUT
   │
   ├─> User types message in chat input
   │   Example: "/describe the homepage" or "What accessibility issues exist?"
   │
   └─> Click Send or Press Enter
       │
       ▼

2. UI LAYER (script.js)
   │
   ├─> Validate input (not empty)
   ├─> Display user message in chat
   ├─> Show loading indicator
   ├─> Clear input field
   │
   └─> Call orchestrator.processUserInput(userInput)
       │
       ▼

3. ORCHESTRATOR (orchestrator.js)
   │
   ├─> Check readiness (API key configured?)
   ├─> Parse command (/describe, /issues, or general)
   ├─> Select appropriate prompt from config
   │
   └─> Gather context in parallel:
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
   [Content         [Screenshot      [Check API
    Extraction]      Capture]         Key Status]
       │                 │                 │
       │                 │                 │
       ▼                 ▼                 ▼

4a. CONTENT EXTRACTION
    │
    ├─> Get active tab
    ├─> Inject contentExtractor.js
    ├─> Execute extraction function
    │   ├─> Extract HTML (full document)
    │   ├─> Extract CSS (stylesheets + inline)
    │   ├─> Get computed styles
    │   └─> Collect metadata
    │
    └─> Return { html, css, metadata }

4b. SCREENSHOT CAPTURE
    │
    ├─> Get active tab
    ├─> Scroll to top (preserve original position)
    ├─> Capture visible viewport
    ├─> Restore scroll position
    │
    └─> Return data URL (base64 image)

4c. API KEY RETRIEVAL
    │
    ├─> Get selected provider (OpenAI/Gemini)
    ├─> Retrieve encrypted key from storage
    ├─> Decrypt using encryption.js
    │
    └─> Return decrypted API key

       │
       ▼

5. LLM CLIENT (llmClient.js)
   │
   ├─> Build messages array:
   │   ├─> System prompt (from config)
   │   ├─> Command-specific prompt
   │   └─> User message + context data
   │
   ├─> Select provider (OpenAI or Gemini)
   │
   ├─> Format request based on provider:
   │   ├─> OpenAI: Chat Completions API
   │   └─> Gemini: Generate Content API
   │
   ├─> Include screenshot if available (vision model)
   │
   ├─> Make HTTPS API call
   │
   └─> Parse response and extract text
       │
       ▼

6. RESPONSE FORMATTER (responseFormatter.js)
   │
   ├─> Convert markdown to HTML
   │   ├─> Headings (##, ###)
   │   ├─> Lists (-, *, 1.)
   │   ├─> Code blocks (```)
   │   ├─> Bold, italic, links
   │   └─> Paragraphs and line breaks
   │
   ├─> Wrap in semantic HTML structure
   ├─> Add ARIA labels
   ├─> Add action buttons (copy, favorite)
   │
   └─> Return formatted HTML + summary
       │
       ▼

7. ORCHESTRATOR (return)
   │
   └─> Return response object:
       { html, summary, error }
       │
       ▼

8. UI LAYER (script.js)
   │
   ├─> Remove loading indicator
   ├─> Insert response HTML into chat
   ├─> Attach button event listeners
   ├─> Announce summary to screen reader
   ├─> Scroll chat to bottom
   │
   └─> Ready for next input
```

## Module Dependencies

```
script.js
    └── orchestrator.js
            ├── config.js
            ├── contentExtractor.js
            ├── screenshotCapture.js
            │       └── config.js
            ├── llmClient.js
            │       ├── config.js
            │       └── encryption.js
            ├── responseFormatter.js
            └── settingsManager.js
                    ├── config.js
                    └── encryption.js

settingsUI.js
    └── settingsManager.js
            ├── config.js
            └── encryption.js
```

## Key Functions by Module

### orchestrator.js
- `processUserInput(userInput, options)` - Main entry point
- `createLoadingResponse(message)` - Loading indicator
- `checkReadiness()` - Validates system ready

### contentExtractor.js
- `extractPageContent(options)` - Main extraction
- `extractHTML()` - Get page HTML
- `extractCSS()` - Get CSS rules
- `extractComputedStyles()` - Get rendered styles
- `extractMetadata()` - Get page info

### screenshotCapture.js
- `captureScreenshot(options)` - Main capture function
- `captureViewport(tabId)` - Capture visible area
- `captureFullPage(tabId)` - Full page capture
- `compressScreenshot(dataUrl, quality)` - Compress image

### llmClient.js
- `sendRequest(userMessage, context, options)` - Send to LLM
- `getApiKey(provider)` - Get decrypted key
- `getSelectedProvider()` - Get user's choice

### responseFormatter.js
- `formatResponse(text, options)` - Format as HTML
- `markdownToHTML(markdown)` - Convert markdown
- `formatError(error)` - Format error messages
- `attachResponseActions(container)` - Add button listeners

### settingsManager.js
- `loadSettings()` - Load from storage
- `saveSettings(settings)` - Save to storage
- `validateSettings(settings)` - Validate input
- `hasApiKeyConfigured()` - Check if ready

### encryption.js
- `encryptData(plaintext)` - Encrypt string
- `decryptData(encrypted)` - Decrypt string
- `storeApiKey(keyName, apiKey)` - Save key
- `retrieveApiKey(keyName)` - Get key

## Storage Schema

### chrome.storage.local
```javascript
{
  // Encrypted API keys
  "senseui_openai_key": "base64_encrypted_data...",
  "senseui_gemini_key": "base64_encrypted_data...",
  
  // Settings
  "senseui_provider": "openai", // or "gemini"
  "senseui_settings": {
    "detailLevel": "normal",
    "downloadOption": "all",
    "contextInstructions": "...",
    "enableScreenshot": true,
    "screenshotQuality": 0.8
  },
  
  // Session key for encryption
  "senseui_session_key": "random_hex_string..."
}
```

## API Request Flow

### OpenAI (GPT-4 with Vision)
```javascript
POST https://api.openai.com/v1/chat/completions
Headers: { Authorization: "Bearer sk-..." }
Body: {
  model: "gpt-4o",
  messages: [
    { role: "system", content: "System prompt..." },
    { 
      role: "user", 
      content: [
        { type: "text", text: "User message + context..." },
        { type: "image_url", image_url: { url: "data:image/jpeg;base64,..." }}
      ]
    }
  ],
  temperature: 0.7,
  max_tokens: 2000
}
```

### Gemini (1.5 Pro)
```javascript
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=...
Body: {
  systemInstruction: { parts: [{ text: "System prompt..." }] },
  contents: [
    {
      role: "user",
      parts: [
        { text: "User message + context..." },
        { inlineData: { mimeType: "image/jpeg", data: "base64..." }}
      ]
    }
  ],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2000
  }
}
```

## Error Handling Chain

```
Error Occurs
    │
    ├─> Caught in module (e.g., llmClient)
    ├─> Wrapped in custom error (e.g., LLMError)
    ├─> Propagated to orchestrator
    ├─> Logged to console
    ├─> Formatted by responseFormatter
    ├─> Displayed in UI
    └─> Announced to screen reader
```

## Security Model

```
API Key Input (Settings Page)
    │
    ├─> Validation (format check)
    │
    ├─> Encryption (AES-GCM 256-bit)
    │   ├─> Derive key from extension ID + session key
    │   ├─> Generate random salt & IV
    │   └─> Encrypt using Web Crypto API
    │
    ├─> Store encrypted in chrome.storage.local
    │
    └─> Never logged or transmitted except to official APIs

When Needed:
    │
    ├─> Retrieve encrypted data from storage
    ├─> Decrypt using same key derivation
    ├─> Use in memory only (never stored as plaintext)
    └─> Cleared after use
```

## Extension Lifecycle

```
Extension Installed
    │
    └─> Generate random session key (for encryption)

Popup Opened (User clicks extension icon)
    │
    ├─> Load index.html
    ├─> Load script.js as module
    ├─> Initialize UI elements
    ├─> Set up event listeners
    ├─> Check if API key configured
    └─> Show intro or ready state

User Sends Message
    │
    └─> Follow "Data Flow" diagram above

Settings Page Opened
    │
    ├─> Load settings.html
    ├─> Load settingsUI.js as module
    ├─> Load current settings
    ├─> Display API key status
    └─> Ready for updates

Extension Updated
    │
    └─> Settings preserved (chrome.storage persists)
```

---

This architecture ensures:
- **Modularity**: Each component has single responsibility
- **Maintainability**: Clear separation of concerns
- **Testability**: Modules can be tested independently
- **Security**: API keys encrypted at rest
- **Accessibility**: Screen reader support throughout
- **Extensibility**: Easy to add new features or providers
