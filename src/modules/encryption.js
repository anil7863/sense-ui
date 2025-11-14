/**
 * Encryption Utility Module
 * Handles secure encryption and decryption of sensitive data (API keys)
 * Uses Web Crypto API for strong encryption
 */

/**
 * Generates a cryptographic key from a password
 * @param {string} password - The password to derive key from
 * @param {Uint8Array} salt - Salt for key derivation
 * @returns {Promise<CryptoKey>} The derived key
 */
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    // Derive an AES-GCM key
    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Gets a consistent encryption password for the extension
 * In a real implementation, this could use:
 * - User's browser profile ID
 * - Hardware-based key
 * - User-provided master password
 * 
 * For now, we use a combination of extension ID and browser session
 * @returns {Promise<string>} The encryption password
 */
async function getEncryptionPassword() {
    // Use chrome.runtime.id as part of the password
    // This makes keys unique per browser installation
    const extensionId = chrome.runtime.id;
    
    // Get or create a random session key
    let sessionKey = await chrome.storage.local.get('senseui_session_key');
    if (!sessionKey.senseui_session_key) {
        // Generate a random session key on first run
        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        sessionKey.senseui_session_key = Array.from(randomBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        await chrome.storage.local.set(sessionKey);
    }
    
    // Combine extension ID and session key
    return `${extensionId}:${sessionKey.senseui_session_key}`;
}

/**
 * Encrypts sensitive text (like API keys)
 * @param {string} plaintext - The text to encrypt
 * @returns {Promise<string>} Base64-encoded encrypted data (includes IV and salt)
 */
export async function encryptData(plaintext) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // Generate random salt and IV
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Derive encryption key
        const password = await getEncryptionPassword();
        const key = await deriveKey(password, salt);

        // Encrypt the data
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );

        // Combine salt + iv + encrypted data
        const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

        // Convert to base64 for storage
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypts encrypted text
 * @param {string} encryptedBase64 - Base64-encoded encrypted data
 * @returns {Promise<string>} The decrypted plaintext
 */
export async function decryptData(encryptedBase64) {
    try {
        // Decode from base64
        const combined = new Uint8Array(
            atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
        );

        // Extract salt, IV, and encrypted data
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const encryptedData = combined.slice(28);

        // Derive decryption key
        const password = await getEncryptionPassword();
        const key = await deriveKey(password, salt);

        // Decrypt the data
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedData
        );

        // Convert to string
        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Securely stores an API key
 * @param {string} keyName - The storage key name (e.g., 'openai_key')
 * @param {string} apiKey - The API key to store
 * @returns {Promise<void>}
 */
export async function storeApiKey(keyName, apiKey) {
    try {
        const encrypted = await encryptData(apiKey);
        await chrome.storage.local.set({ [keyName]: encrypted });
    } catch (error) {
        console.error('Error storing API key:', error);
        throw new Error('Failed to store API key securely');
    }
}

/**
 * Retrieves and decrypts an API key
 * @param {string} keyName - The storage key name (e.g., 'openai_key')
 * @returns {Promise<string|null>} The decrypted API key, or null if not found
 */
export async function retrieveApiKey(keyName) {
    try {
        const result = await chrome.storage.local.get(keyName);
        const encrypted = result[keyName];
        
        if (!encrypted) {
            return null;
        }
        
        return await decryptData(encrypted);
    } catch (error) {
        console.error('Error retrieving API key:', error);
        throw new Error('Failed to retrieve API key');
    }
}

/**
 * Removes an API key from storage
 * @param {string} keyName - The storage key name
 * @returns {Promise<void>}
 */
export async function removeApiKey(keyName) {
    try {
        await chrome.storage.local.remove(keyName);
    } catch (error) {
        console.error('Error removing API key:', error);
        throw new Error('Failed to remove API key');
    }
}

/**
 * Validates an API key format
 * @param {string} apiKey - The API key to validate
 * @param {string} provider - The provider ('openai' or 'gemini')
 * @returns {boolean} Whether the key format appears valid
 */
export function validateApiKeyFormat(apiKey, provider) {
    if (!apiKey || typeof apiKey !== 'string') {
        return false;
    }

    // Basic format validation
    switch (provider) {
        case 'openai':
            // OpenAI keys typically start with 'sk-' and are 48+ chars
            return apiKey.startsWith('sk-') && apiKey.length >= 48;
        case 'gemini':
            // Gemini keys are typically 39 characters
            return apiKey.length >= 30 && /^[A-Za-z0-9_-]+$/.test(apiKey);
        default:
            return false;
    }
}

/**
 * Tests if an API key is valid by making a simple API call
 * @param {string} apiKey - The API key to test
 * @param {string} provider - The provider ('openai' or 'gemini')
 * @returns {Promise<boolean>} Whether the key is valid
 */
export async function testApiKey(apiKey, provider) {
    // This would make a minimal API call to verify the key
    // Implementation depends on llmClient.js
    // For now, just validate format
    return validateApiKeyFormat(apiKey, provider);
}
