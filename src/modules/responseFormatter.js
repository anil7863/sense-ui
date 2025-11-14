/**
 * Response Formatter Module
 * Formats LLM responses into structured, accessible HTML
 * Converts markdown to HTML with proper semantic structure
 */

/**
 * Simple markdown to HTML converter with accessibility features
 * Handles: headings, lists, code blocks, bold, italic, links
 * @param {string} markdown - The markdown text to convert
 * @returns {string} HTML string
 */
export function markdownToHTML(markdown) {
    if (!markdown) return '';

    let html = markdown;

    // Escape HTML entities first (but preserve markdown)
    html = html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');

    // Code blocks (```)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang ? ` class="language-${lang}"` : '';
        return `<pre><code${language}>${code.trim()}</code></pre>`;
    });

    // Inline code (`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headings (## Heading)
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>'); // Treat # as h2 for better hierarchy

    // Bold (**text** or __text__)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Unordered lists (- item or * item)
    html = html.replace(/^\s*[-*]\s+(.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Ordered lists (1. item)
    html = html.replace(/^\s*\d+\.\s+(.+)$/gim, '<li>$1</li>');
    // This is simplistic - a better parser would group consecutive list items

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph if not already in a block element
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<pre')) {
        html = `<p>${html}</p>`;
    }

    return html;
}

/**
 * Enhanced formatter that structures the response with ARIA labels
 * @param {string} responseText - Raw LLM response text
 * @param {Object} options - Formatting options
 * @returns {string} Formatted HTML
 */
export function formatResponse(responseText, options = {}) {
    const {
        includeHeading = true,
        headingText = 'SenseUI Response',
        addCopyButton = true,
        addFavoriteButton = true,
        responseId = `response-${Date.now()}`
    } = options;

    // Convert markdown to HTML
    const contentHTML = markdownToHTML(responseText);

    // Build the response container
    let html = '<div class="system-response" role="article">';

    // Add heading if requested
    if (includeHeading) {
        html += `<h2>${headingText}</h2>`;
    }

    // Add the main content
    html += `<div class="response-content" id="${responseId}">${contentHTML}</div>`;

    // Add action buttons
    html += '<div class="response-actions">';
    
    if (addCopyButton) {
        html += `<button class="copy-button" data-target="${responseId}" aria-label="Copy response to clipboard">
            Copy to clipboard
        </button>`;
    }
    
    if (addFavoriteButton) {
        html += `<button class="favorite-button" data-target="${responseId}" aria-label="Mark this response as favorite">
            Mark as favorite
        </button>`;
    }
    
    html += '</div>'; // close response-actions
    html += '</div>'; // close system-response

    return html;
}

/**
 * Formats an error message for display
 * @param {Error} error - The error object
 * @returns {string} Formatted HTML error message
 */
export function formatError(error) {
    const errorMessage = error.message || 'An unexpected error occurred';
    const errorType = error.name || 'Error';

    return `
        <div class="system-response error-response" role="alert">
            <h2>Error</h2>
            <div class="error-content">
                <p><strong>${errorType}:</strong> ${errorMessage}</p>
                ${error.statusCode ? `<p>Status code: ${error.statusCode}</p>` : ''}
                ${error.provider ? `<p>Provider: ${error.provider}</p>` : ''}
            </div>
            <p>Please check your settings and try again. If the problem persists, check the console for more details.</p>
        </div>
    `;
}

/**
 * Formats a loading/thinking indicator
 * @param {string} message - Loading message
 * @returns {string} Formatted HTML
 */
export function formatLoadingIndicator(message = 'Analyzing...') {
    return `
        <div class="system-response loading-response" role="status" aria-live="polite">
            <h2>SenseUI</h2>
            <div class="loading-content">
                <p>${message}</p>
                <div class="spinner" aria-hidden="true"></div>
            </div>
        </div>
    `;
}

/**
 * Extracts plain text from HTML (for announcements)
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export function htmlToPlainText(html) {
    // Remove HTML tags
    let text = html.replace(/<[^>]+>/g, ' ');
    
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    text = textarea.value;
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Limit length for screen reader announcements
    if (text.length > 200) {
        text = text.substring(0, 197) + '...';
    }
    
    return text;
}

/**
 * Creates a summary of the response for screen reader announcement
 * @param {string} responseText - The full response text
 * @returns {string} Summary text
 */
export function createResponseSummary(responseText) {
    // Get first sentence or first 150 characters
    const firstSentence = responseText.split(/[.!?]/)[0];
    
    if (firstSentence.length <= 150) {
        return firstSentence;
    }
    
    return responseText.substring(0, 147) + '...';
}

/**
 * Highlights code snippets in the response
 * Simple syntax highlighting for common languages
 * @param {string} code - Code string
 * @param {string} language - Programming language
 * @returns {string} HTML with syntax highlighting classes
 */
export function highlightCode(code, language) {
    // This is a simple implementation
    // For production, consider using a library like Prism.js or highlight.js
    
    if (language === 'css') {
        // Simple CSS highlighting
        return code
            .replace(/([\w-]+):/g, '<span class="property">$1</span>:')
            .replace(/:(.*?);/g, ':<span class="value">$1</span>;')
            .replace(/\/\*.*?\*\//g, '<span class="comment">$&</span>');
    }
    
    if (language === 'html') {
        // Already escaped, just add semantic classes
        return code;
    }
    
    if (language === 'javascript' || language === 'js') {
        // Simple JS highlighting
        const keywords = ['const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'return'];
        let highlighted = code;
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
        });
        return highlighted;
    }
    
    return code;
}

/**
 * Formats a structured analysis response with sections
 * Useful for /describe and /issues commands
 * @param {Object} sections - Object with section titles as keys and content as values
 * @returns {string} Formatted HTML
 */
export function formatStructuredResponse(sections) {
    let html = '<div class="structured-response">';
    
    for (const [title, content] of Object.entries(sections)) {
        html += `
            <section class="response-section">
                <h3>${title}</h3>
                ${markdownToHTML(content)}
            </section>
        `;
    }
    
    html += '</div>';
    return html;
}

/**
 * Adds action button event listeners
 * Call this after adding formatted responses to the DOM
 * @param {HTMLElement} container - Container element with responses
 */
export function attachResponseActions(container) {
    // Copy button handler
    const copyButtons = container.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const targetId = button.getAttribute('data-target');
            const content = document.getElementById(targetId);
            
            if (content) {
                const text = content.innerText || content.textContent;
                try {
                    await navigator.clipboard.writeText(text);
                    button.textContent = 'Copied!';
                    button.setAttribute('aria-label', 'Copied to clipboard');
                    setTimeout(() => {
                        button.textContent = 'Copy to clipboard';
                        button.setAttribute('aria-label', 'Copy response to clipboard');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                    button.textContent = 'Copy failed';
                }
            }
        });
    });

    // Favorite button handler (basic implementation)
    const favoriteButtons = container.querySelectorAll('.favorite-button');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const isFavorited = button.classList.toggle('favorited');
            button.textContent = isFavorited ? 'Remove from favorites' : 'Mark as favorite';
            button.setAttribute('aria-label', 
                isFavorited ? 'Remove this response from favorites' : 'Mark this response as favorite'
            );
            
            // TODO: Persist favorite status in chrome.storage
            const targetId = button.getAttribute('data-target');
            console.log(`Response ${targetId} ${isFavorited ? 'added to' : 'removed from'} favorites`);
        });
    });
}
