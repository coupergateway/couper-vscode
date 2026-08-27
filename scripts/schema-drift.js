#!/usr/bin/env node
"use strict"

/**
 * Reconciles the hand-maintained files with the schema Couper generates.
 *
 * Couper owns the block and attribute names. When it renames one, the overlay
 * entry under the old name stays behind, and the merge adds it to the output
 * as an entry Couper does not have. This resolves what is mechanical and
 * stops on what needs a decision, so no rename reaches the extension silently.
 *
 * Usage:
 *   node scripts/schema-drift.js [--fix] [--baseline <file>]
 *
 *   --fix                 apply the mechanical migrations, then report the rest
 *   --baseline <file>     an earlier generated/schema.json, to list what changed
 */

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const generatedPath = path.join(root, 'generated', 'schema.json')
const overlayPath = path.join(root, 'src', 'schema-overlay.json')
const renamesPath = path.join(__dirname, 'schema-renames.json')
const blockRulesPath = path.join(root, 'src', 'block-rules.js')

const SECTIONS = ['blocks', 'attributes', 'functions', 'variables']
const BETA = 'beta_'

function readJson(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8'))
	} catch (err) {
		console.error(`Failed to read ${path.relative(root, file)}: ${err.message}`)
		process.exit(1)
	}
}

// Keeps arrays of primitives on one line, matching the overlay's own style.
function formatJson(value, level = 0) {
	const indent = '  '
	const pad = indent.repeat(level)
	const padInner = indent.repeat(level + 1)

	if (Array.isArray(value)) {
		if (value.every(item => item === null || typeof item !== 'object')) {
			return JSON.stringify(value)
		}
		const items = value.map(item => padInner + formatJson(item, level + 1))
		return `[\n${items.join(',\n')}\n${pad}]`
	}

	if (value !== null && typeof value === 'object') {
		const entries = Object.entries(value)
		if (entries.length === 0) {
			return '{}'
		}
		const lines = entries.map(([key, val]) => `${padInner}${JSON.stringify(key)}: ${formatJson(val, level + 1)}`)
		return `{\n${lines.join(',\n')}\n${pad}}`
	}

	return JSON.stringify(value)
}

// A renamed entry is found either in the rename map or by toggling the beta_
// prefix, which is how Couper graduates a feature out of beta.
function findNewName(section, key, generated, renames) {
	const mapped = (renames[section] || {})[key]
	if (mapped) {
		return generated[section][mapped]
			? { target: mapped, via: 'schema-renames.json' }
			: { target: mapped, via: 'schema-renames.json', missing: true }
	}

	const toggled = key.startsWith(BETA) ? key.slice(BETA.length) : BETA + key
	if (generated[section][toggled]) {
		return { target: toggled, via: 'beta_ prefix' }
	}

	return null
}

function collectDeadKeys(overlay) {
	const dead = []
	for (const section of SECTIONS) {
		for (const [name, entry] of Object.entries(overlay[section] || {})) {
			if (entry === null || typeof entry !== 'object') {
				continue
			}
			for (const key of Object.keys(entry)) {
				if (key.startsWith('_')) {
					dead.push({ section, name, key })
				}
			}
		}
	}
	return dead
}

function reportBaseline(baseline, generated) {
	const lines = []
	for (const section of ['blocks', 'attributes']) {
		const before = Object.keys(baseline[section] || {})
		const after = Object.keys(generated[section] || {})
		const added = after.filter(key => !before.includes(key))
		const removed = before.filter(key => !after.includes(key))
		if (added.length) {
			lines.push(`  ${section} added:   ${added.join(', ')}`)
		}
		if (removed.length) {
			lines.push(`  ${section} removed: ${removed.join(', ')}`)
		}
	}
	return lines
}

function main() {
	const args = process.argv.slice(2)
	const fix = args.includes('--fix')
	const baselineIndex = args.indexOf('--baseline')
	const baselineFile = baselineIndex === -1 ? null : args[baselineIndex + 1]

	const generated = readJson(generatedPath)
	const overlay = readJson(overlayPath)
	const renames = fs.existsSync(renamesPath) ? readJson(renamesPath) : {}

	const migrated = []
	const unresolved = []

	for (const section of SECTIONS) {
		const entries = overlay[section]
		if (!entries) {
			continue
		}

		for (const key of Object.keys(entries)) {
			if (generated[section] && generated[section][key]) {
				continue
			}

			const rename = findNewName(section, key, generated, renames)
			if (!rename || rename.missing) {
				unresolved.push({ section, key, rename })
				continue
			}

			migrated.push({ section, key, ...rename })
			if (fix) {
				entries[rename.target] = { ...(entries[rename.target] || {}), ...entries[key] }
				delete entries[key]
			}
		}
	}

	const dead = collectDeadKeys(overlay)
	if (fix) {
		for (const { section, name, key } of dead) {
			delete overlay[section][name][key]
		}
	}

	// The label rules name blocks, so they drift with a rename just as the
	// overlay does, and nothing else would catch it.
	delete require.cache[require.resolve(blockRulesPath)]
	const blockRules = require(blockRulesPath)
	const unknownRuleBlocks = []
	for (const [rule, names] of Object.entries(blockRules)) {
		for (const name of names) {
			if (!generated.blocks[name]) {
				unknownRuleBlocks.push({ rule, name })
			}
		}
	}

	if (fix && (migrated.length || dead.length)) {
		fs.writeFileSync(overlayPath, formatJson(overlay) + '\n', 'utf8')
	}

	// Report

	if (baselineFile) {
		const lines = reportBaseline(readJson(baselineFile), generated)
		if (lines.length) {
			console.log('Couper schema changed:')
			console.log(lines.join('\n'))
			console.log('')
		}
	}

	for (const { section, key, target, via } of migrated) {
		const verb = fix ? 'migrated' : 'needs migration'
		console.log(`overlay ${section}: "${key}" -> "${target}" (${verb}, matched via ${via})`)
	}

	for (const { section, name, key } of dead) {
		const verb = fix ? 'removed' : 'is dead'
		console.log(`overlay ${section}.${name}: "${key}" ${verb} — a leading underscore is not a schema key, the merge ships it verbatim`)
	}

	if (migrated.length || dead.length) {
		console.log('')
	}

	let failed = false

	for (const { section, key, rename } of unresolved) {
		failed = true
		if (rename && rename.missing) {
			console.error(`error: overlay ${section} "${key}" maps to "${rename.target}" in schema-renames.json, but Couper has no such ${section.slice(0, -1)}.`)
		} else {
			console.error(`error: overlay ${section} "${key}" is not in the generated schema and no rename matches it.`)
			console.error(`       Couper either renamed or removed it. Add the new name to scripts/schema-renames.json under "${section}", or drop the overlay entry.`)
		}
	}

	for (const { rule, name } of unknownRuleBlocks) {
		failed = true
		console.error(`error: src/block-rules.js ${rule} lists "${name}", which is not a block in the generated schema.`)
	}

	if (failed) {
		process.exit(1)
	}

	if (!migrated.length && !dead.length) {
		console.log('No drift: the overlay and the label rules match the generated schema.')
	} else if (!fix) {
		console.error('error: drift found. Run "npm run sync:schema" to apply it.')
		process.exit(1)
	}
}

main()
