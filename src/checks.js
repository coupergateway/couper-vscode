"use strict"

const vscode = require('vscode')
const common = require('./common')
const schema = require('./schema')

const REGEXES = {
	block: /^\s*([\w_-]+)\s*(("[^"]*"\s*)*)\s*{/,
	attribute: /^\s*([\w_-]+)\s*=(.*)$/,
	labels: /\s*"([^"]*)"\s*/g,
	labelsyntax: /[^a-zA-Z0-9_]/,
	string: /^"([^"]*)"$/,
	duration: /^((\d+(\.\d*)?|\.\d+)([nuµm]?s|[mh]))+$/,
	template: /^"[^$%]*[$%]{[^"]*"$/,
	number: /^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$/,
	boolean: /^(true|false)$/
}

function makeQuotedList(array) {
	return array.filter(option => option !== null).map(option => `"${option}"`).join(", ")
}

const CheckOK = {ok: true}

function CheckFailed(message, severity) {
	return {
		ok: false,
		message: message.length > 0 ? message.charAt(0).toUpperCase() + message.slice(1) : "",
		severity: severity
	}
}

function getHint(allowedParents) {
	allowedParents.sort()
	switch (allowedParents.length) {
		case 0:
			return ""
		case 1:
			return `Must be within "${allowedParents[0]}".`
		default:
			let hint = `\nMust be within one of ${makeQuotedList(allowedParents)}`
			if (isAllowedAtTopLevel(allowedParents)) {
				hint += ` or at top-level`
			}
			hint +="."
			return hint
	}
}

function isAllowedAtTopLevelOnly(allowedParents) {
	return allowedParents.length === 1 && allowedParents[0] === null
}

function isAllowedAtTopLevel(allowedParents) {
	return allowedParents.length > 0 && allowedParents.includes(null)
}

// --------------------------------------------------------------------------

function checkBlockLabels(name, labels, parentBlock) {
	const element = schema.blocks[name]

	let elementLabels = element.labels
	if (!elementLabels) {
		elementLabels = element.labelled ? ["..."] : []
	} else if (typeof element.labels === 'function') {
		elementLabels = element.labels(parentBlock)
	}

	let hasLabel = false
	let hasNull = false
	for (const label of elementLabels) {
		if (label === null) {
			hasNull = true
		} else {
			hasLabel = true
		}
	}

	const labelRequired = hasLabel && !hasNull
	const labelAllowed = hasLabel && hasNull

	if (labelRequired && !labels) {
		return CheckFailed(`Missing label for block "${name}".`)
	}

	if (!labelRequired && !labelAllowed && labels) {
		return CheckFailed(`Invalid label for block "${name}".`)
	}

	const labelArray = [...labels.matchAll(REGEXES.labels)].map(match => match[1])
	if (labelArray.length > 0) {
		const label = labelArray[0] // Check only first label for now
		if (["backend", "environment", "basic_auth", "jwt", "oidc", "saml", "beta_oauth2"].includes(name)) {
			if (label === "") {
				return CheckFailed("Label must not be empty.")
			}
		}

		if (["backend", "request", "proxy", "environment"].includes(name)) {
			const index = label.search(REGEXES.labelsyntax)
			if (index != -1) {
				return CheckFailed(`Invalid character in label "${label}": ${label.charAt(index)}`)
			}
		}
	}

	return CheckOK
}

function checkAttributeValue(name, value) {
	const element = schema.attributes[name]
	let types = schema.attributes[name].type ?? ["string"]
	if (!Array.isArray(types)) {
		types = [types]
	}
	let invalidType = `Invalid value for "${name}", `
	if (types.length > 1) {
		invalidType += `type must be one of: ${makeQuotedList(types.sort())}`
	} else {
		invalidType += `${types[0]} required.`
	}

	value = value.trim()
	// FIXME filter comments

	if (/^\s*$/.test(value)) {
		return CheckFailed(invalidType)
	}

	if (types.includes('any'))  {
		return CheckOK
	}

	if (value.match(REGEXES.string)) {
		if (!types.includes("string") && !types.includes("duration")) {
			return CheckFailed(invalidType)
		}

		const isTemplate = REGEXES.template.test(value)
		const stringValue = RegExp.$1

		if (types.includes("duration") && !isTemplate && !REGEXES.duration.test(stringValue)) {
			return CheckFailed(invalidType)
		}

		if (element.options?.length && !isTemplate && !element.options.includes(stringValue)) {
			const allowedValues = makeQuotedList(element.options.sort())
			return CheckFailed(`Invalid value for "${name}", must be one of: ${allowedValues}`)
		}
	} else if (REGEXES.number.test(value) && !types.includes("number")) {
		return CheckFailed(invalidType)
	} else if (REGEXES.boolean.test(value) && !types.includes("boolean")) {
		return CheckFailed(invalidType)
	} else if (/^\[/.test(value) && !types.includes("tuple")) {
		return CheckFailed(invalidType)
	} else if (/^{/.test(value) && !types.includes("object")) {
		return CheckFailed(invalidType)
	}

	return CheckOK
}

const CHECKS = [
	// Block/attribute hierarchy
	(document, textLine) => {
		const context = common.getContext(document, textLine.range.start)
		const filteredContext = context.filter(item => !schema.blocks[item.name]?.preprocessed)
		const isTopLevel = filteredContext.length === 0
		if (!isTopLevel && filteredContext[0].type === "object") {
			// Do not check inside objects/maps
			return CheckOK
		}

		for (const type of ["block", "attribute"]) {
			const matches = textLine.text.match(REGEXES[type])
			if (!matches) {
				continue
			}

			const name = RegExp.$1
			const element = schema[type + "s"]
			if (!element[name]) {
				return CheckFailed(`Unknown ${type} "${name}".`)
			}

			let allowedParents
			if (typeof element[name].parents === "function") {
				allowedParents = element[name].parents(context)
				if (!Array.isArray(allowedParents)) {
					return CheckFailed(allowedParents)
				}
			} else {
				allowedParents = Array.from(element[name].parents ?? [])
				if (allowedParents.length === 0) {
					allowedParents.push(null)
				}
			}

			if (!isTopLevel) {
				const parentBlock = filteredContext[0].name
				if (isAllowedAtTopLevelOnly(allowedParents)) {
					return CheckFailed(`"${name}" is a top-level ${type}, but is within "${parentBlock}".`)
				}

				if (!allowedParents.includes(parentBlock)) {
					const hint = getHint(allowedParents)
					return CheckFailed(`${type} "${name}" is invalid within "${parentBlock}". ${hint}`)
				}
			} else if (!isAllowedAtTopLevel(allowedParents)) {
				const hint = getHint(allowedParents)
				return CheckFailed(`"${name}" is not a top-level ${type}. ${hint}`)
			}

			let result
			if (type === "block") {
				const labels = RegExp.$2
				const parentBlock = context[0]?.name
				result = checkBlockLabels(name, labels, parentBlock)
			} else if (type === "attribute") {
				result = checkAttributeValue(name, RegExp.$2)
			}
			if (!result.ok) {
				return result
			}
		}

		return CheckOK
	},

	// Endpoint starts with "/"
	(document, textLine) => {
		const matches = textLine.text.match(/^\s*endpoint\s*"([^/])/)
		if (!matches) {
			return CheckOK
		}

		return CheckFailed('Endpoint path should start with a "/".', vscode.DiagnosticSeverity.Warning)
	}
]

module.exports = { CHECKS }
