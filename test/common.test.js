const vscode = require('vscode')
const { filterCommentsAndStrings } = require('../src/common')

describe('Filter comments and strings', () => {
	const testcases = [
		['server{/* comment */\n  api{',   'server{\n  api{'],
		['server{/* com\nment */\n  api{', 'server{\n  api{'],
		['server{# comment\n  api{',       'server{\n  api{'],
		['server{# comment "\n  api{',     'server{\n  api{'],
		['server{// comment\n  api{',      'server{\n  api{'],
		['server "label" {',               'server "..." {'],
		['server "la/*bel" {',             'server "..." {'],
		['server "la//bel" {',             'server "..." {'],
		['server "la#bel" {',              'server "..." {'],
		['body = "Hello W',                'body = "..."'],
		// FIXME
		['body = "Hello" /* comment',      'body = "..." /* comment'],
		['body = "H${"ell"}o"',            'body = "..."ell"..."'],
	]

	test.each(testcases)("%j\r\t\t\t\t\t\t → %j", (text, expected) => {
		expect(filterCommentsAndStrings(text)).toBe(expected)
	})
})
