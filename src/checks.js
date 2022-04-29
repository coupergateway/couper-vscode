"use strict"

const vscode = require('vscode')
const common = require('./common')
const schema = require('./schema')

const REGEXES = {
	block: /^\s*([\w_-]+)\s*("[^"]*"\s*)*\s*{/,
	attribute: /^\s*([\w_-]+)\s*=/
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
	switch (allowedParents.length) {
		case 0:
			return ""
		case 1:
			return `Parent must be "${allowedParents[0]}".`
		default:
			return `\nValid parent blocks: ${allowedParents.join(", ")}`
	}
}

// --------------------------------------------------------------------------

const CHECKS = [
	// Block/attribute hierarchy
	(document, textLine) => {
		const context = common.getContext(document, textLine.range.start)

		const isTopLevel = context.length === 0
		if (!isTopLevel && context[0].type === "object") {
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

			const allowedParents = element[name].parents?.sort() ?? []
			if (!isTopLevel) {
				const parentBlock = context[0].name
				if (allowedParents.length === 0) {
					return CheckFailed(`"${name}" is a top-level ${type}, but has parent "${parentBlock}".`)
				}

				if (!allowedParents.includes(parentBlock)) {
					const hint = getHint(allowedParents)
					return CheckFailed(`${type} "${name}" is invalid within "${parentBlock}". ${hint}`)
				}
			} else if (allowedParents.length > 0) {
				const hint = getHint(allowedParents)
				return CheckFailed(`"${name}" is not a top-level ${type}. ${hint}`)
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
