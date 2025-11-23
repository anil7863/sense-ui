# SenseUI Quick Start Guide

## 🚀 Getting Started

Your browser extension has been successfully scaffolded with modular AI functionality! Here's how to get it running.

## 📋 Prerequisites

- Chrome or Chromium-based browser
- API key from OpenAI or Google Gemini
- Basic understanding of browser extensions

## 🔧 Setup Steps

### 1. Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `src` folder from your project
5. The SenseUI extension should now appear in your extensions list

### 2. Configure API Keys

1. Click the SenseUI extension icon (or press Cmd+Shift+S on Mac / Ctrl+Shift+S on Windows)
2. Navigate to **Settings**
3. Choose your AI provider (OpenAI or Gemini)
4. Enter your API key:
   - **OpenAI**: Get from https://platform.openai.com/api-keys
   - **Gemini**: Get from https://makersuite.google.com/app/apikey
5. Click **Save**
6. Verify the status shows "✓ Key configured"

### 3. Customize Prompts (Important!)

Edit `src/script-bundled.js` and search for "PLACEHOLDER". Replace the placeholder text in the `CONFIG.PROMPTS` section:

```javascript
PROMPTS: {
    SYSTEM: `Replace with your custom system instructions...`,
    DESCRIBE: `Replace with your custom /describe command instructions...`,
    ISSUES: `Replace with your custom /issues command instructions...`,
}
```

Look for the `CONFIG` object near the top of the file (around line 17).

### 4. Test the Extension

1. Open any webpage you want to analyze
2. Click the SenseUI extension icon
3. Try these commands:
   - `/describe` - Get a comprehensive page description
   - `/issues` - Identify accessibility and design issues
   - Type any question about the page
   - `/clear` - Clear the chat

## 📁 Project Structure

```
src/
├── modules/              # Module files (for reference/development)
├── script-bundled.js    # ⚠️ MAIN FILE: All chat functionality bundled
├── settings-bundled.js  # Settings page functionality bundled
├── index.html           # Chat interface
├── settings.html        # Settings page
├── styles.css          # Styling
└── manifest.json       # Extension configuration
```

**Note**: The extension now uses bundled JavaScript files (`script-bundled.js` and `settings-bundled.js`) instead of ES6 modules to avoid browser compatibility issues. The `modules/` folder contains the original modular code for reference and development.

## ✅ Implementation Checklist

### Phase 1: Basic Setup
- [x] Module structure created
- [x] Manifest configured
- [x] All core modules implemented
- [ ] **Load extension in Chrome**
- [ ] **Add API key in Settings**

### Phase 2: Customization
- [ ] **Replace PLACEHOLDER prompts in config.js**
- [ ] Test with /describe command
- [ ] Test with /issues command
- [ ] Refine prompts based on results

### Phase 3: Testing
- [ ] Test on simple webpage
- [ ] Test on complex webpage
- [ ] Test error handling (wrong API key)
- [ ] Test accessibility features
- [ ] Test copy/favorite buttons

### Phase 4: Refinement
- [ ] Optimize prompt engineering
- [ ] Adjust token limits if needed
- [ ] Customize styling in styles.css
- [ ] Add any additional features

## 🎯 Key Features Implemented

### ✅ Content Extraction
- Extracts HTML from active page
- Captures CSS rules and inline styles
- Gets computed styles for key elements
- Collects page metadata

### ✅ Screenshot Capture
- Full-page screenshot capability
- Viewport capture
- Automatic scroll management
- Image compression options

### ✅ LLM Integration
- **OpenAI** (GPT-4, GPT-4 Vision)
- **Gemini** (Gemini 1.5 Pro)
- Vision analysis with screenshots
- Unified interface for both providers

### ✅ Secure Storage
- API keys encrypted with AES-GCM
- Web Crypto API implementation
- Keys never stored in plaintext
- Secure key derivation

### ✅ Settings Panel
- API key management
- Provider selection
- Detail level configuration
- Context instructions
- Visual status indicators

### ✅ Response Formatting
- Markdown to HTML conversion
- Semantic structure
- Copy to clipboard
- Favorite marking
- Screen reader friendly

### ✅ Accessibility
- ARIA labels throughout
- Screen reader announcements
- Keyboard navigation
- Skip links
- High contrast support

## 🔍 Testing Commands

Once configured, test these in the chat:

```
/describe
→ Should provide comprehensive visual description

/issues
→ Should list accessibility and design problems

What colors are used on this page?
→ Should analyze and describe color scheme

Is this page accessible?
→ Should evaluate accessibility

/clear
→ Should clear the chat history
```

## 🐛 Troubleshooting

### Extension doesn't load
- Check browser console for errors
- Verify all files are in `src/` folder
- Reload extension from chrome://extensions/

### "No API key configured" error
- Go to Settings
- Add OpenAI or Gemini API key
- Click Save
- Try again

### No response from AI
- Check browser console for API errors
- Verify API key is valid
- Check internet connection
- Verify API has available credits/quota

### Screenshot not working
- Ensure you're on a normal webpage (not chrome:// or extension pages)
- Check "tabs" permission in manifest.json
- Try a simpler page first

### Content extraction fails
- Verify "scripting" and "activeTab" permissions
- Check if page allows content access
- Some pages block extension scripts

## 📚 Documentation

- **IMPLEMENTATION_GUIDE.md** - Detailed implementation steps and testing
- **ARCHITECTURE.md** - System architecture and data flow diagrams
- **This file** - Quick start and setup

## 🎨 Customization Tips

### Change AI Model
Edit `src/modules/config.js`:
```javascript
API: {
    OPENAI: {
        MODEL: 'gpt-4o', // or 'gpt-3.5-turbo' for faster/cheaper
    },
    GEMINI: {
        MODEL: 'gemini-1.5-flash', // faster alternative
    }
}
```

### Adjust Response Length
```javascript
API: {
    OPENAI: {
        MAX_TOKENS: 1000, // reduce for shorter responses
    }
}
```

### Disable Screenshots
In `src/modules/orchestrator.js`, change:
```javascript
const { includeScreenshot = false } = options; // set to false
```

## 🚦 Next Steps

1. **Load the extension** in Chrome
2. **Add your API key** in Settings
3. **Edit prompts** in `config.js` - replace PLACEHOLDER text
4. **Test on a webpage** - try /describe command
5. **Refine prompts** based on AI responses
6. **Customize styling** if desired
7. **Report any issues** or bugs

## 💡 Pro Tips

- Start with simple webpages when testing
- Use /describe to understand how the AI sees the page
- Refine your prompts iteratively
- Test both OpenAI and Gemini to see which works better
- Consider using faster models during development
- Enable detailed logging in modules during debugging

## 🔐 Security Notes

- API keys are encrypted before storage
- Never commit API keys to version control
- Keys are only sent to official OpenAI/Gemini endpoints
- Extension uses minimal required permissions

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Review IMPLEMENTATION_GUIDE.md for detailed troubleshooting
3. Verify API keys are valid and have credits
4. Test with a simple webpage first
5. Check that all files are properly saved

---

**You're all set!** 🎉 Load the extension and start testing. Remember to customize the prompts in `config.js` for your specific use case.
