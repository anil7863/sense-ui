const sendButton = document.querySelector('.chat-send');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const commandDatalist = document.getElementById('command-list');
const introSection = document.querySelector('.intro');

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

// Load chat messages from storage
function loadChatMessages() {
    chrome.storage.local.get(['chatMessages'], (result) => {
        if (result.chatMessages && result.chatMessages.length > 0) {
            // Hide intro section if there are messages
            if (introSection) {
                introSection.style.display = 'none';
            }
            // Restore messages
            chatMessages.innerHTML = result.chatMessages.join('');
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
}

// Save chat messages to storage
function saveChatMessages() {
    const messages = Array.from(chatMessages.children).map(child => child.outerHTML);
    chrome.storage.local.set({ chatMessages: messages });
}

// Announce when popup opens
window.addEventListener('DOMContentLoaded', () => {
    announce('SenseUI opened.');
    // Load previous chat messages
    loadChatMessages();
    // Focus the chat input when the page loads
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.focus();
        // Ensure command suggestions are not attached by default
        // We will attach the datalist only when the user types '/'
        if (chatInput.hasAttribute('list')) {
            chatInput.removeAttribute('list');
        }
    }
});

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

if (chatInput && commandDatalist) {
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

function sendMessage() {
    const userInput = chatInput.value.trim();
    if (userInput) {
        // Check for /clear command
        if (userInput === '/clear') {
            // 1) Clear existing chat messages first
            chatMessages.innerHTML = '';
            // 2) Clear messages from storage
            chrome.storage.local.set({ chatMessages: [] });
            // 3) Reset input field
            chatInput.value = '';
            // Ensure command suggestions are fully reset
            if (typeof chatInput._resetCommandState === 'function') {
                chatInput._resetCommandState();
            }
            // 4) Append a visible system message so SRs announce an addition to the log
            const systemEvent = document.createElement('div');
            systemEvent.className = 'system-response';
            systemEvent.innerHTML = `
                <h2>System</h2>
                <p>Chat cleared.</p>
            `;
            chatMessages.appendChild(systemEvent);
            // 5) Save the system message
            saveChatMessages();
            // 6) Ensure the message is in view
            chatMessages.scrollTop = chatMessages.scrollHeight;
            // 7) Stop here; don't add the user message or placeholder
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

        // Display system response (placeholder)
        const placeholderText = 'This is a placeholder response.';
        const systemResponse = document.createElement('div');
        systemResponse.className = 'system-response';
        systemResponse.innerHTML = `
            <h2>SenseUI said:</h2>
            <p>${placeholderText}</p>
            <button class="copy-button">Copy to clipboard</button>
            <button class="favorite-button">Mark as favorite</button>
        `;
        chatMessages.appendChild(systemResponse);

        // Save messages to storage
        saveChatMessages();

        // Announce only the new response
        announce(`SenseUI said: ${placeholderText}`);

        // Clear input
        chatInput.value = '';
        // Ensure command suggestions are fully reset so arrows move caret normally
        if (typeof chatInput._resetCommandState === 'function') {
            chatInput._resetCommandState();
        }
    }
}

// send button click
sendButton.addEventListener('click', sendMessage);

// send on Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});