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

		const attributes = {
			"domains": {
				parents: ["server"],
				type: "array"
			},
			"document_root": {
				parents: ["files"]
			},
			"error_file": {
				parents: ["files"]
			},
			"bootstrap_file": {
				parents: ["spa"]
			},
			"paths": {
				parents: ["spa"],
				type: "array"
			},
			"base_path": {
				parents: ["server","api"]
			},
			"origin": {
				parents: ["backend"]
			},
			"origin_address": {
				parents: ["backend"]
			},
			"origin_host": {
				parents: ["backend"]
			},
			"backend": {
				parents: ["endpoint"]
			},
			"path": {
				parents: ["endpoint"]
			},
			"access_control": {
				parents: ["server","files","spa","endpoint"],
				type: "array"
			},
			"cookie": {
				parents: ["jwt"]
			},
			"header": {
				parents: ["jwt"]
			},
			"key": {
				parents: ["jwt"]
			},
			"key_file": {
				parents: ["jwt"]
			},
			"signature_algorithm": {
				parents: ["jwt"]
			},
		}

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
			const snippet = keyword + ' {\u000a\t$0\u000a}\u000a'
			item.insertText = new vscode.SnippetString(snippet)
			completions.push(item)
		})

		blocks.labelled.forEach((keyword) => {
			let item = new vscode.CompletionItem(keyword + "{…}")
			item.detail = "Block"
			item.kind = vscode.CompletionItemKind.Struct
			const snippet = keyword + ' "${1:label}" {\u000a\t$0\u000a}\u000a'
			item.insertText = new vscode.SnippetString(snippet)
			completions.push(item)
		})

		for (let key in attributes) {
			let attribute = attributes[key]
			if ((attribute.parents || []).indexOf(parentBlock) == -1) {
				continue
			}
			let item = new vscode.CompletionItem(key + " = …")
			item.detail = "Attribute"
			item.kind = vscode.CompletionItemKind.Property
			if (attribute.type == "array") {
				item.insertText = new vscode.SnippetString(key + " = [$0]")
			} else {
				item.insertText = key + " ="
			}
			completions.push(item)
		}

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
