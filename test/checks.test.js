const vscode = require('vscode')
const { CHECKS, checkAttributeValue } = require('../src/checks')
const schema = require('../src/schema')

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

describe('Valid attribute value checks', () => {
	const testcases = [
		["websockets", "false"],
		["websockets", "true"],
		["websockets", "env.WEBSOCKETS"],
		["websockets", 'contains("foo", "o")'],
		["base_path", '"/api"'],
		["jwks_ttl", '"1h30m"'],
		["jwks_ttl", ' "${env.JWKS_TTL}"'],
		["max_connections", "100"],
		["max_connections", "100 + 50"],
		["token_endpoint_auth_method", '"client_secret_basic"'],
		["token_endpoint_auth_method", '"client_secret_post"'],
		["allowed_methods", '["POST", "PUT"]'],
		["allowed_origins", '"A"'],
		["allowed_origins", '["A", "B"]'],
		["add_request_headers", '{User-Agent = "foo"}'],
	]

	test.each(testcases)("%s = %s", (name, value) => {
		expect(checkAttributeValue(name, value)).toStrictEqual({ok: true})
	})
})

describe('Invalid attribute value checks', () => {
	const testcases = [
		["websockets", "", 'Invalid value for "websockets", boolean required.'],
		["websockets", "  ", 'Invalid value for "websockets", boolean required.'],
		["websockets", "1", 'Invalid value for "websockets", boolean required.'],
		["websockets", "foo", 'Invalid variable "foo".'],
		["websockets", 'to_bool(1)', 'Invalid function "to_bool".'],
		["base_path", "42", 'Invalid value for "base_path", string required.'],
		["base_path", "true", 'Invalid value for "base_path", string required.'],
		["base_path", '{path = "/"}', 'Invalid value for "base_path", string required.'],
		["base_path", '["/"]', 'Invalid value for "base_path", string required.'],
		["jwks_ttl", ' "always trim value!" ', 'Invalid value for "jwks_ttl", duration required.'],
		["jwks_ttl", '"60min"', 'Invalid value for "jwks_ttl", duration required.'],
		["jwks_ttl", '3600', 'Invalid value for "jwks_ttl", duration required.'],
		["max_connections", '"1000"', 'Invalid value for "max_connections", number required.'],
		["token_endpoint_auth_method", '"foo"', 'Invalid value for "token_endpoint_auth_method", must be one of: "client_secret_basic", "client_secret_post"'],
		["allowed_methods", '"POST"', 'Invalid value for "allowed_methods", tuple required.'],
		["allowed_origins", '42', 'Invalid value for "allowed_origins", type must be one of: "string", "tuple"'],
		["add_request_headers", '"User-Agent: foo"', 'Invalid value for "add_request_headers", object required.'],
		//["token_value", "foobar()", "FIXME"]
	]

	test.each(testcases)("%s = %s\r\t\t\t\t\t\t → %s", (name, value, error) => {
		const expected = {ok: false, message: error, severity: undefined}
		expect(checkAttributeValue(name, value)).toStrictEqual(expected)
	})
})
