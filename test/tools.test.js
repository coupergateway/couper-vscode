jest.mock("../src/diagnostics", () => ({ collectDiagnostics: jest.fn(() => []) }))

const vscode = require("vscode")
const { collectDiagnostics } = require("../src/diagnostics")
require("../src/lm/tools")

const tool = (name) => vscode.lm.registeredTools[name]
const resultText = (result) => result.content.map(part => part.value).join("")

describe("couper_lookup_schema tool", () => {
	test("returns the lookup as JSON", () => {
		const result = tool("couper_lookup_schema").invoke({ input: { name: "origin" } })
		expect(JSON.parse(resultText(result)).matches[0].kind).toBe("attribute")
	})

	test("announces the lookup", () => {
		const prepared = tool("couper_lookup_schema").prepareInvocation({ input: { name: "origin" } })
		expect(prepared.invocationMessage).toContain('"origin"')
	})
})

describe("couper_validate_config tool", () => {
	const validate = () => tool("couper_validate_config")
	const workspaceFolder = { uri: vscode.Uri.file("/w"), name: "w", index: 0 }

	beforeEach(() => {
		collectDiagnostics.mockReset().mockReturnValue([])
		vscode.window.activeTextEditor = undefined
		vscode.workspace.textDocuments = []
		vscode.workspace.getWorkspaceFolder = (uri) => uri.path.startsWith("/w/") ? workspaceFolder : undefined
		vscode.workspace.openTextDocument = async (target) => target instanceof vscode.Uri
			? { uri: target, languageId: "couper" }
			: { uri: new vscode.Uri("untitled", "Untitled-1"), languageId: target.language }
	})

	test("checks text as an untitled document", async () => {
		collectDiagnostics.mockReturnValue([{ range: { start: { line: 0, character: 2 } }, message: 'Unknown block "foo".', severity: 0 }])
		const result = await validate().invoke({ input: { text: "  foo {}" } })
		expect(resultText(result)).toBe('1 problem(s) in the configuration:\nline 1, column 3: error: Unknown block "foo".')
	})

	test("checks a workspace file given as uri or as path", async () => {
		for (const uri of ["file:///w/couper.hcl", "/w/couper.hcl"]) {
			const result = await validate().invoke({ input: { uri } })
			expect(resultText(result)).toBe("No problems found in /w/couper.hcl.")
		}
	})

	test("treats a Windows drive letter as a path, not as a scheme", async () => {
		vscode.workspace.getWorkspaceFolder = () => workspaceFolder
		const result = await validate().invoke({ input: { uri: "C:\\work\\couper.hcl" } })
		expect(resultText(result)).toBe("No problems found in C:\\work\\couper.hcl.")
	})

	test("rejects files outside the workspace", async () => {
		await expect(validate().invoke({ input: { uri: "/elsewhere/couper.hcl" } })).rejects.toThrow("outside the workspace")
	})

	test("accepts an open document outside the workspace", async () => {
		vscode.workspace.textDocuments = [{ uri: vscode.Uri.file("/elsewhere/open.hcl") }]
		const result = await validate().invoke({ input: { uri: "/elsewhere/open.hcl" } })
		expect(resultText(result)).toBe("No problems found in /elsewhere/open.hcl.")
	})

	test("falls back to the active Couper editor", async () => {
		vscode.window.activeTextEditor = { document: { uri: vscode.Uri.file("/w/active.hcl"), languageId: "couper" } }
		expect(resultText(await validate().invoke({ input: {} }))).toBe("No problems found in /w/active.hcl.")
	})

	test("ignores an active editor of another language", async () => {
		vscode.window.activeTextEditor = { document: { uri: vscode.Uri.file("/w/readme.md"), languageId: "markdown" } }
		await expect(validate().invoke({ input: {} })).rejects.toThrow("No Couper configuration to check")
	})
})
