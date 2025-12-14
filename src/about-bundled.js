/**
 * About Page Script
 */

// Handle opening Chrome shortcuts page
const shortcutsBtn = document.getElementById('open-shortcuts-about');
if (shortcutsBtn) {
    shortcutsBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
}
