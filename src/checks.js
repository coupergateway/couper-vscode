"use strict"

const vscode = require('vscode')
const common = require('./common')
const { blocks } = require('./schema')

const BLOCK_REGEX = /^\s*([\w_-]+)\s*("[^"]+"\s*)*\s*{/

const CheckOK = {ok: true}

function CheckFailed(message, severity) {
	return {
		ok: false,
		message: message,
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
	// Block hierarchy
	(document, textLine) => {
		const matches = textLine.text.match(BLOCK_REGEX)
		if (!matches) {
			return CheckOK
		}

		const block = RegExp.$1
		if (!blocks[block]) {
			return CheckFailed(`Unknown block: ${block}`)
		}

		const parentBlock = common.getParentBlock(document, textLine.range.start)

		const allowedParents = blocks[block].parents?.sort() ?? []
		if (parentBlock) {
			if (allowedParents.length === 0) {
				return CheckFailed(`Block "${block}" is a top-level block, but has parent "${parentBlock}".`)
			}

			if (!allowedParents.includes(parentBlock)) {
				const hint = getHint(allowedParents)
				return CheckFailed(`Block "${block}" is invalid within "${parentBlock}". ${hint}`)
			}

			return CheckOK
		}

		if (allowedParents.length > 0) {
			const hint = getHint(allowedParents)
			return CheckFailed(`Block "${block}" is not a top-level block. ${hint}`)
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
