/**
 * Settings Manager Module
 * Handles loading, saving, and validating user settings
 * Including API keys, preferences, and custom prompts
 */

import { storeApiKey, retrieveApiKey, validateApiKeyFormat } from './encryption.js';
import { CONFIG } from './config.js';

/**
 * Loads all settings from storage
 * @returns {Promise<Object>} Settings object
 */
export async function loadSettings() {
    try {
        const result = await chrome.storage.local.get([
            CONFIG.STORAGE_KEYS.SELECTED_PROVIDER,
            CONFIG.STORAGE_KEYS.USER_SETTINGS
        ]);

        // Get stored settings or use defaults
        const settings = result[CONFIG.STORAGE_KEYS.USER_SETTINGS] || getDefaultSettings();
        settings.selectedProvider = result[CONFIG.STORAGE_KEYS.SELECTED_PROVIDER] || 'openai';

        // Check if API keys are configured (without retrieving them)
        const openaiKey = await retrieveApiKey(CONFIG.STORAGE_KEYS.OPENAI_API_KEY);
        const geminiKey = await retrieveApiKey(CONFIG.STORAGE_KEYS.GEMINI_API_KEY);
        
        settings.hasOpenAIKey = !!openaiKey;
        settings.hasGeminiKey = !!geminiKey;

        return settings;
    } catch (error) {
        console.error('Error loading settings:', error);
        return getDefaultSettings();
    }
}

/**
 * Saves settings to storage
 * @param {Object} settings - Settings to save
 * @returns {Promise<void>}
 */
export async function saveSettings(settings) {
    try {
        // Separate API keys from other settings
        const { openaiApiKey, geminiApiKey, selectedProvider, ...otherSettings } = settings;

        // Save provider selection
        if (selectedProvider) {
            await chrome.storage.local.set({
                [CONFIG.STORAGE_KEYS.SELECTED_PROVIDER]: selectedProvider
            });
        }

        // Save API keys securely
        if (openaiApiKey) {
            await storeApiKey(CONFIG.STORAGE_KEYS.OPENAI_API_KEY, openaiApiKey);
        }
        if (geminiApiKey) {
            await storeApiKey(CONFIG.STORAGE_KEYS.GEMINI_API_KEY, geminiApiKey);
        }

        // Save other settings
        await chrome.storage.local.set({
            [CONFIG.STORAGE_KEYS.USER_SETTINGS]: otherSettings
        });

        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        throw new Error('Failed to save settings');
    }
}

/**
 * Gets default settings
 * @returns {Object} Default settings
 */
export function getDefaultSettings() {
    return {
        detailLevel: 'normal',
        downloadOption: 'all',
        contextInstructions: '',
        contextFiles: [],
        selectedProvider: 'openai',
        hasOpenAIKey: false,
        hasGeminiKey: false,
        enableScreenshot: true,
        screenshotQuality: 0.8
    };
}

/**
 * Validates settings before saving
 * @param {Object} settings - Settings to validate
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateSettings(settings) {
    const errors = [];

    // Validate API keys if provided
    if (settings.openaiApiKey) {
        if (!validateApiKeyFormat(settings.openaiApiKey, 'openai')) {
            errors.push('OpenAI API key format is invalid. Should start with "sk-" and be at least 48 characters.');
        }
    }

    if (settings.geminiApiKey) {
        if (!validateApiKeyFormat(settings.geminiApiKey, 'gemini')) {
            errors.push('Gemini API key format is invalid.');
        }
    }

    // Validate detail level
    if (settings.detailLevel && !['comprehensive', 'normal', 'concise'].includes(settings.detailLevel)) {
        errors.push('Invalid detail level. Must be "comprehensive", "normal", or "concise".');
    }

    // Validate download option
    if (settings.downloadOption && !['all', 'favorites'].includes(settings.downloadOption)) {
        errors.push('Invalid download option. Must be "all" or "favorites".');
    }

    // Validate provider selection
    if (settings.selectedProvider && !['openai', 'gemini'].includes(settings.selectedProvider)) {
        errors.push('Invalid provider. Must be "openai" or "gemini".');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Clears a specific API key
 * @param {string} provider - 'openai' or 'gemini'
 * @returns {Promise<void>}
 */
export async function clearApiKey(provider) {
    const keyName = provider === 'openai' 
        ? CONFIG.STORAGE_KEYS.OPENAI_API_KEY 
        : CONFIG.STORAGE_KEYS.GEMINI_API_KEY;
    
    await chrome.storage.local.remove(keyName);
}

/**
 * Exports settings (excluding API keys for security)
 * @returns {Promise<Object>} Settings object safe for export
 */
export async function exportSettings() {
    const settings = await loadSettings();
    
    // Remove sensitive data
    delete settings.hasOpenAIKey;
    delete settings.hasGeminiKey;
    
    return {
        ...settings,
        exportDate: new Date().toISOString(),
        version: chrome.runtime.getManifest().version
    };
}

/**
 * Imports settings from a file/object
 * @param {Object} importedSettings - Settings to import
 * @returns {Promise<boolean>} Success status
 */
export async function importSettings(importedSettings) {
    try {
        // Validate imported settings
        const validation = validateSettings(importedSettings);
        if (!validation.valid) {
            throw new Error(`Invalid settings: ${validation.errors.join(', ')}`);
        }

        // Save imported settings (excluding version info)
        const { exportDate, version, ...settingsToSave } = importedSettings;
        await saveSettings(settingsToSave);
        
        return true;
    } catch (error) {
        console.error('Error importing settings:', error);
        throw error;
    }
}

/**
 * Resets all settings to defaults
 * @param {boolean} includeApiKeys - Whether to also clear API keys
 * @returns {Promise<void>}
 */
export async function resetSettings(includeApiKeys = false) {
    try {
        // Reset settings to defaults
        const defaults = getDefaultSettings();
        await chrome.storage.local.set({
            [CONFIG.STORAGE_KEYS.USER_SETTINGS]: defaults,
            [CONFIG.STORAGE_KEYS.SELECTED_PROVIDER]: 'openai'
        });

        // Optionally clear API keys
        if (includeApiKeys) {
            await chrome.storage.local.remove([
                CONFIG.STORAGE_KEYS.OPENAI_API_KEY,
                CONFIG.STORAGE_KEYS.GEMINI_API_KEY
            ]);
        }
    } catch (error) {
        console.error('Error resetting settings:', error);
        throw new Error('Failed to reset settings');
    }
}

/**
 * Checks if at least one API key is configured
 * @returns {Promise<boolean>}
 */
export async function hasApiKeyConfigured() {
    const openaiKey = await retrieveApiKey(CONFIG.STORAGE_KEYS.OPENAI_API_KEY);
    const geminiKey = await retrieveApiKey(CONFIG.STORAGE_KEYS.GEMINI_API_KEY);
    return !!(openaiKey || geminiKey);
}

/**
 * Gets the status of API key configuration
 * @returns {Promise<Object>} Status object
 */
export async function getApiKeyStatus() {
    const openaiKey = await retrieveApiKey(CONFIG.STORAGE_KEYS.OPENAI_API_KEY);
    const geminiKey = await retrieveApiKey(CONFIG.STORAGE_KEYS.GEMINI_API_KEY);
    const selectedProvider = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.SELECTED_PROVIDER);

    return {
        hasOpenAI: !!openaiKey,
        hasGemini: !!geminiKey,
        selectedProvider: selectedProvider[CONFIG.STORAGE_KEYS.SELECTED_PROVIDER] || 'openai',
        isConfigured: !!(openaiKey || geminiKey)
    };
}
