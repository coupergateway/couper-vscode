"use strict"

const vscode = require('vscode')
const { attributes, blocks, functions, variables } = require('./schema')

const selector = { language: 'couper' }

const parentBlockRegex = /\b([\w-]+)(?:[ \t]+"[^"]+")?[ \t]*{[^{}]*$/s
const blockRegex = /{[^{}]*}/sg
const attributeRegex = /^\s*"?\(?([\w-]+)\)?"?\s*=/
const attributeMustRegex = /^\s*"?\(?([\w-]+)\)?"?\s*=$/
// see http://regex.info/listing.cgi?ed=2&p=281
const filterRegex = /([^"/#]+|"(?:\\.|[^"\\])*")|\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/|(?:\/\/|#)[^\n]*/g
const variableRegex = /(.+)\..*\.$/

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
				item.sortText = `0${name}`
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
				item.sortText = `1${name}`
				switch (attribute.type) {
					case 'array': {
						item.label = `${name} = […]`
						item.insertText = new vscode.SnippetString(`${name} = ["$0"]`)
					} break;
					case 'block': {
						item.label = `${name} = {…}`
						item.insertText = new vscode.SnippetString(name + ' = {\u000a\t$0\u000a}\u000a')
					} break;
					case 'boolean': {
						item.label = `${name} = …`
						item.insertText = new vscode.SnippetString(name + ' = $0')
					} break;
					case 'inline-block': {
						item.label = `${name} {…}`
						item.insertText = new vscode.SnippetString(name + ' {\u000a\t$0\u000a}\u000a')
					} break;
					default: item.insertText = new vscode.SnippetString(`${name} = "$0"`)
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

const variableScopeRegex = /^\s+(backend|endpoint|request|response|proxy).+{\s?/

for (const [v] of Object.entries(variables)) {
	const provider = vscode.languages.registerCompletionItemProvider(selector,
		{
			provideCompletionItems(document, position) {
				let linePrefix = document.lineAt(position).text.substr(0, position.character)
				const validScope = isValidScope(document, position, variableScopeRegex)

				let match = linePrefix.match(variableRegex)
				if (match !== null && match.length > 0) {
					linePrefix = match[0]
				}

				if (!validScope || !attributeRegex.test(linePrefix) || linePrefix.endsWith('.')) {
					return undefined
				}

				// TODO: linePrefix changes as you type, handle already typed parts of 'v'
				const spacePrefix = attributeMustRegex.test(linePrefix) ? ' ' : ''

				let reference = ''
				if (variables[v].child !== undefined) {
					reference = '.$1' // first tab stop
				}

				let item = new vscode.CompletionItem(v, vscode.CompletionItemKind.Variable)
				item.detail = "Variable"
				item.insertText = new vscode.SnippetString(`${spacePrefix}${v}${reference}.$0`)
				// register suggest command to trigger variables completion on tab
				item.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' }
				return [item]
			},
		},
		v[0], // triggered whenever a variable start character is being typed
	)
	providers.push(provider)
}

for (const [f, details] of Object.entries(functions)) {
	const provider = vscode.languages.registerCompletionItemProvider(selector,
		{
			provideCompletionItems(document, position) {
				const linePrefix = document.lineAt(position).text.substr(0, position.character)
				const validScope = isValidScope(document, position, variableScopeRegex)
				if (!validScope || !attributeRegex.test(linePrefix) || linePrefix.endsWith('.')) {
					return undefined
				}

				// TODO: linePrefix changes as you type, handle already typed parts of 'v'
				const spacePrefix = attributeMustRegex.test(linePrefix) ? ' ' : ''

				let item = new vscode.CompletionItem(f, vscode.CompletionItemKind.Function)
				item.detail = 'Function'
				item.documentation = details.description
				item.insertText = new vscode.SnippetString(`${spacePrefix}${f}($0)`)
				// register suggest command to trigger variables completion on tab
				item.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };
				return [item]
			},
		},
		f[0], // triggered whenever a variable start character is being typed
	)
	providers.push(provider)
}

['true', 'false'].forEach(label => {
	const provider = vscode.languages.registerCompletionItemProvider(selector,
		{
			provideCompletionItems(document, position, _, context) {
				const linePrefix = document.lineAt(position).text.substr(0, position.character)
				if (!attributeRegex.test(linePrefix)) {
					return undefined
				}

				const match = attributeRegex.exec(linePrefix)
				if (match === null) {
					return undefined
				}

				const attrName = match[1]
				if (attributes[attrName] === undefined) {
					return undefined
				}
				switch (attributes[attrName].type) {
					case 'boolean': {
						return [ vscode.CompletionItem(label, vscode.CompletionItemKind.Constant) ]
					}
				}
				return undefined
			}
		},
		label[0], // triggered whenever a variable start character is being typed
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

			let completions = []

			let isVariableProperty = false
			let parent, props
			for (const [name, properties] of Object.entries(variables)) {
				let n = name
				if (properties.child !== undefined) {
					let match = linePrefix.match(variableRegex)
					if (match !== null && match.length > 0) {
						n = match[0]
					}
				}
				if (linePrefix.endsWith(n) || linePrefix.endsWith(n+'.')) {
					isVariableProperty = true
					parent = n
					props = properties
					break
				}
			}

			if (!isVariableProperty) {
				return undefined
			}

			// TODO: read out scope, proxy, request for reference completion
			if (document.lineAt(position).text.endsWith(parent+'..')) {
				let attr = new vscode.CompletionItem(props.child, vscode.CompletionItemKind.Value)
				attr.detail = 'Reference'
				attr.insertText = new vscode.SnippetString(props.child)
				completions.push(attr)
				return completions
			}

			props.values.forEach((value) => {
				let attr = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value)
				attr.detail = 'Value'
				attr.insertText = new vscode.SnippetString(value)
				completions.push(attr)
			})

			return completions
		}
	},
	'.' // triggered whenever a '.' is being typed
)

providers.push(providerVariables)

exports.providers = providers
