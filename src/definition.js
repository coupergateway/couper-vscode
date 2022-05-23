"use strict"

const vscode = require('vscode')
const common = require('./common')
const { attributes } = require('./schema')
const { contributes } = require('../package.json')

const GLOB_PATTERN = '**/*{' + contributes.languages[0].extensions.join(',') + '}'

const selector = { language: 'couper' }

const providers = []

RegExp.escape = (string) => {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

let blockNamePatterns = {}

const definitionProvider = vscode.languages.registerDefinitionProvider(selector, {

	async provideDefinition(document, position, token) {
		const reference = getReference(document, position)
		if (reference === null) {
			return null
		}

		let definitions = []
		for (const couperDocument of await getCouperDocuments(document)) {
			const location = findDefinitionInDocument(couperDocument, reference)
			if (location !== null) {
				definitions.push(location)
			}
		}
		return definitions
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
	const escapedWord = RegExp.escape(word)

	// access_control = [...], disable_access_control = [...]
	let matches = lineText.match(new RegExp('^\\s*((?:disable_)?access_control)\\s*=\\s*\\[.*?"' + escapedWord + '"', 'm'))
	if (matches === null) {
		// backend = "..."
		matches = lineText.match(new RegExp('^\\s*(backend)\\s*=\\s*"' + escapedWord + '"', 'm'))
		if (matches === null) {
			// backend "..." { ...
			matches = lineText.match(new RegExp('^\\s*(backend)\\s*"' + escapedWord + '"\\s*{', 'm'))
			if (matches === null || common.getParentBlock(document, position) === "definitions") {
				return null
			}
		}
	}
	return { attribute: matches[1], word: word }
}

function findDefinitionInDocument(document, reference) {
	let blockNamePattern = blockNamePatterns[reference.attribute]
	if (!blockNamePattern) {
		const definingBlocks = attributes[reference.attribute]?.definingBlocks
		if (!definingBlocks) {
			return null
		}
		blockNamePattern = definingBlocks.map(b => RegExp.escape(b)).join('|')
		blockNamePatterns[reference.attribute] = blockNamePattern
	}

	const text = document.getText()
	const escapedWord = RegExp.escape(reference.word)

	const offset = text.search(new RegExp('^[ \t]*(?:' + blockNamePattern + ')\\s*"' + escapedWord + '"\\s*{', 'm'))
	if (offset === -1) {
		return null
	}
	const blockPosition = document.positionAt(offset)
	const parentBlock = common.getParentBlock(document, blockPosition)
	if (parentBlock !== "definitions") {
		return null
	}

	return new vscode.Location(document.uri, blockPosition)
}

async function getCouperDocuments(document) {
	const files = await vscode.workspace.findFiles(GLOB_PATTERN)
	if (files.length === 0) {
		return [document]
	}

	let documents = []
	for (const file of files) {
		documents.push(await vscode.workspace.openTextDocument(file))
	}

	return documents
}

exports.providers = providers
