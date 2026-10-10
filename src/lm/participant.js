"use strict"

const vscode = require("vscode")
const { collectDiagnostics } = require("../diagnostics")
const { loadIndex } = require("./docs")
const { searchIndex, DOCS_ORIGIN } = require("./docs-index")
const { activeCouperDocument } = require("./tools")
const { name, publisher } = require("../../package.json")

const PARTICIPANT_ID = "couper.couper"
const TOOL_TAG = "couper"
const MAX_TOOL_ROUNDS = 5
const MAX_REFERENCE_LENGTH = 8000

const SEVERITY_NAMES = ["error", "warning", "information", "hint"]
const selector = { language: "couper" }

const INSTRUCTIONS = `You are the Couper assistant inside Visual Studio Code. Couper is an open-source API gateway that is configured with HCL 2 in files such as couper.hcl. Help the user write, understand and fix Couper configuration.

Rules:
- Call couper_lookup_schema before you name a block, attribute, function or variable you are not certain about. Never invent names.
- Call couper_validate_config to check configuration you wrote or the user shared.
- Call couper_search_docs and couper_read_docs_page for behaviour the schema does not describe, and link the documentation page you used.
- Answer in the language of the question. Keep answers short and show configuration in \`\`\`hcl code blocks.`

function formatIndex(entries) {
	const lines = ["Index of the Couper documentation (title: URL):"]
	let section = null
	for (const entry of entries) {
		if (entry.section !== section) {
			section = entry.section
			lines.push(`## ${section}`)
		}
		lines.push(`- ${entry.title}: ${entry.url}`)
	}
	return lines.join("\n")
}

async function referenceText(value) {
	if (value instanceof vscode.Uri) {
		return (await vscode.workspace.openTextDocument(value)).getText()
	}
	if (value instanceof vscode.Location) {
		return (await vscode.workspace.openTextDocument(value.uri)).getText(value.range)
	}
	return typeof value === "string" ? value : null
}

async function describeReferences(references) {
	const parts = []
	for (const reference of references) {
		const text = await referenceText(reference.value)
		if (text) {
			const content = text.length > MAX_REFERENCE_LENGTH ? text.slice(0, MAX_REFERENCE_LENGTH) + "\n[truncated]" : text
			parts.push(`Reference ${reference.name ?? reference.id}:\n\`\`\`hcl\n${content}\n\`\`\``)
		}
	}
	return parts.join("\n\n")
}

// The language model API has no system role, so the instructions and the
// documentation index go in as the first user messages.
async function buildMessages(request, context) {
	const messages = [vscode.LanguageModelChatMessage.User(INSTRUCTIONS)]

	const index = await loadIndex().catch(() => null)
	if (index) {
		messages.push(vscode.LanguageModelChatMessage.User(formatIndex(index)))
	}

	for (const turn of context.history) {
		if (turn.participant !== PARTICIPANT_ID) {
			continue
		}
		if (turn instanceof vscode.ChatRequestTurn) {
			messages.push(vscode.LanguageModelChatMessage.User(turn.prompt))
		} else if (turn instanceof vscode.ChatResponseTurn) {
			const text = turn.response
				.filter(part => part instanceof vscode.ChatResponseMarkdownPart)
				.map(part => part.value.value)
				.join("")
			if (text) {
				messages.push(vscode.LanguageModelChatMessage.Assistant(text))
			}
		}
	}

	const references = await describeReferences(request.references)
	messages.push(vscode.LanguageModelChatMessage.User(references ? `${references}\n\n${request.prompt}` : request.prompt))
	return messages
}

function couperTools() {
	return vscode.lm.tools
		.filter(tool => tool.tags.includes(TOOL_TAG))
		.map(tool => ({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema }))
}

async function invokeTool(request, call, token) {
	try {
		const result = await vscode.lm.invokeTool(call.name, { input: call.input, toolInvocationToken: request.toolInvocationToken }, token)
		return new vscode.LanguageModelToolResultPart(call.callId, result.content)
	} catch (error) {
		// The model can recover from a failed tool, the user cannot.
		return new vscode.LanguageModelToolResultPart(call.callId, [new vscode.LanguageModelTextPart(`The tool failed: ${error.message}`)])
	}
}

