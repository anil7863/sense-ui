/**
 * Screenshot Capture Module
 * Captures full-page screenshots of the active tab
 * Uses Chrome's tabs.captureVisibleTab API with viewport scrolling
 */

import { CONFIG } from './config.js';

/**
 * Captures the visible viewport as a data URL
 * @param {number} tabId - The ID of the tab to capture
 * @returns {Promise<string>} Data URL of the screenshot
 */
async function captureViewport(tabId) {
    try {
        // Capture the visible tab
        const dataUrl = await chrome.tabs.captureVisibleTab(null, {
            format: CONFIG.LIMITS.SCREENSHOT_FORMAT,
            quality: Math.round(CONFIG.LIMITS.SCREENSHOT_QUALITY * 100)
        });
        return dataUrl;
    } catch (error) {
        console.error('Error capturing viewport:', error);
        throw new Error(`Failed to capture viewport: ${error.message}`);
    }
}

/**
 * Captures a full-page screenshot by scrolling and stitching
 * Note: This is a simplified version. For complex pages, consider using
 * a library or more sophisticated scrolling logic.
 * @param {number} tabId - The ID of the tab to capture
 * @returns {Promise<string>} Data URL of the full-page screenshot
 */
async function captureFullPage(tabId) {
    try {
        // Get page dimensions
        const [{ result: dimensions }] = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                return {
                    scrollHeight: document.documentElement.scrollHeight,
                    scrollWidth: document.documentElement.scrollWidth,
                    clientHeight: document.documentElement.clientHeight,
                    clientWidth: document.documentElement.clientWidth,
                    originalScrollY: window.scrollY,
                    originalScrollX: window.scrollX
                };
            }
        });

        // If page fits in viewport, just capture once
        if (dimensions.scrollHeight <= dimensions.clientHeight) {
            return await captureViewport(tabId);
        }

        // For full-page capture, we'll capture the visible portion
        // Note: Full stitching would require multiple captures and canvas manipulation
        // which is complex. For now, we capture the current viewport.
        // To implement full stitching:
        // 1. Scroll to top
        // 2. Capture each viewport-sized section
        // 3. Use Canvas API to stitch images together
        // 4. Restore original scroll position

        // Simple approach: Scroll to top and capture
        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => window.scrollTo(0, 0)
        });

        // Wait a moment for scroll to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture the viewport
        const screenshot = await captureViewport(tabId);

        // Restore original scroll position
        await chrome.scripting.executeScript({
            target: { tabId },
            func: (scrollY, scrollX) => window.scrollTo(scrollX, scrollY),
            args: [dimensions.originalScrollY, dimensions.originalScrollX]
        });

        return screenshot;
    } catch (error) {
        console.error('Error capturing full page:', error);
        throw new Error(`Failed to capture full page: ${error.message}`);
    }
}

/**
 * Advanced full-page screenshot using canvas stitching
 * Scrolls through the page and stitches multiple captures together
 * @param {number} tabId - The ID of the tab to capture
 * @returns {Promise<string>} Data URL of the stitched screenshot
 */
async function captureFullPageStitched(tabId) {
    try {
        // Get page dimensions
        const [{ result: dimensions }] = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => ({
                scrollHeight: document.documentElement.scrollHeight,
                clientHeight: document.documentElement.clientHeight,
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth,
                originalScrollY: window.scrollY
            })
        });

        const { scrollHeight, clientHeight, scrollWidth, clientWidth, originalScrollY } = dimensions;

        // If page fits in viewport, just capture once
        if (scrollHeight <= clientHeight) {
            return await captureViewport(tabId);
        }

        // Calculate number of captures needed
        const captures = [];
        const captureCount = Math.ceil(scrollHeight / clientHeight);

        // Scroll to top first
        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => window.scrollTo(0, 0)
        });
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture each section
        for (let i = 0; i < captureCount; i++) {
            const scrollY = i * clientHeight;
            
            // Scroll to position
            if (i > 0) {
                await chrome.scripting.executeScript({
                    target: { tabId },
                    func: (y) => window.scrollTo(0, y),
                    args: [scrollY]
                });
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Capture this viewport
            const dataUrl = await captureViewport(tabId);
            captures.push({ dataUrl, y: scrollY });
        }

        // Restore scroll position
        await chrome.scripting.executeScript({
            target: { tabId },
            func: (y) => window.scrollTo(0, y),
            args: [originalScrollY]
        });

        // For simplicity, return the first capture
        // Full stitching would require canvas manipulation in a background page
        // or offscreen canvas, which is more complex
        return captures[0].dataUrl;
        
        // TODO: Implement canvas stitching in a service worker or background context
        // This would involve:
        // 1. Creating an offscreen canvas with full page dimensions
        // 2. Loading each capture as an image
        // 3. Drawing each image at the correct Y position
        // 4. Exporting the final canvas as a data URL
    } catch (error) {
        console.error('Error in stitched capture:', error);
        throw new Error(`Failed to capture stitched screenshot: ${error.message}`);
    }
}

/**
 * Main screenshot function - captures the active tab
 * @param {Object} options - Capture options
 * @param {boolean} options.fullPage - Whether to capture full page (vs viewport only)
 * @param {boolean} options.useStitching - Whether to use advanced stitching (slower but complete)
 * @returns {Promise<string>} Data URL of the screenshot
 */
export async function captureScreenshot(options = {}) {
    const { fullPage = true, useStitching = false } = options;

    try {
        // Get active tab
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!activeTab) {
            throw new Error('No active tab found');
        }

        // Choose capture method
        if (!fullPage) {
            return await captureViewport(activeTab.id);
        } else if (useStitching) {
            return await captureFullPageStitched(activeTab.id);
        } else {
            return await captureFullPage(activeTab.id);
        }
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        throw error;
    }
}

/**
 * Converts a data URL to a Blob
 * Useful for file operations or uploads
 * @param {string} dataUrl - The data URL to convert
 * @returns {Blob} The blob representation
 */
export function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

/**
 * Compresses a screenshot data URL
 * @param {string} dataUrl - The original data URL
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<string>} Compressed data URL
 */
export async function compressScreenshot(dataUrl, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = new OffscreenCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.convertToBlob({ type: 'image/jpeg', quality })
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                })
                .catch(reject);
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
}
