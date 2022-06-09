"use strict"

const vscode = require('vscode')
// https://code.visualstudio.com/api/references/vscode-api#OutputChannel
const console = vscode.window.createOutputChannel("Couper extension")
const log = (...parameters) => {
	parameters.forEach(p => {
		if (typeof p === "string") {
			console.append(p + " ")
		} else {
			console.append(JSON.stringify(p) + " ")
		}
	})
	console.appendLine("")
}

console.show()

exports.info = log
exports.log = log
