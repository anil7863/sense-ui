/**
 * SenseUI Main Script - Bundled Version
 * This file contains all functionality needed for the popup to work
 * without requiring ES6 module imports
 */

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    API: {
        OPENAI: {
            ENDPOINT: 'https://api.openai.com/v1/chat/completions',
            MODEL: 'gpt-4o',
            MAX_TOKENS: 2000,
            TEMPERATURE: 0.7
        },
        GEMINI: {
            ENDPOINT: 'https://generativelanguage.googleapis.com/v1/models',
            // Using gemini-2.5-pro - higher quality, may have better availability
            MODEL: 'gemini-2.5-pro',
            MAX_TOKENS: 2000,
            TEMPERATURE: 0.7
        }
    },
    STORAGE_KEYS: {
        OPENAI_API_KEY: 'senseui_openai_key',
        GEMINI_API_KEY: 'senseui_gemini_key',
        SELECTED_PROVIDER: 'senseui_provider',
        USER_SETTINGS: 'senseui_settings'
    },
    PROMPTS: {
        SYSTEM: `You are SenseUI, an AI assistant designed to help blind and visually impaired developers understand and improve web page designs. 
You analyze HTML structure, CSS styling, and visual screenshots to provide detailed accessibility and design feedback.

PLACEHOLDER: Replace this with your custom system instructions.

Guidelines:
- Be clear, concise, and constructive
- Focus on accessibility issues and visual design problems
- Provide actionable recommendations
- Use proper formatting (headings, lists, code blocks where appropriate)
- Prioritize issues by severity`,

        DESCRIBE: `Analyze the provided webpage and give a comprehensive description of its visual design and structure.

PLACEHOLDER: Replace this with your custom /describe command instructions.

Focus on:
1. Overall layout and visual hierarchy
2. Color scheme and contrast
3. Typography (fonts, sizes, spacing)
4. Component placement and alignment
5. Responsive design elements
6. Notable design patterns or frameworks used

Provide the description in a structured format with clear headings and bullet points.`,

        ISSUES: `Identify and list all accessibility and design issues on the provided webpage.

PLACEHOLDER: Replace this with your custom /issues command instructions.

Categorize issues by:
1. **Critical Accessibility Issues** (WCAG violations, screen reader problems)
2. **Design Consistency Issues** (spacing, alignment, visual hierarchy)
3. **Usability Issues** (contrast, readability, navigation)
4. **Code Quality Issues** (semantic HTML, CSS best practices)

For each issue:
- Describe the problem clearly
- Explain why it's problematic (especially for blind/VI users)
- Suggest specific fixes with code examples where helpful
- Rate severity: Critical, High, Medium, or Low

Present findings in a structured list format.`,

        GENERAL: `The user is asking a general question about the webpage. Provide a helpful, accurate response based on the HTML, CSS, and screenshot data provided.

PLACEHOLDER: This is used for freeform questions. Customize as needed.

Be conversational but informative. Use the webpage context to give specific, relevant answers.`
    },
    LIMITS: {
        MAX_HTML_LENGTH: 100000,
        MAX_CSS_LENGTH: 50000,
        SCREENSHOT_QUALITY: 0.8,
        SCREENSHOT_FORMAT: 'jpeg'
    }
};

// Parse command from user input
function parseCommand(userInput) {
    const trimmed = userInput.trim();
    if (trimmed.startsWith('/describe')) {
        return { command: '/describe', text: trimmed.replace('/describe', '').trim() };
    }
    if (trimmed.startsWith('/issues')) {
        return { command: '/issues', text: trimmed.replace('/issues', '').trim() };
    }
    return { command: null, text: trimmed };
}

