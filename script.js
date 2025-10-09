
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
dropdown.style.padding =