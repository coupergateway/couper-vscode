"use strict"

const vscode = require('vscode')
const common = require('./common')

const { attributes, blocks, functions, variables } = require('./schema')

const selector = { language: 'couper' }

const providers = []

const REFERENCE_URL = "https://docs.couper.io"
const EXAMPLES_URL = "https://github.com/avenga/couper-examples/tree/master/"
const GITHUB_ICON = "images/github.png"

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
				if (schemaElement.docs) {
					url = REFERENCE_URL + schemaElement.docs
				} else {
					url = REFERENCE_URL + "/configuration/block/" + word
				}
			} else if (/^\s*=/.test(followingText)) {
				schemaElement = attributes[word]
				const parentBlock = common.getParentBlock(document, position)
				if (schemaElement.parents.includes(parentBlock)) {
					type = "attribute"
					const parentBlockDefintion = blocks[parentBlock]
					if (parentBlockDefintion.docs) {
						url = REFERENCE_URL + parentBlockDefintion.docs
					} else {
						url = REFERENCE_URL + "/configuration/block/" + parentBlock
					}
					url += "#attributes"
				}
			}
		} else {
			if (/^\s*\(/.test(followingText)) {
				type = "function"
				schemaElement = functions[word]
				url = REFERENCE_URL + "/configuration/functions"
			} else if (/^\./.test(followingText)) {
				type = "variable"
				schemaElement = variables[word]
				url = REFERENCE_URL + "/configuration/variables#" + word
			}
		}

		if (!type) {
			return undefined
		}

		let title = `**\`${word}\` ${type}**`
		if (type === "attribute") {
			title += ` (\`${schemaElement.type ?? "string"}\`)`
		}
		const icon = vscode.Uri.joinPath(globalThis.BASE_URI, GITHUB_ICON)
		const description = schemaElement.description ?? ""
		const reference = `![](${icon}) [Reference →](${url})`
		let examplesMarkdown = ""

		if (schemaElement.examples && schemaElement.examples.length > 0) {
			examplesMarkdown = `![](${icon}) `
			let i = 1
			for (const example of schemaElement.examples) {
				const url = EXAMPLES_URL + example
				const counter = schemaElement.examples.length == 1 ? "" : i++
				examplesMarkdown += `[Example ${counter} →](${url})\u00A0\u00A0\u00A0`
			}
		}

		return {
			contents: [title + "\n\n" + description, reference, examplesMarkdown]
		}
	}
})

providers.push(hoverProvider)

exports.providers = providers
