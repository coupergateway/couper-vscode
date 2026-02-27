const vscode = require('vscode')
const { CHECKS, __private } = require('../src/checks')
const schema = require('../src/schema')

describe('Endpoint path checks', () => {
	const check = CHECKS[1]
	const document = {}

	let testcases = [
		"server {",
		 'friendpoint "" {',
		 '  endpoint"/"{',
	]

	test.each(testcases)("%s", (text) => {
		expect(check(document, {text: text})).toStrictEqual({ok: true})
	})

	testcases = [
		['\tendpoint "path" {', 'Endpoint path must start with a "/".'],
		['\tendpoint""{', 'Endpoint path must start with a "/".'],
		[' endpoint "/a/.."{', 'Endpoint path must not contain "." or ".." segments.' ],
		[' endpoint "/a/./b"{', 'Endpoint path must not contain "." or ".." segments.' ],
	]

	test.each(testcases)("%s\r\t\t\t\t\t\t → %s", (text, error) => {
		expect(check(document, {text: text})).toStrictEqual({
			ok: false,
			message: error,
			severity: vscode.DiagnosticSeverity.Error
		})
	})
})

describe('Block label checks', () => {
	const checkBlockLabels = __private.checkBlockLabels

	// labelOptional: true — label is allowed but not required
	describe('labelOptional blocks', () => {
		test.each([
			["api", ""],
			["api", ' "my-api" '],
			["server", ""],
			["server", ' "my-server" '],
			["proxy", ""],
			["proxy", ' "my_proxy" '],
		])('%s with labels=%j → ok', (name, labels) => {
			expect(checkBlockLabels(name, labels)).toStrictEqual({ok: true})
		})
	})

	// labelled: true — label is required
	describe('labelled blocks', () => {
		test.each([
			["basic_auth", ' "my-auth" '],
			["jwt", ' "my-jwt" '],
			["endpoint", ' "/foo" '],
		])('%s with labels=%j → ok', (name, labels) => {
			expect(checkBlockLabels(name, labels)).toStrictEqual({ok: true})
		})

		test.each([
			["basic_auth"],
			["jwt"],
			["endpoint"],
		])('%s without label → error', (name) => {
			expect(checkBlockLabels(name, "")).toStrictEqual({
				ok: false,
				message: `Missing label for block "${name}".`,
				severity: undefined
			})
		})
	})

	// neither labelled nor labelOptional — no label allowed
	describe('unlabelled blocks', () => {
		test('beta_introspection without label → ok', () => {
			expect(checkBlockLabels("beta_introspection", "")).toStrictEqual({ok: true})
		})

		test('beta_introspection with label → error', () => {
			expect(checkBlockLabels("beta_introspection", ' "foo" ')).toStrictEqual({
				ok: false,
				message: 'Invalid label for block "beta_introspection".',
				severity: undefined
			})
		})
	})

	// empty label validation for specific blocks
	describe('empty label validation', () => {
		test.each([
			"backend",
			"basic_auth",
			"jwt",
		])('%s with empty label → error', (name) => {
			expect(checkBlockLabels(name, ' "" ')).toStrictEqual({
				ok: false,
				message: "Label must not be empty.",
				severity: undefined
			})
		})
	})

	// label syntax validation for specific blocks
	describe('label syntax validation', () => {
		test.each([
			["backend", ' "my-backend" ', "-"],
			["request", ' "my/request" ', "/"],
			["proxy", ' "my proxy" ', " "],
		])('%s with label %j → invalid character %j', (name, labels, char) => {
			const label = labels.match(/"([^"]*)"/)[1]
			expect(checkBlockLabels(name, labels)).toStrictEqual({
				ok: false,
				message: `Invalid character in label "${label}": ${char}. Label is used as variable name, only 'a-z', 'A-Z', '0-9' and '_' are allowed.`,
				severity: undefined
			})
		})
	})
})

describe('Attribute value checks', () => {
	let testcases = [
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
		expect(__private.checkAttributeValue(name, value)).toStrictEqual({ok: true})
	})

	testcases = [
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
		["token_endpoint_auth_method", '"foo"', 'Invalid value for "token_endpoint_auth_method", must be one of: "client_secret_basic", "client_secret_jwt", "client_secret_post", "private_key_jwt"'],
		["allowed_methods", '"POST"', 'Invalid value for "allowed_methods", tuple required.'],
		["allowed_origins", '42', 'Invalid value for "allowed_origins", type must be one of: "string", "tuple"'],
		["add_request_headers", '"User-Agent: foo"', 'Invalid value for "add_request_headers", object required.'],
		["token_value", "foobar()", 'Invalid function "foobar".']
	]

	test.each(testcases)("%s = %s\r\t\t\t\t\t\t → %s", (name, value, error) => {
		const expected = {ok: false, message: error, severity: undefined}
		expect(__private.checkAttributeValue(name, value)).toStrictEqual(expected)
	})
})
