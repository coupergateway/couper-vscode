const vscode = require('vscode')
const { providers } = require('../src/semantictokens')

const tokensProvider = providers[0]

const modifiers = {
	variable: ["readonly"],
	function:  ["defaultLibrary"]
}

function createRange(offsetStart, offsetEnd) {
	return new vscode.Range(
		new vscode.Position(0, offsetStart),
		new vscode.Position(0, offsetEnd)
	)
}

describe('Semantic tokens', () => {
	let testcases = [
		['body = couper.version', 'variable', [7, 13]],
		['body = env.KEY', 'variable', [7, 10]],
		['x = base64_encode("foo")', 'function', [4, 17]],
	]

	test.each(testcases)("%s\r\t\t\t\t\t\t → %s", (text, type, position) => {
		const document = new vscode.TextDocument(text)
		const tokens = tokensProvider.provideDocumentSemanticTokens(document)

		const range = createRange(position[0], position[1])
		const expectedResult = [{type: type, modifiers: modifiers[type], range: range}]
		expect(tokens).toStrictEqual(expectedResult)
	})

	const text = 'x = request.port + unixtime()'
	test(`${text}\r\t\t\t\t\t\t → variable + function`, () => {
		const document = new vscode.TextDocument(text)
		const tokens = tokensProvider.provideDocumentSemanticTokens(document)
		const expectedResult = [
			{type: 'variable', modifiers: ['readonly'], range: createRange(4, 11)},
			{type: 'function', modifiers: ['defaultLibrary'], range: createRange(19, 27)}
		]
		expect(new Set(tokens)).toStrictEqual(new Set(expectedResult))
	})

	testcases = [
		['x = my_request'],
		['t = unixtime'],
		['f = foo()'],
		['r = foo.request'],
		['body = "env.KEY"'],
		['# backend'],
		['// backend'],
		['/* my backend */']
	]

	test.each(testcases)("%s", (text) => {
		const document = new vscode.TextDocument(text)
		const tokens = tokensProvider.provideDocumentSemanticTokens(document)
		expect(tokens).toStrictEqual([])
	})
})