// Get prompt for command
function getPromptForCommand(command) {
    switch (command) {
        case '/describe':
            return CONFIG.PROMPTS.DESCRIBE;
        case '/issues':
            return CONFIG.PROMPTS.ISSUES;
        default:
            return CONFIG.PROMPTS.GENERAL;
    }
}

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================
async function getEncryptionPassword() {
    const extensionId = chrome.runtime.id;
    let sessionKey = await chrome.storage.local.get('senseui_session_key');
    if (!sessionKey.senseui_session_key) {
        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        sessionKey.senseui_session_key = Array.from(randomBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        await chrome.storage.local.set(sessionKey);
    }
    return `${extensionId}:${sessionKey.senseui_session_key}`;
}

async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const keyMaterial = await crypto.subtle.importKey(
        'raw', passwordBuffer, { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']
    );
    return await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
}

async function retrieveApiKey(keyName) {
    try {
        const result = await chrome.storage.local.get(keyName);
        const encrypted = result[keyName];
        if (!encrypted) return null;
        
        const combined = new Uint8Array(atob(encrypted).split('').map(c => c.charCodeAt(0)));
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const encryptedData = combined.slice(28);
        
        const password = await getEncryptionPassword();
        const key = await deriveKey(password, salt);
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv }, key, encryptedData
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (error) {
        console.error('Error retrieving API key:', error);
        return null;
    }
}

// ============================================================================
// RESPONSE FORMATTER
// ============================================================================
function markdownToHTML(markdown) {
    if (!markdown) return '';
    let html = markdown;
    
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang ? ` class="language-${lang}"` : '';
        return `<pre><code${language}>${code.trim()}</code></pre>`;
    });
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/^\s*[-*]\s+(.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<pre')) {
        html = `<p>${html}</p>`;
    }
    return html;
}

function formatResponse(responseText, options = {}) {
    const {
        includeHeading = true,
        headingText = 'SenseUI Response',
        addCopyButton = true,
        addFavoriteButton = true,
        responseId = `response-${Date.now()}`
    } = options;

    const contentHTML = markdownToHTML(responseText);
    let html = '<div class="system-response" role="article">';
    
    if (includeHeading) {
        html += `<h2>${headingText}</h2>`;
    }
    
    html += `<div class="response-content" id="${responseId}">${contentHTML}</div>`;
    html += '<div class="response-actions">';
    
    if (addCopyButton) {
        html += `<button class="copy-button" data-target="${responseId}" aria-label="Copy response to clipboard">
            Copy to clipboard
        </button>`;
    }
    
    if (addFavoriteButton) {
        html += `<button class="favorite-button" data-target="${responseId}" aria-label="Mark this response as favorite">
            Mark as favorite
        </button>`;
    }
    
    html += '</div></div>';
    return html;
}

function attachResponseActions(container) {
    const copyButtons = container.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const targetId = button.getAttribute('data-target');
            const content = document.getElementById(targetId);
            if (content) {
                const text = content.innerText || content.textContent;
                try {
                    await navigator.clipboard.writeText(text);
                    button.textContent = 'Copied!';
                    setTimeout(() => { button.textContent = 'Copy to clipboard'; }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            }
        });
    });

    const favoriteButtons = container.querySelectorAll('.favorite-button');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const isFavorited = button.classList.toggle('favorited');
            button.textContent = isFavorited ? 'Remove from favorites' : 'Mark as favorite';
        });
    });
}

// ============================================================================
// SCREENSHOT CAPTURE
// ============================================================================
async function captureScreenshot() {
    try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab) throw new Error('No active tab found');

        const [{ result: dimensions }] = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: () => ({
                originalScrollY: window.scrollY,
                originalScrollX: window.scrollX
            })
        });

        await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: () => window.scrollTo(0, 0)
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        const dataUrl = await chrome.tabs.captureVisibleTab(null, {
            format: CONFIG.LIMITS.SCREENSHOT_FORMAT,
            quality: Math.round(CONFIG.LIMITS.SCREENSHOT_QUALITY * 100)
        });

        await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: (scrollY, scrollX) => window.scrollTo(scrollX, scrollY),
            args: [dimensions.originalScrollY, dimensions.originalScrollX]
        });

        return dataUrl;
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        return null;
    }
}

