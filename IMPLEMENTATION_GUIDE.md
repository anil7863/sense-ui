# SenseUI Implementation Guide

## Architecture Overview

SenseUI is now organized into modular components for maintainability and scalability. Each module has a specific responsibility and can be developed/tested independently.

## Module Structure

```
src/
├── modules/
│   ├── config.js              # Configuration and prompts
│   ├── contentExtractor.js    # HTML/CSS extraction from pages
│   ├── screenshotCapture.js   # Screenshot capture functionality
│   ├── encryption.js          # API key encryption/decryption
│   ├── llmClient.js          # OpenAI & Gemini API integration
│   ├── responseFormatter.js   # Format LLM responses to HTML
│   ├── settingsManager.js     # Settings storage and retrieval
│   ├── settingsUI.js         # Settings page UI logic
│   └── orchestrator.js       # Main coordination module
├── index.html                # Main chat interface
├── settings.html            # Settings page
├── script.js               # Main UI script (coordinates modules)
└── manifest.json          # Extension manifest
```

## Module Responsibilities

### 1. **config.js**
- **Purpose**: Central configuration and prompt management
- **Key Features**:
  - API endpoints and models for OpenAI and Gemini
  - System prompts (general, /describe, /issues commands)
  - Storage key constants
  - Helper functions for command parsing
- **Customization**: Replace PLACEHOLDER prompts with your specific instructions

### 2. **contentExtractor.js**
- **Purpose**: Extract page HTML, CSS, and computed styles
- **Key Features**:
  - Full HTML extraction
  - CSS rules from stylesheets and inline styles
  - Computed styles for key elements
  - Page metadata (title, viewport, etc.)
- **Usage**: Injected into active tab as content script

### 3. **screenshotCapture.js**
- **Purpose**: Capture screenshots of web pages
- **Key Features**:
  - Viewport capture
  - Full-page capture (scrolls to top)
  - Advanced stitching capability (foundation)
  - Image compression utilities
- **Note**: Full stitching requires additional canvas work

### 4. **encryption.js**
- **Purpose**: Secure API key storage
- **Key Features**:
  - AES-GCM encryption using Web Crypto API
  - Key derivation from extension ID + session key
  - Store/retrieve/remove API keys securely
  - Key format validation
- **Security**: Keys encrypted before storing in chrome.storage

### 5. **llmClient.js**
- **Purpose**: Unified LLM API client
- **Key Features**:
  - OpenAI API integration (GPT-4, vision models)
  - Gemini API integration (Gemini 1.5 Pro)
  - Vision capabilities (image analysis)
  - Unified interface for both providers
  - Error handling with LLMError class
- **Extensibility**: Easy to add more providers

### 6. **responseFormatter.js**
- **Purpose**: Format LLM text responses into accessible HTML
- **Key Features**:
  - Markdown to HTML conversion
  - Semantic HTML structure
  - Copy and favorite buttons
  - Error message formatting
  - Loading indicators
  - ARIA labels and accessibility features
- **Accessibility**: Screen reader friendly output

### 7. **settingsManager.js**
- **Purpose**: Manage user settings
- **Key Features**:
  - Load/save settings
  - Validate settings
  - API key status checking
  - Import/export settings
  - Reset to defaults
- **Storage**: Uses chrome.storage.local

### 8. **settingsUI.js**
- **Purpose**: Settings page interaction logic
- **Key Features**:
  - Load and display current settings
  - Form submission handling
  - API key status indicators
  - Clear API key functionality
  - Validation feedback

### 9. **orchestrator.js**
- **Purpose**: Main coordination module
- **Key Features**:
  - Processes user input end-to-end
  - Coordinates content extraction, screenshot, and LLM calls
  - Handles command parsing
  - Error handling and user feedback
  - Readiness checks
- **Core Function**: `processUserInput(userInput, options)`

## Implementation Order (Recommended)

Follow this order to implement and test features incrementally:

### Phase 1: Foundation (Already Complete)
✅ 1. Set up module structure  
✅ 2. Configure manifest.json with permissions  
✅ 3. Create config.js with prompts  

### Phase 2: Core Functionality
**Step 1: Settings and API Keys** (Do this first!)
- Test settings page loads correctly
- Add an API key and verify it's stored
- Check that key status indicators work

**Step 2: Content Extraction**
- Open a webpage
- Test content extraction manually in console
- Verify HTML, CSS, and metadata are captured

**Step 3: Screenshot Capture**
- Test screenshot capture on a simple page
- Verify image data URL is generated
- Test on pages of different sizes

### Phase 3: AI Integration
**Step 4: LLM Client Testing**
- Use a simple test prompt without page context
- Test OpenAI integration first
- Test Gemini integration
- Verify error handling (invalid key, network errors)

**Step 5: Response Formatting**
- Test markdown rendering
- Verify copy button works
- Test favorite button
- Check screen reader announcements

### Phase 4: Full Integration
**Step 6: Orchestrator**
- Connect all modules in orchestrator.js
- Test with /describe command
- Test with /issues command
- Test with general questions

**Step 7: UI Integration**
- Integrate orchestrator with script.js
- Test loading indicators
- Test error messages
- Verify accessibility features

### Phase 5: Refinement
**Step 8: Prompt Engineering**
- Replace PLACEHOLDER prompts with your refined versions
- Test different prompt variations
- Optimize token usage

