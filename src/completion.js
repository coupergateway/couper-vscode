"use strict"

const vscode = require("vscode")

const selector = "*"
const regex = /\b([\w-]+)([ \t]*|[ \t]+\"[^"]+\"[ \t]*)?\{[^{]*$/s

function getParentBlock(document, position) {
	const range = new vscode.Range(document.positionAt(0), position)
	const matches = document.getText(range).match(regex)
	// FIXME comments and strings!
	return matches ? matches[1] : ""
}

const provider1 = vscode.languages.registerCompletionItemProvider(selector, {
	provideCompletionItems(document, position, token, context) {
		const linePrefix = document.lineAt(position).text.substr(0, position.character)
		if (linePrefix.trim() != "") {
			// FIXME return undefined
		}

		let blocks = {
			labelled: [
			"server",
			"endpoint"
			],
			unlabelled: [
			"files",
			"spa",
			"api",
			"defaults",
			"definitions"
		]
		}

		const attributes = [
			"domains",
			"document_root",
			"error_file",
			"bootstrap_file",
			"paths",
			"base_path",
			"origin",
			"path"
		]

		const parentBlock = getParentBlock(document, position)
		if (parentBlock == "endpoint") {
			blocks.unlabelled.push("backend")
		} else {
			blocks.labelled.push("backend")
		}

		let completions = []
		blocks.unlabelled.forEach((keyword) => {
			let item = new vscode.CompletionItem(keyword + "{…}")
			item.detail = "Block"
			item.kind = vscode.CompletionItemKind.Struct
			let snippet = keyword + ' {\u000a\t$0\u000a}\u000a'
			item.insertText = new vscode.SnippetString(snippet)
			completions.push(item)
		})

		blocks.labelled.forEach((keyword) => {
			let item = new vscode.CompletionItem(keyword + "{…}")
			item.detail = "Block"
			item.kind = vscode.CompletionItemKind.Struct
			let snippet = keyword + ' "${1:label}" {\u000a\t$0\u000a}\u000a'
			item.insertText = new vscode.SnippetString(snippet)
			completions.push(item)
		})

		attributes.forEach((keyword) => {
			let item = new vscode.CompletionItem(keyword + " = …")
			item.detail = "Attribute"
			item.kind = vscode.CompletionItemKind.Property
			item.insertText = keyword + " = "
			completions.push(item)
		})

		return completions
	}
})

const provider2 = vscode.languages.registerCompletionItemProvider(selector, {
	provideCompletionItems(document, position, token, context) {
		const linePrefix = document.lineAt(position).text.substr(0, position.character)
		if (!linePrefix.trim().endsWith('=')) {
			return undefined
		}

		const prefix = linePrefix.endsWith(' ') ? "" : " "

		const constants = [ "true", "false", "null" ]
		const variables = [ "env", "req", "beresp" ]

		let completions = []
		constants.forEach((keyword) => {
			let item = new vscode.CompletionItem(keyword)
			item.detail = "Constant"
			item.kind = vscode.CompletionItemKind.Value
			item.insertText = prefix + keyword
			completions.push(item)
		})

		variables.forEach((keyword) => {
			let item = new vscode.CompletionItem(keyword)
			item.detail = "Variable"
			item.kind = vscode.CompletionItemKind.Variable
			item.insertText = prefix + keyword
			completions.push(item)
		})

		let item = new vscode.CompletionItem('"…"')
		item.detail = "String"
		item.kind = vscode.CompletionItemKind.Value
		item.insertText = new vscode.SnippetString(prefix + '"${1}"$0')
		completions.push(item)

		return completions

	}
}, "=", " ")

Object.defineProperty(exports, "__esModule", { value: true })
exports.providers = [provider1, provider2]
