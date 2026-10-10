const fs = require("fs")
const path = require("path")
const { loadIndex, readPage, resetIndexCache, INDEX_TTL } = require("../src/lm/docs")

const fixture = (name) => fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8")

function fakeFetch(bodies) {
	const calls = []
	const fetchImpl = async (url) => {
		calls.push(url)
		const body = bodies[url]
		if (body === undefined) {
			return { ok: false, status: 404 }
		}
		if (body instanceof Error) {
			throw body
		}
		return { ok: true, status: 200, text: async () => body }
	}
	return { fetchImpl, calls }
}

const INDEX_URL = "https://docs.couper.io/llms.txt"

describe("documentation index cache", () => {
	beforeEach(resetIndexCache)

	test("fetches once within the TTL", async () => {
		const { fetchImpl, calls } = fakeFetch({ [INDEX_URL]: fixture("llms.txt") })
		let clock = 0
		const now = () => clock
		const first = await loadIndex({ fetchImpl, now })
		clock = INDEX_TTL - 1
		const second = await loadIndex({ fetchImpl, now })
		expect(first).toHaveLength(52)
		expect(second).toBe(first)
		expect(calls).toHaveLength(1)
	})

	test("refreshes after the TTL", async () => {
		const { fetchImpl, calls } = fakeFetch({ [INDEX_URL]: fixture("llms.txt") })
		let clock = 0
		const now = () => clock
		await loadIndex({ fetchImpl, now })
		clock = INDEX_TTL
		await loadIndex({ fetchImpl, now })
		expect(calls).toHaveLength(2)
	})

	test("keeps the stale index when the refresh fails", async () => {
		let clock = 0
		const now = () => clock
		const good = fakeFetch({ [INDEX_URL]: fixture("llms.txt") })
		const entries = await loadIndex({ fetchImpl: good.fetchImpl, now })
		clock = INDEX_TTL
		const bad = fakeFetch({ [INDEX_URL]: new Error("offline") })
		expect(await loadIndex({ fetchImpl: bad.fetchImpl, now })).toBe(entries)
	})

	test("fails with a readable message when nothing is cached", async () => {
		const { fetchImpl } = fakeFetch({ [INDEX_URL]: new Error("offline") })
		await expect(loadIndex({ fetchImpl })).rejects.toThrow("documentation index at https://docs.couper.io/llms.txt is not reachable: offline")
	})
})

describe("documentation page", () => {
	test("reads a docs page as text", async () => {
		const url = "https://docs.couper.io/configuration/block/api"
		const { fetchImpl } = fakeFetch({ [url]: fixture("docs-api.html") })
		const text = await readPage(url, { fetchImpl })
		expect(text.startsWith("# API")).toBe(true)
	})

	test("rejects pages outside the documentation", async () => {
		const { fetchImpl, calls } = fakeFetch({})
		await expect(readPage("https://example.com/x", { fetchImpl })).rejects.toThrow("Only pages below https://docs.couper.io")
		await expect(readPage("not a url", { fetchImpl })).rejects.toThrow("Only pages below")
		expect(calls).toHaveLength(0)
	})

	test("reports HTTP errors", async () => {
		const { fetchImpl } = fakeFetch({})
		await expect(readPage("https://docs.couper.io/missing", { fetchImpl })).rejects.toThrow("answered with status 404")
	})
})
