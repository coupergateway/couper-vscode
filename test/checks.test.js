const vscode = require('vscode')
const { CHECKS } = require('../src/checks')

test('Endpoint path checks', () => {
	const check = CHECKS[1]
	const document = {}

	expect(check(document, {text: "server {"})).toStrictEqual({ok: true})
	expect(check(document, {text: 'friendpoint "" {'})).toStrictEqual({ok: true})
	expect(check(document, {text: '  endpoint"/"{'})).toStrictEqual({ok: true})
	expect(check(document, {text: '\tendpoint "path" {'})).toStrictEqual({
		ok: false,
		message: 'Endpoint path must start with a "/".',
		severity: vscode.DiagnosticSeverity.Error
	})
	expect(check(document, {text: '\tendpoint""{'})).toStrictEqual({
		ok: false,
		message: 'Endpoint path must start with a "/".',
		severity: vscode.DiagnosticSeverity.Error
	})
	expect(check(document, {text: ' endpoint "/a/.."{'})).toStrictEqual({
		ok: false,
		message: 'Endpoint path must not contain "." or ".." segments.',
		severity: vscode.DiagnosticSeverity.Error
	})
	expect(check(document, {text: ' endpoint "/a/./b"{'})).toStrictEqual({
		ok: false,
		message: 'Endpoint path must not contain "." or ".." segments.',
		severity: vscode.DiagnosticSeverity.Error
	})
})
