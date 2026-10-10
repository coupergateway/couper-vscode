"use strict"

const { DOCS_ORIGIN, INDEX_URL, parseIndex, htmlToText } = require("./docs-index")

const INDEX_TTL = 24 * 60 * 60 * 1000
const FETCH_TIMEOUT = 8000

let indexCache = null

async function fetchText(url, fetchImpl) {
	const response = await fetchImpl(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) })
	if (!response.ok) {
		throw new Error(`${url} answered with status ${response.status}`)
	}
	return response.text()
}

// A stale index is better than none, so a failed refresh keeps the old one.
async function loadIndex({ fetchImpl = globalThis.fetch, now = Date.now } = {}) {
	if (indexCache && now() - indexCache.fetchedAt < INDEX_TTL) {
		return indexCache.entries
	}
	try {
		const entries = parseIndex(await fetchText(INDEX_URL, fetchImpl))
		indexCache = { fetchedAt: now(), entries }
		return entries
	} catch (error) {
		if (indexCache) {
			return indexCache.entries
		}
		throw new Error(`The Couper documentation index at ${INDEX_URL} is not reachable: ${error.message}`, { cause: error })
	}
}

function isDocsUrl(url) {
	try {
		return new URL(url).origin === DOCS_ORIGIN
	} catch {
		return false
	}
}

async function readPage(url, { fetchImpl = globalThis.fetch } = {}) {
	if (!isDocsUrl(url)) {
		throw new Error(`Only pages below ${DOCS_ORIGIN} can be read, not ${url}.`)
	}
	return htmlToText(await fetchText(url, fetchImpl), { url })
}

function resetIndexCache() {
	indexCache = null
}

module.exports = { loadIndex, readPage, isDocsUrl, resetIndexCache, INDEX_TTL }
