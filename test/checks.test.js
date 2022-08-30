const vscode = require('vscode')
const { CHECKS } = require('../src/checks')

test('Endpoint starts with "/" check', () => {
	const check = CHECKS[1]
	const document = {}

	expect(check(document, {text: "server {"})).toStrictEqual({ok: true})
	expect(check(document, {text: 'friendpoint "" {'})).toStrictEqual({ok: true})
	expect(check(document, {text: '  endpoint"/"{'})).toStrictEqual({ok: true})
	expect(check(document, {text: '\tendpoint "path" {'})).toStrictEqual({
		ok: false,
		message: 'Endpoint path should start with a "/".',
		severity: 1
	})
})
