"use strict"

const vscode = require("vscode")

const selector = "*"
const parentBlockRegex = /\b([\w-]+)(?:[ \t]+\"[^"]+\")?[ \t]*\{[^{}]*$/s
const blockRegex = /\{[^{}]*\}/sg
const attributeRegex = /^\s*[\w-]+\s*=/m
// see http://regex.info/listing.cgi?ed=2&p=281
const filterRegex = /([^"/\#]+|"(?:\\.|[^"\\])*")|\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/|(?:\/\/|\#)[^\n]*/g

function getParentBlock(document, position) {
	const range = new vscode.Range(document.positionAt(0), position)
	let text = document.getText(range)

	text = text.replace(filterRegex, (match, match1) => {
		if (match1 == undefined) {
			return "" // Comment
		}
		if (match1[0] == '"') {
			return '"..."'
		}
		return match1
	})

	while (blockRegex.test(text)) {
		text = text.replace(blockRegex, "")
	}

	const matches = text.match(parentBlockRegex)
	return matches ? matches[1] : ""
}

const provider1 = vscode.languages.registerCompletionItemProvider(selector, {
	provideCompletionItems(document, position, token, context) {
		const linePrefix = document.lineAt(position).text.substr(0, position.character)
		if (!/^\s*([\w-]+)?$/.test(linePrefix)) {
			return null
		}

		const parentBlock = getParentBlock(document, position)

		let blocks = {
			"server": {
				labelled: true
			},
			"endpoint": {
				labelled: true,
				parents: ["api"]
			},
			"files": {
				parents: ["server"]
			},
			"spa": {
				parents: ["server"]
			},
			"api": {
				parents: ["server"]
			},
			"backend": {
				parents: ["endpoint", "definitions"],
				labelled: parentBlock != "endpoint"
			},
			"jwt": {
				parents: ["definitions"],
				labelled: true
			},
			"basic_auth": {
				parents: ["definitions"],
				labelled: true
			},
			"defaults": {
				parents: ["server"]
			},
			"definitions": {}
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
				parents: ["server", "api"]
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
				parents: ["server", "files", "spa", "endpoint"],
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

		let completions = []

		for (let key in blocks) {
			let block = blocks[key]
			if ((block.parents || [""]).indexOf(parentBlock) == -1) {
				continue
			}

			let item = new vscode.CompletionItem(key + " {…}")
			item.detail = "Block"
			item.kind = vscode.CompletionItemKind.Struct
			const label = block.labelled ? '"${1:label}" ' : ""
			const snippet = key + ' ' + label + '{\u000a\t$0\u000a}\u000a'
			item.insertText = new vscode.SnippetString(snippet)
			item.sortText = "0" + key
			completions.push(item)
		}

		for (let key in attributes) {
			let attribute = attributes[key]
			if ((attribute.parents || []).indexOf(parentBlock) == -1) {
				continue
			}
			let item = new vscode.CompletionItem(key + " = …")
			item.detail = "Attribute"
			item.kind = vscode.CompletionItemKind.Property
			item.sortText = "1" + key
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

		if (!attributeRegex.test(linePrefix)) {
			return null
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
			item.sortText = "0" + keyword
			completions.push(item)
		})

		variables.forEach((keyword) => {
			let item = new vscode.CompletionItem(keyword)
			item.detail = "Variable"
			item.kind = vscode.CompletionItemKind.Variable
			item.insertText = prefix + keyword
			item.sortText = "2" + keyword
			completions.push(item)
		})

		let item = new vscode.CompletionItem('"…"')
		item.detail = "String"
		item.kind = vscode.CompletionItemKind.Value
		item.insertText = new vscode.SnippetString(prefix + '"${1}"$0')
		item.sortText = "1"
		completions.push(item)

		return completions

	}
})

Object.defineProperty(exports, "__esModule", { value: true })
exports.providers = [provider1, provider2]
