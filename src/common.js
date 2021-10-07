"use strict"

const vscode = require('vscode')

const parentBlockRegex = /\b([\w-]+)(?:[ \t]+"[^"]+")?[ \t]*=?[ \t]*{[^{}]*$/
const blockRegex = /{[^{}]*}/g
// see http://regex.info/listing.cgi?ed=2&p=281
const filterRegex = /([^"/#]+|"(?:\\.|[^"\\])*")|\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/|(?:\/\/|#)[^\n]*/g

function getParentBlock(document, position) {
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

	const matches = text.match(parentBlockRegex)
	return matches ? matches[1] : ""
}

exports.getParentBlock = getParentBlock
