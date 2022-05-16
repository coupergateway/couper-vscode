"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const Completion = require("./completion")
const Definition = require("./definition")
const Formatter = require("./formatter")
const Tooltips = require("./tooltips")
const Diagnostics = require("./diagnostics")

exports.activate = (context) => {
	context.subscriptions.concat(
		Completion.providers,
		Definition.providers,
		Formatter.providers,
		Tooltips.providers,
		Diagnostics.providers
	)

	console.info("Extension loaded: Couper Configuration")
}
