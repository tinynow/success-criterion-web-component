import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const componentPath = join(__dirname, '..', 'success-criterion.js');
const componentCode = readFileSync(componentPath, 'utf-8');

/**
 * Creates a fresh DOM environment with the actual component registered.
 */
export function createDOM() {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'http://localhost',
        runScripts: 'dangerously'
    });

    // Execute the actual component code in jsdom
    const script = dom.window.document.createElement('script');
    script.textContent = componentCode;
    dom.window.document.head.appendChild(script);

    return {
        window: dom.window,
        document: dom.window.document,
        cleanup: () => dom.window.close()
    };
}

/**
 * Helper to create a component element with attributes.
 */
export function createElement(document, attributes = {}) {
    const el = document.createElement('success-criterion');
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    return el;
}
