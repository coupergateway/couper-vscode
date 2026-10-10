"use strict"

const vscode = require("vscode")
const { lookup } = require("./schema-lookup")
const { collectDiagnostics } = require("../diagnostics")

const selector = { language: "couper" }

const SEVERITY_NAMES = {
	[vscode.DiagnosticSeverity.Error]: "error",
	[vscode.DiagnosticSeverity.Warning]: "warning",
	[vscode.DiagnosticSeverity.Information]: "information",
	[vscode.DiagnosticSeverity.Hint]: "hint",
}

function textResult(text) {
	return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(text)])
}

const lookupSchemaTool = {
	invoke(options) {
		return textResult(JSON.stringify(lookup(options.input), null, 1))
	},

	prepareInvocation(options) {
		return { invocationMessage: `Looking up "${options.input.name}" in the Couper schema` }
	},
}

// A Windows drive letter is a path, so a scheme needs two characters. Only
// files of the workspace or documents that are already open may be read.
function toUri(reference) {
	const uri = /^[a-z][a-z0-9+.-]+:/i.test(reference) ? vscode.Uri.parse(reference) : vscode.Uri.file(reference)
	const isOpen = vscode.workspace.textDocuments.some(document => document.uri.toString() === uri.toString())
	if (!isOpen && !vscode.workspace.getWorkspaceFolder(uri)) {
		throw new Error(`${reference} is outside the workspace. Pass the configuration as text instead.`)
	}
	return uri
}

async function resolveDocument({ text, uri } = {}) {
	if (typeof text === "string") {
		return vscode.workspace.openTextDocument({ content: text, language: selector.language })
	}
	if (uri) {
		return vscode.workspace.openTextDocument(toUri(uri))
	}
	const active = vscode.window.activeTextEditor?.document
	return active && vscode.languages.match(selector, active) ? active : undefined
}

function formatDiagnostics(document, diagnostics) {
	const subject = document.uri.scheme === "untitled" ? "the configuration" : document.uri.fsPath
	if (diagnostics.length === 0) {
		return `No problems found in ${subject}.`
	}
	const lines = diagnostics.map(diagnostic => {
		const { line, character } = diagnostic.range.start
		const severity = SEVERITY_NAMES[diagnostic.severity] ?? "error"
		return `line ${line + 1}, column ${character + 1}: ${severity}: ${diagnostic.message}`
	})
	return `${diagnostics.length} problem(s) in ${subject}:\n${lines.join("\n")}`
}

const validateConfigTool = {
	async invoke(options) {
		const document = await resolveDocument(options.input)
		if (!document) {
			throw new Error("No Couper configuration to check. Pass the configuration as `text`, the `uri` of a .hcl file, or open one in the editor.")
		}
		return textResult(formatDiagnostics(document, collectDiagnostics(document)))
	},

	prepareInvocation() {
		return { invocationMessage: "Checking the Couper configuration" }
	},
}

const providers = [
	vscode.lm.registerTool("couper_lookup_schema", lookupSchemaTool),
	vscode.lm.registerTool("couper_validate_config", validateConfigTool),
]

exports.providers = providers
