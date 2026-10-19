class SemanticTokensLegend {}

class SemanticTokensBuilder {
	tokens = []

	push(range, type, modifiers) {
		this.tokens.push({range: range, type: type, modifiers: modifiers})
	}

	build(resultId) {
		return this.tokens
	}
}

class Position {
	constructor(line, character) {
		this.line = line
		this.character = character
	}

	toString() {
		return `{${this.line}, ${this.character}}`
	}
}

class Range {
	constructor(start, end) {
		this.start = start
		this.end = end
	}
}

class TextDocument {
	constructor(text) {
		this.text = text
		this.lines = text.split("\n")
		this.lineCount = this.lines.length
	}

	getText(range) {
		if (range === undefined) {
			return this.text
		}
		return this.text.substring(this.offsetAt(range.start), this.offsetAt(range.end))
	}

	positionAt(offset) {
		const text = this.text.substring(0, offset)
		const lines = text.split("\n")
		const lineNumber = lines.length - 1
		const lastLine = lines[lineNumber]
		return new Position(lineNumber, lastLine.length)
	}

	offsetAt(position) {
		const precedingLines = this.lines.slice(0, position.line)
		const lastLine = this.lines[Math.min(position.line, this.lineCount - 1)]
		const newlineCount = precedingLines.length
		const characterCount = Math.min(position.character, lastLine.length)
		return precedingLines.join("").length + newlineCount + characterCount
	}

	lineAt(lineNumber) {
		const text = this.lines[lineNumber]
		const start = new Position(lineNumber, 0)
		const end = new Position(lineNumber, text.length)
		return new TextLine(text, new Range(this.offsetAt(start), this.offsetAt(end)))
	}
}

class TextLine {
	constructor(text, range) {
		this.text = text
		this.range = range
		const index = this.text.search(/\S/)
		this.firstNonWhitespaceCharacterIndex = index == -1 ? text.length : index
	}
}

class TextEdit {
	static replace(range, text) {
		return { range: range, replace: text }
	}
}

const vscode = {
	DiagnosticSeverity: {
		Error:   0,
		Warning: 1,
		Information: 2,
		Hint: 3
	},

	Position: Position,
	Range: Range,
	TextDocument: TextDocument,
	TextLine: TextLine,
	TextEdit: TextEdit,

	SemanticTokensLegend: SemanticTokensLegend,
	SemanticTokensBuilder: SemanticTokensBuilder,

	languages: {
		registerDocumentSemanticTokensProvider: (selector, provider) => {
			return provider
		},
		registerDocumentFormattingEditProvider: (selector, provider) => {
			return provider
		},
	}
}

module.exports = vscode

// --- Chat and language model API -------------------------------------------

class Uri {
	constructor(scheme, path) {
		this.scheme = scheme
		this.path = path
		this.fsPath = path
	}

	static file(path) {
		return new Uri("file", path)
	}

	static parse(value) {
		const match = /^([a-z][a-z0-9+.-]*):\/\/(.*)$/i.exec(value)
		return match ? new Uri(match[1], match[2]) : new Uri("file", value)
	}

	static joinPath(base, ...paths) {
		return new Uri(base.scheme, [base.path, ...paths].join("/"))
	}

	toString() {
		return `${this.scheme}://${this.path}`
	}
}

class Location {
	constructor(uri, range) {
		this.uri = uri
		this.range = range
	}
}

class MarkdownString {
	constructor(value = "") {
		this.value = value
	}
}

class LanguageModelTextPart {
	constructor(value) {
		this.value = value
	}
}

class LanguageModelToolCallPart {
	constructor(callId, name, input) {
		this.callId = callId
		this.name = name
		this.input = input
	}
}

class LanguageModelToolResultPart {
	constructor(callId, content) {
		this.callId = callId
		this.content = content
	}
}

class LanguageModelToolResult {
	constructor(content) {
		this.content = content
	}
}

const LanguageModelChatMessageRole = { User: 1, Assistant: 2 }

class LanguageModelChatMessage {
	constructor(role, content, name) {
		this.role = role
		this.content = typeof content === "string" ? [new LanguageModelTextPart(content)] : content
		this.name = name
	}

	static User(content, name) {
		return new LanguageModelChatMessage(LanguageModelChatMessageRole.User, content, name)
	}

	static Assistant(content, name) {
		return new LanguageModelChatMessage(LanguageModelChatMessageRole.Assistant, content, name)
	}
}

const LanguageModelChatToolMode = { Auto: 1, Required: 2 }

class LanguageModelError extends Error {
	constructor(message, code = "Unknown") {
		super(message)
		this.code = code
	}

	static NoPermissions(message) {
		return new LanguageModelError(message, "NoPermissions")
	}

	static Blocked(message) {
		return new LanguageModelError(message, "Blocked")
	}

	static NotFound(message) {
		return new LanguageModelError(message, "NotFound")
	}
}

class ChatRequestTurn {
	constructor(prompt, participant, command) {
		this.prompt = prompt
		this.participant = participant
		this.command = command
		this.references = []
	}
}

class ChatResponseMarkdownPart {
	constructor(value) {
		this.value = value instanceof MarkdownString ? value : new MarkdownString(value)
	}
}

class ChatResponseTurn {
	constructor(response, participant, command) {
		this.response = response
		this.participant = participant
		this.command = command
		this.result = {}
	}
}

Object.assign(vscode, {
	Uri, Location, MarkdownString,
	LanguageModelTextPart, LanguageModelToolCallPart, LanguageModelToolResultPart, LanguageModelToolResult,
	LanguageModelChatMessage, LanguageModelChatMessageRole, LanguageModelChatToolMode, LanguageModelError,
	ChatRequestTurn, ChatResponseTurn, ChatResponseMarkdownPart,

	lm: {
		tools: [],
		registeredTools: {},
		registerTool(name, tool) {
			this.registeredTools[name] = tool
			return { dispose() {} }
		},
		invokeTool: async () => new LanguageModelToolResult([]),
	},

	chat: {
		createChatParticipant: (id, requestHandler) => ({ id, requestHandler, dispose() {} }),
	},

	extensions: {
		getExtension: () => ({ extensionUri: Uri.file("/extension") }),
	},

	workspace: {
		openTextDocument: async () => undefined,
		getWorkspaceFolder: () => undefined,
		textDocuments: [],
	},

	window: {
		activeTextEditor: undefined,
	},
})

vscode.languages.match = (selector, document) => document?.languageId === selector.language ? 10 : 0
