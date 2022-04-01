"use strict"

const vscode = require('vscode')
const common = require('./common')

const { attributes, blocks, functions, variables } = require('./schema')

const selector = { language: 'couper' }

const providers = []

const REFERENCE_URL = "https://github.com/avenga/couper/blob/master/docs/REFERENCE.md"
const EXAMPLES_URL = "https://github.com/avenga/couper-examples/tree/master/"
const GITHUB_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAQAAADY4iz3AAAA50lEQVQY002Qv0qCcQAAT8E/fJEIhdEQuvQGET5DtIWjQY3N1dLuoLs+RTQKoW9QhIKTEDjZYPirr0KSr2sI0rvxtkPEyLo95/44t2fdSASxZNvYFbFtS4KRnYVDg0u/XBocutCOUcpT2tONEzYpMGObd2Ju2f3kAvs6siL/Vhyp9jFoy9RaStlSDWkKMEVWyBSgkCZAlexaylIFCNhd+uKVZfNi3rKXvql2sfYRuk589EA89Mlv1WANczYHyY3Xbon7TlQTm+YQi0njeXbnjrjnWF9tWPwbhRmPxvfnSc0zHwYemxH5BSkBzYl7GC5aAAAAAElFTkSuQmCC"

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
				url = REFERENCE_URL + "#" + word.replace(/_/g, '-') + '-block'
			} else if (/^\s*=/.test(followingText)) {
				type = "attribute"
				schemaElement = attributes[word]
				const parentBlock = common.getParentBlock(document, position)
				url = REFERENCE_URL + "#" + parentBlock.replace(/_/g, '-') + '-block'
			}
		} else {
			if (/^\s*\(/.test(followingText)) {
				type = "function"
				schemaElement = functions[word]
				url = REFERENCE_URL + "#functions"
			} else if (/^\./.test(followingText)) {
				type = "variable"
				schemaElement = variables[word]
				url = REFERENCE_URL + "#" + word
			}
		}

		if (!type) {
			return undefined
		}

		const title = `**\`${word}\` ${type}**`
		const description = schemaElement.description ?? ""
		const reference = `![](${GITHUB_ICON}) [Reference →](${url})`
		let examplesMarkdown = ""

		if (schemaElement.examples && schemaElement.examples.length > 0) {
			examplesMarkdown = `![](${GITHUB_ICON}) `
			let i = 1
			for (const example of schemaElement.examples) {
				const url = EXAMPLES_URL + example
				examplesMarkdown += `[Example ${i++} →](${url})\u00A0\u00A0\u00A0`
			}
		}

		return {
			contents: [title + "\n\n" + description, reference, examplesMarkdown]
		}
	}
})

providers.push(hoverProvider)

exports.providers = providers
