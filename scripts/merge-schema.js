#!/usr/bin/env node

/**
 * Merges auto-generated schema from Couper with manual overlay.
 *
 * Usage: node scripts/merge-schema.js
 *
 * Inputs:
 *   - generated/schema.json: Auto-generated from Couper Go code
 *   - src/schema-overlay.json: Manual additions (examples, edge cases)
 *
 * Output:
 *   - src/schema.js: Merged JavaScript module
 */

const fs = require('fs');
const path = require('path');

const generatedPath = path.join(__dirname, '..', 'generated', 'schema.json');
const overlayPath = path.join(__dirname, '..', 'src', 'schema-overlay.json');
const outputPath = path.join(__dirname, '..', 'src', 'schema.js');

// Read input files
let generated, overlay;
try {
    generated = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
} catch (err) {
    console.error(`Failed to read generated schema: ${err.message}`);
    process.exit(1);
}

try {
    overlay = JSON.parse(fs.readFileSync(overlayPath, 'utf8'));
} catch (err) {
    console.error(`Failed to read overlay: ${err.message}`);
    process.exit(1);
}

// Deep merge function
function deepMerge(target, source) {
    if (!source) return target;
    if (!target) return source;

    const result = { ...target };

    for (const key of Object.keys(source)) {
        if (source[key] === null || source[key] === undefined) {
            continue;
        }

        if (Array.isArray(source[key])) {
            // Arrays replace entirely (don't merge)
            result[key] = source[key];
        } else if (typeof source[key] === 'object' && typeof result[key] === 'object') {
            result[key] = deepMerge(result[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }

    return result;
}

// Merge blocks, attributes, functions, and variables
const merged = {
    blocks: deepMerge(generated.blocks || {}, overlay.blocks || {}),
    attributes: deepMerge(generated.attributes || {}, overlay.attributes || {}),
    functions: deepMerge(generated.functions || {}, overlay.functions || {}),
    variables: deepMerge(generated.variables || {}, overlay.variables || {})
};

// Generate JavaScript output
const DEFAULT_LABEL = '…';

// Helper functions for dynamic parent validation
const helperFunctions = `
const DEFAULT_LABEL = "…"

const createCheckGrandparent = (feature, parentBlockName, grandparentBlockName) => {
	return (context) => {
		if (context.length >= 2 && context[0].name === parentBlockName && context[1].name === grandparentBlockName) {
			return [parentBlockName]
		}
		return \`"\${feature}" only valid in a "\${parentBlockName}" in a "\${grandparentBlockName}" block.\`
	}
}
`;

// Convert merged data to JavaScript object literal
function toJsObject(obj, indent = '\t') {
    const lines = [];

    for (const [key, value] of Object.entries(obj)) {
        const keyStr = /^[a-z_][a-z0-9_]*$/i.test(key) ? key : `'${key}'`;

        if (value === null || value === undefined) {
            continue;
        }

        if (typeof value === 'boolean') {
            lines.push(`${indent}${keyStr}: ${value}`);
        } else if (typeof value === 'number') {
            lines.push(`${indent}${keyStr}: ${value}`);
        } else if (typeof value === 'string') {
            lines.push(`${indent}${keyStr}: ${JSON.stringify(value)}`);
        } else if (Array.isArray(value)) {
            if (value.length === 0) {
                lines.push(`${indent}${keyStr}: []`);
            } else if (value.every(v => typeof v === 'string')) {
                lines.push(`${indent}${keyStr}: ${JSON.stringify(value)}`);
            } else {
                lines.push(`${indent}${keyStr}: ${JSON.stringify(value, null, 2).replace(/\n/g, '\n' + indent)}`);
            }
        } else if (typeof value === 'object') {
            const innerLines = [];
            for (const [k, v] of Object.entries(value)) {
                const kStr = /^[a-z_][a-z0-9_]*$/i.test(k) ? k : `'${k}'`;
                if (v !== null && v !== undefined) {
                    if (typeof v === 'string') {
                        innerLines.push(`${indent}\t${kStr}: ${JSON.stringify(v)}`);
                    } else if (Array.isArray(v)) {
                        innerLines.push(`${indent}\t${kStr}: ${JSON.stringify(v)}`);
                    } else if (typeof v === 'boolean' || typeof v === 'number') {
                        innerLines.push(`${indent}\t${kStr}: ${v}`);
                    } else {
                        innerLines.push(`${indent}\t${kStr}: ${JSON.stringify(v)}`);
                    }
                }
            }
            lines.push(`${indent}${keyStr}: {\n${innerLines.join(',\n')}\n${indent}}`);
        }
    }

    return lines.join(',\n');
}

// Build output
let output = `// Auto-generated from Couper Go code with manual overlay
// Do not edit directly - modify schema-overlay.json instead
// Generated: ${new Date().toISOString()}

${helperFunctions}

const blocks = {
${toJsObject(merged.blocks)}
}

const attributes = {
${toJsObject(merged.attributes)}
}

const functions = {
${toJsObject(merged.functions)}
}

const commonProperties = ['body', 'context', 'cookies', 'headers', 'json_body']

const variables = {
${toJsObject(merged.variables)}
}

const ALL_BLOCKS = Object.keys(blocks)
const ALL_BLOCKS_BUT_ENVIRONMENT = ALL_BLOCKS.filter(block => block !== "environment")

module.exports = { attributes, blocks, functions, variables, DEFAULT_LABEL }
`;

// Write output
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Merged schema written to ${outputPath}`);

// Print stats
console.log(`\nStats:`);
console.log(`  Blocks: ${Object.keys(merged.blocks).length}`);
console.log(`  Attributes: ${Object.keys(merged.attributes).length}`);
console.log(`  Functions: ${Object.keys(merged.functions).length}`);
console.log(`  Variables: ${Object.keys(merged.variables).length}`);