**Step 9: Error Handling**
- Test all error scenarios
- Improve error messages
- Add retry logic if needed

**Step 10: Performance Optimization**
- Optimize data size sent to LLM
- Implement caching if needed
- Test on large/complex pages

## Testing Checklist

### Settings
- [ ] Can save OpenAI API key
- [ ] Can save Gemini API key
- [ ] Can switch between providers
- [ ] Can clear API keys
- [ ] Settings persist across sessions
- [ ] Invalid key format shows error

### Content Extraction
- [ ] HTML extracts correctly
- [ ] CSS rules captured (inline and external)
- [ ] Metadata accurate
- [ ] Works on complex pages
- [ ] Handles CORS-blocked stylesheets gracefully

### Screenshot
- [ ] Viewport capture works
- [ ] Full-page capture works
- [ ] Screenshot quality acceptable
- [ ] Doesn't break page scroll position

### LLM Integration
- [ ] OpenAI API calls succeed
- [ ] Gemini API calls succeed
- [ ] Vision analysis works with screenshots
- [ ] Handles rate limits
- [ ] Handles API errors gracefully
- [ ] Token limits respected

### Commands
- [ ] /describe provides comprehensive description
- [ ] /issues identifies accessibility problems
- [ ] General questions answered accurately
- [ ] /clear clears chat

### Accessibility
- [ ] Screen reader announces responses
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Focus management correct
- [ ] Color contrast adequate

## Common Issues and Solutions

### Issue: "No API key configured"
**Solution**: Go to Settings and add at least one API key (OpenAI or Gemini)

### Issue: Screenshot capture fails
**Solution**: Check that you're on a normal webpage (not chrome:// or extension pages)

### Issue: Content extraction returns empty
**Solution**: Ensure proper permissions in manifest and tab is accessible

### Issue: CORS errors with CSS
**Solution**: This is expected for external stylesheets. The module handles it gracefully.

### Issue: LLM response too slow
**Solution**: 
- Reduce HTML/CSS size limits in config.js
- Use faster models (gpt-3.5-turbo or gemini-1.5-flash)
- Disable screenshot capture for faster responses

### Issue: Extension doesn't load modules
**Solution**: 
- Ensure all files use `type="module"` in script tags
- Check browser console for import errors
- Verify file paths are correct

## Customization Guide

### Customizing Prompts
Edit `src/modules/config.js`:

```javascript
PROMPTS: {
    SYSTEM: `Your custom system prompt here...`,
    DESCRIBE: `Your custom /describe instructions...`,
    ISSUES: `Your custom /issues instructions...`
}
```

### Adding a New Command
1. Add command to `src/index.html` datalist:
```html
<option value="/newcommand">
```

2. Add prompt in `config.js`:
```javascript
PROMPTS: {
    NEWCOMMAND: `Your prompt for this command...`
}
```

3. Update `parseCommand()` in `config.js`
4. Update `getPromptForCommand()` in `config.js`

### Adding a New LLM Provider
1. Create new client class in `llmClient.js`
2. Add provider config in `config.js`
3. Update `LLMClient` class to support new provider
4. Add option to settings page

### Styling
Edit `src/styles.css` to customize appearance:
- `.system-response` for AI responses
- `.user-message` for user messages
- `.error-response` for errors
- `.loading-response` for loading states

## Security Considerations

1. **API Keys**: Encrypted using AES-GCM before storage
2. **Content Security Policy**: Restricts script execution
3. **HTTPS Only**: API calls only over HTTPS
4. **No Key Logging**: Keys never logged to console
5. **Permissions**: Minimal required permissions

## Performance Tips

1. **Limit Data Size**: Adjust `MAX_HTML_LENGTH` and `MAX_CSS_LENGTH` in config.js
2. **Cache Results**: Consider caching page content if analyzing same page multiple times
3. **Lazy Loading**: Only extract content/screenshot when needed
4. **Debounce**: Add debouncing to prevent rapid API calls
5. **Model Selection**: Use faster models for quick responses

## Next Steps

1. **Configure API Keys**: Add your OpenAI or Gemini API key in Settings
2. **Customize Prompts**: Replace PLACEHOLDER text in config.js with your specific instructions
3. **Test Each Feature**: Follow the implementation order and test incrementally
4. **Refine Prompts**: Iterate on prompts based on actual LLM responses
5. **Add Styling**: Customize CSS for your preferred look
6. **Deploy**: Load the extension in Chrome for testing

## Development Workflow

```bash
# 1. Make changes to module files
# 2. Reload extension in Chrome
# 3. Test specific feature
# 4. Check console for errors
# 5. Iterate
```

## Debugging Tips

1. **Enable Verbose Logging**: Add `console.log()` statements in modules
2. **Check Network Tab**: Verify API calls are being made
3. **Inspect Storage**: Use Chrome DevTools > Application > Storage
4. **Test Modules Independently**: Import and test modules in console
5. **Use Breakpoints**: Add debugger statements for step-through debugging

## Support and Resources

- **OpenAI API Docs**: https://platform.openai.com/docs
- **Gemini API Docs**: https://ai.google.dev/docs
- **Chrome Extensions**: https://developer.chrome.com/docs/extensions
- **Web Crypto API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API

---

**Ready to build!** Start by configuring your API keys in Settings, then test each module following the implementation order above.
