/**
 * LLM Client Module
 * Handles API calls to OpenAI and Gemini
 * Provides unified interface for both providers
 */

import { CONFIG } from './config.js';
import { retrieveApiKey } from './encryption.js';

/**
 * Base class for LLM API errors
 */
export class LLMError extends Error {
    constructor(message, statusCode, provider) {
        super(message);
        this.name = 'LLMError';
        this.statusCode = statusCode;
        this.provider = provider;
    }
}

/**
 * OpenAI API Client
 */
class OpenAIClient {
    /**
     * Sends a request to OpenAI API
     * @param {Array} messages - Array of message objects {role, content}
     * @param {string} apiKey - The API key
     * @param {Object} options - Additional options
     * @returns {Promise<string>} The LLM response text
     */
    async sendRequest(messages, apiKey, options = {}) {
        const {
            model = CONFIG.API.OPENAI.MODEL,
            temperature = CONFIG.API.OPENAI.TEMPERATURE,
            maxTokens = CONFIG.API.OPENAI.MAX_TOKENS,
            stream = false
        } = options;

        try {
            const response = await fetch(CONFIG.API.OPENAI.ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    temperature: temperature,
                    max_tokens: maxTokens,
                    stream: stream
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new LLMError(
                    errorData.error?.message || `OpenAI API error: ${response.status}`,
                    response.status,
                    'openai'
                );
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new LLMError('Invalid response format from OpenAI', 500, 'openai');
            }

            return data.choices[0].message.content;
        } catch (error) {
            if (error instanceof LLMError) {
                throw error;
            }
            throw new LLMError(
                `Failed to communicate with OpenAI: ${error.message}`,
                0,
                'openai'
            );
        }
    }

    /**
     * Sends a request with vision capabilities (image analysis)
     * @param {Array} messages - Array of message objects
     * @param {string} imageDataUrl - Base64 image data URL
     * @param {string} apiKey - The API key
     * @param {Object} options - Additional options
     * @returns {Promise<string>} The LLM response text
     */
    async sendVisionRequest(messages, imageDataUrl, apiKey, options = {}) {
        const {
            model = 'gpt-4o', // Vision model
            temperature = CONFIG.API.OPENAI.TEMPERATURE,
            maxTokens = CONFIG.API.OPENAI.MAX_TOKENS
        } = options;

        // Build messages with image content
        const visionMessages = messages.map((msg, index) => {
            // Add image to the last user message
            if (index === messages.length - 1 && msg.role === 'user') {
                return {
                    role: 'user',
                    content: [
                        { type: 'text', text: msg.content },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageDataUrl,
                                detail: 'high' // or 'low' for faster/cheaper processing
                            }
                        }
                    ]
                };
            }
            return msg;
        });

        return await this.sendRequest(visionMessages, apiKey, {
            ...options,
            model
        });
    }
}

/**
 * Gemini API Client
 */
class GeminiClient {
    /**
     * Converts messages to Gemini format
     * @param {Array} messages - Array of message objects {role, content}
     * @returns {Object} Gemini-formatted request
     */
    formatMessages(messages) {
        // Gemini uses 'contents' with 'parts'
        const contents = [];
        
        for (const msg of messages) {
            const role = msg.role === 'assistant' ? 'model' : 'user';
            
            // Skip system messages (handle separately)
            if (msg.role === 'system') {
                continue;
            }
            
            contents.push({
                role: role,
                parts: [{ text: msg.content }]
            });
        }
        
        return contents;
    }

