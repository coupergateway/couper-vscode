"use strict"

const esbuild = require("esbuild")

const production = process.argv.includes("--production")
const watch = process.argv.includes("--watch")

const common = {
	entryPoints: ["src/extension.js"],
	bundle: true,
	format: "cjs",
	external: ["vscode"],
	minify: production,
	sourcemap: !production,
	sourcesContent: false,
	logLevel: "info",
	// The sources read NODE_ENV to expose test hooks. A web worker has no
	// process, so the check is resolved at build time for both targets.
	define: { "process.env.NODE_ENV": JSON.stringify(production ? "production" : "development") },
}

const targets = [
	{ ...common, platform: "node", outfile: "dist/extension.js" },
	{ ...common, platform: "browser", outfile: "dist/web/extension.js" },
]

async function main() {
	if (watch) {
		const contexts = await Promise.all(targets.map(target => esbuild.context(target)))
		await Promise.all(contexts.map(context => context.watch()))
		return
	}
	await Promise.all(targets.map(target => esbuild.build(target)))
}

main().catch(error => {
	console.error(error)
	process.exit(1)
})
