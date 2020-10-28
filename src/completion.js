"use strict"

const vscode = require('vscode')
const { attributes, blocks, variables } = require('./schema')

const selector = { scheme: 'file', language: 'hcl' }

const parentBlockRegex = /\b([\w-]+)(?:[ \t]+"[^"]+")?[ \t]*{[^{}]*$/s
const blockRegex = /{[^{}]*}/sg
const attributeRegex = /^\s*[\w-]+\s*=/m
// see http://regex.info/listing.cgi?ed=2&p=281
const filterRegex = /([^"/#]+|"(?:\\.|[^"\\])*")|\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/|(?:\/\/|#)[^\n]*/g

const providers = []

function getParentBlock(document, position) {
	const range = new vscode.Range(document.positionAt(0), position)
	let text = document.getText(range)

	text = text.replace(filterRegex, (match, match1) => {
		if (match1 === undefined) {
			return "" // Comment
		}
		if (match1[0] === '"') {
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


for (const [name, block] of Object.entries(blocks)) {
	const provider = vscode.languages.registerCompletionItemProvider(selector,
		{
			provideCompletionItems(document, position, token, context) {
				const linePrefix = document.lineAt(position).text.substr(0, position.character)
				const parentBlock = getParentBlock(document, position)
				if (!/^\s*([\w-]+)?$/.test(linePrefix) || (block.parents || ['']).indexOf(parentBlock) === -1) {
					return undefined
				}

				const item = new vscode.CompletionItem(`${name} {…}`, vscode.CompletionItemKind.Struct)
				item.detail = 'Block'
				const label = name === 'endpoint' ? '/' : 'label'
				const labelled = block.labelled === undefined ? parentBlock !== 'endpoint' && parentBlock !== 'server' : block.labelled
				const labelValue = labelled ? `"\${1:${label}}" ` : ''
				const snippet = name + ' ' + labelValue + '{\u000a\t$0\u000a}\u000a'
				item.insertText = new vscode.SnippetString(snippet)
				return [item]
			},
		},
		name[0]
	)
	providers.push(provider)
}

for (const [name, attribute] of Object.entries(attributes)) {
	const provider = vscode.languages.registerCompletionItemProvider(selector,
		{
			provideCompletionItems(document, position, token, context) {
				const linePrefix = document.lineAt(position).text.substr(0, position.character)
				const parentBlock = getParentBlock(document, position)
				const writeAttrRegex = /^\s*([\w-]+)?$/
				if (!writeAttrRegex.test(linePrefix) || (attribute.parents || []).indexOf(parentBlock) === -1) {
					return undefined
				}

				const item = new vscode.CompletionItem( `${name} = …`, vscode.CompletionItemKind.Property)
				item.detail = 'Attribute'
				if (attribute.type === 'array') {
					item.insertText = new vscode.SnippetString(`${name} = ["$0"]`)
				} else if (attribute.type === 'block') {
					item.insertText = new vscode.SnippetString(name + ' = {\u000a\t$0\u000a}\u000a')
				} else {
					item.insertText = new vscode.SnippetString(`${name} = "$0"`)
				}
				return [item]
			}
		},
		name[0],
	)
	providers.push(provider)
}

function getScopePosition(document, position) {
	let lineNumber = position.line
	while (lineNumber > 0) {
		const line = document.lineAt(lineNumber).text
		const match = line.match(/^\s?.+{\s?/)
		if (match !== null) {
			return new vscode.Position(lineNumber,  line.length)
		}
		lineNumber--
	}
	return undefined
}

function isValidScope(document, position, regex) {
	const scopePos = getScopePosition(document, position)
	if (scopePos === undefined) {
		return false
	}
	const line = document.lineAt(scopePos).text
	const match = line.match(regex)
	if (match === null && scopePos.line > 0) {
		return isValidScope(document, new vscode.Position(scopePos.line - 1, scopePos.character), regex)
	}
	return match !== null
}

const variableScopeRegex = /^\s+(backend).+{\s?/

variables.forEach((v) => {
	const provider = vscode.languages.registerCompletionItemProvider(selector,
		{
			provideCompletionItems(document, position) {
				const linePrefix = document.lineAt(position).text.substr(0, position.character)
				const validScope = isValidScope(document, position, variableScopeRegex)
				if (!validScope || !attributeRegex.test(linePrefix) || linePrefix.endsWith('.')) {
					return undefined
				}

				// TODO: linePrefix changes as you type, handle already typed parts of 'v'
				const spacePrefix = !linePrefix.endsWith(' ') ? ' ' : ''

				let item = new vscode.CompletionItem(v, vscode.CompletionItemKind.Variable)
				item.detail = "Variable"
				item.insertText = `${spacePrefix}${v}.`
				// register suggest command to trigger variables completion on tab
				item.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };
				return [item]
			},
		},
		v[0], // triggered whenever a variable start character is being typed
	)
	providers.push(provider)
})

const providerVariables = vscode.languages.registerCompletionItemProvider(selector,
	{
		provideCompletionItems(document, position) {
			const validScope = isValidScope(document, position, variableScopeRegex)
			if (!validScope) {
				return undefined
			}

			const linePrefix = document.lineAt(position).text.substr(0, position.character)
			if (!attributeRegex.test(linePrefix)) {
				return undefined
			}

			const variableAttributes = {
				req: ['id', 'method', 'path', 'query', 'post', 'url', 'json_body'],
				bereq: ['method', 'path', 'query', 'post', 'url'],
				beresp: ['status', 'json_body'],
			}

			let completions = []

			let isVariableProperty = false
			let parent, attrValues
			for (const [attr, values] of Object.entries(variableAttributes)) {
				if (linePrefix.endsWith(attr) || linePrefix.endsWith(attr+'.')) {
					isVariableProperty = true
					parent = attr
					attrValues = values
					break
				}
			}

			if (!isVariableProperty) {
				return undefined
			}

			attrValues.forEach((value) => {
				let attr = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value)
				attr.detail = 'Value'
				attr.insertText = value
				attr.commitCharacters = [value[0]]
				completions.push(attr)
			})

			return completions
		}
	},
	'.' // triggered whenever a '.' is being typed
)

providers.push(providerVariables)

exports.providers = providers
