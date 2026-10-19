jest.mock("../src/completion", () => ({ providers: [{ module: "completion" }] }))
jest.mock("../src/definition", () => ({ providers: [{ module: "definition" }] }))
jest.mock("../src/formatter", () => ({ providers: [{ module: "formatter" }] }))
jest.mock("../src/tooltips", () => ({ providers: [{ module: "tooltips" }] }))
jest.mock("../src/semantictokens", () => ({ providers: [{ module: "semantictokens" }] }))
jest.mock("../src/diagnostics", () => ({ providers: [{ module: "diagnostics" }] }))
jest.mock("../src/lm/tools", () => ({ providers: [{ module: "lm/tools" }] }))

const { activate } = require("../src/extension")

describe("activate", () => {
	test("registers every provider for disposal", () => {
		const context = { subscriptions: [] }
		activate(context)
		expect(context.subscriptions.map(s => s.module)).toStrictEqual([
			"completion", "definition", "formatter", "tooltips", "semantictokens", "diagnostics", "lm/tools",
		])
	})
})
