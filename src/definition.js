"use strict"

const vscode = require('vscode')
const common = require('./common')

const selector = { language: 'couper' }

const providers = []

RegExp.escape = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const definitionProvider = vscode.languages.registerDefinitionProvider(selector, {

    provideDefinition(document, position, token) {
		const reference = getReference(document, position)

		if (reference === null) {
			return null
		}

		return findDefinitionInDocument(document, reference)
	}
})

providers.push(definitionProvider)

function getReference(document, position) {
	const wordRange = document.getWordRangeAtPosition(position)
	const word = document.getText(wordRange)
	const rangeStart = wordRange.start.translate({characterDelta: -1})
	const rangeEnd = wordRange.end.translate({characterDelta: 1})
	const quotedWordRange = wordRange.with(rangeStart, rangeEnd)

	const quotedWord = document.getText(quotedWordRange)
	if (!quotedWord.startsWith('"') || !quotedWord.endsWith('"')) {
		return null
	}

	const lineText = document.lineAt(position).text
	const escapedQuotedWord = RegExp.escape(quotedWord)

	// access_control = [...], disable_access_control = [...]
	let matches = lineText.match(new RegExp('(?:^|,)\\s*((?:disable_)?access_control)\\s*=\\s*\\[(.*?' + escapedQuotedWord + '.*?)\\]\\s*(?:,|$)', 'm'))
	if (matches === null) {
		// backend = "..."
		matches = lineText.match(new RegExp('(?:^|,)\\s*(backend)\\s*=\\s*' + escapedQuotedWord + '\\s*(?:,|$)', 'm'))
		if (matches === null) {
			return null
		}
	} else {
		const list = matches[2]
		const elements = list.trim().split(/\s*,\s*/) // "," not allowed within ID
		let found = false
		for (const element of elements) {
			if (element === quotedWord) {
				found = true
				break
			}
		}
		if (!found) {
			return null
		}
	}
	return { attribute: matches[1], word: word }
}

function findDefinitionInDocument(document, reference) {
	var block
	switch (reference.attribute) {
		case "backend":
			block = "backend"
			break
		case "access_control":
		case "disable_access_control":
			block = "jwt|basic_auth"
			break
		default:
			return null
	}

	const text = document.getText()
	const escapedWord = RegExp.escape(reference.word)

	const offset = text.search(new RegExp('^[ \t]*(?:' + block + ')\\s*"' + escapedWord + '"\\s*{', 'm'))
	if (offset === -1) {
		return null
	}
	const blockPosition = document.positionAt(offset)
	const parentBlock = common.getParentBlock(document, blockPosition)
	if (parentBlock !== "definitions") {
		return null
	}

	return [new vscode.Location(document.uri, blockPosition)]
}

exports.providers = providers
