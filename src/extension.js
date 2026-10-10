"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const Completion = require("./completion")
const Definition = require("./definition")
const Formatter = require("./formatter")
const Tooltips = require("./tooltips")
const Diagnostics = require("./diagnostics")
const SemanticTokens = require("./semantictokens")
const LanguageModelTools = require("./lm/tools")

exports.activate = (context) => {
	context.subscriptions.push(
		...Completion.providers,
		...Definition.providers,
		...Formatter.providers,
		...Tooltips.providers,
		...SemanticTokens.providers,
		...Diagnostics.providers,
		...LanguageModelTools.providers
	)

	console.info("Extension loaded: Couper Configuration")
}
