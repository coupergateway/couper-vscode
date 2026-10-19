jest.mock("../src/diagnostics", () => ({ collectDiagnostics: jest.fn(() => []) }))
jest.mock("../src/lm/docs", () => ({
	loadIndex: jest.fn(async () => [
		{ section: "Configuration Blocks", title: "JWT", url: "https://docs.couper.io/configuration/block/jwt", description: "The jwt block" },
	]),
}))

const vscode = require("vscode")
const { collectDiagnostics } = require("../src/diagnostics")
const { loadIndex } = require("../src/lm/docs")
const { handler, followupProvider } = require("../src/lm/participant")

const { User, Assistant } = vscode.LanguageModelChatMessageRole
const text = (value) => new vscode.LanguageModelTextPart(value)
const call = (id, name, input) => new vscode.LanguageModelToolCallPart(id, name, input)

function fakeModel(rounds) {
	const requests = []
	return {
		requests,
		async sendRequest(messages, options) {
			requests.push({ messages: [...messages], options })
			const parts = rounds[requests.length - 1] ?? []
			return { stream: (async function* () { yield* parts })() }
		},
	}
}

function fakeStream() {
	const output = { markdown: [], progress: [], anchors: [] }
	return {
		output,
		markdown: (value) => output.markdown.push(value),
		progress: (value) => output.progress.push(value),
		anchor: (location, title) => output.anchors.push(title),
	}
}

function request(overrides) {
	return { prompt: "", command: undefined, references: [], toolInvocationToken: "token", model: fakeModel([]), ...overrides }
}

