/**
 * Main UI Script for SenseUI Popup
 * Handles user interactions and coordinates with modules
 */

import { processUserInput, createLoadingResponse, checkReadiness } from './modules/orchestrator.js';
import { attachResponseActions } from './modules/responseFormatter.js';

// Declare variables at module scope
let sendButton;
let chatMessages;
let chatInput;
let commandDatalist;
let introSection;

//announce commands menu
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

// Announce when popup opens
window.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    sendButton = document.querySelector('.chat-send');
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    commandDatalist = document.getElementById('command-list');
    introSection = document.querySelector('.intro');
    
    // Announce for screen readers
    announce('SenseUI opened.');
    
    // Focus the chat input when the page loads
    if (chatInput) {
        chatInput.focus();
        // Ensure command suggestions are not attached by default
        // We will attach the datalist only when the user types '/'
        if (chatInput.hasAttribute('list')) {
            chatInput.removeAttribute('list');
        }
        
        // Set up command suggestions
        setupCommandSuggestions();
        
        // Set up event listeners
        setupEventListeners();
    }
});

// Set up command suggestion functionality
function setupCommandSuggestions() {
    if (!chatInput || !commandDatalist) return;
    
    // Get all options
    const allOptions = Array.from(commandDatalist.querySelectorAll('option')).map(o => o.value);

    let lastAnnouncedCount = null;
    // Track last value to control announcements

    function countFilteredOptions(query) {
        if (!query) return allOptions.length;
        return allOptions.filter(opt =>
            opt.toLowerCase().includes(query.toLowerCase())
        ).length;
    }

    // Announce when slash is typed
    let previousValue = '';

    // Expose a small helper to reset command suggestion state after send/clear
    chatInput._resetCommandState = () => {
        if (chatInput.hasAttribute('list')) {
            chatInput.removeAttribute('list');
        }
        lastAnnouncedCount = null;
        previousValue = '';
    };
    
    chatInput.addEventListener('input', () => {
        const val = chatInput.value;

        // Just typed "/"
        if (val === '/' && previousValue === '') {
            // Attach datalist so native suggestions are available
            chatInput.setAttribute('list', 'command-list');
            announce(`Commands menu available. ${allOptions.length} options.`);
            lastAnnouncedCount = allOptions.length;
        }
        // Typing after "/"
        else if (val.startsWith('/') && val.length > 1) {
            // Ensure datalist is attached while filtering
            if (!chatInput.hasAttribute('list')) {
                chatInput.setAttribute('list', 'command-list');
            }
            const count = countFilteredOptions(val);
            // Only announce if count changed
            if (count !== lastAnnouncedCount) {
                if (count === 0) {
                    announce('No matching commands');
                } else if (count === 1) {
                    announce('1 command available');
                } else {
                    announce(`${count} commands available`);
                }
                lastAnnouncedCount = count;
            }
        }
        // Cleared the "/"
        else if (!val.startsWith('/') && previousValue.startsWith('/')) {
            // Detach datalist so arrow keys navigate within the field normally
            if (chatInput.hasAttribute('list')) {
                chatInput.removeAttribute('list');
            }
            lastAnnouncedCount = null;
        }

        previousValue = val;
    });

    // Announce when option is selected
    chatInput.addEventListener('change', () => {
        if (chatInput.value.startsWith('/')) {
            announce(`Selected: ${chatInput.value}`);
        }
    });

    // Clear announcement when Escape is pressed
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatInput.value.startsWith('/')) {
            announce('Commands closed');
            // Detach datalist to close native suggestions and restore arrow-key caret movement
            if (chatInput.hasAttribute('list')) {
                chatInput.removeAttribute('list');
            }
            lastAnnouncedCount = null;
        }
    });
}

// Set up event listeners for send functionality
function setupEventListeners() {
    // send button click
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // send on Enter key
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

// Prevent Escape from closing the extension when focused on an input field
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeElement = document.activeElement;
        // Check if focus is on an input, textarea, or any editable element
        if (activeElement && 
            (activeElement.tagName === 'INPUT' || 
             activeElement.tagName === 'TEXTAREA' || 
             activeElement.isContentEditable)) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}, true); // Use capture phase to catch before browser handles it

// Process and send message with AI integration
async function sendMessage() {
    const userInput = chatInput.value.trim();
    if (!userInput) return;
    
    // Check for /clear command
    if (userInput === '/clear') {
        // Clear existing chat messages first
        chatMessages.innerHTML = '';
        // Reset input field
        chatInput.value = '';
        // Ensure command suggestions are fully reset
        if (typeof chatInput._resetCommandState === 'function') {
            chatInput._resetCommandState();
        }
        // Append a visible system message
        const systemEvent = document.createElement('div');
        systemEvent.className = 'system-response';
        systemEvent.innerHTML = `
            <h2>System</h2>
            <p>Chat cleared.</p>
        `;
        chatMessages.appendChild(systemEvent);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return;
    }

    // Hide intro section on first message
    if (introSection) {
        introSection.style.display = 'none';
    }
    
    // Display user message
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `
        <h2>You said:</h2>
        <p>${userInput}</p>
    `;
    chatMessages.appendChild(userMessage);
    
    // Show loading indicator
    const loadingResponse = createLoadingResponse('Analyzing page and generating response...');
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = loadingResponse.html;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Clear input immediately for better UX
    chatInput.value = '';
    if (typeof chatInput._resetCommandState === 'function') {
        chatInput._resetCommandState();
    }
    
    // Announce loading
    announce(loadingResponse.summary);
    
    try {
        // Check readiness
        const readiness = await checkReadiness();
        if (!readiness.ready) {
            throw new Error(readiness.message);
        }
        
        // Process the user input with AI
        const response = await processUserInput(userInput);
        
        // Remove loading indicator
        loadingDiv.remove();
        
        // Display AI response
        const responseDiv = document.createElement('div');
        responseDiv.innerHTML = response.html;
        chatMessages.appendChild(responseDiv);
        
        // Attach event listeners to response actions
        attachResponseActions(responseDiv);
        
        // Announce response (summary for screen readers)
        announce(response.summary);
        
    } catch (error) {
        console.error('Error in sendMessage:', error);
        
        // Remove loading indicator
        loadingDiv.remove();
        
        // Show error message
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
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}