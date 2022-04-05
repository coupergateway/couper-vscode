"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const Completion = require("./completion")
const Definition = require("./definition")
const Formatter = require("./formatter")
const Tooltips = require("./tooltips")

exports.activate = (context) => {
	context.subscriptions.concat(
		Completion.providers,
		Definition.providers,
		Formatter.providers,
		Tooltips.providers
	)
	console.info("Extension loaded: Couper Configuration")
}
