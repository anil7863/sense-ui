/**
 * Main Orchestrator Module
 * Coordinates all modules to process user requests
 */

import { CONFIG, getPromptForCommand, parseCommand } from './config.js';
import { captureScreenshot } from './screenshotCapture.js';
import { llmClient, LLMError } from './llmClient.js';
import { formatResponse, formatError, formatLoadingIndicator, createResponseSummary } from './responseFormatter.js';
import { hasApiKeyConfigured } from './settingsManager.js';

/**
 * Main function to handle user input and generate AI response
 * @param {string} userInput - The user's message or command
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Response object {html, summary, error}
 */
export async function processUserInput(userInput, options = {}) {
    const {
        includeScreenshot = true,
        includePageContent = true
    } = options;

    try {
        // Check if API key is configured
        const hasKey = await hasApiKeyConfigured();
        if (!hasKey) {
            throw new Error('No API key configured. Please add an API key in Settings.');
        }

        // Parse command
        const { command, text } = parseCommand(userInput);
        
        // Get appropriate prompt for command
        const commandPrompt = command ? getPromptForCommand(command) : CONFIG.PROMPTS.GENERAL;
        const systemPrompt = `${CONFIG.PROMPTS.SYSTEM}\n\n${commandPrompt}`;

        // Gather page context
        const context = {};

        // 1. Extract page content (HTML/CSS)
        if (includePageContent) {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                if (tab && tab.id) {
                    // Inject content extractor and execute
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['modules/contentExtractor.js']
                    });

                    // Extract page content
                    const [result] = await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            if (window.senseUIExtractor) {
                                return window.senseUIExtractor.extractPageContent({
                                    maxHTMLLength: 100000,
                                    maxCSSLength: 50000
                                });
                            }
                            return null;
                        }
                    });

                    if (result && result.result) {
                        context.metadata = result.result.metadata;
                        context.html = result.result.html;
                        context.css = result.result.css;
                    }
                }
            } catch (error) {
                console.error('Error extracting page content:', error);
                // Continue without page content
            }
        }

        // 2. Capture screenshot
        if (includeScreenshot) {
            try {
                context.screenshot = await captureScreenshot({ fullPage: true });
            } catch (error) {
                console.error('Error capturing screenshot:', error);
                // Continue without screenshot
            }
        }

        // 3. Build the user message
        const userMessage = text || userInput;

        // 4. Send to LLM
        const responseText = await llmClient.sendRequest(userMessage, context, {
            systemPrompt: systemPrompt,
            includeScreenshot: !!context.screenshot
        });

        // 5. Format response
        const responseHTML = formatResponse(responseText, {
            headingText: 'SenseUI said:',
            includeHeading: true,
            addCopyButton: true,
            addFavoriteButton: true
        });

        // Create summary for screen reader announcement
        const summary = createResponseSummary(responseText);

        return {
            html: responseHTML,
            summary: `SenseUI said: ${summary}`,
            error: null
        };

    } catch (error) {
        console.error('Error processing user input:', error);
        
        // Format error message
        const errorHTML = formatError(error);
        
        return {
            html: errorHTML,
            summary: `Error: ${error.message}`,
            error: error
        };
    }
}

/**
 * Creates a loading indicator
 * @param {string} message - Loading message
 * @returns {Object} Response object
 */
export function createLoadingResponse(message = 'Analyzing page...') {
    return {
        html: formatLoadingIndicator(message),
        summary: message,
        error: null
    };
}

/**
 * Validates that the extension is ready to process requests
 * @returns {Promise<Object>} {ready: boolean, message: string}
 */
export async function checkReadiness() {
    // Check if API key is configured
    const hasKey = await hasApiKeyConfigured();
    if (!hasKey) {
        return {
            ready: false,
            message: 'Please configure an API key in Settings before using SenseUI.'
        };
    }

    // Check if we have an active tab
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) {
            return {
                ready: false,
                message: 'No active tab found. Please open a webpage to analyze.'
            };
        }
    } catch (error) {
        return {
            ready: false,
            message: 'Unable to access active tab. Please try again.'
        };
    }

    return {
        ready: true,
        message: 'Ready'
    };
}
