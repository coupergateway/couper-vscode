"use strict"

// Reads the documentation index that docs.couper.io publishes for language
// models (llms.txt) and turns a documentation page into plain text. No VS Code
// API and no network here, so the logic stays testable.

const DOCS_ORIGIN = "https://docs.couper.io"
const INDEX_URL = DOCS_ORIGIN + "/llms.txt"

const ENTRY_REGEX = /^- \[([^\]]+)\]\((https?:\/\/[^)\s]+)\)(?::\s*(.*))?$/

function parseIndex(text) {
	const entries = []
	let section = ""
	for (const rawLine of text.split("\n")) {
		const line = rawLine.trim()
		if (line.startsWith("## ")) {
			section = line.slice(3).trim()
			continue
		}
		const match = ENTRY_REGEX.exec(line)
		if (match) {
			entries.push({ section, title: match[1], url: match[2], description: (match[3] ?? "").trim() })
		}
	}
	return entries
}

function tokenize(text) {
	return text.toLowerCase().split(/[^a-z0-9]+/).filter(token => token.length > 1)
}

// Title hits weigh most, then the URL slug, then the summary.
function score(entry, tokens) {
	const title = entry.title.toLowerCase()
	const slug = entry.url.slice(entry.url.lastIndexOf("/") + 1).toLowerCase()
	const description = entry.description.toLowerCase()
	let points = 0
	for (const token of tokens) {
		if (title.includes(token)) {
			points += 3
		}
		if (slug.includes(token)) {
			points += 2
		}
		if (description.includes(token)) {
			points += 1
		}
	}
	return points
}

function searchIndex(entries, query, limit = 5) {
	const tokens = tokenize(query ?? "")
	if (tokens.length === 0) {
		return []
	}
	return entries
		.map(entry => ({ entry, points: score(entry, tokens) }))
		.filter(({ points }) => points > 0)
		.sort((a, b) => b.points - a.points || a.entry.title.localeCompare(b.entry.title))
		.slice(0, limit)
		.map(({ entry }) => entry)
}

const ENTITIES = {
	amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
	ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’",
	hellip: "…", mdash: "—", ndash: "–",
}

function decodeEntities(text) {
	return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
		if (entity[0] === "#") {
			const hex = entity[1].toLowerCase() === "x"
			const code = parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10)
			return Number.isNaN(code) ? match : String.fromCodePoint(code)
		}
		return ENTITIES[entity.toLowerCase()] ?? match
	})
}

const removeTags = (html) => html.replace(/<[^>]+>/g, "")

function resolveUrl(href, base) {
	try {
		return new URL(href, base).toString()
	} catch {
		return href
	}
}

// Whitespace outside code fences carries no meaning, inside it is indentation.
function tidyOutsideCodeFences(text) {
	return text.split("```").map((part, index) => {
		if (index % 2 === 1) {
			return part
		}
		return part.replace(/[ \t]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n")
	}).join("```")
}

function htmlToText(html, { url = DOCS_ORIGIN, maxLength = 12000 } = {}) {
	const content = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html) ?? /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(html)
	let text = content ? content[1] : html

	text = text.replace(/<(script|style|nav|svg|button)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
	text = text.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (match, inner) => {
		const language = /class="?language-([\w-]+)/i.exec(inner)?.[1] ?? ""
		return `\n\n\`\`\`${language}\n${removeTags(inner).replace(/\n$/, "")}\n\`\`\`\n\n`
	})
	text = text.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (match, inner) => "`" + removeTags(inner) + "`")
	text = text.replace(/<a\b[^>]*href=["']?([^"'\s>]+)["']?[^>]*>([\s\S]*?)<\/a>/gi, (match, href, inner) => `[${removeTags(inner).trim()}](${resolveUrl(href, url)})`)
	text = text.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (match, level, inner) => `\n\n${"#".repeat(Number(level))} ${removeTags(inner).trim()}\n\n`)
	text = text.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (match, tag, inner) => `**${inner}**`)
	text = text.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (match, tag, inner) => `_${inner}_`)
	text = text.replace(/<thead\b[^>]*>([\s\S]*?)<\/thead>/gi, (match, inner) => {
		const columns = (inner.match(/<th\b/gi) ?? []).length
		return inner + "<tr>" + "<td>---</td>".repeat(columns) + "</tr>"
	})
	text = text.replace(/<t[dh]\b[^>]*>/gi, "| ").replace(/<\/t[dh]>/gi, " ").replace(/<\/tr>/gi, "|\n")
	text = text.replace(/<li\b[^>]*>/gi, "\n- ").replace(/<blockquote\b[^>]*>/gi, "\n> ").replace(/<br\s*\/?>/gi, "\n")
	text = text.replace(/<\/(p|div|li|ul|ol|blockquote|table|section|article)>/gi, "\n")
	text = decodeEntities(removeTags(text))
	text = tidyOutsideCodeFences(text).trim()

	if (text.length > maxLength) {
		text = text.slice(0, maxLength) + "\n\n[truncated]"
	}
	return text
}

module.exports = { DOCS_ORIGIN, INDEX_URL, parseIndex, searchIndex, htmlToText }
