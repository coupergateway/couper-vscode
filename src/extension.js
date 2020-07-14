"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const Completion = require("./completion.js")

exports.activate = (context) => {
	context.subscriptions.concat(Completion.providers)
	console.info("Extension loaded: Couper Configuration")
}
