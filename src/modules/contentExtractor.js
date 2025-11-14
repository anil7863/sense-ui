/**
 * Content Extractor Module
 * Extracts HTML, CSS, and computed styles from the active webpage
 * This script is injected into the active tab to gather page information
 */

/**
 * Extracts the full HTML of the current page
 * @returns {string} The page's HTML
 */
function extractHTML() {
    return document.documentElement.outerHTML;
}

/**
 * Extracts all CSS rules from stylesheets and inline styles
 * @returns {string} Combined CSS content
 */
function extractCSS() {
    let cssContent = '';
    
    try {
        // Extract from stylesheets
        const styleSheets = Array.from(document.styleSheets);
        
        for (const sheet of styleSheets) {
            try {
                // Skip external stylesheets from different origins (CORS)
                if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
                    cssContent += `/* External stylesheet: ${sheet.href} - Unable to access due to CORS */\n\n`;
                    continue;
                }
                
                const rules = Array.from(sheet.cssRules || sheet.rules || []);
                for (const rule of rules) {
                    cssContent += rule.cssText + '\n';
                }
            } catch (e) {
                // Some stylesheets may be blocked by CORS
                console.warn('Could not access stylesheet:', sheet.href, e);
            }
        }
        
        // Extract inline styles
        const elementsWithInlineStyles = document.querySelectorAll('[style]');
        if (elementsWithInlineStyles.length > 0) {
            cssContent += '\n/* Inline Styles */\n';
            elementsWithInlineStyles.forEach((el, index) => {
                const selector = el.id ? `#${el.id}` : 
                                el.className ? `.${el.className.split(' ')[0]}` : 
                                `${el.tagName.toLowerCase()}[${index}]`;
                cssContent += `${selector} {\n  ${el.getAttribute('style')}\n}\n`;
            });
        }
    } catch (error) {
        console.error('Error extracting CSS:', error);
    }
    
    return cssContent;
}

/**
 * Gets computed styles for important elements
 * This provides actual rendered styles (after CSS cascade)
 * @returns {Object} Map of selectors to computed styles
 */
function extractComputedStyles() {
    const computedStyles = {};
    
    // Target important/visible elements
    const importantSelectors = [
        'body',
        'header',
        'nav',
        'main',
        'footer',
        'h1, h2, h3, h4, h5, h6',
        'p',
        'a',
        'button',
        '[role="button"]',
        'input',
        'select',
        'textarea',
        '.container',
        '[class*="container"]',
        '[class*="wrapper"]'
    ];
    
    importantSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            const computed = window.getComputedStyle(el);
            const key = `${selector}[${index}]`;
            
            // Extract key style properties
            computedStyles[key] = {
                display: computed.display,
                position: computed.position,
                width: computed.width,
                height: computed.height,
                margin: computed.margin,
                padding: computed.padding,
                fontSize: computed.fontSize,
                fontFamily: computed.fontFamily,
                fontWeight: computed.fontWeight,
                color: computed.color,
                backgroundColor: computed.backgroundColor,
                border: computed.border,
                zIndex: computed.zIndex,
                flexDirection: computed.flexDirection,
                gridTemplateColumns: computed.gridTemplateColumns
            };
        });
    });
    
    return computedStyles;
}

/**
 * Extracts page metadata
 * @returns {Object} Page metadata
 */
function extractMetadata() {
    return {
        title: document.title,
        url: window.location.href,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        },
        lang: document.documentElement.lang || 'unknown',
        charset: document.characterSet,
        description: document.querySelector('meta[name="description"]')?.content || '',
        hasFrames: window.frames.length > 0,
        elementCount: document.querySelectorAll('*').length
    };
}

/**
 * Main extraction function - gathers all page data
 * @param {Object} options - Extraction options
 * @returns {Object} All extracted page data
 */
function extractPageContent(options = {}) {
    const {
        includeHTML = true,
        includeCSS = true,
        includeComputedStyles = true,
        includeMetadata = true,
        maxHTMLLength = 100000,
        maxCSSLength = 50000
    } = options;
    
    const result = {};
    
    if (includeMetadata) {
        result.metadata = extractMetadata();
    }
    
    if (includeHTML) {
        let html = extractHTML();
        if (html.length > maxHTMLLength) {
            html = html.substring(0, maxHTMLLength) + '\n<!-- HTML truncated due to length -->';
        }
        result.html = html;
    }
    
    if (includeCSS) {
        let css = extractCSS();
        if (css.length > maxCSSLength) {
            css = css.substring(0, maxCSSLength) + '\n/* CSS truncated due to length */';
        }
        result.css = css;
    }
    
    if (includeComputedStyles) {
        result.computedStyles = extractComputedStyles();
    }
    
    return result;
}

// Export for use in extension context
// When injected as content script, this will be available globally
if (typeof window !== 'undefined') {
    window.senseUIExtractor = {
        extractPageContent,
        extractHTML,
        extractCSS,
        extractComputedStyles,
        extractMetadata
    };
}

// For ES module usage
export {
    extractPageContent,
    extractHTML,
    extractCSS,
    extractComputedStyles,
    extractMetadata
};
