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
		const lastLine = this.lines[Math.min(position.line, this.lines.length - 1)]
		const newlineCount = precedingLines.length
		const characterCount = Math.min(position.character, lastLine.length)
		return precedingLines.join("").length + newlineCount + characterCount
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

	SemanticTokensLegend: SemanticTokensLegend,
	SemanticTokensBuilder: SemanticTokensBuilder,

	languages: {
		registerDocumentSemanticTokensProvider: (selector, provider) => {
			return provider
		}
	}
}

module.exports = vscode
