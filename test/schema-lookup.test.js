const { lookup } = require("../src/lm/schema-lookup")

describe("schema lookup", () => {
	test("block: parents, label rule, children and docs", () => {
		const { matches } = lookup({ name: "backend", kind: "block" })
		expect(matches).toHaveLength(1)
		const [block] = matches
		expect(block.kind).toBe("block")
		expect(block.topLevel).toBe(false)
		expect(block.parents).toContain("definitions")
		expect(block.label).toBe("optional")
		expect(block.attributes).toContain("origin")
		expect(block.blocks).toContain("openapi")
		expect(block.docs).toBe("https://docs.couper.io/configuration/block/backend")
		expect(block.examples).toStrictEqual(["https://github.com/coupergateway/couper-examples/tree/master/backend-configuration"])
	})

	test("block: required label with allowed values", () => {
		const [endpoint] = lookup({ name: "endpoint", kind: "block" }).matches
		expect(endpoint.label).toBe("required")
		expect(endpoint.labels).toStrictEqual(["/"])
		expect(endpoint.parents).toStrictEqual(["api", "server"])
	})

	test("block: top-level block without label", () => {
		const [defaults] = lookup({ name: "defaults" }).matches
		expect(defaults.topLevel).toBe(true)
		expect(defaults.parents).toStrictEqual([])
		expect(defaults.label).toBe("none")
	})

	test("block: labels per parent are passed through", () => {
		const [handler] = lookup({ name: "error_handler" }).matches
		expect(handler.labelsForParent.jwt).toContain("jwt_token_expired")
	})

	test("attribute: type, parents and per-parent docs", () => {
		const [origin] = lookup({ name: "origin", kind: "attribute" }).matches
		expect(origin.type).toBe("string")
		expect(origin.parents).toStrictEqual(["backend"])
		expect(origin.docs).toStrictEqual(["https://docs.couper.io/configuration/block/backend#attributes"])
		expect(origin.options).toBeUndefined()
	})

	test("attribute: allowed values and multiple types", () => {
		const [grantType] = lookup({ name: "grant_type" }).matches
		expect(grantType.options).toContain("client_credentials")
		const [origins] = lookup({ name: "allowed_origins" }).matches
		expect(origins.type).toStrictEqual(["string", "tuple"])
	})

	test("function", () => {
		const [fn] = lookup({ name: "base64_encode" }).matches
		expect(fn.kind).toBe("function")
		expect(fn.docs).toBe("https://docs.couper.io/configuration/functions")
	})

	test("variable: properties and child placeholder", () => {
		const [backends] = lookup({ name: "backends", kind: "variable" }).matches
		expect(backends.properties).toContain("health")
		expect(backends.child).toBe("default")
		expect(backends.docs).toBe("https://docs.couper.io/configuration/variables#backends")
	})

	test("a name used by several kinds returns all of them", () => {
		expect(lookup({ name: "request" }).matches.map(m => m.kind)).toStrictEqual(["block", "variable"])
		expect(lookup({ name: "backend" }).matches.map(m => m.kind)).toStrictEqual(["block", "attribute", "variable"])
	})

	test("kind filter narrows the result", () => {
		expect(lookup({ name: "request", kind: "variable" }).matches.map(m => m.kind)).toStrictEqual(["variable"])
	})

	test("unknown name suggests similar names", () => {
		const result = lookup({ name: "back" })
		expect(result.matches).toStrictEqual([])
		expect(result.suggestions).toEqual(expect.arrayContaining([
			{ kind: "block", name: "backend" },
			{ kind: "variable", name: "backends" },
		]))
		expect(result.suggestions[0]).toStrictEqual({ kind: "block", name: "backend" })
		expect(result.suggestions.length).toBeLessThanOrEqual(10)
	})

	test("empty or missing name yields nothing", () => {
		expect(lookup({ name: "  " })).toStrictEqual({ query: "", matches: [], suggestions: [] })
		expect(lookup()).toStrictEqual({ query: "", matches: [], suggestions: [] })
	})

	test("inherited object keys are not treated as schema entries", () => {
		expect(lookup({ name: "constructor" }).matches).toStrictEqual([])
	})
})
