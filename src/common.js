"use strict"

const vscode = require('vscode')

const parentBlockRegex = /\b([\w-]+)(?:[ \t]*"[^"]+")*[ \t]*=?[ \t]*{/g
const blockRegex = /{[^{}]*}/g
// see http://regex.info/listing.cgi?ed=2&p=281
const filterRegex = /([^"/#]+|"(?:\\.|[^"\\])*")|\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/|(?:\/\/|#)[^\n]*/g

function getParentBlock(document, position) {
	const context = getContext(document, position)
	const blocks = context.filter(c => {
		return c.type === "block"
	})

	return blocks.length > 0 ? blocks[0].name : ""
}

function isObjectContext(document, position) {
	const context = getContext(document, position)
	return context.length > 0 && context[0].type === "object"
}

// Returns enclosing blocks and objects
function getContext(document, position) {
	const range = new vscode.Range(document.positionAt(0), position)
	let text = document.getText(range)

	text = text.replace(filterRegex, (match, match1) => {
		if (match1 === undefined) {
			return "" // Comment
		}
		if (match1[0] === '"') {
			return '"..."'
		}
		return match1
	})

	while (blockRegex.test(text)) {
		text = text.replace(blockRegex, "")
	}

	let matches = []
	let match
	while (match = parentBlockRegex.exec(text)) {
		matches.push(match)
	}

	return matches.reverse().map(match => {
		return {
			name: match[1],
			type: match[0].match(/=\s*{$/) ? "object" : "block"
		}
	})
}

module.exports = { getParentBlock, isObjectContext, getContext }