describe("@couper", () => {
	beforeEach(() => {
		vscode.lm.tools = [
			{ name: "couper_lookup_schema", description: "lookup", inputSchema: { type: "object" }, tags: ["couper"] },
			{ name: "other_tool", description: "other", inputSchema: {}, tags: [] },
		]
		vscode.lm.invokeTool = async () => new vscode.LanguageModelToolResult([text("{}")])
		vscode.window.activeTextEditor = undefined
		collectDiagnostics.mockReset().mockReturnValue([])
	})

	test("sends the instructions, the docs index and the prompt, with the couper tools only", async () => {
		const model = fakeModel([[text("Hello")]])
		const stream = fakeStream()
		const result = await handler(request({ prompt: "what is a backend?", model }), { history: [] }, stream, undefined)

		expect(stream.output.markdown).toStrictEqual(["Hello"])
		expect(result).toStrictEqual({ metadata: { command: "" } })
		const [{ messages, options }] = model.requests
		expect(options.tools.map(tool => tool.name)).toStrictEqual(["couper_lookup_schema"])
		expect(options.toolMode).toBe(vscode.LanguageModelChatToolMode.Auto)
		expect(messages.map(message => message.role)).toStrictEqual([User, User, User])
		expect(messages[0].content[0].value).toContain("couper_lookup_schema")
		expect(messages[1].content[0].value).toContain("- JWT: https://docs.couper.io/configuration/block/jwt")
		expect(messages[2].content[0].value).toBe("what is a backend?")
	})

	test("runs the requested tools and feeds the results back", async () => {
		const model = fakeModel([
			[text("Let me check. "), call("c1", "couper_lookup_schema", { name: "backend" })],
			[text("The backend block …")],
		])
		const calls = []
		vscode.lm.invokeTool = async (name, options) => {
			calls.push({ name, input: options.input, token: options.toolInvocationToken })
			return new vscode.LanguageModelToolResult([text('{"kind":"block"}')])
		}
		const stream = fakeStream()
		await handler(request({ prompt: "backend?", model }), { history: [] }, stream, undefined)

		expect(calls).toStrictEqual([{ name: "couper_lookup_schema", input: { name: "backend" }, token: "token" }])
		expect(stream.output.markdown.join("")).toBe("Let me check. The backend block …")
		expect(stream.output.progress).toStrictEqual(["Running couper_lookup_schema"])

		const second = model.requests[1].messages
		const assistant = second.at(-2)
		const toolResult = second.at(-1)
		expect(assistant.role).toBe(Assistant)
		expect(assistant.content.at(-1)).toBeInstanceOf(vscode.LanguageModelToolCallPart)
		expect(toolResult.role).toBe(User)
		expect(toolResult.content[0]).toBeInstanceOf(vscode.LanguageModelToolResultPart)
		expect(toolResult.content[0].callId).toBe("c1")
		expect(toolResult.content[0].content[0].value).toBe('{"kind":"block"}')
	})

	test("keeps text and tool calls in the order the provider emitted them", async () => {
		const model = fakeModel([[call("c1", "couper_lookup_schema", {}), text(" after the call")], [text("done")]])
		await handler(request({ model }), { history: [] }, fakeStream(), undefined)

		const assistant = model.requests[1].messages.at(-2)
		expect(assistant.content.map(part => part.constructor.name)).toStrictEqual(["LanguageModelToolCallPart", "LanguageModelTextPart"])
	})

	test("reports a failing tool to the model instead of ending the turn", async () => {
		const model = fakeModel([[call("c1", "couper_search_docs", { query: "x" })], [text("Sorry, the docs are offline.")]])
		vscode.lm.invokeTool = async () => { throw new Error("not reachable") }
		const stream = fakeStream()
		await handler(request({ model }), { history: [] }, stream, undefined)

		const toolResult = model.requests[1].messages.at(-1).content[0]
		expect(toolResult.content[0].value).toBe("The tool failed: not reachable")
		expect(stream.output.markdown.join("")).toContain("offline")
	})

	test("stops after too many tool rounds", async () => {
		const rounds = Array.from({ length: 6 }, (_, i) => [call(`c${i}`, "couper_lookup_schema", {})])
		const model = fakeModel(rounds)
		const stream = fakeStream()
		await handler(request({ model }), { history: [] }, stream, undefined)

		expect(model.requests).toHaveLength(5)
		expect(stream.output.markdown.join("")).toContain("stopped after several tool calls")
	})

	test("replays the history of this participant only", async () => {
		const model = fakeModel([[text("ok")]])
		const history = [
			new vscode.ChatRequestTurn("earlier question", "couper.couper"),
			new vscode.ChatResponseTurn([new vscode.ChatResponseMarkdownPart("earlier "), new vscode.ChatResponseMarkdownPart("answer")], "couper.couper"),
			new vscode.ChatRequestTurn("not for us", "other.participant"),
		]
		await handler(request({ prompt: "follow-up", model }), { history }, fakeStream(), undefined)

		const turns = model.requests[0].messages.slice(2).map(message => [message.role, message.content[0].value])
		expect(turns).toStrictEqual([[User, "earlier question"], [Assistant, "earlier answer"], [User, "follow-up"]])
	})

	test("inlines attached files into the prompt", async () => {
		const model = fakeModel([[text("ok")]])
		vscode.workspace.openTextDocument = async (uri) => ({ uri, languageId: "couper", getText: () => "server {\n}" })
		const references = [{ id: "file", name: "couper.hcl", value: vscode.Uri.file("/w/couper.hcl") }]
		await handler(request({ prompt: "is this ok?", references, model }), { history: [] }, fakeStream(), undefined)

		const last = model.requests[0].messages.at(-1).content[0].value
		expect(last).toBe("Reference couper.hcl:\n```hcl\nserver {\n}\n```\n\nis this ok?")
	})

	test("leaves the docs index out when it is not reachable", async () => {
		loadIndex.mockRejectedValueOnce(new Error("offline"))
		const model = fakeModel([[text("ok")]])
		await handler(request({ prompt: "q", model }), { history: [] }, fakeStream(), undefined)
		expect(model.requests[0].messages).toHaveLength(2)
	})

	test("explains a missing model permission", async () => {
		const model = { sendRequest: async () => { throw vscode.LanguageModelError.NoPermissions("denied") } }
		const stream = fakeStream()
		const result = await handler(request({ model }), { history: [] }, stream, undefined)

		expect(stream.output.markdown[0]).toContain("not allowed to use the language model")
		expect(result).toStrictEqual({ errorDetails: { message: "denied" } })
	})

	describe("/validate", () => {
		test("asks for a document when none is open", async () => {
			const stream = fakeStream()
			const result = await handler(request({ command: "validate" }), { history: [] }, stream, undefined)

			expect(stream.output.markdown[0]).toContain("/validate")
			expect(followupProvider.provideFollowups(result)).toStrictEqual([])
		})

		test("lists the problems of the active document with anchors", async () => {
			vscode.window.activeTextEditor = { document: { languageId: "couper", uri: vscode.Uri.file("/w/couper.hcl") } }
			collectDiagnostics.mockReturnValue([
				{ range: { start: { line: 2, character: 0 } }, message: 'Unknown block "foo".', severity: 0 },
				{ range: { start: { line: 5, character: 2 } }, message: "Deprecated.", severity: 1 },
			])
			const stream = fakeStream()
			const result = await handler(request({ command: "validate" }), { history: [] }, stream, undefined)

			const output = stream.output.markdown.join("")
			expect(output).toContain("2 problem(s) in `/w/couper.hcl`")
			expect(output).toContain('- line 3, error: Unknown block "foo".')
			expect(output).toContain("- line 6, warning: Deprecated.")
			expect(stream.output.anchors).toStrictEqual(["line 3", "line 6"])
			expect(result.metadata).toStrictEqual({ command: "validate", problems: 2 })
			expect(followupProvider.provideFollowups(result)).toHaveLength(1)
		})

		test("uses the first attached Couper file and skips images and other languages", async () => {
			vscode.window.activeTextEditor = { document: { languageId: "couper", uri: vscode.Uri.file("/w/active.hcl") } }
			vscode.workspace.openTextDocument = async (uri) => {
				if (uri.path.endsWith(".png")) {
					throw new Error("binary")
				}
				return { uri, languageId: uri.path.endsWith(".hcl") ? "couper" : "markdown" }
			}
			const references = [
				{ id: "image", value: vscode.Uri.file("/w/diagram.png") },
				{ id: "readme", value: vscode.Uri.file("/w/README.md") },
				{ id: "config", value: vscode.Uri.file("/w/other.hcl") },
			]
			const stream = fakeStream()
			await handler(request({ command: "validate", references }), { history: [] }, stream, undefined)

			expect(stream.output.markdown[0]).toBe("No problems found in `/w/other.hcl`.")
		})

		test("anchors lines of remote documents too, but not of untitled ones", async () => {
			collectDiagnostics.mockReturnValue([{ range: { start: { line: 0, character: 0 } }, message: "x", severity: 0 }])
			for (const [scheme, anchors] of [["vscode-vfs", ["line 1"]], ["untitled", []]]) {
				vscode.window.activeTextEditor = { document: { languageId: "couper", uri: new vscode.Uri(scheme, "repo/couper.hcl") } }
				const stream = fakeStream()
				await handler(request({ command: "validate" }), { history: [] }, stream, undefined)
				expect(stream.output.anchors).toStrictEqual(anchors)
			}
		})
	})

	describe("/docs", () => {
		test("lists matching pages as links", async () => {
			const stream = fakeStream()
			await handler(request({ command: "docs", prompt: "jwt" }), { history: [] }, stream, undefined)

			expect(stream.output.markdown[0]).toBe("- [JWT](https://docs.couper.io/configuration/block/jwt) (Configuration Blocks): The jwt block")
		})

		test("reports when the index is not reachable", async () => {
			loadIndex.mockRejectedValueOnce(new Error("offline"))
			const stream = fakeStream()
			await handler(request({ command: "docs", prompt: "jwt" }), { history: [] }, stream, undefined)

			expect(stream.output.markdown[0]).toBe("offline")
		})
	})
})
