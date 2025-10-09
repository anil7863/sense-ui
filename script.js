
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

// Hide intro section when user starts messaging
const introSection = document.querySelector('.intro');
let introHidden = false;
function hideIntro() {
    if (introSection && !introHidden) {
        introSection.style.display = 'none';
        introHidden = true;
    }
}

// Dropdown for slash commands
const slashOptions = [
    "generate visual description",
    "identify design issues",
    "give recommendations"
];

// Create dropdown element
const dropdown = document.createElement('ul');
dropdown.className = 'slash-dropdown';
dropdown.style.display = 'none';
dropdown.style.position = 'absolute';
dropdown.style.zIndex = '1000';
dropdown.style.background = '#222';
dropdown.style.color = '#fff';
dropdown.style.listStyle = 'none';
dropdown.style.margin = '0';
dropdown.style.padding = '0';
dropdown.style.border = '1px solid #444';
dropdown.style.borderRadius = '4px';
dropdown.style.minWidth = '220px';
dropdown.style.fontSize = '1rem';
document.body.appendChild(dropdown);

function showDropdown() {
    dropdown.innerHTML = '';
    slashOptions.forEach((option, idx) => {
        const li = document.createElement('li');
        li.textContent = option;
        li.tabIndex = 0;
        li.style.padding = '8px 12px';
        li.style.cursor = 'pointer';
        li.addEventListener('mousedown', (e) => {
            e.preventDefault();
            selectOption(option);
        });
        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                selectOption(option);
            }
        });
        li.addEventListener('mouseover', () => {
            li.style.background = '#444';
        });
        li.addEventListener('mouseout', () => {
            li.style.background = 'none';
        });
        dropdown.appendChild(li);
    });
    const rect = chatInput.getBoundingClientRect();
    // Position above the input instead of below
    dropdown.style.left = rect.left + window.scrollX + 'px';
    dropdown.style.top = (rect.top + window.scrollY - dropdown.offsetHeight - 100) + 'px';
    dropdown.style.display = 'block';
}

function hideDropdown() {
    dropdown.style.display = 'none';
}


function selectOption(option) {
    hideDropdown();
    chatInput.value = '';
    hideIntro();
    addMessage(option, 'user');
    setTimeout(() => {
        addMessage('Sense: ' + option, 'bot');
    }, 600);
    chatInput.focus();
}


function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${sender}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}



chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (dropdown.style.display === 'block') {
        // If dropdown is open, do nothing (force user to select option)
        return;
    }
    const userMsg = chatInput.value.trim();
    if (userMsg) {
        hideIntro();
        addMessage(userMsg, 'user');
        // Simulate bot reply
        setTimeout(() => {
            addMessage('Sense: ' + userMsg, 'bot');
        }, 600);
        chatInput.value = '';
        chatInput.focus();
    }
});

chatInput.addEventListener('input', function(e) {
    if (chatInput.value === '/') {
        showDropdown();
    } else {
        hideDropdown();
    }
});

// Hide dropdown on click outside
document.addEventListener('mousedown', function(e) {
    if (!dropdown.contains(e.target) && e.target !== chatInput) {
        hideDropdown();
    }
});

// Keyboard navigation for dropdown
chatInput.addEventListener('keydown', function(e) {
    if (dropdown.style.display === 'block') {
        const items = Array.from(dropdown.children);
        const active = document.activeElement;
        let idx = items.indexOf(active);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (idx < 0 || idx === items.length - 1) {
                items[0].focus();
            } else {
                items[idx + 1].focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (idx <= 0) {
                items[items.length - 1].focus();
            } else {
                items[idx - 1].focus();
            }
        } else if (e.key === 'Escape') {
            hideDropdown();
            chatInput.focus();
        }
    }
});