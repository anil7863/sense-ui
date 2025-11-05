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

// Announce when popup opens
window.addEventListener('DOMContentLoaded', () => {
    announce('SenseUI opened.');
    // Focus the chat input when the page loads
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.focus();
    }
});

// Announce when popup closes (Escape key)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        announce('SenseUI closing.');
        // Give time for announcement before popup closes
        setTimeout(() => {
            window.close();
        }, 100);
    }
});

if (chatInput && commandDatalist) {
    // Get all options
    const allOptions = Array.from(commandDatalist.querySelectorAll('option')).map(o => o.value);

    let lastAnnouncedCount = null;

    function countFilteredOptions(query) {
        if (!query) return allOptions.length;
        return allOptions.filter(opt =>
            opt.toLowerCase().includes(query.toLowerCase())
        ).length;
    }

    // Announce when slash is typed
    let previousValue = '';
    chatInput.addEventListener('input', () => {
        const val = chatInput.value;

        // Just typed "/"
        if (val === '/' && previousValue === '') {
            announce(`Commands menu available. ${allOptions.length} options.`);
            lastAnnouncedCount = allOptions.length;
        }
        // Typing after "/"
        else if (val.startsWith('/') && val.length > 1) {
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
            // 2) Reset input field
            chatInput.value = '';
            // 3) Append a visible system message so SRs announce an addition to the log
            const systemEvent = document.createElement('div');
            systemEvent.className = 'system-response';
            systemEvent.innerHTML = `
                <h2>System</h2>
                <p>Chat cleared.</p>
            `;
            chatMessages.appendChild(systemEvent);
            // 4) Ensure the message is in view
            chatMessages.scrollTop = chatMessages.scrollHeight;
            // 5) Stop here; don't add the user message or placeholder
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

        // Announce only the new response
        announce(`SenseUI said: ${placeholderText}`);

        // Clear input
        chatInput.value = '';
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