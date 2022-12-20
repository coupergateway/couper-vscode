"use strict"

const vscode = require('vscode')

const selector = { language: 'couper' }

const HEREDOC_REGEX = /^\s*[\w-]+\s*=\s*<<(-?)([\w-]+)\s*$/
const LBRACE_REGEX = /[{([]/g
const RBRACE_REGEX = /[})\]]/g

const providers = []

const countREOccurences = (str, re) => {
  return ((str || '').match(re) || []).length
}

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
			const countOpening = countREOccurences(line.text, LBRACE_REGEX)
			const countClosing = countREOccurences(line.text, RBRACE_REGEX)
			const diffOpeningClosing = countOpening - countClosing
			if (!isHereDoc && diffOpeningClosing < 0) {
				indentDepth = indentDepth + diffOpeningClosing
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

			if (!isHereDoc && diffOpeningClosing > 0) {
				indentDepth = indentDepth + diffOpeningClosing
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
