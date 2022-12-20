const vscode = require('vscode')
const { providers } = require('../src/formatter')

const formattingProvider = providers[0]

describe('Formatter', () => {
	let testcases = [
		['server{\n  }', ['server{', '}']],
		['  server {\nendpoint "/" {\n}\n}', ['server {', '  endpoint "/" {', '  }', '}']],
		['func({\nfoo = 1\n   })', ['func({', '    foo = 1', '})']],
		['{\n  func("lbl", {\nfoo = 1\n   })\n}', ['{', '  func("lbl", {', '      foo = 1', '  })', '}']],
		['{\n  func({\nfoo = 1\n   }\n)\n}', ['{', '  func({', '      foo = 1', '    }', '  )', '}']],
		['{\nfunc(\n"lbl",\n{\nfoo = 1\n}\n)\n}', ['{', '  func(','    "lbl",', '    {', '      foo = 1', '    }', '  )', '}']],
		['func({ foo = 1 },\n  "bar"\n)', ['func({ foo = 1 },', '  "bar"', ')']],
		['jwt_sign(\n  "lbl",\n  {}\n  )', ['jwt_sign(', '  "lbl",', '  {}', ')']],
	]

	test.each(testcases)('%o', (text, expectedEdits) => {
		const document = new vscode.TextDocument(text)
		let options = { insertSpaces: true, tabSize: 2 }
		const edits = formattingProvider.provideDocumentFormattingEdits(document, options)
		const result = []
		for (const edit of edits) {
			result.push(edit.replace)
		}
		expect(result).toStrictEqual(expectedEdits)
	})
})
