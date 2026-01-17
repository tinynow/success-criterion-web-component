#!/usr/bin/env node

/**
 * Fetches the latest WCAG 2.2 data from the official W3C source
 * and generates success-criterion.js with embedded data.
 *
 * Usage: node scripts/update-wcag-data.js
 *        npm run update-data
 */

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get } from 'node:https';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WCAG_URL = 'https://www.w3.org/WAI/WCAG22/wcag.json';
const TEMPLATE_PATH = join(__dirname, '..', 'src', 'component.js');
const OUTPUT_PATH = join(__dirname, '..', 'success-criterion.js');
const OUTPUT_MIN_PATH = join(__dirname, '..', 'success-criterion.min.js');
const PLACEHOLDER = '/* WCAG_DATA_PLACEHOLDER */[]';

function fetch(url) {
    return new Promise((resolve, reject) => {
        get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}: Failed to fetch ${url}`));
                return;
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

function minifyJS(code) {
    // Simple minification: collapse whitespace, preserve strings
    return code
        // Remove single-line comments (but not URLs)
        .replace(/(?<!:)\/\/(?![^\n]*['"`]).*$/gm, '')
        // Collapse multiple spaces/newlines to single space
        .replace(/\s+/g, ' ')
        // Remove spaces around operators and punctuation
        .replace(/\s*([{}();,:<>+=\-*/&|!?])\s*/g, '$1')
        // Restore necessary spaces
        .replace(/\b(const|let|var|return|if|else|for|while|function|class|extends|new|typeof|instanceof)\b/g, ' $1 ')
        .replace(/^\s+/, '')
        .trim();
}

async function main() {
    console.log('Fetching WCAG 2.2 data from W3C...');

    try {
        const data = await fetch(WCAG_URL);
        const wcag = JSON.parse(data);

        // Validate structure
        if (!wcag.principles || !Array.isArray(wcag.principles)) {
            throw new Error('Invalid WCAG data structure: expected principles array');
        }

        // Extract just the success criteria with the fields we need
        const criteria = [];
        for (const principle of wcag.principles) {
            for (const guideline of principle.guidelines || []) {
                for (const sc of guideline.successcriteria || []) {
                    criteria.push({
                        num: sc.num,
                        id: sc.id,
                        handle: sc.handle,
                        level: sc.level,
                        title: sc.title,
                        details: sc.details
                    });
                }
            }
        }

        console.log(`Extracted ${criteria.length} success criteria`);

        // Read template
        console.log('Reading template from src/component.js...');
        const template = readFileSync(TEMPLATE_PATH, 'utf8');

        if (!template.includes(PLACEHOLDER)) {
            throw new Error(`Template does not contain placeholder: ${PLACEHOLDER}`);
        }

        // Generate readable output with pretty-printed data
        console.log('Generating success-criterion.js (readable)...');
        const readable = template.replace(PLACEHOLDER, JSON.stringify(criteria, null, 2));
        writeFileSync(OUTPUT_PATH, readable, 'utf8');

        const readableStats = statSync(OUTPUT_PATH);
        const readableSizeKB = (readableStats.size / 1024).toFixed(1);
        console.log(`  success-criterion.js: ${readableSizeKB} KB`);

        // Generate minified output with compact JSON
        console.log('Generating success-criterion.min.js (minified)...');
        const compact = template.replace(PLACEHOLDER, JSON.stringify(criteria));
        const minified = minifyJS(compact);
        writeFileSync(OUTPUT_MIN_PATH, minified, 'utf8');

        const minStats = statSync(OUTPUT_MIN_PATH);
        const minSizeKB = (minStats.size / 1024).toFixed(1);
        console.log(`  success-criterion.min.js: ${minSizeKB} KB`);

        console.log('\nSuccess!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