// ============================================================================
// CONTENT EXTRACTION
// ============================================================================
const contentExtractorCode = `
(function() {
    function extractHTML() {
        return document.documentElement.outerHTML;
    }

    function extractCSS() {
        let cssContent = '';
        const styleSheets = Array.from(document.styleSheets);
        
        for (const sheet of styleSheets) {
            try {
                if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
                    cssContent += \`/* External stylesheet: \${sheet.href} - Unable to access due to CORS */\\n\\n\`;
                    continue;
                }
                const rules = Array.from(sheet.cssRules || sheet.rules || []);
                for (const rule of rules) {
                    cssContent += rule.cssText + '\\n';
                }
            } catch (e) {
                console.warn('Could not access stylesheet:', sheet.href, e);
            }
        }
        return cssContent;
    }

    function extractMetadata() {
        return {
            title: document.title,
            url: window.location.href,
            viewport: { width: window.innerWidth, height: window.innerHeight },
            lang: document.documentElement.lang || 'unknown',
            charset: document.characterSet,
            description: document.querySelector('meta[name="description"]')?.content || ''
        };
    }

    return {
        html: extractHTML(),
        css: extractCSS(),
        metadata: extractMetadata()
    };
})();
`;

async function extractPageContent() {
    try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab) return null;

        const [result] = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: function() {
                function extractHTML() {
                    return document.documentElement.outerHTML;
                }
                function extractCSS() {
                    let cssContent = '';
                    const styleSheets = Array.from(document.styleSheets);
                    for (const sheet of styleSheets) {
                        try {
                            if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
                                cssContent += `/* External stylesheet: ${sheet.href} */\\n`;
                                continue;
                            }
                            const rules = Array.from(sheet.cssRules || sheet.rules || []);
                            for (const rule of rules) {
                                cssContent += rule.cssText + '\\n';
                            }
                        } catch (e) {}
                    }
                    return cssContent;
                }
                function extractMetadata() {
                    return {
                        title: document.title,
                        url: window.location.href,
                        viewport: { width: window.innerWidth, height: window.innerHeight }
                    };
                }
                return {
                    html: extractHTML().substring(0, 100000),
                    css: extractCSS().substring(0, 50000),
                    metadata: extractMetadata()
                };
            }
        });

        return result?.result || null;
    } catch (error) {
        console.error('Error extracting content:', error);
        return null;
    }
}

// ============================================================================
// LLM CLIENT
// ============================================================================

// Helper function to list available Gemini models
async function listGeminiModels(apiKey) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
            { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        if (!response.ok) {
            console.error('Failed to list models:', response.status);
            return [];
        }
        const data = await response.json();
        console.log('Available Gemini models:', data.models?.map(m => m.name));
        return data.models || [];
    } catch (error) {
        console.error('Error listing models:', error);
        return [];
    }
}

async function sendToLLM(userMessage, context, systemPrompt, provider) {
    const apiKey = await retrieveApiKey(
        provider === 'openai' ? CONFIG.STORAGE_KEYS.OPENAI_API_KEY : CONFIG.STORAGE_KEYS.GEMINI_API_KEY
    );
    
    if (!apiKey) {
        throw new Error('API key not configured. Please add an API key in Settings.');
    }

    // Build context text
    let contextText = '';
    if (context.metadata) {
        contextText += `\\n\\nPage: ${context.metadata.title} (${context.metadata.url})`;
    }
    if (context.html) {
        contextText += `\\n\\nHTML:\\n${context.html.substring(0, 30000)}`;
    }
    if (context.css) {
        contextText += `\\n\\nCSS:\\n${context.css.substring(0, 15000)}`;
    }

    const fullMessage = `${userMessage}${contextText}`;

    if (provider === 'openai') {
        return await sendToOpenAI(apiKey, systemPrompt, fullMessage, context.screenshot);
    } else {
        return await sendToGemini(apiKey, systemPrompt, fullMessage, context.screenshot);
    }
}

