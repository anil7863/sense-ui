/**
 * Configuration file for SenseUI
 * Contains API endpoints, prompts, and system constants
 */

export const CONFIG = {
    // API Configuration
    API: {
        OPENAI: {
            ENDPOINT: 'https://api.openai.com/v1/chat/completions',
            MODEL: 'gpt-4o', // or 'gpt-4-turbo', 'gpt-3.5-turbo'
            MAX_TOKENS: 2000,
            TEMPERATURE: 0.7
        },
        GEMINI: {
            ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
            MODEL: 'gemini-1.5-pro', // or 'gemini-1.5-flash'
            MAX_TOKENS: 2000,
            TEMPERATURE: 0.7
        }
    },

    // Storage keys
    STORAGE_KEYS: {
        OPENAI_API_KEY: 'senseui_openai_key',
        GEMINI_API_KEY: 'senseui_gemini_key',
        SELECTED_PROVIDER: 'senseui_provider', // 'openai' or 'gemini'
        USER_SETTINGS: 'senseui_settings'
    },

    // System prompts - PLACEHOLDER: Customize these for your use case
    PROMPTS: {
        // General system prompt used for all interactions
        SYSTEM: `You are SenseUI, an AI assistant designed to help blind and visually impaired developers understand and improve web page designs. 
You analyze HTML structure, CSS styling, and visual screenshots to provide detailed accessibility and design feedback.

PLACEHOLDER: Replace this with your custom system instructions.

Guidelines:
- Be clear, concise, and constructive
- Focus on accessibility issues and visual design problems
- Provide actionable recommendations
- Use proper formatting (headings, lists, code blocks where appropriate)
- Prioritize issues by severity`,

        // Command-specific prompt for /describe
        DESCRIBE: `Analyze the provided webpage and give a comprehensive description of its visual design and structure.

PLACEHOLDER: Replace this with your custom /describe command instructions.

Focus on:
1. Overall layout and visual hierarchy
2. Color scheme and contrast
3. Typography (fonts, sizes, spacing)
4. Component placement and alignment
5. Responsive design elements
6. Notable design patterns or frameworks used

Provide the description in a structured format with clear headings and bullet points.`,

        // Command-specific prompt for /issues
        ISSUES: `Identify and list all accessibility and design issues on the provided webpage.

PLACEHOLDER: Replace this with your custom /issues command instructions.

Categorize issues by:
1. **Critical Accessibility Issues** (WCAG violations, screen reader problems)
2. **Design Consistency Issues** (spacing, alignment, visual hierarchy)
3. **Usability Issues** (contrast, readability, navigation)
4. **Code Quality Issues** (semantic HTML, CSS best practices)

For each issue:
- Describe the problem clearly
- Explain why it's problematic (especially for blind/VI users)
- Suggest specific fixes with code examples where helpful
- Rate severity: Critical, High, Medium, or Low

Present findings in a structured list format.`,

        // General chat prompt (when no command is used)
        GENERAL: `The user is asking a general question about the webpage. Provide a helpful, accurate response based on the HTML, CSS, and screenshot data provided.

PLACEHOLDER: This is used for freeform questions. Customize as needed.

Be conversational but informative. Use the webpage context to give specific, relevant answers.`
    },

    // Maximum sizes for data extraction
    LIMITS: {
        MAX_HTML_LENGTH: 100000, // characters
        MAX_CSS_LENGTH: 50000,   // characters
        SCREENSHOT_QUALITY: 0.8,  // JPEG quality (0-1)
        SCREENSHOT_FORMAT: 'jpeg' // 'jpeg' or 'png'
    }
};

// Helper to get the current prompt based on command
export function getPromptForCommand(command) {
    switch (command) {
        case '/describe':
            return CONFIG.PROMPTS.DESCRIBE;
        case '/issues':
            return CONFIG.PROMPTS.ISSUES;
        default:
            return CONFIG.PROMPTS.GENERAL;
    }
}

// Helper to determine which command is being used
export function parseCommand(userInput) {
    const trimmed = userInput.trim();
    if (trimmed.startsWith('/describe')) {
        return { command: '/describe', text: trimmed.replace('/describe', '').trim() };
    }
    if (trimmed.startsWith('/issues')) {
        return { command: '/issues', text: trimmed.replace('/issues', '').trim() };
    }
    return { command: null, text: trimmed };
}