    /**
     * Sends a request to Gemini API
     * @param {Array} messages - Array of message objects {role, content}
     * @param {string} apiKey - The API key
     * @param {Object} options - Additional options
     * @returns {Promise<string>} The LLM response text
     */
    async sendRequest(messages, apiKey, options = {}) {
        const {
            model = CONFIG.API.GEMINI.MODEL,
            temperature = CONFIG.API.GEMINI.TEMPERATURE,
            maxTokens = CONFIG.API.GEMINI.MAX_TOKENS
        } = options;

        try {
            const endpoint = `${CONFIG.API.GEMINI.ENDPOINT}/${model}:generateContent?key=${apiKey}`;
            
            // Extract system message if present
            const systemMessage = messages.find(m => m.role === 'system');
            const contents = this.formatMessages(messages);

            const requestBody = {
                contents: contents,
                generationConfig: {
                    temperature: temperature,
                    maxOutputTokens: maxTokens
                }
            };

            // Add system instruction if available
            if (systemMessage) {
                requestBody.systemInstruction = {
                    parts: [{ text: systemMessage.content }]
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new LLMError(
                    errorData.error?.message || `Gemini API error: ${response.status}`,
                    response.status,
                    'gemini'
                );
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new LLMError('Invalid response format from Gemini', 500, 'gemini');
            }

            // Extract text from response
            const content = data.candidates[0].content;
            const text = content.parts.map(part => part.text).join('');
            
            return text;
        } catch (error) {
            if (error instanceof LLMError) {
                throw error;
            }
            throw new LLMError(
                `Failed to communicate with Gemini: ${error.message}`,
                0,
                'gemini'
            );
        }
    }

    /**
     * Sends a request with vision capabilities (image analysis)
     * @param {Array} messages - Array of message objects
     * @param {string} imageDataUrl - Base64 image data URL
     * @param {string} apiKey - The API key
     * @param {Object} options - Additional options
     * @returns {Promise<string>} The LLM response text
     */
    async sendVisionRequest(messages, imageDataUrl, apiKey, options = {}) {
        const {
            model = 'gemini-1.5-pro', // Vision model
            temperature = CONFIG.API.GEMINI.TEMPERATURE,
            maxTokens = CONFIG.API.GEMINI.MAX_TOKENS
        } = options;

        try {
            const endpoint = `${CONFIG.API.GEMINI.ENDPOINT}/${model}:generateContent?key=${apiKey}`;
            
            // Extract system message and convert to Gemini format
            const systemMessage = messages.find(m => m.role === 'system');
            const contents = this.formatMessages(messages);

            // Add image to the last user message
            if (contents.length > 0) {
                const lastContent = contents[contents.length - 1];
                
                // Extract base64 data and mime type from data URL
                const matches = imageDataUrl.match(/^data:(.+);base64,(.+)$/);
                if (matches) {
                    const mimeType = matches[1];
                    const base64Data = matches[2];
                    
                    lastContent.parts.push({
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    });
                }
            }

            const requestBody = {
                contents: contents,
                generationConfig: {
                    temperature: temperature,
                    maxOutputTokens: maxTokens
                }
            };

            if (systemMessage) {
                requestBody.systemInstruction = {
                    parts: [{ text: systemMessage.content }]
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new LLMError(
                    errorData.error?.message || `Gemini API error: ${response.status}`,
                    response.status,
                    'gemini'
                );
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new LLMError('Invalid response format from Gemini', 500, 'gemini');
            }

            const content = data.candidates[0].content;
            const text = content.parts.map(part => part.text).join('');
            
            return text;
        } catch (error) {
            if (error instanceof LLMError) {
                throw error;
            }
            throw new LLMError(
                `Failed to communicate with Gemini: ${error.message}`,
                0,
                'gemini'
            );
        }
    }
}

/**
 * Main LLM Client - Unified interface for all providers
 */
export class LLMClient {
    constructor() {
        this.openai = new OpenAIClient();
        this.gemini = new GeminiClient();
    }

    /**
     * Sends a request to the configured LLM provider
     * @param {string} userMessage - The user's message/prompt
     * @param {Object} context - Context data (HTML, CSS, screenshot, etc.)
     * @param {Object} options - Additional options
     * @returns {Promise<string>} The LLM response
     */
    async sendRequest(userMessage, context = {}, options = {}) {
        const {
            provider = await this.getSelectedProvider(),
            systemPrompt = CONFIG.PROMPTS.SYSTEM,
            includeScreenshot = true
        } = options;

        // Get API key
        const apiKey = await this.getApiKey(provider);
        if (!apiKey) {
            throw new LLMError('API key not configured', 401, provider);
        }

        // Build messages array
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add context information
        let contextText = '';
        if (context.metadata) {
            contextText += `\n\nPage Metadata:\n${JSON.stringify(context.metadata, null, 2)}`;
        }
        if (context.html) {
            contextText += `\n\nHTML:\n${context.html.substring(0, 50000)}`; // Limit size
        }
        if (context.css) {
            contextText += `\n\nCSS:\n${context.css.substring(0, 20000)}`; // Limit size
        }

        // Add user message with context
        messages.push({
            role: 'user',
            content: `${userMessage}\n\n${contextText}`
        });

        // Choose client and send request
        const client = provider === 'openai' ? this.openai : this.gemini;
        
        if (includeScreenshot && context.screenshot) {
            return await client.sendVisionRequest(messages, context.screenshot, apiKey, options);
        } else {
            return await client.sendRequest(messages, apiKey, options);
        }
    }

    /**
     * Gets the API key for a provider
     * @param {string} provider - 'openai' or 'gemini'
     * @returns {Promise<string|null>} The API key
     */
    async getApiKey(provider) {
        const keyName = provider === 'openai' 
            ? CONFIG.STORAGE_KEYS.OPENAI_API_KEY 
            : CONFIG.STORAGE_KEYS.GEMINI_API_KEY;
        return await retrieveApiKey(keyName);
    }

    /**
     * Gets the user's selected provider
     * @returns {Promise<string>} 'openai' or 'gemini'
     */
    async getSelectedProvider() {
        const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.SELECTED_PROVIDER);
        return result[CONFIG.STORAGE_KEYS.SELECTED_PROVIDER] || 'openai';
    }

    /**
     * Sets the selected provider
     * @param {string} provider - 'openai' or 'gemini'
     */
    async setSelectedProvider(provider) {
        await chrome.storage.local.set({ 
            [CONFIG.STORAGE_KEYS.SELECTED_PROVIDER]: provider 
        });
    }
}

// Create singleton instance
export const llmClient = new LLMClient();
