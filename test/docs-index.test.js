const fs = require("fs")
const path = require("path")
const { parseIndex, searchIndex, htmlToText } = require("../src/lm/docs-index")

const fixture = (name) => fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8")

describe("documentation index", () => {
	const entries = parseIndex(fixture("llms.txt"))

	test("parses every entry with its section", () => {
		expect(entries).toHaveLength(52)
		expect(new Set(entries.map(e => e.section))).toStrictEqual(new Set(["Getting Started", "Configuration", "Configuration Blocks", "Observation"]))
		expect(entries[0]).toStrictEqual({
			section: "Getting Started",
			title: "Running Couper",
			url: "https://docs.couper.io/getting-started/running-couper",
			description: expect.stringContaining("Couper is available as _docker image_"),
		})
	})

	test("entries without a summary get an empty description", () => {
		const examples = entries.find(e => e.title === "Examples")
		expect(examples.description).toBe("")
	})

	test.each([
		["jwt", "JWT"],
		["error handler", "Error Handler"],
		["cors headers", "CORS"],
		["spa assets", "SPA"],
		["prometheus metrics", "Metrics"],
	])("search %j ranks %j first", (query, title) => {
		expect(searchIndex(entries, query)[0].title).toBe(title)
	})

	test("search limits and filters", () => {
		expect(searchIndex(entries, "block", 3)).toHaveLength(3)
		expect(searchIndex(entries, "")).toStrictEqual([])
		expect(searchIndex(entries, "zzzz")).toStrictEqual([])
	})
})

describe("page text", () => {
	const text = htmlToText(fixture("docs-api.html"), { url: "https://docs.couper.io/configuration/block/api" })

	test("keeps the main content and drops navigation and scripts", () => {
		expect(text.startsWith("# API\n")).toBe(true)
		expect(text).not.toContain("Sidebar")
		expect(text).not.toContain("tracked")
		expect(text).not.toMatch(/<[a-z]/)
	})

	test("converts headings, inline code, links and quotes", () => {
		expect(text).toContain("### Attribute `allowed_methods`")
		expect(text).toContain("[Server Block](https://docs.couper.io/configuration/block/server/)")
		expect(text).toContain("> If an error occurred")
		expect(text).toContain("“all other standard methods”")
	})

	test("renders tables with a separator row", () => {
		expect(text).toContain("| Block name | Context | Label |\n| --- | --- | --- |\n| `api` |")
	})

	test("keeps code blocks with their language and indentation", () => {
		expect(text).toContain("```hcl\nrequired_permission = \"read\"\n# or\n")
	})

	test("truncates long pages", () => {
		const short = htmlToText(fixture("docs-api.html"), { maxLength: 100 })
		expect(short.length).toBeLessThan(120)
		expect(short.endsWith("[truncated]")).toBe(true)
	})
})
