"use strict"

const vscode = require('vscode')
const common = require('./common')

const { attributes, blocks, functions, variables } = require('./schema')

const selector = { language: 'couper' }

const providers = []

const baseURL = "https://github.com/avenga/couper/blob/master/docs/REFERENCE.md"

const hoverProvider = vscode.languages.registerHoverProvider(selector, {
	provideHover(document, position, token) {
		const wordRange = document.getWordRangeAtPosition(position)
		const word = document.getText(wordRange)

		const lineRange = document.lineAt(position).range
		const lineStartRange = new vscode.Range(lineRange.start, wordRange.start)
		const lineEndRange = new vscode.Range(wordRange.end, lineRange.end)
		const precedingText = document.getText(lineStartRange)
		const followingText = document.getText(lineEndRange)

		let type, url, schemaElement
		if (/^\s*$/.test(precedingText)) {
			if (/^(\s+"[^"]*")*\s*{\s*$/.test(followingText)) {
				type = "block"
				schemaElement = blocks[word]
				url = baseURL + "#" + word.replace('_', '-') + '-block'
			} else if (/^\s*=/.test(followingText)) {
				type = "attribute"
				schemaElement = attributes[word]
				const parentBlock = common.getParentBlock(document, position)
				url = baseURL + "#" + parentBlock.replace('_', '-') + '-block'
			}
		} else {
			if (/^\s*\(/.test(followingText)) {
				type = "function"
				schemaElement = functions[word]
				url = baseURL + "#functions"
			} else if (/^\./.test(followingText)) {
				type = "variable"
				schemaElement = variables[word]
				url = baseURL + "#" + word
			}
		}

		if (!type) {
			return undefined
		}

		const title = `**\`${word}\` ${type}**`
		const description = schemaElement.description ?? ""
		const reference = `[Reference →](${url})`

		return {
			contents: [title + "\n\n" + description, reference]
		}
	}
})

providers.push(hoverProvider)

exports.providers = providers
