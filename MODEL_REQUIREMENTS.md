# Model requirements for SenseUI

This document specifies the capabilities an AI model must provide in order to work with SenseUI.

## 1. Core capabilities

- Supports a chat-style interface where the model receives a single combined prompt (system instructions + user message + page context) and returns a single text response.
- Reliably follows detailed instructions about response structure and formatting (for example, no HTML tags, specific markdown headings and bullet rules, no tables, no bold/italic).
- Can reason over web UI concepts (layout, hierarchy, typography, color, spacing, accessibility) and translate them into concrete, actionable design feedback.

## 2. Input and context handling

- Accepts long-text prompts that may include:
  - Page metadata (title and URL),
  - Truncated HTML source (up to tens of thousands of characters),
  - Truncated CSS (up to tens of thousands of characters),
  - The user’s question and SenseUI’s system prompt.
- Supports multimodal input:
  - Joint processing of text and at least one screenshot (viewport or full-page) in a single request.
  - For OpenAI-compatible APIs: `image_url` content within a chat completion request.
  - For Gemini-compatible APIs: text plus `inlineData` image parts in a `generateContent` request.

## 3. Output format and behavior

- Produces plain-text responses using markdown
- Avoids:
  - HTML tags of any kind in the output.
  - Tables, bold, italic text, and emojis when instructed not to use them.

## 4. Design and accessibility reasoning

- Interprets HTML and CSS to:
  - Identify layout, alignment, spacing, and consistency issues.
  - Assess readability (font size, line height, text density, line length, alignment).
  - Reason about color contrast and accessibility (for example, alignment with WCAG-style expectations).
- Grounds all claims in the provided HTML, CSS, and/or screenshot:
  - Does not fabricate unverifiable measurements.
  - Clearly indicates uncertainty when information is missing or ambiguous.
  - May provide improvement suggestions even when no critical issues are present.

## 5. Language handling

- Uses English by default.
- Switches to another language only when the current user message is entirely in that language.
- Preserves the same level of technical detail, structure, and formatting rules across languages.

## 6. API and operational constraints

- Exposes an HTTPS JSON API compatible with one of:
  - OpenAI-style `chat/completions` endpoints with role-based messages and optional `image_url` parts.
  - Google Gemini-style `generateContent` endpoints with text and `inlineData` image parts.
- Returns a single primary text answer in a stable response field:
  - For OpenAI-compatible APIs: `choices[0].message.content`.
  - For Gemini-compatible APIs: concatenated `candidates[0].content.parts[].text`.
- Supports:
  - Configurable model name and basic generation parameters (for example, temperature, max tokens).
  - Non-streaming responses (SenseUI waits for the full response).
  - Sufficient context length to handle the combined system prompt, user query, HTML/CSS excerpts, and screenshot description.

## 7. Performance, Safety, and Reliability

- Latency suitable for interactive use in a browser extension (ideally responses within a few seconds under normal conditions).
- Predictable behavior under token limits (for example, truncation or explicit finish reasons rather than silent failure).
- Robust to malformed or incomplete page data, returning a clear, safe error or a best-effort analysis rather than crashing.
- Adheres to provider-level safety policies while still allowing detailed technical feedback on web designs and accessibility.
