"use strict"

const vscode = require('vscode')
const common = require('./common')
const selector = { language: 'couper' }
const { functions, variables } = require('./schema')

function createRegex(list) {
	return new RegExp("\\b(?:" + list .join("|") + ")\\b", "g")
}

const Regexes = {
	variable: createRegex(Object.keys(variables).map(name => "(?<!\\.)" + name)),
	function: createRegex(Object.keys(functions).map(name => name + "\\s*(?=\\()"))
}

const tokenTypes = Object.keys(Regexes)

function addTokens(tokensBuilder, document, regex, type) {
	const text = document.getText()
	const matches = text.matchAll(regex)
	for (const match of matches) {
		const start = document.positionAt(match.index)
		const end = document.positionAt(match.index + match[0].length)
		const range = new vscode.Range(document.positionAt(0), end)
		const filteredText = common.filterCommentsAndStrings(document.getText(range))
		if (filteredText.slice(-(match[0].length)) == match[0]) {
			// token is in not part of a string or comment
			tokensBuilder.push(new vscode.Range(start, end), type, modifiers)
		}
	}
}

const legend = new vscode.SemanticTokensLegend(tokenTypes)

const semanticTokensProvider = {
	provideDocumentSemanticTokens(document) {
		const tokensBuilder = new vscode.SemanticTokensBuilder(legend)
		addTokens(tokensBuilder, document, Regexes.function, 'function')
		addTokens(tokensBuilder, document, Regexes.variable, 'variable')
		return tokensBuilder.build()
	}
}

const providers = [
	vscode.languages.registerDocumentSemanticTokensProvider(selector, semanticTokensProvider, legend)
]

exports.providers = providers
