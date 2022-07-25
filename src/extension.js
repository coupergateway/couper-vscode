"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const vscode = require('vscode')
const Completion = require("./completion")
const Definition = require("./definition")
const Formatter = require("./formatter")
const Tooltips = require("./tooltips")
const Diagnostics = require("./diagnostics")
const SemanticTokens = require("./semantictokens")

exports.activate = (context) => {
	globalThis.BASE_URI = vscode.Uri.file(context.extensionPath)

	context.subscriptions.concat(
		Completion.providers,
		Definition.providers,
		Formatter.providers,
		Tooltips.providers,
		SemanticTokens.providers,
		Diagnostics.providers
	)

	console.info("Extension loaded: Couper Configuration")
}
