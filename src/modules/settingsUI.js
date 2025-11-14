/**
 * Settings UI Script
 * Handles the settings page interactions
 */

import { loadSettings, saveSettings, validateSettings, clearApiKey, getApiKeyStatus } from './settingsManager.js';

// Get form elements
const form = document.getElementById('settings-form');
const providerSelect = document.getElementById('provider-select');
const openaiKeyInput = document.getElementById('openai-key');
const geminiKeyInput = document.getElementById('gemini-key');
const clearOpenAIBtn = document.getElementById('clear-openai-key');
const clearGeminiBtn = document.getElementById('clear-gemini-key');
const statusDiv = document.getElementById('settings-status');
const openaiStatus = document.getElementById('openai-status');
const geminiStatus = document.getElementById('gemini-status');

// Other form fields
const detailComprehensive = document.getElementById('detail-comprehensive');
const detailNormal = document.getElementById('detail-normal');
const detailConcise = document.getElementById('detail-concise');
const downloadAll = document.getElementById('download-all');
const downloadFavorites = document.getElementById('download-favorites');
const contextText = document.getElementById('context-text');

/**
 * Shows a status message
 */
function showStatus(message, isError = false) {
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = isError ? 'error-message' : 'success-message';
        statusDiv.classList.remove('visually-hidden');
        
        // Hide after 5 seconds
        setTimeout(() => {
            statusDiv.classList.add('visually-hidden');
        }, 5000);
    }
}

/**
 * Updates API key status indicators
 */
async function updateApiKeyStatus() {
    const status = await getApiKeyStatus();
    
    // Update OpenAI status
    if (status.hasOpenAI) {
        openaiStatus.textContent = '✓ Key configured';
        openaiStatus.className = 'hint success-text';
        clearOpenAIBtn.style.display = 'inline-block';
        openaiKeyInput.placeholder = '••••••••••••••••';
    } else {
        openaiStatus.textContent = 'No key configured';
        openaiStatus.className = 'hint';
        clearOpenAIBtn.style.display = 'none';
        openaiKeyInput.placeholder = 'sk-...';
    }
    
    // Update Gemini status
    if (status.hasGemini) {
        geminiStatus.textContent = '✓ Key configured';
        geminiStatus.className = 'hint success-text';
        clearGeminiBtn.style.display = 'inline-block';
        geminiKeyInput.placeholder = '••••••••••••••••';
    } else {
        geminiStatus.textContent = 'No key configured';
        geminiStatus.className = 'hint';
        clearGeminiBtn.style.display = 'none';
        geminiKeyInput.placeholder = 'Your Gemini API key';
    }
    
    // Set selected provider
    providerSelect.value = status.selectedProvider;
}

/**
 * Loads and displays current settings
 */
async function loadCurrentSettings() {
    try {
        const settings = await loadSettings();
        
        // Set detail level
        if (settings.detailLevel === 'comprehensive') {
            detailComprehensive.checked = true;
        } else if (settings.detailLevel === 'concise') {
            detailConcise.checked = true;
        } else {
            detailNormal.checked = true;
        }
        
        // Set download option
        if (settings.downloadOption === 'favorites') {
            downloadFavorites.checked = true;
        } else {
            downloadAll.checked = true;
        }
        
        // Set context instructions
        if (settings.contextInstructions) {
            contextText.value = settings.contextInstructions;
        }
        
        // Update API key status
        await updateApiKeyStatus();
        
    } catch (error) {
        console.error('Error loading settings:', error);
        showStatus('Failed to load settings', true);
    }
}

/**
 * Handles form submission
 */
async function handleSubmit(event) {
    event.preventDefault();
    
    try {
        // Gather form data
        const formData = new FormData(form);
        const settings = {};
        
        // Get detail level
        const detailLevel = formData.get('detail');
        if (detailLevel) {
            settings.detailLevel = detailLevel;
        }
        
        // Get download option
        const downloadOption = formData.get('download');
        if (downloadOption) {
            settings.downloadOption = downloadOption;
        }
        
        // Get context instructions
        settings.contextInstructions = formData.get('context') || '';
        
        // Get provider selection
        settings.selectedProvider = formData.get('provider') || 'openai';
        
        // Get API keys (only if they were entered)
        const openaiKey = openaiKeyInput.value.trim();
        const geminiKey = geminiKeyInput.value.trim();
        
        if (openaiKey && openaiKey !== '••••••••••••••••') {
            settings.openaiApiKey = openaiKey;
        }
        
        if (geminiKey && geminiKey !== '••••••••••••••••') {
            settings.geminiApiKey = geminiKey;
        }
        
        // Validate settings
        const validation = validateSettings(settings);
        if (!validation.valid) {
            showStatus(`Validation errors: ${validation.errors.join(', ')}`, true);
            return;
        }
        
        // Save settings
        await saveSettings(settings);
        
        // Clear password fields
        openaiKeyInput.value = '';
        geminiKeyInput.value = '';
        
        // Update status display
        await updateApiKeyStatus();
        
        showStatus('Settings saved successfully!');
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showStatus(`Failed to save settings: ${error.message}`, true);
    }
}

/**
 * Handles clearing OpenAI key
 */
async function handleClearOpenAI() {
    if (confirm('Are you sure you want to clear your OpenAI API key?')) {
        try {
            await clearApiKey('openai');
            openaiKeyInput.value = '';
            await updateApiKeyStatus();
            showStatus('OpenAI API key cleared');
        } catch (error) {
            showStatus('Failed to clear OpenAI key', true);
        }
    }
}

/**
 * Handles clearing Gemini key
 */
async function handleClearGemini() {
    if (confirm('Are you sure you want to clear your Gemini API key?')) {
        try {
            await clearApiKey('gemini');
            geminiKeyInput.value = '';
            await updateApiKeyStatus();
            showStatus('Gemini API key cleared');
        } catch (error) {
            showStatus('Failed to clear Gemini key', true);
        }
    }
}

// Event listeners
form.addEventListener('submit', handleSubmit);
clearOpenAIBtn.addEventListener('click', handleClearOpenAI);
clearGeminiBtn.addEventListener('click', handleClearGemini);

// Load settings on page load
loadCurrentSettings();