async function sendToOpenAI(apiKey, systemPrompt, userMessage, screenshot) {
    const messages = [
        { role: 'system', content: systemPrompt }
    ];

    if (screenshot) {
        messages.push({
            role: 'user',
            content: [
                { type: 'text', text: userMessage },
                { type: 'image_url', image_url: { url: screenshot, detail: 'high' } }
            ]
        });
    } else {
        messages.push({ role: 'user', content: userMessage });
    }

    const response = await fetch(CONFIG.API.OPENAI.ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: CONFIG.API.OPENAI.MODEL,
            messages: messages,
            temperature: CONFIG.API.OPENAI.TEMPERATURE,
            max_tokens: CONFIG.API.OPENAI.MAX_TOKENS
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function sendToGemini(apiKey, systemPrompt, userMessage, screenshot) {
    const endpoint = `${CONFIG.API.GEMINI.ENDPOINT}/${CONFIG.API.GEMINI.MODEL}:generateContent?key=${apiKey}`;
    
    // Combine system prompt with user message for Gemini
    const fullMessage = `${systemPrompt}\n\n${userMessage}`;
    const parts = [{ text: fullMessage }];
    
    if (screenshot) {
        const matches = screenshot.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            parts.push({
                inlineData: { mimeType: matches[1], data: matches[2] }
            });
        }
    }

    const requestBody = {
        contents: [{ role: 'user', parts: parts }],
        generationConfig: {
            temperature: CONFIG.API.GEMINI.TEMPERATURE,
            maxOutputTokens: CONFIG.API.GEMINI.MAX_TOKENS
        }
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `Gemini API error: ${response.status}`;
        console.error('Gemini API Error:', errorData);
        
        // If model not found, list available models
        if (errorMessage.includes('not found') || errorMessage.includes('not supported')) {
            console.log('Fetching available models for your API key...');
            const models = await listGeminiModels(apiKey);
            console.log('Try changing the MODEL in script-bundled.js to one of these:', 
                models.map(m => m.name.replace('models/', '')));
            throw new Error(`${errorMessage}\n\nCheck the console to see available models for your API key.`);
        }
        
        throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Invalid Gemini response:', data);
        throw new Error('Invalid response from Gemini API');
    }
    return data.candidates[0].content.parts.map(part => part.text).join('');
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================
async function processUserInput(userInput) {
    // Check if API key is configured
    const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.SELECTED_PROVIDER);
    const provider = result[CONFIG.STORAGE_KEYS.SELECTED_PROVIDER] || 'openai';
    
    // Parse command
    const { command, text } = parseCommand(userInput);
    const commandPrompt = command ? getPromptForCommand(command) : CONFIG.PROMPTS.GENERAL;
    const systemPrompt = `${CONFIG.PROMPTS.SYSTEM}\\n\\n${commandPrompt}`;

    // Gather context
    const context = {};
    
    try {
        context.screenshot = await captureScreenshot();
        console.log('✅ Screenshot captured:', context.screenshot ? 'Yes' : 'No');
        announce('Screenshot captured');
    } catch (error) {
        console.error('Screenshot error:', error);
        announce('Screenshot capture failed');
    }
    
    try {
        const pageContent = await extractPageContent();
        if (pageContent) {
            context.html = pageContent.html;
            context.css = pageContent.css;
            context.metadata = pageContent.metadata;
            console.log('✅ Page content extracted:', pageContent.metadata?.title || 'Unknown page');
            announce('Page content extracted');
        }
    } catch (error) {
        console.error('Content extraction error:', error);
    }

    // Send to LLM
    const userMessage = text || userInput;
    const responseText = await sendToLLM(userMessage, context, systemPrompt, provider);

    // Format response
    const responseHTML = formatResponse(responseText, {
        headingText: 'SenseUI said:',
        includeHeading: true,
        addCopyButton: true,
        addFavoriteButton: true
    });

    const summary = responseText.substring(0, 150) + (responseText.length > 150 ? '...' : '');

    return {
        html: responseHTML,
        summary: `SenseUI said: ${summary}`,
        error: null
    };
}

// ============================================================================
// UI CODE
// ============================================================================
let sendButton;
let chatMessages;
let chatInput;
let commandDatalist;
let introSection;

function announce(msg) {
    const live = document.createElement('div');
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    live.className = 'sr-only';
    live.textContent = msg;
    document.body.appendChild(live);
    setTimeout(() => live.remove(), 1500);
}

window.addEventListener('DOMContentLoaded', () => {
    sendButton = document.querySelector('.chat-send');
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    commandDatalist = document.getElementById('command-list');
    introSection = document.querySelector('.intro');
    
    announce('SenseUI opened.');
    
    if (chatInput) {
        chatInput.focus();
        if (chatInput.hasAttribute('list')) {
            chatInput.removeAttribute('list');
        }
        setupCommandSuggestions();
        setupEventListeners();
    }
});

function setupCommandSuggestions() {
    if (!chatInput || !commandDatalist) return;
    
    const allOptions = Array.from(commandDatalist.querySelectorAll('option')).map(o => o.value);
    let lastAnnouncedCount = null;
    let previousValue = '';

    function countFilteredOptions(query) {
        if (!query) return allOptions.length;
        return allOptions.filter(opt => opt.toLowerCase().includes(query.toLowerCase())).length;
    }

    chatInput._resetCommandState = () => {
        if (chatInput.hasAttribute('list')) chatInput.removeAttribute('list');
        lastAnnouncedCount = null;
        previousValue = '';
    };
    
    chatInput.addEventListener('input', () => {
        const val = chatInput.value;
        if (val === '/' && previousValue === '') {
            chatInput.setAttribute('list', 'command-list');
            announce(`Commands menu available. ${allOptions.length} options.`);
            lastAnnouncedCount = allOptions.length;
        } else if (val.startsWith('/') && val.length > 1) {
            if (!chatInput.hasAttribute('list')) chatInput.setAttribute('list', 'command-list');
            const count = countFilteredOptions(val);
            if (count !== lastAnnouncedCount) {
                announce(count === 0 ? 'No matching commands' : count === 1 ? '1 command available' : `${count} commands available`);
                lastAnnouncedCount = count;
            }
        } else if (!val.startsWith('/') && previousValue.startsWith('/')) {
            if (chatInput.hasAttribute('list')) chatInput.removeAttribute('list');
            lastAnnouncedCount = null;
        }
        previousValue = val;
    });

    chatInput.addEventListener('change', () => {
        if (chatInput.value.startsWith('/')) announce(`Selected: ${chatInput.value}`);
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatInput.value.startsWith('/')) {
            announce('Commands closed');
            if (chatInput.hasAttribute('list')) chatInput.removeAttribute('list');
            lastAnnouncedCount = null;
        }
    });
}

