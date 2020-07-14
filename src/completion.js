"use strict"

const vscode = require("vscode")

const selector = "*"

const provider1 = vscode.languages.registerCompletionItemProvider(selector, {
	provideCompletionItems(document, position, token, context) {
		const linePrefix = document.lineAt(position).text.substr(0, position.character)
		if (linePrefix.trim() != "") {
			// FIXME return undefined
		}

		const blocks = [
			"server",
			"files",
			"spa",
			"api",
			"endpoint",
			"backend",
			"defaults",
			"definitions"
		]

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

		let completions = []
		blocks.forEach((keyword) => {
			let item = new vscode.CompletionItem(keyword + "{…}")
			item.detail = "Block"
			item.kind = vscode.CompletionItemKind.Struct
			let snippet = keyword + ' ${1:"label" }{\u000a\t$0\u000a}\u000a'
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

		let prefix = linePrefix.endsWith(' ') ? "" : " "

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