async function answerWithModel(request, messages, stream, token) {
	const options = {
		tools: couperTools(),
		toolMode: vscode.LanguageModelChatToolMode.Auto,
		justification: "Answer a question about Couper configuration",
	}

	for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
		const response = await request.model.sendRequest(messages, options, token)
		const parts = []
		const toolCalls = []
		for await (const part of response.stream) {
			if (part instanceof vscode.LanguageModelTextPart) {
				stream.markdown(part.value)
				parts.push(part)
			} else if (part instanceof vscode.LanguageModelToolCallPart) {
				parts.push(part)
				toolCalls.push(part)
			}
		}

		if (toolCalls.length === 0) {
			return
		}

		// The next request must see the assistant turn as the provider emitted it.
		messages.push(vscode.LanguageModelChatMessage.Assistant(parts))
		const results = []
		for (const call of toolCalls) {
			stream.progress(`Running ${call.name}`)
			results.push(await invokeTool(request, call, token))
		}
		messages.push(vscode.LanguageModelChatMessage.User(results))
	}

	stream.markdown("\n\nI stopped after several tool calls without a final answer. Please narrow the question.")
}

function modelErrorHint(error) {
	switch (error.code) {
		case "NoPermissions":
			return "The Couper extension is not allowed to use the language model. Allow it when VS Code asks, or check the chat settings, and try again."
		case "NotFound":
			return "No language model is available. Pick a model in the chat input, or sign in to a chat provider such as GitHub Copilot."
		case "Blocked":
			return "The language model blocked this request."
		default:
			return `The language model request failed: ${error.message}`
	}
}

// The first attached Couper document wins; images and other files are skipped.
async function documentFromRequest(request) {
	for (const reference of request.references) {
		const uri = reference.value instanceof vscode.Uri ? reference.value : reference.value instanceof vscode.Location ? reference.value.uri : null
		if (!uri) {
			continue
		}
		try {
			const document = await vscode.workspace.openTextDocument(uri)
			if (vscode.languages.match(selector, document)) {
				return document
			}
		} catch {
			// not a text document
		}
	}
	return activeCouperDocument()
}

async function validateCommand(request, stream) {
	const document = await documentFromRequest(request)
	if (!document) {
		stream.markdown("Open a Couper configuration file, or attach one with `#file`, and run `/validate` again.")
		return { metadata: { command: "validate", problems: 0 } }
	}

	const subject = document.uri.scheme === "untitled" ? "the configuration" : `\`${document.uri.fsPath}\``
	const diagnostics = collectDiagnostics(document)
	if (diagnostics.length === 0) {
		stream.markdown(`No problems found in ${subject}.`)
		return { metadata: { command: "validate", problems: 0 } }
	}

	stream.markdown(`${diagnostics.length} problem(s) in ${subject}:\n\n`)
	for (const diagnostic of diagnostics) {
		const line = diagnostic.range.start.line + 1
		const severity = SEVERITY_NAMES[diagnostic.severity] ?? "error"
		stream.markdown(`- line ${line}, ${severity}: ${diagnostic.message}\n`)
		if (document.uri.scheme !== "untitled") {
			stream.anchor(new vscode.Location(document.uri, diagnostic.range), `line ${line}`)
		}
	}
	return { metadata: { command: "validate", problems: diagnostics.length } }
}

async function docsCommand(request, stream) {
	let entries
	try {
		entries = searchIndex(await loadIndex(), request.prompt)
	} catch (error) {
		stream.markdown(error.message)
		return { metadata: { command: "docs" } }
	}

	if (entries.length === 0) {
		stream.markdown(`No documentation page matches "${request.prompt}". Try other words, or browse ${DOCS_ORIGIN}.`)
	} else {
		stream.markdown(entries.map(entry => `- [${entry.title}](${entry.url}) (${entry.section})` + (entry.description ? `: ${entry.description}` : "")).join("\n"))
	}
	return { metadata: { command: "docs" } }
}

async function handler(request, context, stream, token) {
	if (request.command === "validate") {
		return validateCommand(request, stream)
	}
	if (request.command === "docs") {
		return docsCommand(request, stream)
	}

	try {
		const messages = await buildMessages(request, context)
		await answerWithModel(request, messages, stream, token)
	} catch (error) {
		if (error instanceof vscode.LanguageModelError) {
			stream.markdown(modelErrorHint(error))
			return { errorDetails: { message: error.message } }
		}
		throw error
	}
	return { metadata: { command: "" } }
}

const followupProvider = {
	provideFollowups(result) {
		if (result.metadata?.command === "validate" && result.metadata.problems > 0) {
			return [{ prompt: "Explain the problems the check found and show how to fix them", label: "Explain and fix the problems" }]
		}
		return []
	},
}

const participant = vscode.chat.createChatParticipant(PARTICIPANT_ID, handler)
participant.iconPath = vscode.Uri.joinPath(vscode.extensions.getExtension(publisher + "." + name).extensionUri, "images/couper_icon.png")
participant.followupProvider = followupProvider

exports.providers = [participant]
exports.handler = handler
exports.followupProvider = followupProvider
