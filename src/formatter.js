"use strict"

const vscode = require('vscode')

const selector = { language: 'couper' }

const HEREDOC_REGEX = /^\s*[\w-]+\s*=\s*<<(-?)([\w-]+)\s*$/
const LBRACE_REGEX = /[{(\[]\s*$/
const RBRACE_REGEX = /^\s*[})\]]\s*$/

const providers = []

const formattingProvider = vscode.languages.registerDocumentFormattingEditProvider(selector, {
	provideDocumentFormattingEdits(document, options) {
		const padding = options.insertSpaces ? " " : "\t"
		const indentFactor = options.insertSpaces ? options.tabSize : 1

		let edits = []
		let indentDepth = 0
		let hereDocDelimiter
		let isHereDoc = false
		let isIndentedHereDoc = false
		let hereDocEndRegex

		for (let i = 0; i < document.lineCount; i++) {
			const line = document.lineAt(i)
			if (!isHereDoc && RBRACE_REGEX.test(line.text)) {
				indentDepth--
			} else if (isHereDoc) {
				const foundHereDocEnd = hereDocEndRegex.test(line.text)
				if (foundHereDocEnd && isIndentedHereDoc) {
					indentDepth--
				}
				isHereDoc = !foundHereDocEnd
			}

			if (!isHereDoc || isIndentedHereDoc) {
				const text = line.text.substring(line.firstNonWhitespaceCharacterIndex)
				const indentation = "".padStart(indentDepth * indentFactor, padding)
				edits.push(vscode.TextEdit.replace(line.range, indentation + text))
			}

			if (!isHereDoc && LBRACE_REGEX.test(line.text)) {
				indentDepth++
				continue
			}

			const matches = line.text.match(HEREDOC_REGEX)
			if (matches !== null) {
				isIndentedHereDoc = matches[1] === "-"
				hereDocDelimiter = matches[2]
				isHereDoc = true
				hereDocEndRegex = new RegExp('^\\s*' + hereDocDelimiter + '\\s*$')
				if (isIndentedHereDoc) {
					indentDepth++
				}
			}
		}
		return edits
	}
})

providers.push(formattingProvider)

exports.providers = providers
