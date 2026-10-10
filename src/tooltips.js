"use strict"

const vscode = require('vscode')
const common = require('./common')
const docs = require('./docs-links')

const { attributes, blocks, functions, variables } = require('./schema')
const { name, publisher } = require('../package.json')

const selector = { language: 'couper' }

const providers = []

const GITHUB_ICON = "images/github.png"

function getExtension(extensionName) {
	return vscode.extensions.getExtension(extensionName ?? (publisher + "." + name))
}

const extension = getExtension()

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
				url = docs.blockUrl(word)
			} else if (/^\s*=/.test(followingText)) {
				schemaElement = attributes[word]
				const parentBlock = common.getParentBlock(document, position)
				if (schemaElement?.parents.includes(parentBlock)) {
					type = "attribute"
					url = docs.attributeUrl(parentBlock)
				}
			}
		} else {
			if (/^\s*\(/.test(followingText)) {
				type = "function"
				schemaElement = functions[word]
				url = docs.functionUrl()
			} else if (/^\./.test(followingText)) {
				type = "variable"
				schemaElement = variables[word]
				url = docs.variableUrl(word)
			}
		}

		if (!type || !schemaElement) {
			return undefined
		}

		let title = `**\`${word}\` ${type}**`
		if (type === "attribute") {
			title += ` (\`${schemaElement.type ?? "string"}\`)`
		}
		const icon = vscode.Uri.joinPath(extension.extensionUri, GITHUB_ICON)
		const description = schemaElement.description ?? ""
		const documentation = `![](${icon}) [Documentation →](${url})`
		let examplesMarkdown = ""

		if (schemaElement.examples && schemaElement.examples.length > 0) {
			examplesMarkdown = `![](${icon}) `
			let i = 1
			for (const example of schemaElement.examples) {
				const counter = schemaElement.examples.length === 1 ? "" : i++
				examplesMarkdown += `[Example ${counter} →](${docs.exampleUrl(example)})   `
			}
		}

		return {
			contents: [title + "\n\n" + description, documentation, examplesMarkdown]
		}
	}
})

providers.push(hoverProvider)

exports.providers = providers
