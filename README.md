# Couper Configuration for Visual Studio Code

![Tests](https://github.com/coupergateway/couper-vscode/actions/workflows/test.yaml/badge.svg)

This extension adds Couper-specific highlighting, autocompletion, diagnostics and more to [Couper's configuration files](https://docs.couper.io/configuration/configuration-file) in Visual Studio Code.

### Features

Select from Couper specific suggestions like blocks, attributes and variables based on your document context.
Jump directly to the necessary label or value spots.

![](images/example.gif)

### Development

Run `npm install` once. The extension is bundled with esbuild into `dist/`:

- `npm run compile` builds the desktop and the web bundle once, `npm run watch` rebuilds them on every change.
- `make run` or the "Run Extension" launch configuration starts a VS Code window with the extension loaded.
- `npm test` runs the Jest tests, `npm run lint` runs ESLint, `npm run package` builds the `.vsix` the way the release does.

#### Web-Extension

The same sources are bundled for the browser into `dist/web`. Use `make run-web` or the "Run Web Extension" launch configuration for local testing. `make host-vscode-dev` builds the bundle, serves the extension on port 5000 and opens a tunnel for vscode.dev. See https://code.visualstudio.com/api/extension-guides/web-extensions#test-your-web-extension-in-on-vscode.dev .

### About Couper

[Couper](https://github.com/coupergateway/couper) is a lightweight API gateway designed to support developers in building and operating API-driven Web projects. Acting as a proxy component it connects clients with (micro) services and adds access control and observability to the project.

### [License](LICENSE)

[MIT](LICENSE)