function setupEventListeners() {
    if (sendButton) sendButton.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeElement = document.activeElement;
        if (activeElement && 
            (activeElement.tagName === 'INPUT' || 
             activeElement.tagName === 'TEXTAREA' || 
             activeElement.isContentEditable)) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}, true);

async function sendMessage() {
    const userInput = chatInput.value.trim();
    if (!userInput) return;
    
    if (userInput === '/clear') {
        chatMessages.innerHTML = '';
        chatInput.value = '';
        if (typeof chatInput._resetCommandState === 'function') {
            chatInput._resetCommandState();
        }
        // Announce for screen readers
        announce('Chat cleared.');
        const systemEvent = document.createElement('div');
        systemEvent.className = 'system-response';
        systemEvent.innerHTML = `<h2>System</h2><p>Chat cleared.</p>`;
        chatMessages.appendChild(systemEvent);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return;
    }

    if (introSection) introSection.style.display = 'none';
    
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `<h2>You said:</h2><p>${userInput}</p>`;
    chatMessages.appendChild(userMessage);
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'system-response loading-response';
    loadingDiv.innerHTML = `<h2>SenseUI</h2><div class="loading-content"><p>Analyzing page...</p></div>`;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    chatInput.value = '';
    if (typeof chatInput._resetCommandState === 'function') {
        chatInput._resetCommandState();
    }
    
    announce('Analyzing page...');
    
    try {
        const response = await processUserInput(userInput);
        loadingDiv.remove();
        
        const responseDiv = document.createElement('div');
        responseDiv.innerHTML = response.html;
        chatMessages.appendChild(responseDiv);
        attachResponseActions(responseDiv);
        announce(response.summary);
        
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'system-response error-response';
        errorDiv.innerHTML = `
            <h2>Error</h2>
            <p>${error.message}</p>
            ${error.message.includes('API key') ? 
                '<p>Please visit <a href="settings.html">Settings</a> to configure your API key.</p>' : 
                '<p>Please try again or check the console for more details.</p>'}
        `;
        chatMessages.appendChild(errorDiv);
        announce(`Error: ${error.message}`);
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
