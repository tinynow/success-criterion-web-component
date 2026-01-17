#!/usr/bin/env node

/**
 * Fetches the latest WCAG 2.2 data from the official W3C source
 * and generates success-criterion.js with embedded data.
 *
 * Usage: node scripts/update-wcag-data.js
 *        npm run update-data
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const WCAG_URL = 'https://www.w3.org/WAI/WCAG22/wcag.json';
const TEMPLATE_PATH = path.join(__dirname, '..', 'src', 'component.js');
const OUTPUT_PATH = path.join(__dirname, '..', 'success-criterion.js');
const PLACEHOLDER = '/* WCAG_DATA_PLACEHOLDER */[]';

function fetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
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
        const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

        if (!template.includes(PLACEHOLDER)) {
            throw new Error(`Template does not contain placeholder: ${PLACEHOLDER}`);
        }

        // Generate output with embedded data
        console.log('Generating success-criterion.js with embedded data...');
        const output = template.replace(PLACEHOLDER, JSON.stringify(criteria, null, 2));

        fs.writeFileSync(OUTPUT_PATH, output, 'utf8');

        const stats = fs.statSync(OUTPUT_PATH);
        const sizeKB = (stats.size / 1024).toFixed(1);

        console.log(`Success! Generated success-criterion.js (${sizeKB} KB)`);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
