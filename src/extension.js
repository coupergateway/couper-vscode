"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const Completion = require("./completion")
const Definition = require("./definition")

exports.activate = (context) => {
	context.subscriptions.concat(Completion.providers, Definition.providers)
	console.info("Extension loaded: Couper Configuration")
}
