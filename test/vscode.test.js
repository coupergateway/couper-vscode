const { Range, Position, TextDocument, TextLine } = require('vscode')

describe('VSCode API mock', () => {
	describe('Position', () => {
		let testcases = [
			[1, 2],
			[3, 4]
		]

		test.each(testcases)("new Position(…)", (line, character) => {
			const position = new Position(line, character)
			expect(position.line).toBe(line)
			expect(position.character).toBe(character)
		})
	})

	describe('Range', () => {
		let testcases = [
			[new Position(1, 2), new Position(3, 4)],
		]

		test.each(testcases)("new Range(…)", (start, end) => {
			const range = new Range(start, end)
			expect(range.start).toStrictEqual(start)
			expect(range.end).toStrictEqual(end)
		})
	})

	describe('TextLine', () => {
		let testcases = [
			["", 0],
			["   ", 3],
			[" foo", 1],
		]

		test.each(testcases)('new TextLine("%s")', (text, firstNonWhitespace) => {
			const line = new TextLine(text)
			expect(line.firstNonWhitespaceCharacterIndex).toBe(firstNonWhitespace)
		})
	})

	describe('TextDocument', () => {
		const text = 'Line 1\nLine 2\nLine 3'
		const document = new TextDocument(text)

		let testcases = [
			[ 0, new Position(0, 0)],
			[ 1, new Position(0, 1)],
			[ 2, new Position(0, 2)],
			[ 7, new Position(1, 0)],
			[ 8, new Position(1, 1)],
			[14, new Position(2, 0)],
			[15, new Position(2, 1)],
			[99, new Position(2, 6)],
		]

		test.each(testcases)("positionAt(%i)\r\t\t\t → %s", (offset, position) => {
			expect(document.positionAt(offset)).toStrictEqual(position)
		})

		testcases = [
			[new Position(0, 0),   0],
			[new Position(0, 1),   1],
			[new Position(0, 2),   2],
			[new Position(1, 0),   7],
			[new Position(1, 1),   8],
			[new Position(2, 0),  14],
			[new Position(2, 1),  15],
			[new Position(0, 99),  6],
			[new Position(99, 0), 21],
		]

		test.each(testcases)("offsetAt(%s)\r\t\t\t → %i", (position, offset) => {
			expect(document.offsetAt(position)).toBe(offset)
		})

		test("getText(…)", () => {
			const range = new Range(new Position(0, 2), new Position(1, 3))
			expect(document.getText()).toBe(text)
			expect(document.getText(range)).toBe('ne 1\nLin')
		})

		testcases = [
			[ "empty", 1, ""],
			[ "single line", 1, "Line"],
			[ "3 lines", 3, text],
		]

		test.each(testcases)("lineCount %s → %i", (name, lineCount, text) => {
			const document = new TextDocument(text)
			expect(document.lineCount).toBe(lineCount)
		})
	})
})
