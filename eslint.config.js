"use strict"

const { defineConfig } = require("eslint/config")
const js = require("@eslint/js")
const globals = require("globals")

module.exports = defineConfig([
	{ ignores: ["dist/", "coverage/"] },
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "commonjs",
			globals: { ...globals.node },
		},
		rules: {
			"no-unused-vars": "off",
		},
	},
	{
		files: ["test/**"],
		languageOptions: { globals: { ...globals.jest } },
	},
])
