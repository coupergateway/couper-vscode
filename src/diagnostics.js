"use strict"

const vscode = require('vscode')
const { CHECKS } = require('./checks')

const selector = { language: 'couper' }

const providers = []

const diagnostics = vscode.languages.createDiagnosticCollection(selector.language)

function getError(document, lineNo) {
	const textLine = document.lineAt(lineNo)
	for (const check of CHECKS) {
		const result = check(document, textLine)
		if (!result.ok) {
			const range = textLine.range.with(new vscode.Position(lineNo, textLine.firstNonWhitespaceCharacterIndex))
			return new vscode.Diagnostic(range, result.message, result.severity)
		}
	}

	return null
}

function refreshDiagnostics(document, diagnostics) {
	const errors = []

	for (let lineNo = 0; lineNo < document.lineCount; lineNo++) {
		const error = getError(document, lineNo)
		if (error) {
			errors.push(error)
		}
	}

	diagnostics.set(document.uri, errors)
}

if (vscode.window.activeTextEditor) {
	refreshDiagnostics(vscode.window.activeTextEditor.document, diagnostics)
}

providers.push(diagnostics)

providers.push(vscode.window.onDidChangeActiveTextEditor(editor => {
	if (editor) {
		refreshDiagnostics(editor.document, diagnostics)
	}
}))

providers.push(vscode.workspace.onDidChangeTextDocument(event => {
	refreshDiagnostics(event.document, diagnostics)
}))

providers.push(vscode.workspace.onDidCloseTextDocument(document => {
	diagnostics.delete(document.uri)
}))

exports.providers = providers
