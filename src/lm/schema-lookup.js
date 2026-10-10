"use strict"

// Answers "what is X and where may it appear" from the schema, in a shape a
// language model can consume. No VS Code API here so the logic stays testable.

const schema = require("../schema")
const docs = require("../docs-links")

const KINDS = {
	block: schema.blocks,
	attribute: schema.attributes,
	function: schema.functions,
	variable: schema.variables,
}

const SUGGESTION_LIMIT = 10

function parentsOf(element) {
	return Array.isArray(element.parents) ? [...element.parents] : []
}

function namesWithParent(collection, parent) {
	return Object.entries(collection)
		.filter(([, element]) => Array.isArray(element.parents) && element.parents.includes(parent))
		.map(([name]) => name)
		.sort()
}

function exampleUrls(element) {
	return (element.examples ?? []).map(docs.exampleUrl)
}

// Mirrors the label rules in checks.js.
function labelRule(block) {
	if (Array.isArray(block.labels) && block.labels.length > 0) {
		const optional = block.labels.includes(null)
		const named = block.labels.some(label => label !== null)
		if (named) {
			return optional ? "optional" : "required"
		}
		return "none"
	}
	if (block.labelled) {
		return "required"
	}
	if (block.labelOptional) {
		return "optional"
	}
	return "none"
}

function describeBlock(name, block) {
	const parents = parentsOf(block)
	const result = {
		kind: "block",
		name,
		description: block.description ?? "",
		topLevel: parents.length === 0,
		parents,
		label: labelRule(block),
		attributes: namesWithParent(schema.attributes, name),
		blocks: namesWithParent(schema.blocks, name),
		docs: docs.blockUrl(name),
		examples: exampleUrls(block),
	}
	if (Array.isArray(block.labels)) {
		result.labels = block.labels.filter(label => label !== null)
	}
	if (block.labelsForParent) {
		result.labelsForParent = block.labelsForParent
	}
	return result
}

function describeAttribute(name, attribute) {
	const parents = parentsOf(attribute)
	const result = {
		kind: "attribute",
		name,
		description: attribute.description ?? "",
		type: attribute.type ?? "string",
		parents,
		docs: parents.map(docs.attributeUrl),
		examples: exampleUrls(attribute),
	}
	if (attribute.options) {
		result.options = attribute.options
	}
	return result
}

function describeFunction(name, fn) {
	return {
		kind: "function",
		name,
		description: fn.description ?? "",
		docs: docs.functionUrl(),
		examples: exampleUrls(fn),
	}
}

function describeVariable(name, variable) {
	const result = {
		kind: "variable",
		name,
		description: variable.description ?? "",
		properties: variable.values ?? [],
		docs: docs.variableUrl(name),
		examples: exampleUrls(variable),
	}
	if (variable.child) {
		result.child = variable.child
	}
	if (variable.parents) {
		result.parents = parentsOf(variable)
	}
	return result
}

const DESCRIBE = {
	block: describeBlock,
	attribute: describeAttribute,
	function: describeFunction,
	variable: describeVariable,
}

// Names that start with the query come first, then shorter names.
function compareSuggestions(a, b, needle) {
	const prefix = Number(!a.toLowerCase().startsWith(needle)) - Number(!b.toLowerCase().startsWith(needle))
	return prefix || a.length - b.length || a.localeCompare(b)
}

function lookup({ name, kind } = {}) {
	const query = String(name ?? "").trim()
	const kinds = Object.hasOwn(KINDS, kind) ? [kind] : Object.keys(KINDS)

	const matches = kinds
		.filter(k => Object.hasOwn(KINDS[k], query))
		.map(k => DESCRIBE[k](query, KINDS[k][query]))

	if (matches.length > 0) {
		return { query, matches }
	}

	const needle = query.toLowerCase()
	const suggestions = needle === "" ? [] : kinds
		.flatMap(k => Object.keys(KINDS[k]).filter(n => n.toLowerCase().includes(needle)).map(n => ({ kind: k, name: n })))
		.sort((a, b) => compareSuggestions(a.name, b.name, needle))
		.slice(0, SUGGESTION_LIMIT)

	return { query, matches: [], suggestions }
}

module.exports = { lookup, KINDS: Object.keys(KINDS) }
